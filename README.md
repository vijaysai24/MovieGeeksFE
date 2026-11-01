# Movie Geeks

React 19 + Vite + Tailwind v4 frontend for Movie Geeks. All data comes from the Movie Geeks API
(`../MovieGeeksBE`); the browser never talks to TMDB directly.

## Run it

```bash
npm install
cp .env.example .env    # VITE_API_URL, defaults to http://localhost:5000/api
npm run dev             # http://localhost:5173 (the API allows this origin)
npm run build && npm run preview -- --port 5173
```

## Where things are

- `src/Components/Pages`: one file per route; `src/Routing/AppRoutes.jsx` lazy-loads them.
- `src/Components/Home`, `Movie`, `UI`, `Layout`: page sections, film components, primitives, shell.
- `src/Services`: the API client (token refresh), per-area API calls, image URLs, guest wishlist.
- `src/Context`: session (`AuthContext`) and toasts; `src/Hooks`: shared data hooks.
- Design tokens (colours, type, steps) are in `src/index.css` under `@theme`.

Guests can browse everything and keep a wishlist in the browser; it merges into their account when
they sign in.
