require('dotenv').config()

const cors = require('cors')
const express = require('express')
const { connectDB, isDatabaseConnected } = require('./config/db')
const authRoutes = require('./routes/authRoutes')
const assignmentRoutes = require('./routes/assignmentRoutes')
const submissionRoutes = require('./routes/submissionRoutes')
const evaluationRoutes = require('./routes/evaluationRoutes')

const app = express()
const port = Number(process.env.PORT) || 5000

app.disable('x-powered-by')
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
  process.env.FRONTEND_URL,
  process.env.FACILITATOR_URL,
].filter(Boolean)

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)
app.use(express.json())

app.get('/', (_req, res) => {
  res.json({ message: 'Barabari Evaluation API is running' })
})

app.get('/api/health', (_req, res) => {
  res.json({
    server: 'ok',
    database: isDatabaseConnected() ? 'connected' : 'disconnected',
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/assignments', assignmentRoutes)
app.use('/api/submissions', submissionRoutes)
app.use('/api', evaluationRoutes)

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
