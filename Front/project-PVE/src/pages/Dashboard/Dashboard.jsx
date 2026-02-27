import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { infraccionesService } from '../../services/infracciones';
import KpiCards from '../../components/KPI/KpiCards';

/**
 * Dashboard que consume el endpoint de KPIs y muestra filtros opcionales.
 */
function DashboardPage() {
  const { user, token } = useAuth();
  const [filters, setFilters] = useState({
    fechaInicio: '',
    fechaFin: '',
    delegacion: '',
  });
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Permite editar los filtros desde los inputs controlados.
   */
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Consume el endpoint de KPIs aplicando los filtros activos.
   */
  const fetchKpis = async () => {
    setLoading(true);
    setError(null);
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => Boolean(value)),
      );
      const data = await infraccionesService.getKpis(cleanFilters, token);
      setResumen(data);
    } catch (err) {
      setError(err.message ?? 'No fue posible obtener los KPIs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKpis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <section>
      <header>
        <h2>Dashboard de infracciones</h2>
        <p>Bienvenido {user?.username}. Ajusta los filtros para analizar los datos.</p>
      </header>

      <form
        className="filter-bar"
        onSubmit={(event) => {
          event.preventDefault();
          fetchKpis();
        }}
      >
        <label>
          Fecha inicio
          <input
            type="date"
            name="fechaInicio"
            value={filters.fechaInicio}
            onChange={handleFilterChange}
          />
        </label>
        <label>
          Fecha fin
          <input
            type="date"
            name="fechaFin"
            value={filters.fechaFin}
            onChange={handleFilterChange}
          />
        </label>
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
        <button type="submit" disabled={loading}>
          {loading ? 'Consultando...' : 'Aplicar filtros'}
        </button>
      </form>

      {error ? <p className="error-text">{error}</p> : null}
      {loading ? <p>Cargando KPIs...</p> : <KpiCards resumen={resumen} />}
    </section>
  );
}

export default DashboardPage;
