import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

/**
 * Layout para vistas protegidas: incluye navegación principal,
 * datos del usuario activo y acceso a secciones según rol.
 */

const DASHBOARD_ROLES = ["admin", "director"];
const ENCIERRO_ROLES = ["admin", "encierro", "director"];
const ADMIN_ROLES = ["admin"];
const REGISTER_ROLES = ["admin", "capturista", "actualizador"];

function PrivateLayout() {
  const { user, logout } = useAuth();
  const role = user?.role;

  return (
    <div className="private-layout">
      <header className="private-layout__header">
        <div>
          <h1>Dirección General de la Policia Vial</h1>
          <p>Panel de control</p>
        </div>

        <div className="private-layout__user">
          <span>
            {user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : ""} (
            {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ""})
          </span>

          <button type="button" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <nav className="private-layout__nav">
        {/* Dashboard */}
        {DASHBOARD_ROLES.includes(role) && <Link to="/dashboard">Dashboard</Link>}

        {/* Infracciones (todos los roles operativos) */}
        <Link to="/infracciones">Infracciones</Link>

        {/* Registrar infracción */}
        {REGISTER_ROLES.includes(role) && <Link to="/infracciones/nueva">Registrar</Link>}

        {/* Encierros */}
        {ENCIERRO_ROLES.includes(role) && <Link to="/encierros">Encierros</Link>}

        {/* Administración */}
        {ADMIN_ROLES.includes(role) && (
          <>
            <Link to="/usuarios">Usuarios</Link>
            <Link to="/bitacora">Bitácora</Link>
          </>
        )}
      </nav>

      <main className="private-layout__content">
        <Outlet />
      </main>
    </div>
  );
}

export default PrivateLayout;
