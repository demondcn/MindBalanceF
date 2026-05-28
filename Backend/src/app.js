import cors from 'cors'
import express from 'express'
import routes from './routes/index.js'

const app = express()

app.use(cors())
app.use(express.json())

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
