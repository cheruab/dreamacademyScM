const Sclass = require('../models/sclassSchema.js');
const Student = require('../models/studentSchema.js');
const Teacher = require('../models/teacherSchema.js');
const Subject = require('../models/subjectSchema.js');

// ✅ Assign Student to Class
const assignStudentToClass = async (req, res) => {
    try {
        const { studentId, classId } = req.body;

        const student = await Student.findById(studentId);
        const sclass = await Sclass.findById(classId);

        if (!student || !sclass) {
            return res.status(404).json({ message: "Student or Class not found" });
        }

        // Add class to student
        if (!student.sclassName.includes(classId)) {
            student.sclassName.push(classId);
            await student.save();
        }

        // Add student to class
        if (!sclass.students.includes(studentId)) {
            sclass.students.push(studentId);
            await sclass.save();
        }

        res.status(200).json({ message: "Student assigned successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ✅ Assign Teacher to Class
const assignTeacherToClass = async (req, res) => {
    try {
        const { teacherId, classId } = req.body;

        const teacher = await Teacher.findById(teacherId);
        const sclass = await Sclass.findById(classId);

        if (!teacher || !sclass) {
            return res.status(404).json({ message: "Teacher or Class not found" });
        }

        // Add class to teacher (if you want to track in teacher)
        if (!teacher.teachSclass.includes(classId)) {
            teacher.teachSclass.push(classId);
            await teacher.save();
        }

        // Add teacher to class
        if (!sclass.teachers.includes(teacherId)) {
            sclass.teachers.push(teacherId);
            await sclass.save();
        }

        res.status(200).json({ message: "Teacher assigned successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ✅ Assign Subject to Class
const assignSubjectToClass = async (req, res) => {
    try {
        const { subjectId, classId } = req.body;

        const subject = await Subject.findById(subjectId);
        const sclass = await Sclass.findById(classId);

        if (!subject || !sclass) {
            return res.status(404).json({ message: "Subject or Class not found" });
        }

        // Add class to subject
        if (!subject.assignedClasses.includes(classId)) {
            subject.assignedClasses.push(classId);
            await subject.save();
        }

        // Add subject to class
        if (!sclass.subjects.includes(subjectId)) {
            sclass.subjects.push(subjectId);
            await sclass.save();
        }

        res.status(200).json({ message: "Subject assigned successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// ✅ Assign Teacher to a Subject in a Class
const assignTeacherToSubject = async (req, res) => {
    try {
        const { teacherId, classId, subjectId } = req.body;

        const teacher = await Teacher.findById(teacherId);
        const sclass = await Sclass.findById(classId);
        const subject = await Subject.findById(subjectId);

        if (!teacher || !sclass || !subject) {
            return res.status(404).json({ message: "Teacher, Class, or Subject not found" });
        }

        // ✅ Check if subject belongs to this class
        if (!sclass.subjects.includes(subjectId)) {
            return res.status(400).json({ message: "This subject is not assigned to the selected class" });
        }

        // Add subject to teacher (optional: track what subjects they teach)
        if (!teacher.teachSubjects) teacher.teachSubjects = [];
        if (!teacher.teachSubjects.includes(subjectId)) {
            teacher.teachSubjects.push(subjectId);
            await teacher.save();
        }

        // Add teacher to subject (new field in subjectSchema)
        if (!subject.teachers) subject.teachers = [];
        if (!subject.teachers.includes(teacherId)) {
            subject.teachers.push(teacherId);
            await subject.save();
        }

        res.status(200).json({ message: "Teacher assigned to subject successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    assignStudentToClass,
    assignTeacherToClass, // (optional keep if you want whole class assignment)
    assignSubjectToClass,
    assignTeacherToSubject
};


