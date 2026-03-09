import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { infraccionesService } from "../../services/infracciones";
import KpiCards from "../../components/KPI/KpiCards";

const DASHBOARD_ROLES = ["admin", "director"];

function DashboardPage() {
  const { user, token, role } = useAuth();
  const canView = useMemo(() => DASHBOARD_ROLES.includes(role), [role]);

  const [filters, setFilters] = useState({
    fechaInicio: "",
    fechaFin: "",
    agencia: "",
  });
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const fetchKpis = async () => {
    if (!canView) return;

    setLoading(true);
    setError(null);

    try {
      const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([, value]) => Boolean(value)));

      const data = await infraccionesService.getKpis(cleanFilters, token);
      setResumen(data);
    } catch (err) {
      setError(err.message ?? "No fue posible obtener los KPIs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && canView) {
      fetchKpis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, canView]);

  if (!canView) {
    return (
      <section>
        <h2>Acceso restringido</h2>
        <p>Solo los roles administrador y director pueden visualizar el dashboard.</p>
      </section>
    );
  }

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
          <input type="date" name="fechaInicio" value={filters.fechaInicio} onChange={handleFilterChange} />
        </label>

        <label>
          Fecha fin
          <input type="date" name="fechaFin" value={filters.fechaFin} onChange={handleFilterChange} />
        </label>

        <label>
          Agencia
          <input
            type="text"
            name="agencia"
            value={filters.agencia}
            onChange={handleFilterChange}
            placeholder="Ej. Centro"
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Consultando..." : "Aplicar filtros"}
        </button>
      </form>

      {error ? <p className="error-text">{error}</p> : null}
      {loading ? <p>Cargando KPIs...</p> : <KpiCards resumen={resumen} />}
    </section>
  );
}

export default DashboardPage;
