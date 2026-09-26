// Cliente de la API. Solo se usan rutas relativas ("/api/...") para que la app
// funcione igual en local, en Vercel y detrás del proxy inverso Nginx.

export const MENSAJE_BD = 'No se pudo conectar con la base de datos. Intenta más tarde.';

async function pedir(ruta, opciones = {}) {
  let res;
  try {
    res = await fetch(ruta, {
      ...opciones,
      headers: { 'Content-Type': 'application/json', ...(opciones.headers || {}) },
      cache: 'no-store',
    });
  } catch {
    // Error de red: el servidor no respondió.
    throw new Error(MENSAJE_BD);
  }

  let datos = null;
  try {
    datos = await res.json();
  } catch {
    datos = null;
  }

  if (!res.ok) {
    // 503 (BD caída) o cualquier error del servidor: mensaje genérico.
    if (res.status >= 500) throw new Error(MENSAJE_BD);
    // 4xx: mostrar el mensaje de validación que envía la API.
    throw new Error((datos && datos.error) || 'La petición no es válida.');
  }

  return datos;
}

export const obtenerInfo = () => pedir('/api/info');

export const listarVisitas = () => pedir('/api/visitas');

export const crearVisita = (nombre, mensaje) =>
  pedir('/api/visitas', { method: 'POST', body: JSON.stringify({ nombre, mensaje }) });
