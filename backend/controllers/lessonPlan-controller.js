// controllers/lessonPlanController.js
const mongoose = require('mongoose');

const LessonPlan = require('../models/lessonPlanSchema');
const Subject = require('../models/subjectSchema');

const createLessonPlan = async (req, res) => {
    try {
        const { subject: subjectId, createdBy } = req.body;

        if (!subjectId || !createdBy) {
            return res.status(400).json({
                success: false,
                message: 'Missing subject or createdBy'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(subjectId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid subject ID'
            });
        }

        // Find subject
        const subjectDoc = await Subject.findById(subjectId);

        if (!subjectDoc) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        // Create lesson plan (only subject and school required)
        const newPlan = new LessonPlan({
            ...req.body,
            subject: subjectDoc._id,
            school: createdBy,
            createdBy
        });

        const saved = await newPlan.save();

        const populatedPlan = await LessonPlan.findById(saved._id)
            .populate('subject', 'subName subCode');

        res.status(201).json({
            success: true,
            message: 'Lesson plan created successfully',
            lessonPlan: populatedPlan
        });

    } catch (error) {
        console.error('Error creating lesson plan:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get lesson plans by subject
const getLessonPlansBySubject = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const plans = await LessonPlan.find({ subject: subjectId, status: 'Published' })
            .populate('subject', 'subName subCode')
            .sort({ lessonDate: 1 });
        res.json({ success: true, lessonPlans: plans });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get all lesson plans by school
const getAllLessonPlans = async (req, res) => {
    try {
        const { schoolId } = req.params;
        const plans = await LessonPlan.find({ school: schoolId })
            .populate('subject', 'subName subCode')
            .sort({ createdAt: -1 });
        res.json({ success: true, lessonPlans: plans });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get by ID
const getLessonPlanById = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await LessonPlan.findById(id)
            .populate('subject', 'subName subCode');
        if (!plan) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, lessonPlan: plan });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update
const updateLessonPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await LessonPlan.findByIdAndUpdate(id, req.body, { new: true })
            .populate('subject', 'subName subCode');
        res.json({ success: true, lessonPlan: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Update failed' });
    }
};

// Delete
const deleteLessonPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await LessonPlan.findByIdAndDelete(id);
        if (!plan) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Delete failed' });
    }
};

module.exports = {
    createLessonPlan,
    getLessonPlansBySubject,
    getAllLessonPlans,
    getLessonPlanById,
    updateLessonPlan,
    deleteLessonPlan
};