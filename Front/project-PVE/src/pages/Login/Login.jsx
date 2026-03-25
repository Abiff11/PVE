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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

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
        <h2 className="login-card__title">ACCESO</h2>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-form__label" htmlFor="username">
            Usuario
          </label>
          <input
            id="username"
            className="login-form__input"
            type="text"
            name="username"
            placeholder="Usuario"
            value={formState.username}
            onChange={handleChange}
            autoComplete="username"
            required
            disabled={loading}
          />

          <label className="login-form__label" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            className="login-form__input"
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formState.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
            disabled={loading}
          />

          {error ? <p className="error-text login-form__error">{error}</p> : null}

          <button className="login-form__button" type="submit" disabled={loading}>
            {loading ? 'Validando...' : 'Iniciar sesión'}
          </button>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;
