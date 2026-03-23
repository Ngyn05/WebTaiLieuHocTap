// Supabase Configuration
// ========================
// Thay thế với credentials thực tế của bạn từ Supabase project

const SUPABASE_URL = 'https://dyuzctiddjsnrjypqlen.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5dXpjdGlkZGpzbnJqeXBxbGVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MzgyNDcsImV4cCI6MjA4OTMxNDI0N30.QDMZbvchHep-vcBir1x4uxreixYqn6-CIeYu6CbpW78';

// Khởi tạo Supabase client
// Kiểm tra xem supabase library đã load chưa
if (typeof supabase === 'undefined') {
    console.error('❌ Lỗi: Supabase library chưa load. Kiểm tra xem CDN script có load không.');
} else {
    const { createClient } = supabase;
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    });

    // Export cho sử dụng trong các file khác
    window.supabaseClient = supabaseClient;
    window.getSupabaseClient = () => window.supabaseClient;

    console.log('✅ Supabase client initialized successfully!');

    if (typeof window.flushBehaviorQueue === 'function') {
        window.flushBehaviorQueue();
    }
}
