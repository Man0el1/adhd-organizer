/**
 * Utilitário centralizado para requisições HTTP autenticadas no FocusMod
 * Injeta automaticamente o token JWT nos cabeçalhos HTTP (Authorization: Bearer <token>)
 */

import { getUserTimezone } from './date.js';

export function getAuthToken() {
  return localStorage.getItem('token');
}

export function getAuthHeaders(customHeaders = {}) {
  const token = getAuthToken();
  const headers = { ...customHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const tz = getUserTimezone();
  if (tz) {
    headers['x-user-timezone'] = tz;
  }
  return headers;
}

export async function apiFetch(url, options = {}) {
  const headers = getAuthHeaders(options.headers || {});
  
  // Se o body for um objeto/string e não for FormData, garante header de JSON se necessário
  if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Sessão expirada ou token inválido
    localStorage.removeItem('token');
    const path = window.location.pathname;
    if (path !== '/login' && path !== '/register' && path !== '/') {
      window.location.href = '/login';
    }
  }

  return response;
}

export default apiFetch;
