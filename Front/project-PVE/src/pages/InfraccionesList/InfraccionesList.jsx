import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { infraccionesService } from '../../services/infracciones';
import { useAuth } from '../../hooks/useAuth';
import PaginationControls from '../../components/Table/PaginationControls';

const CREATE_ROLES = ['admin', 'capturista'];

/**
 * Mapea los mensajes de error del backend a textos más amigables para la UI.
 */
function formatErrorMessage(error) {
  const rawMessage = error?.details?.message ?? error?.message ?? 'Ocurrió un error inesperado';
  const messages = Array.isArray(rawMessage) ? rawMessage : [rawMessage];

  const friendly = messages
    .filter(Boolean)
    .map((msg) => {
      if (typeof msg !== 'string') {
        return msg;
      }
      const normalized = msg.toLowerCase();
      if (normalized.includes('fecha') && normalized.includes('must match')) {
        return 'La fecha debe tener el formato AAAA-MM-DD (por ejemplo 2026-02-26).';
      }
      if (normalized.includes('fechainicio')) {
        if (normalized.includes('mayor a')) {
          return 'La fecha inicial no puede ser mayor que la fecha final.';
        }
        return 'La fecha inicial debe tener el formato AAAA-MM-DD.';
      }
      if (normalized.includes('fechafin')) {
        return 'La fecha final debe tener el formato AAAA-MM-DD.';
      }
      return msg;
    })
    .join(' • ');

  return friendly || 'Ocurrió un error inesperado';
}

/**
 * Tabla paginada conectada al endpoint GET /infracciones.
 */
function InfraccionesListPage() {
  const navigate = useNavigate();
  const { token, role } = useAuth();
  const [filters, setFilters] = useState({
    delegacion: '',
    nombreOficial: '',
    fechaInicio: '',
    fechaFin: '',
  });
  const [pageState, setPageState] = useState({
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Llama al backend con los filtros actuales y actualiza la tabla.
   */
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

  /**
   * Controla los inputs de filtros para reflejarlos en el estado local.
   */
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
        {CREATE_ROLES.includes(role) && (
          <button type="button" onClick={() => navigate('/infracciones/nueva')}>
            Registrar infracción
          </button>
        )}
      </header>

      <form
        className="filter-bar"
        onSubmit={(event) => {
          event.preventDefault();
          fetchData(1);
        }}
      >
        <label>
          Delegación
          <input
            type="text"
            name="delegacion"
            value={filters.delegacion}
            onChange={handleFilterChange}
            placeholder="Ej. Alcoholimetro"
          />
        </label>
        <label>
          Nombre oficial
          <input
            type="text"
            name="nombreOficial"
            value={filters.nombreOficial}
            onChange={handleFilterChange}
          />
        </label>
        <label>
          Fecha desde
          <input
            type="date"
            name="fechaInicio"
            value={filters.fechaInicio}
            onChange={handleFilterChange}
          />
        </label>
        <label>
          Fecha hasta
          <input
            type="date"
            name="fechaFin"
            value={filters.fechaFin}
            onChange={handleFilterChange}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Buscando...' : 'Aplicar filtros'}
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
                <th>Infractor</th>
                <th>Oficial</th>
                <th>Delegación</th>
                <th>Fecha/Hora</th>
                <th>Monto</th>
                <th>Estatus</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pageState.data.length === 0 ? (
                <tr>
                  <td colSpan={8}>No se encontraron registros con los filtros actuales.</td>
                </tr>
              ) : (
                pageState.data.map((item) => (
                  <tr key={item.id}>
                    <td>{item.folio}</td>
                    <td>{item.nombreInfractor}</td>
                    <td>{item.nombreOficial}</td>
                    <td>{item.delegacion}</td>
                    <td>{new Date(item.fechaHora).toLocaleString()}</td>
                    <td>${Number(item.monto).toLocaleString('es-MX')}</td>
                    <td>{item.estatus}</td>
                    <td>
                      <Link to={`/infracciones/${item.folio}`}>Ver detalle</Link>
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
