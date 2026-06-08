# Evidencias Actividad 6

Captura o adjunta evidencia de los siguientes puntos:

## Repositorio y gestion

- URL del repositorio GitHub: `https://github.com/demondcn/MindBalanceF`
- URL del despliegue en Vercel: `https://mind-balance-f.vercel.app`
- URL de la Wiki del repositorio
- URL o captura del tablero Scrum

## Documentacion tecnica

- README actualizado en la raiz del proyecto
- `docker-compose.yml`
- `Backend/Dockerfile`
- `frontend/Dockerfile`
- `frontend/vercel.json`
- Swagger UI en `/api-docs`
- OpenAPI JSON en `/openapi.json`

## Automatizacion y calidad

- Archivo `.github/workflows/ci.yml`
- Captura de al menos 3 ejecuciones exitosas del pipeline en GitHub Actions
- Resultado exitoso de `npm run test`
- Resultado exitoso de `npm run test:coverage`
- Resultado exitoso de `npm run test:e2e`
- Reportes de coverage generados en:
  - `frontend/coverage/`
  - `Backend/coverage/`

## Ejecucion local

- Captura de `npm run dev`
- Captura de `docker compose up --build`
- Captura del sistema funcionando en:
  - landing
  - autenticacion
  - dashboard
  - habitos
  - historial
  - bienestar
  - perfil

## API y backend

- Captura de `http://localhost:3000/api-docs`
- Captura de `https://mind-balance-f.vercel.app/api-docs`
- Evidencia de inicializacion de base de datos con `Backend/database/init.sql`

## Archivos que deben quedar versionados

- `package.json` de la raiz
- `frontend/package.json`
- `Backend/package.json`
- `playwright.config.ts`
- `frontend/vitest.config.ts`
- `Backend/vitest.config.js`
- carpeta `frontend/tests/`
- carpeta `Backend/tests/`
- carpeta `e2e/`
- carpeta `docs/`

## Recomendacion para el informe

Orden sugerido de capturas:

1. Repositorio GitHub
2. README
3. Wiki
4. Tablero Scrum
5. Docker y Compose
6. Swagger/OpenAPI
7. GitHub Actions
8. `npm run test`
9. `npm run test:coverage`
10. `npm run test:e2e`
11. Sistema funcionando en Vercel
