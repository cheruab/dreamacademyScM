const router = require('express').Router();
const express = require('express');
const upload = require('../middlewares/upload.js');
const resultController = require('../controllers/resultController.js');

// const { adminRegister, adminLogIn, deleteAdmin, getAdminDetail, updateAdmin } = require('../controllers/admin-controller.js');

const { adminRegister, adminLogIn, getAdminDetail} = require('../controllers/admin-controller.js');

const { getParentResults } = require('../controllers/resultController.js');


const { sclassCreate, sclassList, deleteSclass, deleteSclasses, getSclassDetail, getSclassStudents } = require('../controllers/class-controller.js');
const { complainCreate, complainList } = require('../controllers/complain-controller.js');
const { noticeCreate, noticeList, deleteNotices, deleteNotice, updateNotice } = require('../controllers/notice-controller.js');
const {
    studentRegister,
    studentLogIn,
    getStudents,
   getStudentById,
    getStudentDetail,
    deleteStudents,
    deleteStudent,
    updateStudent,
    studentAttendance,
    deleteStudentsByClass,
    updateExamResult,
    clearAllStudentsAttendanceBySubject,
    clearAllStudentsAttendance,
    removeStudentAttendanceBySubject,
    removeStudentAttendance } = require('../controllers/student_controller.js');

const {
    parentRegister,
    parentLogIn,
    getParents,
    getMyChild,
    getParentDetail,
    getComplainsByUser,
    deleteParents,
    deleteParent,
    updateParent,
    parentAttendance,
    deleteParentsByClass,
    updateExamResults,

    clearAllParentsAttendanceBySubject,
    clearAllParentsAttendance,
    removeParentAttendanceBySubject,
    removeParentAttendance, } = require('../controllers/student_controllers.js');


const { subjectCreate, classSubjects, deleteSubjectsByClass, getSubjectDetail, deleteSubject, freeSubjectList, allSubjects, deleteSubjects } = require('../controllers/subject-controller.js');
const { teacherRegister,getStudentDetailForTeacher, teacherLogIn, getTeachers, getTeacherDetail, deleteTeachers, deleteTeachersByClass, deleteTeacher, updateTeacherSubject, teacherAttendance } = require('../controllers/teacher-controller.js');

// Admin
router.post('/AdminReg', adminRegister);
router.post('/AdminLogin', adminLogIn);
// routes/adminRoutes.js
router.post('/upload', upload.single('resultFile'), resultController.uploadResult);

router.get("/Admin/:id", getAdminDetail)
// router.delete("/Admin/:id", deleteAdmin)

// router.put("/Admin/:id", updateAdmin)



// Students

router.post('/StudentReg', studentRegister);
router.post('/StudentLogin', studentLogIn)

router.get("/Students/:id", getStudents)


router.get("/Student/:id", getStudentById);
router.get("/Student/class:id", getSclassStudents)

router.delete("/Students/:id", deleteStudents)
router.delete("/StudentsClass/:id", deleteStudentsByClass)
router.delete("/Student/:id", deleteStudent)

router.put("/Student/:id", updateStudent)

router.put('/UpdateExamResult/:id', updateExamResult)

router.put('/StudentAttendance/:id', studentAttendance)

router.put('/RemoveAllStudentsSubAtten/:id', clearAllStudentsAttendanceBySubject);
router.put('/RemoveAllStudentsAtten/:id', clearAllStudentsAttendance);

router.put('/RemoveStudentSubAtten/:id', removeStudentAttendanceBySubject);
router.put('/RemoveStudentAtten/:id', removeStudentAttendance)



// Parent

router.post("/ParentReg", parentRegister);
router.post("/ParentLogin", parentLogIn)

router.get("/Parents/:id", getParents)
// Parent fetch their results

router.get("/Parent/:id", getParentDetail)
router.get('/parents/:parentId/children', getMyChild);
router.get('/complains/user/:userId', getComplainsByUser);
// Get all results for a parent
router.get('/api/parent/results/:parentId', getParentResults);



// Teacher

router.post('/TeacherReg', teacherRegister);
router.post('/TeacherLogin', teacherLogIn)

router.get("/Teachers/:id", getTeachers)
router.get("/Teacher/:id", getTeacherDetail)

router.delete("/Teachers/:id", deleteTeachers)
router.delete("/TeachersClass/:id", deleteTeachersByClass)
router.delete("/Teacher/:id", deleteTeacher)
router.get('/Teacher/Student/:id', getStudentDetailForTeacher);

router.put("/TeacherSubject", updateTeacherSubject)

router.post('/TeacherAttendance/:id', teacherAttendance)

// Notice

router.post('/NoticeCreate', noticeCreate);

router.get('/NoticeList/:id', noticeList);

router.delete("/Notices/:id", deleteNotices)
router.delete("/Notice/:id", deleteNotice)

router.put("/Notice/:id", updateNotice)

// Complain

router.post('/ComplainCreate', complainCreate);

router.get('/ComplainList/:id', complainList);

// Sclass

router.post('/SclassCreate', sclassCreate);

router.get('/SclassList/:id', sclassList);
router.get("/Sclass/:id", getSclassDetail)

router.get("/Sclass/Students/:id", getSclassStudents)

router.delete("/Sclasses/:id", deleteSclasses)
router.delete("/Sclass/:id", deleteSclass)

// Subject

router.post('/SubjectCreate', subjectCreate);

router.get('/AllSubjects/:id', allSubjects);
router.get('/ClassSubjects/:id', classSubjects);
router.get('/FreeSubjectList/:id', freeSubjectList);
router.get("/Subject/:id", getSubjectDetail)

router.delete("/Subject/:id", deleteSubject)
router.delete("/Subjects/:id", deleteSubjects)
router.delete("/SubjectsClass/:id", deleteSubjectsByClass)

module.exports = router;