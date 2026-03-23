// Updated sproduct.js with Supabase Integration
// ==============================================

async function renderProductDetails(product) {
    const priceText = typeof formatCurrencyVnd === 'function'
        ? formatCurrencyVnd(product.price)
        : Number(product.price || 0).toLocaleString('vi-VN') + ' ₫';

    const imgContainer = document.querySelector('.single-pro-image');
    if (imgContainer) {
        imgContainer.innerHTML = `
            <img src="${product.image}" width="100%" id="MainImg" alt="">
        `;
    }

    const detailContainer = document.querySelector('.single-pro-details');
    if (detailContainer) {
        detailContainer.innerHTML = `
            <h2>${product.name}</h2>
            <h2>${priceText}</h2>
            <input type="number" min="1" value="1" id="quantity-input">
            <button class="normal" id="add-to-cart-btn">Thêm vào giỏ hàng</button>
            <h4>Chi tiết sản phẩm</h4>
            <span>${product.description || 'Sản phẩm chất lượng cao với thiết kế tinh tế và hiệu suất vượt trội.'}</span>
        `;

        // Gán lại nút Add to Cart sau khi render xong
        detailContainer.querySelector("#add-to-cart-btn").addEventListener("click", async () => {
            const quantity = parseInt(document.getElementById("quantity-input").value) || 1;
            const currentUser = await getCurrentUser();

            if (!currentUser) {
                alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
                window.location.href = 'login.html';
                return;
            }

            const result = await addToCart(currentUser.id, product, quantity);
            alert(result.message);
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        console.error('Product ID not found');
        return;
    }

    // Lấy sản phẩm từ Supabase
    const product = await getProductById(id);

    if (product) {
        renderProductDetails(product);
    } else {
        const container = document.querySelector('.single-pro-details');
        if (container) {
            container.innerHTML = '<p>Sản phẩm không tìm thấy!</p>';
        }
    }
});
