/**
 * Evaluation Preparer Service
 *
 * Prepares AI draft evaluations by coordinating Gemini model assessment,
 * normalized Figma inspection evidence, student text deliverables, and
 * rubric criteria.
 *
 * Invariants:
 * 1. Deterministic Scoring: Uses rubricScorer.js as the sole scoring authority.
 * 2. Explicit Provenance: Clearly tags genuine Gemini evaluations vs fallback baseline heuristics.
 * 3. Evidence Grounding: Preserves rubric descriptions, checks, and inspection metadata.
 * 4. Safe Failure: Rejects unauthenticated or failed AI calls without corrupting evaluations.
 */

const { calculateRubricScore } = require('./rubricScorer')
const { CANVA_GUIDANCE_MESSAGE, isCanvaUrl, validateFigmaUrl } = require('./designUrlValidator')
const geminiEvaluator = require('./geminiEvaluator')

/**
 * Extracts and normalizes inspection metadata and evidence summary.
 *
 * @param {object} sub - Submission record
 * @param {object|null} inspectionResult - Result from figmaInspector.inspectFigmaDesign
 * @returns {{ inspectionMetadata: object, evidenceSummary: object|null, isCanvaLink: boolean, figmaValidation: object, prototypeValidation: object }}
 */
function extractInspectionState(sub = {}, inspectionResult = null) {
  const figmaValidation = validateFigmaUrl(sub.figmaUrl, { optional: true })
  const prototypeValidation = validateFigmaUrl(sub.prototypeUrl, { optional: true })

  const isFigmaProvided = Boolean(sub.figmaUrl)
  const isCanvaLink =
    Boolean(sub.canvaUrl) ||
    figmaValidation.isCanva ||
    prototypeValidation.isCanva ||
    isCanvaUrl(sub.figmaUrl) ||
    isCanvaUrl(sub.prototypeUrl)

  const inspectionSucceeded = Boolean(inspectionResult && inspectionResult.ok)
  const inspectionMetadata = inspectionResult
    ? {
        provider: 'figma',
        status: inspectionSucceeded ? 'success' : 'failed',
        fileKey: inspectionResult.metadata?.fileKey || figmaValidation.fileKey || null,
        documentName: inspectionResult.metadata?.documentName || null,
        lastModified: inspectionResult.metadata?.lastModified || null,
        version: inspectionResult.metadata?.version || null,
        error: inspectionSucceeded ? null : (inspectionResult.error || 'Inspection failed'),
        inspectedAt: inspectionResult.inspectedAt ? new Date(inspectionResult.inspectedAt) : new Date(),
      }
    : isFigmaProvided && !figmaValidation.isValid
    ? {
        provider: 'figma',
        status: 'failed',
        error: figmaValidation.error,
        inspectedAt: new Date(),
      }
    : {
        provider: isFigmaProvided ? 'figma' : 'none',
        status: 'not_applicable',
        inspectedAt: new Date(),
      }

  const evidenceSummary = inspectionSucceeded && inspectionResult.evidence?.summary
    ? inspectionResult.evidence.summary
    : null

  return {
    inspectionMetadata,
    evidenceSummary,
    isCanvaLink,
    figmaValidation,
    prototypeValidation,
  }
}

/**
 * Determines whether a rubric criterion genuinely depends on Figma/UI structural evidence.
 *
 * @param {string} name
 * @returns {boolean}
 */
function isFigmaDependentCriterion(name = '') {
  const cNameLower = (name || '').toLowerCase()
  return (
    cNameLower.includes('figma') ||
    cNameLower.includes('prototype') ||
    cNameLower.includes('ui/ux') ||
    cNameLower.includes('visual') ||
    cNameLower.includes('screen') ||
    cNameLower.includes('motion') ||
    cNameLower.includes('layout') ||
    cNameLower.includes('interface') ||
    cNameLower.includes('design system') ||
    cNameLower.includes('component')
  )
}

/**
 * Baseline heuristic evaluation fallback.
 * Explicitly identified as a temporary baseline heuristic.
 *
 * @param {object} params
 * @returns {object}
 */
