const test = require('node:test')
const assert = require('node:assert')
const { generateAiDraft } = require('../controllers/evaluationController')
const Rubric = require('../models/Rubric')
const Submission = require('../models/Submission')
const Assignment = require('../models/Assignment')
const Evaluation = require('../models/Evaluation')
const figmaInspector = require('../services/figmaInspector')
const geminiEvaluator = require('../services/geminiEvaluator')
const { CANVA_GUIDANCE_MESSAGE } = require('../services/designUrlValidator')

test('generateAiDraft Controller Unit Integration Suite', async (t) => {
  const facilitatorId = '60b8d295f1d5a80015bc0001'
  const nonOwnerId = '60b8d295f1d5a80015bc0099'
  const assignmentId = '60b8d295f1d5a80015bc0002'
  const submissionId = '60b8d295f1d5a80015bc0003'
  const studentId = '60b8d295f1d5a80015bc0004'

  function createMockRes() {
    return {
      statusCode: null,
      body: null,
      status(code) {
        this.statusCode = code
        return this
      },
      json(payload) {
        this.body = payload
        return this
      },
    }
  }

  // Backup original model and service methods
  const origFindByIdSub = Submission.findById
  const origFindByIdAsg = Assignment.findById
  const origFindOneRubric = Rubric.findOne
  const origFindOneEval = Evaluation.findOne
  const origCreateEval = Evaluation.create
  const origInspectFigmaDesign = figmaInspector.inspectFigmaDesign
  const origEvaluateWithGemini = geminiEvaluator.evaluateWithGemini

  t.after(() => {
    Submission.findById = origFindByIdSub
    Assignment.findById = origFindByIdAsg
    Rubric.findOne = origFindOneRubric
    Evaluation.findOne = origFindOneEval
    Evaluation.create = origCreateEval
    figmaInspector.inspectFigmaDesign = origInspectFigmaDesign
    geminiEvaluator.evaluateWithGemini = origEvaluateWithGemini
  })

  await t.test('1. Calculates weighted score correctly with genuine Gemini evaluation and verifies Figma evidence', async () => {
    figmaInspector.inspectFigmaDesign = async () => ({
      ok: true,
      metadata: {
        fileKey: 'my-valid-figma-key-123',
        documentName: 'Checkout-Flow',
        lastModified: '2026-03-01T12:00:00Z',
        version: '1.0',
      },
      evidence: {
        catalogue: [
          { id: '1:1', name: 'Checkout Page', type: 'FRAME' },
        ],
        summary: {
          totalNodesScanned: 25,
          nodesRetained: 25,
          totalFramesCount: 4,
          totalTextNodesCount: 10,
          totalComponentsCount: 2,
          uniqueColorCount: 5,
          colors: ['#000000', '#ffffff'],
          typography: [{ fontFamily: 'Inter', fontSize: 16 }],
          maxDepthReached: 3,
          truncated: false,
        },
      },
      inspectedAt: '2026-03-01T12:00:00Z',
    })

    geminiEvaluator.evaluateWithGemini = async () => ({
      ok: true,
      data: {
        criteriaEvaluations: [
          {
            criterionName: 'UI & Figma Prototype',
            ratio: 0.9,
            status: 'PASS',
            notes: 'Verified accessible Figma file Checkout-Flow with 4 auto-layout frames and 2 components.',
            observations: ['Checkout-Flow contains 4 frames and 2 components'],
            missing: [],
            suggestions: ['Add hover states'],
          },
          {
            criterionName: 'User Research & Persona',
            ratio: 0.9,
            status: 'PASS',
            notes: 'Shopper persona and 5 participant user study provide solid empirical backing.',
            observations: ['5 participants user study documented'],
            missing: [],
            suggestions: ['Include empathy map'],
          },
        ],
        strengths: [
          'Strong auto-layout frame structure verified in Checkout-Flow',
          'Empirical user research with 5 study participants',
        ],
        missingRequirements: [],
        improvements: ['Include interactive button states in wireframes'],
      },
      model: 'gemini-2.5-flash',
    })

    Submission.findById = async () => ({
      _id: submissionId,
      assignmentId,
      studentId,
      figmaUrl: 'https://www.figma.com/design/my-valid-figma-key-123/Checkout-Flow',
      researchNotes: 'User study with 5 participants',
      persona: 'Shopper persona',
      userFlow: 'Cart to order confirmation',
    })

    Assignment.findById = async () => ({
      _id: assignmentId,
      createdBy: { toString: () => facilitatorId },
      totalMarks: 20,
    })

    Rubric.findOne = async () => ({
      assignmentId,
      criteria: [
        { _id: 'c1', name: 'UI & Figma Prototype', maxMarks: 10, weightage: 50, description: 'High-fidelity mockups', checks: ['Frames', 'Components'] },
        { _id: 'c2', name: 'User Research & Persona', maxMarks: 10, weightage: 50, description: 'Insights and journey', checks: ['Persona'] },
      ],
      totalMarks: 20,
      totalWeightage: 100,
    })

    Evaluation.findOne = async () => null
    let createdPayload = null
    Evaluation.create = async (payload) => {
      createdPayload = payload
      return { ...payload, _id: 'eval-001' }
    }

    const req = {
      params: { submissionId },
      user: { userId: facilitatorId, role: 'facilitator' },
    }
    const res = createMockRes()

    await generateAiDraft(req, res)

    assert.strictEqual(res.statusCode, 200)
    assert.strictEqual(res.body.success, true)
    assert.ok(createdPayload)

    // Scores computed by rubricScorer:
    // C1: ratio 0.9 -> awarded 9/10 -> contribution = 9
    // C2: ratio 0.9 -> awarded 9/10 -> contribution = 9
    // Total = 18/20
    assert.strictEqual(createdPayload.aiSuggestedMarks, 18)
    assert.strictEqual(createdPayload.status, 'ai_review_complete')
    assert.strictEqual(createdPayload.criteriaResults[0].awardedMarks, 9)
    assert.strictEqual(createdPayload.criteriaResults[1].awardedMarks, 9)

    // Rubric metadata preserved
    assert.strictEqual(createdPayload.criteriaResults[0].description, 'High-fidelity mockups')
    assert.deepStrictEqual(createdPayload.criteriaResults[0].checks, ['Frames', 'Components'])

    // Inspection metadata preserved
    assert.strictEqual(createdPayload.inspectionMetadata.status, 'success')
    assert.strictEqual(createdPayload.inspectionMetadata.documentName, 'Checkout-Flow')
    assert.strictEqual(createdPayload.evidenceSummary.totalFramesCount, 4)
  })

  await t.test('2. Missing GEMINI_API_KEY returns 503 and preserves existing evaluation without overwriting', async () => {
    geminiEvaluator.evaluateWithGemini = async () => ({
      ok: false,
      error: 'Gemini evaluation service is unavailable: GEMINI_API_KEY is not configured in the backend environment.',
      statusCode: 503,
    })

    Submission.findById = async () => ({
      _id: submissionId,
      assignmentId,
      studentId,
      figmaUrl: 'https://www.figma.com/design/my-valid-figma-key-123/Checkout-Flow',
    })

    Assignment.findById = async () => ({
      _id: assignmentId,
      createdBy: { toString: () => facilitatorId },
      totalMarks: 20,
    })

    Rubric.findOne = async () => ({
      assignmentId,
      criteria: [{ _id: 'c1', name: 'UI', maxMarks: 20, weightage: 100 }],
    })

    let existingEvaluationSaved = false
    const existingEvaluation = {
      _id: 'existing-eval-123',
      status: 'facilitator_review',
      facilitatorMarks: 15,
      save: async () => {
        existingEvaluationSaved = true
      },
    }
    Evaluation.findOne = async () => existingEvaluation

    const req = {
      params: { submissionId },
      user: { userId: facilitatorId, role: 'facilitator' },
    }
    const res = createMockRes()

    await generateAiDraft(req, res)

    assert.strictEqual(res.statusCode, 503)
    assert.strictEqual(res.body.success, false)
    assert.match(res.body.message, /GEMINI_API_KEY is not configured/i)
    assert.strictEqual(existingEvaluationSaved, false, 'Existing evaluation must not be modified or saved on AI failure')
  })

  await t.test('3. Gemini provider failure returns 502 and preserves existing evaluation without overwriting', async () => {
    geminiEvaluator.evaluateWithGemini = async () => ({
      ok: false,
      error: 'Gemini API returned an unparseable response.',
      statusCode: 502,
    })

    Submission.findById = async () => ({
      _id: submissionId,
      assignmentId,
      studentId,
      figmaUrl: 'https://www.figma.com/design/my-valid-figma-key-123/Checkout-Flow',
    })

    Assignment.findById = async () => ({
      _id: assignmentId,
      createdBy: { toString: () => facilitatorId },
      totalMarks: 20,
    })

    Rubric.findOne = async () => ({
      assignmentId,
      criteria: [{ _id: 'c1', name: 'UI', maxMarks: 20, weightage: 100 }],
    })

    let existingSaved = false
    Evaluation.findOne = async () => ({
      _id: 'eval-saved',
      save: async () => {
        existingSaved = true
      },
    })

    const req = {
      params: { submissionId },
      user: { userId: facilitatorId, role: 'facilitator' },
    }
    const res = createMockRes()

    await generateAiDraft(req, res)

    assert.strictEqual(res.statusCode, 502)
    assert.strictEqual(res.body.success, false)
    assert.match(res.body.message, /unparseable response/i)
    assert.strictEqual(existingSaved, false)
  })

  await t.test('4. Non-owner facilitator is rejected with 403 forbidden', async () => {
    Submission.findById = async () => ({
      _id: submissionId,
      assignmentId,
      studentId,
    })

    Assignment.findById = async () => ({
      _id: assignmentId,
      createdBy: { toString: () => facilitatorId }, // owned by facilitatorId
      totalMarks: 20,
    })

    const req = {
      params: { submissionId },
      user: { userId: nonOwnerId, role: 'facilitator' }, // nonOwner
    }
    const res = createMockRes()

    await generateAiDraft(req, res)

    assert.strictEqual(res.statusCode, 403)
    assert.match(res.body.message, /do not own this assignment/i)
  })

  await t.test('5. Handles Figma inspection failure gracefully with Gemini', async () => {
    figmaInspector.inspectFigmaDesign = async () => ({
      ok: false,
      error: 'Figma file is private (HTTP 403)',
      statusCode: 403,
      metadata: { fileKey: 'private-key' },
    })

    geminiEvaluator.evaluateWithGemini = async ({ inspectionResult }) => {
      assert.strictEqual(inspectionResult.ok, false)
      assert.strictEqual(inspectionResult.statusCode, 403)
      return {
        ok: true,
        data: {
          criteriaEvaluations: [
            {
              criterionName: 'UI / Figma Prototype',
              ratio: 0.4,
              status: 'INSUFFICIENT_EVIDENCE',
              notes: 'Automated inspection unavailable: Figma file is private (HTTP 403). No evidence fabricated.',
              observations: ['Design file could not be accessed via REST API'],
              missing: ['Figma file sharing permissions'],
              suggestions: ['Set sharing to Anyone with the link can view'],
            },
          ],
          strengths: ['Core submission provided'],
          missingRequirements: ['Figma file is private (HTTP 403)'],
          improvements: ['Set Figma file sharing permissions to Anyone with the link can view'],
        },
        model: 'gemini-2.5-flash',
      }
    }

    Submission.findById = async () => ({
      _id: submissionId,
      assignmentId,
      studentId,
      figmaUrl: 'https://www.figma.com/design/private-key/Private-Design',
    })

    Assignment.findById = async () => ({
      _id: assignmentId,
      createdBy: { toString: () => facilitatorId },
      totalMarks: 20,
    })

    Rubric.findOne = async () => ({
      assignmentId,
      criteria: [
        { _id: 'c1', name: 'UI / Figma Prototype', maxMarks: 20, weightage: 100, description: 'Visual design', checks: ['Hierarchy'] },
      ],
      totalMarks: 20,
      totalWeightage: 100,
    })

    let createdPayload = null
    Evaluation.findOne = async () => null
    Evaluation.create = async (payload) => {
      createdPayload = payload
      return { ...payload, _id: 'eval-004' }
    }

    const req = {
      params: { submissionId },
      user: { userId: facilitatorId, role: 'facilitator' },
    }
    const res = createMockRes()

    await generateAiDraft(req, res)

    assert.strictEqual(res.statusCode, 200)
    assert.strictEqual(createdPayload.inspectionMetadata.status, 'failed')
    assert.strictEqual(createdPayload.evidenceSummary, null)
    assert.strictEqual(createdPayload.criteriaResults[0].automatedStatus, 'INSUFFICIENT_EVIDENCE')
    assert.match(createdPayload.criteriaResults[0].automatedNotes, /Automated inspection unavailable/i)
    assert.match(createdPayload.criteriaResults[0].automatedNotes, /No evidence fabricated/i)
  })

  await t.test('6. Rejects invalid model response with 502 without modifying existing evaluation in database', async () => {
    // Model returns an invalid ratio or status that fails strict validation
    geminiEvaluator.evaluateWithGemini = async () => ({
      ok: false,
      error: 'Gemini response failed validation: Criterion "UI" has invalid ratio: 1.8. Ratio must be a finite number between 0.0 and 1.0.',
      statusCode: 502,
    })

    Submission.findById = async () => ({
      _id: submissionId,
      assignmentId,
      studentId,
      figmaUrl: 'https://www.figma.com/design/my-valid-figma-key-123/Checkout-Flow',
    })

    Assignment.findById = async () => ({
      _id: assignmentId,
      createdBy: { toString: () => facilitatorId },
      totalMarks: 20,
    })

    Rubric.findOne = async () => ({
      assignmentId,
      criteria: [{ _id: 'c1', name: 'UI', maxMarks: 20, weightage: 100 }],
    })

    let existingEvaluationModified = false
    Evaluation.findOne = async () => ({
      _id: 'existing-eval-789',
      status: 'facilitator_review',
      save: async () => {
        existingEvaluationModified = true
      },
    })

    const req = {
      params: { submissionId },
      user: { userId: facilitatorId, role: 'facilitator' },
    }
    const res = createMockRes()

    await generateAiDraft(req, res)

    assert.strictEqual(res.statusCode, 502)
    assert.strictEqual(res.body.success, false)
    assert.match(res.body.message, /failed validation/i)
    assert.strictEqual(existingEvaluationModified, false, 'Database evaluation must never be touched on invalid AI response')
  })
})
