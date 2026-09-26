// Conexión reutilizable a MongoDB con Mongoose.
// En Vercel cada invocación serverless puede reutilizar el mismo contenedor,
// así que la conexión se guarda en `global` para no abrir una nueva cada vez.
const mongoose = require('mongoose');

let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Falta la variable de entorno MONGODB_URI');
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 5000,
        bufferCommands: false,
      })
      .then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // Si falla, se limpia la promesa para reintentar en la siguiente petición.
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}

module.exports = connectDB;
