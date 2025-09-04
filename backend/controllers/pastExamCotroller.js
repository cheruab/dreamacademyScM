const path = require('path');
const multer = require('multer');
const PastExam = require('../models/pastExamSchema');
const Student = require('../models/studentSchema');

// ===== Multer Storage Config for Past Exams =====
const pastExamStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../uploads/pastexams"));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const uploadPastExam = multer({ 
    storage: pastExamStorage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only PDF, DOC, DOCX, JPG, and PNG files are allowed'));
        }
    },
    limits: {
        fileSize: 20 * 1024 * 1024 // 20MB limit
    }
});

// Upload past exam for a student
const uploadPastExamForStudent = async (req, res) => {
    try {
        const { studentId, subject, year, examType, description } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Verify student exists
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Create new past exam record
        const newPastExam = new PastExam({
            student: studentId,
            subject: subject,
            year: year,
            examType: examType,
            filePath: `/uploads/pastexams/${req.file.filename}`,
            originalName: req.file.originalname,
            description: description || '',
            uploadedBy: req.body.adminId || 'admin',
            mimeType: req.file.mimetype
        });

        const savedPastExam = await newPastExam.save();

        // Add to student's pastExams array if it doesn't exist
        if (!student.pastExams) {
            student.pastExams = [];
        }
        
        student.pastExams.push({
            pastExamId: savedPastExam._id,
            subject: subject,
            year: year,
            examType: examType,
            filename: req.file.filename,
            fileUrl: savedPastExam.filePath,
            description: description || '',
            uploadedAt: savedPastExam.uploadDate
        });
        
        await student.save();

        res.status(201).json({
            message: `Past exam uploaded successfully`,
            pastExam: savedPastExam
        });

    } catch (error) {
        console.error('uploadPastExamForStudent error:', error);
        res.status(500).json({ message: "Server error uploading past exam file" });
    }
};

// Get all past exams for a student, organized by subject and year
const getStudentPastExams = async (req, res) => {
    try {
        const studentId = req.params.studentId;

        // Verify student exists
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Fetch past exams from PastExam collection
        const pastExams = await PastExam.find({ student: studentId }).sort({ 
            subject: 1, 
            year: -1, 
            examType: 1,
            uploadDate: -1 
        });

        // Organize by subject and year
        const organizedExams = {};
        pastExams.forEach(exam => {
            if (!organizedExams[exam.subject]) {
                organizedExams[exam.subject] = {};
            }
            if (!organizedExams[exam.subject][exam.year]) {
                organizedExams[exam.subject][exam.year] = [];
            }
            organizedExams[exam.subject][exam.year].push({
                _id: exam._id,
                fileUrl: exam.filePath,
                originalName: exam.originalName,
                examType: exam.examType,
                description: exam.description,
                uploadedAt: exam.uploadDate,
                uploadedBy: exam.uploadedBy,
                mimeType: exam.mimeType
            });
        });

        res.json(organizedExams);

    } catch (error) {
        console.error('getStudentPastExams error:', error);
        res.status(500).json({ message: "Server error fetching past exams" });
    }
};

// Get past exams by subject and year
const getPastExamsBySubjectYear = async (req, res) => {
    try {
        const { studentId, subject, year } = req.params;

        const pastExams = await PastExam.find({ 
            student: studentId, 
            subject: subject,
            year: year 
        }).sort({ examType: 1, uploadDate: -1 });

        const formattedExams = pastExams.map(exam => ({
            _id: exam._id,
            fileUrl: exam.filePath,
            originalName: exam.originalName,
            examType: exam.examType,
            description: exam.description,
            uploadedAt: exam.uploadDate,
            uploadedBy: exam.uploadedBy,
            mimeType: exam.mimeType
        }));

        res.json(formattedExams);

    } catch (error) {
        console.error('getPastExamsBySubjectYear error:', error);
        res.status(500).json({ message: "Server error fetching past exams" });
    }
};

// Get available subjects for a student
const getStudentSubjects = async (req, res) => {
    try {
        const studentId = req.params.studentId;

        const subjects = await PastExam.distinct('subject', { student: studentId });
        
        res.json(subjects.sort());

    } catch (error) {
        console.error('getStudentSubjects error:', error);
        res.status(500).json({ message: "Server error fetching subjects" });
    }
};

// Get available years for a subject
const getSubjectYears = async (req, res) => {
    try {
        const { studentId, subject } = req.params;

        const years = await PastExam.distinct('year', { 
            student: studentId, 
            subject: subject 
        });
        
        res.json(years.sort().reverse()); // Most recent year first

    } catch (error) {
        console.error('getSubjectYears error:', error);
        res.status(500).json({ message: "Server error fetching years" });
    }
};

// Delete a past exam
const deletePastExam = async (req, res) => {
    try {
        const pastExamId = req.params.id;

        const pastExam = await PastExam.findById(pastExamId);
        if (!pastExam) {
            return res.status(404).json({ message: "Past exam not found" });
        }

        // Remove from student's pastExams array
        await Student.findByIdAndUpdate(
            pastExam.student,
            { $pull: { pastExams: { pastExamId: pastExamId } } }
        );

        // Delete the past exam record
        await PastExam.findByIdAndDelete(pastExamId);

        res.json({ message: "Past exam deleted successfully" });

    } catch (error) {
        console.error('deletePastExam error:', error);
        res.status(500).json({ message: "Server error deleting past exam" });
    }
};

module.exports = {
    uploadPastExam,
    uploadPastExamForStudent,
    getStudentPastExams,
    getPastExamsBySubjectYear,
    getStudentSubjects,
    getSubjectYears,
    deletePastExam
};