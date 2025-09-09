const bcrypt = require('bcrypt');
const path = require('path');
const multer = require('multer'); // Multer for file uploads

const Admin = require('../models/adminSchema.js');
const Sclass = require('../models/sclassSchema.js');
const Student = require('../models/studentSchema.js');
const Parent = require('../models/studentSchemas.js');
const Teacher = require('../models/teacherSchema.js');
const Subject = require('../models/subjectSchema.js');
const Notice = require('../models/noticeSchema.js');
const Complain = require('../models/complainSchema.js');
const Worksheet = require('../models/worksheetSchema.js');
const PastExam = require('../models/pastExamSchema.js');

// ===== Multer Storage Config for Results =====
const resultStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../uploads/results"));
    },
    filename: function (req, file, cb) {
        cb(null, 'result-' + Date.now() + path.extname(file.originalname));
    },
});

// ===== Multer Storage Config for Worksheets =====
const worksheetStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../uploads/worksheets"));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

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

const uploadResult = multer({ storage: resultStorage });
const uploadWorksheet = multer({ storage: worksheetStorage });
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

// ===== Admin Controllers =====
const adminRegister = async (req, res) => {
    try {
        // Step 1: check if any admin already exists
        const existingAdmin = await Admin.findOne({});
        if (existingAdmin) {
            return res.status(400).send({ message: 'You can not register as an admin' });
        }

        // Step 2: create the very first admin
        const admin = new Admin({ ...req.body });
        let result = await admin.save();
        result.password = undefined;

        res.send(result);

    } catch (err) {
        res.status(500).json(err);
    }
};

const adminLogIn = async (req, res) => {
    if (req.body.email && req.body.password) {
        let admin = await Admin.findOne({ email: req.body.email });
        if (admin) {
            if (req.body.password === admin.password) {
                admin.password = undefined;
                res.send(admin);
            } else {
                res.send({ message: "Invalid password" });
            }
        } else {
            res.send({ message: "User not found" });
        }
    } else {
        res.send({ message: "Email and password are required" });
    }
};

