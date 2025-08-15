const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'parent',
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
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Result', resultSchema);
