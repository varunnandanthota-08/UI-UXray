const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')
const {
  createAssignment,
  deleteAssignment,
  getAssignment,
  listAssignments,
  updateAssignment,
} = require('../controllers/assignmentController')
const {
  createRubric,
  deleteRubric,
  getRubric,
  updateRubric,
} = require('../controllers/rubricController')
const {
  createSubmission,
  getStudentAssignmentSubmission,
  listAssignmentSubmissions,
} = require('../controllers/submissionController')
const facilitator = roleMiddleware('facilitator')
const student = roleMiddleware('student')

const router = express.Router()

router.use(authMiddleware)
router.get('/', listAssignments)
router.post('/', facilitator, createAssignment)
router.get('/:id', getAssignment)
router.put('/:id', facilitator, updateAssignment)
router.delete('/:id', facilitator, deleteAssignment)

router.post('/:assignmentId/rubric', facilitator, createRubric)
router.get('/:assignmentId/rubric', getRubric)
router.put('/:assignmentId/rubric', facilitator, updateRubric)
router.delete('/:assignmentId/rubric', facilitator, deleteRubric)

router.post('/:assignmentId/submissions', student, createSubmission)
router.get('/:assignmentId/submissions', facilitator, listAssignmentSubmissions)
router.get('/:assignmentId/my-submission', student, getStudentAssignmentSubmission)

module.exports = router
