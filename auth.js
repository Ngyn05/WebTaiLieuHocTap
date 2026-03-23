// Authentication Functions
// =========================

function getClientOrThrow() {
    const client = window.supabaseClient;
    if (!client) {
        throw new Error('Supabase chưa được khởi tạo. Vui lòng kiểm tra supabase-config.js và kết nối mạng.');
    }
    return client;
}

function formatAuthError(error) {
    if (!error) {
        return 'Đã xảy ra lỗi không xác định.';
    }

    const rawMessage = (error.message || String(error)).trim();
    const lower = rawMessage.toLowerCase();

    if (lower.includes('failed to fetch') || lower.includes('fetch')) {
        return 'Không thể kết nối tới Supabase (Failed to fetch). Hãy mở web bằng Live Server/http://localhost và kiểm tra mạng + URL/Anon Key.';
    }

    if (lower.includes('invalid login credentials')) {
        return 'Email hoặc mật khẩu không đúng.';
    }

    if (lower.includes('email not confirmed')) {
        return 'Tài khoản chưa kích hoạt. Hãy tắt Email Confirm trong Supabase Authentication > Providers > Email nếu bạn không muốn xác thực email.';
    }

    if (lower.includes('user already registered')) {
        return 'Email này đã tồn tại trong Supabase Auth. Nếu bạn chưa từng đăng nhập, hãy dùng Quên mật khẩu để đặt lại mật khẩu.';
    }

    return rawMessage || 'Đã xảy ra lỗi không xác định.';
}

function isRlsPolicyError(error) {
    const message = (error?.message || '').toLowerCase();
    return message.includes('row-level security policy');
}

function isDuplicateProfileConstraintError(error) {
    const message = (error?.message || '').toLowerCase();
    return message.includes('duplicate key value') || message.includes('profiles_username_key') || message.includes('profiles_email_key');
}

function sanitizeUsername(value) {
    return (value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 30);
}

function buildFallbackUsername(user) {
    const metadataName = sanitizeUsername(user?.user_metadata?.username || '');
    const emailPart = sanitizeUsername((user?.email || '').split('@')[0] || '');
    const base = metadataName || emailPart || 'user';
    const suffix = (user?.id || '').replace(/-/g, '').slice(0, 8) || Date.now().toString().slice(-8);
    return `${base}_${suffix}`;
}

function trackAuthEvent(eventName, method) {
    try {
        if (!window.analyticsTracker) return;
        if (eventName === 'sign_up') {
            window.analyticsTracker.trackSignUp(method || 'email');
            return;
        }
        if (eventName === 'login') {
            window.analyticsTracker.trackLogin(method || 'email');
        }
    } catch (error) {
        console.warn('Auth analytics tracking failed:', error);
    }
}

async function ensureUserProfile(client, user, preferredUsername) {
    if (!user?.id || !user?.email) {
        return { success: false, message: 'Thông tin người dùng không hợp lệ từ Supabase Auth.' };
    }

    const { data: authState, error: authStateError } = await client.auth.getUser();
    if (authStateError || !authState?.user?.id) {
        return { success: false, message: 'Chưa có session đăng nhập hợp lệ để đồng bộ profile.' };
    }

    const sessionUserId = authState.user.id;
    const targetUserId = user.id;
    if (sessionUserId !== targetUserId) {
        return { success: false, message: 'Session hiện tại không khớp với tài khoản đang thao tác. Vui lòng đăng nhập lại.' };
    }

    const { data: existingProfile, error: selectError } = await client
        .from('profiles')
        .select('id, username, email, role')
        .eq('id', sessionUserId)
        .maybeSingle();

    if (selectError) {
        console.error('Profile select error:', selectError);
        return { success: false, message: 'Không đọc được profile trên Supabase: ' + selectError.message };
    }

    if (existingProfile) {
        return { success: true, profile: existingProfile };
    }

    const candidateUsername = sanitizeUsername(preferredUsername || '') || buildFallbackUsername(user);

    const { data: createdProfile, error: insertError } = await client
        .from('profiles')
        .insert({
            id: sessionUserId,
            username: candidateUsername,
            email: authState.user.email.trim().toLowerCase(),
            role: 'user',
            updated_at: new Date().toISOString()
        })
        .select('id, username, email, role')
        .single();

    if (insertError) {
        console.error('Profile insert error:', insertError);
        if (isDuplicateProfileConstraintError(insertError)) {
            return { success: false, message: 'Lỗi đăng nhập' };
        }
        if (isRlsPolicyError(insertError)) {
            return {
                success: false,
                message: 'RLS đang chặn tạo profile. Hãy chạy SQL fix policy/trigger cho bảng profiles trong Supabase SQL Editor.'
            };
        }
        return { success: false, message: 'Không tạo được profile trên Supabase: ' + insertError.message };
    }

    return { success: true, profile: createdProfile };
}

