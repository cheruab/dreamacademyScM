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
                sclassName: req.body.sclassName || null, // For backward compatibility
                assignedClasses: req.body.sclassName ? [req.body.sclassName] : [], // NEW
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
            .populate("assignedClasses", "sclassName") // NEW
            .populate("teacher", "name")
            .populate("teachers.teacherId", "name") // NEW
            .populate("teachers.classId", "sclassName"); // NEW
            
        if (subjects.length > 0) {
            res.send(subjects)
        } else {
            res.send({ message: "No subjects found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get subjects for a specific class - UPDATED to use assignedClasses array
const classSubjects = async (req, res) => {
    try {
        console.log("=== ClassSubjects DEBUG (Updated) ===");
        console.log("Requested class ID:", req.params.id);
        
        // Query both old and new assignment methods for backward compatibility
        const subjects = await Subject.find({
            $or: [
                { sclassName: req.params.id }, // Old method
                { assignedClasses: req.params.id } // NEW method
            ]
        })
        .populate('teacher', 'name')
        .populate({
            path: 'teachers',
            populate: [
                { path: 'teacherId', select: 'name' },
                { path: 'classId', select: 'sclassName' }
            ]
        })
        .select('subName subCode sessions description videoLink isActive teachers');
        
        console.log("Subjects found:", subjects.length);
        
        // For each subject, find the teacher specific to this class
        const processedSubjects = subjects.map(subject => {
            // Check if there's a specific teacher assigned to this class
            const classTeacher = subject.teachers?.find(t => 
                t.classId && t.classId._id.toString() === req.params.id
            );
            
            return {
                ...subject.toObject(),
                teacher: classTeacher ? classTeacher.teacherId : subject.teacher
            };
        });
        
        if (processedSubjects.length > 0) {
            console.log("Returning processed subjects:", processedSubjects.length);
            res.send(processedSubjects);
        } else {
            console.log("No subjects found, sending message");
            res.send({ message: "No subjects found" });
        }
    } catch (err) {
        console.error("Error in classSubjects:", err);
        res.status(500).json(err);
    }
};

// Get unassigned subjects (not tied to any class) - UPDATED
const unassignedSubjects = async (req, res) => {
    try {
        let subjects = await Subject.find({ 
            school: req.params.id,
            $and: [
                { sclassName: null },
                { $or: [
                    { assignedClasses: { $exists: false } },
                    { assignedClasses: { $size: 0 } }
                ]}
            ]
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

// UPDATED: Assign subjects to a class (supports multiple classes per subject)
const assignSubjectsToClass = async (req, res) => {
    try {
        const { subjectIds, classId } = req.body;
        
        console.log("=== ASSIGN SUBJECTS TO CLASS ===");
        console.log("Subject IDs:", subjectIds);
        console.log("Class ID:", classId);
        
        // For each subject, add the class to assignedClasses array if not already present
        const updatePromises = subjectIds.map(async (subjectId) => {
            const subject = await Subject.findById(subjectId);
            
            if (!subject) {
                throw new Error(`Subject with ID ${subjectId} not found`);
            }
            
            // Initialize assignedClasses if it doesn't exist
            if (!subject.assignedClasses) {
                subject.assignedClasses = [];
            }
            
            // Check if class is already assigned
            const isAlreadyAssigned = subject.assignedClasses.some(
                assignedClassId => assignedClassId.toString() === classId
            );
            
            if (!isAlreadyAssigned) {
                // Add to assignedClasses array
                subject.assignedClasses.push(classId);
                
                // For backward compatibility, set sclassName to first assigned class
                if (!subject.sclassName) {
                    subject.sclassName = classId;
                }
                
                await subject.save();
                console.log(`Added class ${classId} to subject ${subject.subName}`);
                return { subjectId, action: 'added' };
            } else {
                console.log(`Class ${classId} already assigned to subject ${subject.subName}`);
                return { subjectId, action: 'already_assigned' };
            }
        });
        
        const results = await Promise.all(updatePromises);
        
        res.json({
            message: 'Subjects assignment completed',
            results: results
        });
        
    } catch (err) {
        console.error("Error in assignSubjectsToClass:", err);
        res.status(500).json({
            error: "Failed to assign subjects",
            details: err.message
        });
    }
};

// NEW: Remove subjects from a specific class (doesn't affect other class assignments)
const removeSubjectsFromClass = async (req, res) => {
    try {
        const { subjectIds, classId } = req.body;
        
        console.log("=== REMOVE SUBJECTS FROM CLASS ===");
        console.log("Subject IDs:", subjectIds);
        console.log("Class ID:", classId);
        
        const updatePromises = subjectIds.map(async (subjectId) => {
            const subject = await Subject.findById(subjectId);
            
            if (!subject) {
                throw new Error(`Subject with ID ${subjectId} not found`);
            }
            
            // Remove from assignedClasses array
            subject.assignedClasses = subject.assignedClasses.filter(
                assignedClassId => assignedClassId.toString() !== classId
            );
            
            // Remove class-specific teacher assignments
            subject.teachers = subject.teachers?.filter(
                teacher => teacher.classId?.toString() !== classId
            ) || [];
            
            // Update sclassName for backward compatibility
            if (subject.sclassName?.toString() === classId) {
                subject.sclassName = subject.assignedClasses.length > 0 ? 
                    subject.assignedClasses[0] : null;
            }
            
            await subject.save();
            console.log(`Removed class ${classId} from subject ${subject.subName}`);
            return { subjectId, action: 'removed' };
        });
        
        const results = await Promise.all(updatePromises);
        
        res.json({
            message: 'Subjects removal completed',
            results: results
        });
        
    } catch (err) {
        console.error("Error in removeSubjectsFromClass:", err);
        res.status(500).json({
            error: "Failed to remove subjects",
            details: err.message
        });
    }
};

// NEW: Assign teacher to a specific subject-class combination
const assignTeacherToSubjectClass = async (req, res) => {
    try {
        const { teacherId, subjectId, classId } = req.body;
        
        console.log("=== ASSIGN TEACHER TO SUBJECT-CLASS ===");
        console.log("Teacher ID:", teacherId);
        console.log("Subject ID:", subjectId);
        console.log("Class ID:", classId);
        
        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ error: "Subject not found" });
        }
        
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ error: "Teacher not found" });
        }
        
        // Initialize teachers array if it doesn't exist
        if (!subject.teachers) {
            subject.teachers = [];
        }
        
        // Remove any existing teacher assignment for this subject-class combination
        subject.teachers = subject.teachers.filter(
            t => !(t.classId?.toString() === classId)
        );
        
        // Add new teacher assignment
        subject.teachers.push({
            teacherId: teacherId,
            classId: classId
        });
        
        // For backward compatibility, if this is the first/main class, update the old teacher field
        if (!subject.teacher || subject.sclassName?.toString() === classId) {
            subject.teacher = teacherId;
        }
        
        await subject.save();
        
        // Update teacher's assignment (you might want to modify this based on your teacher schema)
        // This assumes teachers can teach multiple subjects
        await Teacher.findByIdAndUpdate(teacherId, {
            $addToSet: {
                teachSubjects: subjectId,
                teachClasses: classId
            }
        });
        
        res.json({
            message: 'Teacher assigned successfully',
            assignment: {
                teacher: teacher.name,
                subject: subject.subName,
                classId: classId
            }
        });
        
    } catch (err) {
        console.error("Error in assignTeacherToSubjectClass:", err);
        res.status(500).json({
            error: "Failed to assign teacher",
            details: err.message
        });
    }
};

// Keep existing functions with minimal changes
const freeSubjectList = async (req, res) => {
    try {
        // Updated to check both old and new assignment methods
        let subjects = await Subject.find({
            $or: [
                { sclassName: req.params.id },
                { assignedClasses: req.params.id }
            ],
            $or: [
                { teacher: { $exists: false } },
                { 
                    teachers: {
                        $not: {
                            $elemMatch: { classId: req.params.id }
                        }
                    }
                }
            ]
        });
        
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
            subject = await subject.populate("sclassName", "sclassName");
            subject = await subject.populate("assignedClasses", "sclassName");
            subject = await subject.populate("teacher", "name");
            subject = await subject.populate({
                path: "teachers",
                populate: [
                    { path: "teacherId", select: "name" },
                    { path: "classId", select: "sclassName" }
                ]
            });
            res.send(subject);
        } else {
            res.send({ message: "No subject found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const deleteSubject = async (req, res) => {
    try {
        const deletedSubject = await Subject.findByIdAndDelete(req.params.id);

        // Update teachers - remove this subject from their assignments
        await Teacher.updateMany(
            { $or: [
                { teachSubject: deletedSubject._id },
                { teachSubjects: deletedSubject._id }
            ]},
            { 
                $unset: { teachSubject: "" },
                $pull: { teachSubjects: deletedSubject._id }
            }
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

        // Update teachers
        await Teacher.updateMany(
            { school: req.params.id },
            { 
                $unset: { teachSubject: "", teachSubjects: "" },
                $set: { teachClasses: [] }
            }
        );

        // Set examResult and attendance to null in all students
        await Student.updateMany(
            { school: req.params.id },
            { $set: { examResult: null, attendance: null } }
        );

        res.send(deletedSubjects);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteSubjectsByClass = async (req, res) => {
    try {
        const classId = req.params.id;
        
        // Instead of deleting subjects entirely, just remove the class from their assignments
        const result = await Subject.updateMany(
            { $or: [
                { sclassName: classId },
                { assignedClasses: classId }
            ]},
            { 
                $pull: { assignedClasses: classId },
                $pull: { teachers: { classId: classId } }
            }
        );
        
        // Clean up subjects that are no longer assigned to any class
        await Subject.updateMany(
            { 
                sclassName: classId,
                $or: [
                    { assignedClasses: { $size: 0 } },
                    { assignedClasses: { $exists: false } }
                ]
            },
            { $unset: { sclassName: "" } }
        );

        res.send({ 
            message: "Class assignments removed from subjects",
            modifiedCount: result.modifiedCount 
        });
    } catch (error) {
        res.status(500).json(error);
    }
};

// Debug endpoint to help troubleshoot
const debugAllSubjects = async (req, res) => {
    try {
        console.log("=== DEBUG ALL SUBJECTS ===");
        const allSubjects = await Subject.find({ school: req.params.id })
            .populate('sclassName', 'sclassName')
            .populate('assignedClasses', 'sclassName')
            .populate('teacher', 'name')
            .populate({
                path: 'teachers',
                populate: [
                    { path: 'teacherId', select: 'name' },
                    { path: 'classId', select: 'sclassName' }
                ]
            });
        
        console.log("Total subjects in school:", allSubjects.length);
        
        const subjectsByClass = {};
        allSubjects.forEach(subject => {
            // Handle both old and new assignment methods
            const assignedClasses = subject.assignedClasses?.length > 0 ? 
                subject.assignedClasses : 
                (subject.sclassName ? [subject.sclassName] : []);
                
            assignedClasses.forEach(classObj => {
                const className = classObj.sclassName || 'Unknown';
                const classId = classObj._id;
                
                if (!subjectsByClass[className]) {
                    subjectsByClass[className] = [];
                }
                
                subjectsByClass[className].push({
                    name: subject.subName,
                    code: subject.subCode,
                    classId: classId,
                    isActive: subject.isActive,
                    teachers: subject.teachers
                });
            });
            
            // Handle unassigned subjects
            if (assignedClasses.length === 0) {
                if (!subjectsByClass['Unassigned']) {
                    subjectsByClass['Unassigned'] = [];
                }
                subjectsByClass['Unassigned'].push({
                    name: subject.subName,
                    code: subject.subCode,
                    classId: null,
                    isActive: subject.isActive
                });
            }
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
    removeSubjectsFromClass,
    assignTeacherToSubjectClass, // NEW
    debugAllSubjects
};