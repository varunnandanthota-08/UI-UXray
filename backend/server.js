require('dotenv').config()

const cors = require('cors')
const express = require('express')
const { connectDB, isDatabaseConnected } = require('./config/db')
const authRoutes = require('./routes/authRoutes')

const app = express()
const port = Number(process.env.PORT) || 5000

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())
app.use('/api/auth', authRoutes)

app.get('/', (_req, res) => {
  res.json({ message: 'Barabari Evaluation API is running' })
})

app.get('/api/health', (_req, res) => {
  res.json({
    server: 'ok',
    database: isDatabaseConnected() ? 'connected' : 'disconnected',
  })
})

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ message: 'Internal server error' })
})

async function startServer() {
  try {
    await connectDB()

    app.listen(port, () => {
      console.log(`Barabari Evaluation API listening on port ${port}`)
    })
  } catch (error) {
    console.error(
      `Backend startup failed: name=${error.name || 'UnknownError'} code=${error.code ?? 'N/A'}`,
    )
  }
}

startServer()
