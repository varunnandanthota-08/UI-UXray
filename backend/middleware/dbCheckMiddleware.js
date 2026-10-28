const db = require('../config/db')

module.exports = function requireDatabase(_req, res, next) {
  if (!db.isDatabaseConnected()) {
    return res.status(503).json({
      message: 'Database service is unavailable. Please try again later.',
    })
  }
  next()
}
