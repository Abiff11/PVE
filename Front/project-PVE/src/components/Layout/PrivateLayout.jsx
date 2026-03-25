import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

/**
 * Layout para vistas protegidas: incluye navegación principal,
 * datos del usuario activo y acceso a secciones según rol.
 */

const DASHBOARD_ROLES = ["admin", "director"];
const ENCIERRO_ROLES = ["admin", "encierro", "director"];
const ADMIN_ROLES = ["admin"];
const REGISTER_ROLES = ["admin", "capturista", "actualizador"];

// Mapeo de rutas a nombres legibles
const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/infracciones": "Infracciones",
  "/infracciones/nueva": "Nueva Infracción",
  "/encierros": "Encierros",
  "/usuarios": "Usuarios",
  "/bitacora": "Bitácora",
};

function PrivateLayout() {
  const { user, logout } = useAuth();
  const role = user?.role;
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Verificar si una ruta está activa
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  // Obtener el título de la página actual
  const currentPath = location.pathname;
  const pageTitle = PAGE_TITLES[currentPath] || PAGE_TITLES[currentPath.split("/").slice(0, 2).join("/")] || "Panel";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="private-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar__logo">
          <img src="/assets/Logo PVE.PNG" alt="Policía Vial Estatal" className="sidebar__logo-img" />
          <span className="sidebar__logo-text">Policía Vial Estatal</span>
        </div>

        <nav className="sidebar__nav">
          {/* PRINCIPAL */}
          <div className="sidebar__section">
            <span className="sidebar__section-title">PRINCIPAL</span>
            {DASHBOARD_ROLES.includes(role) && (
              <Link
                to="/dashboard"
                className={`sidebar__link ${isActive("/dashboard") ? "active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sidebar__link-icon">📊</span>
                Dashboard
              </Link>
            )}
          </div>

          {/* OPERACIÓN */}
          <div className="sidebar__section">
            <span className="sidebar__section-title">OPERACIÓN</span>
            <Link
              to="/infracciones"
              className={`sidebar__link ${isActive("/infracciones") ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sidebar__link-icon">📋</span>
              Infracciones
            </Link>
            {REGISTER_ROLES.includes(role) && (
              <Link
                to="/infracciones/nueva"
                className={`sidebar__link ${isActive("/infracciones/nueva") ? "active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sidebar__link-icon">➕</span>
                Registrar
              </Link>
            )}
            {ENCIERRO_ROLES.includes(role) && (
              <Link
                to="/encierros"
                className={`sidebar__link ${isActive("/encierros") ? "active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sidebar__link-icon">🚗</span>
                Encierros
              </Link>
            )}
          </div>

          {/* ADMINISTRACIÓN */}
          {ADMIN_ROLES.includes(role) && (
            <div className="sidebar__section">
              <span className="sidebar__section-title">ADMINISTRACIÓN</span>
              <Link
                to="/usuarios"
                className={`sidebar__link ${isActive("/usuarios") ? "active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sidebar__link-icon">👥</span>
                Usuarios
              </Link>
              <Link
                to="/bitacora"
                className={`sidebar__link ${isActive("/bitacora") ? "active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sidebar__link-icon">📝</span>
                Bitácora
              </Link>
            </div>
          )}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__version">v2.0.0</div>
        </div>
      </aside>

      {/* Overlay para móvil */}
      {sidebarOpen && <div className="sidebar__overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Contenido principal */}
      <div className="private-layout__main">
        {/* Header */}
        <header className="header">
          <div className="header__left">
            <button className="header__menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menú">
              ☰
            </button>
            <h1 className="header__title">{pageTitle}</h1>
          </div>

          <div className="header__right">
            <div className="header__user">
              <button className="header__user-button" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <span className="header__user-avatar">
                  {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
                </span>
                <span className="header__user-name">
                  {user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : "Usuario"}
                </span>
                <span className="header__user-arrow">▾</span>
              </button>

              {userMenuOpen && (
                <div className="header__dropdown">
                  <div className="header__dropdown-header">
                    <span className="header__dropdown-name">{user?.username}</span>
                    <span className="header__dropdown-role">
                      {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ""}
                    </span>
                  </div>
                  <div className="header__dropdown-divider" />
                  <button className="header__dropdown-item" onClick={handleLogout}>
                    <span className="header__dropdown-icon">🚪</span>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className="private-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default PrivateLayout;
