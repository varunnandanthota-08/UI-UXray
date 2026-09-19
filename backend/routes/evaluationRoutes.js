const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')
const {
  createEvaluation,
  generateAiDraft,
  getSubmissionEvaluation,
  updateEvaluation,
} = require('../controllers/evaluationController')

const router = express.Router()

router.use(authMiddleware)
router.post('/submissions/:submissionId/ai-draft', roleMiddleware('facilitator'), generateAiDraft)
router.post('/submissions/:submissionId/evaluation', roleMiddleware('facilitator'), createEvaluation)
router.get('/submissions/:submissionId/evaluation', getSubmissionEvaluation)
router.put('/evaluations/:id', roleMiddleware('facilitator'), updateEvaluation)

module.exports = router
