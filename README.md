# Frontend (React + Vite)

Frontend migrado a React con TypeScript y Vite.

## Scripts

```bash
npm install
npm run start
```

- `npm run start` / `npm run dev`: servidor de desarrollo.
- `npm run build`: build de produccion.
- `npm run preview`: previsualizar build local.
- `npm run test`: pruebas con Vitest.

## Rutas implementadas

- `/home`
- `/admin/home`
- `/admin/movies`

## Configuracion API

La URL base de backend se define en:

- `src/app/core/config/api.config.ts`

Valor actual:

- `http://127.0.0.1:3001/api`
