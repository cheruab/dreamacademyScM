const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    targetAudience: {
        type: String,
        enum: ['All', 'Students', 'Teachers', 'Parents', 'Staff'],
        default: 'All'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    attachments: [{
        fileName: String,
        fileUrl: String,
        fileType: String
    }],
    readBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'readBy.userType'
        },
        userType: {
            type: String,
            enum: ['student', 'teacher', 'parent']
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model("notice", noticeSchema);