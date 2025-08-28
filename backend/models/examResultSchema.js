const mongoose = require("mongoose");

const examResultSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "student",
        required: true,
    },
    exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exam", // Make sure this matches your Exam model name
        required: true,
    },
    answers: {
        type: Map,
        of: String, // This stores questionId -> userAnswer
        required: true,
    },
    score: {
        type: Number,
        required: true,
        default: 0,
    },
    totalQuestions: {
        type: Number,
        required: true,
    },
    timeSpent: {
        type: Number, // in seconds
        default: 0,
    },
    percentage: {
        type: Number,
        required: true,
        default: 0,
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
    passed: {
        type: Boolean,
        default: function() {
            return this.percentage >= 60;
        }
    }
}, { timestamps: true });

module.exports  = mongoose.model("ExamResult", examResultSchema);
