document.getElementById('loginForm').onsubmit = async (e) => {
  e.preventDefault();
  const res = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      matricula: document.getElementById('loginMatricula').value,
      password: document.getElementById('loginPassword').value
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    document.getElementById('errorMsg').textContent = data.error || 'Error al iniciar sesión';
    document.getElementById('errorMsg').classList.remove('hidden');
    setTimeout(() => document.getElementById('errorMsg').classList.add('hidden'), 3000);
    return;
  }
  setAuth(data.user, data.token);
  window.location.href = 'home.html';
};

if (isLoggedIn()) {
  window.location.href = 'home.html';
}
