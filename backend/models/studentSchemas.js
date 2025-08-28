const mongoose = require('mongoose');

const studentSchemas = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    rollNum: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    sclassName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: false,
    },
    child: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'student',
    unique: true // Ensures one parent per student
  },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },

    uploadedResults: [
  {
    filename: String,
    fileUrl: String,   // stored file URL/path
    uploadedAt: { type: Date, default: Date.now },
    description: String  // optional, e.g. "Math exam result"
  }
],
// In parentModel.js
resultFile: {
  type: String,
  default: null
},

    
    role: {
        type: String,
        default: "Parent"
    },
    examResult: [
        {
            subName: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'subject',
            },
            marksObtained: {
                type: Number,
                default: 0
            }
        }
    ],
    email: {
  type: String,
  unique: true,
  sparse: true // Allows multiple null values
},
    attendance: [{
        date: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ['Present', 'Absent'],
            required: true
        },
        subName: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'subject',
            required: true
        }
    }]
});

module.exports = mongoose.models.parent || mongoose.model("parent", studentSchemas);
