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

## Containerization (Docker)

### Prerequisites

- Docker installed
- Create the shared network (one-time setup):

```bash
docker network create the-swagger-net
```

### Build Images

```bash
# Database
docker build -f Dockerfile.db -t swagger-db:latest .

# API
docker build -f Dockerfile.api -t swagger-api:latest .

# Web
docker build -f Dockerfile.web -t swagger-web:latest .
```

### Run Containers

Run in this order — DB must be up before the API starts.

```bash
# 1. Database
docker run -d \
  --name the-swagger-db \
  --network the-swagger-net \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  swagger-db:latest

# 2. API (migrations + seed run automatically on startup)
docker run -d \
  --name the-swagger-api \
  --network the-swagger-net \
  -p 4200:4200 \
  -e DATABASE_URL="postgresql://postgres:postgres@the-swagger-db:5432/the_swagger_dev?schema=public" \
  -e JWT_SECRET="your-super-secret-jwt-key-change-in-production" \
  -e JWT_EXPIRES_IN="7d" \
  -e PORT=4200 \
  -e NODE_ENV=production \
  -e COOKIE_SECRET="your-cookie-secret-change-in-production" \
  -e CORS_ORIGIN="http://localhost:4000" \
  swagger-api:latest

# 3. Web
docker run -d \
  --name swagger-web \
  --network the-swagger-net \
  -p 4000:4000 \
  -e API_BASE_URL=http://the-swagger-api:4200 \
  swagger-web:latest
```

### Test Accounts

See the [Test Accounts](#test-accounts) section above. The API container automatically runs migrations and seeds the database on first startup.

### Ports

| Service | Port |
|---|---|
| Web | 4000 |
| API | 4200 |
| PostgreSQL | 5432 |

The app as in the final live version :)

<img width="1521" height="836" alt="image" src="https://github.com/user-attachments/assets/051c2b8c-968b-47c5-abe5-50b3bbfdee0c" />

<img width="1274" height="845" alt="image" src="https://github.com/user-attachments/assets/f9b2f24d-6e2f-46b7-a684-62e658fe9600" />

<img width="1860" height="736" alt="image" src="https://github.com/user-attachments/assets/d8f63d34-faaf-4386-b0a7-6f41a112cd51" />

<img width="1883" height="807" alt="image" src="https://github.com/user-attachments/assets/5d11c722-79e4-453b-92ba-a0100377f72e" />



