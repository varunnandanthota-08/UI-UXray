const Assignment = require('../models/Assignment')
const Evaluation = require('../models/Evaluation')
const Rubric = require('../models/Rubric')
const Submission = require('../models/Submission')
const {
  fail,
  handleControllerError,
  isValidObjectId,
  normalizeString,
  ok,
} = require('./controllerUtils')
const { validateFigmaUrl, isCanvaUrl, CANVA_GUIDANCE_MESSAGE } = require('../services/designUrlValidator')
const { calculateRubricScore } = require('../services/rubricScorer')
const figmaInspector = require('../services/figmaInspector')
const { prepareEvaluationDraft } = require('../services/evaluationPreparer')

const evaluationStatuses = ['draft', 'ai_review_complete', 'facilitator_review', 'approved']
const automatedStatuses = ['PASS', 'PARTIAL', 'MISSING', 'INSUFFICIENT_EVIDENCE']

function numberOrUndefined(value) {
  if (value === undefined || value === null || value === '') return undefined
  return Number(value)
}

function evaluationPayload(body) {
  const payload = {}
  const fields = [
    'criteriaResults',
    'aiFeedback',
    'aiSuggestedMarks',
    'facilitatorMarks',
    'finalMarks',
    'facilitatorComments',
    'status',
    'inspectionMetadata',
    'evidenceSummary',
  ]

  for (const field of fields) {
    if (body[field] !== undefined) payload[field] = body[field]
  }

  for (const field of ['aiSuggestedMarks', 'facilitatorMarks', 'finalMarks']) {
    if (payload[field] !== undefined) payload[field] = numberOrUndefined(payload[field])
  }

  if (payload.facilitatorComments !== undefined) {
    payload.facilitatorComments = normalizeString(payload.facilitatorComments)
  }

  return payload
}

function validateEvaluationPayload(payload, totalMarks) {
  if (payload.status !== undefined && !evaluationStatuses.includes(payload.status)) {
    return 'Invalid evaluation status'
  }

  for (const field of ['aiSuggestedMarks', 'facilitatorMarks', 'finalMarks']) {
    if (payload[field] !== undefined && (!Number.isFinite(payload[field]) || payload[field] < 0)) {
      return `${field} must be a non-negative number`
    }
    if (payload[field] !== undefined && payload[field] > totalMarks) {
      return `${field} cannot exceed assignment total marks`
    }
  }

  if (payload.status === 'approved' && payload.finalMarks === undefined) {
    return 'finalMarks is required when approving an evaluation'
  }

  if (payload.criteriaResults !== undefined) {
    if (!Array.isArray(payload.criteriaResults)) return 'criteriaResults must be an array'
    for (const result of payload.criteriaResults) {
      if (result.awardedMarks !== undefined && (!Number.isFinite(Number(result.awardedMarks)) || Number(result.awardedMarks) < 0)) {
        return 'Criterion awarded marks must be a non-negative number'
      }
      if (result.automatedStatus !== undefined && !automatedStatuses.includes(result.automatedStatus)) {
        return 'Invalid automated criterion status'
      }
    }
  }

  return null
}

async function getEvaluationAccess(id, req) {
  if (!isValidObjectId(id)) return { error: [400, 'Invalid evaluation ID'] }

  const evaluation = await Evaluation.findById(id)
  if (!evaluation) return { error: [404, 'Evaluation not found'] }
  const submission = await Submission.findById(evaluation.submissionId)
  if (!submission) return { error: [404, 'Submission not found'] }
  const assignment = await Assignment.findById(submission.assignmentId)
  if (!assignment) return { error: [404, 'Assignment not found'] }

  if (req.user.role === 'student' && submission.studentId.toString() !== req.user.userId) {
    return { error: [403, 'You do not own this submission'] }
  }
  if (req.user.role === 'facilitator' && assignment.createdBy.toString() !== req.user.userId) {
    return { error: [403, 'You do not own this assignment'] }
  }

  return { evaluation, submission, assignment }
}

async function getSubmissionContext(id) {
  if (!isValidObjectId(id)) return { error: [400, 'Invalid submission ID'] }
  const submission = await Submission.findById(id)
  if (!submission) return { error: [404, 'Submission not found'] }
  const assignment = await Assignment.findById(submission.assignmentId)
  if (!assignment) return { error: [404, 'Assignment not found'] }
  return { submission, assignment }
}

async function createEvaluation(req, res) {
  try {
    const context = await getSubmissionContext(req.params.submissionId)
    if (context.error) return fail(res, context.error[0], context.error[1])
    if (context.assignment.createdBy.toString() !== req.user.userId) {
      return fail(res, 403, 'You do not own this assignment')
    }

    const existingEvaluation = await Evaluation.exists({ submissionId: context.submission._id })
    if (existingEvaluation) return fail(res, 409, 'An evaluation already exists for this submission')

    const payload = evaluationPayload(req.body || {})
    const validationError = validateEvaluationPayload(payload, context.assignment.totalMarks)
    if (validationError) return fail(res, 400, validationError)

    const evaluation = await Evaluation.create({
      ...payload,
      submissionId: context.submission._id,
      assignmentId: context.assignment._id,
      studentId: context.submission.studentId,
      reviewedBy: req.user.userId,
      reviewedAt: payload.status === 'approved' ? new Date() : undefined,
    })

    return ok(res, 201, evaluation)
  } catch (error) {
    return handleControllerError(res, error)
  }
}

