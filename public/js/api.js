const API = 'http://localhost:4000/api';

function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  return JSON.parse(localStorage.getItem('user') || 'null');
}

function setAuth(user, token) {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', token);
}

function clearAuth() {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  sessionStorage.removeItem('cart');
}

function isLoggedIn() {
  return !!getToken();
}

function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function api(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;
  return fetch(API + endpoint, { ...options, headers });
}

function getCart() {
  return JSON.parse(sessionStorage.getItem('cart') || '[]');
}

function setCart(cart) {
  sessionStorage.setItem('cart', JSON.stringify(cart));
}
