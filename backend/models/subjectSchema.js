const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
    subName: {
        type: String,
        required: true
    },
    subCode: {
        type: String,
        required: true,
    },
    sessions: {
        type: Number,
        required: true,
    },
    description: {
        type: String
    },
    videoLink: {
        type: String,
        required: false,
    },
    // Make class optional - subjects can exist without classes initially
    sclassName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: false, // ✅ Changed from true to false
    },
    // Add multiple classes support
    assignedClasses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass'
    }],
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true // ✅ School is still required
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher',
    },
    // Add subject level settings
    isActive: {
        type: Boolean,
        default: true
    },
    // Add exam settings at subject level
    allowExams: {
        type: Boolean,
        default: true
    },
    passingScore: {
        type: Number,
        default: 60
    }
}, { timestamps: true });

module.exports = mongoose.model("subject", subjectSchema);