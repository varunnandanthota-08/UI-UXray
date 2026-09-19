const DEFAULT_FEEDBACK = {
  strengths: [],
  missingRequirements: [],
  improvements: [],
  criterionObservations: [],
}

function parseAiResponse(response) {
  let parsed

  try {
    const text = typeof response === 'string' ? response.trim() : response
    const withoutCodeFence = typeof text === 'string'
      ? text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
      : text
    parsed = typeof withoutCodeFence === 'string'
      ? JSON.parse(withoutCodeFence)
      : withoutCodeFence
  } catch (_error) {
    return { ok: false, data: null, error: 'AI response is not valid JSON' }
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, data: null, error: 'AI response must be a JSON object' }
  }

  const data = {
    ...DEFAULT_FEEDBACK,
    ...parsed,
  }

  for (const field of Object.keys(DEFAULT_FEEDBACK)) {
    if (!Array.isArray(data[field])) {
      data[field] = []
    }
  }

  return { ok: true, data, error: null }
}

module.exports = { parseAiResponse }
