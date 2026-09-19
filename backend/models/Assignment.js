const mongoose = require('mongoose')

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    instructions: {
      type: String,
      trim: true,
    },
    requirements: {
      type: [String],
      default: [],
    },
    assignmentType: {
      type: String,
      trim: true,
    },
    totalMarks: {
      type: Number,
      required: true,
      min: [0.01, 'totalMarks must be greater than 0'],
    },
    deadline: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'closed'],
      default: 'draft',
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Assignment', assignmentSchema)
