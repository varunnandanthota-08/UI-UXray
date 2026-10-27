/**
 * Rubric Scorer Service
 *
 * Implements mathematically sound, weighted rubric scoring for assignment evaluations.
 *
 * Scoring Semantics & Policies:
 * 1. Criterion Maximum Marks (M_i):
 *    - Must be a finite, positive number.
 *    - If missing, negative, zero, or non-finite, awarded marks and contribution are safely set to 0.
 *
 * 2. Weightage & Normalization Policy:
 *    - By existing platform convention (backend/controllers/rubricController.js & backend/models/Rubric.js),
 *      rubric criteria weights are expected to total exactly 100.
 *    - If total weights equal 100 (+/- 0.001), normalized weight w_i = W_i / 100.
 *    - If weights are positive but sum to a value other than 100 (e.g. 80, 120, or legacy unnormalized weights),
 *      weights are normalized proportionally: w_i = W_i / sum(W_i), and a warning is noted.
 *    - If weights are completely missing, negative, or total <= 0:
 *      * If criteria have valid maxMarks, weights are derived proportionally from maxMarks: w_i = M_i / sum(M_i).
 *      * Otherwise, criteria share equal weights: w_i = 1 / N.
 *
 * 3. Criterion Contribution & Double-Weighting Prevention:
 *    - Each criterion evaluates the student's fractional achievement ratio R_i in [0, 1].
 *    - Criterion awarded marks: S_i = Math.min(M_i, Math.max(0, Math.round(R_i * M_i))).
 *    - Criterion contribution to assignment total marks T:
 *        contribution_i = (M_i > 0) ? (S_i / M_i) * w_i * T : 0
 *    - When maximum marks already represent the weighted allocation (i.e. M_i = w_i * T),
 *      contribution_i = (S_i / (w_i * T)) * w_i * T = S_i.
 *      Thus, summing contributions directly equals sum(S_i), preventing double-weighting.
 *    - When M_i is on an independent scale (e.g. each criterion out of 10 while weights are 50/30/20 and T = 100),
 *      the formula scales S_i into its weighted proportion of T.
 *
 * 4. Total Score Boundary:
 *    - Total suggested marks = Math.min(T, Math.max(0, Math.round(sum(contribution_i)))).
 *    - Guarantees the score is non-negative and never exceeds assignment totalMarks.
 */

/**
 * Normalizes criterion weights and validates consistency.
 *
 * @param {Array<object>} criteria
 * @returns {{ normalizedWeights: number[], totalWeight: number, isValidTotalWeights: boolean, warning: string|null }}
 */
function normalizeCriterionWeights(criteria) {
  if (!Array.isArray(criteria) || criteria.length === 0) {
    return {
      normalizedWeights: [],
      totalWeight: 0,
      isValidTotalWeights: false,
      warning: 'No criteria provided to normalize.',
    }
  }

  const rawWeights = criteria.map((c) => {
    const w = Number(c?.weightage)
    return Number.isFinite(w) && w >= 0 ? w : 0
  })

  const sumWeights = rawWeights.reduce((acc, val) => acc + val, 0)
  const isValidTotalWeights = Math.abs(sumWeights - 100) < 0.001

  let normalizedWeights
  let warning = null

  if (sumWeights > 0) {
    normalizedWeights = rawWeights.map((w) => w / sumWeights)
    if (!isValidTotalWeights) {
      warning = `Rubric criteria weightage sum is ${sumWeights}, expected 100. Weights were normalized proportionally.`
    }
  } else {
    // Fallback: check if criteria have positive maxMarks to infer proportional weights
    const rawMaxMarks = criteria.map((c) => {
      const m = Number(c?.maxMarks)
      return Number.isFinite(m) && m > 0 ? m : 0
    })
    const sumMax = rawMaxMarks.reduce((acc, val) => acc + val, 0)

    if (sumMax > 0) {
      normalizedWeights = rawMaxMarks.map((m) => m / sumMax)
      warning = 'Rubric criteria weights are missing or zero. Weights were derived proportionally from maximum marks.'
    } else {
      const equalShare = 1 / criteria.length
      normalizedWeights = criteria.map(() => equalShare)
      warning = 'Rubric criteria weights and maximum marks are missing or zero. Equal weights applied.'
    }
  }

  return {
    normalizedWeights,
    totalWeight: sumWeights,
    isValidTotalWeights,
    warning,
  }
}

