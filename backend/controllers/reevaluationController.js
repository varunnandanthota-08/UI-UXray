const Assignment = require('../models/Assignment')
const Evaluation = require('../models/Evaluation')
const ReevaluationRequest = require('../models/ReevaluationRequest')
const Submission = require('../models/Submission')
const {
  fail,
  handleControllerError,
  isValidObjectId,
  normalizeString,
  ok,
} = require('./controllerUtils')

function mapStatusToUi(status) {
  switch (status) {
    case 'pending':
      return 'REQUESTED'
    case 'under_review':
      return 'UNDER_REVIEW'
    case 'approved':
      return 'RESOLVED'
    case 'rejected':
      return 'REJECTED'
    default:
      return status ? status.toUpperCase() : 'REQUESTED'
  }
}

function formatReevaluationResponse(request, evaluation = null, assignment = null) {
  const reqObj = request.toObject ? request.toObject() : { ...request }
  const uiStatus = mapStatusToUi(reqObj.status)
  const score = evaluation?.finalMarks ?? reqObj.evaluationId?.finalMarks ?? 0
  const maxScore = reqObj.assignmentId?.totalMarks || assignment?.totalMarks || reqObj.evaluationId?.assignmentId?.totalMarks || 20

  return {
    ...reqObj,
    id: reqObj._id,
    _id: reqObj._id,
    status: uiStatus,
    rawStatus: reqObj.status,
    studentName: reqObj.studentId?.name || 'Student',
    studentEmail: reqObj.studentId?.email || '',
    studentAvatar: reqObj.studentId?.name
      ? reqObj.studentId.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
      : 'ST',
    assignmentTitle: reqObj.assignmentId?.title || assignment?.title || 'Studio Assignment',
    score,
    maxScore,
    facilitatorNotes: reqObj.facilitatorResponse || '',
    declineReason: reqObj.status === 'rejected' ? reqObj.facilitatorResponse || '' : '',
    resolutionNotes: reqObj.facilitatorResponse || '',
    reEvaluation: {
      isRequested: ['pending', 'under_review'].includes(reqObj.status),
      status: reqObj.status === 'approved' ? 'COMPLETED' : uiStatus,
      reason: reqObj.reason,
      requestedAt: reqObj.createdAt
        ? new Date(reqObj.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : 'Recently',
      resolutionNotes: reqObj.facilitatorResponse || '',
      facilitatorNotes: reqObj.facilitatorResponse || '',
      declineReason: reqObj.status === 'rejected' ? reqObj.facilitatorResponse || '' : '',
    },
  }
}

async function findReevaluationRequestByIdentifier(id) {
  if (!isValidObjectId(id)) return null
  let request = await ReevaluationRequest.findById(id)
    .populate('studentId', 'name email')
    .populate('assignmentId', 'title totalMarks createdBy')
    .populate('evaluationId')
    .populate('submissionId')

  if (!request) {
    request = await ReevaluationRequest.findOne({
      $or: [{ evaluationId: id }, { submissionId: id }],
    })
      .sort({ createdAt: -1 })
      .populate('studentId', 'name email')
      .populate('assignmentId', 'title totalMarks createdBy')
      .populate('evaluationId')
      .populate('submissionId')
  }

  return request
}

async function formatEvaluationPayload(evaluationId) {
  const evaluation = await Evaluation.findById(evaluationId)
    .populate('assignmentId', 'title totalMarks createdBy')
    .populate('studentId', 'name email')

  if (!evaluation) return null

  const activeReEval = await ReevaluationRequest.findOne({ evaluationId: evaluation._id }).sort({ createdAt: -1 })
  const evalObj = evaluation.toObject ? evaluation.toObject() : { ...evaluation }

  evalObj.id = evalObj._id
  evalObj.score = evalObj.finalMarks ?? evalObj.facilitatorMarks ?? 0
  evalObj.maxScore = evalObj.assignmentId?.totalMarks || 20

  if (activeReEval) {
    const uiStatus = mapStatusToUi(activeReEval.status)
    evalObj.reEvaluation = {
      isRequested: ['pending', 'under_review'].includes(activeReEval.status),
      status: activeReEval.status === 'approved' ? 'COMPLETED' : uiStatus,
      reason: activeReEval.reason,
      requestedAt: activeReEval.createdAt
        ? new Date(activeReEval.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : 'Recently',
      resolutionNotes: activeReEval.facilitatorResponse || '',
      facilitatorNotes: activeReEval.facilitatorResponse || '',
      declineReason: activeReEval.status === 'rejected' ? activeReEval.facilitatorResponse || '' : '',
      id: activeReEval._id,
    }
  }

  return evalObj
}

async function createReevaluationRequest(req, res) {
  try {
    if (req.user.role !== 'student') {
      return fail(res, 403, 'Only students can request re-evaluation')
    }

    const { evaluationId, reason, additionalEvidence } = req.body || {}
    if (!evaluationId) {
      return fail(res, 400, 'evaluationId is required')
    }
    if (!isValidObjectId(evaluationId)) {
      return fail(res, 400, 'Invalid evaluation ID')
    }

    const cleanReason = normalizeString(reason)
    if (!cleanReason) {
      return fail(res, 400, 'Reason is required')
    }

    let evaluation = await Evaluation.findById(evaluationId)
    if (!evaluation) {
      evaluation = await Evaluation.findOne({ submissionId: evaluationId })
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

    if (submission.studentId.toString() !== req.user.userId) {
      return fail(res, 403, 'You do not own this submission')
    }

    if (evaluation.status !== 'approved') {
      return fail(res, 400, 'Re-evaluation can only be requested for approved evaluations')
    }

    const activeRequest = await ReevaluationRequest.findOne({
      evaluationId: evaluation._id,
      status: { $in: ['pending', 'under_review'] },
    })
    if (activeRequest) {
      return fail(res, 409, 'An active re-evaluation request already exists for this evaluation')
    }

    const request = await ReevaluationRequest.create({
      submissionId: submission._id,
      evaluationId: evaluation._id,
      studentId: req.user.userId,
      assignmentId: assignment._id,
      reason: cleanReason,
      additionalEvidence: normalizeString(additionalEvidence),
      status: 'pending',
    })

    return ok(res, 201, formatReevaluationResponse(request, evaluation, assignment))
  } catch (error) {
    return handleControllerError(res, error)
  }
}

async function getReevaluationRequest(req, res) {
  try {
    const { id } = req.params
    if (!isValidObjectId(id)) {
      return fail(res, 400, 'Invalid ID')
    }

    const request = await findReevaluationRequestByIdentifier(id)
    if (!request) {
      return fail(res, 404, 'Re-evaluation request not found')
    }

    const studentOwner = request.studentId?._id ? request.studentId._id.toString() : request.studentId?.toString()
    if (req.user.role === 'student' && studentOwner !== req.user.userId) {
      return fail(res, 403, 'You do not own this re-evaluation request')
    }

    if (req.user.role === 'facilitator') {
      const assignmentOwner = request.assignmentId?.createdBy?._id
        ? request.assignmentId.createdBy._id.toString()
        : request.assignmentId?.createdBy?.toString()
      if (assignmentOwner && assignmentOwner !== req.user.userId) {
        return fail(res, 403, 'You do not own this assignment')
      }
    }

    return ok(res, 200, formatReevaluationResponse(request))
  } catch (error) {
    return handleControllerError(res, error)
  }
}

async function listReevaluationRequests(req, res) {
  try {
    if (req.user.role !== 'facilitator') {
      return fail(res, 403, 'Only facilitators can list re-evaluation requests')
    }

    const assignments = await Assignment.find({ createdBy: req.user.userId }).select('_id title totalMarks')
    const assignmentIds = assignments.map((a) => a._id)

    const requests = await ReevaluationRequest.find({ assignmentId: { $in: assignmentIds } })
      .populate('studentId', 'name email')
      .populate('assignmentId', 'title totalMarks')
      .populate('evaluationId')
      .populate('submissionId')
      .sort({ createdAt: -1 })

    return ok(
      res,
      200,
      requests.map((r) => formatReevaluationResponse(r)),
    )
  } catch (error) {
    return handleControllerError(res, error)
  }
}

async function approveReevaluationRequest(req, res) {
  try {
    if (req.user.role !== 'facilitator') {
      return fail(res, 403, 'Only facilitators can approve re-evaluations')
    }

    const { id } = req.params
    if (!isValidObjectId(id)) {
      return fail(res, 400, 'Invalid ID')
    }

    const request = await findReevaluationRequestByIdentifier(id)
    if (!request) {
      return fail(res, 404, 'Re-evaluation request not found')
    }

    const assignment = await Assignment.findById(request.assignmentId?._id || request.assignmentId)
    if (!assignment || assignment.createdBy.toString() !== req.user.userId) {
      return fail(res, 403, 'You do not own this assignment')
    }

    if (request.status !== 'pending') {
      return fail(res, 409, 'Only pending requests can be approved for review')
    }

    request.status = 'under_review'
    request.facilitatorResponse = normalizeString(req.body.facilitatorNotes || 'Under mentor review')
    request.reviewedBy = req.user.userId
    request.reviewedAt = new Date()
    await request.save()

    const formattedEval = await formatEvaluationPayload(request.evaluationId._id || request.evaluationId)
    return ok(res, 200, formattedEval)
  } catch (error) {
    return handleControllerError(res, error)
  }
}

async function rejectReevaluationRequest(req, res) {
  try {
    if (req.user.role !== 'facilitator') {
      return fail(res, 403, 'Only facilitators can reject re-evaluations')
    }

    const { id } = req.params
    if (!isValidObjectId(id)) {
      return fail(res, 400, 'Invalid ID')
    }

    const request = await findReevaluationRequestByIdentifier(id)
    if (!request) {
      return fail(res, 404, 'Re-evaluation request not found')
    }

    const assignment = await Assignment.findById(request.assignmentId?._id || request.assignmentId)
    if (!assignment || assignment.createdBy.toString() !== req.user.userId) {
      return fail(res, 403, 'You do not own this assignment')
    }

    if (!['pending', 'under_review'].includes(request.status)) {
      return fail(res, 409, 'This re-evaluation request has already been resolved')
    }

    const declineReason = normalizeString(req.body.declineReason)
    if (!declineReason) {
      return fail(res, 400, 'Decline reason is required')
    }

    request.status = 'rejected'
    request.facilitatorResponse = declineReason
    request.reviewedBy = req.user.userId
    request.reviewedAt = new Date()
    await request.save()

    const formattedEval = await formatEvaluationPayload(request.evaluationId._id || request.evaluationId)
    return ok(res, 200, formattedEval)
  } catch (error) {
    return handleControllerError(res, error)
  }
}

async function finalizeReevaluationRequest(req, res) {
  try {
    if (req.user.role !== 'facilitator') {
      return fail(res, 403, 'Only facilitators can finalize re-evaluations')
    }

    const { id } = req.params
    if (!isValidObjectId(id)) {
      return fail(res, 400, 'Invalid ID')
    }

    const request = await findReevaluationRequestByIdentifier(id)
    if (!request) {
      return fail(res, 404, 'Re-evaluation request not found')
    }

    const assignment = await Assignment.findById(request.assignmentId?._id || request.assignmentId)
    if (!assignment || assignment.createdBy.toString() !== req.user.userId) {
      return fail(res, 403, 'You do not own this assignment')
    }

    if (!['pending', 'under_review'].includes(request.status)) {
      return fail(res, 409, 'This re-evaluation request has already been resolved')
    }

    const evaluation = await Evaluation.findById(request.evaluationId._id || request.evaluationId)
    if (!evaluation) {
      return fail(res, 404, 'Evaluation not found')
    }

    const body = req.body || {}
    const resolutionNotes = normalizeString(body.reEvaluationResolutionNotes)
    if (!resolutionNotes) {
      return fail(res, 400, 'Resolution notes are required')
    }

    // Preserve the original evaluation as a historical version
    const versionNumber = (evaluation.versions?.length || 0) + 1
    evaluation.versions.push({
      versionNumber,
      finalMarks: evaluation.finalMarks,
      criteriaResults: evaluation.criteriaResults,
      facilitatorComments: evaluation.facilitatorComments,
      reviewedBy: evaluation.reviewedBy,
      reviewedAt: evaluation.reviewedAt || evaluation.updatedAt,
      resolutionNotes: evaluation.facilitatorComments,
    })

    // Apply revised scores if provided
    const revisedScores = body.revisedScores
    const revisedCriterionFeedback = body.revisedCriterionFeedback
    if (revisedScores && typeof revisedScores === 'object') {
      for (const cr of evaluation.criteriaResults) {
        const key = cr.criterionId ? cr.criterionId.toString() : cr.criterionName
        if (revisedScores[key] !== undefined) {
          cr.awardedMarks = Number(revisedScores[key])
        } else if (revisedScores[cr.criterionName] !== undefined) {
          cr.awardedMarks = Number(revisedScores[cr.criterionName])
        }
        if (revisedCriterionFeedback?.[key] !== undefined) {
          cr.facilitatorComment = normalizeString(revisedCriterionFeedback[key])
        } else if (revisedCriterionFeedback?.[cr.criterionName] !== undefined) {
          cr.facilitatorComment = normalizeString(revisedCriterionFeedback[cr.criterionName])
        }
      }
    }

    const revisedTotalScore = body.revisedTotalScore !== undefined ? Number(body.revisedTotalScore) : evaluation.finalMarks
    if (!Number.isFinite(revisedTotalScore) || revisedTotalScore < 0 || revisedTotalScore > assignment.totalMarks) {
      return fail(res, 400, 'Revised total score must be a valid number between 0 and assignment total marks')
    }

    evaluation.finalMarks = revisedTotalScore
    evaluation.facilitatorMarks = revisedTotalScore

    const commentsParts = [
      `Resolution: ${resolutionNotes}`,
      body.revisedGeneralFeedback ? normalizeString(body.revisedGeneralFeedback) : '',
      body.revisedStrengths ? `Strengths: ${normalizeString(body.revisedStrengths)}` : '',
      body.revisedGrowthAreas ? `Growth Areas: ${normalizeString(body.revisedGrowthAreas)}` : '',
    ].filter(Boolean)

    if (commentsParts.length > 0) {
      evaluation.facilitatorComments = commentsParts.join('\n\n')
    }

    evaluation.status = 'approved'
    evaluation.reviewedBy = req.user.userId
    evaluation.reviewedAt = new Date()
    await evaluation.save()

    request.status = 'approved'
    request.facilitatorResponse = resolutionNotes
    request.reviewedBy = req.user.userId
    request.reviewedAt = new Date()
    await request.save()

    const formattedEval = await formatEvaluationPayload(evaluation._id)
    return ok(res, 200, formattedEval)
  } catch (error) {
    return handleControllerError(res, error)
  }
}

module.exports = {
  approveReevaluationRequest,
  createReevaluationRequest,
  finalizeReevaluationRequest,
  getReevaluationRequest,
  listReevaluationRequests,
  rejectReevaluationRequest,
}
