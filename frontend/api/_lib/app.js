import cors from 'cors'
import express from 'express'
import swaggerUi from 'swagger-ui-express'
import { getSwaggerSpec } from './docs/swagger.js'
import routes from './routes/index.js'

const app = express()
const swaggerSpec = getSwaggerSpec()

app.use(cors())
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
