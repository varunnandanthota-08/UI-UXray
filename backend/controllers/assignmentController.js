const Assignment = require('../models/Assignment')
const Rubric = require('../models/Rubric')
const Submission = require('../models/Submission')
const {
  fail,
  handleControllerError,
  isValidObjectId,
  normalizeString,
  normalizeStringArray,
  ok,
} = require('./controllerUtils')

function assignmentPayload(body) {
  const payload = {}
  const stringFields = ['title', 'description', 'instructions', 'assignmentType', 'deadline', 'status']

  for (const field of stringFields) {
    if (body[field] !== undefined) {
      payload[field] = field === 'deadline' ? body[field] : normalizeString(body[field])
    }
  }

  if (body.requirements !== undefined) {
    payload.requirements = normalizeStringArray(body.requirements)
  }

  if (body.totalMarks !== undefined) {
    payload.totalMarks = Number(body.totalMarks)
  }

  return payload
}

function validateAssignmentPayload(payload, isUpdate = false) {
  if (!isUpdate && !payload.title) return 'Title is required'
  if (!isUpdate && !payload.description) return 'Description is required'
  if (!isUpdate && payload.totalMarks === undefined) return 'Total marks is required'
  if (!isUpdate && !payload.deadline) return 'Deadline is required'
  if (payload.title !== undefined && !payload.title) return 'Title cannot be empty'
  if (payload.description !== undefined && !payload.description) return 'Description cannot be empty'
  if (payload.totalMarks !== undefined && (!Number.isFinite(payload.totalMarks) || payload.totalMarks <= 0)) {
    return 'Total marks must be greater than 0'
  }
  if (payload.deadline !== undefined && Number.isNaN(Date.parse(payload.deadline))) {
    return 'Deadline must be a valid date'
  }
  if (payload.status !== undefined && !['draft', 'active', 'closed'].includes(payload.status)) {
    return 'Invalid assignment status'
  }

  return null
}

async function createAssignment(req, res) {
  try {
    const payload = assignmentPayload(req.body || {})
    const validationError = validateAssignmentPayload(payload)
    if (validationError) return fail(res, 400, validationError)

    const assignment = await Assignment.create({ ...payload, createdBy: req.user.userId })
    return ok(res, 201, assignment)
  } catch (error) {
    return handleControllerError(res, error)
  }
}

async function listAssignments(req, res) {
  try {
    const filter = req.user.role === 'facilitator' ? { createdBy: req.user.userId } : { status: 'active' }
    const assignments = await Assignment.find(filter).sort({ createdAt: -1 })
    return ok(res, 200, assignments)
  } catch (error) {
    return handleControllerError(res, error)
  }
}

async function getAssignment(req, res) {
  if (!isValidObjectId(req.params.id)) return fail(res, 400, 'Invalid assignment ID')

  try {
    const assignment = await Assignment.findById(req.params.id)
    if (!assignment) return fail(res, 404, 'Assignment not found')

    if (req.user.role === 'student' && assignment.status !== 'active') {
      return fail(res, 404, 'Assignment not found')
    }

    if (req.user.role === 'facilitator' && assignment.createdBy.toString() !== req.user.userId) {
      return fail(res, 403, 'You do not own this assignment')
    }

    return ok(res, 200, assignment)
  } catch (error) {
    return handleControllerError(res, error)
  }
}

async function updateAssignment(req, res) {
  if (!isValidObjectId(req.params.id)) return fail(res, 400, 'Invalid assignment ID')

  try {
    const assignment = await Assignment.findById(req.params.id)
    if (!assignment) return fail(res, 404, 'Assignment not found')
    if (assignment.createdBy.toString() !== req.user.userId) {
      return fail(res, 403, 'You do not own this assignment')
    }

    const payload = assignmentPayload(req.body || {})
    const validationError = validateAssignmentPayload(payload, true)
    if (validationError) return fail(res, 400, validationError)

    Object.assign(assignment, payload)
    await assignment.save()
    return ok(res, 200, assignment)
  } catch (error) {
    return handleControllerError(res, error)
  }
}

async function deleteAssignment(req, res) {
  if (!isValidObjectId(req.params.id)) return fail(res, 400, 'Invalid assignment ID')

  try {
    const assignment = await Assignment.findById(req.params.id)
    if (!assignment) return fail(res, 404, 'Assignment not found')
    if (assignment.createdBy.toString() !== req.user.userId) {
      return fail(res, 403, 'You do not own this assignment')
    }

    const hasSubmissions = await Submission.exists({ assignmentId: assignment._id })
    if (hasSubmissions) return fail(res, 409, 'Assignment cannot be deleted after submissions exist')

    await Rubric.deleteMany({ assignmentId: assignment._id })
    await assignment.deleteOne()
    return ok(res, 200, { message: 'Assignment deleted' })
  } catch (error) {
    return handleControllerError(res, error)
  }
}

module.exports = {
  createAssignment,
  deleteAssignment,
  getAssignment,
  listAssignments,
  updateAssignment,
}

/*


*/