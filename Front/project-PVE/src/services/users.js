import { apiRequest } from './apiClient';

/**
 * Agrupa las llamadas al backend relacionadas con usuarios.
 */
export const usersService = {
  /**
   * Recupera todos los usuarios disponibles (solo admin).
   */
  async list(token) {
    return await apiRequest('/users', { token });
  },
  /**
   * Crea un nuevo usuario con los datos proporcionados.
   */
  async create(payload, token) {
    return await apiRequest('/users', {
      method: 'POST',
      body: payload,
      token,
    });
  },
  /**
   * Actualiza el rol del usuario indicado.
   */
  async updateRole(id, role, token) {
    return await apiRequest(`/users/${id}/role`, {
      method: 'PATCH',
      body: { role },
      token,
    });
  },
  /**
   * Elimina al usuario y devuelve la respuesta del backend.
   */
  async remove(id, token) {
    return await apiRequest(`/users/${id}`, {
      method: 'DELETE',
      token,
    });
  },
};
