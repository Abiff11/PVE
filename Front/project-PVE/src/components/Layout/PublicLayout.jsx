import { Outlet } from 'react-router-dom';

/**
 * Layout de páginas públicas: centra el contenido (ej. Login) y deja espacio para branding.
 * Usa <Outlet /> para que React Router inserte la pantalla solicitada.
 */
function PublicLayout() {
  return (
    <div className="public-layout">
      <header className="public-layout__header">
        <h1>Dirección General de la Policia Vial</h1>
        <p>Plataforma de Verificación Estatal</p>
      </header>
      <div className="public-layout__content">
        <Outlet />
      </div>
    </div>
  );
}

export default PublicLayout;
