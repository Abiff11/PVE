import { apiRequest } from './apiClient';

/**
 * Llama al endpoint de autenticación y devuelve el access_token emitido por Nest.
 */
export async function signin(credentials) {
  return await apiRequest('/auth/signin', {
    method: 'POST',
    body: credentials,
  });
}

/**
 * Notifica al backend que el usuario cerró sesión (para registrar en bitácora).
 */
export async function logoutRequest(token) {
  if (!token) {
    return;
  }
  return await apiRequest('/auth/logout', {
    method: 'POST',
    token,
  });
}
