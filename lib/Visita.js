// Modelo Mongoose de una firma del libro de visitas (colección `visitas`).
const mongoose = require('mongoose');

const NOMBRE_MAX = 60;
const MENSAJE_MAX = 500;

const visitaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    maxlength: [NOMBRE_MAX, `El nombre no puede superar ${NOMBRE_MAX} caracteres`],
  },
  mensaje: {
    type: String,
    required: [true, 'El mensaje es obligatorio'],
    trim: true,
    maxlength: [MENSAJE_MAX, `El mensaje no puede superar ${MENSAJE_MAX} caracteres`],
  },
  fecha: {
    type: Date,
    default: Date.now,
  },
});

// El tercer argumento fuerza el nombre exacto de la colección: `visitas`.
const Visita = mongoose.models.Visita || mongoose.model('Visita', visitaSchema, 'visitas');

module.exports = Visita;
module.exports.NOMBRE_MAX = NOMBRE_MAX;
module.exports.MENSAJE_MAX = MENSAJE_MAX;
