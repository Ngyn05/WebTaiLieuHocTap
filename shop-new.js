// Updated shop.js with Supabase Integration
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get("category") || "cg1";

    // Xử lý URL trang Shop
    const categoryBoxes = document.querySelectorAll(".cg-box");

    categoryBoxes.forEach(box => {
        const boxCategory = box.getAttribute('data-category');

        if (boxCategory === category) {
            categoryBoxes.forEach(b => b.classList.remove("active"));
            box.classList.add("active");
        }
    });

    // Load sản phẩm theo danh mục từ Supabase
    await renderProductsByCategory(category);
});

// Lắng nghe thay đổi danh mục
window.addEventListener('load', () => {
    const categoryBoxes = document.querySelectorAll(".cg-box");
    categoryBoxes.forEach(box => {
        box.addEventListener('click', async () => {
            const category = box.dataset.category;
            await renderProductsByCategory(category);
        });
    });
});
