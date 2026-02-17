document.getElementById('registerForm').onsubmit = async (e) => {
  e.preventDefault();
  const res = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      nombre: document.getElementById('regNombre').value,
      email: document.getElementById('regEmail').value,
      matricula: document.getElementById('regMatricula').value,
      password: document.getElementById('regPassword').value
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    document.getElementById('errorMsg').textContent = data.error || 'Error al registrarse';
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
