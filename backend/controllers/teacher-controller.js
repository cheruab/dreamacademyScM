const bcrypt = require('bcrypt');
const Teacher = require('../models/teacherSchema.js');
const Subject = require('../models/subjectSchema.js');
const Student = require('../models/studentSchema.js'); // Added to fetch student details if needed


const teacherRegister = async (req, res) => {
    const { name, email, password, role, school, teachSubject, teachSclass } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        const teacher = new Teacher({ name, email, password: hashedPass, role, school, teachSubject, teachSclass });

        const existingTeacherByEmail = await Teacher.findOne({ email });

        if (existingTeacherByEmail) {
            res.send({ message: 'Email already exists' });
        }
        else {
            let result = await teacher.save();
            await Subject.findByIdAndUpdate(teachSubject, { teacher: teacher._id });
            result.password = undefined;
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const teacherLogIn = async (req, res) => {
    try {
        let teacher = await Teacher.findOne({ email: req.body.email });
        if (teacher) {
            const validated = await bcrypt.compare(req.body.password, teacher.password);
            if (validated) {
                teacher = await teacher
                    .populate("teachSubject", "subName sessions")
                    .populate("school", "schoolName")
                    .populate("teachSclass", "sclassName");
                    
                teacher.password = undefined;
                res.send(teacher);
            } else {
                res.send({ message: "Invalid password" });
            }
        } else {
            res.send({ message: "Teacher not found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getTeachers = async (req, res) => {
    try {
        let teachers = await Teacher.find({ school: req.params.id })
            .populate("teachSubject", "subName")
            .populate("teachSclass", "sclassName");
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

const getTeacherDetail = async (req, res) => {
    try {
        let teacher = await Teacher.findById(req.params.id)
            .populate("teachSubject", "subName sessions")
            .populate("school", "schoolName")
            .populate("sclassName", "sclassName")
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

// ✅ NEW: Get a student detail with populated class & school
const getStudentDetailForTeacher = async (req, res) => {
    try {
        // First get the student with basic info
        const student = await Student.findById(req.params.id).lean();
        if (!student) return res.send({ message: "No student found" });

        // Then get the class name separately
        let className = 'Class name not found';
        if (student.sclassName) {
            const classId = student.sclassName._id || student.sclassName;
            const classData = await mongoose.model('sclass')
                .findById(classId)
                .select('sclassName')
                .lean();
            className = classData?.sclassName || `Class ID: ${classId}`;
        }

        // Get school info
        const school = await mongoose.model('admin')
            .findById(student.school)
            .select('schoolName')
            .lean();

        // Get exam results with subject names
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

        // Get attendance with subject names
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

        await Subject.updateOne(
            { teacher: deletedTeacher._id, teacher: { $exists: true } },
            { $unset: { teacher: 1 } }
        );

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
            { teacher: { $in: deletedTeachers.map(teacher => teacher._id) }, teacher: { $exists: true } },
            { $unset: { teacher: "" }, $unset: { teacher: null } }
        );

        res.send(deletionResult);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteTeachersByClass = async (req, res) => {
    try {
        const deletionResult = await Teacher.deleteMany({ sclassName: req.params.id });

        const deletedCount = deletionResult.deletedCount || 0;

        if (deletedCount === 0) {
            res.send({ message: "No teachers found to delete" });
            return;
        }

        const deletedTeachers = await Teacher.find({ sclassName: req.params.id });

        await Subject.updateMany(
            { teacher: { $in: deletedTeachers.map(teacher => teacher._id) }, teacher: { $exists: true } },
            { $unset: { teacher: "" }, $unset: { teacher: null } }
        );

        res.send(deletionResult);
    } catch (error) {
        res.status(500).json(error);
    }
};


const updateTeacherSubject = async (req, res) => {
    try {
        const { teacherId, subject } = req.body;
        const updatedTeacher = await Teacher.findByIdAndUpdate(
            teacherId,
            { subject },
            { new: true }
        );
        if (!updatedTeacher) {
            return res.status(404).json({ message: "Teacher not found" });
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
            (a) =>
                a.date.toDateString() === new Date(date).toDateString()
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

module.exports = {
    teacherRegister,
    teacherLogIn,
    getTeachers,
    getTeacherDetail,
    getStudentDetailForTeacher, // New
    updateTeacherSubject,
    deleteTeacher,
    deleteTeachers,
    deleteTeachersByClass,
    teacherAttendance
};
