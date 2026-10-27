const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')
const {
  approveReevaluationRequest,
  createReevaluationRequest,
  finalizeReevaluationRequest,
  getReevaluationRequest,
  listReevaluationRequests,
  rejectReevaluationRequest,
} = require('../controllers/reevaluationController')

const router = express.Router()

router.use(authMiddleware)

router.post('/', roleMiddleware('student'), createReevaluationRequest)
router.get('/', roleMiddleware('facilitator'), listReevaluationRequests)
router.get('/:id', getReevaluationRequest)
router.post('/:id/approve', roleMiddleware('facilitator'), approveReevaluationRequest)
router.post('/:id/reject', roleMiddleware('facilitator'), rejectReevaluationRequest)
router.post('/:id/finalize', roleMiddleware('facilitator'), finalizeReevaluationRequest)

module.exports = router
