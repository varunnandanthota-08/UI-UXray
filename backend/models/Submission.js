const mongoose = require('mongoose')

const submissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    figmaUrl: {
      type: String,
      trim: true,
    },
    figjamUrl: {
      type: String,
      trim: true,
    },
    canvaUrl: {
      type: String,
      trim: true,
    },
    prototypeUrl: {
      type: String,
      trim: true,
    },
    researchNotes: {
      type: String,
      trim: true,
    },
    persona: {
      type: String,
      trim: true,
    },
    userFlow: {
      type: String,
      trim: true,
    },
    additionalNotes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'processing', 'ai_review_complete', 'facilitator_review', 'evaluated'],
      default: 'draft',
    },
    submittedAt: {
      type: Date,
    },
  },
  { timestamps: true },
)

submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true })

module.exports = mongoose.model('Submission', submissionSchema)
