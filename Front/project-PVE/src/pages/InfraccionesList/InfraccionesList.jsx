import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PaginationControls from "../../components/Table/PaginationControls";
import { useAuth } from "../../hooks/useAuth";
import { infraccionesService } from "../../services/infracciones";

function formatErrorMessage(error) {
  const rawMessage = error?.details?.message ?? error?.message ?? "Ocurrio un error inesperado";
  const messages = Array.isArray(rawMessage) ? rawMessage : [rawMessage];
  return messages.filter(Boolean).join(" • ") || "Ocurrio un error inesperado";
}

function getMotivoLabel(item) {
  return item.situacionVehiculo === "VEHICULO_DETENIDO" ? "Vehiculo detenido" : "Solo infraccion";
}

function InfraccionesListPage() {
  const { token } = useAuth();
  const [filters, setFilters] = useState({
    folio: "",
    municipio: "",
    claveOficial: "",
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
      const response = await infraccionesService.list(
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
      setError(formatErrorMessage(err));
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
      <p>Consulta, filtra y navega entre los folios registrados.</p>

      <form
        className="filter-bar"
        onSubmit={(event) => {
          event.preventDefault();
          fetchData(1);
        }}
      >
        <label>
          Folio
          <input type="text" name="folio" value={filters.folio} onChange={handleFilterChange} />
        </label>
        <label>
          Municipio
          <input type="text" name="municipio" value={filters.municipio} onChange={handleFilterChange} />
        </label>
        <label>
          Clave oficial
          <input type="text" name="claveOficial" value={filters.claveOficial} onChange={handleFilterChange} />
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

      {error ? <p className="error-text">{error}</p> : null}
      {loading ? (
        <p>Cargando registros...</p>
      ) : (
        <div className="table-wrapper table-wrapper--responsive">
          <table>
            <thead>
              <tr>
                <th style={{ width: "140px" }}>Folio</th>
                <th>Fecha y hora</th>
                <th style={{ width: "200px" }}>Infractor</th>
                <th>Placas</th>
                <th style={{ width: "250px" }}>Situación</th>
                <th style={{ width: "130px" }}>Estatus</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pageState.data.length === 0 ? (
                <tr>
                  <td colSpan={6}>No se encontraron registros con los filtros actuales.</td>
                </tr>
              ) : (
                pageState.data.map((item) => (
                  <tr key={item.id}>
                    <td data-label="Folio">
                      <span className="cell-truncate">{item.folioInfraccion}</span>
                    </td>
                    <td data-label="Fecha y hora">
                      <span className="cell-truncate">{new Date(item.fecha).toLocaleString()}</span>
                    </td>
                    <td data-label="Infractor">
                      <span className="cell-truncate">{item.nombreInfractor || "-"}</span>
                    </td>
                    <td data-label="Placas">
                      <span className="cell-truncate">{item.placas}</span>
                    </td>
                    <td data-label="Situación">
                      <span className="cell-truncate">{getMotivoLabel(item)}</span>
                    </td>
                    <td data-label="Estatus">
                      <span className={`status status--${item.estatus?.toLowerCase()}`}>
                        {item.estatus === "PAGADA" ? "Pagada" : "Pendiente"}
                      </span>
                    </td>
                    <td data-label="Accion" className="table-actions">
                      <Link to={`/infracciones/${item.folioInfraccion}`} className="action-link">
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))
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

export default InfraccionesListPage;
