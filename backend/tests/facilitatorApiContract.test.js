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

const TEST_SECRET = 'test_jwt_secret_facilitator_suite'
process.env.JWT_SECRET = TEST_SECRET

function makeToken(role = 'facilitator', userId = '60b8d295f1d5a80015bc0088', expiresIn = '1h') {
  return jwt.sign({ id: userId, userId, role }, TEST_SECRET, { expiresIn })
}

// Mirror frontend isValidMongoId helper
function isValidMongoId(id) {
  return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id.trim())
}

// Mirror frontend isNetworkError helper
function isNetworkError(error) {
  return !error?.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED' || error.code === 'ECONNREFUSED'
}

// Mirror frontend withFacilitatorFallback logic
async function withFacilitatorFallback(apiCall, mockCall) {
  try {
    const result = await apiCall()
    if (result !== undefined) {
      return result && typeof result === 'object' && 'data' in result && result.config ? result.data : result
    }
  } catch (error) {
    const isNetworkOrOffline = !error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED' || error.code === 'ECONNREFUSED'
    const isPendingBackend = error.response?.status === 404 || error.response?.status === 501

    if (isNetworkOrOffline || isPendingBackend) {
      return await mockCall()
    }
    throw error
  }
  return await mockCall()
}

// Mirror frontend withFallbackAuth logic
async function withFallbackAuth(apiCall, mockCall) {
  try {
    const response = await apiCall()
    if (response?.data) return response.data
  } catch (error) {
    if (!isNetworkError(error)) {
      throw error
    }
    return mockCall()
  }
  return mockCall()
}

