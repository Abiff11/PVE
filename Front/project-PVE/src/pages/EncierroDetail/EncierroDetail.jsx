import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ENCIERRO_OPTIONS, SERVICIO_GRUA_OPTIONS } from "../../catalogos";
import { useAuth } from "../../hooks/useAuth";
import { encierrosService } from "../../services/encierros";

const WRITE_ROLES = ["admin", "encierro"];

function DetailField({ label, value }) {
  return (
    <div className="detail-field">
      <span className="detail-field__label">{label}</span>
      <p className="detail-field__value">{value || "-"}</p>
    </div>
  );
}

function DetailSection({ title, items, children, fullWidth = false }) {
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

function EncierroDetailPage() {
  const { folio } = useParams();
  const navigate = useNavigate();
  const { token, role } = useAuth();
  const canWrite = useMemo(() => WRITE_ROLES.includes(role), [role]);

  const [lookupData, setLookupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const [encierroForm, setEncierroForm] = useState({
    fechaIngreso: "",
    encierro: "",
    servicioGrua: "",
    nombreQuienRecibe: "",
    fechaLiberacion: "",
    fechaSalida: "",
    nombreQuienEntrega: "",
  });

  const hydrateFormFromLookup = (data) => {
    const registro = data?.registro ?? null;
    setEncierroForm({
      fechaIngreso: registro?.fechaIngreso ?? data?.fechaInfraccion ?? "",
      encierro: registro?.encierro ?? data?.encierro ?? "",
      servicioGrua: registro?.servicioGrua ?? data?.servicioGrua ?? "",
      nombreQuienRecibe: registro?.nombreQuienRecibe ?? "",
      fechaLiberacion: registro?.fechaLiberacion ?? "",
      fechaSalida: registro?.fechaSalida ?? "",
      nombreQuienEntrega: registro?.nombreQuienEntrega ?? "",
    });
  };

  useEffect(() => {
    const loadRecord = async () => {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      try {
        const data = await encierrosService.lookupByFolio(folio, token);
        setLookupData(data);
        hydrateFormFromLookup(data);
      } catch (err) {
        setLookupData(null);
        setError(err?.message ?? "No fue posible cargar el encierro solicitado");
      } finally {
        setLoading(false);
      }
    };

    loadRecord();
  }, [folio, token]);

  const handleEncierroChange = (event) => {
    const { name, value } = event.target;
    setEncierroForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!canWrite) {
      return;
    }

    if (!lookupData?.folioInfraccion) {
      setError("No se encontro el folio para guardar el encierro");
      return;
    }

    const requiredFields = ["fechaIngreso", "encierro", "nombreQuienRecibe"];
    const missing = requiredFields.find((field) => String(encierroForm[field] ?? "").trim() === "");
    if (missing) {
      setError("Completa los campos obligatorios para guardar");
      return;
    }

    const payload = {
      fechaIngreso: encierroForm.fechaIngreso,
      encierro: encierroForm.encierro,
      servicioGrua: encierroForm.servicioGrua.trim() === "" ? null : encierroForm.servicioGrua,
      nombreQuienRecibe: encierroForm.nombreQuienRecibe.trim(),
      fechaLiberacion: encierroForm.fechaLiberacion.trim() === "" ? null : encierroForm.fechaLiberacion,
      fechaSalida: encierroForm.fechaSalida.trim() === "" ? null : encierroForm.fechaSalida,
      nombreQuienEntrega: encierroForm.nombreQuienEntrega.trim() === "" ? null : encierroForm.nombreQuienEntrega.trim(),
    };

    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const folioInfraccion = lookupData.folioInfraccion;
      const isUpdate = Boolean(lookupData?.registro?.id);
      const response = isUpdate
        ? await encierrosService.update(folioInfraccion, payload, token)
        : await encierrosService.create({ folioInfraccion, ...payload }, token);

      const saved = response?.data ?? response;
      const nextLookup = {
        ...lookupData,
        registro: saved,
      };
      setLookupData(nextLookup);
      hydrateFormFromLookup(nextLookup);
      setSuccessMessage(isUpdate ? "Encierro actualizado correctamente" : "Encierro registrado correctamente");
    } catch (err) {
      setError(err?.message ?? "No fue posible guardar el encierro");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Cargando encierro...</p>;
  }

  if (!lookupData) {
    return error ? <p className="error-text">{error}</p> : null;
  }

  const vehiculo = lookupData.vehiculo;
  const registro = lookupData.registro;
  const dtoValues = {
    folioInfraccion: lookupData.folioInfraccion,
    fechaIngreso: registro?.fechaIngreso || lookupData.fechaInfraccion || "-",
    encierro: registro?.encierro || lookupData.encierro || "-",
    nombreQuienRecibe: registro?.nombreQuienRecibe || "-",
    servicioGrua: registro?.servicioGrua || lookupData.servicioGrua || "-",
    fechaLiberacion: registro?.fechaLiberacion || "-",
    fechaSalida: registro?.fechaSalida || "-",
    nombreQuienEntrega: registro?.nombreQuienEntrega || "-",
  };

  return (
    <section>
      <p>Folio infraccion {lookupData.folioInfraccion}</p>

      {error ? <p className="error-text">{error}</p> : null}
      {successMessage ? <p className="success-text">{successMessage}</p> : null}

      <article className="detail-panel">
        <h3>Informacion completa del encierro</h3>

        <div className="detail-sections">
          <DetailSection
            title="Datos del encierro"
            items={[
              { label: "Folio infraccion", value: dtoValues.folioInfraccion },
              { label: "Fecha ingreso", value: dtoValues.fechaIngreso },
              { label: "Encierro", value: dtoValues.encierro },
              { label: "Nombre de quien recibe", value: dtoValues.nombreQuienRecibe },
              { label: "Servicio de grua", value: dtoValues.servicioGrua },
              { label: "Fecha liberacion", value: dtoValues.fechaLiberacion },
              { label: "Fecha salida", value: dtoValues.fechaSalida },
              { label: "Nombre de quien entrega", value: dtoValues.nombreQuienEntrega },
            ]}
          />

          <DetailSection
            title="Informacion extra del vehiculo"
            items={[
              { label: "Servicio", value: vehiculo?.servicio },
              { label: "Clase", value: vehiculo?.clase },
              { label: "Tipo", value: vehiculo?.tipo },
              { label: "Marca", value: vehiculo?.marca },
              { label: "Modelo", value: vehiculo?.modelo },
              { label: "Color", value: vehiculo?.color },
              { label: "Placas", value: vehiculo?.placas },
              { label: "Estado de placas", value: vehiculo?.estadoPlacas },
              { label: "Serie", value: vehiculo?.serie },
              { label: "Motor", value: vehiculo?.motor },
            ]}
          />
        </div>
      </article>

      <article className="detail-panel">
        <h3>{registro ? "Actualizar encierro" : "Registrar encierro"}</h3>
        {!canWrite ? <p>Solo los roles encierro y admin pueden guardar cambios.</p> : null}

        <form className="filter-bar" onSubmit={handleSave}>
          <label>
            Fecha ingreso *
            <input
              type="date"
              name="fechaIngreso"
              value={encierroForm.fechaIngreso}
              onChange={handleEncierroChange}
              disabled={!canWrite || saving}
            />
          </label>
          <label>
            Encierro *
            <select
              name="encierro"
              value={encierroForm.encierro}
              onChange={handleEncierroChange}
              disabled={!canWrite || saving}
            >
              <option value="">Selecciona...</option>
              {ENCIERRO_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            Servicio de grua
            <select
              name="servicioGrua"
              value={encierroForm.servicioGrua}
              onChange={handleEncierroChange}
              disabled={!canWrite || saving}
            >
              <option value="">Selecciona...</option>
              {SERVICIO_GRUA_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            Nombre de quien recibe *
            <input
              type="text"
              name="nombreQuienRecibe"
              value={encierroForm.nombreQuienRecibe}
              onChange={handleEncierroChange}
              placeholder="Ej. Juan Perez"
              autoComplete="off"
              disabled={!canWrite || saving}
            />
          </label>
          <label>
            Fecha liberacion
            <input
              type="date"
              name="fechaLiberacion"
              value={encierroForm.fechaLiberacion}
              onChange={handleEncierroChange}
              disabled={!canWrite || saving}
            />
          </label>
          <label>
            Fecha salida
            <input
              type="date"
              name="fechaSalida"
              value={encierroForm.fechaSalida}
              onChange={handleEncierroChange}
              disabled={!canWrite || saving}
            />
          </label>
          <label>
            Nombre de quien entrega
            <input
              type="text"
              name="nombreQuienEntrega"
              value={encierroForm.nombreQuienEntrega}
              onChange={handleEncierroChange}
              placeholder="Ej. Juan Perez"
              autoComplete="off"
              disabled={!canWrite || saving}
            />
          </label>
          <button type="submit" disabled={!canWrite || saving}>
            {saving ? "Guardando..." : registro ? "Guardar cambios" : "Registrar"}
          </button>
        </form>
      </article>
    </section>
  );
}

export default EncierroDetailPage;
