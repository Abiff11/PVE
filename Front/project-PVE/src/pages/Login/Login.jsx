import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { signin } from '../../services/auth';

/**
 * Pantalla de Login: valida credenciales contra el backend y guarda el token en el contexto.
 */
function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formState, setFormState] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Controla los inputs del formulario actualizando el estado local.
   */
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Envía las credenciales al backend y, si son válidas, guarda el token.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await signin(formState);
      login(response.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message ?? 'No fue posible iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <h1>PVE - Acceso</h1>
        <p>Introduce tus credenciales asignadas por el administrador.</p>
        <form onSubmit={handleSubmit}>
          <label>
            Usuario
            <input
              type="text"
              name="username"
              value={formState.username}
              onChange={handleChange}
              autoComplete="username"
              required
              disabled={loading}
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              name="password"
              value={formState.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
              disabled={loading}
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Validando...' : 'Ingresar'}
          </button>
        </form>
        {error ? <p className="error-text">{error}</p> : null}
      </section>
    </main>
  );
}

export default LoginPage;
