import { Outlet } from "react-router-dom";
import logoPve from "../../assets/Logo PVE.PNG";

/**
 * Layout público para la pantalla de login.
 * Divide la vista en una sección institucional y otra para el formulario.
 */
function PublicLayout() {
  return (
    <div className="public-layout login-shell">
      <section className="login-shell__brand">
        <div className="login-shell__brand-inner">
          <div className="login-shell__logo">
            <img src={logoPve} alt="Policía Vial Estatal" />
          </div>

          <h1 className="login-shell__title">POLICIA VIAL ESTATAL</h1>

          <div className="login-shell__divider" />

          <p className="login-shell__subtitle">
            SISTEMA INTERNO DE
            <br />
            CONTROL DE INFRACCIONES
          </p>
        </div>
      </section>

      <section className="login-shell__panel">
        <div className="public-layout__content">
          <Outlet />
        </div>
      </section>
    </div>
  );
}

export default PublicLayout;
