import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { usersService } from "../../services/users";
import UserForm from "../../components/Users/UserForm";

const ROLE_LABELS = {
  admin: "Admin",
  director: "Director",
  capturista: "Capturista",
  actualizador: "Actualizador",
  encierro: "Encierro",
};

/**
 * Dashboard exclusivo para administradores. Permite listar, crear y administrar roles de usuarios.
 */
function UsersDashboard() {
  const { token, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [rowActionId, setRowActionId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  /**
   * Consulta la API y refresca la tabla de usuarios.
   */
  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersService.list(token);
      setUsers(data);
    } catch (err) {
      setError(err.message ?? "No fue posible cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  /**
   * Envía el formulario de creación y repuebla la tabla si todo sale bien.
   */
  const handleCreateUser = async (payload) => {
    setSubmitting(true);
    setError(null);
    try {
      await usersService.create(payload, token);
      setFeedback("Usuario creado correctamente");
      await loadUsers();
    } catch (err) {
      setError(err.message ?? "No fue posible crear al usuario");
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Cambia el rol del usuario seleccionado mostrando feedback y bloqueando la fila.
   */
  const handleRoleChange = async (id, role) => {
    setRowActionId(id);
    setError(null);
    try {
      await usersService.updateRole(id, role, token);
      setFeedback("Rol actualizado correctamente");
      await loadUsers();
    } catch (err) {
      setError(err.message ?? "No fue posible actualizar el rol");
    } finally {
      setRowActionId(null);
    }
  };

  /**
   * Solicita confirmación y elimina al usuario en el backend.
   * Previene que un admin se elimine a sí mismo.
   */
  const handleDelete = async (id) => {
    if (user?.id === id) {
      setError("No puedes eliminar tu propio usuario.");
      return;
    }
    const confirmed = window.confirm("¿Eliminar este usuario?");
    if (!confirmed) {
      return;
    }

    setRowActionId(id);
    setError(null);
    try {
      await usersService.remove(id, token);
      setFeedback("Usuario eliminado correctamente");
      await loadUsers();
    } catch (err) {
      setError(err.message ?? "No fue posible eliminar al usuario");
    } finally {
      setRowActionId(null);
    }
  };

  return (
    <section>
      <p>Gestiona cuentas, roles y altas directamente desde este panel.</p>

      {feedback ? <p className="success-text">{feedback}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      <article className="detail-panel">
        <h3>Crear nuevo usuario</h3>
        <UserForm onSubmit={handleCreateUser} submitting={submitting} />
      </article>

      <article className="detail-panel" style={{ marginTop: "1.5rem" }}>
        <h3>Usuarios registrados</h3>
        {loading ? (
          <p>Cargando usuarios...</p>
        ) : (
          <div className="table-wrapper table-wrapper--responsive">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Usuario</th>
                  <th>Teléfono</th>
                  <th>Delegación</th>
                  <th>Rol</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7}>No hay usuarios registrados.</td>
                  </tr>
                ) : (
                  users.map((item) => (
                    <tr key={item.id}>
                      <td data-label="ID">
                        <span className="cell-truncate">{item.id}</span>
                      </td>
                      <td data-label="Nombre">
                        <span className="cell-truncate">
                          {item.nombre} {item.apellido}
                        </span>
                      </td>
                      <td data-label="Usuario">
                        <span className="cell-truncate">{item.username}</span>
                      </td>
                      <td data-label="Telefono">
                        <span className="cell-truncate">{item.telefono}</span>
                      </td>
                      <td data-label="Delegacion">
                        <span className="cell-truncate">{item.delegacion}</span>
                      </td>
                      <td data-label="Rol">
                        <select
                          value={item.role}
                          onChange={(event) => handleRoleChange(item.id, event.target.value)}
                          disabled={rowActionId === item.id}
                        >
                          {Object.entries(ROLE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td data-label="Accion" className="table-actions">
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          disabled={rowActionId === item.id}
                          style={{ backgroundColor: "#dc2626" }}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </section>
  );
}

export default UsersDashboard;
