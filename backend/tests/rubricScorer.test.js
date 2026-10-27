const test = require('node:test')
const assert = require('node:assert')
const {
  calculateRubricScore,
  normalizeCriterionWeights,
} = require('../services/rubricScorer')

test('Rubric Scorer Service Suite', async (t) => {
  await t.test('1. Proportional Rubric (where maxMarks already reflects weighted allocation)', () => {
    // 20-point assignment with 4 criteria: 6, 5, 5, 4 marks; weights: 30%, 25%, 25%, 20%
    const criteria = [
      { name: 'Flow Continuity', maxMarks: 6, weightage: 30 },
      { name: 'Motion Polish', maxMarks: 5, weightage: 25 },
      { name: 'Component States', maxMarks: 5, weightage: 25 },
      { name: 'UX Rationale', maxMarks: 4, weightage: 20 },
    ]

    // Case A: 100% performance on all criteria
    const fullResult = calculateRubricScore({
      criteria,
      performanceRatios: [1.0, 1.0, 1.0, 1.0],
      assignmentTotalMarks: 20,
    })

    assert.strictEqual(fullResult.totalSuggestedMarks, 20)
    assert.strictEqual(fullResult.isValidTotalWeights, true)
    assert.strictEqual(fullResult.criteriaResults[0].awardedMarks, 6)
    assert.strictEqual(fullResult.criteriaResults[1].awardedMarks, 5)
    assert.strictEqual(fullResult.criteriaResults[2].awardedMarks, 5)
    assert.strictEqual(fullResult.criteriaResults[3].awardedMarks, 4)

    // Verify individual contributions directly equal awarded marks (no double-weighting)
    assert.strictEqual(fullResult.criteriaResults[0].contribution, 6)
    assert.strictEqual(fullResult.criteriaResults[1].contribution, 5)
    assert.strictEqual(fullResult.criteriaResults[2].contribution, 5)
    assert.strictEqual(fullResult.criteriaResults[3].contribution, 4)

    // Case B: Partial performance (50% on Flow, 100% on others)
    const partialResult = calculateRubricScore({
      criteria,
      performanceRatios: [0.5, 1.0, 1.0, 1.0],
      assignmentTotalMarks: 20,
    })
    // 3 + 5 + 5 + 4 = 17
    assert.strictEqual(partialResult.criteriaResults[0].awardedMarks, 3)
    assert.strictEqual(partialResult.criteriaResults[0].contribution, 3)
    assert.strictEqual(partialResult.totalSuggestedMarks, 17)
  })

  await t.test('2. Independent scale with unequal weights (scaling to assignment total marks)', () => {
    // 100-point assignment; each criterion scored on a 10-point scale; weights: 50%, 30%, 20%
    const criteria = [
      { name: 'Core Functionality', maxMarks: 10, weightage: 50 },
      { name: 'Visual Hierarchy', maxMarks: 10, weightage: 30 },
      { name: 'Documentation', maxMarks: 10, weightage: 20 },
    ]

    // Student scores 8/10 (80%), 6/10 (60%), 10/10 (100%)
    const result = calculateRubricScore({
      criteria,
      performanceRatios: [0.8, 0.6, 1.0],
      assignmentTotalMarks: 100,
    })

    // Criterion 1: 8/10 * 0.50 * 100 = 40
    // Criterion 2: 6/10 * 0.30 * 100 = 18
    // Criterion 3: 10/10 * 0.20 * 100 = 20
    // Total = 40 + 18 + 20 = 78
    assert.strictEqual(result.criteriaResults[0].awardedMarks, 8)
    assert.strictEqual(result.criteriaResults[0].contribution, 40)
    assert.strictEqual(result.criteriaResults[1].awardedMarks, 6)
    assert.strictEqual(result.criteriaResults[1].contribution, 18)
    assert.strictEqual(result.criteriaResults[2].awardedMarks, 10)
    assert.strictEqual(result.criteriaResults[2].contribution, 20)
    assert.strictEqual(result.totalSuggestedMarks, 78)
  })

  await t.test('3. Invalid weight totals (normalizes proportionally without failing)', () => {
    // Weights sum to 80 instead of 100 (e.g. 40 and 40)
    const criteria = [
      { name: 'Crit A', maxMarks: 10, weightage: 40 },
      { name: 'Crit B', maxMarks: 10, weightage: 40 },
    ]

    const norm = normalizeCriterionWeights(criteria)
    assert.strictEqual(norm.isValidTotalWeights, false)
    assert.ok(norm.warning.includes('Rubric criteria weightage sum is 80'))
    // Each normalized weight should be 40 / 80 = 0.5 (50%)
    assert.strictEqual(norm.normalizedWeights[0], 0.5)
    assert.strictEqual(norm.normalizedWeights[1], 0.5)

    const result = calculateRubricScore({
      criteria,
      performanceRatios: [1.0, 0.5],
      assignmentTotalMarks: 100,
    })
    // 100% of 50% = 50; 50% of 50% = 25 -> Total = 75
    assert.strictEqual(result.totalSuggestedMarks, 75)
  })

  await t.test('4. Missing, zero, or negative weights (fallback policy)', () => {
    // Weights are 0 or missing, but maxMarks exist (10, 30)
    const criteria = [
      { name: 'Design', maxMarks: 10, weightage: 0 },
      { name: 'Code', maxMarks: 30, weightage: undefined },
    ]

    const norm = normalizeCriterionWeights(criteria)
    // Should derive proportional weights: 10 / 40 = 0.25, 30 / 40 = 0.75
    assert.strictEqual(norm.normalizedWeights[0], 0.25)
    assert.strictEqual(norm.normalizedWeights[1], 0.75)
    assert.ok(/weights were derived proportionally/i.test(norm.warning))

    // When both weights and maxMarks are zero/missing
    const emptyCriteria = [
      { name: 'A', maxMarks: 0 },
      { name: 'B', maxMarks: 0 },
    ]
    const normEqual = normalizeCriterionWeights(emptyCriteria)
    assert.strictEqual(normEqual.normalizedWeights[0], 0.5)
    assert.strictEqual(normEqual.normalizedWeights[1], 0.5)
  })

  await t.test('5. Zero, negative, and non-finite maximum marks handled safely', () => {
    const criteria = [
      { name: 'Valid', maxMarks: 10, weightage: 50 },
      { name: 'Zero Max', maxMarks: 0, weightage: 25 },
      { name: 'Negative Max', maxMarks: -5, weightage: 25 },
    ]

    const result = calculateRubricScore({
      criteria,
      performanceRatios: [1.0, 1.0, 1.0],
      assignmentTotalMarks: 100,
    })

    // Valid criterion contributes 50
    assert.strictEqual(result.criteriaResults[0].awardedMarks, 10)
    assert.strictEqual(result.criteriaResults[0].contribution, 50)

    // Invalid criteria must not cause NaN or division by zero
    assert.strictEqual(result.criteriaResults[1].awardedMarks, 0)
    assert.strictEqual(result.criteriaResults[1].contribution, 0)
    assert.strictEqual(result.criteriaResults[1].automatedStatus, 'INSUFFICIENT_EVIDENCE')

    assert.strictEqual(result.criteriaResults[2].awardedMarks, 0)
    assert.strictEqual(result.criteriaResults[2].contribution, 0)

    // Total must be finite
    assert.strictEqual(Number.isFinite(result.totalSuggestedMarks), true)
    assert.strictEqual(result.totalSuggestedMarks, 50)
  })

  await t.test('6. Total score boundary enforcement (cannot exceed total possible or go negative)', () => {
    const criteria = [
      { name: 'Crit A', maxMarks: 10, weightage: 60 },
      { name: 'Crit B', maxMarks: 10, weightage: 60 }, // weights sum to 120
    ]

    const result = calculateRubricScore({
      criteria,
      performanceRatios: [1.0, 1.0],
      assignmentTotalMarks: 50,
    })

    // Cannot exceed 50
    assert.strictEqual(result.totalSuggestedMarks, 50)
    assert.ok(result.totalSuggestedMarks <= 50)
    assert.ok(result.totalSuggestedMarks >= 0)
  })

  await t.test('7. Empty criteria list fallback', () => {
    const result = calculateRubricScore({
      criteria: [],
      performanceRatios: 0.85,
      assignmentTotalMarks: 40,
    })

    assert.strictEqual(result.totalSuggestedMarks, 34) // 85% of 40 = 34
    assert.strictEqual(result.criteriaResults.length, 0)
  })
})
