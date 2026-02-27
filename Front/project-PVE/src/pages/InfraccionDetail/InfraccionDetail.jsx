import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { infraccionesService } from '../../services/infracciones';
import InfraccionForm from '../../components/FormInfraccion/InfraccionForm';

const UPDATE_ROLES = ['admin', 'actualizador'];
const DELETE_ROLES = ['admin', 'director'];

/**
 * Convierte el registro proveniente del backend al modelo que consume el formulario.
 */
function mapRecordToFormValues(record) {
  if (!record) {
    return null;
  }
  const fechaObject = new Date(record.fechaHora);
  const fecha = fechaObject.toISOString().slice(0, 10);
  const hora = fechaObject.toISOString().slice(11, 16);

  return {
    folio: record.folio,
    nombreInfractor: record.nombreInfractor,
    nombreOficial: record.nombreOficial,
    delegacion: record.delegacion,
    detalleInfraccion: record.detalleInfraccion,
    fecha,
    hora,
    monto: record.monto,
    estatus: record.estatus,
  };
}

/**
 * Vista para consultar, editar o eliminar una infracción.
 */
function InfraccionDetailPage() {
  const { folio } = useParams();
  const navigate = useNavigate();
  const { token, role } = useAuth();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const canUpdate = UPDATE_ROLES.includes(role);
  const canDelete = DELETE_ROLES.includes(role);

  const initialValues = useMemo(() => mapRecordToFormValues(record), [record]);

  const loadRecord = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await infraccionesService.getByFolio(folio, token);
      setRecord(data);
    } catch (err) {
      setError(err.message ?? 'No fue posible cargar la infracción solicitada');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folio, token]);

  const handleUpdate = async (payload) => {
    setSubmitting(true);
    setSuccessMessage(null);
    try {
      const { folio: _ignored, ...updateDto } = payload;
      await infraccionesService.update(folio, updateDto, token);
      setSuccessMessage('Infracción actualizada correctamente');
      await loadRecord();
    } catch (err) {
      setError(err.message ?? 'No fue posible actualizar la infracción');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Deseas eliminar esta infracción?')) {
      return;
    }
    setSubmitting(true);
    try {
      await infraccionesService.remove(folio, token);
      navigate('/infracciones');
    } catch (err) {
      setError(err.message ?? 'No fue posible eliminar la infracción');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p>Cargando detalle...</p>;
  }

  if (error) {
    return <p className="error-text">{error}</p>;
  }

  if (!record) {
    return <p>No se encontró información para el folio {folio}</p>;
  }

  return (
    <section>
      <header className="section-header">
        <div>
          <h2>Detalle de infracción</h2>
          <p>Folio {folio}</p>
        </div>
        {canDelete && (
          <button type="button" onClick={handleDelete} disabled={submitting}>
            Eliminar
          </button>
        )}
      </header>

      {successMessage ? <p className="success-text">{successMessage}</p> : null}
      {canUpdate ? (
        <InfraccionForm
          initialValues={initialValues}
          onSubmit={handleUpdate}
          submitting={submitting}
          submitLabel="Actualizar"
          showFolio={false}
          allowStatus
        />
      ) : (
        <article className="detail-panel">
          <p>
            Solo los roles {UPDATE_ROLES.join(', ')} pueden editar. Contacta a un administrador si
            necesitas cambios.
          </p>
        </article>
      )}
    </section>
  );
}

export default InfraccionDetailPage;
