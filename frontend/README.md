# Portfolio frontend

React 18 + TypeScript, Vite, React Router in declarative mode and plain CSS.

See the [root README](../README.md) for setup, content editing, validation, deployment and optional MongoDB.

- `npm start`: Vite on port 5173, with /api proxied to port 5000.
- `npm run build`: typecheck, bundle and prerender into build/.
- `npm run typecheck`: strict TypeScript checks.

Set SITE_URL to the actual public origin at build time to generate canonical URLs and sitemap.
