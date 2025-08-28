const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    videos: [{ type: String }], // URLs of external videos
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'teacher' },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'student' }], // enrolled students
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'admin' },
}, { timestamps: true });

module.exports = mongoose.model("course", courseSchema);
