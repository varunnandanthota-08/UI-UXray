function buildRubricEvaluationPrompt({ assignment, requirements, rubric, submission } = {}) {
  return [
    'Evaluate the student submission only against the supplied assignment, requirements, and facilitator-defined rubric.',
    'Do not invent evidence. If evidence is unavailable, distinguish INSUFFICIENT_EVIDENCE from a failed criterion.',
    'Return structured JSON with criteriaResults. Each result must contain criterionName, status, observations, missing, and suggestions.',
    'Use only these statuses: PASS, PARTIAL, MISSING, INSUFFICIENT_EVIDENCE.',
    'Do not provide or publish the facilitator\'s final score.',
    'Do not compare this submission with another student\'s submission.',
    'Recognize that different valid designs can look different; do not use pixel-perfect or exact-design matching.',
    '',
    `Assignment:\n${JSON.stringify(assignment || {}, null, 2)}`,
    `Requirements:\n${JSON.stringify(requirements || [], null, 2)}`,
    `Rubric:\n${JSON.stringify(rubric || {}, null, 2)}`,
    `Submission:\n${JSON.stringify(submission || {}, null, 2)}`,
  ].join('\n')
}

module.exports = { buildRubricEvaluationPrompt }
