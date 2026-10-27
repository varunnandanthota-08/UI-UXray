const test = require('node:test')
const assert = require('node:assert')

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000/api'

function unwrap(res) {
  if (res && res.data && typeof res.data === 'object' && 'data' in res.data) {
    return res.data.data
  }
  return res.data
}

async function post(url, data, token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${BASE_URL}${url}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  })
  const json = await res.json().catch(() => ({}))
  return { status: res.status, data: json }
}

async function put(url, data, token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${BASE_URL}${url}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  })
  const json = await res.json().catch(() => ({}))
  return { status: res.status, data: json }
}

async function get(url, token) {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${BASE_URL}${url}`, {
    method: 'GET',
    headers,
  })
  const json = await res.json().catch(() => ({}))
  return { status: res.status, data: json }
}

test('Re-evaluation Workflow End-to-End Suite', { concurrency: 1 }, async (t) => {
  const timestamp = Date.now()
  let facilitatorToken = ''
  let facilitatorId = ''
  let otherFacilitatorToken = ''
  let otherFacilitatorId = ''
  let studentAToken = ''
  let studentAId = ''
  let studentBToken = ''
  let studentBId = ''
  let assignmentId = ''
  let submissionAId = ''
  let evaluationAId = ''
  let reevaluationRequestId = ''

  // Setup accounts, assignment, and initial submission
  await t.test('Setup: Create accounts, assignment, and student submission', async () => {
    // 1. Facilitator 1 (Owner)
    const facRes = await post('/auth/register', {
      name: 'Lead Facilitator',
      email: `reeval.fac1.${timestamp}@barabari.test`,
      password: 'Password123!',
      role: 'facilitator',
    })
    assert.strictEqual(facRes.status, 201)
    facilitatorId = facRes.data.user.id

    const facLogin = await post('/auth/login', {
      email: `reeval.fac1.${timestamp}@barabari.test`,
      password: 'Password123!',
    })
    assert.strictEqual(facLogin.status, 200)
    facilitatorToken = facLogin.data.token

    // 2. Facilitator 2 (Other / Non-owner)
    const otherFacRes = await post('/auth/register', {
      name: 'Other Facilitator',
      email: `reeval.fac2.${timestamp}@barabari.test`,
      password: 'Password123!',
      role: 'facilitator',
    })
    assert.strictEqual(otherFacRes.status, 201)
    otherFacilitatorId = otherFacRes.data.user.id

    const otherFacLogin = await post('/auth/login', {
      email: `reeval.fac2.${timestamp}@barabari.test`,
      password: 'Password123!',
    })
    assert.strictEqual(otherFacLogin.status, 200)
    otherFacilitatorToken = otherFacLogin.data.token

    // 3. Student A (Owner of submission)
    const stuARes = await post('/auth/register', {
      name: 'Aanya Sharma',
      email: `reeval.stuA.${timestamp}@barabari.test`,
      password: 'Password123!',
      role: 'student',
    })
    assert.strictEqual(stuARes.status, 201)
    studentAId = stuARes.data.user.id

    const stuALogin = await post('/auth/login', {
      email: `reeval.stuA.${timestamp}@barabari.test`,
      password: 'Password123!',
    })
    assert.strictEqual(stuALogin.status, 200)
    studentAToken = stuALogin.data.token

    // 4. Student B (Different student)
    const stuBRes = await post('/auth/register', {
      name: 'Bhavin Patel',
      email: `reeval.stuB.${timestamp}@barabari.test`,
      password: 'Password123!',
      role: 'student',
    })
    assert.strictEqual(stuBRes.status, 201)
    studentBId = stuBRes.data.user.id

    const stuBLogin = await post('/auth/login', {
      email: `reeval.stuB.${timestamp}@barabari.test`,
      password: 'Password123!',
    })
    assert.strictEqual(stuBLogin.status, 200)
    studentBToken = stuBLogin.data.token

    // 5. Create published assignment
    const asgRes = await post(
      '/assignments',
      {
        title: `UX Architecture Sprint ${timestamp}`,
        description: 'Design mobile navigation flow and checkout sequence',
        totalMarks: 20,
        deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
        rubric: [
          { name: 'User Flow & State Fidelity', maxMarks: 10 },
          { name: 'Component System Consistency', maxMarks: 10 },
        ],
      },
      facilitatorToken,
    )
    assert.strictEqual(asgRes.status, 201)
    const asgData = unwrap(asgRes)
    assignmentId = asgData._id
    assert.ok(assignmentId, 'assignmentId must exist')

    // Publish assignment
    const pubRes = await put(`/assignments/${assignmentId}`, { status: 'active' }, facilitatorToken)
    assert.strictEqual(pubRes.status, 200)

    // 6. Student A submits
    const subRes = await post(
      `/assignments/${assignmentId}/submissions`,
      {
        figmaUrl: 'https://figma.com/file/reeval-demo-prototype',
      },
      studentAToken,
    )
    assert.strictEqual(subRes.status, 201)
    const subData = unwrap(subRes)
    submissionAId = subData._id
    assert.ok(submissionAId, 'submissionAId must exist')
  })

  // Test: Unapproved evaluation rejection
  await t.test('Validation: Re-evaluation cannot be requested for draft/unapproved evaluations', async () => {
    // Facilitator saves draft evaluation (not approved)
    const draftEvalRes = await post(
      `/submissions/${submissionAId}/evaluation`,
      {
        status: 'draft',
        facilitatorMarks: 12,
        aiSuggestedMarks: 11,
        aiFeedback: { strengths: ['Solid foundation'], improvements: ['Review checkout states'] },
        facilitatorComments: 'Initial draft assessment',
        criteriaResults: [
          { criterionName: 'User Flow & State Fidelity', maxMarks: 10, awardedMarks: 6 },
          { criterionName: 'Component System Consistency', maxMarks: 10, awardedMarks: 6 },
        ],
      },
      facilitatorToken,
    )
    assert.strictEqual(draftEvalRes.status, 201)
    const evalData = unwrap(draftEvalRes)
    evaluationAId = evalData._id
    assert.ok(evaluationAId, 'evaluationAId must exist')

    // Student A tries to request re-evaluation on draft -> should fail (400)
    const reqRes = await post(
      '/re-evaluations',
      {
        evaluationId: evaluationAId,
        reason: 'Please check my checkout nodes again.',
      },
      studentAToken,
    )
    assert.strictEqual(reqRes.status, 400)
    assert.match(reqRes.data.message, /approved/i)
  })

  // Test: Authentication and validation checks
  await t.test('Validation: Reject missing authentication, invalid IDs, and blank reason', async () => {
    // 1. Missing token
    const noAuth = await post('/re-evaluations', {
      evaluationId: evaluationAId,
      reason: 'Valid reason text',
    })
    assert.strictEqual(noAuth.status, 401)

    // 2. Invalid ObjectId
    const badId = await post(
      '/re-evaluations',
      {
        evaluationId: 'invalid-mongodb-id',
        reason: 'Valid reason text',
      },
      studentAToken,
    )
    assert.strictEqual(badId.status, 400)
    assert.match(badId.data.message, /Invalid evaluation ID/i)

    // 3. Blank/missing reason
    const blankReason = await post(
      '/re-evaluations',
      {
        evaluationId: evaluationAId,
        reason: '   ',
      },
      studentAToken,
    )
    assert.strictEqual(blankReason.status, 400)
    assert.match(blankReason.data.message, /Reason is required/i)
  })

  // Test: Facilitator publishes/approves the evaluation
  await t.test('Facilitator approves and publishes initial evaluation (Version 1)', async () => {
    const pubEvalRes = await put(
      `/evaluations/${evaluationAId}`,
      {
        status: 'approved',
        facilitatorMarks: 14,
        finalMarks: 14,
        facilitatorComments: 'Approved initial review. User flow shows solid structure.',
        criteriaResults: [
          { criterionName: 'User Flow & State Fidelity', maxMarks: 10, awardedMarks: 7, facilitatorComment: 'Good' },
          { criterionName: 'Component System Consistency', maxMarks: 10, awardedMarks: 7, facilitatorComment: 'Good' },
        ],
      },
      facilitatorToken,
    )
    assert.strictEqual(pubEvalRes.status, 200)
    const pubData = unwrap(pubEvalRes)
    assert.strictEqual(pubData.status, 'approved')
    assert.strictEqual(pubData.finalMarks, 14)
  })

  // Test: Cross-student access rejection
  await t.test('Security: Student B cannot request re-evaluation for Student A evaluation', async () => {
    const crossReq = await post(
      '/re-evaluations',
      {
        evaluationId: evaluationAId,
        reason: 'Student B trying to request for Student A',
      },
      studentBToken,
    )
    assert.strictEqual(crossReq.status, 403)
    assert.match(crossReq.data.message, /do not own/i)
  })

  // Test: Student A successfully creates re-evaluation request
  await t.test('Success: Student A creates re-evaluation request with required reason', async () => {
    const reqRes = await post(
      '/re-evaluations',
      {
        evaluationId: evaluationAId,
        reason: 'In User Flow, checkout error states are present on frame Checkout_v2 which may have been missed.',
      },
      studentAToken,
    )
    assert.strictEqual(reqRes.status, 201)
    const reqData = unwrap(reqRes)
    assert.ok(reqData.id || reqData._id, 'Request ID should be present')
    assert.strictEqual(reqData.rawStatus, 'pending')
    assert.strictEqual(reqData.status, 'REQUESTED')
    assert.strictEqual(reqData.score, 14)
    reevaluationRequestId = reqData.id || reqData._id
  })

  // Test: Duplicate request prevention
  await t.test('Security: Prevent duplicate active re-evaluation request for the same evaluation', async () => {
    const dupRes = await post(
      '/re-evaluations',
      {
        evaluationId: evaluationAId,
        reason: 'Trying to create another request while one is pending.',
      },
      studentAToken,
    )
    assert.strictEqual(dupRes.status, 409)
    assert.match(dupRes.data.message, /active re-evaluation request already exists/i)
  })

  // Test: Student views their own request
  await t.test('Student A views their own re-evaluation request status', async () => {
    // 1. By re-evaluation request ID
    const viewById = await get(`/re-evaluations/${reevaluationRequestId}`, studentAToken)
    assert.strictEqual(viewById.status, 200)
    const dataById = unwrap(viewById)
    assert.strictEqual(dataById.status, 'REQUESTED')
    assert.strictEqual(dataById.rawStatus, 'pending')
    assert.match(dataById.reason, /checkout error states/i)

    // 2. By evaluation ID (frontend query convenience)
    const viewByEvalId = await get(`/re-evaluations/${evaluationAId}`, studentAToken)
    assert.strictEqual(viewByEvalId.status, 200)
    const dataByEval = unwrap(viewByEvalId)
    assert.strictEqual(dataByEval.status, 'REQUESTED')
  })

  // Test: Student B cannot view Student A re-evaluation
  await t.test('Security: Student B cannot view Student A re-evaluation request', async () => {
    const crossView = await get(`/re-evaluations/${reevaluationRequestId}`, studentBToken)
    assert.strictEqual(crossView.status, 403)
    assert.match(crossView.data.message, /do not own/i)
  })

  // Test: Other facilitator cannot view or decide Student A re-evaluation
  await t.test('Security: Non-owning facilitator cannot view or decide request', async () => {
    // Non-owning facilitator views request
    const crossFacView = await get(`/re-evaluations/${reevaluationRequestId}`, otherFacilitatorToken)
    assert.strictEqual(crossFacView.status, 403)
    assert.match(crossFacView.data.message, /do not own/i)

    // Non-owning facilitator attempts to approve
    const crossFacApprove = await post(
      `/re-evaluations/${reevaluationRequestId}/approve`,
      { facilitatorNotes: 'Unrelated facilitator' },
      otherFacilitatorToken,
    )
    assert.strictEqual(crossFacApprove.status, 403)
  })

  // Test: Owning facilitator lists pending requests
  await t.test('Owning facilitator lists pending requests scoped to their assignments', async () => {
    const listRes = await get('/re-evaluations', facilitatorToken)
    assert.strictEqual(listRes.status, 200)
    const listData = unwrap(listRes)
    assert.ok(Array.isArray(listData), 'Data should be an array')
    const match = listData.find((r) => r.id === reevaluationRequestId || r._id === reevaluationRequestId)
    assert.ok(match, 'Facilitator should see Student A pending re-evaluation request')
    assert.strictEqual(match.studentName, 'Aanya Sharma')
    assert.strictEqual(match.rawStatus, 'pending')
  })

  // Test: Facilitator approves request -> status transitions to under_review
  await t.test('Facilitator approves request to initiate review (under_review)', async () => {
    const approveRes = await post(
      `/re-evaluations/${reevaluationRequestId}/approve`,
      { facilitatorNotes: 'Facilitator initiated review of Checkout_v2 frame.' },
      facilitatorToken,
    )
    assert.strictEqual(approveRes.status, 200)

    // Verify request is now under_review
    const reqStatus = await get(`/re-evaluations/${reevaluationRequestId}`, studentAToken)
    assert.strictEqual(reqStatus.status, 200)
    const reqData = unwrap(reqStatus)
    assert.strictEqual(reqData.rawStatus, 'under_review')
    assert.strictEqual(reqData.status, 'UNDER_REVIEW')
  })

  // Test: Invalid status transition (cannot re-approve once under_review)
  await t.test('Workflow: Cannot re-approve an already under_review request', async () => {
    const reApprove = await post(
      `/re-evaluations/${reevaluationRequestId}/approve`,
      { facilitatorNotes: 'Trying again' },
      facilitatorToken,
    )
    assert.strictEqual(reApprove.status, 409)
    assert.match(reApprove.data.message, /Only pending requests/i)
  })

  // Test: Validation on finalize
  await t.test('Validation: Finalizing re-evaluation requires resolution notes and valid scores', async () => {
    // Missing resolution notes
    const noNotes = await post(
      `/re-evaluations/${reevaluationRequestId}/finalize`,
      {
        revisedTotalScore: 16,
      },
      facilitatorToken,
    )
    assert.strictEqual(noNotes.status, 400)
    assert.match(noNotes.data.message, /Resolution notes are required/i)

    // Negative score
    const negScore = await post(
      `/re-evaluations/${reevaluationRequestId}/finalize`,
      {
        reEvaluationResolutionNotes: 'Valid notes',
        revisedTotalScore: -5,
      },
      facilitatorToken,
    )
    assert.strictEqual(negScore.status, 400)
  })

  // Test: Facilitator finalizes re-evaluation with updated score, resolution notes, and preserves history
  await t.test('Facilitator finalizes re-evaluation, updating marks and preserving Version 1 history', async () => {
    const finalizeRes = await post(
      `/re-evaluations/${reevaluationRequestId}/finalize`,
      {
        reEvaluationResolutionNotes: 'Verified error state nodes in Checkout_v2. Awarded +3 marks on User Flow.',
        revisedScores: {
          'User Flow & State Fidelity': 9,
          'Component System Consistency': 8,
        },
        revisedCriterionFeedback: {
          'User Flow & State Fidelity': 'Edge-case handling confirmed in secondary screen node.',
        },
        revisedTotalScore: 17,
        revisedGeneralFeedback: 'Great responsiveness to facilitator review criteria.',
      },
      facilitatorToken,
    )
    assert.strictEqual(finalizeRes.status, 200)
    const finData = unwrap(finalizeRes)
    assert.strictEqual(finData.score, 17)
    assert.strictEqual(finData.status, 'approved')

    // Verify request is now approved / resolved
    const reqStatus = await get(`/re-evaluations/${reevaluationRequestId}`, studentAToken)
    assert.strictEqual(reqStatus.status, 200)
    const reqData = unwrap(reqStatus)
    assert.strictEqual(reqData.rawStatus, 'approved')
    assert.strictEqual(reqData.status, 'RESOLVED')
    assert.match(reqData.resolutionNotes, /Verified error state/i)

    // Verify evaluation record preserves version history and updated score
    const evalDetails = await get(`/evaluations/${evaluationAId}`, facilitatorToken)
    assert.strictEqual(evalDetails.status, 200)
    const evalData = unwrap(evalDetails)
    assert.strictEqual(evalData.finalMarks, 17)
    assert.ok(Array.isArray(evalData.versions), 'Versions array should exist')
    assert.strictEqual(evalData.versions.length, 1, 'Should have 1 archived historical version')
    assert.strictEqual(evalData.versions[0].finalMarks, 14, 'Archived version should hold original marks of 14')
    assert.strictEqual(evalData.versions[0].versionNumber, 1)
  })

  // Test: Cannot reject or finalize already resolved request
  await t.test('Workflow: Cannot reject or re-finalize already resolved request', async () => {
    const lateReject = await post(
      `/re-evaluations/${reevaluationRequestId}/reject`,
      { declineReason: 'Too late' },
      facilitatorToken,
    )
    assert.strictEqual(lateReject.status, 409)
    assert.match(lateReject.data.message, /already been resolved/i)

    const lateFinalize = await post(
      `/re-evaluations/${reevaluationRequestId}/finalize`,
      {
        reEvaluationResolutionNotes: 'Duplicate finalize',
        revisedTotalScore: 18,
      },
      facilitatorToken,
    )
    assert.strictEqual(lateFinalize.status, 409)
    assert.match(lateFinalize.data.message, /already been resolved/i)
  })

  // Test: Student views updated evaluation without unpublished AI draft marks
  await t.test('Student A views finalized evaluation and does not see unpublished AI draft marks', async () => {
    const stuEval = await get(`/evaluations/${evaluationAId}`, studentAToken)
    assert.strictEqual(stuEval.status, 200)
    const stuData = unwrap(stuEval)
    assert.strictEqual(stuData.finalMarks, 17)
    assert.strictEqual(stuData.aiSuggestedMarks, undefined, 'Student must not see raw AI draft marks')
    assert.strictEqual(stuData.aiFeedback, undefined, 'Student must not see raw AI draft feedback')
  })
})
