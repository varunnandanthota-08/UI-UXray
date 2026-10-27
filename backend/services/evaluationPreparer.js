/**
 * Evaluation Preparer Service
 *
 * Prepares AI draft evaluations by mapping normalized Figma inspection evidence
 * and student submission artifacts against rubric criteria.
 *
 * IMPORTANT:
 * Scoring in this service is explicitly a temporary baseline heuristic.
 * It does NOT claim to perform vision-based deep design critique or automated
 * accessibility verification, which requires multimodal model analysis.
 */

const { calculateRubricScore } = require('./rubricScorer')
const { CANVA_GUIDANCE_MESSAGE, isCanvaUrl, validateFigmaUrl } = require('./designUrlValidator')

/**
 * Prepares an AI evaluation draft.
 *
 * @param {object} params
 * @param {Array<object>} params.criteria - Rubric criteria with name, description, checks, maxMarks, weightage
 * @param {object} params.submission - Student submission record
 * @param {number} [params.assignmentTotalMarks=100] - Total possible marks for the assignment
 * @param {object|null} [params.inspectionResult] - Result from figmaInspector.inspectFigmaDesign
 * @returns {object} Formatted draft evaluation payload
 */
function prepareEvaluationDraft({
  criteria = [],
  submission = {},
  assignmentTotalMarks = 100,
  inspectionResult = null,
}) {
  const criteriaList = Array.isArray(criteria) ? criteria : []
  const sub = submission || {}

  // 1. Determine URL state and inspection status
  const figmaValidation = validateFigmaUrl(sub.figmaUrl, { optional: true })
  const prototypeValidation = validateFigmaUrl(sub.prototypeUrl, { optional: true })

  const isFigmaProvided = Boolean(sub.figmaUrl)
  const isPrototypeProvided = Boolean(sub.prototypeUrl)
  const isCanvaLink =
    Boolean(sub.canvaUrl) ||
    figmaValidation.isCanva ||
    prototypeValidation.isCanva ||
    isCanvaUrl(sub.figmaUrl) ||
    isCanvaUrl(sub.prototypeUrl)

  const inspectionSucceeded = Boolean(inspectionResult && inspectionResult.ok)
  const inspectionFailed = Boolean(inspectionResult && !inspectionResult.ok)
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

  const hasPersona = Boolean(sub.persona)
  const hasUserFlow = Boolean(sub.userFlow)
  const hasResearch = Boolean(sub.researchNotes)

  // 2. Evaluate performance ratio for each criterion preserving rubric metadata
  const performanceRatios = criteriaList.map((c) => {
    const cNameLower = (c.name || '').toLowerCase()
    const checks = Array.isArray(c.checks) ? c.checks : []
    const description = typeof c.description === 'string' ? c.description : ''

    // Criterion type: UI, Figma, Prototype, Screen, Visual
    if (
      cNameLower.includes('figma') ||
      cNameLower.includes('prototype') ||
      cNameLower.includes('ui/ux') ||
      cNameLower.includes('visual') ||
      cNameLower.includes('screen') ||
      cNameLower.includes('motion') ||
      cNameLower.includes('layout')
    ) {
      if (inspectionSucceeded) {
        const meta = inspectionResult.metadata || {}
        const summ = inspectionResult.evidence?.summary || {}
        return {
          ratio: 0.92,
          status: 'PASS',
          notes: `[Temporary Baseline Heuristic] Verified accessible Figma file "${meta.documentName || 'Design'}". Document structure contains ${summ.totalFramesCount || 0} frame(s), ${summ.totalComponentsCount || 0} component(s), and ${summ.uniqueColorCount || 0} unique color(s). Detailed visual design and contrast evaluation requires multimodal analysis.`,
          checks,
          description,
        }
      }

      if (inspectionFailed) {
        return {
          ratio: 0.4,
          status: 'INSUFFICIENT_EVIDENCE',
          notes: `[Temporary Baseline Heuristic] Automated inspection unavailable: ${inspectionResult.error || 'Unable to inspect Figma file'}. No evidence fabricated. Facilitator review required.`,
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
          notes: `[Temporary Baseline Heuristic] Invalid Figma URL format: ${figmaValidation.error || 'Unsupported link'}.`,
          checks,
          description,
        }
      }

      if (isPrototypeProvided && prototypeValidation.isValid) {
        return {
          ratio: 0.85,
          status: 'PASS',
          notes: '[Temporary Baseline Heuristic] Prototype URL provided and format verified.',
          checks,
          description,
        }
      }

      return {
        ratio: 0.4,
        status: 'PARTIAL',
        notes: '[Temporary Baseline Heuristic] Missing direct Figma URL.',
        checks,
        description,
      }
    }

    // Criterion type: Research, Persona, Journey, Flow, Friction
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
          notes: '[Temporary Baseline Heuristic] User research documents and workflow artifacts supplied. Semantic quality evaluation requires facilitator review.',
          checks,
          description,
        }
      }
      return {
        ratio: 0.5,
        status: 'PARTIAL',
        notes: '[Temporary Baseline Heuristic] Limited or missing user research notes.',
        checks,
        description,
      }
    }

    // Generic / other criterion
    return {
      ratio: 0.85,
      status: 'PASS',
      notes: '[Temporary Baseline Heuristic] Baseline deliverable structure meets assignment criteria.',
      checks,
      description,
    }
  })

  // 3. Compute mathematically sound score using rubricScorer
  const scoreResult = calculateRubricScore({
    criteria: criteriaList,
    performanceRatios,
    assignmentTotalMarks,
  })

  // Enrich criteriaResults with rubric descriptions and checks
  const criteriaResults = scoreResult.criteriaResults.map((cr, idx) => {
    const orig = criteriaList[idx] || {}
    return {
      ...cr,
      description: orig.description || '',
      checks: Array.isArray(orig.checks) ? orig.checks : [],
    }
  })

  // 4. Construct transparent qualitative feedback
  const strengths = []
  if (inspectionSucceeded) {
    const meta = inspectionResult.metadata || {}
    const summ = inspectionResult.evidence?.summary || {}
    strengths.push(
      `Verified accessible Figma document "${meta.documentName || 'Design'}" containing ${summ.totalFramesCount || 0} frame(s) and ${summ.totalComponentsCount || 0} component(s)`
    )
    if (summ.uniqueColorCount > 0) {
      strengths.push(`Design inventory utilizes ${summ.uniqueColorCount} distinct color values`)
    }
  } else if (isPrototypeProvided && prototypeValidation.isValid) {
    strengths.push('Public prototype link provided with valid format')
  } else {
    strengths.push('Core deliverable artifacts submitted')
  }

  if (hasUserFlow) {
    strengths.push('User flow documentation and interaction steps supplied')
  }
  if (hasPersona) {
    strengths.push('User persona documentation included in submission')
  }

  const missingRequirements = []
  if (isCanvaLink) {
    missingRequirements.push(CANVA_GUIDANCE_MESSAGE)
  }
  if (inspectionFailed) {
    missingRequirements.push(`Figma inspection note: ${inspectionResult.error}`)
  } else if (isFigmaProvided && !figmaValidation.isValid) {
    missingRequirements.push(`Figma URL format issue: ${figmaValidation.error}`)
  }

  missingRequirements.push(
    'Baseline heuristic draft: Accessibility contrast ratios and interactive component states require facilitator review.'
  )

  const improvements = []
  if (isCanvaLink) {
    improvements.push('Export Canva screens as PDF or high-resolution PNG for automated inspection')
  }
  if (inspectionFailed && (inspectionResult.statusCode === 401 || inspectionResult.statusCode === 403)) {
    improvements.push('Set Figma file sharing permissions to "Anyone with the link can view"')
  }
  improvements.push('Annotate interactive states (hover, pressed, disabled) in primary screen mockups')

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
    scoringMode: 'TEMPORARY_HEURISTIC_BASELINE',
  }
}

module.exports = {
  prepareEvaluationDraft,
}
