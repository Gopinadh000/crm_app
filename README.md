# MiniCRM — Backend

Node.js + Express API for MiniCRM. MySQL storage, JWT auth in httpOnly cookies, versioned REST under `/api/v1`.

---

## Tech stack / packages

| Package | Purpose |
|---------|---------|
| **express** | HTTP server & routing |
| **nodemon** | Auto-restart in development (`npm start`) |
| **mysql2** / **mysql2-promise** | MySQL connection pool (promise API) |
| **bcryptjs** | Password hashing |
| **jsonwebtoken** | Access + refresh JWT sign/verify |
| **cookie-parser** | Read/write auth cookies |
| **cors** | Cross-origin requests from the frontend |
| **multer** | Contact image upload (memory → BLOB) |
| **dotenv** | Load `.env` |
| **express-rate-limit** | Login rate limiting |

---

## Setup instructions

### Prerequisites

- Node.js 18+
- MySQL 8+ running locally (or remote for PROD)

### 1. Install dependencies

```bash
cd crm-backend
npm install
```

### 2. Environment

Copy the template (dummy/sample values for local + production):

```bash
cp env.template .env
```

Edit `.env` with your real secrets and DB credentials.  
**Never commit `.env`.** Use `env.template` as the documented shape for teammates and deploy.

### 3. Database

1. Create a MySQL database (e.g. `app_crm` for DEV).
2. Set `APP_ENV=DEV` and fill `APP_DB_DEV_*` (or `APP_ENV=PROD` + `APP_DB_PROD_*`).
3. Set `AUTO_DB_MIGRATION=TRUE` so tables are created on first start.

### 4. Run the server

```bash
npm start
```

Default: `http://localhost:3000`  
Health/test: `GET http://localhost:3000/api/v1/`

### 5. Migrations only (optional)

```bash
npm run migrate
```

Runs the same SQL migration runner without needing a full request cycle. Still respects how `migrate.js` is invoked from the CLI script.

---

## Environment variables (`env.template`)

`env.template` is **sample / dummy configuration** for local development and production deploy. Copy it to `.env` and replace placeholders.

| Variable | Description |
|----------|-------------|
| `APP_PORT` | Server port (e.g. `3000`) |
| `APP_ENV` | `DEV` or `PROD` — selects which DB block is used |
| `APP_DB_DEV_*` | Host, port, user, password, database for development |
| `APP_DB_PROD_*` | Same for production (+ optional SSL) |
| `AUTO_DB_MIGRATION` | `TRUE` → run pending SQL migrations on server start |
| `APP_CORS_ORIGIN_LOCAL` | Frontend origin in local (e.g. `http://localhost:5174`) |
| `APP_CORS_ORIGIN_PRODUCTION` | Frontend origin in production |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Secrets for signing tokens |
| `JWT_ACCESS_EXPIRES` / `JWT_REFRESH_EXPIRES` | e.g. `15m`, `7d` |
| `JWT_ACCESS_COOKIE_MS` / `JWT_REFRESH_COOKIE_MS` | Cookie max-age in milliseconds |

---

## Folder structure

```text
crm-backend/
├── env.template              # Dummy/sample env for DEV + PROD
├── package.json
└── src/
    ├── index.js              # App bootstrap (Express, CORS, DB, migrations, listen)
    ├── config/
    │   ├── db-data.js        # DEV vs PROD credential map from env
    │   └── db-config.js      # mysql2 pool using selected env block
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── contacts.controller.js
    │   ├── activitylogs.controller.js
    │   └── dashboard.controller.js
    ├── db-scripts/
    │   ├── migrations.sql    # Versioned SQL scripts
    │   ├── migrate.js        # Runner + migration_history
    │   └── runMigrateScript.js
    ├── middleware/
    │   ├── auth.middleware.js          # requireAuth (JWT cookie)
    │   ├── requireAdmin.middleware.js  # ADMIN-only gate
    │   ├── upload.middleware.js        # Multer image upload
    │   └── rate-limit.middleware.js    # Login limiter
    ├── routes/
    │   └── v1.js             # All /api/v1 routes (API versioning)
    ├── services/
    │   ├── jwt/              # Sign, verify, cookie helpers
    │   └── activity-log.service.js
    └── utils/
        └── Res.utils.js      # Standard success / error JSON helpers
```

---

## Architecture by folder

### `config/` — database setup (DEV & PROD)

- `db-data.js` reads `APP_ENV` and exposes credentials:
  - **`DEV`** → `APP_DB_DEV_*`
  - **`PROD`** → `APP_DB_PROD_*`
- `db-config.js` creates a **mysql2** connection pool from that config.

On deploy: set `APP_ENV=PROD` and fill only production DB vars.

### `controllers/` — one module per domain

| Controller | Responsibility |
|------------|----------------|
| `auth.controller.js` | Register, login, logout, refresh, `/me` |
| `contacts.controller.js` | Contact CRUD + images |
| `activitylogs.controller.js` | List/search activity logs |
| `dashboard.controller.js` | Stats widgets + recent contacts |

Controllers call MySQL, JWT helpers, and activity log service; they respond via `ReS` / `ReE`.

### `db-scripts/` — migrations

- SQL lives in **`migrations.sql`** (ordered scripts with IDs).
- On server start, if **`AUTO_DB_MIGRATION=TRUE`**:
  1. Ensure `migration_history` table exists.
  2. Run each pending script **once**.
  3. Record applied IDs in `migration_history`.
