import { createContext } from 'react';

/**
 * Contexto base compartido en toda la aplicación para exponer token y rol del usuario.
 */
export const AuthContext = createContext(null);
