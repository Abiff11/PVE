import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { infraccionesService } from '../../services/infracciones';
import InfraccionForm from '../../components/FormInfraccion/InfraccionForm';

const EMPTY_FORM = {
  folio: '',
  nombreInfractor: '',
  nombreOficial: '',
  delegacion: '',
  detalleInfraccion: '',
  fecha: '',
  hora: '',
  monto: '',
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
    setSubmitting(true);
    setError(null);
    try {
      const response = await infraccionesService.create(payload, token);
      navigate(`/infracciones/${response.folio}`);
    } catch (err) {
      setError(err.message ?? 'No fue posible registrar la infracción');
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
