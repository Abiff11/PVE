import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { fetchBitacora } from '../../services/bitacora';
import PaginationControls from '../../components/Table/PaginationControls';

/**
 * Vista de auditoría: muestra los eventos registrados en la bitácora solo para admin.
 */
function BitacoraPage() {
  const { token } = useAuth();
  const [filters, setFilters] = useState({ action: '', username: '' });
  const [pageInfo, setPageInfo] = useState({
    data: [],
    total: 0,
    page: 1,
    pageSize: 20,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Consulta la bitácora en el backend aplicando filtros y paginación.
   */
  const loadData = async (page = pageInfo.page) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchBitacora(
        {
          ...filters,
          page,
          pageSize: pageInfo.pageSize,
        },
        token,
      );
      setPageInfo({
        data: response.data,
        total: response.total,
        page: response.page,
        pageSize: response.pageSize,
      });
    } catch (err) {
      setError(err.message ?? 'No fue posible cargar la bitácora');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  /**
   * Sincroniza los filtros locales con los inputs controlados.
   */
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section>
      <header className="section-header">
        <div>
          <h2>Bitácora del sistema</h2>
          <p>Consulta los movimientos realizados por los usuarios.</p>
        </div>
      </header>

      <form
        className="filter-bar"
        onSubmit={(event) => {
          event.preventDefault();
          loadData(1);
        }}
      >
        <label>
          Acción
          <input
            type="text"
            name="action"
            value={filters.action}
            onChange={handleFilterChange}
            placeholder="Ej. USER_CREATED"
          />
        </label>
        <label>
          Usuario
          <input
            type="text"
            name="username"
            value={filters.username}
            onChange={handleFilterChange}
            placeholder="admin"
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Buscando...' : 'Filtrar'}
        </button>
      </form>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Acción</th>
              <th>Usuario</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            {pageInfo.data.length === 0 ? (
              <tr>
                <td colSpan={4}>No hay registros que coincidan.</td>
              </tr>
            ) : (
              pageInfo.data.map((entry) => (
                <tr key={entry.id}>
                  <td>{new Date(entry.createdAt).toLocaleString()}</td>
                  <td>{entry.action}</td>
                  <td>{entry.username ?? 'N/D'}</td>
                  <td>{entry.description}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PaginationControls
        page={pageInfo.page}
        pageSize={pageInfo.pageSize}
        total={pageInfo.total}
        onPageChange={(next) => loadData(next)}
      />
    </section>
  );
}

export default BitacoraPage;