function prepareBaselineHeuristicDraft({
  criteria = [],
  submission = {},
  assignmentTotalMarks = 100,
  inspectionResult = null,
  fallbackReason = null,
}) {
  const criteriaList = Array.isArray(criteria) ? criteria : []
  const sub = submission || {}

  const {
    inspectionMetadata,
    evidenceSummary,
    isCanvaLink,
    figmaValidation,
    prototypeValidation,
  } = extractInspectionState(sub, inspectionResult)

  const isFigmaProvided = Boolean(sub.figmaUrl)
  const isPrototypeProvided = Boolean(sub.prototypeUrl)
  const inspectionSucceeded = Boolean(inspectionResult && inspectionResult.ok)
  const inspectionFailed = Boolean(inspectionResult && !inspectionResult.ok)

  const hasPersona = Boolean(sub.persona)
  const hasUserFlow = Boolean(sub.userFlow)
  const hasResearch = Boolean(sub.researchNotes)

  const tagPrefix = fallbackReason
    ? `[Fallback Heuristic - AI Unavailable: ${fallbackReason}]`
    : '[Temporary Baseline Heuristic]'

  const performanceRatios = criteriaList.map((c) => {
    const cNameLower = (c.name || '').toLowerCase()
    const checks = Array.isArray(c.checks) ? c.checks : []
    const description = typeof c.description === 'string' ? c.description : ''

    if (isFigmaDependentCriterion(c.name)) {
      if (inspectionSucceeded) {
        const meta = inspectionResult.metadata || {}
        const summ = inspectionResult.evidence?.summary || {}
        return {
          ratio: 0.92,
          status: 'PASS',
          notes: `${tagPrefix} Verified accessible Figma file "${meta.documentName || 'Design'}". Structure contains ${summ.totalFramesCount || 0} frame(s), ${summ.totalComponentsCount || 0} component(s), and ${summ.uniqueColorCount || 0} unique color(s).`,
          checks,
          description,
        }
      }

      if (inspectionFailed) {
        return {
          ratio: 0.4,
          status: 'INSUFFICIENT_EVIDENCE',
          notes: `${tagPrefix} Automated inspection unavailable: ${inspectionResult.error || 'Unable to inspect Figma file'}. No evidence fabricated. Facilitator review required.`,
          checks,
          description,
        }
      }

      if (isCanvaLink) {
        return {
          ratio: 0.45,
          status: 'PARTIAL',
          notes: CANVA_GUIDANCE_MESSAGE,
          checks,
          description,
        }
      }

      if (isFigmaProvided && !figmaValidation.isValid) {
        return {
          ratio: 0.3,
          status: 'PARTIAL',
          notes: `${tagPrefix} Invalid Figma URL format: ${figmaValidation.error || 'Unsupported link'}.`,
          checks,
          description,
        }
      }

      if (isPrototypeProvided && prototypeValidation.isValid) {
        return {
          ratio: 0.85,
          status: 'PASS',
          notes: `${tagPrefix} Prototype URL provided and format verified.`,
          checks,
          description,
        }
      }

      return {
        ratio: 0.4,
        status: 'PARTIAL',
        notes: `${tagPrefix} Missing direct Figma URL.`,
        checks,
        description,
      }
    }

    if (
      cNameLower.includes('research') ||
      cNameLower.includes('persona') ||
      cNameLower.includes('journey') ||
      cNameLower.includes('flow') ||
      cNameLower.includes('friction') ||
      cNameLower.includes('empathy')
    ) {
      if (hasPersona || hasResearch || hasUserFlow) {
        return {
          ratio: 0.9,
          status: 'PASS',
          notes: `${tagPrefix} User research and workflow artifacts supplied. Semantic depth requires facilitator review.`,
          checks,
          description,
        }
      }
      return {
        ratio: 0.5,
        status: 'PARTIAL',
        notes: `${tagPrefix} Limited or missing user research notes.`,
        checks,
        description,
      }
    }

    return {
      ratio: 0.85,
      status: 'PASS',
      notes: `${tagPrefix} Baseline deliverable structure meets assignment criteria.`,
      checks,
      description,
    }
  })

  const scoreResult = calculateRubricScore({
    criteria: criteriaList,
    performanceRatios,
    assignmentTotalMarks,
  })

  const criteriaResults = scoreResult.criteriaResults.map((cr, idx) => {
    const orig = criteriaList[idx] || {}
    return {
      ...cr,
      description: orig.description || '',
      checks: Array.isArray(orig.checks) ? orig.checks : [],
    }
  })

  const strengths = []
  if (inspectionSucceeded) {
    const meta = inspectionResult.metadata || {}
    const summ = inspectionResult.evidence?.summary || {}
    strengths.push(
      `Verified accessible Figma document "${meta.documentName || 'Design'}" containing ${summ.totalFramesCount || 0} frame(s) and ${summ.totalComponentsCount || 0} component(s)`
    )
  } else if (isPrototypeProvided && prototypeValidation.isValid) {
    strengths.push('Public prototype link provided with valid format')
  } else {
    strengths.push('Core deliverable artifacts submitted')
  }

  if (hasUserFlow) strengths.push('User flow documentation and interaction steps supplied')
  if (hasPersona) strengths.push('User persona documentation included in submission')

  const missingRequirements = []
  if (isCanvaLink) missingRequirements.push(CANVA_GUIDANCE_MESSAGE)
  if (inspectionFailed) missingRequirements.push(`Figma inspection note: ${inspectionResult.error}`)
  if (fallbackReason) missingRequirements.push(`Gemini AI evaluation unavailable: ${fallbackReason}`)

  const improvements = []
  if (isCanvaLink) improvements.push('Export Canva screens as PDF or high-resolution PNG for automated inspection')
  if (inspectionFailed && (inspectionResult.statusCode === 401 || inspectionResult.statusCode === 403)) {
    improvements.push('Set Figma file sharing permissions to "Anyone with the link can view"')
  }
  improvements.push('Review criterion alignment during facilitator critique')

  const aiFeedback = {
    strengths,
    missingRequirements,
    improvements,
    criterionObservations: criteriaResults.map((cr) => ({
      criterionName: cr.criterionName,
      status: cr.automatedStatus,
      observations: [cr.automatedNotes],
      checks: cr.checks,
      description: cr.description,
      missing: [],
      suggestions: ['Review alignment with assignment guidelines during facilitator critique'],
    })),
  }

  return {
    criteriaResults,
    aiFeedback,
    aiSuggestedMarks: scoreResult.totalSuggestedMarks,
    status: 'ai_review_complete',
    inspectionMetadata,
    evidenceSummary,
    scoringMode: fallbackReason ? 'FALLBACK_HEURISTIC' : 'TEMPORARY_HEURISTIC_BASELINE',
  }
}

