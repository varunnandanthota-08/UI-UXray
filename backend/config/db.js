const mongoose = require('mongoose')

mongoose.set('bufferCommands', false)

let databaseConnected = false

mongoose.connection.on('connected', () => {
  databaseConnected = true
})

mongoose.connection.on('disconnected', () => {
  databaseConnected = false
})

mongoose.connection.on('error', () => {
  databaseConnected = false
})

async function connectDB() {
  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI is not configured; starting without a database connection.')
    return false
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI)
    databaseConnected = true
    console.log('MongoDB connected successfully')
    return true
  } catch (error) {
    databaseConnected = false
    console.error(
      `MongoDB connection failed: name=${error.name || 'UnknownError'} code=${error.code ?? 'N/A'} reason=${error.reason?.type || error.message || 'Unknown'}`,
    )
    return false
  }
}

function isDatabaseConnected() {
  return databaseConnected && mongoose.connection.readyState === 1
}

module.exports = { connectDB, isDatabaseConnected }
