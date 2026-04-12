# webformacionapuestas

Frontend en React + TypeScript + Vite para la web de formacion/apuestas. Este repositorio contiene solo la aplicacion cliente; depende de Supabase y de un backend externo para autenticacion, catalogo, accesos y pagos.

## Estructura

- `src/features/`: logica y UI por dominio funcional (`home`, `pricing`, `roadmap`, `usuario`, etc.).
- `src/pages/`: paginas montadas por ruta.
- `src/lib/`: clientes e integraciones compartidas (`supabase`, `stripe`, `env`, `auth`).
- `src/shared/`: componentes y hooks reutilizables.
- `src/styles/`: estilos globales.
- `public/`: recursos estaticos servidos tal cual.
- `dist/`: salida del build.

## Requisitos

- Node.js compatible con Vite 7.
- npm.

## Puesta En Marcha

Desde este subdirectorio anidado:

```powershell
cd C:\Users\apren\webapuestas\webformacionapuestas
npm install
Copy-Item .env.example .env
npm run dev
```

Si ya estas en `C:\Users\apren\webapuestas`, basta con entrar en `webformacionapuestas` antes de arrancar el proyecto.

## Scripts

- `npm run dev`: arranca el servidor de desarrollo de Vite.
- `npm run build`: valida TypeScript y genera `dist/`.
- `npm run preview`: sirve el build localmente para revisar la version de produccion.
- `npm run lint`: ejecuta ESLint sobre el codigo.

`npm run dev` queda expuesto en la red local por defecto (`0.0.0.0`), asi que puedes abrirlo desde otros dispositivos conectados a la misma Wi-Fi/LAN usando la IP local de tu equipo y el puerto de Vite.

## Variables De Entorno

Variables consumidas por la app:

- `VITE_BACKEND_URL`: URL base del backend. La app lo usa para `POST /auth/register`, `GET /catalog`, `GET /access/lessons/:id` y `POST /payments/checkout-session`.
- `VITE_SUPABASE_URL`: URL del proyecto Supabase.
- `VITE_SUPABASE_KEY`: clave publica de Supabase para el cliente.
- `VITE_STRIPE_PUBLIC_KEY`: clave publica de Stripe para cargar `@stripe/stripe-js`.
- `VITE_CHECKOUT_RETURN_URL_ORIGINS` (opcional): lista separada por comas con los origenes permitidos para `successUrl` y `cancelUrl` del checkout. Conviene alinearla con `CHECKOUT_RETURN_URL_ORIGINS` en backend para fallar antes en frontend si el origen no esta permitido.

Variables opcionales para Vite, solo para desarrollo/preview:

- `DEV_HOST` / `DEV_PORT`: host y puerto del servidor `vite`. Si no se define `DEV_HOST`, se usa `0.0.0.0`.
- `PREVIEW_HOST` / `PREVIEW_PORT`: host y puerto de `vite preview`. Si no se define `PREVIEW_HOST`, se usa `0.0.0.0`.
- `DEV_ALLOWED_HOSTS` / `PREVIEW_ALLOWED_HOSTS`: lista separada por comas de hosts permitidos.

Notas:

- `STRIPE_SECRET_KEY` no debe ir en el frontend; pertenece al backend.
- Si alguna variable publica falta, la pantalla correspondiente puede fallar o quedar degradada.

## Despliegue Y Configuracion

- El build sale en `dist/` y es estatico.
- `netlify.toml` ya incluye la regla SPA para que las rutas del cliente resuelvan en `index.html`.
- En despliegue hay que definir las mismas variables de entorno que en local.
- El origen publico del frontend debe estar incluido en `CORS_ALLOWED_ORIGINS` del backend; si no, las peticiones pueden fallar con errores de red/CORS.
- Las URLs de retorno de Stripe deben pertenecer a un origen permitido por `CHECKOUT_RETURN_URL_ORIGINS`.
- Si despliegas en otro proveedor, asegurate de mantener una rewrite/fallback hacia `index.html` para que funcionen las rutas internas.

## Limitaciones Actuales

- Este repo no incluye backend; la autenticacion, el mapa de contenidos y los pagos dependen de servicios externos.
- `/catalog` solo devuelve contenido publicado; el frontend no debe depender de `includeUnpublished=true` ni de metadatos publicos de video en los listados.
- La reproduccion de video depende del flujo firmado del backend tras comprobar acceso; no del catalogo publico.
- `/auth/register` puede requerir confirmacion por email y no garantiza login inmediato.
- El CTA de precios sigue apuntando a un checkout de Stripe de prueba hasta que se sustituya por el flujo de produccion.

## Nota Tecnica: Fondo CaraB En Movil

- Solucion aplicada: evitar `background-attachment: fixed` en movil para prevenir zoom excesivo y comportamiento inestable.
- Implementacion estable: usar una capa `::before` fija en `.cara-b-landing-bg` y dejar el contenido por encima.
- Referencia 1: `src/features/cara-b/CaraBLandingPage.tsx`
- Referencia 2: `src/styles/globals.css`
