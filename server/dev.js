// Servidor solo para desarrollo local. En Vercel NO se usa: allí api/index.js
// se ejecuta como función serverless.
require('dotenv').config();

// Algunas redes locales no resuelven los registros SRV que usan las cadenas
// "mongodb+srv://" (error querySrv ETIMEOUT). En desarrollo se usan DNS públicos.
require('dns').setServers(['8.8.8.8', '1.1.1.1']);

const app = require('../api/index.js');

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`API de App 2 escuchando en el puerto ${PORT}`);
  if (!process.env.MONGODB_URI) {
    console.warn('Aviso: MONGODB_URI no está definida; las rutas de visitas responderán 503.');
  }
});
