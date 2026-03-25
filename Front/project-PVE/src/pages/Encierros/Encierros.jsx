import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PaginationControls from "../../components/Table/PaginationControls";
import { useAuth } from "../../hooks/useAuth";
import { ENCIERRO_OPTIONS } from "../../catalogos";
import { encierrosService } from "../../services/encierros";

function getVehicleLabel(item) {
  const vehiculo = item.infraccion?.vehiculo;
  if (!vehiculo) {
    return item.encierro || "-";
  }

  return [vehiculo.marca, vehiculo.modelo, vehiculo.placas].filter(Boolean).join(" • ");
}

function getMotivoLabel(item) {
  return item.infraccion?.situacionVehiculo === "VEHICULO_DETENIDO"
    ? "Vehiculo detenido"
    : item.servicioGrua || item.encierro || "-";
}

function EncierrosPage() {
  const { token } = useAuth();
  const [filters, setFilters] = useState({
    folio: "",
    encierro: "",
    fechaInicio: "",
    fechaFin: "",
  });
  const [pageState, setPageState] = useState({
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async (page = pageState.page) => {
    setLoading(true);
    setError(null);
    try {
      const response = await encierrosService.list(
        {
          ...filters,
          page,
          pageSize: pageState.pageSize,
        },
        token,
      );
      setPageState({
        data: response.data,
        total: response.total,
        page: response.page,
        pageSize: response.pageSize,
      });
    } catch (err) {
      setError(err?.message ?? "No fue posible consultar encierros");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section>
      <p>Consulta por encierro, folio y rango de fechas.</p>

      <article className="detail-panel">
        <h3>Filtros</h3>
        <form
          className="filter-bar"
          onSubmit={(event) => {
            event.preventDefault();
            fetchData(1);
          }}
        >
          <label>
            Folio infraccion
            <input
              type="text"
              name="folio"
              value={filters.folio}
              onChange={handleFilterChange}
              placeholder="Ej. INF-001"
              autoComplete="off"
            />
          </label>
          <label>
            Encierro
            <select name="encierro" value={filters.encierro} onChange={handleFilterChange}>
              <option value="">Todos</option>
              {ENCIERRO_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            Fecha desde
            <input type="date" name="fechaInicio" value={filters.fechaInicio} onChange={handleFilterChange} />
          </label>
          <label>
            Fecha hasta
            <input type="date" name="fechaFin" value={filters.fechaFin} onChange={handleFilterChange} />
          </label>
          <button type="submit" disabled={loading} className="btn btn--primary">
            {loading ? "Buscando..." : "Aplicar filtros"}
          </button>
        </form>
      </article>

      {error ? <p className="error-text">{error}</p> : null}

      {loading ? (
        <p>Cargando registros...</p>
      ) : (
        <div className="table-wrapper table-wrapper--responsive">
          <table>
            <thead>
              <tr>
                <th style={{ width: "10%" }}>Folio</th>
                <th style={{ width: "13%" }}>Fecha de ingreso</th>
                <th style={{ width: "25%" }}>Vehiculo</th>
                <th style={{ width: "25%" }}>Motivo</th>
                <th style={{ width: "15%" }}>Estatus</th>
                <th style={{ width: "20%" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pageState.data.length === 0 ? (
                <tr>
                  <td colSpan={6}>No se encontraron encierros con los filtros actuales.</td>
                </tr>
              ) : (
                pageState.data.map((item) => {
                  const hasEgreso = Boolean(item.fechaLiberacion || item.fechaSalida || item.nombreQuienEntrega);
                  return (
                    <tr key={item.id}>
                      <td data-label="Folio">
                        <span className="cell-truncate">{item.folioInfraccion}</span>
                      </td>
                      <td data-label="Fecha de ingreso">
                        <span className="cell-truncate">{item.fechaIngreso}</span>
                      </td>
                      <td data-label="Vehiculo">
                        <span className="cell-truncate" style={{ whiteSpace: "normal" }}>
                          {getVehicleLabel(item)}
                        </span>
                      </td>
                      <td data-label="Motivo">
                        <span className="cell-truncate">{getMotivoLabel(item)}</span>
                      </td>
                      <td data-label="Estatus">
                        <span className={`status ${hasEgreso ? "status--pagada" : "status--pendiente"}`}>
                          {hasEgreso ? "Entregado" : "En resguardo"}
                        </span>
                      </td>
                      <td data-label="Accion" className="table-actions">
                        <Link to={`/encierros/${item.folioInfraccion}`} className="action-link">
                          Ver detalle
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      <PaginationControls
        page={pageState.page}
        pageSize={pageState.pageSize}
        total={pageState.total}
        onPageChange={(nextPage) => fetchData(nextPage)}
      />
    </section>
  );
}

export default EncierrosPage;
