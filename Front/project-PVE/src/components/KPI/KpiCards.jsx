/**
 * Despliega los principales indicadores recibidos desde /infracciones/kpis/resumen.
 * Recibe un objeto con totales ya calculados para mantener este componente presentacional.
 */
function KpiCards({ resumen }) {
  if (!resumen) {
    return null;
  }

  const { totalInfracciones, montoTotal, conteoPorEstatus, montoPorEstatus, topDelegaciones = [] } =
    resumen;

  return (
    <section className="kpi-grid">
      <article className="kpi-card">
        <h3>Total de infracciones</h3>
        <p className="kpi-value">{totalInfracciones ?? 0}</p>
      </article>

      <article className="kpi-card">
        <h3>Monto total recaudado</h3>
        <p className="kpi-value">
          ${Number(montoTotal ?? 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
        </p>
      </article>

      <article className="kpi-card">
        <h3>Conteo por estatus</h3>
        <ul>
          {Object.entries(conteoPorEstatus ?? {}).map(([estatus, total]) => (
            <li key={estatus}>
              {estatus}: {total}
            </li>
          ))}
        </ul>
      </article>

      <article className="kpi-card">
        <h3>Monto por estatus</h3>
        <ul>
          {Object.entries(montoPorEstatus ?? {}).map(([estatus, monto]) => (
            <li key={estatus}>
              {estatus}:{' '}
              {Number(monto ?? 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </li>
          ))}
        </ul>
      </article>

      <article className="kpi-card kpi-card--full">
        <h3>Top delegaciones</h3>
        <ol>
          {topDelegaciones.map((item) => (
            <li key={item.delegacion}>
              {item.delegacion} · {item.total} infracciones
            </li>
          ))}
        </ol>
      </article>
    </section>
  );
}

export default KpiCards;
