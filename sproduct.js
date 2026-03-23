function renderProductDetails(product){
    const priceText = typeof formatCurrencyVnd === 'function'
        ? formatCurrencyVnd(product.price)
        : Number(product.price || 0).toLocaleString('vi-VN') + ' ₫';

    const imgContainer = document.querySelector('.single-pro-image');
    imgContainer.innerHTML = `
        <img src="${product.image}" width="100%" id="MainImg" alt="">
    `;

    const detailContainer = document.querySelector('.single-pro-details');
    detailContainer.innerHTML = `
        <h2>${product.name}</h2>
        <h2>${priceText}</h2>
        <input type="number" min="1" value="1">
        <button class="normal" id="add-to-cart-btn">Thêm vào giỏ hàng</button>
        <h4>Chi Tiết Đề Cương</h4>
        <span>${product.name} là đề cương ôn tập cô đọng theo từng chương, bám sát nội dung môn học và trọng tâm kiểm tra, phù hợp cho tự học và ôn thi học phần.</span>
    `;

    // Gán lại nút Add to Cart bên trong sau khi render xong
    detailContainer.querySelector("#add-to-cart-btn").addEventListener("click", async () => {
        const quantity = parseInt(detailContainer.querySelector("input[type='number']").value, 10) || 1;
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
            window.location.href = 'login.html';
            return;
        }

        const result = await addToCart(currentUser.id, product, quantity);
        alert(result.message);
        if (result && result.success) {
            window.location.href = 'cart.html';
        }
    });
    
        if (window.analyticsTracker) {
            window.analyticsTracker.trackViewItem(product, 'product_detail');
        }
}

window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    const product = productsData.find(p => p.id === id);

    if (product) {
        renderProductDetails(product);
    }
});



