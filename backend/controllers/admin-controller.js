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

const uploadResult = multer({ storage: resultStorage });
const uploadWorksheet = multer({ storage: worksheetStorage });

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
        const { parentId, description } = req.body;

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

// ===== Upload Worksheet/Assignment for Student =====
const uploadWorksheetForStudent = async (req, res) => {
    try {
        const { studentId, uploadType, description } = req.body;

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
    uploadResult,  // Multer middleware for results
    uploadWorksheet, // Multer middleware for worksheets
    uploadResultForParent,
    uploadWorksheetForStudent,
    getStudentWorksheets
};