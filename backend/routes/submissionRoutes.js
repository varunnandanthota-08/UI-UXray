const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')
const {
  getSubmission,
  listStudentSubmissions,
  updateSubmission,
} = require('../controllers/submissionController')

const router = express.Router()

router.use(authMiddleware)
router.get('/student/mine', roleMiddleware('student'), listStudentSubmissions)
router.get('/:id', getSubmission)
router.put('/:id', roleMiddleware('student'), updateSubmission)

module.exports = router
