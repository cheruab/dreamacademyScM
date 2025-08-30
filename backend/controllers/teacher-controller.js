const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Teacher = require('../models/teacherSchema.js');
const Subject = require('../models/subjectSchema.js');
const Student = require('../models/studentSchema.js');
const sclass = require ('../models/sclassSchema.js');
// Modified teacher registration - now only requires name, email, password, and school
// teacher-controller.js
const teacherRegister = async (req, res) => {
    const { name, email, password, role, school } = req.body;   // ✅ only what you need
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        const teacherData = {  
            name,
            email,
            password: hashedPass,  
            role: role || "Teacher",  
            school  
        };  
             
        const existingTeacherByEmail = await Teacher.findOne({ email });
        
        if (existingTeacherByEmail) {
            return res.send({ message: 'Email already exists' });
        }

        const teacher = new Teacher(teacherData);
        let result = await teacher.save();

        result.password = undefined;
        res.send(result);

    } catch (err) {
        res.status(500).json(err);
    }
};

// New function to assign teacher to subject and class
const assignTeacherToClass = async (req, res) => {
    try {
        const { teacherId, teachSubject, teachSclass } = req.body;

        const updatedTeacher = await Teacher.findByIdAndUpdate(
            teacherId,
            { 
                teachSubject: teachSubject || undefined,
                teachSclass: teachSclass || undefined 
            },
            { new: true }
        ).populate("teachSubject", "subName sessions")
         .populate("school", "schoolName")
         .populate("teachSclass", "sclassName");

        if (!updatedTeacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        // Update subject to reference this teacher
        if (teachSubject) {
            await Subject.findByIdAndUpdate(teachSubject, { teacher: teacherId });
        }

        updatedTeacher.password = undefined;
        res.status(200).json(updatedTeacher);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// New function to get unassigned teachers (without class/subject)
const getUnassignedTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find({ 
            school: req.params.id,
            $or: [
                { teachSclass: { $exists: false } },
                { teachSclass: null },
                { teachSubject: { $exists: false } },
                { teachSubject: null }
            ]
        }).populate("teachSubject", "subName")
          .populate("teachSclass", "sclassName")
          .populate("school", "schoolName");

        if (teachers.length > 0) {
            let modifiedTeachers = teachers.map((teacher) => {
                return { ...teacher._doc, password: undefined };
            });
            res.send(modifiedTeachers);
        } else {
            res.send({ message: "No unassigned teachers found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const teacherLogIn = async (req, res) => {
    try {
        let teacher = await Teacher.findOne({ email: req.body.email });
        if (!teacher) {
            return res.send({ message: "Teacher not found" });
        }

        const validated = await bcrypt.compare(req.body.password, teacher.password);
        if (!validated) {
            return res.send({ message: "Invalid password" });
        }

        // Proper populate calls
        await teacher.populate("teachSubject", "subName sessions");
        await teacher.populate("school", "schoolName");
        await teacher.populate("teachSclass", "sclassName");

        // Convert to plain object and remove password
        const teacherObj = teacher.toObject();
        delete teacherObj.password;

        // ✅ Make sure role exists at the top level
        res.send({
            ...teacherObj,
            role: "Teacher"
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getTeacherDetail = async (req, res) => {
    try {
        let teacher = await Teacher.findById(req.params.id)
            .populate("teachSubject", "subName sessions")
            .populate("school", "schoolName")
            .populate("teachSclass", "sclassName") // Fixed: was "sclassName" instead of "teachSclass"
        if (teacher) {
            teacher.password = undefined;
            res.send(teacher);
        }
        else {
            res.send({ message: "No teacher found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getStudentDetailForTeacher = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).lean();
        if (!student) return res.send({ message: "No student found" });

        let className = 'Class name not found';
        if (student.sclassName) {
            const classId = student.sclassName._id || student.sclassName;
            const classData = await mongoose.model('sclass')
                .findById(classId)
                .select('sclassName')
                .lean();
            className = classData?.sclassName || `Class ID: ${classId}`;
        }

        const school = await mongoose.model('admin')
            .findById(student.school)
            .select('schoolName')
            .lean();

        const examResult = student.examResult ? await Promise.all(
            student.examResult.map(async result => {
                const subject = await mongoose.model('subject')
                    .findById(result.subName)
                    .select('subName')
                    .lean();
                return {
                    ...result,
                    subName: subject?.subName || `Subject ID: ${result.subName}`
                };
            })
        ) : [];

        const attendance = student.attendance ? await Promise.all(
            student.attendance.map(async att => {
                const subject = await mongoose.model('subject')
                    .findById(att.subName)
                    .select('subName')
                    .lean();
                return {
                    ...att,
                    subName: subject?.subName || `Subject ID: ${att.subName}`
                };
            })
        ) : [];

        res.send({
            ...student,
            sclassName: className,
            school: school || { schoolName: 'School not found' },
            examResult,
            attendance,
            password: undefined
        });
    } catch (err) {
        console.error("Error in getStudentDetailForTeacher:", err);
        res.status(500).json({ 
            error: "Failed to fetch student details",
            details: err.message 
        });
    }
};

const deleteTeacher = async (req, res) => {
    try {
        const deletedTeacher = await Teacher.findByIdAndDelete(req.params.id);

        // Only update subject if teacher was assigned to one
        if (deletedTeacher.teachSubject) {
            await Subject.updateOne(
                { teacher: deletedTeacher._id },
                { $unset: { teacher: 1 } }
            );
        }

        res.send(deletedTeacher);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteTeachers = async (req, res) => {
    try {
        const deletionResult = await Teacher.deleteMany({ school: req.params.id });

        const deletedCount = deletionResult.deletedCount || 0;

        if (deletedCount === 0) {
            res.send({ message: "No teachers found to delete" });
            return;
        }

        const deletedTeachers = await Teacher.find({ school: req.params.id });

        await Subject.updateMany(
            { teacher: { $in: deletedTeachers.map(teacher => teacher._id) } },
            { $unset: { teacher: 1 } }
        );

        res.send(deletionResult);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteTeachersByClass = async (req, res) => {
    try {
        const deletionResult = await Teacher.deleteMany({ teachSclass: req.params.id });

        const deletedCount = deletionResult.deletedCount || 0;

        if (deletedCount === 0) {
            res.send({ message: "No teachers found to delete" });
            return;
        }

        const deletedTeachers = await Teacher.find({ teachSclass: req.params.id });

        await Subject.updateMany(
            { teacher: { $in: deletedTeachers.map(teacher => teacher._id) } },
            { $unset: { teacher: 1 } }
        );

        res.send(deletionResult);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Updated to handle subject assignment properly
const updateTeacherSubject = async (req, res) => {
    try {
        const { teacherId, teachSubject, teachSclass } = req.body;
        
        const updateData = {};
        if (teachSubject !== undefined) updateData.teachSubject = teachSubject;
        if (teachSclass !== undefined) updateData.teachSclass = teachSclass;

        const updatedTeacher = await Teacher.findByIdAndUpdate(
            teacherId,
            updateData,
            { new: true }
        );
        
        if (!updatedTeacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        // Update subject to reference this teacher if subject is assigned
        if (teachSubject) {
            await Subject.findByIdAndUpdate(teachSubject, { teacher: teacherId });
        }

        res.status(200).json(updatedTeacher);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const teacherAttendance = async (req, res) => {
    const { status, date } = req.body;

    try {
        const teacher = await Teacher.findById(req.params.id);

        if (!teacher) {
            return res.send({ message: 'Teacher not found' });
        }

        const existingAttendance = teacher.attendance.find(
            (a) => a.date.toDateString() === new Date(date).toDateString()
        );

        if (existingAttendance) {
            existingAttendance.status = status;
        } else {
            teacher.attendance.push({ date, status });
        }

        const result = await teacher.save();
        return res.send(result);
    } catch (error) {
        res.status(500).json(error)
    }
};

// Add this function to your teacher-controller.js file

// Replace the assignTeacher function in your teacher-controller.js with this:

const assignTeacher = async (req, res) => {
    try {
        console.log('AssignTeacher request body:', req.body);
        
        const { teacherId, subjectId, classId } = req.body;

        if (!teacherId || !subjectId || !classId) {
            return res.status(400).json({ 
                message: "Teacher ID, Subject ID, and Class ID are required",
                received: { teacherId, subjectId, classId }
            });
        }

        const teacher = await Teacher.findById(teacherId);
        const subject = await Subject.findById(subjectId);
        const sclass = await require('../models/sclassSchema').findById(classId);

        if (!teacher || !subject || !sclass) {
            return res.status(404).json({ message: "Teacher, Subject, or Class not found" });
        }

        // Check if subject belongs to this class
        const subjectInClass = sclass.subjects && sclass.subjects.some(
            subId => subId.toString() === subjectId.toString()
        );

        if (!subjectInClass) {
            return res.status(400).json({ 
                message: "This subject is not assigned to the selected class"
            });
        }

        // Check if teacher is already assigned to this specific subject-class combination
        const existingAssignment = teacher.assignments && teacher.assignments.find(
            assignment => 
                assignment.subject.toString() === subjectId.toString() && 
                assignment.class.toString() === classId.toString()
        );

        if (existingAssignment) {
            return res.status(400).json({
                message: "Teacher is already assigned to this subject in this class"
            });
        }

        // Initialize assignments array if it doesn't exist
        if (!teacher.assignments) {
            teacher.assignments = [];
        }

        // Add new assignment to assignments array
        teacher.assignments.push({
            subject: subjectId,
            class: classId,
            assignedDate: new Date()
        });

        // Update single assignment fields for backward compatibility (use the latest assignment)
        teacher.teachSubject = subjectId;
        teacher.teachSclass = classId;

        // Save teacher with new assignment
        await teacher.save();

        // Update subject to reference this teacher
        await Subject.findByIdAndUpdate(subjectId, { teacher: teacherId });

        // Get updated teacher with populated fields
        const updatedTeacher = await Teacher.findById(teacherId)
            .populate({
                path: 'assignments.subject',
                select: 'subName subCode sessions'
            })
            .populate({
                path: 'assignments.class',
                select: 'sclassName'
            })
            .populate("teachSubject", "subName sessions")
            .populate("school", "schoolName")
            .populate("teachSclass", "sclassName");

        // Remove password from response
        const teacherResponse = updatedTeacher.toObject();
        delete teacherResponse.password;

        console.log('Assignment successful');

        res.status(200).json({ 
            message: "Teacher assigned successfully",
            teacher: teacherResponse 
        });

    } catch (error) {
        console.error('Error in assignTeacher:', error);
        res.status(500).json({ 
            message: "Internal server error",
            error: error.message
        });
    }
};

// Update the getTeachers function to populate assignments
const getTeachers = async (req, res) => {
    try {
        let teachers = await Teacher.find({ school: req.params.id })
            .populate("teachSubject", "subName")
            .populate("teachSclass", "sclassName")
            .populate({
                path: 'assignments.subject',
                select: 'subName subCode'
            })
            .populate({
                path: 'assignments.class',
                select: 'sclassName'
            });
            
        if (teachers.length > 0) {
            let modifiedTeachers = teachers.map((teacher) => {
                return { ...teacher._doc, password: undefined };
            });
            res.send(modifiedTeachers);
        } else {
            res.send({ message: "No teachers found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};
// Add this migration script to migrate existing teacher data
// Run this once after updating your schema


// Don't forget to add this to your module.exports:
module.exports = {
    teacherRegister,
    teacherLogIn,
    getTeachers,
    getTeacherDetail,
    getStudentDetailForTeacher,
    assignTeacherToClass,
    getUnassignedTeachers,
    updateTeacherSubject,
    assignTeacher, // Add this new function
    deleteTeacher,
    deleteTeachers,
    deleteTeachersByClass,
    teacherAttendance,
    
};