- Already-applied scripts are **skipped** (safe on restart).
- When you add a new feature that needs schema changes: append a new script + ID; next start (with auto migration on) applies it.
- If `AUTO_DB_MIGRATION` is not `TRUE`, migrations are **skipped**.

### `middleware/`

| Middleware | Role |
|------------|------|
| **`requireAuth`** | Validates access JWT from cookie; attaches `req.user` |
| **`requireAdmin`** | Blocks non-`ADMIN` users (403) for mutating contact routes |
| **`uploadContactImage`** | Multer: optional image file on create/update |
| **`loginRateLimiter`** | Limits login attempts |

### `routes/v1.js` — API versioning

All routes are mounted at:

```text
/api/v1/...
```

Keeping version in the path (`v1`) lets you introduce `v2` later without breaking clients.

### `services/`

| Service | Role |
|---------|------|
| **`jwt/`** | Build payload, sign access/refresh tokens, verify, set/clear cookies |
| **`activity-log.service.js`** | Insert audit rows (failures never break the main action) |

### `utils/Res.utils.js` — standard responses

```js
// Success
ReS(res, { message, data, statusCode })

// Error
ReE(res, { message, statusCode })
```

Common JSON shape:

```json
{
  "status": true,
  "statusCode": 200,
  "message": "…",
  "data": {}
}
```

### `index.js` — application initial setup

1. Load `dotenv`
2. Create Express app
3. CORS (credentials + allowed origins)
4. JSON / urlencoded / cookie-parser
5. Mount `/api/v1` router
6. Connect to DB
7. Optionally run migrations (`AUTO_DB_MIGRATION`)
8. `listen` on `APP_PORT`

---

## API overview (`/api/v1`)

| Method | Path | Auth | Admin | Description |
|--------|------|------|-------|-------------|
| POST | `/auth/register` | — | — | Create user |
| POST | `/auth/login` | — | — | Login (rate limited) |
| POST | `/auth/refresh` | refresh cookie | — | New access token |
| POST | `/auth/logout` | — | — | Clear cookies |
| GET | `/auth/me` | ✓ | — | Current user |
| GET | `/dashboard` | ✓ | — | Stats + recent contacts |
| GET | `/contacts` | ✓ | — | List contacts |
| GET | `/contact/:id` | ✓ | — | Contact detail |
| GET | `/contact/:id/image` | ✓ | — | Contact image binary |
| POST | `/contact` | ✓ | ✓ | Create contact (+ optional image) |
| PUT | `/contact/:id` | ✓ | ✓ | Update contact |
| DELETE | `/contact/:id` | ✓ | ✓ | Delete contact |
| GET | `/activity-logs` | ✓ | — | Activity log list |

---

## Auth & roles

### Cookie JWT flow

```text
Register / Login
  → bcrypt hash check (login)
  → sign access + refresh JWTs
  → set httpOnly cookies
  → client calls /auth/me with cookies
```

- Access token: short-lived (e.g. `15m`)
- Refresh token: longer-lived (e.g. `7d`)
- Frontend never stores tokens in `localStorage`

### Roles

| Role | Read contacts / dashboard / logs | Mutate contacts |
|------|----------------------------------|-----------------|
| `USER` | Yes | No (`requireAdmin`) |
| `ADMIN` | Yes | Yes |

Contacts are **shared** across authenticated users for viewing; only admins create/update/delete.

---

## Application & code flow

### Request lifecycle

```text
Client (Axios + cookies)
  → Express (CORS, JSON, cookies)
  → /api/v1 router
  → middleware (auth / admin / upload / rate-limit)
  → controller
  → MySQL (+ optional activity log)
  → ReS / ReE JSON
```

### Server start flow

```text
npm start (nodemon → src/index.js)
  → load .env
  → create pool from DEV or PROD config
  → test DB connection
  → if AUTO_DB_MIGRATION=TRUE
       → run pending migrations.sql scripts
       → write rows into migration_history
  → listen on APP_PORT
```

### Login flow

```text
POST /auth/login
  → rate limiter
  → find user by email
  → bcrypt.compare
  → issueTokens (JWT + cookies)
  → activity log LOGIN
  → ReS user payload
```

### Create contact flow (admin)

```text
POST /contact
  → requireAuth
  → requireAdmin
  → multer (optional image)
  → insert contacts (+ userimages)
  → activity log CREATE
  → ReS contact
```

### Architecture diagram

```text
┌─────────────────────────────────────────────────────────┐
│                     index.js                             │
│  Express + CORS + cookies + /api/v1 + DB + migrations    │
└───────────────────────────┬─────────────────────────────┘
                            │
              ┌─────────────▼─────────────┐
              │       routes/v1.js         │
              └─────────────┬─────────────┘
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
   auth.controller   contacts.controller   dashboard /
   (+ JWT service)   (+ multer, admin)     activitylogs
         │                  │                  │
         └──────────────────┼──────────────────┘
                            ▼
                     MySQL (mysql2 pool)
                     migration_history
                     users / contacts / …
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Run API with nodemon (`src/index.js`) |
| `npm run migrate` | Run DB migration runner from CLI |
| `npm test` | Placeholder (not configured yet) |

---

## Related

Frontend README: [`../crm-frontend/README.md`](../crm-frontend/README.md)
