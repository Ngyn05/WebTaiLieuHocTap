// Product Database Functions
// ===========================

let productsData = [];

const MIN_PRODUCT_PRICE_VND = 10000;
const MAX_PRODUCT_PRICE_VND = 50000;

function normalizeVndPrice(value) {
    let price = Number(value);

    if (!Number.isFinite(price) || price <= 0) {
        price = MIN_PRODUCT_PRICE_VND;
    }

    // Tuong thich du lieu cu dang 39, 49, 65 (nghin VND)
    if (price > 0 && price < 1000) {
        price = price * 1000;
    }

    price = Math.round(price);
    if (price < MIN_PRODUCT_PRICE_VND) price = MIN_PRODUCT_PRICE_VND;
    if (price > MAX_PRODUCT_PRICE_VND) price = MAX_PRODUCT_PRICE_VND;

    return price;
}

function formatCurrencyVnd(value) {
    return normalizeVndPrice(value).toLocaleString('vi-VN') + ' ₫';
}

function normalizeProductRecord(product) {
    if (!product) return product;
    return {
        ...product,
        price: normalizeVndPrice(product.price)
    };
}

// Lấy danh sách tất cả sản phẩm từ Supabase
async function loadProducts() {
    try {
        const { data, error } = await supabaseClient
            .from('products')
            .select('*')
            .order('category', { ascending: true });

        if (error) {
            console.error('Error loading products:', error.message);
            return false;
        }

        productsData = (data || []).map(normalizeProductRecord);
        console.log('Products loaded:', productsData.length);
        return true;
    } catch (error) {
        console.error('Load products error:', error);
        return false;
    }
}

// Lấy sản phẩm theo danh mục
async function getProductsByCategory(category) {
    try {
        const { data, error } = await supabaseClient
            .from('products')
            .select('*')
            .eq('category', category)
            .order('name', { ascending: true });

        if (error) {
            console.error('Error loading products by category:', error.message);
            return [];
        }

        return (data || []).map(normalizeProductRecord);
    } catch (error) {
        console.error('Get products by category error:', error);
        return [];
    }
}

// Lấy thông tin chi tiết sản phẩm
async function getProductById(productId) {
    try {
        const { data, error } = await supabaseClient
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        if (error) {
            console.error('Error loading product:', error.message);
            return null;
        }

        return normalizeProductRecord(data);
    } catch (error) {
        console.error('Get product by ID error:', error);
        return null;
    }
}

window.normalizeVndPrice = normalizeVndPrice;
window.formatCurrencyVnd = formatCurrencyVnd;

// Thêm sản phẩm mới (chỉ admin)
async function addProduct(productData) {
    try {
        const { data, error } = await supabaseClient
            .from('products')
            .insert([productData])
            .select();

        if (error) {
            console.error('Error adding product:', error.message);
            return { success: false, message: error.message };
        }

        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Add product error:', error);
        return { success: false, message: error.message };
    }
}

// Cập nhật thông tin sản phẩm (chỉ admin)
async function updateProduct(productId, updateData) {
    try {
        const { data, error } = await supabaseClient
            .from('products')
            .update(updateData)
            .eq('id', productId)
            .select();

        if (error) {
            console.error('Error updating product:', error.message);
            return { success: false, message: error.message };
        }

        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Update product error:', error);
        return { success: false, message: error.message };
    }
}

// Xoá sản phẩm (chỉ admin)
async function deleteProduct(productId) {
    try {
        const { error } = await supabaseClient
            .from('products')
            .delete()
            .eq('id', productId);

        if (error) {
            console.error('Error deleting product:', error.message);
            return { success: false, message: error.message };
        }

        return { success: true, message: 'Sản phẩm đã được xoá' };
    } catch (error) {
        console.error('Delete product error:', error);
        return { success: false, message: error.message };
    }
}

// Tìm kiếm sản phẩm
async function searchProducts(searchTerm) {
    try {
        const { data, error } = await supabaseClient
            .from('products')
            .select('*')
            .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
            .order('name', { ascending: true });

        if (error) {
            console.error('Error searching products:', error.message);
            return [];
        }

        return data;
    } catch (error) {
        console.error('Search products error:', error);
        return [];
    }
}

// Lấy danh sách các danh mục
async function getCategories() {
    try {
        const { data, error } = await supabaseClient
            .from('products')
            .select('category', { count: 'exact' })
            .not('category', 'is', null)
            .distinct();

        if (error) {
            console.error('Error loading categories:', error.message);
            return [];
        }

        return data.map(item => item.category);
    } catch (error) {
        console.error('Get categories error:', error);
        return [];
    }
}
