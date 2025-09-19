import express from 'express'
import { ServiceManager } from './services/ServiceManager.js'
import { createApiRoutes } from './routes/api.js'

const PORT = process.env.PORT
const DATABASE_URL = process.env.DATABASE_URL
const REDIS_URL = process.env.REDIS_URL

const app = express()
const serviceManager = new ServiceManager()

app.disable('x-powered-by')
app.use(express.json())
app.use('/api', createApiRoutes(serviceManager))

app.listen(PORT, async () => {
  const envVars = [PORT, DATABASE_URL, REDIS_URL]
  const envVarNames = ['PORT', 'DATABASE_URL', 'REDIS_URL']

  envVars.forEach((variable, i) => {
    if (!variable) {
      console.error(`Error: Environment variable ${envVarNames[i]} is not set.`)
      process.exit(1)
    }
  })

  console.log(`Starting Express server on port ${PORT}...`)

  try {
    await serviceManager.initialize()
  } catch (error) {
    console.error('Service initialization failed: ', error.message)
    process.exit(1)
  }

  console.log(`Exchange API running on http://localhost:${PORT}/api/`)
})
