# The Swagger

> Deliver every project on time and on budget — a unified workspace for design and construction teams to plan phases, track budgets, manage milestones, and keep every stakeholder aligned.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | NestJS 11, PostgreSQL 16, Prisma 7.4.2 |
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4 |
| **Auth** | JWT with HTTP-only cookies |
| **Monorepo** | Nx 22 with pnpm |
| **Code Quality** | Biome (lint + format), Husky, lint-staged |
| **Database** | PostgreSQL 16 (Docker) |

---

## 📦 Prerequisites

- **Node.js** v20 or higher
- **pnpm** v9 or higher
- **Docker** (for PostgreSQL)

---

## 🚀 First-Time Setup

### Step 1 — Clone & Install

```bash
git clone <repository-url>
cd the-swagger
pnpm install
```

### Step 2 — Start PostgreSQL

```bash
docker compose up -d
docker ps   # verify it's running
```

### Step 3 — Configure Environment

```bash
cd apps/api
cp .env.example .env
# Edit .env if needed (JWT secret, cookie secret)
```

### Step 4 — Initialise Database

```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma generate
```

### Step 5 — Seed Test Data

```bash
cd ../..
pnpm run db:seed
```

### Step 6 — Start Development

```bash
pnpm nx run-many -t serve,dev
```

---

## 💻 Development URLs

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:4000 |
| **Backend API** | http://localhost:4200/api/v1 |
| **Swagger Docs** | http://localhost:4200/api/docs |

---

## 🔑 Test Credentials

All accounts use password: `Password123!`

| Email | Role |
|-------|------|
| `admin@thedesigncode.studio` | ADMIN |
| `manager@thedesigncode.studio` | DESIGN_MANAGER |
| `client@thedesigncode.studio` | CLIENT |
| `contractor@thedesigncode.studio` | CONTRACTOR |
| `viewer@thedesigncode.studio` | VIEWER |

---

## 📁 Project Structure

```
the-swagger/
├── apps/
│   ├── api/                    # NestJS backend
│   │   ├── src/
│   │   │   ├── auth/           # JWT auth (login, register, me, logout)
│   │   │   ├── users/          # User CRUD + role management
│   │   │   ├── projects/       # Projects + member management
│   │   │   ├── milestones/     # Milestone tracking
│   │   │   ├── tasks/          # Task management + comments
│   │   │   ├── prisma/         # Prisma client service (global)
│   │   │   └── common/         # Guards, decorators, filters
│   │   └── prisma/
│   │       ├── schema.prisma   # Full DB schema
│   │       └── seed.ts         # Test data seeder
│   └── web/                    # Next.js frontend
│       └── src/
│           ├── app/
│           │   ├── (auth)/     # Login page
│           │   └── (dashboard)/# Protected workspace
│           ├── hooks/          # useAuth context
│           └── lib/            # API client, utils
├── libs/
│   └── shared/                 # Shared TypeScript types & constants
├── docker-compose.yml
├── biome.json
└── nx.json
```

---

## 🔐 Role Permissions

| Action | ADMIN | DESIGN_MANAGER | CONTRACTOR | CLIENT | VIEWER |
|--------|-------|----------------|------------|--------|--------|
| View all projects | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create project | ✅ | ✅ | ❌ | ❌ | ❌ |
| Edit project | ✅ | ✅ (own) | ❌ | ❌ | ❌ |
| Manage members | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create tasks | ✅ | ✅ | ✅ | ❌ | ❌ |
| Update tasks | ✅ | ✅ | ✅ (assigned) | ❌ | ❌ |
| Add comments | ✅ | ✅ | ✅ | ✅ | ❌ |
| Change user roles | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 🗄 Database Management

### Prisma Studio (GUI)

```bash
cd apps/api
npx prisma studio
# Opens at http://localhost:5555
```

### DBeaver (recommended)

Connect with:
- **Host:** `localhost:5432`
- **Database:** `the_swagger_dev`
- **Username / Password:** `postgres`

---

## ✅ Code Quality

```bash
pnpm check          # lint + format check
pnpm check:fix      # auto-fix all issues
pnpm format         # format only
pnpm lint           # lint only
```

Pre-commit hooks (Husky + lint-staged) run automatically on `git commit`.

---

## 🧪 Running Services Individually

```bash
pnpm nx dev web      # Frontend only
pnpm nx serve api    # Backend only
pnpm nx run-many -t serve,dev   # Both in parallel
```

## 🏗 Build for Production

```bash
pnpm nx run-many -t build
```

---

## 🐛 Troubleshooting

**Database not connecting?**
```bash
docker ps                  # check container is running
docker compose up -d       # start if stopped
```

**Port already in use?**
```bash
# macOS / Linux
lsof -ti:4200 | xargs kill -9
lsof -ti:4000 | xargs kill -9
```

**Prisma client out of date?**
```bash
cd apps/api
npx prisma generate
```
