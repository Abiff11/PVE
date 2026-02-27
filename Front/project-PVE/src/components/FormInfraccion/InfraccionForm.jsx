import { useEffect, useState } from "react";

const ESTATUS_OPTIONS = [
  { label: "Pendiente", value: "PENDIENTE" },
  { label: "Pagada", value: "PAGADA" },
];

const DEFAULT_VALUES = {
  folio: "",
  nombreInfractor: "",
  nombreOficial: "",
  delegacion: "",
  detalleInfraccion: "",
  fecha: "",
  hora: "",
  monto: "",
  estatus: "PENDIENTE",
  // Nuevos campos
  vehiculo: "",
  placas: "",
  servicio: "",
  vehiculoDetenido: 0,
  motocicletaDetenida: 0,
  consignacionVehiculo: 0,
  consignacionMotocicleta: 0,
  soloInfraccion: true,
};

const hydrateValues = (values = {}) => ({
  ...DEFAULT_VALUES,
  ...values,
});

/**
 * Formularios de creación/edición comparten este componente.
 * Controla inputs, validaciones básicas y delega el envío al callback recibido.
 */
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

  useEffect(() => {
    setFormData(hydrateValues(initialValues));
  }, [initialValues]);

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;

    let newValue;
    if (type === "checkbox") {
      // soloInfraccion es boolean en el backend (true/false),
      // mientras que los campos de detención/consignación son enteros (0/1).
      // Los tratamos de forma diferente para mantener coherencia de tipos.
      if (name === "soloInfraccion") {
        newValue = checked; // boolean: true o false
      } else {
        newValue = checked ? 1 : 0; // entero: 1 o 0
      }
    } else {
      newValue = value;
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  /**
   * Validación mínima alineada con los DTOs:
   * - Todos los campos obligatorios.
   * - Hora debe respetar formato HH:mm.
   * - Monto debe ser positivo.
   * - Los campos numéricos (vehiculoDetenido, etc.) deben ser >= 0.
   */
  const validate = () => {
    const requiredFields = [
      ...(showFolio ? ["folio"] : []),
      "nombreInfractor",
      "nombreOficial",
      "delegacion",
      "detalleInfraccion",
      "fecha",
      "hora",
      "monto",
      // Nuevos campos de texto obligatorios
      "vehiculo",
      "placas",
      "servicio",
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

    if (Number(formData.monto) <= 0) {
      return "El monto debe ser mayor que cero";
    }

    // Validar que los campos numéricos no sean negativos
    const numericFields = [
      "vehiculoDetenido",
      "motocicletaDetenida",
      "consignacionVehiculo",
      "consignacionMotocicleta",
    ];
    for (const field of numericFields) {
      if (formData[field] < 0) {
        return `El campo ${field} no puede ser negativo`;
      }
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
    const payload = {
      ...formData,
      monto: Number(formData.monto),
      // Los campos de detención/consignación son enteros en el backend (0 o 1)
      vehiculoDetenido: Number(formData.vehiculoDetenido),
      motocicletaDetenida: Number(formData.motocicletaDetenida),
      consignacionVehiculo: Number(formData.consignacionVehiculo),
      consignacionMotocicleta: Number(formData.consignacionMotocicleta),
      // soloInfraccion es boolean en el backend: Boolean(0) === false, Boolean(1) === true
      soloInfraccion: Boolean(formData.soloInfraccion),
    };

    if (!allowStatus) {
      delete payload.estatus;
    }

    await onSubmit(payload);
  };

  return (
    <form className="infraccion-form" onSubmit={handleSubmit}>
      {showFolio && (
        <label>
          Folio
          <input
            type="text"
            name="folio"
            value={formData.folio}
            onChange={updateField}
            disabled={submitting}
            required
          />
        </label>
      )}

      <label>
        Nombre del infractor
        <input
          type="text"
          name="nombreInfractor"
          value={formData.nombreInfractor}
          onChange={updateField}
          disabled={submitting}
          required
        />
      </label>

      <label>
        Nombre del oficial
        <input
          type="text"
          name="nombreOficial"
          value={formData.nombreOficial}
          onChange={updateField}
          disabled={submitting}
          required
        />
      </label>

      <label>
        Delegación
        <input
          type="text"
          name="delegacion"
          value={formData.delegacion}
          onChange={updateField}
          disabled={submitting}
          required
        />
      </label>

      <label>
        Detalle
        <textarea
          name="detalleInfraccion"
          value={formData.detalleInfraccion}
          onChange={updateField}
          disabled={submitting}
          required
        />
      </label>

      <div className="form-grid">
        <label>
          Fecha (YYYY-MM-DD)
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
          Hora (HH:mm)
          <input type="time" name="hora" value={formData.hora} onChange={updateField} disabled={submitting} required />
        </label>

        <label>
          Monto
          <input
            type="number"
            name="monto"
            value={formData.monto}
            onChange={updateField}
            disabled={submitting}
            min="0"
            step="0.01"
            required
          />
        </label>
      </div>

      {/* Nuevos campos */}
      <label>
        Vehículo
        <input
          type="text"
          name="vehiculo"
          value={formData.vehiculo}
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

      <div className="checkbox-group">
        <label>
          <input
            type="checkbox"
            name="vehiculoDetenido"
            checked={formData.vehiculoDetenido === 1}
            onChange={updateField}
            disabled={submitting}
          />
          Vehículo detenido
        </label>

        <label>
          <input
            type="checkbox"
            name="motocicletaDetenida"
            checked={formData.motocicletaDetenida === 1}
            onChange={updateField}
            disabled={submitting}
          />
          Motocicleta detenida
        </label>

        <label>
          <input
            type="checkbox"
            name="consignacionVehiculo"
            checked={formData.consignacionVehiculo === 1}
            onChange={updateField}
            disabled={submitting}
          />
          Consignación de vehículo
        </label>

        <label>
          <input
            type="checkbox"
            name="consignacionMotocicleta"
            checked={formData.consignacionMotocicleta === 1}
            onChange={updateField}
            disabled={submitting}
          />
          Consignación de motocicleta
        </label>

        <label>
          <input
            type="checkbox"
            name="soloInfraccion"
            checked={formData.soloInfraccion === true}
            onChange={updateField}
            disabled={submitting}
          />
          Solo infracción (sin consignación)
        </label>
      </div>

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