/**
 * Prepares an AI evaluation draft.
 *
 * @param {object} params
 * @param {Array<object>} params.criteria - Rubric criteria with name, description, checks, maxMarks, weightage
 * @param {object} params.submission - Student submission record
 * @param {number} [params.assignmentTotalMarks=100] - Total possible marks for the assignment
 * @param {object|null} [params.inspectionResult] - Result from figmaInspector.inspectFigmaDesign
 * @param {object} [params.geminiService] - Optional injected Gemini evaluator service for testing
 * @param {boolean} [params.allowFallback=false] - Whether to fall back to heuristic baseline on Gemini failure
 * @param {string} [params.mode] - Optional mode override ('heuristic' or 'gemini')
 * @returns {Promise<object>} Formatted draft evaluation payload or error object
 */
async function prepareEvaluationDraft({
  criteria = [],
  submission = {},
  assignmentTotalMarks = 100,
  inspectionResult = null,
  geminiService = null,
  allowFallback = false,
  mode = null,
}) {
  const criteriaList = Array.isArray(criteria) ? criteria : []
  const sub = submission || {}

  // 1. Explicit baseline heuristic override
  if (mode === 'heuristic') {
    return prepareBaselineHeuristicDraft({
      criteria: criteriaList,
      submission: sub,
      assignmentTotalMarks,
      inspectionResult,
    })
  }

  // 2. Extract shared inspection metadata and evidence summary
  const { inspectionMetadata, evidenceSummary, isCanvaLink, figmaValidation } = extractInspectionState(
    sub,
    inspectionResult
  )

  // 3. Coordinate genuine Gemini evaluation
  const evaluator = geminiService || geminiEvaluator
  const geminiResult = await evaluator.evaluateWithGemini({
    criteria: criteriaList,
    submission: sub,
    assignment: { totalMarks: assignmentTotalMarks },
    inspectionResult,
  })

  // 4. Handle Gemini failure
  if (!geminiResult || !geminiResult.ok) {
    if (allowFallback) {
      return prepareBaselineHeuristicDraft({
        criteria: criteriaList,
        submission: sub,
        assignmentTotalMarks,
        inspectionResult,
        fallbackReason: geminiResult?.error || 'Gemini service unreachable',
      })
    }

    return {
      error: geminiResult?.error || 'Gemini evaluation service failed.',
      statusCode: geminiResult?.statusCode || 502,
    }
  }

  // 5. Map validated Gemini ratios and observations with criterion-specific evidence grounding
  const geminiData = geminiResult.data
  const isInspectionFailed = Boolean(inspectionResult && !inspectionResult.ok)
  const isFigmaProvided = Boolean(sub.figmaUrl)
  const isInvalidFigmaUrl = Boolean(isFigmaProvided && !figmaValidation.isValid)

  const performanceRatios = criteriaList.map((c, index) => {
    const rubricNameLower = (c.name || '').trim().toLowerCase()
    const matched =
      (geminiData.criteriaEvaluations[index] &&
        typeof geminiData.criteriaEvaluations[index].criterionName === 'string' &&
        geminiData.criteriaEvaluations[index].criterionName.trim().toLowerCase() === rubricNameLower)
        ? geminiData.criteriaEvaluations[index]
        : geminiData.criteriaEvaluations.find(
            (ce) => ce && typeof ce.criterionName === 'string' && ce.criterionName.trim().toLowerCase() === rubricNameLower
          ) || geminiData.criteriaEvaluations[index]

    let ratio = matched && Number.isFinite(matched.ratio) ? matched.ratio : 0.5
    let status = matched?.status || 'PARTIAL'
    let notes = matched?.notes || 'Evaluated against rubric criteria.'

    // Programmatic Criterion-Specific Evidence Grounding:
    // If a criterion genuinely depends on Figma or UI evidence, enforce constraints when inspection is unavailable.
    // Unrelated research, documentation, and persona criteria remain unaffected.
    const isFigmaDependent = isFigmaDependentCriterion(c.name)

    if (isFigmaDependent) {
      if (isInspectionFailed) {
        status = 'INSUFFICIENT_EVIDENCE'
        ratio = Math.min(ratio, 0.4)
        notes = `[Evidence Grounding Enforcement: Figma inspection unavailable (${inspectionResult.error || 'Inspection failed'}). Facilitator review required.] ${notes}`.trim()
      } else if (isCanvaLink) {
        status = 'PARTIAL'
        ratio = Math.min(ratio, 0.45)
        notes = `${CANVA_GUIDANCE_MESSAGE} ${notes}`.trim()
      } else if (isInvalidFigmaUrl) {
        status = 'INSUFFICIENT_EVIDENCE'
        ratio = Math.min(ratio, 0.3)
        notes = `[Evidence Grounding Enforcement: Invalid Figma URL provided (${figmaValidation.error || 'Invalid link'}).] ${notes}`.trim()
      }
    }

    return {
      ratio,
      status,
      notes,
    }
  })

  // Authoritative scoring calculation via rubricScorer
  const scoreResult = calculateRubricScore({
    criteria: criteriaList,
    performanceRatios,
    assignmentTotalMarks,
  })

  // Enrich criteriaResults with rubric checks and descriptions
  const criteriaResults = scoreResult.criteriaResults.map((cr, idx) => {
    const orig = criteriaList[idx] || {}
    return {
      ...cr,
      description: orig.description || '',
      checks: Array.isArray(orig.checks) ? orig.checks : [],
    }
  })

  // Map Gemini observations into aiFeedback schema with grounded observations
  const criterionObservations = criteriaList.map((c, idx) => {
    const rubricNameLower = (c.name || '').trim().toLowerCase()
    const matched =
      (geminiData.criteriaEvaluations[idx] &&
        typeof geminiData.criteriaEvaluations[idx].criterionName === 'string' &&
        geminiData.criteriaEvaluations[idx].criterionName.trim().toLowerCase() === rubricNameLower)
        ? geminiData.criteriaEvaluations[idx]
        : geminiData.criteriaEvaluations.find(
            (ce) => ce && typeof ce.criterionName === 'string' && ce.criterionName.trim().toLowerCase() === rubricNameLower
          ) || geminiData.criteriaEvaluations[idx]
    const cr = criteriaResults[idx]

    const observations = Array.isArray(matched?.observations) && matched.observations.length > 0
      ? [...matched.observations]
      : [cr.automatedNotes]
    const missing = Array.isArray(matched?.missing) ? [...matched.missing] : []
    const suggestions = Array.isArray(matched?.suggestions) ? [...matched.suggestions] : []

    const isFigmaDependent = isFigmaDependentCriterion(c.name)
    if (isFigmaDependent) {
      if (isInspectionFailed) {
        if (!missing.includes('Accessible Figma file structure (inspection failed)')) {
          missing.unshift(`Accessible Figma file structure (inspection failed: ${inspectionResult.error || 'Unavailable'})`)
        }
        suggestions.push('Verify Figma file sharing settings ("Anyone with link can view") and inspect manually.')
      } else if (isCanvaLink) {
        if (!suggestions.includes('Export Canva screens as PDF or high-resolution PNG for automated inspection')) {
          suggestions.push('Export Canva screens as PDF or high-resolution PNG for automated inspection')
        }
      }
    }

    return {
      criterionName: c.name,
      status: cr.automatedStatus,
      observations,
      checks: cr.checks,
      description: cr.description,
      missing,
      suggestions,
    }
  })

  const aiFeedback = {
    strengths: Array.isArray(geminiData.strengths) ? geminiData.strengths : [],
    missingRequirements: Array.isArray(geminiData.missingRequirements) ? geminiData.missingRequirements : [],
    improvements: Array.isArray(geminiData.improvements) ? geminiData.improvements : [],
    criterionObservations,
  }

  return {
    criteriaResults,
    aiFeedback,
    aiSuggestedMarks: scoreResult.totalSuggestedMarks,
    status: 'ai_review_complete',
    inspectionMetadata,
    evidenceSummary,
    scoringMode: 'GEMINI_AI_EVALUATION',
    model: geminiResult.model || geminiEvaluator.DEFAULT_MODEL,
  }
}

module.exports = {
  extractInspectionState,
  isFigmaDependentCriterion,
  prepareBaselineHeuristicDraft,
  prepareEvaluationDraft,
}
