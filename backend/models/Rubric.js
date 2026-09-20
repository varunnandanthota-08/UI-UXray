const mongoose = require('mongoose')

const criterionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    maxMarks: {
      type: Number,
      required: true,
      min: [0.01, 'maxMarks must be greater than 0'],
    },
    weightage: {
      type: Number,
      required: true,
      min: [0, 'weightage cannot be negative'],
      max: [100, 'weightage cannot exceed 100'],
    },
    checks: {
      type: [String],
      default: [],
    },
  },
  { _id: true },
)

const rubricSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
    },
    criteria: {
      type: [criterionSchema],
      default: [],
    },
    totalMarks: {
      type: Number,
      min: [0, 'totalMarks cannot be negative'],
    },
    totalWeightage: {
      type: Number,
      min: [0, 'totalWeightage cannot be negative'],
      max: [100, 'totalWeightage cannot exceed 100'],
      validate: {
        validator: (value) => value === undefined || value === 100,
        message: 'totalWeightage must equal 100',
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
)

rubricSchema.index({ assignmentId: 1 })

module.exports = mongoose.model('Rubric', rubricSchema)
