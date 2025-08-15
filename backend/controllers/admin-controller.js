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

// ===== Multer Storage Config =====
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../uploads"));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// ===== Admin Controllers =====
const adminRegister = async (req, res) => {
    try {
        const admin = new Admin({
            ...req.body
        });

        const existingAdminByEmail = await Admin.findOne({ email: req.body.email });
        const existingSchool = await Admin.findOne({ schoolName: req.body.schoolName });

        if (existingAdminByEmail) {
            res.send({ message: 'Email already exists' });
        }
        else if (existingSchool) {
            res.send({ message: 'School name already exists' });
        }
        else {
            let result = await admin.save();
            result.password = undefined;
            res.send(result);
        }
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

// ===== New: Upload Student Result File =====
const uploadResultForParent = async (req, res) => {
    try {
        const { parentId } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const parent = await Parent.findById(parentId);
        if (!parent) {
            return res.status(404).json({ message: "Parent not found" });
        }

        parent.resultFile = `/uploads/${req.file.filename}`;
        await parent.save();

        res.json({ message: "Result uploaded successfully", file: parent.resultFile });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    adminRegister, 
    adminLogIn, 
    getAdminDetail,
    upload,  // Multer middleware
    uploadResultForParent
};
