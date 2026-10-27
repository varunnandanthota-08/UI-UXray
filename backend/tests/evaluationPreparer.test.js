const test = require('node:test')
const assert = require('node:assert')
const { prepareEvaluationDraft } = require('../services/evaluationPreparer')
const { CANVA_GUIDANCE_MESSAGE } = require('../services/designUrlValidator')

test('Evaluation Preparer Service Suite', async (t) => {
  const criteria = [
    {
      _id: 'crit-01',
      name: 'UI Screen Auto-Layout & Architecture',
      description: 'Responsive container hierarchy and frame auto-layout rules.',
      checks: ['Vertical/Horizontal auto-layout applied', 'Standard spacing tokens'],
      maxMarks: 10,
      weightage: 50,
    },
    {
      _id: 'crit-02',
      name: 'User Flow & Journey Mapping',
      description: 'Mapping user decision nodes without dead ends.',
      checks: ['Minimum 3 user branches', 'Clear decision nodes'],
      maxMarks: 10,
      weightage: 50,
    },
  ]

  await t.test('1. Successful inspection maps evidence and preserves rubric descriptions/checks', () => {
    const inspectionResult = {
      ok: true,
      metadata: {
        fileKey: 'figma-sample-key-999',
        documentName: 'Checkout Screen Prototype v2',
        version: '1029384',
        lastModified: '2026-09-21T10:00:00Z',
      },
      evidence: {
        summary: {
          totalNodesScanned: 45,
          totalFramesCount: 4,
          totalTextNodesCount: 18,
          totalComponentsCount: 3,
          uniqueColorCount: 8,
          colors: ['#FFFFFF', '#000000', '#2563EB'],
          typography: [{ fontFamily: 'Inter', fontSize: 16, fontWeight: 600 }],
          maxDepthReached: 3,
          truncated: false,
        },
        nodes: [],
      },
      inspectedAt: '2026-09-21T10:05:00Z',
    }

    const draft = prepareEvaluationDraft({
      criteria,
      submission: {
        figmaUrl: 'https://www.figma.com/design/figma-sample-key-999/Checkout-App',
        userFlow: 'Cart -> Shipping -> Payment -> Success',
      },
      assignmentTotalMarks: 20,
      inspectionResult,
    })

    // Status and scoring mode
    assert.strictEqual(draft.status, 'ai_review_complete')
    assert.strictEqual(draft.scoringMode, 'TEMPORARY_HEURISTIC_BASELINE')

    // Inspection metadata
    assert.strictEqual(draft.inspectionMetadata.status, 'success')
    assert.strictEqual(draft.inspectionMetadata.fileKey, 'figma-sample-key-999')
    assert.strictEqual(draft.inspectionMetadata.documentName, 'Checkout Screen Prototype v2')

    // Evidence summary
    assert.strictEqual(draft.evidenceSummary.totalFramesCount, 4)
    assert.strictEqual(draft.evidenceSummary.totalComponentsCount, 3)

    // Rubric description and checks must be preserved
    assert.strictEqual(draft.criteriaResults[0].description, criteria[0].description)
    assert.deepStrictEqual(draft.criteriaResults[0].checks, criteria[0].checks)
    assert.strictEqual(draft.criteriaResults[1].description, criteria[1].description)
    assert.deepStrictEqual(draft.criteriaResults[1].checks, criteria[1].checks)

    // Notes must clearly identify temporary heuristic baseline and cite evidence
    assert.match(draft.criteriaResults[0].automatedNotes, /Temporary Baseline Heuristic/i)
    assert.match(draft.criteriaResults[0].automatedNotes, /4 frame\(s\)/)
    assert.strictEqual(draft.criteriaResults[0].automatedStatus, 'PASS')

    // Strengths citation
    assert.ok(draft.aiFeedback.strengths.some((s) => s.includes('Checkout Screen Prototype v2')))
  })

  await t.test('2. Inspector failure (403/private) does not fabricate evidence and flags safe status', () => {
    const inspectionResult = {
      ok: false,
      statusCode: 403,
      error: 'Figma file is private or access is restricted. Ensure file sharing is set to "Anyone with the link can view".',
    }

    const draft = prepareEvaluationDraft({
      criteria,
      submission: {
        figmaUrl: 'https://www.figma.com/design/private-file-key/App',
      },
      assignmentTotalMarks: 20,
      inspectionResult,
    })

    assert.strictEqual(draft.inspectionMetadata.status, 'failed')
    assert.strictEqual(draft.inspectionMetadata.error, inspectionResult.error)
    assert.strictEqual(draft.evidenceSummary, null, 'Evidence summary must be null when inspection fails')

    // UI criterion must be flagged as INSUFFICIENT_EVIDENCE
    assert.strictEqual(draft.criteriaResults[0].automatedStatus, 'INSUFFICIENT_EVIDENCE')
    assert.match(draft.criteriaResults[0].automatedNotes, /Automated inspection unavailable/i)
    assert.match(draft.criteriaResults[0].automatedNotes, /No evidence fabricated/i)

    // Feedback includes guidance to change sharing permissions
    assert.ok(
      draft.aiFeedback.improvements.some((i) =>
        i.includes('Anyone with the link can view')
      )
    )
  })

  await t.test('3. Canva link submission detects guidance and does not claim Figma inspection', () => {
    const draft = prepareEvaluationDraft({
      criteria,
      submission: {
        canvaUrl: 'https://www.canva.com/design/DAF_canva_project/view',
      },
      assignmentTotalMarks: 20,
      inspectionResult: null,
    })

    assert.strictEqual(draft.inspectionMetadata.status, 'not_applicable')
    assert.strictEqual(draft.evidenceSummary, null)
    assert.strictEqual(draft.criteriaResults[0].automatedStatus, 'PARTIAL')
    assert.strictEqual(draft.criteriaResults[0].automatedNotes, CANVA_GUIDANCE_MESSAGE)
    assert.ok(draft.aiFeedback.missingRequirements.includes(CANVA_GUIDANCE_MESSAGE))
  })

  await t.test('4. Preserves rubric checks in aiFeedback.criterionObservations', () => {
    const draft = prepareEvaluationDraft({
      criteria,
      submission: {
        researchNotes: 'Interviews completed',
      },
      assignmentTotalMarks: 20,
      inspectionResult: null,
    })

    const obs = draft.aiFeedback.criterionObservations
    assert.strictEqual(obs.length, 2)
    assert.deepStrictEqual(obs[0].checks, criteria[0].checks)
    assert.strictEqual(obs[0].description, criteria[0].description)
    assert.deepStrictEqual(obs[1].checks, criteria[1].checks)
  })
})
