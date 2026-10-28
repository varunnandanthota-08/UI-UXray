const test = require('node:test')
const assert = require('node:assert')
const fs = require('fs')
const path = require('path')

test('Evaluation Details and Re-Evaluation Workflow Suite', async (t) => {
  // Read frontend mockStudentApi.js to verify mock contracts
  const mockApiCode = fs.readFileSync(
    path.join(__dirname, '../../frontend/src/services/mockStudentApi.js'),
    'utf8'
  )

  await t.test('1. Evaluation criteria scores sum exactly to 17/20 (85%) with Strong Pass badge', () => {
    // Extract mockEvaluations['eval-asg-3'] criteria scores
    const evalMatch = mockApiCode.match(/'eval-asg-3':\s*\{([\s\S]*?gradeBadge:\s*'Strong Pass'[\s\S]*?criteriaBreakdown:\s*\[([\s\S]*?)\]\s*,\s*feedbackSections:)/)
    assert.ok(evalMatch, 'eval-asg-3 exists with Strong Pass badge')

    const criteriaText = evalMatch[2]
    const scoreMatches = [...criteriaText.matchAll(/score:\s*(\d+),\s*maxScore:\s*(\d+)/g)]
    assert.strictEqual(scoreMatches.length, 4, 'Four criteria must be present')

    const scores = scoreMatches.map((m) => ({ score: parseInt(m[1], 10), maxScore: parseInt(m[2], 10) }))
    const totalAwarded = scores.reduce((sum, c) => sum + c.score, 0)
    const totalMax = scores.reduce((sum, c) => sum + c.maxScore, 0)

    assert.strictEqual(totalAwarded, 17, 'Total awarded marks must equal 17')
    assert.strictEqual(totalMax, 20, 'Total max marks must equal 20')
    assert.strictEqual(Math.round((totalAwarded / totalMax) * 100), 85, 'Percentage must equal 85%')
  })

  await t.test('2. Performance labels and percentages agree with actual marks', () => {
    // 5/6 = 83% -> Proficient
    // 4/5 = 80% -> Proficient
    // 4/5 = 80% -> Proficient
    // 4/4 = 100% -> Exemplary
    assert.ok(mockApiCode.includes("title: 'Research & Insights',\n        score: 5,\n        maxScore: 6,\n        status: 'Proficient'") ||
              mockApiCode.includes("title: 'Research & Insights',\r\n        score: 5,\r\n        maxScore: 6,\r\n        status: 'Proficient'"))
    assert.ok(mockApiCode.includes("title: 'User Flow & State Fidelity',\n        score: 4,\n        maxScore: 5,\n        status: 'Proficient'") ||
              mockApiCode.includes("title: 'User Flow & State Fidelity',\r\n        score: 4,\r\n        maxScore: 5,\r\n        status: 'Proficient'"))
    assert.ok(mockApiCode.includes("title: 'UI Fundamentals & Auto-Layout',\n        score: 4,\n        maxScore: 5,\n        status: 'Proficient'") ||
              mockApiCode.includes("title: 'UI Fundamentals & Auto-Layout',\r\n        score: 4,\r\n        maxScore: 5,\r\n        status: 'Proficient'"))
    assert.ok(mockApiCode.includes("title: 'Communication & Organization',\n        score: 4,\n        maxScore: 4,\n        status: 'Exemplary'") ||
              mockApiCode.includes("title: 'Communication & Organization',\r\n        score: 4,\r\n        maxScore: 4,\r\n        status: 'Exemplary'"))
  })

  await t.test('3. Communication & Organization is designated as positive reinforcement strength', () => {
    assert.ok(mockApiCode.includes("isStrength: true"), 'isStrength flag is present for exemplary criterion')
    assert.ok(mockApiCode.includes("actionType: 'strength'"), 'actionType strength is present')
  })

  await t.test('4. Exact submission mapping without array position fallback', () => {
    // Verify getSubmission does not fall back to submissions[0]
    assert.ok(!mockApiCode.includes('sub = submissions[0]'), 'getSubmission must not fallback to submissions[0]')
    assert.ok(mockApiCode.includes('sub || null'), 'getSubmission returns null when not found')

    // Verify getEvaluation does not fall back to eval-asg-3
    assert.ok(!mockApiCode.includes("mockEvaluations['eval-asg-3'];"), 'getEvaluation must not unconditionally fall back to eval-asg-3')
  })

  await t.test('5. Evidence items contain genuine Figma frame inspect URLs', () => {
    const figmaUrls = [...mockApiCode.matchAll(/url:\s*'(https:\/\/www\.figma\.com\/file\/barabari-screen-recreation-ananya\?node-id=[^']+)'/g)]
    assert.strictEqual(figmaUrls.length, 4, 'All four criteria have actual canvas frame node URLs')
  })

  await t.test('6. Duplicate re-evaluation requests are prevented with HTTP 409 Conflict', () => {
    assert.ok(mockApiCode.includes("status: 409"), 'Mock service returns 409 conflict on duplicate pending request')
    assert.ok(mockApiCode.includes("'An active re-evaluation request already exists for this evaluation'"))
  })

  await t.test('7. Reason length validation enforce minimum 10 and maximum 500 characters', () => {
    const evalDetailsCode = fs.readFileSync(
      path.join(__dirname, '../../frontend/src/pages/student/EvaluationDetails.jsx'),
      'utf8'
    )
    assert.ok(evalDetailsCode.includes('cleanReason.length < 10'), 'Validates minimum 10 characters')
    assert.ok(evalDetailsCode.includes('cleanReason.length > 500') || evalDetailsCode.includes('maxLength={500}'), 'Enforces 500 character maximum limit')
    assert.ok(evalDetailsCode.includes('500 characters'), 'Displays character counter to user')
  })

  await t.test('8. EvaluationDetails enforces 6 distinct sections in exact order', () => {
    const evalDetailsCode = fs.readFileSync(
      path.join(__dirname, '../../frontend/src/pages/student/EvaluationDetails.jsx'),
      'utf8'
    )

    const section1 = evalDetailsCode.indexOf('1. Assessment summary, approval status, score, and evaluator')
    const section2 = evalDetailsCode.indexOf('2. Criterion breakdown')
    const section3 = evalDetailsCode.indexOf('3. Observed evidence and submission-frame links')
    const section4 = evalDetailsCode.indexOf('4. Educational feedback')
    const section5 = evalDetailsCode.indexOf('5. Facilitator comments')
    const section6 = evalDetailsCode.indexOf('6. Request Re-evaluation section')

    assert.ok(section1 !== -1, 'Section 1 exists')
    assert.ok(section2 !== -1, 'Section 2 exists')
    assert.ok(section3 !== -1, 'Section 3 exists')
    assert.ok(section4 !== -1, 'Section 4 exists')
    assert.ok(section5 !== -1, 'Section 5 exists')
    assert.ok(section6 !== -1, 'Section 6 exists')

    assert.ok(section1 < section2, 'Section 1 precedes Section 2')
    assert.ok(section2 < section3, 'Section 2 precedes Section 3')
    assert.ok(section3 < section4, 'Section 3 precedes Section 4')
    assert.ok(section4 < section5, 'Section 4 precedes Section 5')
    assert.ok(section5 < section6, 'Section 5 precedes Section 6')
  })

  await t.test('9. Student pre-submission RubricPreview hides marks and weightage but keeps criteria names and descriptions', () => {
    const rubricPreviewCode = fs.readFileSync(
      path.join(__dirname, '../../frontend/src/components/student/RubricPreview.jsx'),
      'utf8'
    )

    // Keeps criterion name and description
    assert.ok(rubricPreviewCode.includes('criterion.name || criterion.title'), 'Criterion name is visible')
    assert.ok(rubricPreviewCode.includes('criterion.description'), 'Criterion description is visible')

    // Hides marks, maximum marks, and weightage
    assert.ok(!rubricPreviewCode.includes('maxMarks'), 'maxMarks is hidden')
    assert.ok(!rubricPreviewCode.includes('criterion.weight'), 'Weightage percentage is hidden')
    assert.ok(!rubricPreviewCode.includes('Weightage:'), 'Weightage label is hidden')
    assert.ok(!rubricPreviewCode.includes('{maxScore} Marks'), 'Total maximum marks is hidden')
  })

  await t.test('10. Student sidebar does not contain standalone Evaluations navigation item', () => {
    const studentSidebarCode = fs.readFileSync(
      path.join(__dirname, '../../frontend/src/components/student/StudentSidebar.jsx'),
      'utf8'
    )

    assert.ok(!studentSidebarCode.includes("label: 'Evaluations'"), 'Evaluations navigation item is removed from student sidebar')
    assert.ok(studentSidebarCode.includes("label: 'My Submissions'"), 'My Submissions is preserved')
    assert.ok(studentSidebarCode.includes("path: '/student/submissions'"), 'My Submissions path is preserved')
  })

  await t.test('11. Facilitator sidebar preserves Evaluations navigation item', () => {
    const facilitatorSidebarCode = fs.readFileSync(
      path.join(__dirname, '../../frontend/src/components/facilitator/FacilitatorSidebar.jsx'),
      'utf8'
    )

    assert.ok(facilitatorSidebarCode.includes("label: 'Evaluations'"), 'Facilitator Evaluations is preserved')
    assert.ok(facilitatorSidebarCode.includes("path: '/facilitator/evaluations'"), 'Facilitator Evaluations path is preserved')
  })

  await t.test('12. Submissions page provides View Evaluation for published submissions and hides unpublished marks', () => {
    const submissionsCode = fs.readFileSync(
      path.join(__dirname, '../../frontend/src/pages/student/Submissions.jsx'),
      'utf8'
    )

    assert.ok(submissionsCode.includes('View Evaluation'), 'View Evaluation action button is present')
    assert.ok(submissionsCode.includes('to={`/student/evaluations/${sub.evaluationId}`}'), 'Links to exact submission evaluation')
    assert.ok(submissionsCode.includes('Attempt {attemptNumber}'), 'Displays attempt number')
    assert.ok(submissionsCode.includes('Under Review'), 'Hides score and displays Under Review when not published')
  })
})
