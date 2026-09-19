const Assignment = require('../models/Assignment')
const Rubric = require('../models/Rubric')
const {
  fail,
  handleControllerError,
  isValidObjectId,
  normalizeString,
  normalizeStringArray,
  ok,
} = require('./controllerUtils')

function normalizeCriteria(criteria) {
  if (!Array.isArray(criteria)) return null

  return criteria.map((criterion) => ({
    name: normalizeString(criterion.name || criterion.criterionName),
    description: normalizeString(criterion.description),
    maxMarks: Number(criterion.maxMarks ?? criterion.maximumMarks),
    weightage: Number(criterion.weightage),
    checks: normalizeStringArray(criterion.checks || criterion.requirements),
  }))
}

function validateCriteria(criteria) {
  if (!criteria || criteria.length === 0) return 'At least one rubric criterion is required'

  for (const criterion of criteria) {
    if (!criterion.name) return 'Criterion name is required'
    if (!Number.isFinite(criterion.maxMarks) || criterion.maxMarks <= 0) {
      return 'Criterion maximum marks must be greater than 0'
    }
    if (!Number.isFinite(criterion.weightage) || criterion.weightage < 0 || criterion.weightage > 100) {
      return 'Criterion weightage must be between 0 and 100'
    }
  }

  const totalWeightage = criteria.reduce((total, criterion) => total + criterion.weightage, 0)
  if (Math.abs(totalWeightage - 100) > 0.0001) return 'Total rubric weightage must equal 100'
  return null
}

async function getOwnedAssignment(assignmentId, req) {
  if (!isValidObjectId(assignmentId)) return { error: [400, 'Invalid assignment ID'] }

  const assignment = await Assignment.findById(assignmentId)
  if (!assignment) return { error: [404, 'Assignment not found'] }

  if (req.user.role === 'facilitator' && assignment.createdBy.toString() !== req.user.userId) {
    return { error: [403, 'You do not own this assignment'] }
  }

  if (req.user.role === 'student' && assignment.status !== 'active') {
    return { error: [404, 'Assignment not found'] }
  }

  return { assignment }
}

function rubricPayload(body, createdBy) {
  const criteria = normalizeCriteria(body.criteria)
  if (!criteria) return null

  return {
    criteria,
    totalMarks: criteria.reduce((total, criterion) => total + criterion.maxMarks, 0),
    totalWeightage: criteria.reduce((total, criterion) => total + criterion.weightage, 0),
    createdBy,
  }
}

async function createRubric(req, res) {
  try {
    const result = await getOwnedAssignment(req.params.assignmentId, req)
    if (result.error) return fail(res, result.error[0], result.error[1])
    const payload = rubricPayload(req.body || {}, req.user.userId)
    const validationError = validateCriteria(payload?.criteria)
    if (validationError) return fail(res, 400, validationError)

    const existingRubric = await Rubric.exists({ assignmentId: result.assignment._id })
    if (existingRubric) return fail(res, 409, 'A rubric already exists for this assignment')

    const rubric = await Rubric.create({ ...payload, assignmentId: result.assignment._id })
    return ok(res, 201, rubric)
  } catch (error) {
    return handleControllerError(res, error)
  }
}

async function getRubric(req, res) {
  try {
    const result = await getOwnedAssignment(req.params.assignmentId, req)
    if (result.error) return fail(res, result.error[0], result.error[1])

    const rubric = await Rubric.findOne({ assignmentId: result.assignment._id })
    if (!rubric) return fail(res, 404, 'Rubric not found')
    return ok(res, 200, rubric)
  } catch (error) {
    return handleControllerError(res, error)
  }
}

async function updateRubric(req, res) {
  try {
    const result = await getOwnedAssignment(req.params.assignmentId, req)
    if (result.error) return fail(res, result.error[0], result.error[1])
    const rubric = await Rubric.findOne({ assignmentId: result.assignment._id })
    if (!rubric) return fail(res, 404, 'Rubric not found')

    const payload = rubricPayload(req.body || {}, rubric.createdBy || req.user.userId)
    const validationError = validateCriteria(payload?.criteria)
    if (validationError) return fail(res, 400, validationError)

    rubric.criteria = payload.criteria
    rubric.totalMarks = payload.totalMarks
    rubric.totalWeightage = payload.totalWeightage
    await rubric.save()
    return ok(res, 200, rubric)
  } catch (error) {
    return handleControllerError(res, error)
  }
}

async function deleteRubric(req, res) {
  try {
    const result = await getOwnedAssignment(req.params.assignmentId, req)
    if (result.error) return fail(res, result.error[0], result.error[1])
    const rubric = await Rubric.findOne({ assignmentId: result.assignment._id })
    if (!rubric) return fail(res, 404, 'Rubric not found')

    await rubric.deleteOne()
    return ok(res, 200, { message: 'Rubric deleted' })
  } catch (error) {
    return handleControllerError(res, error)
  }
}

module.exports = {
  createRubric,
  deleteRubric,
  getRubric,
  updateRubric,
}
