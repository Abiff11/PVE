import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ENCIERRO_OPTIONS, SERVICIO_GRUA_OPTIONS } from "../../catalogos";
import { encierrosService } from "../../services/encierros";

const WRITE_ROLES = ["admin", "encierro"];

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
      setError("No se encontró el folio para guardar el encierro");
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
      setLookupData((prev) =>
        prev
          ? {
              ...prev,
              registro: saved,
            }
          : prev,
      );
      hydrateFormFromLookup({
        ...lookupData,
        registro: saved,
      });
      setSuccessMessage(isUpdate ? "Encierro actualizado correctamente" : "Encierro registrado correctamente");
    } catch (err) {
      setError(err?.message ?? "No fue posible guardar el encierro");
    } finally {
      setSaving(false);
    }
  };

  const vehiculo = lookupData?.vehiculo ?? null;
  const registro = lookupData?.registro ?? null;
  const hasEgreso = Boolean(registro?.fechaLiberacion || registro?.fechaSalida || registro?.nombreQuienEntrega);

  if (loading) {
    return <p>Cargando encierro...</p>;
  }

  return (
    <section>
      <header className="section-header">
        <div>
          <h2>Detalle de encierro</h2>
          <p>Folio infracción {lookupData?.folioInfraccion ?? folio}</p>
        </div>
        <button type="button" onClick={() => navigate(`/infracciones/${folio}`)}>
          Volver a infracción
        </button>
      </header>

      {error ? <p className="error-text">{error}</p> : null}
      {successMessage ? <p className="success-text">{successMessage}</p> : null}

      {lookupData ? (
        <>
          <article className="detail-panel">
            <h3>Datos del folio</h3>
            <div className="table-wrapper">
              <table>
                <tbody>
                  <tr>
                    <th scope="row">Folio</th>
                    <td>{lookupData.folioInfraccion}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {vehiculo ? (
              <>
                <h4>Vehículo</h4>
                <div className="table-wrapper">
                  <table>
                    <tbody>
                      <tr>
                        <th scope="row">Placas</th>
                        <td>
                          {vehiculo.placas} ({vehiculo.estadoPlacas})
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">Marca / Modelo</th>
                        <td>
                          {vehiculo.marca} {vehiculo.modelo}
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">Tipo / Clase</th>
                        <td>
                          {vehiculo.tipo} / {vehiculo.clase}
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">Color</th>
                        <td>{vehiculo.color}</td>
                      </tr>
                      <tr>
                        <th scope="row">Serie / Motor</th>
                        <td>
                          {vehiculo.serie} / {vehiculo.motor}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            ) : null}
          </article>

          {registro ? (
            <>
              <article className="detail-panel">
                <h3>Ingreso</h3>
                <div className="table-wrapper">
                  <table>
                    <tbody>
                      <tr>
                        <th scope="row">Fecha ingreso</th>
                        <td>{registro.fechaIngreso}</td>
                      </tr>
                      <tr>
                        <th scope="row">Encierro</th>
                        <td>{registro.encierro}</td>
                      </tr>
                      <tr>
                        <th scope="row">Servicio de grúa</th>
                        <td>{registro.servicioGrua ?? "-"}</td>
                      </tr>
                      <tr>
                        <th scope="row">Nombre de quien recibe</th>
                        <td>{registro.nombreQuienRecibe}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </article>

              <article className="detail-panel">
                <h3>Egreso</h3>
                <div className="table-wrapper">
                  <table>
                    <tbody>
                      <tr>
                        <th scope="row">Fecha liberación</th>
                        <td>{registro.fechaLiberacion ?? "-"}</td>
                      </tr>
                      <tr>
                        <th scope="row">Fecha salida</th>
                        <td>{registro.fechaSalida ?? "-"}</td>
                      </tr>
                      <tr>
                        <th scope="row">Nombre de quien entrega</th>
                        <td>{registro.nombreQuienEntrega ?? "-"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {!hasEgreso ? <p className="hasEgreso">Aún no hay datos de egreso para este folio.</p> : null}
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
                    Servicio de grúa
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
                    Fecha liberación
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
            </>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

export default EncierroDetailPage;
