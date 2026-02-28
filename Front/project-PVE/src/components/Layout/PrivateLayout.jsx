import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

/**
 * Layout para vistas protegidas: incluye navegación principal, datos del usuario activo
 * y acceso a las secciones disponibles según el rol.
 */
function PrivateLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="private-layout">
      <header className="private-layout__header">
        <div>
          <h1>POLICIA VIAL ESTATAL</h1>
          <p>Panel de control</p>
        </div>
        <div className="private-layout__user">
          {/* Mostramos nombre/rol capitalizando la primera letra para mayor legibilidad */}
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
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/infracciones">Infracciones</Link>
        <Link to="/infracciones/nueva">Registrar</Link>
        {user?.role === "admin" ? (
          <>
            <Link to="/usuarios">Usuarios</Link>
            <Link to="/bitacora">Bitácora</Link>
          </>
        ) : null}
      </nav>

      <main className="private-layout__content">
        <Outlet />
      </main>
    </div>
  );
}

export default PrivateLayout;
