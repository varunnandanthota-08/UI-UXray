const ALLOWED_STATUSES = [
  'PASS',
  'PARTIAL',
  'MISSING',
  'INSUFFICIENT_EVIDENCE',
]

function createRubricEvaluationShape(rubric = {}) {
  const criteria = Array.isArray(rubric.criteria) ? rubric.criteria : []

  return {
    criteriaResults: criteria.map((criterion) => ({
      criterionName: criterion.name || '',
      status: 'INSUFFICIENT_EVIDENCE',
      observations: [],
      missing: [],
      suggestions: [],
    })),
  }
}

function checkRubric({ assignment, requirements, rubric, submission } = {}) {
  if (!assignment || !rubric || !submission) {
    throw new Error('assignment, rubric, and submission are required')
  }

  // This prepares the stable result contract; AI evaluation is intentionally not called yet.
  void requirements
  void ALLOWED_STATUSES
  return createRubricEvaluationShape(rubric)
}

module.exports = {
  ALLOWED_STATUSES,
  checkRubric,
  createRubricEvaluationShape,
}
