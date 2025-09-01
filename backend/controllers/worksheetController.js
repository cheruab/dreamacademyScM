const path = require('path');
const multer = require('multer');
const Worksheet = require('../models/worksheetSchema');
const Student = require('../models/studentSchema');

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

const uploadWorksheet = multer({ 
    storage: worksheetStorage,
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
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Upload worksheet or assignment for a student
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
            uploadedBy: req.body.adminId || 'admin' // You might want to get this from auth
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

// Get worksheets by type for a student
const getWorksheetsByType = async (req, res) => {
    try {
        const { studentId, type } = req.params;

        const worksheets = await Worksheet.find({ 
            student: studentId, 
            uploadType: type 
        }).sort({ uploadDate: -1 });

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
        console.error('getWorksheetsByType error:', error);
        res.status(500).json({ message: "Server error fetching worksheets" });
    }
};

// Delete a worksheet/assignment
const deleteWorksheet = async (req, res) => {
    try {
        const worksheetId = req.params.id;

        const worksheet = await Worksheet.findById(worksheetId);
        if (!worksheet) {
            return res.status(404).json({ message: "Worksheet not found" });
        }

        // Remove from student's worksheets array
        await Student.findByIdAndUpdate(
            worksheet.student,
            { $pull: { worksheets: { worksheetId: worksheetId } } }
        );

        // Delete the worksheet record
        await Worksheet.findByIdAndDelete(worksheetId);

        res.json({ message: "Worksheet deleted successfully" });

    } catch (error) {
        console.error('deleteWorksheet error:', error);
        res.status(500).json({ message: "Server error deleting worksheet" });
    }
};

module.exports = {
    uploadWorksheet,
    uploadWorksheetForStudent,
    getStudentWorksheets,
    getWorksheetsByType,
    deleteWorksheet
};