// API de la App 2 - Libro de Visitas.
// En Vercel este archivo se ejecuta como función serverless (module.exports = app).
// En desarrollo local lo levanta server/dev.js.
const express = require('express');
const connectDB = require('../lib/db');
const Visita = require('../lib/Visita');

const APP_NOMBRE = 'App 2';
const APP_DESCRIPCION = 'Libro de Visitas';
const LIMITE_VISITAS = 100;
const { NOMBRE_MAX, MENSAJE_MAX } = Visita;

const app = express();

app.set('trust proxy', true);
app.disable('x-powered-by');

// Cabeceras comunes: identifican qué app respondió (útil para verificar el
// round-robin del proxy) y evitan que el proxy/navegador cachee la API.
app.use((req, res, next) => {
  res.set('X-App', APP_NOMBRE);
  res.set('Cache-Control', 'no-store');
  next();
});

app.use(express.json({ limit: '10kb' }));

// Envuelve rutas async para que los errores lleguen al manejador de errores.
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Middleware que asegura la conexión a la BD; si falla responde 503.
async function requireDB(req, res, next) {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Error al conectar con MongoDB:', err.message);
    res.status(503).json({ error: 'No se pudo conectar a la base de datos' });
  }
}

// Valida un campo de texto obligatorio; devuelve el texto limpio o un mensaje de error.
function validarTexto(valor, campo, max) {
  if (typeof valor !== 'string') return { error: `El campo "${campo}" es obligatorio` };
  const limpio = valor.trim();
  if (!limpio) return { error: `El campo "${campo}" no puede estar vacío` };
  if (limpio.length > max) return { error: `El campo "${campo}" no puede superar ${max} caracteres` };
  return { valor: limpio };
}

// ---------- Rutas sin base de datos ----------

app.get('/api/info', (req, res) => {
  res.json({ app: APP_NOMBRE, nombre: APP_DESCRIPCION, hora: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ---------- Rutas de visitas (usan MongoDB) ----------

app.get(
  '/api/visitas',
  requireDB,
  asyncHandler(async (req, res) => {
    const visitas = await Visita.find().sort({ fecha: -1 }).limit(LIMITE_VISITAS).lean();
    res.json(visitas);
  })
);

// Valida el body antes de tocar la BD; deja los valores limpios en req.visita.
function validarVisita(req, res, next) {
  const body = req.body || {};

  const nombre = validarTexto(body.nombre, 'nombre', NOMBRE_MAX);
  if (nombre.error) return res.status(400).json({ error: nombre.error });

  const mensaje = validarTexto(body.mensaje, 'mensaje', MENSAJE_MAX);
  if (mensaje.error) return res.status(400).json({ error: mensaje.error });

  req.visita = { nombre: nombre.valor, mensaje: mensaje.valor };
  next();
}

app.post(
  '/api/visitas',
  validarVisita,
  requireDB,
  asyncHandler(async (req, res) => {
    const visita = await Visita.create(req.visita);
    res.status(201).json(visita);
  })
);

// ---------- 404 y errores ----------

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejador de errores: responde JSON sin exponer trazas internas.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es JSON válido' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'El cuerpo de la petición es demasiado grande' });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Datos de la visita no válidos' });
  }

  console.error('Error no controlado:', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
