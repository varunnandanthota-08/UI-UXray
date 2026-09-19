const SUBMISSION_FIELDS = [
  'researchNotes',
  'persona',
  'userFlow',
  'figmaUrl',
  'figjamUrl',
  'prototypeUrl',
  'additionalNotes',
]

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeSubmission(submission = {}) {
  const normalized = {}

  for (const field of SUBMISSION_FIELDS) {
    normalized[field] = normalizeText(submission[field])
  }

  return normalized
}

module.exports = { normalizeSubmission }
