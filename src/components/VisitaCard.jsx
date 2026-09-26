const formatoFecha = new Intl.DateTimeFormat('es-MX', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function formatear(fecha) {
  const d = new Date(fecha);
  return Number.isNaN(d.getTime()) ? '' : formatoFecha.format(d);
}

// Tarjeta de una firma. El mensaje se muestra como texto plano (React lo escapa).
export default function VisitaCard({ visita }) {
  return (
    <li className="visita">
      <div className="visita-cabecera">
        <strong className="visita-nombre">{visita.nombre}</strong>
        <time className="visita-fecha" dateTime={visita.fecha}>
          {formatear(visita.fecha)}
        </time>
      </div>
      <p className="visita-mensaje">{visita.mensaje}</p>
    </li>
  );
}
