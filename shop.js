
function renderProducts(products) {
  const container = document.querySelector('.pro-container-cg');
  if (!container) return;

  container.innerHTML = '';

  if (!products || products.length === 0) {
    container.innerHTML = `
      <p style="width:100%;text-align:center;padding:24px 0;color:#666;">Chưa có tài liệu trong danh mục này.</p>
    `;
    return;
  }

  products.forEach((product) => {
    const priceText = typeof formatCurrencyVnd === 'function'
      ? formatCurrencyVnd(product.price)
      : Number(product.price || 0).toLocaleString('vi-VN') + ' ₫';

    container.innerHTML += `
      <div class="pro" data-category="${product.category}" data-product-id="${product.id}" data-track-link="sproduct.html?id=${product.id}">
        <img src="${product.image}" alt="${product.name}">
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
        <a href="#" onclick="event.preventDefault();event.stopPropagation();"><i class="fal fa-shopping-cart cart"></i></a>
      </div>
    `;
  });

  if (window.analyticsTracker) {
    window.analyticsTracker.trackViewItemList(products, 'shop_category_list');
  }

  container.querySelectorAll('.pro').forEach((card, index) => {
    card.addEventListener('click', (event) => {
      const clickedCartIcon = event.target.closest('.cart');
      if (clickedCartIcon) {
        return;
      }

      const productId = card.dataset.productId;
      const product = products.find((item) => String(item.id) === String(productId));
      if (window.analyticsTracker && product) {
        window.analyticsTracker.trackSelectItem(product, 'shop_category_list', index);
      }

      window.location.href = `sproduct.html?id=${productId}`;
    });
  });
}

async function getProductsForCategory(category) {
  if (Array.isArray(fallbackProducts) && fallbackProducts.length > 0) {
    const localProducts = fallbackProducts.filter((p) => p.category === category);
    if (localProducts.length > 0) {
      return localProducts;
    }
  }

  if (Array.isArray(productsData) && productsData.length > 0) {
    const products = productsData.filter((p) => p.category === category);
    if (products.length > 0) {
      return products;
    }
  }

  try {
    if (typeof getProductsByCategory === 'function') {
      const fromDb = await getProductsByCategory(category);
      if (Array.isArray(fromDb) && fromDb.length > 0) {
        return fromDb;
      }
    }
  } catch (error) {
    console.error('Get products by category error:', error);
  }

  return [];
}

async function setActiveCategory(category) {
  const categoryBoxes = document.querySelectorAll('.cg-box');
  categoryBoxes.forEach((box) => {
    box.classList.toggle('active', box.dataset.category === category);
  });

  const products = await getProductsForCategory(category);
  renderProducts(products);
}

window.addEventListener('DOMContentLoaded', async () => {
  const categoryBoxes = document.querySelectorAll('.cg-box');

  const urlParams = new URLSearchParams(window.location.search);
  const requestedCategory = urlParams.get('category') || 'cg1';
  const availableCategories = new Set(Array.from(categoryBoxes).map((box) => box.dataset.category));
  const category = availableCategories.has(requestedCategory) ? requestedCategory : 'cg1';

  await setActiveCategory(category);

  categoryBoxes.forEach((box) => {
    box.addEventListener('click', async () => {
      const nextCategory = box.dataset.category;
      const nextUrl = `shop.html?category=${nextCategory}`;
      window.history.replaceState({}, '', nextUrl);
      await setActiveCategory(nextCategory);
    });
  });
});