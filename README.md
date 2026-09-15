# Frontend (React + Vite)

App pública y panel admin. Habla con la API Laravel en el puerto **8000**.

## Arranque

```bash
cp .env.example .env
npm install
npm start
```

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Dev: `http://localhost:5173`.

- `npm start` / `npm run dev`: Vite
- `npm run build` / `npm run preview`
- `npm run test`: Vitest

## Rutas

- `/home`, `/cartelera`, `/cartelera/:movieId`
- `/login`, `/register`
- `/reservar/:sessionId`, `/mis-reservas`, `/perfil` (sesión)
- `/admin/home`, `/admin/movies`, `/admin/sessions`, `/admin/rooms`, `/admin/users`, `/admin/bookings`, `/admin/prices` (ADMIN)
