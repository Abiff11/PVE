/**
 * Cliente HTTP del front: centraliza baseURL, headers y manejo de errores.
 * Así evitamos repetir `fetch` y garantizamos que todas las peticiones usen el mismo formato.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

/**
 * Ejecuta una petición al backend Nest.
 * @param {string} path - Ruta relativa (por ejemplo `/infracciones`).
 * @param {object} options - Configuración opcional (método, body, token JWT).
 */
export async function apiRequest(path, options = {}) {
  const { method = "GET", body, token, headers: customHeaders = {} } = options;

  const headers = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Interpretamos la respuesta: si es 204 regresamos null, en otro caso JSON.
  const parseBody = async () => {
    if (response.status === 204) {
      return null;
    }
    try {
      return await response.json();
    } catch {
      return null;
    }
  };

  const data = await parseBody();

  if (!response.ok) {
    const error = new Error(data?.message ?? "Error al consultar el backend");
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
}
