# MindBalance

MindBalance es una plataforma web para bienestar emocional y seguimiento de habitos universitarios. Permite autenticacion, check-in emocional, gestion de micro-habitos, historial, recomendaciones y configuracion de perfil.

## Enlaces

- Despliegue: https://mind-balance-f.vercel.app
- Repositorio: https://github.com/demondcn/MindBalanceF
- Wiki esperada: https://github.com/demondcn/MindBalanceF/wiki

## Tecnologias usadas

- Frontend: React 19, Vite, TypeScript, React Router, Chart.js
- Backend: Node.js, Express, PostgreSQL, JWT
- Testing frontend: Vitest, Testing Library, jsdom
- Testing backend: Vitest, Supertest
- E2E: Playwright
- CI/CD: GitHub Actions
- Documentacion API: Swagger UI + swagger-jsdoc
- Contenedores: Docker, Docker Compose
- Despliegue: Vercel

## Arquitectura general

El repositorio esta dividido en dos aplicaciones principales:

- `frontend/`: interfaz React/Vite y runtime serverless para Vercel bajo `frontend/api`
- `Backend/`: backend Express canónico para desarrollo local, Docker y documentacion
- `Documentacion/`: entregables academicos previos
- `docs/`: evidencias y soporte tecnico adicional

### Flujo de despliegue en Vercel

El proyecto se despliega como un solo proyecto de Vercel con Root Directory `frontend`. Para soportar este escenario, la API Express usada en produccion vive en `frontend/api/_lib` y es consumida por el handler serverless `frontend/api/[...path].js`.

## Estructura resumida

```bash
MindBalanceF/
├── Backend/
│   ├── database/
│   ├── src/
│   └── tests/
├── frontend/
│   ├── api/
│   ├── public/
│   ├── src/
│   └── tests/
├── e2e/
├── docs/
├── docker-compose.yml
├── package.json
└── playwright.config.ts
```

## Instalacion local

### Opcion 1: desde la raiz del repositorio

```bash
npm install
npm run dev
```

Esto levanta:

- backend Express en `http://localhost:3000`
- frontend Vite en `http://localhost:5173`

### Opcion 2: con Docker Compose

```bash
docker compose up --build
```

## Variables de entorno

Variables declaradas en [`.env.example`](./.env.example):

```env
POSTGRES_DB=mindbalance
POSTGRES_USER=mindbalance_user
POSTGRES_PASSWORD=your_password_here
POSTGRES_PORT=5432
BACKEND_PORT=3000
DATABASE_URL=postgres://mindbalance_user:your_password_here@localhost:5432/mindbalance
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1d
VITE_API_BASE_URL=/api
VITE_DEV_API_PROXY_TARGET=http://localhost:3000
```

Variables utiles en `frontend/.env.example`:

```env
VITE_API_BASE_URL=/api
```

## Base de datos

Antes de probar autenticacion, emociones o habitos, inicializa PostgreSQL con:

```bash
Backend/database/init.sql
```

Si usas Docker Compose, el archivo se monta automaticamente en el contenedor `postgres`.

## Scripts principales

### Desde la raiz

```bash
npm install
npm run dev
npm run build
npm run test
npm run test:coverage
npx playwright install
npm run test:e2e
```

### Por workspace

Frontend:

```bash
npm run build --workspace frontend
npm run test --workspace frontend
npm run test:coverage --workspace frontend
```

Backend:

```bash
npm run test --workspace mindbalance-backend
npm run test:coverage --workspace mindbalance-backend
```

## Pruebas y coverage

Se configuraron:

- pruebas unitarias frontend con Vitest + Testing Library + jsdom
- pruebas unitarias e integracion backend con Vitest + Supertest
- pruebas E2E con Playwright

Cobertura objetivo:

- `frontend`: mayor o igual a 85%
- `Backend`: mayor o igual a 85%

Comandos:

```bash
npm run test
npm run test:coverage
```

## Pruebas de integracion incluidas

Se agregaron pruebas de integracion para:

- registro/autenticacion
- registro emocional autenticado
- seguimiento de habitos
- consulta de recomendaciones
- exposicion de Swagger/OpenAPI

## End to End

Las pruebas E2E validan:

- carga de la landing principal
- navegacion por autenticacion, registro y recuperacion
- navegacion por dashboard, habitos, historial, bienestar y perfil

Importante:

- los E2E usan mocks de `/api` en el navegador
- no dependen de datos privados ni de un backend real

## Swagger / API Docs

La API Express expone:

- Swagger UI: `/api-docs`
- OpenAPI JSON: `/openapi.json`

Rutas esperadas:

- local backend: `http://localhost:3000/api-docs`
- Vercel: `https://mind-balance-f.vercel.app/api-docs`

## Docker

### Build manual

Backend:

```bash
docker build -f Backend/Dockerfile Backend
```

Frontend:

```bash
docker build -f frontend/Dockerfile frontend
```

### Compose

```bash
docker compose up --build
```

Servicios que levanta Compose:

- `frontend`
- `backend`
- `postgres`

## CI/CD con GitHub Actions

Se agrego el workflow:

- [`.github/workflows/ci.yml`](./.github/workflows/ci.yml)

El pipeline corre en `push` a `main` y en `pull_request`, e incluye:

- checkout
- setup-node
- `npm install`
- `npm run lint --if-present`
- `npm run build`
- `npm run test`
- `npm run test:coverage`
- `npx playwright install --with-deps chromium`
- `npm run test:e2e`

## Despliegue en Vercel

Configuracion recomendada:

- un solo proyecto de Vercel
- Root Directory: `frontend`
- variables: `DATABASE_URL` o `POSTGRES_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`
- `VITE_API_BASE_URL=/api`

La ruta `/api-docs` en Vercel se resuelve mediante [`frontend/vercel.json`](./frontend/vercel.json), que reescribe hacia la API serverless del mismo proyecto.

## Evidencias academicas

La guia de evidencias a capturar esta en:

- [`docs/EVIDENCIAS_ACTIVIDAD_6.md`](./docs/EVIDENCIAS_ACTIVIDAD_6.md)

## Notas

- no se usan datos sensibles reales
- la recuperacion de contrasena registra la solicitud, pero no envia correo real aun
- el backend canónico esta en `Backend/src`
- el runtime de produccion en Vercel usa la copia dentro de `frontend/api/_lib`
