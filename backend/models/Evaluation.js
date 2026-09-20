const mongoose = require('mongoose')

const criterionResultSchema = new mongoose.Schema(
  {
    criterionId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    criterionName: {
      type: String,
      trim: true,
    },
    maxMarks: {
      type: Number,
      min: 0,
    },
    awardedMarks: {
      type: Number,
      min: 0,
    },
    automatedStatus: {
      type: String,
      enum: ['PASS', 'PARTIAL', 'MISSING', 'INSUFFICIENT_EVIDENCE'],
    },
    automatedNotes: {
      type: String,
      trim: true,
    },
    facilitatorComment: {
      type: String,
      trim: true,
    },
  },
  { _id: true },
)

const criterionObservationSchema = new mongoose.Schema(
  {
    criterionName: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['PASS', 'PARTIAL', 'MISSING', 'INSUFFICIENT_EVIDENCE'],
    },
    observations: {
      type: [String],
      default: [],
    },
    missing: {
      type: [String],
      default: [],
    },
    suggestions: {
      type: [String],
      default: [],
    },
  },
  { _id: false },
)

const aiFeedbackSchema = new mongoose.Schema(
  {
    strengths: {
      type: [String],
      default: [],
    },
    missingRequirements: {
      type: [String],
      default: [],
    },
    improvements: {
      type: [String],
      default: [],
    },
    criterionObservations: {
      type: [criterionObservationSchema],
      default: [],
    },
  },
  { _id: false },
)

const evaluationSchema = new mongoose.Schema(
  {
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      required: true,
    },
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    criteriaResults: {
      type: [criterionResultSchema],
      default: [],
    },
    aiFeedback: {
      type: aiFeedbackSchema,
    },
    aiSuggestedMarks: {
      type: Number,
      min: 0,
    },
    facilitatorMarks: {
      type: Number,
      min: 0,
    },
    finalMarks: {
      type: Number,
      min: 0,
    },
    facilitatorComments: {
      type: String,
      trim: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['draft', 'ai_review_complete', 'facilitator_review', 'approved'],
      default: 'draft',
    },
    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true },
)

evaluationSchema.index({ submissionId: 1 })

module.exports = mongoose.model('Evaluation', evaluationSchema)
