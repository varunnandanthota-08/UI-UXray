function createFeedbackShape() {
  return {
    strengths: [],
    missingRequirements: [],
    improvements: [],
    criterionObservations: [],
  }
}

function generateFeedback({ assignment, requirements, rubric, submission, criteriaResults } = {}) {
  if (!assignment || !rubric || !submission) {
    throw new Error('assignment, rubric, and submission are required')
  }

  // Feedback generation will be connected to an AI provider in a later step.
  void requirements
  void criteriaResults
  return createFeedbackShape()
}

module.exports = { createFeedbackShape, generateFeedback }