/**
 * Calculates weighted criterion contributions and overall suggested marks.
 *
 * @param {object} params
 * @param {Array<object>} params.criteria - Rubric criteria
 * @param {Array<number|object>|number} [params.performanceRatios] - Performance ratio(s) in [0, 1] or objects with { ratio, status, notes }
 * @param {number} [params.assignmentTotalMarks=100] - Assignment total marks
 * @returns {{ criteriaResults: Array<object>, totalSuggestedMarks: number, totalPossible: number, isValidTotalWeights: boolean, warning: string|null }}
 */
function calculateRubricScore({ criteria, performanceRatios, assignmentTotalMarks }) {
  const parsedTotal = Number(assignmentTotalMarks)
  const totalPossible = Number.isFinite(parsedTotal) && parsedTotal > 0 ? parsedTotal : 100
  const criteriaList = Array.isArray(criteria) ? criteria : []

  if (criteriaList.length === 0) {
    const fallbackRatio =
      typeof performanceRatios === 'number'
        ? Math.max(0, Math.min(1, performanceRatios))
        : 0.85
    const fallbackScore = Math.min(totalPossible, Math.max(0, Math.round(totalPossible * fallbackRatio)))
    return {
      criteriaResults: [],
      totalSuggestedMarks: fallbackScore,
      totalPossible,
      isValidTotalWeights: false,
      warning: 'No rubric criteria provided; defaulted to baseline score calculation.',
    }
  }

  const { normalizedWeights, isValidTotalWeights, warning } = normalizeCriterionWeights(criteriaList)

  let totalContribution = 0
  const criteriaResults = criteriaList.map((c, index) => {
    const rawMax = Number(c?.maxMarks)
    const maxMarks = Number.isFinite(rawMax) && rawMax > 0 ? rawMax : 0
    const rawWeight = Number(c?.weightage)
    const weightage = Number.isFinite(rawWeight) && rawWeight >= 0 ? rawWeight : 0
    const w_i = normalizedWeights[index]

    // Determine performance ratio and qualitative notes
    let ratio = 0.85
    let status = 'PASS'
    let notes = 'Satisfies core expectations.'

    if (Array.isArray(performanceRatios) && performanceRatios[index] !== undefined) {
      const p = performanceRatios[index]
      if (typeof p === 'number') {
        ratio = Math.max(0, Math.min(1, p))
      } else if (p && typeof p === 'object') {
        if (typeof p.ratio === 'number') ratio = Math.max(0, Math.min(1, p.ratio))
        if (p.status) status = p.status
        if (p.notes) notes = p.notes
      }
    } else if (typeof performanceRatios === 'number') {
      ratio = Math.max(0, Math.min(1, performanceRatios))
    }

    let awardedMarks = 0
    let contribution = 0

    if (maxMarks > 0) {
      awardedMarks = Math.min(maxMarks, Math.max(0, Math.round(maxMarks * ratio)))
      // Exact contribution to assignment total marks T
      contribution = (awardedMarks / maxMarks) * w_i * totalPossible
    } else {
      awardedMarks = 0
      contribution = 0
      status = 'INSUFFICIENT_EVIDENCE'
      notes = 'Criterion has zero or invalid maximum marks.'
    }

    totalContribution += contribution

    const resultItem = {
      criterionName: c?.name || `Criterion ${index + 1}`,
      maxMarks,
      awardedMarks,
      weightage,
      automatedStatus: status,
      automatedNotes: notes,
      contribution: Number(contribution.toFixed(4)),
    }

    if (c?._id) {
      resultItem.criterionId = c._id
    }

    return resultItem
  })

  // Final score cannot exceed assignment total marks and cannot be negative
  const totalSuggestedMarks = Math.min(totalPossible, Math.max(0, Math.round(totalContribution)))

  return {
    criteriaResults,
    totalSuggestedMarks,
    totalPossible,
    isValidTotalWeights,
    warning,
  }
}

module.exports = {
  calculateRubricScore,
  normalizeCriterionWeights,
}
