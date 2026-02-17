if (!requireAuth()) return;

document.getElementById('logout').onclick = (e) => {
  e.preventDefault();
  clearAuth();
  window.location.href = 'login.html';
};

function loadWallet() {
  api('/wallet/balance').then(r => r.json()).then(data => {
    document.getElementById('walletAmount').textContent = (data.balance || 0).toFixed(2);
  }).catch(() => {
    document.getElementById('walletAmount').textContent = '0.00';
  });
}

loadWallet();

document.getElementById('addBalance').onclick = async () => {
  const amount = prompt('Cantidad en pesos a agregar (ej: 50)');
  if (!amount || isNaN(amount)) return;
  const centavos = Math.round(parseFloat(amount) * 100);
  const res = await api('/wallet/topup', {
    method: 'POST',
    body: JSON.stringify({ amount_centavos: centavos })
  });
  if (!res.ok) {
    document.getElementById('errorMsg').textContent = 'Error al agregar saldo';
    document.getElementById('errorMsg').classList.remove('hidden');
    setTimeout(() => document.getElementById('errorMsg').classList.add('hidden'), 3000);
  } else {
    loadWallet();
  }
};
