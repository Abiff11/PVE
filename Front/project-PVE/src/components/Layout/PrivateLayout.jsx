import { useState } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="private-layout">
      <header className="private-layout__header">
        <div className="private-layout__header-content">
          <h1>Dirección General de la Policia Vial</h1>
          <p>Panel de control</p>
        </div>

        <button 
          className="menu-toggle" 
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <div className="private-layout__user">
          <span className="user-info">
            {user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : ""} (
            {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ""})
          </span>

          <button type="button" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <nav className={`private-layout__nav ${menuOpen ? 'open' : ''}`}>
        {/* Dashboard */}
        {DASHBOARD_ROLES.includes(role) && <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>}

        {/* Infracciones (todos los roles operativos) */}
        <Link to="/infracciones" onClick={() => setMenuOpen(false)}>Infracciones</Link>

        {/* Registrar infracción */}
        {REGISTER_ROLES.includes(role) && <Link to="/infracciones/nueva" onClick={() => setMenuOpen(false)}>Registrar</Link>}

        {/* Encierros */}
        {ENCIERRO_ROLES.includes(role) && <Link to="/encierros" onClick={() => setMenuOpen(false)}>Encierros</Link>}

        {/* Administración */}
        {ADMIN_ROLES.includes(role) && (
          <>
            <Link to="/usuarios" onClick={() => setMenuOpen(false)}>Usuarios</Link>
            <Link to="/bitacora" onClick={() => setMenuOpen(false)}>Bitácora</Link>
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
