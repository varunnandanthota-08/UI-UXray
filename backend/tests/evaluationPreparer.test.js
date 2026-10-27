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

  const mockInspection = {
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

  const mockGeminiService = {
    evaluateWithGemini: async () => ({
      ok: true,
      data: {
        criteriaEvaluations: [
          {
            criterionName: 'UI Screen Auto-Layout & Architecture',
            ratio: 0.95,
            status: 'PASS',
            notes: 'Verified 4 auto-layout frames with consistent 8px/16px padding and standard color tokens.',
            observations: ['Document contains 4 auto-layout frames', '3 components properly defined'],
            missing: [],
            suggestions: ['Ensure focus states are explicitly styled'],
          },
          {
            criterionName: 'User Flow & Journey Mapping',
            ratio: 0.9,
            status: 'PASS',
            notes: 'User flow covers complete checkout trajectory without dead ends.',
            observations: ['4 discrete interaction stages documented'],
            missing: [],
            suggestions: ['Add error state recovery flows'],
          },
        ],
        strengths: [
          'High quality auto-layout structure verified via Figma inspection',
          'Complete user flow progression',
        ],
        missingRequirements: [],
        improvements: [
          'Annotate hover and active button states',
        ],
      },
      model: 'gemini-2.5-flash',
    }),
  }

  await t.test('1. Successful Gemini evaluation maps evidence, computes marks via rubricScorer, and preserves rubric checks', async () => {
    const draft = await prepareEvaluationDraft({
      criteria,
      submission: {
        figmaUrl: 'https://www.figma.com/design/figma-sample-key-999/Checkout-App',
        userFlow: 'Cart -> Shipping -> Payment -> Success',
      },
      assignmentTotalMarks: 20,
      inspectionResult: mockInspection,
      geminiService: mockGeminiService,
    })

    assert.strictEqual(draft.status, 'ai_review_complete')
    assert.strictEqual(draft.scoringMode, 'GEMINI_AI_EVALUATION')
    assert.strictEqual(draft.model, 'gemini-2.5-flash')

    // Inspection metadata and evidence summary preserved
    assert.strictEqual(draft.inspectionMetadata.status, 'success')
    assert.strictEqual(draft.inspectionMetadata.fileKey, 'figma-sample-key-999')
    assert.strictEqual(draft.inspectionMetadata.documentName, 'Checkout Screen Prototype v2')
    assert.strictEqual(draft.evidenceSummary.totalFramesCount, 4)

    // Rubric metadata preserved
    assert.strictEqual(draft.criteriaResults[0].description, criteria[0].description)
    assert.deepStrictEqual(draft.criteriaResults[0].checks, criteria[0].checks)
    assert.strictEqual(draft.criteriaResults[1].description, criteria[1].description)
    assert.deepStrictEqual(draft.criteriaResults[1].checks, criteria[1].checks)

    // Scores computed by rubricScorer:
    // C1: ratio 0.95 -> awarded 10/10 -> contribution = 10
    // C2: ratio 0.90 -> awarded 9/10 -> contribution = 9
    // Total = 19/20
    assert.strictEqual(draft.criteriaResults[0].awardedMarks, 10)
    assert.strictEqual(draft.criteriaResults[1].awardedMarks, 9)
    assert.strictEqual(draft.aiSuggestedMarks, 19)

    // Observations mapped
    assert.ok(draft.aiFeedback.criterionObservations[0].observations.some((o) => o.includes('4 auto-layout frames')))
    assert.strictEqual(draft.aiFeedback.criterionObservations[0].description, criteria[0].description)
    assert.deepStrictEqual(draft.aiFeedback.criterionObservations[0].checks, criteria[0].checks)
  })

  await t.test('2. Gemini failure with allowFallback: false returns clean error object and status code', async () => {
    const failingGeminiService = {
      evaluateWithGemini: async () => ({
        ok: false,
        error: 'Gemini service is temporarily unavailable.',
        statusCode: 503,
      }),
    }

    const draft = await prepareEvaluationDraft({
      criteria,
      submission: { figmaUrl: 'https://www.figma.com/design/key/App' },
      assignmentTotalMarks: 20,
      inspectionResult: mockInspection,
      geminiService: failingGeminiService,
      allowFallback: false,
    })

    assert.strictEqual(draft.error, 'Gemini service is temporarily unavailable.')
    assert.strictEqual(draft.statusCode, 503)
  })

  await t.test('3. Gemini failure with allowFallback: true falls back to baseline heuristic with explicit reason and tag', async () => {
    const failingGeminiService = {
      evaluateWithGemini: async () => ({
        ok: false,
        error: 'Rate limit 429',
        statusCode: 429,
      }),
    }

    const draft = await prepareEvaluationDraft({
      criteria,
      submission: { figmaUrl: 'https://www.figma.com/design/key/App' },
      assignmentTotalMarks: 20,
      inspectionResult: mockInspection,
      geminiService: failingGeminiService,
      allowFallback: true,
    })

    assert.strictEqual(draft.status, 'ai_review_complete')
    assert.strictEqual(draft.scoringMode, 'FALLBACK_HEURISTIC')
    assert.match(draft.criteriaResults[0].automatedNotes, /Fallback Heuristic/i)
    assert.match(draft.criteriaResults[0].automatedNotes, /Rate limit 429/i)
    assert.ok(draft.aiFeedback.missingRequirements.some((m) => m.includes('Rate limit 429')))
  })

  await t.test('4. Baseline heuristic mode directly produces temporary baseline heuristic draft', async () => {
    const draft = await prepareEvaluationDraft({
      criteria,
      submission: {
        figmaUrl: 'https://www.figma.com/design/figma-sample-key-999/Checkout-App',
        userFlow: 'Cart -> Details',
      },
      assignmentTotalMarks: 20,
      inspectionResult: mockInspection,
      mode: 'heuristic',
    })

    assert.strictEqual(draft.status, 'ai_review_complete')
    assert.strictEqual(draft.scoringMode, 'TEMPORARY_HEURISTIC_BASELINE')
    assert.match(draft.criteriaResults[0].automatedNotes, /Temporary Baseline Heuristic/i)
    assert.strictEqual(draft.criteriaResults[0].automatedStatus, 'PASS')
  })

  await t.test('5. Inspector failure (403/private) does not fabricate evidence and flags safe status', async () => {
    const inspectionResult = {
      ok: false,
      statusCode: 403,
      error: 'Figma file is private. Set link sharing to Anyone with the link can view.',
    }

    const draft = await prepareEvaluationDraft({
      criteria,
      submission: { figmaUrl: 'https://www.figma.com/design/private-file-key/App' },
      assignmentTotalMarks: 20,
      inspectionResult,
      mode: 'heuristic',
    })

    assert.strictEqual(draft.inspectionMetadata.status, 'failed')
    assert.strictEqual(draft.evidenceSummary, null)
    assert.strictEqual(draft.criteriaResults[0].automatedStatus, 'INSUFFICIENT_EVIDENCE')
    assert.match(draft.criteriaResults[0].automatedNotes, /Automated inspection unavailable/i)
    assert.match(draft.criteriaResults[0].automatedNotes, /No evidence fabricated/i)
  })

  await t.test('6. Canva link submission detects guidance and does not claim Figma inspection', async () => {
    const draft = await prepareEvaluationDraft({
      criteria,
      submission: { canvaUrl: 'https://www.canva.com/design/DAF_project/view' },
      assignmentTotalMarks: 20,
      inspectionResult: null,
      mode: 'heuristic',
    })

    assert.strictEqual(draft.inspectionMetadata.status, 'not_applicable')
    assert.strictEqual(draft.evidenceSummary, null)
    assert.strictEqual(draft.criteriaResults[0].automatedStatus, 'PARTIAL')
    assert.strictEqual(draft.criteriaResults[0].automatedNotes, CANVA_GUIDANCE_MESSAGE)
    assert.ok(draft.aiFeedback.missingRequirements.includes(CANVA_GUIDANCE_MESSAGE))
  })

  await t.test('7. Criterion-specific evidence grounding: inspection failure forces INSUFFICIENT_EVIDENCE on UI criteria while preserving genuine evaluation on research criteria', async () => {
    const failedInspection = {
      ok: false,
      statusCode: 403,
      error: 'Figma file is private or token expired.',
    }

    // Model hypothetically tried to return PASS for both criteria
    const optimisticGeminiService = {
      evaluateWithGemini: async () => ({
        ok: true,
        data: {
          criteriaEvaluations: [
            {
              criterionName: 'UI Screen Auto-Layout & Architecture',
              ratio: 0.95,
              status: 'PASS',
              notes: 'Model attempted to claim layout was good without inspection.',
              observations: ['Fabricated observation'],
              missing: [],
              suggestions: [],
            },
            {
              criterionName: 'User Flow & Journey Mapping',
              ratio: 0.88,
              status: 'PASS',
              notes: 'Genuine assessment of user flow deliverable text.',
              observations: ['Clear step progression from Splash to Details'],
              missing: [],
              suggestions: ['Add recovery steps'],
            },
          ],
          strengths: ['User flow is well articulated'],
          missingRequirements: [],
          improvements: ['Add error flows'],
        },
        model: 'gemini-2.5-flash',
      }),
    }

    const draft = await prepareEvaluationDraft({
      criteria,
      submission: {
        figmaUrl: 'https://www.figma.com/design/private-file/App',
        userFlow: 'Splash -> Login -> Home -> Details',
      },
      assignmentTotalMarks: 20,
      inspectionResult: failedInspection,
      geminiService: optimisticGeminiService,
    })

    assert.strictEqual(draft.status, 'ai_review_complete')
    assert.strictEqual(draft.inspectionMetadata.status, 'failed')

    // Criterion 1 (UI Screen Auto-Layout - Figma dependent) must be overridden by backend guardrail:
    const c1 = draft.criteriaResults[0]
    assert.strictEqual(c1.automatedStatus, 'INSUFFICIENT_EVIDENCE')
    assert.ok(c1.awardedMarks <= 4)
    assert.match(c1.automatedNotes, /Evidence Grounding Enforcement/i)
    assert.match(c1.automatedNotes, /inspection unavailable/i)

    // Criterion 2 (User Flow & Journey Mapping - text research based) must PRESERVE genuine evaluation!
    const c2 = draft.criteriaResults[1]
    assert.strictEqual(c2.automatedStatus, 'PASS')
    assert.strictEqual(c2.awardedMarks, 9) // 0.88 * 10 = 8.8 -> round = 9
    assert.match(c2.automatedNotes, /Genuine assessment of user flow/i)
  })

  await t.test('8. Canva link in Gemini evaluation enforces PARTIAL on UI criteria while preserving research criteria', async () => {
    const geminiService = {
      evaluateWithGemini: async () => ({
        ok: true,
        data: {
          criteriaEvaluations: [
            {
              criterionName: 'UI Screen Auto-Layout & Architecture',
              ratio: 0.9,
              status: 'PASS',
              notes: 'Model evaluated UI screen.',
              observations: ['Obs 1'],
              missing: [],
              suggestions: [],
            },
            {
              criterionName: 'User Flow & Journey Mapping',
              ratio: 0.85,
              status: 'PASS',
              notes: 'User flow documentation is complete.',
              observations: ['Obs 2'],
              missing: [],
              suggestions: [],
            },
          ],
          strengths: ['Good flow'],
          missingRequirements: [],
          improvements: ['Export PDF'],
        },
        model: 'gemini-2.5-flash',
      }),
    }

    const draft = await prepareEvaluationDraft({
      criteria,
      submission: {
        canvaUrl: 'https://www.canva.com/design/DAF_project/view',
        userFlow: 'Step 1 -> Step 2 -> Step 3',
      },
      assignmentTotalMarks: 20,
      inspectionResult: null,
      geminiService,
    })

    // UI criterion must be enforced to PARTIAL with awardedMarks <= 5 and Canva guidance
    assert.strictEqual(draft.criteriaResults[0].automatedStatus, 'PARTIAL')
    assert.ok(draft.criteriaResults[0].awardedMarks <= 5)
    assert.match(draft.criteriaResults[0].automatedNotes, /Canva links cannot be inspected directly/i)

    // User flow criterion must retain its genuine score
    assert.strictEqual(draft.criteriaResults[1].automatedStatus, 'PASS')
    assert.strictEqual(draft.criteriaResults[1].awardedMarks, 9) // 0.85 * 10 = 8.5 -> round = 9
  })
})
