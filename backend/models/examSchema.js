// models/examSchema.js - COMPLETELY FIXED
const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "subject",
        required: true,
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "sclass",
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "school",
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "teacher",
    },
    timeLimit: {
        type: Number,
        default: 3600,
    },
    totalMarks: {
        type: Number,
        required: true,
    },
    passingMarks: {
        type: Number,
        required: true,
        default: 60
    },
    scheduleType: {
        type: String,
        enum: ['fixed', 'flexible'],
        default: 'flexible'
    },
    // Make all date fields optional with proper defaults
    startTime: {
        type: Date,
        default: null // Set default to null instead of undefined
    },
    endTime: {
        type: Date,
        default: null
    },
    availableFrom: {
        type: Date,
        default: null
    },
    availableUntil: {
        type: Date,
        default: null
    },
    questions: [
        {
            question: { type: String, required: true },
            options: [{ type: String, required: true }],
            correctAnswer: { type: String, required: true },
            marks: { type: Number, default: 1 },
            difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
            category: { type: String, default: 'General' },
            explanation: { type: String }
        }
    ],
    isActive: {
        type: Boolean,
        default: true
    },
    allowedAttempts: { type: Number, default: 1 },
    randomizeQuestions: { type: Boolean, default: false },
    showResultsImmediately: { type: Boolean, default: true }
}, { timestamps: true });

// Remove ALL validation hooks
module.exports = mongoose.model("Exam", examSchema);