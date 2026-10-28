require('dotenv').config()

const cors = require('cors')
const express = require('express')
const { connectDB, isDatabaseConnected } = require('./config/db')
const requireDatabase = require('./middleware/dbCheckMiddleware')
const authRoutes = require('./routes/authRoutes')
const assignmentRoutes = require('./routes/assignmentRoutes')
const submissionRoutes = require('./routes/submissionRoutes')
const evaluationRoutes = require('./routes/evaluationRoutes')
const reevaluationRoutes = require('./routes/reevaluationRoutes')

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

app.use('/api/auth', requireDatabase, authRoutes)
app.use('/api/assignments', requireDatabase, assignmentRoutes)
app.use('/api/submissions', requireDatabase, submissionRoutes)
app.use('/api', evaluationRoutes)
app.use('/api/re-evaluations', requireDatabase, reevaluationRoutes)

app.use((error, _req, res, _next) => {
  if (
    error?.name === 'MongooseError' ||
    (error?.message && (
      error.message.includes('buffering timed out') ||
      error.message.includes('before initial connection is complete')
    ))
  ) {
    return res.status(503).json({ message: 'Database service is unavailable' })
  }
  console.error(error)
  res.status(500).json({ message: 'Internal server error' })
})

async function startServer() {
  try {
    const dbConnected = await connectDB()

    app.listen(port, () => {
      console.log(
        `Barabari Evaluation API listening on port ${port} (database: ${dbConnected ? 'connected' : 'disconnected'})`,
      )
      if (!dbConnected) {
        console.warn(
          'Warning: Database is disconnected. Database-dependent requests will return 503 Service Unavailable.',
        )
      }
    })
  } catch (error) {
    console.error(
      `Backend startup failed: name=${error.name || 'UnknownError'} code=${error.code ?? 'N/A'}`,
    )
  }
}

startServer()
