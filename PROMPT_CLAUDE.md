Estás en la carpeta vacía `app2-visitas` (ya tiene `git init` en la rama main). Crea desde cero una aplicación MERN sencilla y funcional llamada **"App 2 - Libro de Visitas"**, que se desplegará en Vercel y después quedará detrás de un proxy inverso Nginx con balanceo round-robin junto con otras dos apps (práctica universitaria de Seguridad Informática). Trabaja en Windows con PowerShell. Todo el texto de la interfaz, comentarios y README en español.

## Funcionalidad
- Formulario con "Tu nombre" y "Tu mensaje" (textarea con contador de caracteres, máx 500) y botón "Firmar libro". No permitir campos vacíos.
- Debajo, la lista de mensajes anteriores **del más reciente al más antiguo**, como tarjetas con nombre, mensaje y fecha/hora en formato es-MX.
- Al enviar, el nuevo mensaje aparece arriba sin recargar la página y se limpia el formulario.
- Los mensajes se muestran como texto plano (respetando saltos de línea con CSS `white-space: pre-wrap`), nunca como HTML.

Color principal: **#2E7D32**. Colección de MongoDB: **`visitas`** con el esquema `{ nombre: String (requerido, máx 60), mensaje: String (requerido, máx 500), fecha: Date (default Date.now) }`.

