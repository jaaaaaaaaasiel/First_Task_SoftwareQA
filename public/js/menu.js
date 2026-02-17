if (!requireAuth()) return;

const params = new URLSearchParams(window.location.search);
const id = params.get('id');
if (!id) {
  window.location.href = 'home.html';
  throw new Error('no id');
}

document.getElementById('logout').onclick = (e) => {
  e.preventDefault();
  clearAuth();
  window.location.href = 'login.html';
};

const catMap = {
  'Entradas': 'entradas',
  'Platos principales': 'principales',
  'Postres': 'postres'
};

api('/establishments/' + id + '/menu').then(r => r.json()).then(data => {
  const items = Array.isArray(data) ? data : [];
  const sections = { entradas: [], principales: [], postres: [] };
  items.forEach(m => {
    const key = catMap[m.categoria] || 'principales';
    if (sections[key]) sections[key].push(m);
  });
  ['entradas', 'principales', 'postres'].forEach(cat => {
    const ul = document.querySelector('#' + cat + ' ul');
    ul.innerHTML = sections[cat].map(m => `
      <li>
        <div class="menu-item">
          <span class="nombre">${m.nombre}</span>
          <span class="precio">$${((m.precio_centavos || 0) / 100).toFixed(2)}</span>
          <button type="button" data-id="${m.id}" data-nombre="${m.nombre}" data-precio="${m.precio_centavos || 0}">Agregar</button>
        </div>
      </li>
    `).join('') || '<li class="empty">Sin items</li>';
    ul.querySelectorAll('button').forEach(b => {
      b.onclick = () => {
        const cart = getCart();
        const item = {
          menu_item_id: parseInt(b.dataset.id),
          nombre: b.dataset.nombre,
          precio_centavos: parseInt(b.dataset.precio),
          cantidad: 1,
          establishment_id: parseInt(id)
        };
        const found = cart.find(c => c.menu_item_id === item.menu_item_id);
        if (found) found.cantidad++;
        else cart.push(item);
        setCart(cart);
      };
    });
  });
}).catch(() => {
  document.querySelectorAll('.categoria ul').forEach(ul => {
    ul.innerHTML = '<li class="empty">Cargando...</li>';
  });
});
