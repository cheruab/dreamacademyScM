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
// Upload past exam for a student
const uploadPastExamForStudent = async (req, res) => {
    try {
        const { studentId, subject, year, examType, description, grade } = req.body;

        console.log('Uploading past exam with grade:', grade); // DEBUG
        console.log('Full request body:', req.body); // DEBUG

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
            uploadedBy: req.user?.name || 'admin',
            mimeType: req.file.mimetype,
            grade: grade || 'Unknown Grade'
        });

        console.log('Saving past exam with grade:', newPastExam.grade); // DEBUG

        const savedPastExam = await newPastExam.save();
        console.log('Saved past exam:', savedPastExam); // DEBUG

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
            uploadedAt: savedPastExam.uploadDate,
            grade: grade || 'Unknown Grade'
        });
        
        await student.save();
        console.log('Student updated with grade:', grade); // DEBUG

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
// Get all past exams for a student, organized by GRADE -> Subject -> Year
// Get all past exams for a student, organized by GRADE -> Subject -> Year
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

        console.log('Found', pastExams.length, 'past exams for student', studentId); // DEBUG

        // Organize by GRADE -> Subject -> Year (NOT by Subject -> Year)
        const organizedByGrade = {};
        pastExams.forEach(exam => {
            // Use the grade from the exam, or default to 'Unknown Grade'
            const grade = exam.grade || 'Unknown Grade';
            
            // Initialize grade level if it doesn't exist
            if (!organizedByGrade[grade]) {
                organizedByGrade[grade] = {};
            }
            
            // Initialize subject if it doesn't exist
            if (!organizedByGrade[grade][exam.subject]) {
                organizedByGrade[grade][exam.subject] = {};
            }
            
            // Initialize year if it doesn't exist
            if (!organizedByGrade[grade][exam.subject][exam.year]) {
                organizedByGrade[grade][exam.subject][exam.year] = [];
            }
            
            // Add file to the appropriate grade -> subject -> year
            organizedByGrade[grade][exam.subject][exam.year].push({
                _id: exam._id,
                fileUrl: exam.filePath,
                originalName: exam.originalName,
                examType: exam.examType,
                description: exam.description,
                uploadedAt: exam.uploadDate,
                uploadedBy: exam.uploadedBy,
                mimeType: exam.mimeType,
                grade: exam.grade
            });
        });

        console.log('Organized by grade:', Object.keys(organizedByGrade)); // DEBUG
        res.json(organizedByGrade);

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
            mimeType: exam.mimeType,
            // FIXED: Return the actual grade from database
            grade: exam.grade
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

// Get available grades for a student
const getStudentGrades = async (req, res) => {
    try {
        const studentId = req.params.studentId;

        const grades = await PastExam.distinct('grade', { 
            student: studentId 
        }).then(grades => grades.filter(grade => grade && grade.trim() !== ''));
        
        res.json(grades.sort());

    } catch (error) {
        console.error('getStudentGrades error:', error);
        res.status(500).json({ message: "Server error fetching grades" });
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

// DEBUG: Check what grades are actually in the database
const debugCheckGrades = async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const pastExams = await PastExam.find({ student: studentId });
        
        console.log('All past exams for student:', studentId);
        pastExams.forEach(exam => {
            console.log(`Exam: ${exam.subject}, Grade: "${exam.grade}"`);
        });
        
        const distinctGrades = await PastExam.distinct('grade', { student: studentId });
        console.log('Distinct grades in database:', distinctGrades);
        
        res.json({ pastExams, distinctGrades });
    } catch (error) {
        console.error('Debug error:', error);
        res.status(500).json({ message: "Debug error" });
    }
};

module.exports = {
    uploadPastExam,
    uploadPastExamForStudent,
    getStudentPastExams,
    getPastExamsBySubjectYear,
    getStudentSubjects,
    getSubjectYears,
    getStudentGrades,
    deletePastExam,
    debugCheckGrades
};