import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Hook auxiliar para leer el AuthContext sin repetir `useContext` en cada archivo.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
  }
  return context;
}
