// Shopping Cart Database Functions
// ==================================

function normalizeProductPrice(value) {
    if (typeof normalizeVndPrice === 'function') {
        return normalizeVndPrice(value);
    }

    let price = Number(value);
    if (!Number.isFinite(price) || price <= 0) {
        return 10000;
    }
    if (price > 0 && price < 1000) {
        price = price * 1000;
    }
    price = Math.round(price);
    if (price < 10000) return 10000;
    if (price > 50000) return 50000;
    return price;
}

function trackCartEvent(type, product, quantity, source) {
    try {
        if (!window.analyticsTracker) return;
        if (type === 'add') {
            window.analyticsTracker.trackAddToCart(product, quantity, source || 'cart-db');
            return;
        }
        if (type === 'remove') {
            window.analyticsTracker.trackRemoveFromCart(product, quantity, source || 'cart-db');
        }
    } catch (error) {
        console.warn('Cart analytics tracking failed:', error);
    }
}

// Thêm sản phẩm vào giỏ hàng (chỉ lưu trên Supabase)
async function addToCart(userId, product, quantity = 1) {
    try {
        if (!userId) {
            return { success: false, message: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.' };
        }

        const qty = Number.isFinite(Number(quantity)) && Number(quantity) > 0 ? Number(quantity) : 1;

        const { data: existingItem, error: existingError } = await supabaseClient
            .from('cart_items')
            .select('id, quantity')
            .eq('user_id', userId)
            .eq('product_id', product.id)
            .maybeSingle();

        if (existingError) {
            console.error('Error checking existing cart item:', existingError.message);
            return { success: false, message: existingError.message };
        }

        if (existingItem) {
            const { error: updateError } = await supabaseClient
                .from('cart_items')
                .update({
                    quantity: existingItem.quantity + qty,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingItem.id);

            if (updateError) {
                console.error('Error updating cart item:', updateError.message);
                return { success: false, message: updateError.message };
            }

            trackCartEvent('add', {
                id: product.id,
                name: product.name,
                category: product.category,
                price: normalizeProductPrice(product.price)
            }, qty, 'add_to_existing_item');
        } else {
            const { error: insertError } = await supabaseClient
                .from('cart_items')
                .insert([
                    {
                        user_id: userId,
                        product_id: product.id,
                        quantity: qty,
                        product_name: product.name,
                        product_price: normalizeProductPrice(product.price),
                        product_image: product.image
                    }
                ]);

            if (insertError) {
                console.error('Error inserting cart item:', insertError.message);
                return { success: false, message: insertError.message };
            }

            trackCartEvent('add', {
                id: product.id,
                name: product.name,
                category: product.category,
                price: normalizeProductPrice(product.price)
            }, qty, 'new_item');
        }

        return { success: true, message: 'Đã thêm vào giỏ hàng!' };
    } catch (error) {
        console.error('Add to cart error:', error);
        return { success: false, message: error.message };
    }
}

// Lấy giỏ hàng từ database
async function getCartFromDatabase(userId) {
    try {
        if (!userId) {
            return [];
        }

        const { data, error } = await supabaseClient
            .from('cart_items')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching cart:', error.message);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Get cart error:', error);
        return [];
    }
}

// Cập nhật số lượng sản phẩm trong giỏ
async function updateCartQuantity(cartItemId, quantity) {
    try {
        const qty = Number(quantity);

        const { data: existingItem, error: existingError } = await supabaseClient
            .from('cart_items')
            .select('id, product_id, product_name, product_price, quantity')
            .eq('id', cartItemId)
            .maybeSingle();

        if (existingError) {
            console.error('Error loading existing cart item:', existingError.message);
            return { success: false, message: existingError.message };
        }

        if (!existingItem) {
            return { success: false, message: 'Không tìm thấy sản phẩm trong giỏ.' };
        }

        if (!Number.isFinite(qty) || qty < 1) {
            return await removeFromCart(null, cartItemId);
        }

        const { error } = await supabaseClient
            .from('cart_items')
            .update({ quantity: qty, updated_at: new Date().toISOString() })
            .eq('id', cartItemId);

        if (error) {
            console.error('Error updating cart quantity:', error.message);
            return { success: false, message: error.message };
        }

        const delta = qty - Number(existingItem.quantity || 0);
        if (delta > 0) {
            trackCartEvent('add', {
                id: existingItem.product_id,
                name: existingItem.product_name,
                price: existingItem.product_price
            }, delta, 'quantity_increase');
        } else if (delta < 0) {
            trackCartEvent('remove', {
                id: existingItem.product_id,
                name: existingItem.product_name,
                price: existingItem.product_price
            }, Math.abs(delta), 'quantity_decrease');
        }

        return { success: true };
    } catch (error) {
        console.error('Update cart quantity error:', error);
        return { success: false, message: error.message };
    }
}

// Xoá sản phẩm khỏi giỏ hàng
async function removeFromCart(productId, cartItemId = null) {
    try {
        let existingItem = null;
        if (cartItemId) {
            const { data, error } = await supabaseClient
                .from('cart_items')
                .select('id, product_id, product_name, product_price, quantity')
                .eq('id', cartItemId)
                .maybeSingle();

            if (!error) {
                existingItem = data;
            }
        }

        let query = supabaseClient.from('cart_items').delete();

        if (cartItemId) {
            query = query.eq('id', cartItemId);
        } else if (productId) {
            query = query.eq('product_id', productId);
        } else {
            return { success: false, message: 'Thiếu thông tin để xoá sản phẩm.' };
        }

        const { error } = await query;
        if (error) {
            console.error('Error removing cart item:', error.message);
            return { success: false, message: error.message };
        }

        if (existingItem) {
            trackCartEvent('remove', {
                id: existingItem.product_id,
                name: existingItem.product_name,
                price: existingItem.product_price
            }, Number(existingItem.quantity || 1), 'remove_button');
        }

        return { success: true };
    } catch (error) {
        console.error('Remove from cart error:', error);
        return { success: false, message: error.message };
    }
}

// Xoá toàn bộ giỏ hàng
async function clearCart(userId = null) {
    try {
        if (!userId) {
            return { success: false, message: 'Không tìm thấy người dùng để xoá giỏ hàng.' };
        }

        const { error } = await supabaseClient
            .from('cart_items')
            .delete()
            .eq('user_id', userId);

        if (error) {
            console.error('Error clearing cart:', error.message);
            return { success: false, message: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Clear cart error:', error);
        return { success: false, message: error.message };
    }
}

// Giữ hàm để tương thích ngược, hiện tại dữ liệu đã ở Supabase nên không cần đồng bộ.
async function syncCartWithDatabase() {
    return { success: true };
}