// Đăng ký người dùng mới
async function registerUser(username, email, password) {
    try {
        const client = getClientOrThrow();
        const cleanEmail = email.trim().toLowerCase();
        const cleanUsername = username.trim();

        if (!cleanUsername || !cleanEmail || !password) {
            return { success: false, message: 'Vui lòng nhập đầy đủ thông tin.' };
        }

        if (password.length < 6) {
            return { success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự.' };
        }

        // Tạo tài khoản Supabase Auth
        const { data: authData, error: authError } = await client.auth.signUp({
            email: cleanEmail,
            password: password,
            options: {
                data: {
                    username: cleanUsername
                }
            }
        });

        if (authError) {
            console.error('Registration error:', authError);

            const authErrorMessage = (authError.message || '').toLowerCase();
            if (authErrorMessage.includes('user already registered')) {
                // Trường hợp tài khoản đã có trong Auth nhưng profile thiếu: thử đăng nhập và tự phục hồi profile.
                const { data: signInData, error: signInError } = await client.auth.signInWithPassword({
                    email: cleanEmail,
                    password: password
                });

                if (!signInError && signInData?.user?.id) {
                    const ensured = await ensureUserProfile(client, signInData.user, cleanUsername);
                    if (!ensured.success) {
                        return { success: false, message: ensured.message };
                    }

                    trackAuthEvent('login', 'email');

                    return {
                        success: true,
                        message: 'Email đã tồn tại trong Supabase Auth. Hệ thống đã đăng nhập và đồng bộ profile thành công.',
                        user: signInData.user,
                        profile: ensured.profile
                    };
                }

                return {
                    success: false,
                    message: 'Email đã tồn tại trong Supabase Auth nhưng mật khẩu không khớp. Hãy dùng chức năng Quên mật khẩu.'
                };
            }

            return { success: false, message: formatAuthError(authError) };
        }

        if (!authData?.user?.id) {
            return { success: false, message: 'Không tạo được tài khoản trên Supabase Auth.' };
        }

        // Với project bật Email Confirm, signUp có thể không trả session => chưa có quyền ghi profiles ngay.
        if (authData.session) {
            const ensured = await ensureUserProfile(client, authData.user, cleanUsername);
            if (!ensured.success) {
                return { success: false, message: ensured.message };
            }
        }

        trackAuthEvent('sign_up', 'email');

        return { 
            success: true, 
            message: authData.session
                ? 'Đăng ký thành công trên Supabase! Bạn có thể đăng nhập ngay.'
                : 'Đăng ký thành công trên Supabase! Vui lòng xác thực email rồi đăng nhập.',
            user: authData.user
        };
    } catch (error) {
        console.error('Register error:', error);
        return { success: false, message: formatAuthError(error) };
    }
}

// Đăng nhập
async function loginUser(email, password) {
    try {
        const client = getClientOrThrow();
        const cleanEmail = email.trim().toLowerCase();

        if (!cleanEmail || !password) {
            return { success: false, message: 'Vui lòng nhập email và mật khẩu.' };
        }

        console.log('Login attempt with email:', cleanEmail);
        const { data, error } = await client.auth.signInWithPassword({
            email: cleanEmail,
            password: password
        });

        if (error) {
            console.error('Login error details:', error);
            return { success: false, message: formatAuthError(error) };
        }

        if (!data?.user?.id) {
            return { success: false, message: 'Đăng nhập thất bại: không lấy được user từ Supabase Auth.' };
        }

        // Đảm bảo profile luôn tồn tại để các trang khác đọc dữ liệu từ Supabase.
        const ensured = await ensureUserProfile(client, data.user, data.user.user_metadata?.username);
        if (!ensured.success) {
            return { success: false, message: ensured.message };
        }

        trackAuthEvent('login', 'email');

        console.log('Login successful for user:', data?.user?.email);
        return { 
            success: true, 
            message: 'Đăng nhập thành công!',
            user: data.user,
            profile: ensured.profile
        };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: formatAuthError(error) };
    }
}

// Đăng xuất
async function logoutUser() {
    try {
        const client = getClientOrThrow();
        const { error } = await client.auth.signOut();

        if (error) {
            console.error('Logout error:', error.message);
            return { success: false, message: formatAuthError(error) };
        }

        return { success: true, message: 'Đăng xuất thành công!' };
    } catch (error) {
        console.error('Logout error:', error);
        return { success: false, message: formatAuthError(error) };
    }
}

// Lấy thông tin user hiện tại
async function getCurrentUser() {
    try {
        const client = getClientOrThrow();
        const { data, error } = await client.auth.getUser();

        if (error || !data.user) {
            return null;
        }

        // Tự phục hồi profile nếu thiếu để tránh đăng nhập được nhưng không dùng được dữ liệu.
        const ensured = await ensureUserProfile(client, data.user, data.user.user_metadata?.username);
        if (!ensured.success) {
            console.warn('Get current user profile check warning:', ensured.message);
        }

        return data.user;
    } catch (error) {
        console.error('Get current user error:', error);
        return null;
    }
}

async function getCurrentProfile() {
    try {
        const client = getClientOrThrow();
        const { data, error } = await client.auth.getUser();

        if (error || !data?.user?.id) {
            return null;
        }

        const ensured = await ensureUserProfile(client, data.user, data.user.user_metadata?.username);
        if (!ensured.success) {
            console.warn('Get current profile warning:', ensured.message);
            return null;
        }

        return ensured.profile || null;
    } catch (error) {
        console.error('Get current profile error:', error);
        return null;
    }
}

async function isCurrentUserAdmin() {
    const profile = await getCurrentProfile();
    return profile?.role === 'admin';
}

// Kiểm tra xem user đã đăng nhập chưa
async function isUserLoggedIn() {
    const user = await getCurrentUser();
    return user !== null;
}

// Đặt lại mật khẩu
async function resetPassword(email) {
    try {
        const client = getClientOrThrow();
        const cleanEmail = email.trim().toLowerCase();
        const { error } = await client.auth.resetPasswordForEmail(cleanEmail);

        if (error) {
            console.error('Reset password error:', error.message);
            return { success: false, message: formatAuthError(error) };
        }

        return { 
            success: true, 
            message: 'Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.'
        };
    } catch (error) {
        console.error('Reset password error:', error);
        return { success: false, message: formatAuthError(error) };
    }
}

window.registerUser = registerUser;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.getCurrentUser = getCurrentUser;
window.getCurrentProfile = getCurrentProfile;
window.isCurrentUserAdmin = isCurrentUserAdmin;
window.isUserLoggedIn = isUserLoggedIn;
window.resetPassword = resetPassword;
