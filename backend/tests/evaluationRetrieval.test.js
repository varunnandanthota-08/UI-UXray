const test = require('node:test')
const assert = require('node:assert')

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000/api'

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

test('Student Evaluation Retrieval API Suite', async (t) => {
  const timestamp = Date.now()
  let facilitatorToken = ''
  let facilitatorId = ''
  let studentAToken = ''
  let studentAId = ''
  let studentBToken = ''
  let studentBId = ''
  let assignmentId = ''
  let submissionAId = ''
  let evaluationAId = ''

  // Setup: Register facilitator and students
  await t.test('Setup: Create facilitator, students, assignment, submission, and evaluation', async () => {
    // 1. Facilitator
    const facRes = await post('/auth/register', {
      name: 'Mentor Facilitator',
      email: `fac.${timestamp}@barabari.test`,
      password: 'Password123!',
      role: 'facilitator',
    })
    assert.strictEqual(facRes.status, 201)
    facilitatorId = facRes.data.user.id

    const facLogin = await post('/auth/login', {
      email: `fac.${timestamp}@barabari.test`,
      password: 'Password123!',
    })
    assert.strictEqual(facLogin.status, 200)
    facilitatorToken = facLogin.data.token
    assert.ok(facilitatorToken, 'Facilitator token should be present')

    // 2. Student A
    const stuARes = await post('/auth/register', {
      name: 'Student Alpha',
      email: `studentA.${timestamp}@barabari.test`,
      password: 'Password123!',
      role: 'student',
    })
    assert.strictEqual(stuARes.status, 201)
    studentAId = stuARes.data.user.id

    const stuALogin = await post('/auth/login', {
      email: `studentA.${timestamp}@barabari.test`,
      password: 'Password123!',
    })
    assert.strictEqual(stuALogin.status, 200)
    studentAToken = stuALogin.data.token

    // 3. Student B
    const stuBRes = await post('/auth/register', {
      name: 'Student Beta',
      email: `studentB.${timestamp}@barabari.test`,
      password: 'Password123!',
      role: 'student',
    })
    assert.strictEqual(stuBRes.status, 201)
    studentBId = stuBRes.data.user.id

    const stuBLogin = await post('/auth/login', {
      email: `studentB.${timestamp}@barabari.test`,
      password: 'Password123!',
    })
    assert.strictEqual(stuBLogin.status, 200)
    studentBToken = stuBLogin.data.token

    // 4. Create active assignment
    const asgRes = await post(
      '/assignments',
      {
        title: `Design Sprint ${timestamp}`,
        description: 'Create an accessible mobile interaction prototype',
        totalMarks: 20,
        deadline: new Date(Date.now() + 86400000 * 5).toISOString(),
        status: 'active',
        requirements: ['Prototype Navigation', 'Responsive Layout'],
      },
      facilitatorToken
    )
    assert.strictEqual(asgRes.status, 201)
    assignmentId = asgRes.data.data._id

    // 5. Student A submits
    const subRes = await post(
      `/assignments/${assignmentId}/submissions`,
      {
        figmaUrl: 'https://www.figma.com/design/sample-key/Student-Design',
        researchNotes: 'Conducted interviews with 3 target users.',
        persona: 'Primary Persona: Mobile user seeking quick checkout.',
      },
      studentAToken
    )
    assert.strictEqual(subRes.status, 201)
    submissionAId = subRes.data.data._id

    // 6. Facilitator creates evaluation
    const evalRes = await post(
      `/submissions/${submissionAId}/ai-draft`,
      {},
      facilitatorToken
    )
    assert.strictEqual(evalRes.status, 200)
    evaluationAId = evalRes.data.data._id
    assert.ok(evaluationAId, 'Evaluation ID must exist')
  })

  // Test 1: Unauthorized Access
  await t.test('Rejects request without authentication token with 401', async () => {
    const res = await get(`/evaluations/${evaluationAId}`)
    assert.strictEqual(res.status, 401)
    assert.strictEqual(res.data.message, 'Authentication token is required')
  })

  // Test 2: Invalid ID format
  await t.test('Rejects malformed evaluation ID with 400', async () => {
    const res = await get('/evaluations/invalid-id-xyz', studentAToken)
    assert.strictEqual(res.status, 400)
    assert.strictEqual(res.data.message, 'Invalid evaluation ID')
  })

  // Test 3: Missing evaluation
  await t.test('Returns 404 for non-existent valid ObjectId', async () => {
    const res = await get('/evaluations/507f1f77bcf86cd799439011', studentAToken)
    assert.strictEqual(res.status, 404)
    assert.strictEqual(res.data.message, 'Evaluation not found')
  })

  // Test 4: Ownership protection across students
  await t.test('Rejects cross-student access with 403 (Student B cannot access Student A evaluation)', async () => {
    const resByEvalId = await get(`/evaluations/${evaluationAId}`, studentBToken)
    assert.strictEqual(resByEvalId.status, 403)
    assert.strictEqual(resByEvalId.data.message, 'You do not own this submission')

    const resBySubId = await get(`/evaluations/${submissionAId}`, studentBToken)
    assert.strictEqual(resBySubId.status, 403)
    assert.strictEqual(resBySubId.data.message, 'You do not own this submission')
  })

  // Test 5: Successful retrieval by Evaluation ID
  await t.test('Allows Student A to retrieve evaluation using Evaluation ID', async () => {
    const res = await get(`/evaluations/${evaluationAId}`, studentAToken)
    assert.strictEqual(res.status, 200)
    assert.strictEqual(res.data.success, true)
    assert.strictEqual(res.data.data._id, evaluationAId)
    assert.strictEqual(res.data.data.submissionId.toString(), submissionAId)
  })

  // Test 6: Successful retrieval by Submission ID (Frontend fallback/link shape)
  await t.test('Allows Student A to retrieve evaluation using Submission ID', async () => {
    const res = await get(`/evaluations/${submissionAId}`, studentAToken)
    assert.strictEqual(res.status, 200)
    assert.strictEqual(res.data.success, true)
    assert.strictEqual(res.data.data._id, evaluationAId)
    assert.strictEqual(res.data.data.submissionId.toString(), submissionAId)
  })

  // Test 7: Facilitator assignment creator can retrieve evaluation
  await t.test('Allows owning facilitator to retrieve evaluation', async () => {
    const res = await get(`/evaluations/${evaluationAId}`, facilitatorToken)
    assert.strictEqual(res.status, 200)
    assert.strictEqual(res.data.success, true)
  })

  // Test 8: Non-owning facilitator cannot access
  await t.test('Rejects non-owning facilitator with 403', async () => {
    const otherFac = await post('/auth/register', {
      name: 'Other Facilitator',
      email: `otherfac.${timestamp}@barabari.test`,
      password: 'Password123!',
      role: 'facilitator',
    })
    const otherLogin = await post('/auth/login', {
      email: `otherfac.${timestamp}@barabari.test`,
      password: 'Password123!',
    })
    const otherToken = otherLogin.data.token

    const res = await get(`/evaluations/${evaluationAId}`, otherToken)
    assert.strictEqual(res.status, 403)
    assert.strictEqual(res.data.message, 'You do not own this assignment')
  })
})