const getAdminDetail = async (req, res) => {
    try {
        let admin = await Admin.findById(req.params.id);
        if (admin) {
            admin.password = undefined;
            res.send(admin);
        }
        else {
            res.send({ message: "No admin found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// ===== Upload Result File for Parent =====
const uploadResultForParent = async (req, res) => {
    try {
        const { parentId, description, subject, semester, examType } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const parent = await Parent.findById(parentId);
        if (!parent) {
            return res.status(404).json({ message: "Parent not found" });
        }

        // Add to parent's uploaded results
        if (!parent.uploadedResults) {
            parent.uploadedResults = [];
        }

        parent.uploadedResults.push({
            filename: req.file.filename,
            fileUrl: `/uploads/results/${req.file.filename}`,
            originalName: req.file.originalname,
            description: description || '',
            subject: subject || '',
            semester: semester || '',
            examType: examType || '',
            uploadedAt: new Date()
        });

        await parent.save();

        res.json({ 
            message: "Exam result uploaded successfully", 
            file: `/uploads/results/${req.file.filename}` 
        });
    } catch (error) {
        console.error('uploadResultForParent error:', error);
        res.status(500).json({ message: error.message });
    }
};
// Add this to your admin-controller.js file

// ===== Get Parent Results (Organized by Subject → Semester) =====
const getParentResults = async (req, res) => {
    try {
        const parentId = req.params.parentId;

        // Verify parent exists
        const parent = await Parent.findById(parentId);
        if (!parent) {
            return res.status(404).json({ message: "Parent not found" });
        }

        // Get results from parent's uploadedResults array
        const results = parent.uploadedResults || [];

        // Organize by Subject → Semester → Files structure
        const organizedData = {};

        results.forEach(result => {
            const subject = result.subject || 'General';
            const semester = result.semester || 'No Semester';

            // Initialize subject level
            if (!organizedData[subject]) {
                organizedData[subject] = {};
            }

            // Initialize semester level
            if (!organizedData[subject][semester]) {
                organizedData[subject][semester] = [];
            }

            // Add file to appropriate subject → semester
            organizedData[subject][semester].push({
                _id: result._id,
                fileUrl: result.fileUrl,
                originalName: result.originalName,
                examType: result.examType,
                description: result.description,
                uploadedAt: result.uploadedAt,
                subject: result.subject,
                semester: result.semester
            });
        });

        res.json(organizedData);

    } catch (error) {
        console.error('getParentResults error:', error);
        res.status(500).json({ message: "Server error fetching parent results" });
    }
};

// ===== Upload Worksheet/Assignment for Student =====
const uploadWorksheetForStudent = async (req, res) => {
    try {
        const { studentId, uploadType, description, subject } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Verify student exists
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Create new worksheet/assignment record
        const newWorksheet = new Worksheet({
            student: studentId,
            filePath: `/uploads/worksheets/${req.file.filename}`,
            originalName: req.file.originalname,
            uploadType: uploadType, // 'worksheet' or 'assignment'
            description: description || '',
            subject: subject || '',
            uploadedBy: 'admin'
        });

        const savedWorksheet = await newWorksheet.save();

        // Add to student's worksheets array
        if (!student.worksheets) {
            student.worksheets = [];
        }
        student.worksheets.push({
            worksheetId: savedWorksheet._id,
            filename: req.file.filename,
            fileUrl: savedWorksheet.filePath,
            uploadType: uploadType,
            description: description || '',
            subject: subject || '',
            uploadedAt: savedWorksheet.uploadDate
        });
        await student.save();

        res.status(201).json({
            message: `${uploadType === 'worksheet' ? 'Worksheet' : 'Assignment'} uploaded successfully`,
            worksheet: savedWorksheet
        });

    } catch (error) {
        console.error('uploadWorksheetForStudent error:', error);
        res.status(500).json({ message: "Server error uploading file" });
    }
};

// ===== Upload Past Exam for Student =====
const uploadPastExamForStudent = async (req, res) => {
    try {
        const { studentId, subject, year, examType, description, grade } = req.body;

        console.log('Uploading past exam with grade:', grade); // DEBUG

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        if (!grade) {
            return res.status(400).json({ message: "Grade is required" });
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
            mimeType: req.file.mimetype,
            grade: grade // REQUIRED field
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
            grade: grade // REQUIRED field
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

// ===== NEW: Get Past Exams Organized by Grade → Subject → Year =====
const getStudentPastExams = async (req, res) => {
    try {
        const studentId = req.params.studentId;

        // Verify student exists
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Fetch past exams from PastExam collection
        const pastExams = await PastExam.find({ student: studentId }).sort({ uploadDate: -1 });

        // Organize by Grade → Subject → Year → Files structure
        const organizedData = {};

        pastExams.forEach(exam => {
            const grade = exam.grade || 'Unknown Grade';
            const subject = exam.subject;
            const year = exam.year;

            // Initialize grade level
            if (!organizedData[grade]) {
                organizedData[grade] = {};
            }

            // Initialize subject level
            if (!organizedData[grade][subject]) {
                organizedData[grade][subject] = {};
            }

            // Initialize year level
            if (!organizedData[grade][subject][year]) {
                organizedData[grade][subject][year] = [];
            }

            // Add file to appropriate grade → subject → year
            organizedData[grade][subject][year].push({
                _id: exam._id,
                fileUrl: exam.filePath,
                originalName: exam.originalName,
                examType: exam.examType,
                description: exam.description,
                uploadedAt: exam.uploadDate,
                uploadedBy: exam.uploadedBy,
                mimeType: exam.mimeType,
                grade: exam.grade,
                subject: exam.subject,
                year: exam.year
            });
        });

        res.json(organizedData);

    } catch (error) {
        console.error('getStudentPastExams error:', error);
        res.status(500).json({ message: "Server error fetching past exams" });
    }
};

// Get all worksheets/assignments for a student
const getStudentWorksheets = async (req, res) => {
    try {
        const studentId = req.params.studentId;

        // Verify student exists
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Fetch worksheets from Worksheet collection
        const worksheets = await Worksheet.find({ student: studentId }).sort({ uploadDate: -1 });

        // Format for frontend
        const formattedWorksheets = worksheets.map(w => ({
            _id: w._id,
            fileUrl: w.filePath,
            originalName: w.originalName,
            uploadType: w.uploadType,
            description: w.description,
            subject: w.subject || '',
            uploadedAt: w.uploadDate,
            uploadedBy: w.uploadedBy
        }));

        res.json(formattedWorksheets);

    } catch (error) {
        console.error('getStudentWorksheets error:', error);
        res.status(500).json({ message: "Server error fetching worksheets" });
    }
};

module.exports = { 
    adminRegister, 
    adminLogIn, 
    getAdminDetail,
    uploadPastExamForStudent,
    uploadResult,  // Multer middleware for results
    uploadWorksheet, // Multer middleware for worksheets
    uploadResultForParent,
    uploadPastExam,
    uploadWorksheetForStudent,
    getParentResults,
    getStudentWorksheets,
    getStudentPastExams // NEW: API endpoint for organized past exams
};