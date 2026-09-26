import { useEffect, useState } from 'react';
import Banner from './components/Banner.jsx';
import VisitaForm from './components/VisitaForm.jsx';
import VisitaCard from './components/VisitaCard.jsx';
import InfoFooter from './components/InfoFooter.jsx';
import { listarVisitas, crearVisita } from './api.js';

export default function App() {
  const [visitas, setVisitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  async function cargarVisitas() {
    setCargando(true);
    setError('');
    try {
      const datos = await listarVisitas();
      setVisitas(Array.isArray(datos) ? datos : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarVisitas();
  }, []);

  async function firmar(nombre, mensaje) {
    setError('');
    try {
      const nueva = await crearVisita(nombre, mensaje);
      setVisitas((prev) => [nueva, ...prev]);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }

  return (
    <div className="pagina">
      <Banner />

      <main className="contenedor">
        <section className="tarjeta-form">
          <h2>Firma el libro</h2>
          <VisitaForm onFirmar={firmar} />
        </section>

        {error && (
          <div className="aviso" role="alert">
            <span>{error}</span>
            <button type="button" onClick={cargarVisitas}>
              Reintentar
            </button>
          </div>
        )}

        <h2 className="titulo-lista">Mensajes anteriores</h2>

        {cargando ? (
          <p className="estado">Cargando...</p>
        ) : visitas.length === 0 ? (
          <p className="estado">Todavía nadie ha firmado el libro.</p>
        ) : (
          <ul className="lista">
            {visitas.map((visita) => (
              <VisitaCard key={visita._id} visita={visita} />
            ))}
          </ul>
        )}
      </main>

      <InfoFooter />
    </div>
  );
}
