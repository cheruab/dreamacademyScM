// models/lessonPlanSchema.js
const mongoose = require('mongoose');

const lessonPlanSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject',
        required: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    },
    duration: {
        type: Number,
        required: true,
        min: 15
    },
    lessonDate: {
        type: Date,
        required: true
    },
    week: {
        type: Number,
        required: true,
        min: 1,
        max: 52
    },
    term: {
        type: String,
        enum: ['First Term', 'Second Term', 'Third Term'],
        required: true
    },
    objectives: [{
        type: String,
        required: true,
        trim: true
    }],
    introduction: {
        description: { type: String, required: true },
        duration: { type: Number, required: true },
        activities: [String]
    },
    mainContent: {
        description: { type: String, required: true },
        duration: { type: Number, required: true },
        keyPoints: [{ type: String, required: true }],
        activities: [String],
        teachingMethods: [String]
    },
    conclusion: {
        description: { type: String, required: true },
        duration: { type: Number, required: true }
    },
    assessment: {
        type: { type: String, enum: ['Formative', 'Summative', 'Both'], required: true },
        description: String
    },
    homework: {
        assigned: { type: Boolean, default: false },
        description: String
    },
    notes: String,
    status: {
        type: String,
        enum: ['Draft', 'Published'],
        default: 'Draft'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('lessonPlan', lessonPlanSchema);