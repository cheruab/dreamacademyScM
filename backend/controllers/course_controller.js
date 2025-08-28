const Course = require('../models/courseSchema.js');

// Admin adds a course
const createCourse = async (req, res) => {
    try {
        const { title, description, videos, teacher, students } = req.body;
        const course = new Course({ title, description, videos, teacher, students, school: req.body.adminID });
        await course.save();
        res.send(course);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get all courses for a student
const getStudentCourses = async (req, res) => {
    try {
        const courses = await Course.find({ students: req.params.id });
        res.send(courses.length ? courses : { message: "No courses enrolled" });
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get course detail
const getCourseDetail = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        res.send(course || { message: "Course not found" });
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = { createCourse, getStudentCourses, getCourseDetail };