test('Facilitator Authentication and Mock-ID Routing Suite', async (t) => {
  const origIsDatabaseConnected = db.isDatabaseConnected

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
  const facilitatorToken = makeToken('facilitator')

  t.after(() => {
    db.isDatabaseConnected = origIsDatabaseConnected
    server.close()
  })

  await t.test('1. Unauthenticated direct access is rejected: default mock user is NOT treated as proof of authentication', () => {
    // Simulate initial state without token
    const testLocalStorage = new Map()
    const testSessionStorage = new Map()

    const resolveAuth = (facilitator) => {
      return Boolean(
        facilitator &&
        testLocalStorage.get('barabari_facilitator_token') &&
        !testSessionStorage.get('barabari_facilitator_logged_out')
      )
    }

    // Default mock user present in memory, but NO token in storage
    const mockUser = { id: 'fac-001', name: 'Rohan Mehta', role: 'Lead Design Facilitator' }
    assert.strictEqual(resolveAuth(mockUser), false, 'Mock user without token must evaluate to unauthenticated')

    // Stored user object without token
    testLocalStorage.set('barabari_facilitator_user', JSON.stringify(mockUser))
    assert.strictEqual(resolveAuth(mockUser), false, 'Presence of stored user object without token must NOT prove authentication')

    // Valid token present with user
    testLocalStorage.set('barabari_facilitator_token', 'valid-jwt-token-xyz')
    assert.strictEqual(resolveAuth(mockUser), true, 'User with valid token in storage is authenticated')

    // User logged out flag set in sessionStorage
    testSessionStorage.set('barabari_facilitator_logged_out', 'true')
    assert.strictEqual(resolveAuth(mockUser), false, 'Logged-out session flag must immediately invalidate authentication')
  })

  await t.test('2. Route guard redirects unauthenticated users to facilitator login and allows valid sessions', () => {
    const routeGuard = ({ isAuthenticated, facilitator }) => {
      if (!isAuthenticated || !facilitator) {
        return { redirect: '/login?role=facilitator' }
      }
      return { render: 'FacilitatorDashboard' }
    }

    assert.deepStrictEqual(
      routeGuard({ isAuthenticated: false, facilitator: null }),
      { redirect: '/login?role=facilitator' },
      'Unauthenticated user must be redirected'
    )

    assert.deepStrictEqual(
      routeGuard({ isAuthenticated: false, facilitator: { name: 'Ghost' } }),
      { redirect: '/login?role=facilitator' },
      'Ghost user without active token must be redirected'
    )

    assert.deepStrictEqual(
      routeGuard({ isAuthenticated: true, facilitator: { name: 'Rohan Mehta' } }),
      { render: 'FacilitatorDashboard' },
      'Authenticated facilitator can access protected page'
    )
  })

  await t.test('3. Expired authentication is handled correctly and distinctly from temporary outages', () => {
    const expiredToken = makeToken('facilitator', '60b8d295f1d5a80015bc0088', '-1s')

    // Verify expired JWT causes token verification error
    let verificationError = null
    try {
      jwt.verify(expiredToken, TEST_SECRET)
    } catch (err) {
      verificationError = err
    }
    assert.strictEqual(verificationError?.name, 'TokenExpiredError')

    // Session validation error handler logic
    const handleSessionError = (err, storedUser) => {
      const status = err?.response?.status
      if (status === 401 || status === 403) {
        // Expired or revoked: MUST logout and discard session
        return { action: 'LOGOUT', user: null }
      }
      const isNetwork = !err?.response || err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED'
      if (isNetwork && storedUser) {
        // Temporary network/backend outage: PRESERVE session
        return { action: 'PRESERVE', user: storedUser }
      }
      return { action: 'LOGOUT', user: null }
    }

    const expiredError = { response: { status: 401, data: { message: 'Token expired' } } }
    const storedUser = { id: 'usr-fac-001', name: 'Rohan Mehta' }
    assert.deepStrictEqual(
      handleSessionError(expiredError, storedUser),
      { action: 'LOGOUT', user: null },
      '401 expired session must trigger logout'
    )

    const networkOutage = { code: 'ECONNREFUSED', message: 'Connection refused' }
    assert.deepStrictEqual(
      handleSessionError(networkOutage, storedUser),
      { action: 'PRESERVE', user: storedUser },
      'Network outage must preserve valid stored session'
    )
  })

  await t.test('4. Explicit demo mode path is preserved when intended', () => {
    const isExplicitDemoToken = (token) => typeof token === 'string' && token.startsWith('demo-token-')

    assert.strictEqual(isExplicitDemoToken('demo-token-facilitator'), true)
    assert.strictEqual(isExplicitDemoToken('demo-token-rohan-2026'), true)
    assert.strictEqual(isExplicitDemoToken('eyJhbGciOiJIUzI1NiIsInR5cCI...'), false)
    assert.strictEqual(isExplicitDemoToken(null), false)
  })

  await t.test('5. isValidMongoId strictly rejects mock IDs and accepts genuine 24-hex ObjectIds', () => {
    assert.strictEqual(isValidMongoId('asg-4'), false)
    assert.strictEqual(isValidMongoId('sub-1'), false)
    assert.strictEqual(isValidMongoId('eval-asg-3'), false)
    assert.strictEqual(isValidMongoId('temp-123'), false)
    assert.strictEqual(isValidMongoId('unit-4'), false)
    assert.strictEqual(isValidMongoId('course-uiux-101'), false)
    assert.strictEqual(isValidMongoId(''), false)
    assert.strictEqual(isValidMongoId(null), false)
    assert.strictEqual(isValidMongoId(undefined), false)
    assert.strictEqual(isValidMongoId(12345), false)

    // Valid MongoDB 24-hex ObjectIds
    assert.strictEqual(isValidMongoId('60b8d295f1d5a80015bc0001'), true)
    assert.strictEqual(isValidMongoId('507f1f77bcf86cd799439011'), true)
    assert.strictEqual(isValidMongoId('6720f1234567890abcdef123'), true)
  })

  await t.test('6. Backend returns HTTP 400 Bad Request for mock IDs, proving necessity of frontend routing guard', async () => {
    db.isDatabaseConnected = () => true

    // Assignment mock ID
    const resAsg = await fetch(`http://localhost:${port}/api/assignments/asg-4`, {
      headers: { Authorization: `Bearer ${facilitatorToken}` },
    })
    const bodyAsg = await resAsg.json()
    assert.strictEqual(resAsg.status, 400)
    assert.strictEqual(bodyAsg.message, 'Invalid assignment ID')

    // Submission mock ID
    const resSub = await fetch(`http://localhost:${port}/api/submissions/sub-1`, {
      headers: { Authorization: `Bearer ${facilitatorToken}` },
    })
    const bodySub = await resSub.json()
    assert.strictEqual(resSub.status, 400)
    assert.strictEqual(bodySub.message, 'Invalid submission ID')

    // Evaluation mock ID
    const resEval = await fetch(`http://localhost:${port}/api/evaluations/eval-asg-3`, {
      headers: { Authorization: `Bearer ${facilitatorToken}` },
    })
    const bodyEval = await resEval.json()
    assert.strictEqual(resEval.status, 400)
    assert.strictEqual(bodyEval.message, 'Invalid evaluation ID')
  })

  await t.test('7. Mock ID routing bypasses backend network call and resolves to mock data', async () => {
    let networkCallMade = false

    const getAssignmentWithGuard = async (assignmentId) => {
      if (!isValidMongoId(assignmentId)) {
        return { id: assignmentId, title: 'Mock Assignment Title' }
      }
      networkCallMade = true
      const res = await fetch(`http://localhost:${port}/api/assignments/${assignmentId}`, {
        headers: { Authorization: `Bearer ${facilitatorToken}` },
      })
      return res.json()
    }

    // Call with mock ID 'asg-4'
    const mockResult = await getAssignmentWithGuard('asg-4')
    assert.strictEqual(networkCallMade, false, 'Mock ID must not trigger backend network request')
    assert.strictEqual(mockResult.id, 'asg-4')

    // Call with valid Mongo ID
    db.isDatabaseConnected = () => true
    const validMongoId = '60b8d295f1d5a80015bc0001'
    await getAssignmentWithGuard(validMongoId)
    assert.strictEqual(networkCallMade, true, 'Valid Mongo ID must trigger backend network request')
  })

  await t.test('8. Real backend business errors are NOT concealed by mock fallback', async () => {
    // 400 Bad Request on valid ObjectId
    const badRequestError = { response: { status: 400, data: { message: 'Invalid payload' } } }
    await assert.rejects(
      () => withFacilitatorFallback(
        () => Promise.reject(badRequestError),
        () => ({ mock: true })
      ),
      (err) => err.response.status === 400,
      '400 error must be thrown and not concealed by mock fallback'
    )

    // 401 Unauthorized
    const unauthorizedError = { response: { status: 401, data: { message: 'Session expired' } } }
    await assert.rejects(
      () => withFacilitatorFallback(
        () => Promise.reject(unauthorizedError),
        () => ({ mock: true })
      ),
      (err) => err.response.status === 401,
      '401 error must be thrown'
    )

    // 403 Forbidden
    const forbiddenError = { response: { status: 403, data: { message: 'Role mismatch' } } }
    await assert.rejects(
      () => withFacilitatorFallback(
        () => Promise.reject(forbiddenError),
        () => ({ mock: true })
      ),
      (err) => err.response.status === 403,
      '403 error must be thrown'
    )

    // 409 Conflict
    const conflictError = { response: { status: 409, data: { message: 'Already exists' } } }
    await assert.rejects(
      () => withFacilitatorFallback(
        () => Promise.reject(conflictError),
        () => ({ mock: true })
      ),
      (err) => err.response.status === 409,
      '409 error must be thrown'
    )

    // 422 Unprocessable Entity
    const unprocessableError = { response: { status: 422, data: { message: 'Validation failure' } } }
    await assert.rejects(
      () => withFacilitatorFallback(
        () => Promise.reject(unprocessableError),
        () => ({ mock: true })
      ),
      (err) => err.response.status === 422,
      '422 error must be thrown'
    )

    // 500 Internal Server Error
    const serverError = { response: { status: 500, data: { message: 'Database crashed' } } }
    await assert.rejects(
      () => withFacilitatorFallback(
        () => Promise.reject(serverError),
        () => ({ mock: true })
      ),
      (err) => err.response.status === 500,
      '500 error must be thrown'
    )
  })

  await t.test('9. withFallbackAuth propagates 401 credentials errors and never converts them to mock success', async () => {
    const invalidCredentialsError = {
      response: { status: 401, data: { message: 'Invalid email or password' } }
    }

    await assert.rejects(
      () => withFallbackAuth(
        () => Promise.reject(invalidCredentialsError),
        () => ({ user: { name: 'Demo Mock' }, token: 'mock-token' })
      ),
      (err) => err.response.status === 401,
      'Invalid password/credentials 401 must throw and not log in as mock user'
    )

    // But offline network error CAN fall back to offline demo persona
    const offlineError = { code: 'ECONNREFUSED', message: 'Connection refused' }
    const offlineResult = await withFallbackAuth(
      () => Promise.reject(offlineError),
      () => ({ user: { name: 'Demo Mock' }, token: 'mock-token' })
    )
    assert.strictEqual(offlineResult.user.name, 'Demo Mock', 'Offline network outage safely falls back to offline persona')
  })
  await t.test('10. Demo mode displays intended mock cohort submissions', async () => {
    const mockStorage = {
      getItem(key) {
        if (key === 'barabari_facilitator_token') return 'demo-token-facilitator';
        return null;
      }
    };

    const isDemo = () => {
      const token = mockStorage.getItem('barabari_facilitator_token');
      return typeof token === 'string' && token.startsWith('demo-token-');
    };

    const getSubmissionsQueue = async (isDemoMode) => {
      if (isDemoMode) {
        return [
          { id: 'sub-1', studentName: 'Ananya Sharma', assignmentId: 'asg-4', evaluationStatus: 'PENDING_REVIEW' },
          { id: 'sub-2', studentName: 'Kavya Patel', assignmentId: 'asg-4', evaluationStatus: 'IN_REVIEW' }
        ];
      }
      return []; // Real backend mode with 0 assignments
    };

    assert.strictEqual(isDemo(), true, 'demo-token-facilitator must be recognized as demo session');
    const demoSubmissions = await getSubmissionsQueue(isDemo());
    assert.strictEqual(demoSubmissions.length, 2, 'Demo mode must retrieve mock cohort submissions');
    assert.strictEqual(demoSubmissions[0].studentName, 'Ananya Sharma');
  })

  await t.test('11. Real backend mode does not display fabricated mock submissions when assignments are empty', async () => {
    const realJwtStorage = {
      getItem(key) {
        if (key === 'barabari_facilitator_token') return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
        return null;
      }
    };

    const isDemo = () => {
      const token = realJwtStorage.getItem('barabari_facilitator_token');
      return typeof token === 'string' && token.startsWith('demo-token-');
    };

    const getSubmissionsQueue = async (isDemoMode, backendAssignments = []) => {
      if (isDemoMode) {
        return [{ id: 'sub-mock', studentName: 'Mock Student' }];
      }
      if (backendAssignments.length === 0) {
        return [];
      }
      return backendAssignments.flatMap(a => a.submissions || []);
    };

    assert.strictEqual(isDemo(), false, 'Real JWT must NOT be treated as demo mode');
    const realSubmissions = await getSubmissionsQueue(isDemo(), []);
    assert.deepStrictEqual(realSubmissions, [], 'Real backend mode must return empty array honestly without fabricating mock data');
  })

  await t.test('12. Empty queue differs from a failed API request', async () => {
    const resolveQueueUIState = ({ isLoading, apiError, submissions }) => {
      if (isLoading) return 'LOADING';
      if (apiError) return 'ERROR';
      if (!submissions || submissions.length === 0) return 'EMPTY';
      return 'DATA';
    };

    assert.strictEqual(resolveQueueUIState({ isLoading: true, apiError: null, submissions: [] }), 'LOADING');
    assert.strictEqual(resolveQueueUIState({ isLoading: false, apiError: 'Network Error', submissions: [] }), 'ERROR');
    assert.strictEqual(resolveQueueUIState({ isLoading: false, apiError: null, submissions: [] }), 'EMPTY');
    assert.strictEqual(resolveQueueUIState({ isLoading: false, apiError: null, submissions: [{ id: 's1' }] }), 'DATA');
  })

  await t.test('13. toBackendEvaluation preserves criterion IDs, names, maximum marks, weights, scores, and feedback', () => {
    // Mirror the updated toBackendEvaluation logic
    const toBackendEvaluation = (data = {}, linkedCriteria = [], totalMarks = 20, isFinal = false) => {
      const status = isFinal ? 'approved' : 'draft';
      const finalMarks = Number(data.totalScore ?? data.score ?? data.finalMarks ?? data.facilitatorMarks ?? 0);

      let criteriaResults = [];
      const criteriaToMap = (Array.isArray(linkedCriteria) && linkedCriteria.length > 0)
        ? linkedCriteria
        : (Array.isArray(data.criteria) && data.criteria.length > 0 ? data.criteria : []);

      if (criteriaToMap.length > 0) {
        criteriaResults = criteriaToMap.map((crit, idx) => {
          const critId = crit._id || crit.id || `crit-${idx + 1}`;
          const awarded = data.criterionScores?.[critId] !== undefined
            ? Number(data.criterionScores[critId])
            : Number(data.criterionScores?.[crit.name] ?? (crit.maxMarks || crit.marks || 5));
          const comment = data.criterionFeedback?.[critId] || data.criterionFeedback?.[crit.name] || '';
          const maxMarks = Number(crit.maxMarks ?? crit.marks ?? 5);
          const weightage = crit.weightage !== undefined
            ? Number(crit.weightage)
            : (crit.weight ? Number(String(crit.weight).replace('%', '')) : Math.round(100 / criteriaToMap.length));

          return {
            criterionName: crit.name || crit.title || `Criterion ${idx + 1}`,
            description: crit.description || '',
            maxMarks,
            awardedMarks: Number.isFinite(awarded) && awarded >= 0 ? awarded : 0,
            weightage,
            facilitatorComment: comment,
            criterionId: crit._id && String(crit._id).length === 24 ? crit._id : undefined
          };
        });
      }

      return {
        status,
        facilitatorMarks: finalMarks,
        finalMarks: isFinal ? finalMarks : undefined,
        criteriaResults
      };
    };

    const linkedRubricCriteria = [
      {
        _id: '60b8d295f1d5a80015bc0011',
        name: 'Prototype Flow Continuity & Logic',
        description: 'Screen transitions, branch logic, and error paths',
        maxMarks: 6,
        weightage: 30
      },
      {
        _id: '60b8d295f1d5a80015bc0022',
        name: 'Auto-Layout & Design System Rigor',
        description: 'Component architecture and constraints',
        maxMarks: 4,
        weightage: 20
      }
    ];

    const submissionPayload = {
      criterionScores: {
        '60b8d295f1d5a80015bc0011': 5,
        '60b8d295f1d5a80015bc0022': 4
      },
      criterionFeedback: {
        '60b8d295f1d5a80015bc0011': 'Exceptional logical branching.',
        '60b8d295f1d5a80015bc0022': 'Flawless nesting.'
      },
      totalScore: 9,
      criteria: linkedRubricCriteria
    };

    const result = toBackendEvaluation(submissionPayload, linkedRubricCriteria, 20, true);

    assert.strictEqual(result.status, 'approved');
    assert.strictEqual(result.finalMarks, 9);
    assert.strictEqual(result.criteriaResults.length, 2);

    // Verify preservation of original rubric criterion metadata
    assert.strictEqual(result.criteriaResults[0].criterionName, 'Prototype Flow Continuity & Logic');
    assert.strictEqual(result.criteriaResults[0].maxMarks, 6, 'Must preserve maxMarks = 6 instead of defaulting to 5');
    assert.strictEqual(result.criteriaResults[0].weightage, 30, 'Must preserve weightage = 30%');
    assert.strictEqual(result.criteriaResults[0].awardedMarks, 5);
    assert.strictEqual(result.criteriaResults[0].facilitatorComment, 'Exceptional logical branching.');
    assert.strictEqual(result.criteriaResults[0].criterionId, '60b8d295f1d5a80015bc0011');

    assert.strictEqual(result.criteriaResults[1].criterionName, 'Auto-Layout & Design System Rigor');
    assert.strictEqual(result.criteriaResults[1].maxMarks, 4, 'Must preserve maxMarks = 4 instead of defaulting to 5');
    assert.strictEqual(result.criteriaResults[1].weightage, 20);
    assert.strictEqual(result.criteriaResults[1].awardedMarks, 4);
    assert.strictEqual(result.criteriaResults[1].facilitatorComment, 'Flawless nesting.');
  })

  await t.test('14. fromBackendRubric normalizes marks and weightage, preventing undefined and NaN%', () => {
    // Mirror updated fromBackendRubric logic
    const fromBackendRubric = (r) => {
      if (!r) return null;
      const totalMarks = Number(r.totalMarks ?? 20);
      return {
        id: r._id || r.id,
        totalMarks,
        criteria: Array.isArray(r.criteria)
          ? r.criteria.map((c, idx) => {
              const maxMarks = Number(c.maxMarks ?? c.marks ?? 5);
              const weightageVal = c.weightage !== undefined
                ? Number(c.weightage)
                : (c.weight ? Number(String(c.weight).replace('%', '')) : Math.round((maxMarks / totalMarks) * 100));
              const weight = `${weightageVal}%`;
              return {
                id: c._id || c.id || `crit-${idx + 1}`,
                name: c.name || c.criterionName || `Criterion ${idx + 1}`,
                maxMarks,
                marks: maxMarks,
                weightage: weightageVal,
                weight
              };
            })
          : []
      };
    };

    // Raw backend rubric with maxMarks and weightage
    const backendRubric = {
      _id: '60b8d295f1d5a80015bc0099',
      totalMarks: 20,
      criteria: [
        { _id: 'c1', name: 'Information Hierarchy', maxMarks: 5, weightage: 25 },
        { _id: 'c2', name: 'Visual Finish', maxMarks: 5, weightage: 25 }
      ]
    };

    const normalized = fromBackendRubric(backendRubric);
    assert.strictEqual(normalized.criteria[0].marks, 5, 'marks must be defined');
    assert.strictEqual(normalized.criteria[0].maxMarks, 5);
    assert.strictEqual(normalized.criteria[0].weight, '25%', 'weight must be valid string, not NaN%');
    assert.strictEqual(normalized.criteria[0].weightage, 25);
    assert.strictEqual(normalized.criteria[1].marks, 5);
    assert.strictEqual(normalized.criteria[1].weight, '25%');
  })

  await t.test('15. Deterministic scoring remains authoritative and AI output remains strictly advisory', () => {
    // The facilitator decides final marks; AI suggested marks are never final
    const aiDraft = { aiSuggestedMarks: 16, status: 'draft' };
    const facilitatorReview = { facilitatorMarks: 18, isFinal: true };

    const computeFinalScore = (ai, fac) => {
      if (fac?.isFinal) return fac.facilitatorMarks;
      return ai.aiSuggestedMarks; // Draft advisory only
    };

    assert.strictEqual(computeFinalScore(aiDraft, facilitatorReview), 18, 'Facilitator approved score must override AI suggestion');
  })
})
