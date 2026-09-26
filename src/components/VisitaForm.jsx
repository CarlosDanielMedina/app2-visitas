import { useState } from 'react';

const NOMBRE_MAX = 60;
const MENSAJE_MAX = 500;

// Formulario para firmar el libro de visitas.
export default function VisitaForm({ onFirmar }) {
  const [nombre, setNombre] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  const valido = nombre.trim() !== '' && mensaje.trim() !== '';

  async function manejarSubmit(e) {
    e.preventDefault();
    if (!valido || enviando) return;

    setEnviando(true);
    const ok = await onFirmar(nombre.trim(), mensaje.trim());
    setEnviando(false);
    if (ok) {
      setNombre('');
      setMensaje('');
    }
  }

  return (
    <form className="visita-form" onSubmit={manejarSubmit}>
      <div className="campo">
        <label htmlFor="nombre">Tu nombre</label>
        <input
          id="nombre"
          type="text"
          value={nombre}
          maxLength={NOMBRE_MAX}
          onChange={(e) => setNombre(e.target.value)}
          autoComplete="name"
          required
        />
      </div>

      <div className="campo">
        <label htmlFor="mensaje">Tu mensaje</label>
        <textarea
          id="mensaje"
          rows={4}
          value={mensaje}
          maxLength={MENSAJE_MAX}
          onChange={(e) => setMensaje(e.target.value)}
          aria-describedby="contador-mensaje"
          required
        />
        <span
          id="contador-mensaje"
          className={`contador-caracteres ${mensaje.length >= MENSAJE_MAX ? 'al-limite' : ''}`}
        >
          {mensaje.length}/{MENSAJE_MAX}
        </span>
      </div>

      <button type="submit" disabled={!valido || enviando}>
        {enviando ? 'Firmando...' : 'Firmar libro'}
      </button>
    </form>
  );
}
