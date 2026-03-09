import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import PaginationControls from "../../components/Table/PaginationControls";
import { encierrosService } from "../../services/encierros";
import { ENCIERRO_OPTIONS } from "../../catalogos";

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
      <header className="section-header">
        <div>
          <h2>Encierros</h2>
          <p>Consulta por encierro, folio y rango de fechas.</p>
        </div>
      </header>

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
            Folio infracción
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
          <button type="submit" disabled={loading}>
            {loading ? "Buscando..." : "Aplicar filtros"}
          </button>
        </form>
      </article>

      {error ? <p className="error-text">{error}</p> : null}

      {loading ? (
        <p>Cargando registros...</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Folio</th>
                <th>Fecha ingreso</th>
                <th>Encierro</th>
                <th>Grua</th>
                <th>Recibe</th>
                <th>Entrega</th>
                <th>Status</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pageState.data.length === 0 ? (
                <tr>
                  <td colSpan={8}>No se encontraron encierros con los filtros actuales.</td>
                </tr>
              ) : (
                pageState.data.map((item) => {
                  const hasEgreso = Boolean(item.fechaLiberacion || item.fechaSalida || item.nombreQuienEntrega);
                  return (
                    <tr key={item.id}>
                      <td>{item.folioInfraccion}</td>
                      <td>{item.fechaIngreso}</td>
                      <td>{item.encierro}</td>
                      <td>{item.servicioGrua ?? "-"}</td>
                      <td>{item.nombreQuienRecibe}</td>
                      <td>{item.nombreQuienEntrega ?? "-"}</td>
                      <td>{hasEgreso ? "Entregado" : "En resguardo"}</td>
                      <td>
                        <Link to={`/encierros/${item.folioInfraccion}`}>Ver detalle</Link>
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
