const Subject = require('../models/subjectSchema.js');
const Teacher = require('../models/teacherSchema.js');
const Student = require('../models/studentSchema.js');

// Create subjects independently (no class required initially)
const subjectCreate = async (req, res) => {
    try {
        const subjects = req.body.subjects.map((subject) => ({
            subName: subject.subName,
            subCode: subject.subCode,
            sessions: subject.sessions,
            description: subject.description,
            videoLink: subject.videoLink,
        })); 

        // Check for duplicate subCode across all subjects in the school
        const existingSubjectBySubCode = await Subject.findOne({
            subCode: { $in: subjects.map(s => s.subCode) },
            school: req.body.adminID,
        }); 
  
        if (existingSubjectBySubCode) {
            res.send({ message: 'Sorry this subcode must be unique as it already exists' });
        } else {
            const newSubjects = subjects.map((subject) => ({
                ...subject,
                sclassName: req.body.sclassName || null, // Optional class assignment
                school: req.body.adminID,
            }));

            const result = await Subject.insertMany(newSubjects);
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get all subjects for a school (not tied to class)
const allSubjects = async (req, res) => {
    try {
        let subjects = await Subject.find({ school: req.params.id })
            .populate("sclassName", "sclassName")
        if (subjects.length > 0) {
            res.send(subjects)
        } else {
            res.send({ message: "No subjects found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get subjects for a specific class
// In your subject-controller.js, replace the classSubjects function with this enhanced version:

const classSubjects = async (req, res) => {
    try {
        console.log("=== ClassSubjects DEBUG ===");
        console.log("Requested class ID:", req.params.id);
        
        // First, let's see ALL subjects for this class (including inactive ones)
        const allClassSubjects = await Subject.find({ sclassName: req.params.id });
        console.log("Total subjects found for this class:", allClassSubjects.length);
        
        allClassSubjects.forEach((subject, index) => {
            console.log(`Subject ${index + 1}:`, {
                id: subject._id,
                name: subject.subName,
                code: subject.subCode,
                sessions: subject.sessions,
                isActive: subject.isActive,
                sclassName: subject.sclassName
            });
        });
        
        // Now get subjects with population
        const subjects = await Subject.find({ sclassName: req.params.id })
            .populate('teacher', 'name')
            .select('subName subCode sessions description videoLink isActive');
        
        console.log("Subjects after population and selection:", subjects.length);
        
        if (subjects.length > 0) {
            console.log("Returning subjects:", subjects);
            res.send(subjects);
        } else {
            console.log("No subjects found, sending message");
            res.send({ message: "No subjects found" });
        }
    } catch (err) {
        console.error("Error in classSubjects:", err);
        res.status(500).json(err);
    }
};

// Also, let's create a debug endpoint to check all subjects in the database
const debugAllSubjects = async (req, res) => {
    try {
        console.log("=== DEBUG ALL SUBJECTS ===");
        const allSubjects = await Subject.find({ school: req.params.id })
            .populate('sclassName', 'sclassName')
            .populate('teacher', 'name');
        
        console.log("Total subjects in school:", allSubjects.length);
        
        const subjectsByClass = {};
        allSubjects.forEach(subject => {
            const className = subject.sclassName?.sclassName || 'Unassigned';
            const classId = subject.sclassName?._id || 'null';
            
            if (!subjectsByClass[className]) {
                subjectsByClass[className] = [];
            }
            
            subjectsByClass[className].push({
                name: subject.subName,
                code: subject.subCode,
                classId: classId,
                isActive: subject.isActive
            });
        });
        
        console.log("Subjects grouped by class:", subjectsByClass);
        
        res.json({
            totalSubjects: allSubjects.length,
            subjectsByClass: subjectsByClass,
            allSubjects: allSubjects
        });
    } catch (err) {
        console.error("Error in debugAllSubjects:", err);
        res.status(500).json(err);
    }
};
// Get unassigned subjects (not tied to any class)
const unassignedSubjects = async (req, res) => {
    try {
        let subjects = await Subject.find({ 
            school: req.params.id,
            sclassName: null
        });
        if (subjects.length > 0) {
            res.send(subjects);
        } else {
            res.send({ message: "No unassigned subjects found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// Assign subjects to a class
const assignSubjectsToClass = async (req, res) => {
    try {
        const { subjectIds, classId } = req.body;
        
        const result = await Subject.updateMany(
            { _id: { $in: subjectIds } },
            { sclassName: classId }
        );
        
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Remove subjects from a class (make them unassigned)
const removeSubjectsFromClass = async (req, res) => {
    try {
        const { subjectIds } = req.body;
        
        const result = await Subject.updateMany(
            { _id: { $in: subjectIds } },
            { sclassName: null }
        );
        
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
};

const freeSubjectList = async (req, res) => {
    try {
        let subjects = await Subject.find({ sclassName: req.params.id, teacher: { $exists: false } });
        if (subjects.length > 0) {
            res.send(subjects);
        } else {
            res.send({ message: "No subjects found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getSubjectDetail = async (req, res) => {
    try {
        let subject = await Subject.findById(req.params.id);
        if (subject) {
            subject = await subject.populate("sclassName", "sclassName")
            subject = await subject.populate("teacher", "name")
            res.send(subject);
        }
        else {
            res.send({ message: "No subject found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

const deleteSubject = async (req, res) => {
    try {
        const deletedSubject = await Subject.findByIdAndDelete(req.params.id);

        // Set the teachSubject field to null in teachers
        await Teacher.updateOne(
            { teachSubject: deletedSubject._id },
            { $unset: { teachSubject: "" }, $unset: { teachSubject: null } }
        );

        // Remove the objects containing the deleted subject from students' examResult array
        await Student.updateMany(
            {},
            { $pull: { examResult: { subName: deletedSubject._id } } }
        );

        // Remove the objects containing the deleted subject from students' attendance array
        await Student.updateMany(
            {},
            { $pull: { attendance: { subName: deletedSubject._id } } }
        );

        res.send(deletedSubject);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteSubjects = async (req, res) => {
    try {
        const deletedSubjects = await Subject.deleteMany({ school: req.params.id });

        // Set the teachSubject field to null in teachers
        await Teacher.updateMany(
            { teachSubject: { $in: deletedSubjects.map(subject => subject._id) } },
            { $unset: { teachSubject: "" }, $unset: { teachSubject: null } }
        );

        // Set examResult and attendance to null in all students
        await Student.updateMany(
            {},
            { $set: { examResult: null, attendance: null } }
        );

        res.send(deletedSubjects);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteSubjectsByClass = async (req, res) => {
    try {
        const deletedSubjects = await Subject.deleteMany({ sclassName: req.params.id });

        // Set the teachSubject field to null in teachers
        await Teacher.updateMany(
            { teachSubject: { $in: deletedSubjects.map(subject => subject._id) } },
            { $unset: { teachSubject: "" }, $unset: { teachSubject: null } }
        );

        // Set examResult and attendance to null in all students
        await Student.updateMany(
            {},
            { $set: { examResult: null, attendance: null } }
        );

        res.send(deletedSubjects);
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = { 
    subjectCreate, 
    freeSubjectList, 
    classSubjects, 
    getSubjectDetail, 
    deleteSubjectsByClass, 
    deleteSubjects, 
    deleteSubject, 
    allSubjects,
    unassignedSubjects,
    assignSubjectsToClass,
    removeSubjectsFromClass
};