import cors from 'cors'
import express from 'express'
import swaggerUi from 'swagger-ui-express'
import { getSwaggerSpec } from './docs/swagger.js'
import routes from './routes/index.js'

const app = express()
const swaggerSpec = getSwaggerSpec()
const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://mind-balance-f.vercel.app',
]

function buildAllowedOrigins() {
  return new Set([
    ...defaultAllowedOrigins,
    ...String(process.env.FRONTEND_URL ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    ...String(process.env.CORS_ORIGIN ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    ...String(process.env.CORS_ORIGINS ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  ])
}

const allowedOrigins = buildAllowedOrigins()
const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true)
    }

    return callback(new Error('Origen no permitido por CORS'))
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions))
app.use(express.json())

app.get('/openapi.json', (request, response) => {
  response.json(swaggerSpec)
})

app.get('/api/openapi.json', (request, response) => {
  response.json(swaggerSpec)
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use('/api', routes)

app.use((request, response) => {
  response.status(404).json({
    message: `Ruta no encontrada: ${request.method} ${request.originalUrl}`,
  })
})

app.use((error, request, response, next) => {
  console.error(error)

  response.status(500).json({
    message: 'Error interno del servidor',
  })
})

export default app
