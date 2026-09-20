const mongoose = require('mongoose')

let databaseConnected = false

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
      `MongoDB connection failed: name=${error.name || 'UnknownError'} code=${error.code ?? 'N/A'}`,
    )
    return false
  }
}

function isDatabaseConnected() {
  return databaseConnected && mongoose.connection.readyState === 1
}

module.exports = { connectDB, isDatabaseConnected }
