import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import InfraccionForm from "../../components/FormInfraccion/InfraccionForm";
import { DEFAULT_ENCIERRO, DEFAULT_SERVICIO_GRUA } from "../../catalogos";
import { useAuth } from "../../hooks/useAuth";
import { infraccionesService } from "../../services/infracciones";

const UPDATE_ROLES = ["admin", "actualizador"];
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

function formatCurrency(value) {
  return `$${Number(value ?? 0).toLocaleString("es-MX", {
    minimumFractionDigits: 2,
  })}`;
}

function DetailField({ label, value }) {
  return (
    <div className="detail-field">
      <span className="detail-field__label">{label}</span>
      <p className="detail-field__value">{value || "-"}</p>
    </div>
  );
}

function DetailSection({ title, items, fullWidth = false, children }) {
  return (
    <section className={`detail-section${fullWidth ? " detail-section--full" : ""}`}>
      <h4>{title}</h4>
      {items?.length ? (
        <div className="detail-section-grid">
          {items.map((item) => (
            <DetailField key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      ) : null}
      {children}
    </section>
  );
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
  const canViewEncierro = record?.situacionVehiculo === "VEHICULO_DETENIDO" && Boolean(record?.folioInfraccion);

  const initialValues = useMemo(() => mapRecordToFormValues(record), [record]);

  const loadRecord = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await infraccionesService.getByFolio(folio, token);
      setRecord(data);
    } catch (err) {
      setError(err.message ?? "No fue posible cargar la infraccion solicitada");
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
    setError(null);
    try {
      const { folioInfraccion: _ignored, ...updateDto } = payload;
      const updated = await infraccionesService.update(folio, updateDto, token);
      setRecord(updated);
      setSuccessMessage("Infraccion actualizada correctamente");
    } catch (err) {
      setError(err.message ?? "No fue posible actualizar la infraccion");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Deseas eliminar esta infraccion?")) {
      return;
    }
    setSubmitting(true);
    try {
      await infraccionesService.remove(folio, token);
      navigate("/infracciones");
    } catch (err) {
      setError(err.message ?? "No fue posible eliminar la infraccion");
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
    return <p>No se encontro informacion para el folio {folio}</p>;
  }

  const detailItems = record.detalles?.length
    ? record.detalles
    : [
        {
          id: "fallback",
          claveOficial: record.claveOficial || "-",
          numeroParteInformativo: record.numeroParteInformativo || "-",
          nombreOperativo: record.nombreOperativo || "-",
          sitioServicioPublico: record.sitioServicioPublico || "-",
        },
      ];

  return (
    <section>
      <p>Folio {record.folioInfraccion}</p>

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
          <h3>Informacion completa de la infraccion</h3>

          <div className="detail-sections">
            <DetailSection
              title="Resumen"
              items={[
                { label: "Folio", value: record.folioInfraccion },
                { label: "Fecha", value: record.fecha },
                { label: "Hora", value: record.hora?.slice?.(0, 5) ?? record.hora },
                {
                  label: "Estatus",
                  value: record.estatus === "PAGADA" ? "Pagada" : "Pendiente",
                },
                { label: "Monto", value: formatCurrency(record.monto) },
                {
                  label: "Relacion con encierro",
                  value:
                    record.situacionVehiculo === "VEHICULO_DETENIDO"
                      ? `Vehiculo detenido${record.encierro ? ` • ${record.encierro}` : ""}`
                      : "Solo infraccion",
                },
              ]}
            />

            <DetailSection
              title="Datos completos del infractor"
              items={[
                { label: "Nombre", value: record.nombreInfractor },
                { label: "Genero", value: record.genero },
                { label: "Numero de licencia", value: record.numeroLicencia },
              ]}
            />

            <DetailSection
              title="Vehiculo"
              items={[
                { label: "Servicio", value: record.servicio },
                { label: "Clase", value: record.clase },
                { label: "Tipo", value: record.tipo },
                { label: "Marca", value: record.marca },
                { label: "Modelo", value: record.modelo },
                { label: "Color", value: record.color },
                { label: "Placas", value: record.placas },
                { label: "Estado de placas", value: record.estadoPlacas },
                { label: "Serie", value: record.serie },
                { label: "Motor", value: record.motor },
              ]}
            />

            <DetailSection
              title="Ubicacion"
              items={[
                { label: "Municipio", value: record.municipio },
                { label: "Agencia", value: record.agencia },
                { label: "Colonia", value: record.colonia },
                { label: "Calle", value: record.calle },
                { label: "M1", value: record.m1 || "-" },
                { label: "M2", value: record.m2 || "-" },
                { label: "M3", value: record.m3 || "-" },
                { label: "M4", value: record.m4 || "-" },
              ]}
            />

            <DetailSection title="Motivos detallados" fullWidth>
              <div className="detail-sections">
                {detailItems.map((item, index) => (
                  <DetailSection
                    key={item.id ?? `${item.claveOficial}-${index}`}
                    title={`Motivo ${index + 1}`}
                    items={[
                      { label: "Clave oficial", value: item.claveOficial },
                      { label: "Operativo", value: item.nombreOperativo },
                      { label: "Numero de parte", value: item.numeroParteInformativo || "-" },
                      { label: "Sitio de servicio publico", value: item.sitioServicioPublico || "-" },
                    ]}
                  />
                ))}
              </div>
            </DetailSection>

            <DetailSection
              title="Evidencia"
              items={[{ label: "Adjuntos", value: "No hay evidencia registrada en este folio." }]}
            />

            <DetailSection
              title="Observaciones"
              items={[
                {
                  label: "Servicio de grua",
                  value: record.situacionVehiculo === "VEHICULO_DETENIDO" ? record.servicioGrua || "-" : "No aplica",
                },
                {
                  label: "Patio / encierro",
                  value: record.situacionVehiculo === "VEHICULO_DETENIDO" ? record.encierro || "-" : "No aplica",
                },
              ]}
            />

            <DetailSection
              title="Historial"
              items={[
                {
                  label: "Capturado por",
                  value: record.createdBy
                    ? `${record.createdBy.nombre} ${record.createdBy.apellido} (${record.createdBy.username})`
                    : "-",
                },
                { label: "Rol del capturista", value: record.createdBy?.role || "-" },
                { label: "Estado actual", value: record.estatus },
              ]}
            />
          </div>

          <p>
            Solo los roles {UPDATE_ROLES.join(", ")} pueden editar. Contacta a un administrador si necesitas cambios.
          </p>
        </article>
      )}
    </section>
  );
}

export default InfraccionDetailPage;
