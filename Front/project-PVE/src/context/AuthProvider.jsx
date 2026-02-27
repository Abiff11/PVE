import { useCallback, useMemo, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from './AuthContext';
import { logoutRequest } from '../services/auth';

const STORAGE_KEY = 'pve.auth';

/**
 * Traduce el token JWT en un objeto de usuario fácil de consumir en la UI.
 */
function getUserFromToken(token) {
  try {
    const payload = jwtDecode(token);
    return {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  } catch (error) {
    console.error('No fue posible decodificar el token JWT', error);
    return null;
  }
}

/**
 * Lee el token almacenado (si existe) y prepara el estado inicial del contexto.
 * Se ejecuta una sola vez cuando React monta el provider.
 */
function loadInitialAuthState() {
  const emptyState = { token: null, user: null };
  const rawState = localStorage.getItem(STORAGE_KEY);
  if (!rawState) {
    return emptyState;
  }

  try {
    const parsed = JSON.parse(rawState);
    if (parsed?.token) {
      const parsedUser = getUserFromToken(parsed.token);
      if (parsedUser) {
        return { token: parsed.token, user: parsedUser };
      }
    }
    localStorage.removeItem(STORAGE_KEY);
    return emptyState;
  } catch (error) {
    console.error('Estado de auth inválido en almacenamiento local', error);
    localStorage.removeItem(STORAGE_KEY);
    return emptyState;
  }
}

/**
 * Proveedor del contexto de autenticación.
 * Coordina login/logout y expone token + rol para el resto de componentes.
 */
export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(loadInitialAuthState);
  const { token, user } = authState;

  /**
   * Guarda el token emitido por el backend y decodifica al usuario para compartirlo en el contexto.
   */
  const login = useCallback((accessToken) => {
    if (!accessToken) {
      throw new Error('Se requiere un token JWT para autenticar al usuario');
    }
    const decodedUser = getUserFromToken(accessToken);
    if (!decodedUser) {
      throw new Error('El token recibido no es válido');
    }
    setAuthState({ token: accessToken, user: decodedUser });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: accessToken }));
  }, []);

  /**
   * Limpia la sesión local y notifica al backend para dejar registro en la bitácora.
   */
  const logout = useCallback(async () => {
    if (token) {
      try {
        await logoutRequest(token);
      } catch (error) {
        console.warn('No fue posible registrar el logout en el backend', error);
      }
    }
    setAuthState({ token: null, user: null });
    localStorage.removeItem(STORAGE_KEY);
  }, [token]);

  const contextValue = useMemo(
    () => ({
      token,
      user,
      role: user?.role ?? null,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, user, login, logout],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export default AuthProvider;
