import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { infraccionesService } from "../../services/infracciones";
import { useAuth } from "../../hooks/useAuth";
import PaginationControls from "../../components/Table/PaginationControls";

function formatErrorMessage(error) {
  const rawMessage = error?.details?.message ?? error?.message ?? "Ocurrió un error inesperado";
  const messages = Array.isArray(rawMessage) ? rawMessage : [rawMessage];
  return messages.filter(Boolean).join(" • ") || "Ocurrió un error inesperado";
}

function InfraccionesListPage() {
  const navigate = useNavigate();
  const { token, role } = useAuth();
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
      <header className="section-header">
        <div>
          <h2>Listado de infracciones</h2>
          <p>Consulta, filtra y navega entre los folios registrados.</p>
        </div>
      </header>

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
        <button type="submit" disabled={loading}>
          {loading ? "Buscando..." : "Aplicar filtros"}
        </button>
      </form>

      {error ? <p className="error-text">{error}</p> : null}
      {loading ? (
        <p>Cargando registros...</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Folio</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Encierro</th>
                <th>Infractor</th>
                <th>Placas</th>
                <th>Servicio</th>
                <th>Municipio</th>
                <th>Agencia</th>
                <th>Clave oficial</th>
                <th>Situación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pageState.data.length === 0 ? (
                <tr>
                  <td colSpan={12}>No se encontraron registros con los filtros actuales.</td>
                </tr>
              ) : (
                pageState.data.map((item) => (
                  <tr key={item.id}>
                    <td>{item.folioInfraccion}</td>
                    <td>{item.fecha}</td>
                    <td>{item.hora?.slice?.(0, 5) ?? item.hora}</td>
                    <td>{item.situacionVehiculo === "SOLO_INFRACCION" ? "No aplica" : item.encierro}</td>
                    <td>{item.nombreInfractor}</td>
                    <td>{item.placas}</td>
                    <td>{item.servicio}</td>
                    <td>{item.municipio}</td>
                    <td>{item.agencia}</td>
                    <td>{item.claveOficial}</td>
                    <td>{item.situacionVehiculo === "VEHICULO_DETENIDO" ? "Vehículo detenido" : "Solo infracción"}</td>
                    <td>
                      <Link to={`/infracciones/${item.folioInfraccion}`}>Ver detalle</Link>
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
