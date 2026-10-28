const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')
const requireDatabase = require('../middleware/dbCheckMiddleware')
const {
  createEvaluation,
  generateAiDraft,
  getEvaluation,
  getSubmissionEvaluation,
  updateEvaluation,
} = require('../controllers/evaluationController')

const router = express.Router()

router.use('/submissions/:submissionId', authMiddleware, requireDatabase)
router.use('/evaluations', authMiddleware, requireDatabase)

router.post('/submissions/:submissionId/ai-draft', roleMiddleware('facilitator'), generateAiDraft)
router.post('/submissions/:submissionId/evaluation', roleMiddleware('facilitator'), createEvaluation)
router.get('/submissions/:submissionId/evaluation', getSubmissionEvaluation)
router.get('/evaluations/:id', getEvaluation)
router.put('/evaluations/:id', roleMiddleware('facilitator'), updateEvaluation)

module.exports = router
