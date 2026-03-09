import { useEffect, useState } from "react";
import { DEFAULT_ENCIERRO, DEFAULT_SERVICIO_GRUA, ENCIERRO_OPTIONS, SERVICIO_GRUA_OPTIONS } from "../../catalogos";

const ESTATUS_OPTIONS = [
  { label: "Pendiente", value: "PENDIENTE" },
  { label: "Pagada", value: "PAGADA" },
];

const SITUACION_OPTIONS = [
  { label: "Vehículo detenido", value: "VEHICULO_DETENIDO" },
  { label: "Solo infracción", value: "SOLO_INFRACCION" },
];

const DEFAULT_VALUES = {
  folioInfraccion: "",
  encierro: DEFAULT_ENCIERRO,
  servicioGrua: DEFAULT_SERVICIO_GRUA,
  fecha: "",
  hora: "",
  monto: 0,
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
  estatus: "PENDIENTE",
};

const hydrateValues = (values = {}) => ({
  ...DEFAULT_VALUES,
  ...values,
});

function InfraccionForm({
  initialValues,
  onSubmit,
  submitting = false,
  submitLabel = "Guardar",
  showFolio = true,
  allowStatus = false,
}) {
  const [formData, setFormData] = useState(hydrateValues(initialValues));
  const [error, setError] = useState(null);

  const isSoloInfraccion = formData.situacionVehiculo === "SOLO_INFRACCION";

  useEffect(() => {
    setFormData(hydrateValues(initialValues));
  }, [initialValues]);

  useEffect(() => {
    if (!isSoloInfraccion) return;

    // When it's a solo infracción, force encierro/grúa back to defaults and prevent editing.
    setFormData((prev) => ({
      ...prev,
      encierro: DEFAULT_ENCIERRO,
      servicioGrua: DEFAULT_SERVICIO_GRUA,
    }));
  }, [isSoloInfraccion]);

  const updateField = (event) => {
    const { name, type, value, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validate = () => {
    const requiredFields = [
      ...(showFolio ? ["folioInfraccion"] : []),
      "fecha",
      "hora",
      "nombreInfractor",
      "genero",
      "numeroLicencia",
      "servicio",
      "clase",
      "tipo",
      "marca",
      "modelo",
      "color",
      "placas",
      "estadoPlacas",
      "serie",
      "motor",
      "municipio",
      "agencia",
      "colonia",
      "calle",
      "situacionVehiculo",
      "claveOficial",
      "nombreOperativo",
    ];

    for (const field of requiredFields) {
      if (!formData[field] || formData[field].trim?.() === "") {
        return `El campo ${field} es obligatorio`;
      }
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.fecha)) {
      return "La fecha debe tener formato YYYY-MM-DD";
    }

    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(formData.hora)) {
      return "La hora debe tener formato HH:mm";
    }

    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);

    const payload = { ...formData };
    if (!allowStatus) {
      delete payload.estatus;
      delete payload.monto;
    }

    if (payload.monto === "") {
      delete payload.monto;
    } else if (payload.monto !== undefined) {
      payload.monto = Number(payload.monto);
    }

    Object.keys(payload).forEach((key) => {
      if (typeof payload[key] === "string" && payload[key].trim() === "") {
        delete payload[key];
      }
    });

    await onSubmit(payload);
  };

  return (
    <form className="infraccion-form" onSubmit={handleSubmit}>
      {showFolio && (
        <label>
          Folio infracción
          <input
            type="text"
            name="folioInfraccion"
            value={formData.folioInfraccion}
            onChange={updateField}
            disabled={submitting}
            required
          />
        </label>
      )}

      <div className="form-grid">
        <label>
          Fecha
          <input
            type="date"
            name="fecha"
            value={formData.fecha}
            onChange={updateField}
            disabled={submitting}
            required
          />
        </label>

        <label>
          Hora
          <input type="time" name="hora" value={formData.hora} onChange={updateField} disabled={submitting} required />
        </label>
      </div>

      <label>
        Nombre infractor
        <input
          type="text"
          name="nombreInfractor"
          value={formData.nombreInfractor}
          onChange={updateField}
          disabled={submitting}
          required
        />
      </label>

      <div className="form-grid">
        <label>
          Género
          <input
            type="text"
            name="genero"
            value={formData.genero}
            onChange={updateField}
            disabled={submitting}
            required
          />
        </label>
        <label>
          No. licencia
          <input
            type="text"
            name="numeroLicencia"
            value={formData.numeroLicencia}
            onChange={updateField}
            disabled={submitting}
            required
          />
        </label>
      </div>

      <div className="form-grid">
        <label>
          Servicio
          <input
            type="text"
            name="servicio"
            value={formData.servicio}
            onChange={updateField}
            disabled={submitting}
            required
          />
        </label>
        <label>
          Sitio (si es servicio público)
          <input
            type="text"
            name="sitioServicioPublico"
            value={formData.sitioServicioPublico}
            onChange={updateField}
            disabled={submitting}
          />
        </label>
      </div>

      <div className="form-grid">
        <label>
          Clase
          <input
            type="text"
            name="clase"
            value={formData.clase}
            onChange={updateField}
            disabled={submitting}
            required
          />
        </label>
        <label>
          Tipo
          <input type="text" name="tipo" value={formData.tipo} onChange={updateField} disabled={submitting} required />
        </label>
      </div>

      <div className="form-grid">
        <label>
          Marca
          <input
            type="text"
            name="marca"
            value={formData.marca}
            onChange={updateField}
            disabled={submitting}
            required
          />
        </label>
        <label>
          Modelo
          <input
            type="text"
            name="modelo"
            value={formData.modelo}
            onChange={updateField}
            disabled={submitting}
            required
          />
        </label>
      </div>

      <div className="form-grid">
        <label>
          Color
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={updateField}
            disabled={submitting}
            required
          />
        </label>
        <label>
          Placas
          <input
            type="text"
            name="placas"
            value={formData.placas}
            onChange={updateField}
            disabled={submitting}
            required
          />
        </label>
      </div>

      <div className="form-grid">
        <label>
          Estado
          <input
            type="text"
            name="estadoPlacas"
            value={formData.estadoPlacas}
            onChange={updateField}
            disabled={submitting}
            required
          />
        </label>
        <label>
          Serie
          <input
            type="text"
            name="serie"
            value={formData.serie}
            onChange={updateField}
            disabled={submitting}
            required
          />
        </label>
      </div>

      <label>
        Motor
        <input type="text" name="motor" value={formData.motor} onChange={updateField} disabled={submitting} required />
      </label>

      <div className="form-grid">
        <label>
          Municipio
          <input
            type="text"
            name="municipio"
            value={formData.municipio}
            onChange={updateField}
            disabled={submitting}
            required
          />
        </label>
        <label>
          Agencia
          <input
            type="text"
            name="agencia"
            value={formData.agencia}
            onChange={updateField}
            disabled={submitting}
            required
          />
        </label>
      </div>

      <div className="form-grid">
        <label>
          Colonia
          <input
            type="text"
            name="colonia"
            value={formData.colonia}
            onChange={updateField}
            disabled={submitting}
            required
          />
        </label>
        <label>
          Calle
          <input
            type="text"
            name="calle"
            value={formData.calle}
            onChange={updateField}
            disabled={submitting}
            required
          />
        </label>
      </div>

      <div className="form-grid">
        <label>
          M1
          <input type="text" name="m1" value={formData.m1} onChange={updateField} disabled={submitting} />
        </label>
        <label>
          M2
          <input type="text" name="m2" value={formData.m2} onChange={updateField} disabled={submitting} />
        </label>
        <label>
          M3
          <input type="text" name="m3" value={formData.m3} onChange={updateField} disabled={submitting} />
        </label>
        <label>
          M4
          <input type="text" name="m4" value={formData.m4} onChange={updateField} disabled={submitting} />
        </label>
      </div>

      <label>
        Vehículo detenido o solo infracción
        <select
          name="situacionVehiculo"
          value={formData.situacionVehiculo}
          onChange={updateField}
          disabled={submitting}
          required
        >
          {SITUACION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="form-grid">
        {isSoloInfraccion ? (
          <>
            <label>
              Encierro (Nombre)
              <input type="text" value="No aplica" disabled />
            </label>
            <label>
              Servicio grúa (Nombre)
              <input type="text" value="No aplica" disabled />
            </label>
          </>
        ) : (
          <>
            <label>
              Encierro (Nombre)
              <select name="encierro" value={formData.encierro} onChange={updateField} disabled={submitting}>
                {ENCIERRO_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Servicio grúa (Nombre)
              <select name="servicioGrua" value={formData.servicioGrua} onChange={updateField} disabled={submitting}>
                {SERVICIO_GRUA_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
      </div>

      <div className="form-grid">
        <label>
          Clave del oficial
          <input
            type="text"
            name="claveOficial"
            value={formData.claveOficial}
            onChange={updateField}
            disabled={submitting}
            required
          />
        </label>
        <label>
          No. parte informativo
          <input
            type="text"
            name="numeroParteInformativo"
            value={formData.numeroParteInformativo}
            onChange={updateField}
            disabled={submitting}
          />
        </label>
      </div>

      <label>
        Nombre operativo
        <input
          type="text"
          name="nombreOperativo"
          value={formData.nombreOperativo}
          onChange={updateField}
          disabled={submitting}
          required
        />
      </label>

      {allowStatus && (
        <label>
          Monto ($)
          <input
            type="number"
            name="monto"
            value={formData.monto ?? 0}
            onChange={updateField}
            disabled={submitting}
            min="0"
            step="0.01"
          />
        </label>
      )}

      {allowStatus && (
        <label>
          Estatus
          <select name="estatus" value={formData.estatus ?? "PENDIENTE"} onChange={updateField} disabled={submitting}>
            {ESTATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      )}

      {error ? <p className="error-text">{error}</p> : null}

      <button type="submit" disabled={submitting}>
        {submitting ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
}

export default InfraccionForm;
