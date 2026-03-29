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

## Variables De Entorno

Variables consumidas por la app:

- `VITE_BACKEND_URL`: URL base del backend. La app lo usa para `POST /auth/register`, `GET /catalog`, `GET /access/lessons/:id` y `POST /payments/checkout-session`.
- `VITE_SUPABASE_URL`: URL del proyecto Supabase.
- `VITE_SUPABASE_KEY`: clave publica de Supabase para el cliente.
- `VITE_STRIPE_PUBLIC_KEY`: clave publica de Stripe para cargar `@stripe/stripe-js`.

Variables opcionales para Vite, solo para desarrollo/preview:

- `DEV_HOST` / `DEV_PORT`: host y puerto del servidor `vite`.
- `PREVIEW_HOST` / `PREVIEW_PORT`: host y puerto de `vite preview`.
- `DEV_ALLOWED_HOSTS` / `PREVIEW_ALLOWED_HOSTS`: lista separada por comas de hosts permitidos.

Notas:

- `STRIPE_SECRET_KEY` no debe ir en el frontend; pertenece al backend.
- Si alguna variable publica falta, la pantalla correspondiente puede fallar o quedar degradada.

## Despliegue Y Configuracion

- El build sale en `dist/` y es estatico.
- `netlify.toml` ya incluye la regla SPA para que las rutas del cliente resuelvan en `index.html`.
- En despliegue hay que definir las mismas variables de entorno que en local.
- Si despliegas en otro proveedor, asegurate de mantener una rewrite/fallback hacia `index.html` para que funcionen las rutas internas.

## Limitaciones Actuales

- Este repo no incluye backend; la autenticacion, el mapa de contenidos y los pagos dependen de servicios externos.
- El CTA de precios sigue apuntando a un checkout de Stripe de prueba hasta que se sustituya por el flujo de produccion.
