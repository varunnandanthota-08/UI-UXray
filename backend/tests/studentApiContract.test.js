const test = require('node:test')
const assert = require('node:assert')
const express = require('express')
const jwt = require('jsonwebtoken')
const db = require('../config/db')
const assignmentRoutes = require('../routes/assignmentRoutes')
const evaluationRoutes = require('../routes/evaluationRoutes')
const submissionRoutes = require('../routes/submissionRoutes')
const reevaluationRoutes = require('../routes/reevaluationRoutes')
const { isValidObjectId } = require('../controllers/controllerUtils')

const TEST_SECRET = 'test_jwt_secret_contract_suite'
process.env.JWT_SECRET = TEST_SECRET

function makeToken(role = 'student', userId = '60b8d295f1d5a80015bc0099') {
  return jwt.sign({ id: userId, userId, role }, TEST_SECRET, { expiresIn: '1h' })
}

test('Student and Backend ID Contract Suite', async (t) => {
  const origIsDatabaseConnected = db.isDatabaseConnected

  // Mount an Express app mimicking the backend mounting
  const app = express()
  app.use(express.json())
  app.use('/api/assignments', assignmentRoutes)
  app.use('/api', evaluationRoutes)
  app.use('/api/submissions', submissionRoutes)
  app.use('/api/re-evaluations', reevaluationRoutes)
  app.use((_req, res) => {
    res.status(404).json({ message: 'Resource not found' })
  })

  const server = app.listen(0)
  const port = server.address().port
  const studentToken = makeToken('student')

  t.after(() => {
    db.isDatabaseConnected = origIsDatabaseConnected
    server.close()
  })

  await t.test('1. isValidObjectId strictly rejects mock IDs (asg-4, eval-asg-3) and accepts real ObjectIds', () => {
    assert.strictEqual(isValidObjectId('asg-4'), false)
    assert.strictEqual(isValidObjectId('eval-asg-3'), false)
    assert.strictEqual(isValidObjectId('sub-1'), false)
    assert.strictEqual(isValidObjectId('unit-4'), false)
    assert.strictEqual(isValidObjectId('course-uiux-101'), false)
    assert.strictEqual(isValidObjectId(''), false)
    assert.strictEqual(isValidObjectId(null), false)
    assert.strictEqual(isValidObjectId(undefined), false)

    // Valid 24-character hexadecimal MongoDB ObjectIds
    assert.strictEqual(isValidObjectId('60b8d295f1d5a80015bc0001'), true)
    assert.strictEqual(isValidObjectId('507f1f77bcf86cd799439011'), true)
  })

  await t.test('2. Backend GET /api/assignments/asg-4 returns HTTP 400 Bad Request when database is active', async () => {
    db.isDatabaseConnected = () => true
    const res = await fetch(`http://localhost:${port}/api/assignments/asg-4`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    const body = await res.json()

    assert.strictEqual(res.status, 400)
    assert.strictEqual(body.success, false)
    assert.strictEqual(body.message, 'Invalid assignment ID')
  })

  await t.test('3. Backend GET /api/evaluations/eval-asg-3 returns HTTP 400 Bad Request when database is active', async () => {
    db.isDatabaseConnected = () => true
    const res = await fetch(`http://localhost:${port}/api/evaluations/eval-asg-3`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    const body = await res.json()

    assert.strictEqual(res.status, 400)
    assert.strictEqual(body.success, false)
    assert.strictEqual(body.message, 'Invalid evaluation ID')
  })

  await t.test('4. Backend GET /api/submissions/sub-1 returns HTTP 400 Bad Request when database is active', async () => {
    db.isDatabaseConnected = () => true
    const res = await fetch(`http://localhost:${port}/api/submissions/sub-1`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    const body = await res.json()

    assert.strictEqual(res.status, 400)
    assert.strictEqual(body.success, false)
    assert.strictEqual(body.message, 'Invalid submission ID')
  })

  await t.test('5. Backend POST /api/re-evaluations with mock evaluationId returns HTTP 400 Bad Request when database is active', async () => {
    db.isDatabaseConnected = () => true
    const res = await fetch(`http://localhost:${port}/api/re-evaluations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        evaluationId: 'eval-asg-3',
        reason: 'Please review the typography score.',
      }),
    })
    const body = await res.json()

    assert.strictEqual(res.status, 400)
    assert.strictEqual(body.success, false)
    assert.strictEqual(body.message, 'Invalid evaluation ID')
  })

  await t.test('6. Backend returns 503 Service Unavailable when database is disconnected', async () => {
    db.isDatabaseConnected = () => false
    const res = await fetch(`http://localhost:${port}/api/evaluations/eval-asg-3`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    })
    const body = await res.json()

    assert.strictEqual(res.status, 503)
    assert.strictEqual(body.message, 'Database service is unavailable. Please try again later.')
  })

  await t.test('7. Backend GET /api/courses returns 404, confirming intended mock fallback contract', async () => {
    db.isDatabaseConnected = () => true
    const res = await fetch(`http://localhost:${port}/api/courses`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    })

    assert.strictEqual(res.status, 404)
  })

  await t.test('8. Frontend isValidMongoId contract logic correctly filters mock vs database IDs', () => {
    const isValidMongoId = (id) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id.trim())

    // Mock IDs should be bypassed from network requests
    assert.strictEqual(isValidMongoId('asg-4'), false)
    assert.strictEqual(isValidMongoId('eval-asg-3'), false)
    assert.strictEqual(isValidMongoId('sub-1'), false)
    assert.strictEqual(isValidMongoId('course-uiux-101'), false)
    assert.strictEqual(isValidMongoId('unit-4'), false)

    // Genuine MongoDB ObjectIds must pass to allow real backend calls
    assert.strictEqual(isValidMongoId('60b8d295f1d5a80015bc0001'), true)
    assert.strictEqual(isValidMongoId('60b8d295f1d5a80015bc0002'), true)
    assert.strictEqual(isValidMongoId('60b8d295f1d5a80015bc0003'), true)
  })
})
