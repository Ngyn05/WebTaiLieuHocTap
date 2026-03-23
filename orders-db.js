// Orders Database Functions
// ==========================

function generateOrderNumber() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const timePart = String(now.getTime()).slice(-6);
    const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `ORD-${y}${m}${d}-${timePart}-${randomPart}`;
}

function normalizeOrderAmount(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount <= 0) {
        return 0;
    }
    return Math.round(amount);
}

async function getOrdersByUser(userId) {
    try {
        if (!userId) return [];

        const { data, error } = await supabaseClient
            .from('orders')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading orders:', error.message);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Get orders by user error:', error);
        return [];
    }
}

async function getOrderItems(orderId) {
    try {
        if (!orderId) return [];

        const { data, error } = await supabaseClient
            .from('order_items')
            .select('*')
            .eq('order_id', orderId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error loading order items:', error.message);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Get order items error:', error);
        return [];
    }
}

async function getOrdersWithItems(userId) {
    const orders = await getOrdersByUser(userId);
    if (!orders.length) return [];

    const ids = orders.map((o) => o.id);

    try {
        const { data: itemsData, error } = await supabaseClient
            .from('order_items')
            .select('*')
            .in('order_id', ids)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error loading order items by ids:', error.message);
            return orders.map((order) => ({ ...order, items: [] }));
        }

        const byOrderId = new Map();
        (itemsData || []).forEach((item) => {
            if (!byOrderId.has(item.order_id)) {
                byOrderId.set(item.order_id, []);
            }
            byOrderId.get(item.order_id).push(item);
        });

        return orders.map((order) => ({
            ...order,
            items: byOrderId.get(order.id) || []
        }));
    } catch (error) {
        console.error('Get orders with items error:', error);
        return orders.map((order) => ({ ...order, items: [] }));
    }
}

async function createOrderFromCart(userId, paymentData) {
    try {
        if (!userId) {
            return { success: false, message: 'Vui lòng đăng nhập để tạo đơn hàng.' };
        }

        const { data: authData, error: authError } = await supabaseClient.auth.getUser();
        if (authError || !authData?.user?.id) {
            return { success: false, message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' };
        }

        if (authData.user.id !== userId) {
            return { success: false, message: 'Thông tin phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.' };
        }

        const cartItems = await getCartFromDatabase(userId);
        if (!Array.isArray(cartItems) || cartItems.length === 0) {
            return { success: false, message: 'Giỏ hàng trống, không thể tạo đơn.' };
        }

        const totalAmount = cartItems.reduce((sum, item) => {
            const price = Number(item.product_price || 0);
            const quantity = Number(item.quantity || 0);
            return sum + price * quantity;
        }, 0);

        const orderPayload = {
            order_number: generateOrderNumber(),
            user_id: userId,
            full_name: paymentData.fullName,
            email: paymentData.email,
            address: paymentData.address,
            city: paymentData.city || 'TP. Ho Chi Minh',
            postal_code: paymentData.postalCode || '',
            country: paymentData.country || 'Viet Nam',
            phone: paymentData.phone || '',
            total_amount: normalizeOrderAmount(totalAmount),
            status: 'pending',
            payment_method: paymentData.paymentMethod || 'cod',
            notes: paymentData.notes || ''
        };

        const { data: createdOrder, error: orderError } = await supabaseClient
            .from('orders')
            .insert(orderPayload)
            .select('*')
            .single();

        if (orderError || !createdOrder?.id) {
            console.error('Create order error:', orderError?.message || orderError);
            return {
                success: false,
                message: orderError?.message || orderError?.hint || 'Không tạo được đơn hàng.'
            };
        }

        const itemsPayload = cartItems.map((item) => {
            const price = Number(item.product_price || 0);
            const quantity = Number(item.quantity || 0);
            return {
                order_id: createdOrder.id,
                product_id: item.product_id,
                product_name: item.product_name,
                product_price: price,
                quantity,
                subtotal: price * quantity
            };
        });

        const { error: itemsError } = await supabaseClient
            .from('order_items')
            .insert(itemsPayload);

        if (itemsError) {
            console.error('Create order items error:', itemsError.message);
            await supabaseClient.from('orders').delete().eq('id', createdOrder.id);
            return {
                success: false,
                message: itemsError.message || itemsError.hint || 'Không tạo được chi tiết đơn hàng.'
            };
        }

        const clearResult = await clearCart(userId);

        try {
            if (window.analyticsTracker) {
                window.analyticsTracker.trackPurchase(createdOrder, itemsPayload.map((item) => ({
                    id: item.product_id,
                    name: item.product_name,
                    price: item.product_price,
                    quantity: item.quantity
                })));
            }
        } catch (trackError) {
            console.warn('Purchase analytics tracking failed:', trackError);
        }

        if (!clearResult.success) {
            return {
                success: true,
                order: createdOrder,
                message: 'Đã tạo đơn hàng nhưng chưa xóa được giỏ hàng.'
            };
        }

        return { success: true, order: createdOrder, message: 'Đặt hàng thành công!' };
    } catch (error) {
        console.error('Create order from cart error:', error);
        return { success: false, message: error.message || 'Đã xảy ra lỗi khi tạo đơn hàng.' };
    }
}

window.getOrdersByUser = getOrdersByUser;
window.getOrderItems = getOrderItems;
window.getOrdersWithItems = getOrdersWithItems;
window.createOrderFromCart = createOrderFromCart;
