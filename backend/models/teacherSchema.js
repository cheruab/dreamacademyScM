const mongoose = require("mongoose")

const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: "Teacher",
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: false,
    },
    
    // Keep single assignment fields for backward compatibility
    teachSubject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject',
    },
    teachSclass: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: false,
    },
    
    // New fields for multiple assignments
    assignments: [{
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'subject',
            required: true
        },
        class: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'sclass',
            required: true
        },
        assignedDate: {
            type: Date,
            default: Date.now
        }
    }],
    
    attendance: [{
        date: {
            type: Date,
            required: true
        },
        presentCount: {
            type: String,
        },
        absentCount: {
            type: String,
        }
    }]
}, { timestamps: true });

// Add method to get all unique classes a teacher is assigned to
teacherSchema.methods.getAssignedClasses = function() {
    const classIds = [...new Set(this.assignments.map(assignment => assignment.class.toString()))];
    return classIds;
};

// Add method to get all subjects for a specific class
teacherSchema.methods.getSubjectsForClass = function(classId) {
    return this.assignments
        .filter(assignment => assignment.class.toString() === classId.toString())
        .map(assignment => assignment.subject);
};

module.exports = mongoose.model("teacher", teacherSchema)