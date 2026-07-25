# Movie Geek

This project was created with Vite + React and later extended with React Router and Tailwind CSS.

## Project setup from create-project command

The project was initialized with:

```bash
npm create vite@latest movie-geek -- --template react
cd movie-geek
npm install
```

Additional packages were added for routing and styling:

```bash
npm install react-router-dom tailwindcss @tailwindcss/vite
```

### Routing flow

The app was structured with a route-based layout flow by creating folders for:

- src/Components/Layout for shared UI sections like the navbar and footer
- src/Components/Pages for page-level views such as Home, Directors, Journals, and MovieDetails
- src/Routing for the route configuration

The app is wrapped with BrowserRouter in src/main.jsx so navigation works through the route setup in src/Routing/AppRoutes.jsx.

### Styling setup

The default Vite starter CSS setup was removed in favor of Tailwind CSS.

- src/index.css now imports Tailwind using `@import "tailwindcss";`
- vite.config.js enables Tailwind through the Vite plugin
- the default App.css-based styling flow was not kept for this project

## Available scripts

Run the app locally:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Lint the project:

```bash
npm run lint
```

## Project structure

- src/Components/Layout: shared layout components such as the navbar, footer, and dashboard
- src/Components/Pages: route-based pages including Home, Directors, Journals, and MovieDetails
- src/Routing: route configuration for the application
- public/: static assets

## Tech stack

- React 19
- Vite 8
- React Router DOM
- Tailwind CSS
- Oxlint


### Routing flow

The app was structured with a route-based layout flow by creating folders for:

- src/Components/Layout for shared UI sections like the navbar and footer
- src/Components/Pages for page-level views such as Home, Directors, Journals, and MovieDetails
- src/Routing for the route configuration

The app is wrapped with BrowserRouter in src/main.jsx so navigation works through the route setup in src/Routing/AppRoutes.jsx.

### Styling setup

The default Vite starter CSS setup was removed in favor of Tailwind CSS.

- src/index.css now imports Tailwind using `@import "tailwindcss";`
- vite.config.js enables Tailwind through the Vite plugin
- the default App.css-based styling flow was not kept for this project
