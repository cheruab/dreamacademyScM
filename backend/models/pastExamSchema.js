const mongoose = require('mongoose');

const pastExamSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'student',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true
  },
  examType: {
    type: String,
    required: true, // e.g., "Mid-term", "Final", "Quiz", etc.
  },
  filePath: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  uploadedBy: {
    type: String,
    default: 'admin'
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  mimeType: {
    type: String,
    default: ''
  },
  // UPDATED: Grade field is now required for proper folder organization
  grade: {
    type: String,
    required: true, // Changed from default: '' to required: true
    validate: {
      validator: function(v) {
        return v && v.trim().length > 0; // Ensure it's not empty
      },
      message: 'Grade is required and cannot be empty'
    }
  }
});

// Index for efficient querying
pastExamSchema.index({ student: 1, subject: 1, year: 1 });
// Index for grade-based queries (primary index now)
pastExamSchema.index({ student: 1, grade: 1, subject: 1, year: 1 });

module.exports = mongoose.model('PastExam', pastExamSchema);