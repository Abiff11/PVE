import { apiRequest } from './apiClient';

/**
 * Agrupa todas las llamadas relacionadas a infracciones para mantener el código organizado.
 */
export const infraccionesService = {
  /**
   * Obtiene la lista paginada de infracciones con filtros opcionales.
   */
  async list(params = {}, token) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }
      if (typeof value === 'string' && value.trim() === '') {
        return;
      }
      queryParams.append(key, value);
    });
    const query = queryParams.toString();
    const path = query ? `/infracciones?${query}` : '/infracciones';
    return await apiRequest(path, { token });
  },
  /**
   * Recupera un registro específico usando el folio.
   */
  async getByFolio(folio, token) {
    return await apiRequest(`/infracciones/${folio}`, { token });
  },
  /**
   * Envía el formulario de creación de una nueva infracción.
   */
  async create(payload, token) {
    return await apiRequest('/infracciones', {
      method: 'POST',
      body: payload,
      token,
    });
  },
  /**
   * Actualiza campos permitidos de una infracción ya existente.
   */
  async update(folio, payload, token) {
    return await apiRequest(`/infracciones/${folio}`, {
      method: 'PATCH',
      body: payload,
      token,
    });
  },
  /**
   * Elimina una infracción puntual.
   */
  async remove(folio, token) {
    return await apiRequest(`/infracciones/${folio}`, {
      method: 'DELETE',
      token,
    });
  },
  /**
   * Recupera el resumen de KPIs para el dashboard.
   */
  async getKpis(filters = {}, token) {
    const query = new URLSearchParams(filters).toString();
    const path = query
      ? `/infracciones/kpis/resumen?${query}`
      : '/infracciones/kpis/resumen';
    return await apiRequest(path, { token });
  },
};
