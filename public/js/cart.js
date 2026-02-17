if (!requireAuth()) return;

document.getElementById('logout').onclick = (e) => {
  e.preventDefault();
  clearAuth();
  window.location.href = 'login.html';
};

function render() {
  const cart = getCart();
  const container = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  if (cart.length === 0) {
    container.innerHTML = '<p class="empty">Tu carrito está vacío. <a href="home.html">Elige un establecimiento</a></p>';
    totalEl.textContent = '0.00';
    return;
  }
  const total = cart.reduce((s, i) => s + i.precio_centavos * i.cantidad, 0);
  const establishmentId = cart[0].establishment_id;
  container.innerHTML = cart.map((c, i) => `
    <div class="cart-item">
      <span>${c.nombre} x${c.cantidad}</span>
      <span>$${((c.precio_centavos * c.cantidad) / 100).toFixed(2)}</span>
      <button type="button" data-i="${i}">Quitar</button>
    </div>
  `).join('');
  totalEl.textContent = (total / 100).toFixed(2);
  container.querySelectorAll('button').forEach(b => {
    b.onclick = () => {
      const idx = parseInt(b.dataset.i);
      const c = getCart();
      c.splice(idx, 1);
      setCart(c);
      render();
    };
  });
}

render();

document.getElementById('confirmOrder').onclick = async () => {
  const cart = getCart();
  if (cart.length === 0) {
    document.getElementById('errorMsg').textContent = 'Agrega items al carrito primero';
    document.getElementById('errorMsg').classList.remove('hidden');
    setTimeout(() => document.getElementById('errorMsg').classList.add('hidden'), 3000);
    return;
  }
  const payment = document.querySelector('input[name="payment"]:checked').value;
  const res = await api('/orders', {
    method: 'POST',
    body: JSON.stringify({
      establishment_id: cart[0].establishment_id,
      items: cart.map(c => ({ menu_item_id: c.menu_item_id, cantidad: c.cantidad })),
      payment_method: payment,
      pickup_slot: '12:00'
    })
  });
  if (!res.ok) {
    document.getElementById('errorMsg').textContent = 'Error al confirmar pedido';
    document.getElementById('errorMsg').classList.remove('hidden');
    setTimeout(() => document.getElementById('errorMsg').classList.add('hidden'), 3000);
    return;
  }
  setCart([]);
  window.location.href = 'orders.html';
};