async function getSubmissionEvaluation(req, res) {
  try {
    const context = await getSubmissionContext(req.params.submissionId)
    if (context.error) return fail(res, context.error[0], context.error[1])

    if (req.user.role === 'student' && context.submission.studentId.toString() !== req.user.userId) {
      return fail(res, 403, 'You do not own this submission')
    }
    if (req.user.role === 'facilitator' && context.assignment.createdBy.toString() !== req.user.userId) {
      return fail(res, 403, 'You do not own this assignment')
    }

    const evaluation = await Evaluation.findOne({ submissionId: context.submission._id })
      .populate('assignmentId', 'title totalMarks')
      .populate('studentId', 'name email')
    if (!evaluation) return fail(res, 404, 'Evaluation not found')
    return ok(res, 200, evaluation)
  } catch (error) {
    return handleControllerError(res, error)
  }
}

async function getEvaluation(req, res) {
  try {
    const { id } = req.params
    if (!isValidObjectId(id)) {
      return fail(res, 400, 'Invalid evaluation ID')
    }

    let evaluation = await Evaluation.findById(id)
      .populate('assignmentId', 'title totalMarks')
      .populate('studentId', 'name email')

    if (!evaluation) {
      evaluation = await Evaluation.findOne({ submissionId: id })
        .populate('assignmentId', 'title totalMarks')
        .populate('studentId', 'name email')
    }

    if (!evaluation) {
      return fail(res, 404, 'Evaluation not found')
    }

    const submission = await Submission.findById(evaluation.submissionId)
    if (!submission) {
      return fail(res, 404, 'Submission not found')
    }

    const assignment = await Assignment.findById(submission.assignmentId)
    if (!assignment) {
      return fail(res, 404, 'Assignment not found')
    }

    if (req.user.role === 'student' && submission.studentId.toString() !== req.user.userId) {
      return fail(res, 403, 'You do not own this submission')
    }

    if (req.user.role === 'facilitator' && assignment.createdBy.toString() !== req.user.userId) {
      return fail(res, 403, 'You do not own this assignment')
    }

    if (req.user.role !== 'student' && req.user.role !== 'facilitator') {
      return fail(res, 403, 'You do not have permission to view this evaluation')
    }

    const evalObj = evaluation.toObject ? evaluation.toObject() : { ...evaluation }
    if (!evalObj.assignmentId || typeof evalObj.assignmentId !== 'object') {
      evalObj.assignmentId = assignment
    }

    if (req.user.role === 'student') {
      delete evalObj.aiSuggestedMarks
      delete evalObj.aiFeedback
      delete evalObj.inspectionMetadata
      delete evalObj.evidenceSummary
      if (evalObj.status !== 'approved') {
        delete evalObj.finalMarks
        delete evalObj.facilitatorMarks
      }
    }

    return ok(res, 200, evalObj)
  } catch (error) {
    return handleControllerError(res, error)
  }
}

async function updateEvaluation(req, res) {
  try {
    const context = await getEvaluationAccess(req.params.id, req)
    if (context.error) return fail(res, context.error[0], context.error[1])

    const payload = evaluationPayload(req.body || {})
    const validationError = validateEvaluationPayload(payload, context.assignment.totalMarks)
    if (validationError) return fail(res, 400, validationError)

    Object.assign(context.evaluation, payload)
    context.evaluation.reviewedBy = req.user.userId
    if (payload.status === 'approved') context.evaluation.reviewedAt = new Date()
    await context.evaluation.save()
    return ok(res, 200, context.evaluation)
  } catch (error) {
    return handleControllerError(res, error)
  }
}

async function generateAiDraft(req, res) {
  try {
    const context = await getSubmissionContext(req.params.submissionId)
    if (context.error) return fail(res, context.error[0], context.error[1])
    if (context.assignment.createdBy.toString() !== req.user.userId) {
      return fail(res, 403, 'You do not own this assignment')
    }

    const rubric = await Rubric.findOne({ assignmentId: context.assignment._id })
    const criteria = rubric?.criteria || []
    const sub = context.submission

    // 1. Inspect Figma design if valid Figma URL is supplied (via figmaInspector)
    let inspectionResult = null
    const figmaValidation = validateFigmaUrl(sub.figmaUrl, { optional: true })

    if (figmaValidation.isValid && figmaValidation.fileKey) {
      inspectionResult = await figmaInspector.inspectFigmaDesign(sub.figmaUrl)
    }

    // 2. Prepare evaluation draft with bounded evidence and rubric criteria
    const draftData = await prepareEvaluationDraft({
      criteria,
      submission: sub,
      assignmentTotalMarks: context.assignment.totalMarks || 100,
      inspectionResult,
    })

    if (draftData.error) {
      return fail(res, draftData.statusCode || 502, draftData.error)
    }

    // 3. Persist evaluation draft to MongoDB
    let evaluation = await Evaluation.findOne({ submissionId: context.submission._id })
    if (evaluation) {
      evaluation.criteriaResults = draftData.criteriaResults
      evaluation.aiFeedback = draftData.aiFeedback
      evaluation.aiSuggestedMarks = draftData.aiSuggestedMarks
      evaluation.inspectionMetadata = draftData.inspectionMetadata
      evaluation.evidenceSummary = draftData.evidenceSummary
      evaluation.status = 'ai_review_complete'
      await evaluation.save()
    } else {
      evaluation = await Evaluation.create({
        submissionId: context.submission._id,
        assignmentId: context.assignment._id,
        studentId: context.submission.studentId,
        criteriaResults: draftData.criteriaResults,
        aiFeedback: draftData.aiFeedback,
        aiSuggestedMarks: draftData.aiSuggestedMarks,
        inspectionMetadata: draftData.inspectionMetadata,
        evidenceSummary: draftData.evidenceSummary,
        status: 'ai_review_complete',
      })
    }

    return ok(res, 200, evaluation)
  } catch (error) {
    return handleControllerError(res, error)
  }
}

module.exports = {
  createEvaluation,
  generateAiDraft,
  getEvaluation,
  getSubmissionEvaluation,
  updateEvaluation,
}




