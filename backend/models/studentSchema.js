const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
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
    // Make sclassName optional - students can exist without classes initially
    sclassName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: false, // ✅ Changed from true to false
        default: null    // ✅ Added default null value
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'parent'
    },
   
    role: {
        type: String,
        default: "Student",
        enum: ['Student', 'Parent']
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
    }],
    // Add additional fields to track student status
    isAssignedToClass: {
        type: Boolean,
        default: false
    },
    assignedDate: {
        type: Date,
        default: null
    }
}, { 
    timestamps: true // ✅ Add timestamps to track creation and updates
});

// ✅ Add middleware to update isAssignedToClass when sclassName changes
studentSchema.pre('save', function(next) {
    if (this.sclassName) {
        this.isAssignedToClass = true;
        if (!this.assignedDate) {
            this.assignedDate = new Date();
        }
    } else {
        this.isAssignedToClass = false;
        this.assignedDate = null;
    }
    next();
});
// New field for worksheets and assignments
    worksheets: [{
        worksheetId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Worksheet'
        },
        filename: String,
        fileUrl: String,
        uploadType: {
            type: String,
            enum: ['worksheet', 'assignment']
        },
        description: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],

// ✅ Add index for efficient querying of unassigned students
studentSchema.index({ school: 1, sclassName: 1 });
studentSchema.index({ school: 1, rollNum: 1 }, { unique: true }); // Ensure roll number is unique per school

module.exports = mongoose.model("student", studentSchema);