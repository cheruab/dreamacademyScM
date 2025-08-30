// Add these enhanced functions to your class-controller.js file

const Sclass = require('../models/sclassSchema.js');
const Student = require('../models/studentSchema.js');
const Subject = require('../models/subjectSchema.js');

// Enhanced class creation with automatic student assignment
const sclassCreate = async (req, res) => {
    try {
        const { sclassName, adminID, studentId } = req.body;

        // Check if class name already exists for this school
        const existingSclass = await Sclass.findOne({
            sclassName,
            school: adminID
        });

        if (existingSclass) {
            return res.json({ message: 'Class name already exists!' });
        }

        // If studentId is provided, check if student already has a class
        if (studentId) {
            const existingStudent = await Student.findById(studentId);
            if (!existingStudent) {
                return res.json({ message: 'Student not found!' });
            }
            if (existingStudent.sclassName) {
                return res.json({ message: 'Student already has a class assigned!' });
            }
        }

        // Create the class
        const sclass = new Sclass({
            sclassName,
            school: adminID,
        });

        // Simply save the class without the school validation
const result = await sclass.save();

// If studentId is provided, assign student to this class
if (studentId) {
    await Student.findByIdAndUpdate(studentId, {
        sclassName: result._id
    });
}

res.send(result);
    } catch (err) {
        console.error('Error in sclassCreate:', err);
        res.status(500).json({ message: err.message });
    }
};

// Get class details with student and subject information
const getSclassDetailEnhanced = async (req, res) => {
    try {
        const classId = req.params.id;
        
        // Get class details
        const sclass = await Sclass.findById(classId).populate('school', 'schoolName');
        
        if (!sclass) {
            return res.status(404).json({ message: 'Class not found' });
        }

        // Get assigned student
        const student = await Student.findOne({ sclassName: classId })
            .select('name rollNum _id');

        // Get assigned subjects
        const subjects = await Subject.find({ sclassName: classId })
            .populate('teacher', 'name email')
            .select('subName subCode sessions description videoLink');

        // Count total students (should be 1 in this system)
        const studentCount = await Student.countDocuments({ sclassName: classId });
        const subjectCount = subjects.length;

        const response = {
            ...sclass.toObject(),
            assignedStudent: student,
            subjects: subjects,
            studentCount: studentCount,
            subjectCount: subjectCount,
            stats: {
                hasStudent: !!student,
                totalSubjects: subjectCount,
                activeSubjects: subjects.filter(s => s.isActive !== false).length
            }
        };

        res.json(response);
    } catch (err) {
        console.error('Error in getSclassDetailEnhanced:', err);
        res.status(500).json({ message: err.message });
    }
};

// Get all classes with enhanced details (student and subject counts)
const sclassListEnhanced = async (req, res) => {
    try {
        const schoolId = req.params.id;
        
        // Get all classes for this school
        const sclasses = await Sclass.find({ school: schoolId }).sort({ createdAt: -1 });

        // Enhance each class with student and subject information
        const enhancedClasses = await Promise.all(
            sclasses.map(async (sclass) => {
                try {
                    // Get assigned student
                    const student = await Student.findOne({ sclassName: sclass._id })
                        .select('name rollNum _id');

                    // Get subjects count
                    const subjectCount = await Subject.countDocuments({ sclassName: sclass._id });

                    // Get subjects details (first 5 for preview)
                    const subjects = await Subject.find({ sclassName: sclass._id })
                        .select('subName subCode')
                        .limit(5);

                    return {
                        ...sclass.toObject(),
                        assignedStudent: student,
                        studentCount: student ? 1 : 0,
                        subjectCount: subjectCount,
                        subjectsPreview: subjects,
                        hasStudent: !!student,
                        hasSubjects: subjectCount > 0
                    };
                } catch (error) {
                    console.error(`Error enhancing class ${sclass._id}:`, error);
                    return {
                        ...sclass.toObject(),
                        assignedStudent: null,
                        studentCount: 0,
                        subjectCount: 0,
                        subjectsPreview: [],
                        hasStudent: false,
                        hasSubjects: false
                    };
                }
            })
        );

        if (enhancedClasses.length === 0) {
            res.json({ message: "No Classes found" });
        } else {
            res.json(enhancedClasses);
        }
    } catch (err) {
        console.error('Error in sclassListEnhanced:', err);
        res.status(500).json({ message: err.message });
    }
};

// Reassign student to a different class (transfer student)
const reassignStudent = async (req, res) => {
    try {
        const { studentId, newClassId } = req.body;

        // Check if new class exists
        const newClass = await Sclass.findById(newClassId);
        if (!newClass) {
            return res.status(404).json({ message: 'New class not found' });
        }

        // Check if new class already has a student
        const existingStudent = await Student.findOne({ sclassName: newClassId });
        if (existingStudent && existingStudent._id.toString() !== studentId) {
            return res.json({ message: 'Target class already has a student assigned' });
        }

        // Update student's class assignment
        const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            { sclassName: newClassId },
            { new: true }
        ).populate('sclassName', 'sclassName');

        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json({
            message: 'Student reassigned successfully',
            student: updatedStudent
        });
    } catch (err) {
        console.error('Error in reassignStudent:', err);
        res.status(500).json({ message: err.message });
    }
};

// Remove student from class (make class empty)
const removeStudentFromClass = async (req, res) => {
    try {
        const { studentId } = req.body;

        const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            { sclassName: null },
            { new: true }
        );

        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json({
            message: 'Student removed from class successfully',
            student: updatedStudent
        });
    } catch (err) {
        console.error('Error in removeStudentFromClass:', err);
        res.status(500).json({ message: err.message });
    }
};

// Get class statistics for dashboard
const getClassStats = async (req, res) => {
    try {
        const schoolId = req.params.id;

        const totalClasses = await Sclass.countDocuments({ school: schoolId });
        const classesWithStudents = await Student.distinct('sclassName', { 
            school: schoolId, 
            sclassName: { $ne: null } 
        });
        const totalSubjectsAssigned = await Subject.countDocuments({ 
            school: schoolId, 
            sclassName: { $ne: null } 
        });

        const stats = {
            totalClasses: totalClasses,
            classesWithStudents: classesWithStudents.length,
            emptyClasses: totalClasses - classesWithStudents.length,
            totalSubjectsAssigned: totalSubjectsAssigned,
            averageSubjectsPerClass: classesWithStudents.length > 0 ? 
                (totalSubjectsAssigned / classesWithStudents.length).toFixed(1) : 0
        };

        res.json(stats);
    } catch (err) {
        console.error('Error in getClassStats:', err);
        res.status(500).json({ message: err.message });
    }
};
const getSclassStudents = async (req, res) => {
  try {
    const { id } = req.params;

    // assuming you link students to class with `classId`
    const students = await Student.find({ classId: id });

    if (!students || students.length === 0) {
      return res.status(404).json({ message: "No students found for this class" });
    }

    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching class students:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
    sclassCreate,
    getSclassDetailEnhanced,
    sclassListEnhanced,
    reassignStudent,
    removeStudentFromClass,
    getClassStats,
    getSclassStudents,
    // Export your existing functions as well
    sclassList: sclassListEnhanced, // Use enhanced version as default
    getSclassDetail: getSclassDetailEnhanced, // Use enhanced version as default
    // ... other existing exports
};
