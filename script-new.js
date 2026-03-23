// Updated script.js with Supabase Integration
// =============================================

// Data product (fallback - products will load from database)
let productsData = [];

// Script for navigation bar
const bar = document.getElementById('bar');
const close = document.getElementById('close');
const nav = document.getElementById('navbar');

if (bar) {
    bar.addEventListener('click', () => {
        nav.classList.add('active');
    });
}

if (close) {
    close.addEventListener('click', () => {
        nav.classList.remove('active');
    });
}

function hideNavbar() {
    const header = document.getElementById('header');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > lastScrollY && currentScrollY > 50) {
            header.classList.add('hidden');
        } else {
            header.classList.remove('hidden');
        }
        lastScrollY = currentScrollY;
    });
}

hideNavbar();

// Khởi tạo trang - Load sản phẩm từ Supabase
document.addEventListener('DOMContentLoaded', async () => {
    // Load products from Supabase or use fallback
    const productsLoaded = await loadProducts();
    
    if (!productsLoaded) {
        console.log('Using fallback product data');
    }

    // Check if user is logged in
    const currentUser = await getCurrentUser();
    if (currentUser) {
        console.log('User logged in:', currentUser.email);
    }
});

// Render products
function renderProducts(products) {
    const container = document.querySelector('.pro-container');
    if (!container) {
        return;
    }

    container.innerHTML = '';

    products.forEach(product => {
        const priceText = typeof formatCurrencyVnd === 'function'
            ? formatCurrencyVnd(product.price)
            : Number(product.price || 0).toLocaleString('vi-VN') + ' ₫';

        container.innerHTML += `
            <div class="pro" data-track-link="sproduct.html?id=${product.id}" onclick="window.location.href='sproduct.html?id=${product.id}';">
                <img src="${product.image}" alt="">
                <div class="des">
                    <span>${product.category}</span>
                    <h5>${product.name}</h5>
                    <div class="star">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                    </div>
                    <h4>${priceText}</h4>
                </div>
                <a href="javascript:void(0);" class="add-to-cart-link" data-product-id="${product.id}">
                    <i class="fal fa-shopping-cart cart"></i>
                </a>
            </div>
        `;
    });

    // Gán sự kiện cho các nút "Thêm vào giỏ"
    document.querySelectorAll('.add-to-cart-link').forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const productId = link.dataset.productId;
            const product = productsData.find(p => p.id === productId);

            if (product) {
                const currentUser = await getCurrentUser();
                const result = await addToCart(currentUser?.id || null, product, 1);
                alert(result.message);
            }
        });
    });
}

// Render sản phẩm theo danh mục (cho trang shop)
async function renderProductsByCategory(category) {
    const products = await getProductsByCategory(category);
    const container = document.querySelector('.pro-container-cg');
    
    if (!container) return;

    container.innerHTML = '';

    if (products.length === 0) {
        container.innerHTML = '<p>Không có sản phẩm nào</p>';
        return;
    }

    products.forEach(product => {
        const priceText = typeof formatCurrencyVnd === 'function'
            ? formatCurrencyVnd(product.price)
            : Number(product.price || 0).toLocaleString('vi-VN') + ' ₫';

        container.innerHTML += `
            <div class="pro" data-track-link="sproduct.html?id=${product.id}" onclick="window.location.href='sproduct.html?id=${product.id}';">
                <img src="${product.image}" alt="">
                <div class="des">
                    <h5>${product.name}</h5>
                    <div class="star">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                    </div>
                    <h4>${priceText}</h4>
                </div>
                <a href="javascript:void(0);" class="add-to-cart-link" data-product-id="${product.id}">
                    <i class="fal fa-shopping-cart cart"></i>
                </a>
            </div>
        `;
    });

    // Gán sự kiện cho các nút "Thêm vào giỏ"
    document.querySelectorAll('.add-to-cart-link').forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const productId = link.dataset.productId;
            const product = products.find(p => p.id === productId);

            if (product) {
                const currentUser = await getCurrentUser();
                const result = await addToCart(currentUser?.id || null, product, 1);
                alert(result.message);
            }
        });
    });
}
