import { apiRequest } from './apiClient';

export const encierrosService = {
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
    const path = query ? `/encierros?${query}` : '/encierros';
    return await apiRequest(path, { token });
  },
  async getByFolio(folio, token) {
    return await apiRequest(`/encierros/${folio}`, { token });
  },
  async lookupByFolio(folio, token) {
    return await apiRequest(`/encierros/lookup/${folio}`, { token });
  },
  async create(payload, token) {
    return await apiRequest('/encierros', {
      method: 'POST',
      body: payload,
      token,
    });
  },
  async update(folio, payload, token) {
    return await apiRequest(`/encierros/${folio}`, {
      method: 'PATCH',
      body: payload,
      token,
    });
  },
};
