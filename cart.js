let currentCartItems = [];
let currentCartUserId = null;
let hasTrackedCartView = false;

function renderCartRows(items) {
  const tbody = document.querySelector('#cart tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!items.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Empty Cart</td></tr>';
    return;
  }

  items.forEach((item) => {
    const price = typeof normalizeVndPrice === 'function'
      ? normalizeVndPrice(item.product_price)
      : Number(item.product_price || 0);
    const quantity = Number(item.quantity || 1);
    const subtotal = price * quantity;
    const priceText = typeof formatCurrencyVnd === 'function'
      ? formatCurrencyVnd(price)
      : Number(price || 0).toLocaleString('vi-VN') + ' ₫';
    const subtotalText = typeof formatCurrencyVnd === 'function'
      ? formatCurrencyVnd(subtotal)
      : Number(subtotal || 0).toLocaleString('vi-VN') + ' ₫';

    tbody.innerHTML += `
      <tr data-cart-item-id="${item.id}">
        <td><a href="#" class="remove-btn"><i class="far fa-times-circle"></i></a></td>
        <td><img src="${item.product_image || ''}" alt="${item.product_name || ''}" width="50"></td>
        <td>${item.product_name || ''}</td>
        <td>${priceText}</td>
        <td><input type="number" class="qty-input" min="1" value="${quantity}"></td>
        <td class="subtotal">${subtotalText}</td>
      </tr>
    `;
  });
}

function updateCartTotals(items) {
  const total = items.reduce((sum, item) => {
    const price = typeof normalizeVndPrice === 'function'
      ? normalizeVndPrice(item.product_price)
      : Number(item.product_price || 0);
    const quantity = Number(item.quantity || 0);
    return sum + price * quantity;
  }, 0);

  const subtotalTd = document.querySelector('#subtotal table tr:first-child td:nth-child(2)');
  const totalTd = document.querySelector('#subtotal table tr:last-child td:nth-child(2) strong');

  const totalText = typeof formatCurrencyVnd === 'function'
    ? formatCurrencyVnd(total)
    : Number(total || 0).toLocaleString('vi-VN') + ' ₫';

  if (subtotalTd) subtotalTd.textContent = totalText;
  if (totalTd) totalTd.textContent = totalText;
}

async function reloadCartFromSupabase() {
  if (!currentCartUserId) return;

  currentCartItems = await getCartFromDatabase(currentCartUserId);
  renderCartRows(currentCartItems);
  updateCartTotals(currentCartItems);

  if (!hasTrackedCartView && window.analyticsTracker) {
    window.analyticsTracker.trackViewCart(currentCartItems);
    hasTrackedCartView = true;
  }
}

function bindCartEvents() {
  document.querySelector('#cart tbody')?.addEventListener('click', async (e) => {
    const removeButton = e.target.closest('.remove-btn');
    if (!removeButton) return;

    e.preventDefault();
    const row = removeButton.closest('tr');
    const cartItemId = Number(row?.dataset?.cartItemId);
    if (!cartItemId) return;

    const result = await removeFromCart(null, cartItemId);
    if (!result.success) {
      alert('Lỗi: ' + result.message);
      return;
    }

    await reloadCartFromSupabase();
  });

  document.querySelector('#cart tbody')?.addEventListener('change', async (e) => {
    const qtyInput = e.target.closest('.qty-input');
    if (!qtyInput) return;

    const row = qtyInput.closest('tr');
    const cartItemId = Number(row?.dataset?.cartItemId);
    if (!cartItemId) return;

    let qty = Number(qtyInput.value);
    if (!Number.isFinite(qty) || qty < 1) qty = 1;
    qtyInput.value = String(qty);

    const result = await updateCartQuantity(cartItemId, qty);
    if (!result.success) {
      alert('Lỗi: ' + result.message);
      return;
    }

    await reloadCartFromSupabase();
  });
}

window.addEventListener('DOMContentLoaded', async () => {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    alert('Vui lòng đăng nhập để xem giỏ hàng.');
    window.location.href = 'login.html';
    return;
  }

  currentCartUserId = currentUser.id;
  bindCartEvents();

  const checkoutButton = document.querySelector("#subtotal button.normal[onclick*='payment.html']");
  if (checkoutButton) {
    checkoutButton.removeAttribute('onclick');
    checkoutButton.addEventListener('click', () => {
      if (window.analyticsTracker) {
        window.analyticsTracker.trackBeginCheckout(currentCartItems);
      }
      setTimeout(() => {
        window.location.href = 'payment.html';
      }, 120);
    });
  }

  await reloadCartFromSupabase();
});
