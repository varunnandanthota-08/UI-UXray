const Assignment = require('../models/Assignment')
const Submission = require('../models/Submission')
const {
  fail,
  handleControllerError,
  isHttpUrl,
  isValidObjectId,
  normalizeString,
  ok,
} = require('./controllerUtils')

const evidenceFields = [
  'figmaUrl',
  'figjamUrl',
  'canvaUrl',
  'prototypeUrl',
  'researchNotes',
  'persona',
  'userFlow',
  'additionalNotes',
]

function submissionPayload(body) {
  const payload = {}
  for (const field of evidenceFields) {
    if (body[field] !== undefined) payload[field] = normalizeString(body[field])
  }
  return payload
}

function validateUrls(payload) {
  for (const field of ['figmaUrl', 'figjamUrl', 'canvaUrl', 'prototypeUrl']) {
    if (payload[field] && !isHttpUrl(payload[field])) return `${field} must be a valid HTTP or HTTPS URL`
  }
  return null
}

function hasEvidence(payload) {
  return evidenceFields.some((field) => Boolean(normalizeString(payload[field])))
}

async function getSubmissionForUser(id, req) {
  if (!isValidObjectId(id)) return { error: [400, 'Invalid submission ID'] }

  const submission = await Submission.findById(id)
  if (!submission) return { error: [404, 'Submission not found'] }

  if (req.user.role === 'student' && submission.studentId.toString() !== req.user.userId) {
    return { error: [403, 'You do not own this submission'] }
  }

  if (req.user.role === 'facilitator') {
    const assignment = await Assignment.findById(submission.assignmentId)
    if (!assignment) return { error: [404, 'Assignment not found'] }
    if (assignment.createdBy.toString() !== req.user.userId) {
      return { error: [403, 'You do not own this assignment'] }
    }
  }

  return { submission }
}

async function createSubmission(req, res) {
  if (!isValidObjectId(req.params.assignmentId)) return fail(res, 400, 'Invalid assignment ID')

  try {
    const assignment = await Assignment.findById(req.params.assignmentId)
    if (!assignment) return fail(res, 404, 'Assignment not found')
    if (assignment.status !== 'active') return fail(res, 409, 'This assignment is not accepting submissions')
    if (assignment.deadline <= new Date()) return fail(res, 409, 'The assignment deadline has passed')

    const payload = submissionPayload(req.body || {})
    const urlError = validateUrls(payload)
    if (urlError) return fail(res, 400, urlError)
    if (!hasEvidence(payload)) return fail(res, 400, 'At least one submission field or link is required')

    const submission = await Submission.create({
      ...payload,
      assignmentId: assignment._id,
      studentId: req.user.userId,
      status: 'submitted',
      submittedAt: new Date(),
    })
    return ok(res, 201, submission)
  } catch (error) {
    return handleControllerError(res, error)
  }
}

async function listAssignmentSubmissions(req, res) {
  if (!isValidObjectId(req.params.assignmentId)) return fail(res, 400, 'Invalid assignment ID')

  try {
    const assignment = await Assignment.findById(req.params.assignmentId)
    if (!assignment) return fail(res, 404, 'Assignment not found')
    if (assignment.createdBy.toString() !== req.user.userId) {
      return fail(res, 403, 'You do not own this assignment')
    }

    const submissions = await Submission.find({ assignmentId: assignment._id })
      .populate('studentId', 'name email')
      .sort({ submittedAt: -1 })
    return ok(res, 200, submissions)
  } catch (error) {
    return handleControllerError(res, error)
  }
}

async function listStudentSubmissions(req, res) {
  try {
    const submissions = await Submission.find({ studentId: req.user.userId })
      .populate('assignmentId', 'title description deadline totalMarks status')
      .sort({ submittedAt: -1 })
    return ok(res, 200, submissions)
  } catch (error) {
    return handleControllerError(res, error)
  }
}

async function getStudentAssignmentSubmission(req, res) {
  if (!isValidObjectId(req.params.assignmentId)) return fail(res, 400, 'Invalid assignment ID')

  try {
    const submission = await Submission.findOne({
      assignmentId: req.params.assignmentId,
      studentId: req.user.userId,
    })
    if (!submission) return fail(res, 404, 'Submission not found')
    return ok(res, 200, submission)
  } catch (error) {
    return handleControllerError(res, error)
  }
}

async function getSubmission(req, res) {
  try {
    const result = await getSubmissionForUser(req.params.id, req)
    if (result.error) return fail(res, result.error[0], result.error[1])
    return ok(res, 200, result.submission)
  } catch (error) {
    return handleControllerError(res, error)
  }
}

async function updateSubmission(req, res) {
  try {
    const result = await getSubmissionForUser(req.params.id, req)
    if (result.error) return fail(res, result.error[0], result.error[1])
    const submission = result.submission

    if (submission.status === 'evaluated') return fail(res, 409, 'Evaluated submissions cannot be changed')

    const assignment = await Assignment.findById(submission.assignmentId)
    if (!assignment) return fail(res, 404, 'Assignment not found')
    if (assignment.deadline <= new Date()) return fail(res, 409, 'The assignment deadline has passed')

    const payload = submissionPayload(req.body || {})
    const urlError = validateUrls(payload)
    if (urlError) return fail(res, 400, urlError)

    const merged = { ...submission.toObject(), ...payload }
    if (!hasEvidence(merged)) return fail(res, 400, 'At least one submission field or link is required')

    Object.assign(submission, payload)
    submission.status = 'submitted'
    submission.submittedAt = submission.submittedAt || new Date()
    await submission.save()
    return ok(res, 200, submission)
  } catch (error) {
    return handleControllerError(res, error)
  }
}

module.exports = {
  createSubmission,
  getStudentAssignmentSubmission,
  getSubmission,
  listAssignmentSubmissions,
  listStudentSubmissions,
  updateSubmission,
}
