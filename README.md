# The Swagger – Project Management Platform

A full-stack project management platform built for design & construction teams. Manage projects, track budgets, assign tasks, and collaborate across roles — all in one place.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![NestJS](https://img.shields.io/badge/NestJS-11-red?logo=nestjs)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-blue?logo=postgresql)
![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS v4, Radix UI |
| Backend | NestJS 11, Passport.js, JWT (HTTP-only cookies) |
| Database | PostgreSQL + Prisma ORM |
| Monorepo | pnpm workspaces + Nx |
| Linting | Biome |

---

## Project Structure

```
the-swagger/
├── apps/
│   ├── api/          # NestJS backend (port 4200)
│   └── web/          # Next.js frontend (port 4000)
├── packages/
│   └── shared/       # Shared types & constants
├── pnpm-workspace.yaml
└── package.json
```

---

## Prerequisites

- Node.js >= 18
- pnpm >= 9 (`npm install -g pnpm`)
- PostgreSQL running locally

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/the-swagger.git
cd the-swagger
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

**API** — create `apps/api/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/the_swagger_dev?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=4200
NODE_ENV=development
COOKIE_SECRET="your-cookie-secret-change-in-production"
CORS_ORIGIN=http://localhost:4000
```

> No `.env` is needed for the web app in local development.

### 4. Set up the database

```bash
# Run migrations
cd apps/api
npx prisma migrate dev

# Seed test data
cd ../..
pnpm db:seed
```

### 5. Start the development servers

```bash
pnpm dev
```

This starts both the API (port 4200) and the web app (port 4000) concurrently.

Open [http://localhost:4000](http://localhost:4000) in your browser.

---

## Test Accounts

All test accounts use the password: **`Password123!`**

```
─────────────────────────────────────────────
Test Credentials (all passwords: Password123!)
─────────────────────────────────────────────
admin@devopsmolvi.com       → ADMIN
manager@devopsmolvi.com     → DESIGN_MANAGER
client@devopsmolvi.com      → CLIENT
contractor@devopsmolvi.com  → CONTRACTOR
viewer@devopsmolvi.com      → VIEWER
─────────────────────────────────────────────
```

---

## Available Scripts

Run these from the project root:

| Command | Description |
|---|---|
| `pnpm dev` | Start both API and web in dev mode |
| `pnpm build` | Build both apps for production |
| `pnpm db:seed` | Seed the database with test data |
| `pnpm lint` | Lint with Biome |
| `pnpm format` | Format with Biome |
| `pnpm check:fix` | Lint + format fix |

---

## API

- Base URL: `http://localhost:4200/api/v1`
- Swagger Docs: [http://localhost:4200/api/docs](http://localhost:4200/api/docs)
- Auth: HTTP-only cookie (`access_token`) set on login

### Key Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/logout` | Logout |
| GET | `/api/v1/auth/me` | Current user |
| GET | `/api/v1/projects` | List projects |
| POST | `/api/v1/projects` | Create project |
| GET | `/api/v1/projects/:id` | Get project |
| GET | `/api/v1/projects/:id/tasks` | List tasks |
| GET | `/api/v1/users` | List users |

---

## Deployment (Ubuntu/EC2)

### Nginx config

```nginx
server {
    listen 80;
    server_name your-server-ip-or-domain;

    location /api/ {
        proxy_pass http://localhost:4200/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Running with PM2

```bash
npm install -g pm2

# Build the web app first
cd apps/web && pnpm build && cd ../..

# Start both processes
pm2 start "pnpm run start -- -p 4000" --name web --cwd apps/web
pm2 start "pnpm run start:prod" --name api --cwd apps/api

pm2 save
pm2 startup
```

### Production environment variables

Update `apps/api/.env` for production:

```env
NODE_ENV=production
CORS_ORIGIN=http://your-server-ip
```

> Once you add HTTPS/SSL, update the cookie options in `apps/api/src/auth/auth.service.ts` to re-enable `secure: true` and `sameSite: 'strict'`.

---

## Features

- JWT authentication via HTTP-only cookies
- Role-based access (Admin, Design Manager, Client, Contractor, Viewer)
- Project management with status tracking and budget monitoring
- Task management per project with comments
- Team/user management
- Swagger API documentation
- Monorepo with shared types between frontend and backend

---

## License

MIT
