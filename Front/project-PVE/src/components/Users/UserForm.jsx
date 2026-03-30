import { useState } from 'react';
import { normalizeText } from '../../utils/normalizers';

/**
 * Delegaciones disponibles en el sistema. Se estandarizan los nombres para evitar variaciones.
 */
const DELEGACIONES = [
  'Plaza',
  'Foraneos Cañada',
  'Foraneos Costa Oriente',
  'Foraneos Costa Poniente',
  'Foraneos Cuenca',
  'Foraneos Istmo Norte',
  'Foraneos Istmo Sur',
  'Foraneos Mixteca',
  'Foraneos Valles Norte',
  'Foraneos Valles Sur',
];

/**
 * Formulario controlado para crear usuarios del sistema (solo admin).
 * Maneja validaciones mínimas y delega el submit al callback recibido.
 */
function UserForm({ onSubmit, submitting = false }) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    username: '',
    password: '',
    telefono: '',
    delegacion: DELEGACIONES[0],
    role: 'capturista',
  });
  const [error, setError] = useState(null);

  /**
   * Sincroniza el estado controlado cuando cambia cualquier input/select.
   */
  const handleChange = (event) => {
    const { name, type, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'text' ? normalizeText(value) : value,
    }));
  };

  /**
   * Valida los campos mínimos y delega la creación al callback del padre.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.nombre || !formData.apellido || !formData.username) {
      setError('Todos los campos son obligatorios');
      return;
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setError(null);
    await onSubmit(formData);
    setFormData({
      nombre: '',
      apellido: '',
      username: '',
      password: '',
      telefono: '',
      delegacion: DELEGACIONES[0],
      role: 'capturista',
    });
  };

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label>
          Nombre
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            disabled={submitting}
            required
          />
        </label>
        <label>
          Apellido
          <input
            type="text"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            disabled={submitting}
            required
          />
        </label>
      </div>

      <div className="form-grid">
        <label>
          Usuario
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            disabled={submitting}
            required
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={submitting}
            required
          />
        </label>
      </div>

      <div className="form-grid">
        <label>
          Teléfono
          <input
            type="text"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            disabled={submitting}
            required
          />
        </label>
        <label>
          Delegación
          <select
            name="delegacion"
            value={formData.delegacion}
            onChange={handleChange}
            disabled={submitting}
          >
            {DELEGACIONES.map((delegacion) => (
              <option key={delegacion} value={delegacion}>
                {delegacion}
              </option>
            ))}
          </select>
        </label>
        <label>
          Rol
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={submitting}
          >
            <option value="admin">Admin</option>
            <option value="director">Director</option>
            <option value="capturista">Capturista</option>
            <option value="actualizador">Actualizador</option>
          </select>
        </label>
      </div>

      {error ? <p className="error-text">{error}</p> : null}
      <button type="submit" disabled={submitting}>
        {submitting ? 'Creando...' : 'Crear usuario'}
      </button>
    </form>
  );
}

export default UserForm;
