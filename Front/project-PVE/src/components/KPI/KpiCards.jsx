function KpiCards({ resumen }) {
  if (!resumen) {
    return null;
  }

  const {
    totalInfracciones,
    montoTotal,
    conteoPorEstatus,
    montoPorEstatus,
    topDelegaciones,
    topAgencias,
    vehiculosEnResguardo,
    usuariosPorRol,
    usuariosPorDelegacion,
  } = resumen;

  const top = topAgencias ?? topDelegaciones ?? [];

  return (
    <section className="kpi-grid">
      <section className="kpi-section">
        <h2>Infracciones</h2>
        <article className="kpi-card">
          <h3>Total de infracciones</h3>
          <p className="kpi-value">{totalInfracciones ?? 0}</p>
        </article>

        <article className="kpi-card">
          <h3>Monto total recaudado</h3>
          <p className="kpi-value">${Number(montoTotal ?? 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
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
                {estatus}: ${Number(monto ?? 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </li>
            ))}
          </ul>
        </article>

        <article className="kpi-card kpi-card--full">
          <h3>Top Delegaciones</h3>
          <ol>
            {top.map((item) => (
              <li key={item.agencia ?? item.delegacion}>
                {item.agencia ?? item.delegacion} · {item.total} infracciones
              </li>
            ))}
          </ol>
        </article>
      </section>

      <section className="kpi-section">
        <h2>Encierros</h2>
        <article className="kpi-card">
          <h3>Vehículos en resguardo</h3>
          <ul>
            <li>La Joya: {vehiculosEnResguardo?.laJoya ?? 0}</li>
            <li>San Sebastián Tutla: {vehiculosEnResguardo?.sanSebastianTutla ?? 0}</li>
          </ul>
        </article>
      </section>

      <section className="kpi-section">
        <h2>Usuarios</h2>
        <article className="kpi-card">
          <h3>Usuarios por rol</h3>
          <ul>
            {Object.entries(usuariosPorRol ?? {}).map(([role, total]) => (
              <li key={role}>
                {role}: {total}
              </li>
            ))}
          </ul>
        </article>

        <article className="kpi-card kpi-card--full">
          <h3>Usuarios por delegación</h3>
          <ol>
            {Object.entries(usuariosPorDelegacion ?? {}).map(([delegacion, total]) => (
              <li key={delegacion}>
                {delegacion} · {total} usuarios
              </li>
            ))}
          </ol>
        </article>
      </section>
    </section>
  );
}

export default KpiCards;
