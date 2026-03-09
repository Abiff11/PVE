import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { infraccionesService } from "../../services/infracciones";
import InfraccionForm from "../../components/FormInfraccion/InfraccionForm";
import { DEFAULT_ENCIERRO, DEFAULT_SERVICIO_GRUA } from "../../catalogos";

const EMPTY_FORM = {
  fecha: "",
  hora: "",
  folioInfraccion: "",
  encierro: DEFAULT_ENCIERRO,
  servicioGrua: DEFAULT_SERVICIO_GRUA,
  nombreInfractor: "",
  genero: "",
  numeroLicencia: "",
  servicio: "",
  clase: "",
  tipo: "",
  marca: "",
  modelo: "",
  color: "",
  placas: "",
  estadoPlacas: "",
  serie: "",
  motor: "",
  municipio: "",
  agencia: "",
  colonia: "",
  calle: "",
  m1: "",
  m2: "",
  m3: "",
  m4: "",
  situacionVehiculo: "SOLO_INFRACCION",
  claveOficial: "",
  numeroParteInformativo: "",
  nombreOperativo: "",
  sitioServicioPublico: "",
};

/**
 * Página para capturar nuevas infracciones usando el DTO del backend.
 */
function NuevaInfraccionPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (payload) => {
    const confirmacion = window.confirm(
      "¿Confirmas que todos los datos de la infracción son correctos?\n\nUna vez creada, la información no podrá modificarse.",
    );

    if (!confirmacion) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await infraccionesService.create(payload, token);
      navigate(`/infracciones/${response.folioInfraccion}`);
    } catch (err) {
      setError(err.message ?? "No fue posible registrar la infracción");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section>
      <header className="section-header">
        <div>
          <h2>Registrar nueva infracción</h2>
          <p>Completa los campos obligatorios para dar de alta un nuevo folio.</p>
        </div>
      </header>

      {error ? <p className="error-text">{error}</p> : null}
      <InfraccionForm
        initialValues={EMPTY_FORM}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Crear infracción"
        showFolio
        allowStatus={false}
      />
    </section>
  );
}

export default NuevaInfraccionPage;
