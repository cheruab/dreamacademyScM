const mongoose = require("mongoose");

const complainSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'userType',
        required: true
    },
    userType: {
        type: String,
        required: true,
        enum: ['student', 'teacher', 'parent']
    },
    date: {
        type: Date,
        required: true
    },
    complaint: {
        type: String,
        required: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    category: {
        type: String,
        enum: ['Academic', 'Behavioral', 'Infrastructure', 'Staff', 'Other'],
        default: 'Other'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Submitted', 'Rejected'],
        default: 'Submitted'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin'
    },
    response: {
        type: String
    },
    responseDate: {
        type: Date
    },
    attachments: [{
        fileName: String,
        fileUrl: String,
        fileType: String
    }],
    isAnonymous: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("complain", complainSchema);