# Demo Inventario

A **production-ready inventory management system** built with a modern full-stack and a strict Clean Architecture scaffold.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **API** | Node.js 20, Express 4, TypeScript 5 |
| **Frontend** | Next.js 14, React 18, Tailwind CSS 3 |
| **Database** | PostgreSQL 16 |
| **Infrastructure** | Docker, Docker Compose |
| **Testing** | Jest, ts-jest |
| **Linting** | ESLint, Prettier |

---

## Project Structure

```
demo-inventario/
├── packages/
│   ├── api/                    # Express API (TypeScript)
│   │   ├── src/server.ts       # HTTP server entry point
│   │   ├── tsconfig.json
│   │   ├── Dockerfile
│   │   └── package.json
│   └── web/                    # Next.js frontend
│       ├── app/                # Next.js App Router pages
│       ├── components/         # React components
│       ├── lib/                # API client & hooks
│       ├── Dockerfile
│       └── package.json
│
├── src/                        # Clean Architecture source (shared by API)
│   ├── domain/                 # Entities, Value Objects, Repository Interfaces
│   ├── application/            # Use Cases, DTOs, Mappers
│   ├── infrastructure/         # PostgreSQL repos, DB client, Logger, Config
│   └── interfaces/             # Express Controllers, Routes, Middleware
│
├── docker-compose.yml          # Development environment
├── docker-compose.prod.yml     # Production environment
├── .env.example                # Environment variable template
└── README.md
```

---

## Clean Architecture Layers

This project strictly enforces the **Dependency Rule**: source code dependencies only point **inward**.

```
interfaces → application → domain
infrastructure → application → domain
```

### `src/domain/` — The Core

The heart of the application. Has **zero external dependencies**.

- **Entities** (`entities/`) — Business objects with identity and lifecycle (e.g., `Product`, `StockMovement`). Protect their own invariants in the constructor.
- **Value Objects** (`value-objects/`) — Immutable, equality-by-value types (e.g., `Money`, `SKU`, `ProductId`).
- **Repository Interfaces** (`repositories/`) — Define *what* persistence can do (`IProductRepository`). Never define *how*.
- **Domain Services** (`services/`) — Business logic spanning multiple entities (e.g., `StockDomainService`).
- **Exceptions** (`exceptions/`) — Domain-specific errors (e.g., `DuplicateSKUException`).

### `src/application/` — Orchestration

Knows **what to do** but not how. Imports only from `domain/`.

- **Use Cases** (`use-cases/`) — One class per use case with a single `execute(dto)` method. Dependencies are injected via constructor.
- **DTOs** (`dtos/`) — Input/output data contracts (plain objects, no domain types).
- **Mappers** (`mappers/`) — Convert domain entities → DTOs.

### `src/infrastructure/` — I/O Implementations

All the real-world integrations. Implements interfaces defined in `domain/`.

- **Repositories** (`repositories/`) — PostgreSQL implementations of domain repository interfaces. Map DB rows ↔ domain entities.
- **Database** (`database/`) — `PostgresClient` (connection pooling), `init.sql`, migrations, seeder.
- **Config** (`config/`) — `env.ts` (single env config source), `logger.ts` (Winston).

### `src/interfaces/` — Entry Points

Translates external input into use case calls. Imports only from `application/`.

- **Controllers** (`http/controllers/`) — Thin adapters: validate → call use case → serialize response.
- **Routes** (`http/routes/`) — Map HTTP verbs/paths to controller methods.
- **Middleware** (`http/middleware/`) — Error handling, request logging, schema validation.
- **Validators** (`http/validators/`) — Schema-level validation with `express-validator`.
- **App** (`http/app.ts`) — **Composition Root**: wires all dependencies together.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- [npm](https://www.npmjs.com/) >= 10

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd demo-inventario

# Install all workspace dependencies
npm install
```

### 2. Configure Environment

```bash
# Copy the example env file
cp .env.example .env
cp packages/api/.env.example packages/api/.env
cp packages/web/.env.example packages/web/.env
```

Edit the `.env` files if needed (defaults work out of the box with Docker Compose).

### 3. Start with Docker Compose (Recommended)

```bash
# Start all services (PostgreSQL, API, Web)
npm run docker:up

# Tail logs
npm run docker:logs

# Stop all services
npm run docker:down
```

Services will be available at:
- **Web App**: http://localhost:3001
- **API**: http://localhost:3000
- **API Health**: http://localhost:3000/health
- **PostgreSQL**: localhost:5432

### 4. Local Development (without Docker)

Ensure PostgreSQL is running, then:

```bash
# Run database migrations
npm run db:migrate --workspace=packages/api

# Seed the database with sample data
npm run db:seed --workspace=packages/api

# Start both API and web app concurrently
npm run dev
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start API + Web in development mode |
| `npm run build` | Build all packages for production |
| `npm run lint` | Run ESLint across all packages |
| `npm run format` | Format all files with Prettier |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run test` | Run Jest tests in the API |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed the database with sample data |
| `npm run docker:up` | Start all Docker services |
| `npm run docker:down` | Stop all Docker services |
| `npm run docker:logs` | Follow Docker service logs |

---

## API Reference

Base URL: `http://localhost:3000`

### Products

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/products` | List products (supports `?search=`, `?category=`, `?isActive=`, `?lowStock=`, `?page=`, `?limit=`) |
| `POST` | `/api/v1/products` | Create a new product |
| `GET` | `/api/v1/products/:id` | Get a product by ID |
| `PATCH` | `/api/v1/products/:id` | Update product fields |
| `DELETE` | `/api/v1/products/:id` | Deactivate a product |

### Stock

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/products/:id/stock` | Adjust stock (IN / OUT / ADJUSTMENT) |
| `GET` | `/api/v1/products/:id/stock/movements` | Get stock movement history |

### Health

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Liveness probe |
| `GET` | `/health/ready` | Readiness probe (checks DB) |

---

## Product Categories

`ELECTRONICS`, `CLOTHING`, `FOOD_AND_BEVERAGE`, `FURNITURE`, `TOOLS`,
`OFFICE_SUPPLIES`, `HEALTH_AND_BEAUTY`, `TOYS`, `AUTOMOTIVE`, `OTHER`

## Supported Currencies

`USD`, `EUR`, `MXN`, `GBP`, `CAD`

---

## Running Tests

```bash
# Run all tests
npm run test --workspace=packages/api

# Watch mode
npm run test:watch --workspace=packages/api

# Coverage report
npm run test:coverage --workspace=packages/api
```

Tests are co-located with their source files in `__tests__/` directories.

---

## Forbidden Patterns (Enforced by Architecture)

The following patterns violate the Clean Architecture dependency rule and are **strictly prohibited**:

- ❌ Importing `infrastructure/` into `domain/` or `application/`
- ❌ Importing `domain/` directly into `interfaces/`
- ❌ Writing SQL in `domain/` or `application/` layers
- ❌ Calling use cases from other use cases directly
- ❌ Returning raw domain entities from use cases (always use DTOs)
- ❌ Business logic in controllers (keep them thin)
- ❌ Using `any` as a shortcut around type contracts
- ❌ Hardcoded credentials (always use environment variables)

---

## Production Deployment

```bash
# Build and start in production mode
docker compose -f docker-compose.prod.yml up -d
```

Ensure all required environment variables are set (see `.env.example`).

---

## License

MIT
