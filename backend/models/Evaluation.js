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
    description: {
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
    weightage: {
      type: Number,
      min: 0,
    },
    checks: {
      type: [String],
      default: [],
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

const evaluationVersionSchema = new mongoose.Schema(
  {
    versionNumber: {
      type: Number,
      required: true,
    },
    finalMarks: {
      type: Number,
    },
    criteriaResults: {
      type: [criterionResultSchema],
      default: [],
    },
    facilitatorComments: {
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
    resolutionNotes: {
      type: String,
      trim: true,
    },
  },
  { _id: false, timestamps: true },
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
    inspectionMetadata: {
      provider: {
        type: String,
        trim: true,
      },
      status: {
        type: String,
        enum: ['success', 'failed', 'not_applicable'],
      },
      fileKey: {
        type: String,
        trim: true,
      },
      documentName: {
        type: String,
        trim: true,
      },
      lastModified: {
        type: String,
        trim: true,
      },
      version: {
        type: String,
        trim: true,
      },
      error: {
        type: String,
        trim: true,
      },
      inspectedAt: {
        type: Date,
      },
    },
    evidenceSummary: {
      totalNodesScanned: {
        type: Number,
      },
      nodesRetained: {
        type: Number,
      },
      totalFramesCount: {
        type: Number,
      },
      totalTextNodesCount: {
        type: Number,
      },
      totalComponentsCount: {
        type: Number,
      },
      uniqueColorCount: {
        type: Number,
      },
      colors: {
        type: [String],
        default: [],
      },
      typography: {
        type: [mongoose.Schema.Types.Mixed],
        default: [],
      },
      maxDepthReached: {
        type: Number,
      },
      truncated: {
        type: Boolean,
        default: false,
      },
    },
    versions: {
      type: [evaluationVersionSchema],
      default: [],
    },
  },
  { timestamps: true },
)

evaluationSchema.index({ submissionId: 1 })

module.exports = mongoose.model('Evaluation', evaluationSchema)
