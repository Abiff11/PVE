import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { infraccionesService } from "../../services/infracciones";
import InfraccionForm from "../../components/FormInfraccion/InfraccionForm";
import { DEFAULT_ENCIERRO, DEFAULT_SERVICIO_GRUA } from "../../catalogos";

const UPDATE_ROLES = ["admin", "actualizador" ];
const DELETE_ROLES = ["admin", "director"];

function mapRecordToFormValues(record) {
  if (!record) {
    return null;
  }

  return {
    folioInfraccion: record.folioInfraccion,
    encierro: record.encierro ?? DEFAULT_ENCIERRO,
    servicioGrua: record.servicioGrua ?? DEFAULT_SERVICIO_GRUA,
    fecha: record.fecha,
    hora: record.hora?.slice?.(0, 5) ?? record.hora,
    nombreInfractor: record.nombreInfractor,
    genero: record.genero,
    numeroLicencia: record.numeroLicencia,
    servicio: record.servicio,
    clase: record.clase,
    tipo: record.tipo,
    marca: record.marca,
    modelo: record.modelo,
    color: record.color,
    placas: record.placas,
    estadoPlacas: record.estadoPlacas,
    serie: record.serie,
    motor: record.motor,
    municipio: record.municipio,
    agencia: record.agencia,
    colonia: record.colonia,
    calle: record.calle,
    m1: record.m1 ?? "",
    m2: record.m2 ?? "",
    m3: record.m3 ?? "",
    m4: record.m4 ?? "",
    situacionVehiculo: record.situacionVehiculo,
    claveOficial: record.claveOficial,
    numeroParteInformativo: record.numeroParteInformativo ?? "",
    nombreOperativo: record.nombreOperativo,
    sitioServicioPublico: record.sitioServicioPublico ?? "",
    monto: record.monto ?? 0,
    estatus: record.estatus,
  };
}

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
      setError(err.message ?? "No fue posible cargar la infracción solicitada");
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
      const { folioInfraccion: _ignored, ...updateDto } = payload;
      await infraccionesService.update(folio, updateDto, token);
      setSuccessMessage("Infracción actualizada correctamente");
      await loadRecord();
    } catch (err) {
      setError(err.message ?? "No fue posible actualizar la infracción");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Deseas eliminar esta infracción?")) {
      return;
    }
    setSubmitting(true);
    try {
      await infraccionesService.remove(folio, token);
      navigate("/infracciones");
    } catch (err) {
      setError(err.message ?? "No fue posible eliminar la infracción");
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
          <p>Folio {record.folioInfraccion}</p>
        </div>
        {record?.encierroRegistro ? (
          <button type="button" onClick={() => navigate(`/encierros/${record.folioInfraccion}`)} disabled={submitting}>
            Detalle encierro
          </button>
        ) : null}
        {canDelete && (
          <button type="button" onClick={handleDelete} disabled={submitting}>
            Eliminar
          </button>
        )}
      </header>

      {successMessage ? <p className="success-text">{successMessage}</p> : null}

      {canUpdate ? (
        <>
          <InfraccionForm
            initialValues={initialValues}
            onSubmit={handleUpdate}
            submitting={submitting}
            submitLabel="Actualizar"
            showFolio={false}
            allowStatus
          />
        </>
      ) : (
        <article className="detail-panel">
          <h3>Información de la infracción</h3>

          <table className="detail-table">
            <tbody>
              <tr>
                <th>Folio</th>
                <td>{record.folioInfraccion}</td>
              </tr>

              <tr>
                <th>Encierro</th>
                <td>{record.situacionVehiculo === "SOLO_INFRACCION" ? "No aplica" : (record.encierro ?? "-")}</td>
              </tr>

              <tr>
                <th>Servicio grúa</th>
                <td>{record.situacionVehiculo === "SOLO_INFRACCION" ? "No aplica" : (record.servicioGrua ?? "-")}</td>
              </tr>

              <tr>
                <th>Fecha</th>
                <td>{record.fecha}</td>
              </tr>

              <tr>
                <th>Hora</th>
                <td>{record.hora?.slice?.(0, 5) ?? record.hora}</td>
              </tr>

              <tr>
                <th>Nombre infractor</th>
                <td>{record.nombreInfractor}</td>
              </tr>

              <tr>
                <th>Género</th>
                <td>{record.genero}</td>
              </tr>

              <tr>
                <th>No. licencia</th>
                <td>{record.numeroLicencia}</td>
              </tr>

              <tr>
                <th>Servicio</th>
                <td>{record.servicio}</td>
              </tr>

              <tr>
                <th>Clase</th>
                <td>{record.clase}</td>
              </tr>

              <tr>
                <th>Tipo</th>
                <td>{record.tipo}</td>
              </tr>

              <tr>
                <th>Marca</th>
                <td>{record.marca}</td>
              </tr>

              <tr>
                <th>Modelo</th>
                <td>{record.modelo}</td>
              </tr>

              <tr>
                <th>Color</th>
                <td>{record.color}</td>
              </tr>

              <tr>
                <th>Placas</th>
                <td>{record.placas}</td>
              </tr>

              <tr>
                <th>Estado</th>
                <td>{record.estadoPlacas}</td>
              </tr>

              <tr>
                <th>Serie</th>
                <td>{record.serie}</td>
              </tr>

              <tr>
                <th>Motor</th>
                <td>{record.motor}</td>
              </tr>

              <tr>
                <th>Municipio</th>
                <td>{record.municipio}</td>
              </tr>

              <tr>
                <th>Agencia</th>
                <td>{record.agencia}</td>
              </tr>

              <tr>
                <th>Colonia</th>
                <td>{record.colonia}</td>
              </tr>

              <tr>
                <th>Calle</th>
                <td>{record.calle}</td>
              </tr>

              <tr>
                <th>M1</th>
                <td>{record.m1 ?? "-"}</td>
              </tr>

              <tr>
                <th>M2</th>
                <td>{record.m2 ?? "-"}</td>
              </tr>

              <tr>
                <th>M3</th>
                <td>{record.m3 ?? "-"}</td>
              </tr>

              <tr>
                <th>M4</th>
                <td>{record.m4 ?? "-"}</td>
              </tr>

              <tr>
                <th>Vehículo detenido o solo infracción</th>
                <td>{record.situacionVehiculo === "VEHICULO_DETENIDO" ? "Vehículo detenido" : "Solo infracción"}</td>
              </tr>

              <tr>
                <th>Clave del oficial</th>
                <td>{record.claveOficial}</td>
              </tr>

              <tr>
                <th>No. parte informativo</th>
                <td>{record.numeroParteInformativo ?? "-"}</td>
              </tr>

              <tr>
                <th>Nombre operativo</th>
                <td>{record.nombreOperativo}</td>
              </tr>

              <tr>
                <th>Sitio (servicio público)</th>
                <td>{record.sitioServicioPublico ?? "-"}</td>
              </tr>

              <tr>
                <th>Monto</th>
                <td>${Number(record.monto ?? 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td>
              </tr>

              <tr>
                <th>Estatus</th>
                <td>{record.estatus}</td>
              </tr>
            </tbody>
          </table>

          <p>
            Solo los roles {UPDATE_ROLES.join(", ")} pueden editar. Contacta a un administrador si necesitas cambios.
          </p>
        </article>
      )}
    </section>
  );
}

export default InfraccionDetailPage;
