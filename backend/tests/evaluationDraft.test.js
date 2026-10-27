const test = require('node:test')
const assert = require('node:assert')
const { generateAiDraft } = require('../controllers/evaluationController')
const Rubric = require('../models/Rubric')
const Submission = require('../models/Submission')
const Assignment = require('../models/Assignment')
const Evaluation = require('../models/Evaluation')
const figmaInspector = require('../services/figmaInspector')
const { CANVA_GUIDANCE_MESSAGE } = require('../services/designUrlValidator')

test('generateAiDraft Controller Unit Integration Suite', async (t) => {
  // Setup mock ObjectId strings
  const facilitatorId = '60b8d295f1d5a80015bc0001'
  const assignmentId = '60b8d295f1d5a80015bc0002'
  const submissionId = '60b8d295f1d5a80015bc0003'
  const studentId = '60b8d295f1d5a80015bc0004'

  // Helper to mock res
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

  t.after(() => {
    Submission.findById = origFindByIdSub
    Assignment.findById = origFindByIdAsg
    Rubric.findOne = origFindOneRubric
    Evaluation.findOne = origFindOneEval
    Evaluation.create = origCreateEval
    figmaInspector.inspectFigmaDesign = origInspectFigmaDesign
  })

  await t.test('Calculates weighted score correctly and verifies valid Figma URL with evidence', async () => {
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
          typography: ['Inter 16px'],
          maxDepthReached: 3,
          truncated: false,
        },
      },
      inspectedAt: '2026-03-01T12:00:00Z',
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

    Evaluation.findOne = async () => null // simulate creating new
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
    assert.ok(createdPayload, 'Evaluation must be created')

    // Performance:
    // C1: figma verified with successful inspection -> ratio 0.92 -> awarded 9/10 -> contribution = (9/10) * 0.5 * 20 = 9
    // C2: research verified -> ratio 0.90 -> awarded 9/10 -> contribution = (9/10) * 0.5 * 20 = 9
    // Total = 9 + 9 = 18 / 20
    assert.strictEqual(createdPayload.aiSuggestedMarks, 18)
    assert.strictEqual(createdPayload.status, 'ai_review_complete')
    assert.strictEqual(createdPayload.criteriaResults[0].awardedMarks, 9)
    assert.strictEqual(createdPayload.criteriaResults[1].awardedMarks, 9)
    assert.match(createdPayload.criteriaResults[0].automatedNotes, /Checkout-Flow/)
    assert.strictEqual(createdPayload.criteriaResults[0].description, 'High-fidelity mockups')
    assert.deepStrictEqual(createdPayload.criteriaResults[0].checks, ['Frames', 'Components'])

    // Inspection metadata and bounded evidence summary
    assert.strictEqual(createdPayload.inspectionMetadata.status, 'success')
    assert.strictEqual(createdPayload.inspectionMetadata.documentName, 'Checkout-Flow')
    assert.strictEqual(createdPayload.inspectionMetadata.fileKey, 'my-valid-figma-key-123')
    assert.ok(createdPayload.evidenceSummary)
    assert.strictEqual(createdPayload.evidenceSummary.totalFramesCount, 4)
    assert.strictEqual(createdPayload.evidenceSummary.uniqueColorCount, 5)
  })

  await t.test('Detects Canva link in submission and returns clear export guidance in feedback', async () => {
    Submission.findById = async () => ({
      _id: submissionId,
      assignmentId,
      studentId,
      figmaUrl: 'https://www.canva.com/design/DAF_sample_canva/view',
      researchNotes: '',
    })

    Assignment.findById = async () => ({
      _id: assignmentId,
      createdBy: { toString: () => facilitatorId },
      totalMarks: 20,
    })

    Rubric.findOne = async () => ({
      assignmentId,
      criteria: [
        { _id: 'c1', name: 'UI/UX Prototype', maxMarks: 10, weightage: 60 },
        { _id: 'c2', name: 'Research', maxMarks: 10, weightage: 40 },
      ],
      totalMarks: 20,
      totalWeightage: 100,
    })

    let createdPayload = null
    Evaluation.findOne = async () => null
    Evaluation.create = async (payload) => {
      createdPayload = payload
      return { ...payload, _id: 'eval-002' }
    }

    const req = {
      params: { submissionId },
      user: { userId: facilitatorId, role: 'facilitator' },
    }
    const res = createMockRes()

    await generateAiDraft(req, res)

    assert.strictEqual(res.statusCode, 200)
    assert.ok(createdPayload)

    // Verify Canva guidance appears in criterion notes and feedback
    assert.strictEqual(createdPayload.criteriaResults[0].automatedNotes, CANVA_GUIDANCE_MESSAGE)
    assert.ok(createdPayload.aiFeedback.missingRequirements.includes(CANVA_GUIDANCE_MESSAGE))
    assert.ok(
      createdPayload.aiFeedback.improvements.some((imp) =>
        imp.includes('Export Canva screens as PDF')
      )
    )
    assert.strictEqual(createdPayload.evidenceSummary, null)
  })

  await t.test('Rejects invalid deceptive figma URL safely', async () => {
    Submission.findById = async () => ({
      _id: submissionId,
      assignmentId,
      studentId,
      figmaUrl: 'https://figma.com.evil-attacker.com/design/fake-key',
    })

    Assignment.findById = async () => ({
      _id: assignmentId,
      createdBy: { toString: () => facilitatorId },
      totalMarks: 20,
    })

    Rubric.findOne = async () => ({
      assignmentId,
      criteria: [
        { _id: 'c1', name: 'Figma Screen', maxMarks: 20, weightage: 100 },
      ],
      totalMarks: 20,
      totalWeightage: 100,
    })

    let createdPayload = null
    Evaluation.findOne = async () => null
    Evaluation.create = async (payload) => {
      createdPayload = payload
      return { ...payload, _id: 'eval-003' }
    }

    const req = {
      params: { submissionId },
      user: { userId: facilitatorId, role: 'facilitator' },
    }
    const res = createMockRes()

    await generateAiDraft(req, res)

    assert.strictEqual(res.statusCode, 200)
    assert.ok(createdPayload)
    // Deceptive host must not be rewarded with PASS
    assert.strictEqual(createdPayload.criteriaResults[0].automatedStatus, 'PARTIAL')
    assert.match(createdPayload.criteriaResults[0].automatedNotes, /Invalid Figma/i)
    assert.strictEqual(createdPayload.inspectionMetadata.status, 'failed')
    assert.strictEqual(createdPayload.evidenceSummary, null)
  })

  await t.test('Handles Figma inspection failure gracefully without fabricating evidence', async () => {
    figmaInspector.inspectFigmaDesign = async () => ({
      ok: false,
      error: 'Figma file is private or token lacks permissions (HTTP 403). Ensure link-sharing is enabled.',
      statusCode: 403,
      metadata: { fileKey: 'private-key-123' },
      inspectedAt: '2026-03-01T12:00:00Z',
    })

    Submission.findById = async () => ({
      _id: submissionId,
      assignmentId,
      studentId,
      figmaUrl: 'https://www.figma.com/design/private-key-123/Private-Design',
      researchNotes: 'Research findings',
    })

    Assignment.findById = async () => ({
      _id: assignmentId,
      createdBy: { toString: () => facilitatorId },
      totalMarks: 20,
    })

    Rubric.findOne = async () => ({
      assignmentId,
      criteria: [
        { _id: 'c1', name: 'UI / Figma Prototype', maxMarks: 10, weightage: 50, description: 'Visual design', checks: ['Hierarchy', 'Consistency'] },
        { _id: 'c2', name: 'User Research', maxMarks: 10, weightage: 50, description: 'User insights', checks: ['Personas'] },
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
    assert.ok(createdPayload)
    // Inspection status should be recorded as failed, no evidence fabricated
    assert.strictEqual(createdPayload.inspectionMetadata.status, 'failed')
    assert.match(createdPayload.inspectionMetadata.error, /HTTP 403/)
    assert.strictEqual(createdPayload.evidenceSummary, null)
    // Prototype criterion should reflect INSUFFICIENT_EVIDENCE
    assert.strictEqual(createdPayload.criteriaResults[0].automatedStatus, 'INSUFFICIENT_EVIDENCE')
    assert.match(createdPayload.criteriaResults[0].automatedNotes, /Automated inspection unavailable/i)
    assert.match(createdPayload.criteriaResults[0].automatedNotes, /No evidence fabricated/i)
    // Checks and descriptions should be preserved
    assert.strictEqual(createdPayload.criteriaResults[0].description, 'Visual design')
    assert.deepStrictEqual(createdPayload.criteriaResults[0].checks, ['Hierarchy', 'Consistency'])
    assert.ok(createdPayload.aiFeedback.missingRequirements.some((mr) => mr.includes('HTTP 403')))
    assert.ok(createdPayload.aiFeedback.improvements.some((imp) => imp.includes('Anyone with the link can view')))
  })
})
