if (!requireAuth()) return;

document.getElementById('logout').onclick = (e) => {
  e.preventDefault();
  clearAuth();
  window.location.href = 'login.html';
};

api('/establishments').then(r => r.json()).then(data => {
  const ul = document.getElementById('establishmentsList');
  if (Array.isArray(data) && data.length > 0) {
    ul.innerHTML = data.map(e => `
      <li><a href="menu.html?id=${e.id}">${e.nombre}</a></li>
    `).join('');
  } else {
    ul.innerHTML = '<li class="empty">No hay establecimientos disponibles.</li>';
  }
}).catch(() => {
  document.getElementById('establishmentsList').innerHTML = '<li class="empty">No hay establecimientos disponibles.</li>';
});
