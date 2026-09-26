import { useEffect, useState } from 'react';
import { obtenerInfo } from '../api.js';

// Pie de página con lo que devuelve /api/info (no depende de la base de datos).
export default function InfoFooter() {
  const [info, setInfo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  async function consultar() {
    setCargando(true);
    setError(false);
    try {
      setInfo(await obtenerInfo());
    } catch {
      setError(true);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    consultar();
  }, []);

  return (
    <footer className="pie">
      <div className="pie-info">
        {cargando && <span>Cargando...</span>}
        {!cargando && error && <span>No se pudo consultar /api/info</span>}
        {!cargando && !error && info && (
          <>
            <span>
              Respondió: <strong>{info.app}</strong> ({info.nombre})
            </span>
            <span>
              Hora del servidor: <code>{info.hora}</code>
            </span>
          </>
        )}
      </div>
      <button type="button" onClick={consultar} disabled={cargando}>
        Actualizar
      </button>
    </footer>
  );
}
