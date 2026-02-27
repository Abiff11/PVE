import { useEffect, useState } from 'react';

const ESTATUS_OPTIONS = [
  { label: 'Pendiente', value: 'PENDIENTE' },
  { label: 'Pagada', value: 'PAGADA' },
];

const DEFAULT_VALUES = {
  folio: '',
  nombreInfractor: '',
  nombreOficial: '',
  delegacion: '',
  detalleInfraccion: '',
  fecha: '',
  hora: '',
  monto: '',
  estatus: 'PENDIENTE',
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
  submitLabel = 'Guardar',
  showFolio = true,
  allowStatus = false,
}) {
  const [formData, setFormData] = useState(hydrateValues(initialValues));
  const [error, setError] = useState(null);

  useEffect(() => {
    setFormData(hydrateValues(initialValues));
  }, [initialValues]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Validación mínima alineada con los DTOs:
   * - Todos los campos de CreateInfraccionDto son obligatorios.
   * - Hora debe respetar formato HH:mm.
   * - Monto debe ser positivo.
   */
  const validate = () => {
    const requiredFields = [
      ...(showFolio ? ['folio'] : []),
      'nombreInfractor',
      'nombreOficial',
      'delegacion',
      'detalleInfraccion',
      'fecha',
      'hora',
      'monto',
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        return `El campo ${field} es obligatorio`;
      }
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.fecha)) {
      return 'La fecha debe tener formato YYYY-MM-DD';
    }

    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(formData.hora)) {
      return 'La hora debe tener formato HH:mm';
    }

    if (Number(formData.monto) <= 0) {
      return 'El monto debe ser mayor que cero';
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
          <input
            type="time"
            name="hora"
            value={formData.hora}
            onChange={updateField}
            disabled={submitting}
            required
          />
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

      {allowStatus && (
        <label>
          Estatus
          <select
            name="estatus"
            value={formData.estatus ?? 'PENDIENTE'}
            onChange={updateField}
            disabled={submitting}
          >
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
        {submitting ? 'Guardando...' : submitLabel}
      </button>
    </form>
  );
}

export default InfraccionForm;
