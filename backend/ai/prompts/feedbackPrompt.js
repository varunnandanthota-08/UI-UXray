function buildFeedbackPrompt({ assignment, requirements, rubric, submission, criteriaResults } = {}) {
  return [
    'Generate advisory feedback for the facilitator using only the supplied assignment, requirements, rubric, submission, and criterion results.',
    'Do not invent evidence or treat missing information as present.',
    'Return structured JSON with strengths, missingRequirements, improvements, and criterionObservations.',
    'Explain why requirements or criteria appear missing or weak and provide actionable improvements.',
    'Include criterion-specific observations grounded in the submitted evidence.',
    'Do not assign or publish the final facilitator score.',
    '',
    `Assignment:\n${JSON.stringify(assignment || {}, null, 2)}`,
    `Requirements:\n${JSON.stringify(requirements || [], null, 2)}`,
    `Rubric:\n${JSON.stringify(rubric || {}, null, 2)}`,
    `Submission:\n${JSON.stringify(submission || {}, null, 2)}`,
    `Criterion results:\n${JSON.stringify(criteriaResults || [], null, 2)}`,
  ].join('\n')
}

module.exports = { buildFeedbackPrompt }
