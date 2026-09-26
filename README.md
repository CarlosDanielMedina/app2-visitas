# App 2 - Libro de Visitas

Aplicación MERN (MongoDB, Express, React, Node.js) sencilla: un libro de visitas donde cualquiera puede dejar su nombre y un mensaje. Forma parte de una práctica universitaria de **Seguridad Informática**: se despliega en Vercel y después queda detrás de un **proxy inverso Nginx con balanceo round-robin** junto con otras dos apps.

Para identificar a simple vista qué servidor respondió:

- La página muestra un banner verde (#2E7D32) con el texto **"Estás viendo la APP 2"**.
- Todas las respuestas de la API incluyen la cabecera **`X-App: App 2`**.
- `GET /api/info` devuelve el nombre de la app y la hora del servidor (se muestra también en el pie de página).

## Funcionalidad

- Formulario con "Tu nombre" (máx. 60 caracteres) y "Tu mensaje" (máx. 500, con contador de caracteres). No se permiten campos vacíos.
- Lista de mensajes anteriores, del más reciente al más antiguo (máximo 100), como tarjetas con nombre, mensaje y fecha/hora en formato es-MX.
- Al firmar, el mensaje nuevo aparece arriba sin recargar la página y se limpia el formulario.
- Los mensajes se muestran siempre como texto plano (respetando saltos de línea), nunca como HTML.

## Estructura

```
app2-visitas/
├─ api/index.js          # Express exportado como función serverless (module.exports = app)
├─ lib/db.js             # conexión Mongoose reutilizable (cacheada en global)
├─ lib/Visita.js         # modelo Mongoose (colección "visitas")
├─ server/dev.js         # solo desarrollo local: levanta la API en el puerto 3001
├─ public/favicon.svg
├─ src/                  # frontend React (Vite)
│  ├─ main.jsx, App.jsx, App.css, api.js
│  └─ components/        # Banner, VisitaForm, VisitaCard, InfoFooter
├─ index.html
├─ vite.config.mjs
├─ vercel.json
├─ package.json
└─ .env.example
```

## Requisitos

- Node.js 18 o superior (probado con Node 24) y npm.
- Una base de datos MongoDB (por ejemplo, un cluster gratuito de MongoDB Atlas) y su cadena de conexión.
- Para desplegar: cuenta de Vercel (y opcionalmente GitHub y la CLI `vercel`).

## Correr localmente

1. Instalar dependencias:

   ```powershell
   npm install
   ```

2. Copiar `.env.example` a `.env` y poner la cadena de conexión real de MongoDB:

   ```powershell
   Copy-Item .env.example .env
   notepad .env
   ```

   ```
   MONGODB_URI=mongodb+srv://USUARIO:CONTRASEÑA@cluster0.xxxxx.mongodb.net/practica_proxy?retryWrites=true&w=majority
   ```

3. Levantar la API (puerto 3001) y Vite (puerto 5173) a la vez:

   ```powershell
   npm run dev
   ```

4. Abrir http://localhost:5173

Otros scripts:

| Script | Qué hace |
|---|---|
| `npm run dev` | API (nodemon) + frontend (Vite) al mismo tiempo |
| `npm run dev:api` | Solo la API Express en el puerto 3001 |
| `npm run dev:web` | Solo el frontend con Vite (reenvía `/api` a la API local) |
| `npm run build` | Genera el frontend de producción en `dist/` |
| `npm run preview` | Sirve localmente el contenido de `dist/` |

> Aunque no haya `.env` o MongoDB esté caído, la página carga: el banner y el pie con `/api/info` siguen funcionando y se muestra el aviso "No se pudo conectar con la base de datos. Intenta más tarde."

> Solo se puede correr una app a la vez en local, porque las tres usan los puertos 3001 y 5173. Detén la otra (Ctrl+C) antes de iniciar esta.

### Problemas comunes al conectar con MongoDB en local

- **`querySrv ETIMEOUT`**: la red no resuelve las direcciones `mongodb+srv://`. `server/dev.js` ya usa DNS públicos (8.8.8.8 y 1.1.1.1) en desarrollo para evitarlo.
- **"Could not connect to any servers…"** aunque tu IP esté permitida en Atlas: una VPN puede estar bloqueando el puerto 27017. Desconéctala o excluye `node.exe` con túnel dividido (split tunneling).
- **`bad auth : Authentication failed`**: el usuario o la contraseña no coinciden con los de **Database Access** en Atlas.

## Desplegar en Vercel

### Opción A: con la CLI `vercel`

```powershell
npm install -g vercel
vercel login
vercel                       # primer despliegue (preview); acepta la detección de Vite
vercel env add MONGODB_URI   # repetir para Production, Preview y Development
vercel --prod                # despliegue a producción
```

### Opción B: desde GitHub

1. Subir este proyecto a un repositorio de GitHub.
2. En https://vercel.com → **Add New… → Project** → importar el repositorio.
3. **Framework Preset:** Vite (se detecta solo; comando `npm run build`, salida `dist`).
4. En **Environment Variables** agregar `MONGODB_URI` con la cadena de conexión, marcada para **Production**, **Preview** y **Development**.
5. **Deploy**. Si agregaste o cambiaste la variable después del primer despliegue, haz **Redeploy** (Deployments → ⋯ → Redeploy) para que la tome.

El archivo `vercel.json` reescribe `/api/(.*)` hacia la función `api/index.js`, que es la app Express completa.

> En MongoDB Atlas, en **Network Access**, permite el acceso desde `0.0.0.0/0`, ya que Vercel no tiene IPs fijas.

## ⚠️ IMPORTANTE: desactivar Vercel Authentication / Deployment Protection

Vercel puede proteger los despliegues con **Vercel Authentication**. Si está activada, el proxy Nginx recibirá un **401** o una **redirección a la pantalla de login de Vercel** en lugar de la app, y el balanceo no funcionará.

Para desactivarla:

1. Entra al proyecto en Vercel.
2. **Project → Settings → Deployment Protection**.
3. Desactiva **"Vercel Authentication"** y guarda.

Compruébalo abriendo la URL del despliegue en una ventana de incógnito: debe verse la app directamente, sin pedir inicio de sesión.

## Cómo probar

Sustituye `<dominio>` por el dominio de Vercel (por ejemplo `app2-visitas.vercel.app`) o por el del proxy Nginx.

```bash
curl https://<dominio>/api/info
# {"app":"App 2","nombre":"Libro de Visitas","hora":"2026-01-01T12:00:00.000Z"}

curl https://<dominio>/api/health
# {"status":"ok"}

curl -I https://<dominio>/api/health
# ... X-App: App 2
```

> En PowerShell usa `curl.exe` (no el alias `curl`), o bien `Invoke-RestMethod https://<dominio>/api/info`.

Para verificar el round-robin detrás de Nginx, repite varias veces `curl -I` contra el proxy y observa cómo cambia la cabecera `X-App` (App 1, App 2, App 3...).

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/info` | Info de la app: `{"app":"App 2","nombre":"Libro de Visitas","hora":"..."}` (no usa la BD) |
| GET | `/api/health` | `{"status":"ok"}` (no usa la BD) |
| GET | `/api/visitas` | Lista de mensajes ordenada por `fecha` descendente (máximo 100) |
| POST | `/api/visitas` | Body `{ "nombre": "...", "mensaje": "..." }` → crea la firma (201) |

Respuestas de error (JSON, en español):

- **400**: faltan campos, campos vacíos o demasiado largos, o JSON mal formado.
- **404**: la ruta `/api/...` no existe.
- **413**: el cuerpo de la petición supera 10 KB.
- **503**: `{"error":"No se pudo conectar a la base de datos"}`.
- **500**: error interno (sin exponer trazas).

Todas las respuestas de la API incluyen `X-App: App 2` y `Cache-Control: no-store`.

## Notas de seguridad

- Sin login ni autenticación (requisito de la práctica).
- El cuerpo JSON está limitado a 10 KB; se validan tipos, se hace `trim()` y se limitan las longitudes (nombre 60, mensaje 500) en la ruta y en el esquema.
- Los mensajes se muestran como texto plano: React escapa el contenido y no se usa `dangerouslySetInnerHTML`, así que un mensaje como `<script>alert(1)</script>` se ve literalmente y no se ejecuta (protección contra XSS almacenado).
- Los errores no filtran trazas ni detalles internos; se desactiva la cabecera `X-Powered-By`.
- El frontend solo usa rutas relativas (`/api/...`).
- El archivo `.env` está en `.gitignore`: nunca subas credenciales al repositorio.
