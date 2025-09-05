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
    // Keep for backward compatibility - represents primary/main class
    sclassName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: false,
    },
    // NEW: Support multiple classes - this is the main field we'll use
    assignedClasses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass'
    }],
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    },
    // NEW: Support multiple teachers for different classes
    teachers: [{
        teacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'teacher'
        },
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'sclass'
        }
    }],
    // Keep for backward compatibility
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher',
    },
    isActive: {
        type: Boolean,
        default: true
    },
    allowExams: {
        type: Boolean,
        default: true
    },
    passingScore: {
        type: Number,
        default: 60
    }
}, { timestamps: true });

// Add indexes for better query performance
subjectSchema.index({ school: 1, assignedClasses: 1 });
subjectSchema.index({ school: 1, subCode: 1 }, { unique: true });

module.exports = mongoose.model("subject", subjectSchema);