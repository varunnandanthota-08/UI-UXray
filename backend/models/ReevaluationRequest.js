const mongoose = require('mongoose')

const reevaluationRequestSchema = new mongoose.Schema(
  {
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      required: true,
    },
    evaluationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Evaluation',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    additionalEvidence: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected'],
      default: 'pending',
    },
    facilitatorResponse: {
      type: String,
      trim: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true },
)

reevaluationRequestSchema.index({ submissionId: 1 })
reevaluationRequestSchema.index({ evaluationId: 1 })
reevaluationRequestSchema.index({ studentId: 1 })
reevaluationRequestSchema.index({ assignmentId: 1, status: 1 })

module.exports = mongoose.model('ReevaluationRequest', reevaluationRequestSchema)