## Requisitos para el proxy / balanceo (obligatorios)
1. Arriba de la página, un banner grande y muy visible (ancho completo, fondo #2E7D32, texto blanco, letra de al menos 2rem) que diga **"Estás viendo la APP 2"** y debajo "Libro de Visitas". Debe identificarse a simple vista qué servidor respondió.
2. `GET /api/info` → JSON exactamente con esta forma: `{"app":"App 2","nombre":"Libro de Visitas","hora":"<new Date().toISOString() del servidor>"}`.
3. `GET /api/health` → `{"status":"ok"}`.
4. `/api/info` y `/api/health` NO deben depender de MongoDB (responden aunque la BD esté caída) y deben enviar `Cache-Control: no-store`.
5. Todas las respuestas de la API deben incluir la cabecera `X-App: App 2` (sirve para verificar el round-robin con `curl -I`).
6. En el pie de página, mostrar lo que devuelve `/api/info` (app y hora del servidor) con un botón "Actualizar" para volver a consultarlo.
7. En el frontend usar SOLO rutas relativas: `fetch("/api/...")`. Nunca URLs absolutas, nunca `localhost`, nunca variables con dominio.
8. `vite.config.mjs` con `base: "./"`.
9. Sin login ni autenticación de ningún tipo.

## Estructura (un proyecto por app, listo para Vercel)
```
app2-visitas/
├─ api/index.js          # Express exportado como función serverless: module.exports = app
├─ lib/db.js             # conexión Mongoose reutilizable
├─ lib/Visita.js  # modelo Mongoose
├─ server/dev.js         # solo para desarrollo local: require('../api/index.js') y app.listen(3001)
├─ src/ (main.jsx, App.jsx, App.css, componentes)
├─ index.html
├─ vite.config.mjs
├─ vercel.json
├─ package.json
├─ .env.example
├─ .gitignore
└─ README.md
```

## Detalles técnicos
- **Módulos**: el `package.json` NO debe tener `"type": "module"` para que `api/index.js`, `lib/*` y `server/dev.js` usen CommonJS (`require` / `module.exports`). El frontend (`src/`) usa `import` normal porque lo procesa Vite; por eso la config es `vite.config.mjs`.
- **Dependencias**: react, react-dom, express, mongoose. Dev: vite, @vitejs/plugin-react, dotenv, concurrently, nodemon. Nada de librerías de UI (ni Bootstrap, ni MUI, ni Tailwind): CSS simple propio.
- **Scripts**: `"dev"` corre a la vez Vite y `nodemon server/dev.js` con concurrently; `"dev:api"`, `"dev:web"`, `"build": "vite build"`, `"preview"`.
- **Proxy de Vite solo para desarrollo**: en `vite.config.mjs`, `server.proxy` de `/api` a `http://localhost:3001`. Es la única aparición permitida de localhost y no llega al código del navegador.
- **vercel.json**: reescribe `/api/(.*)` hacia `/api` (la función `api/index.js`). Las rutas de Express se definen con el prefijo completo (`/api/info`, `/api/health`, `/api/visitas`...). No agregues `builds` legacy; deja que Vercel detecte Vite (salida `dist`).
- **Express**: `app.set('trust proxy', true)`, `express.json({ limit: '10kb' })`, middleware que ponga `X-App`, `app.disable('x-powered-by')`, un 404 JSON para rutas `/api` desconocidas y un manejador de errores JSON que no filtre trazas.
- **MongoDB (lib/db.js)**: leer `process.env.MONGODB_URI`; si falta, lanzar un error claro. Cachear la conexión en `global` (`global._mongoose = { conn, promise }`) para reutilizarla entre invocaciones serverless. Usar `serverSelectionTimeoutMS: 5000` y `bufferCommands: false`. Las rutas que usan la BD hacen `await connectDB()`; si falla, responder **503** con `{"error":"No se pudo conectar a la base de datos"}`.
- **Modelo**: `mongoose.models.Visita || mongoose.model('Visita', schema, 'visitas')` (tercer argumento para forzar el nombre de colección exacto `visitas`).
- **Validación básica (es una práctica de seguridad)**: `trim()` y longitudes máximas en el esquema y en la ruta; rechazar con 400 y mensaje en español si faltan campos; validar el ObjectId antes de borrar/actualizar (400 si es inválido, 404 si no existe). Nunca usar `dangerouslySetInnerHTML`.

## Endpoints de la app
| Método | Ruta | Descripción |
|---|---|---|
| GET | /api/info | info de la app (sin BD) |
| GET | /api/health | `{"status":"ok"}` (sin BD) |
| GET | /api/visitas | lista ordenada por `fecha` descendente, límite 100 |
| POST | /api/visitas | body `{ nombre, mensaje }` → crea (201) |

## Frontend
- React con hooks (`useState`, `useEffect`), un solo `App.jsx` más componentes pequeños si ayudan.
- Interfaz limpia y responsiva (mobile first, `max-width` ~720px centrado, se ve bien a 360px de ancho). Variables CSS con el color principal #2E7D32 y un tono claro derivado para fondos.
- Estados de carga ("Cargando...") y manejo de errores: si una petición falla o la API responde 503, mostrar un aviso visible en rojo/ámbar: "No se pudo conectar con la base de datos. Intenta más tarde." sin romper la página (el banner y el pie con /api/info siguen funcionando).
- `<title>` de la página: "App 2 - Libro de Visitas". Favicon opcional con el color de la app.

## Archivos de soporte
- `.env.example` con `MONGODB_URI=mongodb+srv://USUARIO:CONTRASEÑA@cluster0.xxxxx.mongodb.net/practica_proxy?retryWrites=true&w=majority` (sin datos reales).
- `.gitignore` con `node_modules`, `.env`, `.env.*` (excepto `.env.example`), `dist`, `.vercel`.
- `README.md` con: descripción; requisitos; **correr localmente** (`npm install`, copiar `.env.example` a `.env` y poner la cadena, `npm run dev`, abrir http://localhost:5173); **desplegar en Vercel** (con `vercel` CLI y desde GitHub: importar el repo, framework Vite, agregar la variable de entorno `MONGODB_URI` en Production/Preview/Development, redeploy); una sección destacada **"IMPORTANTE: desactivar Vercel Authentication / Deployment Protection"** (Project → Settings → Deployment Protection → desactivar "Vercel Authentication") porque si no el proxy Nginx recibe 401/redirección al login; cómo probar con `curl https://<dominio>/api/info`, `/api/health` y `curl -I` para ver `X-App`; y una tabla con los endpoints.

## Qué NO hacer
- No crees ni escribas el archivo `.env` con credenciales reales y no me pidas la contraseña: yo la pondré después.
- No hagas `vercel deploy` ni `git push`.

## Verificación final (hazla tú antes de terminar)
1. `npm install` y `npm run build` sin errores; revisa que `dist/index.html` referencie los assets con `./assets/...`.
2. Levanta `node server/dev.js` sin `MONGODB_URI` y comprueba con `Invoke-RestMethod` que `/api/health` y `/api/info` responden bien y que `/api/visitas` devuelve 503 con el mensaje en español (no debe tumbar el proceso).
3. Busca en `src/` que no exista ninguna URL absoluta ni `localhost` (`Select-String`).
4. Detén los procesos que hayas iniciado.
5. Haz un commit inicial: `git add -A` y `git commit -m "App 2 - Libro de Visitas: MERN lista para Vercel"`.
6. Al final dame un resumen corto: árbol de archivos, comandos para correrla y los pasos pendientes que me tocan a mí (crear `.env`, desplegar, desactivar Deployment Protection).
