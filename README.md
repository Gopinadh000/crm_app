# MiniCRM — Frontend

React + TypeScript + Vite SPA for MiniCRM. Talks to the Node/Express API over HTTP with cookie-based JWT auth.

---

## Tech stack

| Package | Purpose |
|---------|---------|
| **React 19** | UI library |
| **TypeScript** | Type safety |
| **Vite** | Dev server + production build |
| **React Router DOM** | Client-side routing |
| **Axios** | HTTP client (`withCredentials` for cookies) |
| **Tailwind CSS 4** | Styling + responsive breakpoints |
| **MUI Icons / Material** | Icons and a few UI helpers (menus, selects) |

---

## Setup instructions

### Prerequisites

- Node.js 18+ (recommended 20+)
- Backend running (default `http://localhost:3000`)

### 1. Install dependencies

```bash
cd crm-frontend
npm install
```

### 2. Environment

Copy the example env file and edit values:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `VITE_API_URL_LOCAL` | Local API base URL (e.g. `http://localhost:3000/api`) |
| `VITE_API_URL_PROD` | Production API base URL |
| `VITE_INSTANCE_TYPE` | `LOCAL` or `PROD` — picks which API URL Axios uses |

### 3. Run development server

```bash
npm run dev
```

App usually opens at `http://localhost:5173` or `http://localhost:5174` (match this origin in backend CORS).

### 4. Production build

```bash
npm run build
npm run preview
```

---

## Folder structure

```text
crm-frontend/
├── public/                 # Static public files (e.g. redirects)
├── src/
│   ├── assets/             # Images / logos used in the UI
│   ├── components/
│   │   ├── common/         # Reusable app-wide UI (Button, Modal, PageTitle, …)
│   │   ├── form-fields/    # Form inputs (InputField, SelectField)
│   │   └── ui/             # Shell UI (NavBar, SideBar, MainContainer)
│   ├── layout/             # AppLayout — wires navbar + sidebar + main content
│   ├── pages/
│   │   ├── auth-pages/     # Login, Register (public)
│   │   ├── dashboard-page/
│   │   ├── contacts-page/
│   │   ├── activitylogs-page/
│   │   └── not-found-pages/
│   ├── routes/
│   │   ├── app-routes/     # Protected page routes (Dashboard, Contacts, …)
│   │   └── routes-wrappers/# Public / Protected guards + top-level RoutesWrapper
│   ├── services/
│   │   ├── api/            # Axios instance + feature API modules
│   │   └── context/        # AuthContext (session, login, logout, role)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

### What each area does

#### `assets/`

Stores static images (logos, hero art). Import from pages/components as needed.

#### `components/`

| Folder | Role |
|--------|------|
| **`common/`** | Shared pieces used on many pages: `Button`, `Modal`, `PageTitle`, `ThreeDotsMenu` |
| **`form-fields/`** | Controlled inputs used in auth + contact forms |
| **`ui/`** | App chrome: `NavBar`, `SideBar`, `MainContainer` |

#### `pages/`

Feature screens. Auth pages live under `auth-pages/`. Each feature can keep local pieces in a `components/` subfolder (tables, forms).

#### `routes/`

| Path | Role |
|------|------|
| **`routes-wrappers/`** | Top router: public vs protected; redirects unauthenticated users to `/login` |
| **`app-routes/`** | Routes rendered **inside** the authenticated layout (Dashboard, Contacts, Activity Logs) |

#### `services/`

| Path | Role |
|------|------|
| **`api/axios-setup/`** | Shared Axios instance, base URL, credentials, 401 → refresh retry |
| **`api/*/`** | Feature API helpers (`contacts`, `dashboard`, `activity-logs`) |
| **`context/AuthContext`** | Holds current user, `isAdmin`, login/logout/me hydration |

#### `layout/`

`AppLayout` composes:

```text
┌─────────────┬──────────────────────────────┐
│  SideBar    │  NavBar                      │
│             ├──────────────────────────────┤
│             │  MainContainer               │
│             │    └─ AppRoutes (pages)      │
└─────────────┴──────────────────────────────┘
```

On mobile/tablet the sidebar becomes a drawer; navbar shows a menu button.

---

## Architecture

```text
Browser
  └─ React App (Vite)
       ├─ AuthContext          ← session state from /auth/me
       ├─ RoutesWrapper
       │    ├─ Public  → Login / Register
       │    └─ Protected → AppLayout → AppRoutes → Pages
       └─ Axios (cookies)  ──►  Backend /api/v1/*
```

### Auth model (frontend)

1. Login/Register → backend sets **httpOnly** cookies (`access_token`, `refresh_token`).
2. `AuthContext` calls `GET /v1/auth/me` on load to restore the session.
3. Axios sends cookies automatically (`withCredentials: true`).
4. On **401**, axios tries refresh once, then retries the request; if refresh fails → logout / redirect to login.
5. `isAdmin` comes from the user `role` (`ADMIN` | `USER`) and controls Create/Edit/Delete UI.

### Roles (UI)

| Role | Can view contacts / logs / dashboard | Can create / edit / delete contacts |
|------|--------------------------------------|-------------------------------------|
| `USER` | Yes | No |
| `ADMIN` | Yes | Yes |

---

## Application & code flow

### App bootstrap

```text
main.tsx
  → App.tsx (BrowserRouter + AuthProvider)
      → RoutesWrapper
```

### Unauthenticated user

```text
Visit /
  → ProtectedRoutes (no user)
  → redirect /login
  → LoginPage → POST /auth/login
  → AuthContext updates user
  → navigate /
```

### Authenticated user

```text
Visit /contacts
  → ProtectedRoutes (user exists)
  → AppLayout (Sidebar + NavBar + MainContainer)
  → AppRoutes → ContactsPage
  → contacts.api.ts → GET /contacts
  → table / cards render
```

### Contact create (admin only)

```text
ContactsPage → Modal + ContactForm
  → POST /contact (multipart if image)
  → refresh list + activity log appears on Activity Logs page
```

### High-level page map

| Route | Page | Auth |
|-------|------|------|
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/` | Dashboard (stats + recent contacts) | Protected |
| `/contacts` | Contacts CRUD (admin mutations) | Protected |
| `/activity-logs` | Activity audit list | Protected |

---

## Responsive design

Breakpoints (see `tailwind.config.js` / `index.css`):

| Alias | Min width | Typical use |
|-------|-----------|-------------|
| `mobile` | 480px | Large phones |
| `tablet` | 768px | Tablets |
| `desktop` | 1024px | Fixed sidebar + full tables |

- **Mobile:** drawer sidebar, card lists for tables, page scroll  
- **Desktop:** fixed sidebar, full tables with internal scroll  

---

## Testing (Vitest)

Component tests use **Vitest** + **React Testing Library** + **jsdom**.

```bash
npm test          # watch mode
npm run test:run  # single run (CI)
npm run test:coverage
```

Setup file: `src/test/setup.ts`  
Test files live next to components as `*.test.tsx` (Button, Modal, InputField, PageTitle, SelectField, ThreeDotsMenu, ContactAvatar, StatWidget).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Typecheck + production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest watch mode |
| `npm run test:run` | Vitest single run |
| `npm run test:coverage` | Vitest with coverage |

---

## Related

Backend README: [`../crm-backend/README.md`](../crm-backend/README.md)
