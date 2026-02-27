import { apiRequest } from './apiClient';

/**
 * Cliente para consultar la bitácora de auditoría.
 */
export async function fetchBitacora(params = {}, token) {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (!value) {
      return;
    }
    queryParams.append(key, value);
  });

  const query = queryParams.toString();
  const path = query ? `/bitacora?${query}` : '/bitacora';
  return await apiRequest(path, { token });
}
