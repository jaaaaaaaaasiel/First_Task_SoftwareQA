if (!requireAuth()) return;

document.getElementById('logout').onclick = (e) => {
  e.preventDefault();
  clearAuth();
  window.location.href = 'login.html';
};

api('/orders').then(r => r.json()).then(data => {
  const ul = document.getElementById('ordersList');
  if (Array.isArray(data) && data.length > 0) {
    ul.innerHTML = data.map(o => `
      <li class="order-item">
        <span class="order-id">Pedido #${o.id}</span>
        <span class="order-status">${o.status || 'pending'}</span>
      </li>
    `).join('');
  } else {
    ul.innerHTML = '<li class="empty">Aún no tienes pedidos.</li>';
  }
}).catch(() => {
  document.getElementById('ordersList').innerHTML = '<li class="empty">Aún no tienes pedidos.</li>';
});
