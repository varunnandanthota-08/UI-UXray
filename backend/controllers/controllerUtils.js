const mongoose = require('mongoose')

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value)
}

function fail(res, status, message) {
  return res.status(status).json({ success: false, message })
}

function ok(res, status, data) {
  return res.status(status).json({ success: true, data })
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map(normalizeString).filter(Boolean)
}

function isHttpUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch (_error) {
    return false
  }
}

function handleControllerError(res, error) {
  if (error?.code === 11000) {
    return fail(res, 409, 'A conflicting resource already exists')
  }

  if (error?.name === 'ValidationError' || error?.name === 'CastError') {
    return fail(res, 400, error.name === 'CastError' ? 'Invalid request data' : error.message)
  }

  if (
    error?.name === 'MongooseError' ||
    (error?.message && (
      error.message.includes('buffering timed out') ||
      error.message.includes('before initial connection is complete')
    ))
  ) {
    return fail(res, 503, 'Database service is unavailable')
  }

  console.error(error)
  return fail(res, 500, 'Internal server error')
}

module.exports = {
  fail,
  handleControllerError,
  isHttpUrl,
  isValidObjectId,
  normalizeString,
  normalizeStringArray,
  ok,
}
