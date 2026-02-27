import './App.css';
import AuthProvider from './context/AuthProvider';
import { AppRouter } from './router/AppRouter';

/**
 * Punto de entrada del front: aplica el contexto de autenticación y monta el router.
 */
function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
