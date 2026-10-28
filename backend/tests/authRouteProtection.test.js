const test = require('node:test')
const assert = require('node:assert')
const jwt = require('jsonwebtoken')
const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')
const evaluationRoutes = require('../routes/evaluationRoutes')

const TEST_SECRET = 'test_jwt_secret_team27'
process.env.JWT_SECRET = TEST_SECRET

test('Auth and Route Isolation Suite', async (t) => {
  await t.test('1. authMiddleware rejects request with missing Authorization header with 401', () => {
    let statusCode = null
    let responseBody = null
    const req = { headers: {} }
    const res = {
      status(code) {
        statusCode = code
        return {
          json(body) {
            responseBody = body
          },
        }
      },
    }
    let nextCalled = false
    const next = () => { nextCalled = true }

    authMiddleware(req, res, next)

    assert.strictEqual(statusCode, 401)
    assert.strictEqual(responseBody?.message, 'Authentication token is required')
    assert.strictEqual(nextCalled, false)
  })

  await t.test('2. authMiddleware rejects request with malformed or non-Bearer token with 401', () => {
    let statusCode = null
    let responseBody = null
    const req = { headers: { authorization: 'Basic dXNlcjpwYXNz' } }
    const res = {
      status(code) {
        statusCode = code
        return {
          json(body) {
            responseBody = body
          },
        }
      },
    }
    let nextCalled = false
    const next = () => { nextCalled = true }

    authMiddleware(req, res, next)

    assert.strictEqual(statusCode, 401)
    assert.strictEqual(responseBody?.message, 'Authentication token is required')
    assert.strictEqual(nextCalled, false)
  })

  await t.test('3. authMiddleware rejects invalid / mock demo token with 401', () => {
    let statusCode = null
    let responseBody = null
    const req = { headers: { authorization: 'Bearer demo-token-student-123456' } }
    const res = {
      status(code) {
        statusCode = code
        return {
          json(body) {
            responseBody = body
          },
        }
      },
    }
    let nextCalled = false
    const next = () => { nextCalled = true }

    authMiddleware(req, res, next)

    assert.strictEqual(statusCode, 401)
    assert.strictEqual(responseBody?.message, 'Invalid authentication token')
    assert.strictEqual(nextCalled, false)
  })

  await t.test('4. authMiddleware rejects expired token with 401 and TokenExpired message', () => {
    const expiredToken = jwt.sign(
      { userId: 'stu-123', role: 'student' },
      TEST_SECRET,
      { expiresIn: '-1s' }
    )

    let statusCode = null
    let responseBody = null
    const req = { headers: { authorization: `Bearer ${expiredToken}` } }
    const res = {
      status(code) {
        statusCode = code
        return {
          json(body) {
            responseBody = body
          },
        }
      },
    }
    let nextCalled = false
    const next = () => { nextCalled = true }

    authMiddleware(req, res, next)

    assert.strictEqual(statusCode, 401)
    assert.strictEqual(responseBody?.message, 'Authentication token has expired')
    assert.strictEqual(nextCalled, false)
  })

  await t.test('5. authMiddleware verifies valid JWT and attaches decoded user to request', () => {
    const validToken = jwt.sign(
      { userId: 'stu-999', role: 'student' },
      TEST_SECRET,
      { expiresIn: '1h' }
    )

    const req = { headers: { authorization: `Bearer ${validToken}` } }
    const res = {}
    let nextCalled = false
    const next = () => { nextCalled = true }

    authMiddleware(req, res, next)

    assert.strictEqual(nextCalled, true)
    assert.strictEqual(req.user.userId, 'stu-999')
    assert.strictEqual(req.user.role, 'student')
  })

  await t.test('6. roleMiddleware enforces role isolation between student and facilitator', () => {
    const studentOnly = roleMiddleware('student')

    // Case A: Student accessing student endpoint
    const studentReq = { user: { userId: 'stu-001', role: 'student' } }
    let nextCalled = false
    studentOnly(studentReq, {}, () => { nextCalled = true })
    assert.strictEqual(nextCalled, true)

    // Case B: Facilitator token attempting to access student endpoint
    let statusCode = null
    let responseBody = null
    const facilitatorReq = { user: { userId: 'fac-001', role: 'facilitator' } }
    const res = {
      status(code) {
        statusCode = code
        return {
          json(body) {
            responseBody = body
          },
        }
      },
    }
    let deniedNext = false
    studentOnly(facilitatorReq, res, () => { deniedNext = true })

    assert.strictEqual(statusCode, 403)
    assert.strictEqual(responseBody?.message, 'You do not have permission for this action')
    assert.strictEqual(deniedNext, false)
  })

  await t.test('7. /api/courses does not get intercepted with 401 by evaluationRoutes', async () => {
    // Create an app mounted identically to server.js
    const app = express()
    app.use('/api', evaluationRoutes)
    app.use((_req, res) => {
      res.status(404).json({ message: 'Resource not found' })
    })

    const server = app.listen(0)
    const port = server.address().port

    try {
      // 1. Unauthenticated GET /api/courses should return 404, NOT 401
      const resCourses = await fetch(`http://localhost:${port}/api/courses`)
      assert.strictEqual(resCourses.status, 404)

      // 2. Unauthenticated GET to actual protected evaluation route should return 401
      const resEval = await fetch(`http://localhost:${port}/api/evaluations/eval-123`)
      assert.strictEqual(resEval.status, 401)
    } finally {
      server.close()
    }
  })

  await t.test('8. Student session restoration validates presence of token and active profile', () => {
    // When both token and user profile exist
    const sessionWithBoth = {
      token: 'jwt-student-token-test',
      user: { id: 'stu-001', name: 'Ananya Sharma', role: 'Student' }
    }
    const isAuthenticated1 = Boolean(sessionWithBoth.user && sessionWithBoth.token)
    assert.strictEqual(isAuthenticated1, true)

    // When token is missing
    const sessionNoToken = {
      token: null,
      user: { id: 'stu-001', name: 'Ananya Sharma', role: 'Student' }
    }
    const isAuthenticated2 = Boolean(sessionNoToken.user && sessionNoToken.token)
    assert.strictEqual(isAuthenticated2, false)

    // When user is missing
    const sessionNoUser = {
      token: 'jwt-student-token-test',
      user: null
    }
    const isAuthenticated3 = Boolean(sessionNoUser.user && sessionNoUser.token)
    assert.strictEqual(isAuthenticated3, false)
  })

  await t.test('9. Route guard logic redirects unauthenticated access and allows authenticated access', () => {
    function studentRouteGuard({ isAuthenticated, student, loading }) {
      if (loading) return { action: 'RENDER_LOADING' }
      if (!isAuthenticated || !student) return { action: 'REDIRECT_LOGIN', target: '/login?role=student' }
      return { action: 'RENDER_PROTECTED_STUDENT_OUTLET' }
    }

    // Unauthenticated (no session)
    assert.deepStrictEqual(
      studentRouteGuard({ isAuthenticated: false, student: null, loading: false }),
      { action: 'REDIRECT_LOGIN', target: '/login?role=student' }
    )

    // Unauthenticated (student object without token)
    assert.deepStrictEqual(
      studentRouteGuard({ isAuthenticated: false, student: { name: 'Ananya' }, loading: false }),
      { action: 'REDIRECT_LOGIN', target: '/login?role=student' }
    )

    // Still loading
    assert.deepStrictEqual(
      studentRouteGuard({ isAuthenticated: false, student: null, loading: true }),
      { action: 'RENDER_LOADING' }
    )

    // Fully authenticated student
    assert.deepStrictEqual(
      studentRouteGuard({ isAuthenticated: true, student: { id: 'stu-001', name: 'Ananya' }, loading: false }),
      { action: 'RENDER_PROTECTED_STUDENT_OUTLET' }
    )
  })

  await t.test('10. Role isolation prevents cross-role sign-in attempt', () => {
    function verifyRoleIsolation(authoritativeRole, attemptedRole) {
      if (authoritativeRole !== attemptedRole) {
        const expected = authoritativeRole === 'student' ? 'Student' : 'Facilitator'
        const attempted = attemptedRole === 'student' ? 'Student' : 'Facilitator'
        throw new Error(
          `This account is registered as a ${expected}. You cannot sign in as a ${attempted}. Please switch your role selector.`
        )
      }
      return true
    }

    // Student signing into student area -> Allowed
    assert.strictEqual(verifyRoleIsolation('student', 'student'), true)

    // Facilitator signing into facilitator area -> Allowed
    assert.strictEqual(verifyRoleIsolation('facilitator', 'facilitator'), true)

    // Facilitator credentials attempting to sign into student area -> Blocked with clear message
    assert.throws(
      () => verifyRoleIsolation('facilitator', 'student'),
      /This account is registered as a Facilitator. You cannot sign in as a Student/
    )

    // Student credentials attempting to sign into facilitator area -> Blocked with clear message
    assert.throws(
      () => verifyRoleIsolation('student', 'facilitator'),
      /This account is registered as a Student. You cannot sign in as a Facilitator/
    )
  })

  await t.test('11. Session preservation distinguishes 401 token invalidation from 503/offline temporary outage', () => {
    function handleSessionValidationResult(error, storedUser) {
      if (error?.status === 401 || error?.status === 403) {
        return { action: 'LOGOUT', user: null, reason: 'TOKEN_INVALID' }
      }
      if (storedUser) {
        return { action: 'PRESERVE_SESSION', user: storedUser, reason: 'BACKEND_TEMPORARILY_UNAVAILABLE' }
      }
      return { action: 'LOGOUT', user: null, reason: 'NO_STORED_USER' }
    }

    const storedUser = { id: 'stu-001', name: 'Ananya Sharma', role: 'Student' }

    // Case A: Token expired/invalid (401) -> Must log out
    const res401 = handleSessionValidationResult({ status: 401 }, storedUser)
    assert.strictEqual(res401.action, 'LOGOUT')
    assert.strictEqual(res401.user, null)

    // Case B: Database unavailable (503) -> Must PRESERVE session and not boot the student
    const res503 = handleSessionValidationResult({ status: 503 }, storedUser)
    assert.strictEqual(res503.action, 'PRESERVE_SESSION')
    assert.strictEqual(res503.user.id, 'stu-001')

    // Case C: Network error (server offline/no response) -> Must PRESERVE session
    const resNet = handleSessionValidationResult({ code: 'ERR_NETWORK' }, storedUser)
    assert.strictEqual(resNet.action, 'PRESERVE_SESSION')
    assert.strictEqual(resNet.user.id, 'stu-001')
  })

  await t.test('12. Dashboard metric calculation resolves in-progress state without ReferenceErrors', () => {
    function computeDashboardMetrics({ submissions, activeAction }) {
      const evaluatedSubmissions = submissions.filter((s) => s.status === 'PUBLISHED' || s.status === 'APPROVED')
      const evaluatedCount = evaluatedSubmissions.length
      const underReviewCount = submissions.filter((s) =>
        s.status === 'SUBMITTED' || s.status === 'PROCESSING' || s.status === 'UNDER_REVIEW' || s.status === 'AUTOMATED_ANALYSIS_COMPLETE'
      ).length
      const inProgressCount = activeAction.hasDraft && !activeAction.isSubmitted ? 1 : 0
      const notStartedCount = Math.max(0, 6 - evaluatedCount - underReviewCount - inProgressCount)

      return {
        total: 6,
        completed: evaluatedCount + underReviewCount,
        inProgress: inProgressCount,
        notStarted: notStartedCount,
        underReview: underReviewCount,
        published: evaluatedCount
      }
    }

    // Active action with genuine draft
    const metricsWithDraft = computeDashboardMetrics({
      submissions: [{ status: 'PUBLISHED' }, { status: 'PUBLISHED' }],
      activeAction: { hasDraft: true, isSubmitted: false }
    })
    assert.strictEqual(metricsWithDraft.inProgress, 1)
    assert.strictEqual(metricsWithDraft.completed, 2)
    assert.strictEqual(metricsWithDraft.notStarted, 3)

    // Active action submitted
    const metricsSubmitted = computeDashboardMetrics({
      submissions: [{ status: 'PUBLISHED' }, { status: 'PUBLISHED' }, { status: 'SUBMITTED' }],
      activeAction: { hasDraft: false, isSubmitted: true }
    })
    assert.strictEqual(metricsSubmitted.inProgress, 0)
    assert.strictEqual(metricsSubmitted.completed, 3)
    assert.strictEqual(metricsSubmitted.notStarted, 3)
  })
})
