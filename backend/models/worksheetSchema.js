const mongoose = require('mongoose');

const worksheetSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'student',
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  uploadType: {
    type: String,
    enum: ['worksheet', 'assignment'],
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
  subject: {
    type: String,
    default: ''
  },
  dueDate: {
    type: Date,
    default: null
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Worksheet', worksheetSchema);