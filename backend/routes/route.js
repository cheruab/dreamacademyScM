const mongoose = require('mongoose');
const Student = require('../models/studentSchema.js');
const Teacher = require('../models/teacherSchema.js');
const router = require('express').Router();
const express = require('express');
const upload = require('../middlewares/upload.js');
const resultController = require('../controllers/resultController.js');
const { addExam, getExamResultsBySubject, getExamsBySubject,deleteExam, getExamById, updateExam, submitExamResult } = require("../controllers/examController.js");

const { assignTeacherToSubject } = require('../controllers/classAssignmentController');
const {
    createLessonPlan,
    getAllLessonPlans,
    getLessonPlanById,
    updateLessonPlan,
    deleteLessonPlan,
    getLessonPlansBySubject,
    getLessonPlanStats,
    getTeacherLessonPlans,
    getStudentLessonPlans,
    getParentLessonPlans
} = require("../controllers/lessonPlan-controller.js");

// Import the models that were missing
const Exam = require('../models/examSchema.js'); // Make sure this path is correct
const ExamResult = require('../models/examResultSchema.js'); // Make sure this path is correct
const Subject = require('../models/subjectSchema.js'); // Add this for direct DB operations

// ... (keep all your existing routes - Admin, Students, Parents, Teachers, Notices, Complains, Classes, Subjects)

const { adminRegister, adminLogIn, getAdminDetail } = require('../controllers/admin-controller.js');
const { getParentResults } = require('../controllers/resultController.js');

const { 
    sclassCreate, 
    sclassList, 
    deleteSclass, 
    deleteSclasses, 
    getSclassDetail, 
    getSclassStudents,
    reassignStudent,
    removeStudentFromClass,
    getClassStats,
    getSclassDetailEnhanced

} = require('../controllers/class-controller.js');

const { complainCreate, complainList, userComplainsList} = require('../controllers/complain-controller.js');

const { 
    noticeCreate, noticeList, deleteNotices, deleteNotice, updateNotice 
} = require('../controllers/notice-controller.js');

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
    removeStudentAttendance
} = require('../controllers/student_controller.js');

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
    removeParentAttendance
} = require('../controllers/student_controllers.js');

const { 
    subjectCreate, 
    freeSubjectList, 
    classSubjects, 
    getSubjectDetail, 
    deleteSubjectsByClass, 
    deleteSubjects, 
    deleteSubject, 
    allSubjects
} = require('../controllers/subject-controller.js');

const { 
    teacherRegister, getStudentDetailForTeacher, teacherLogIn, getTeachers, 
    getTeacherDetail, deleteTeachers, deleteTeachersByClass, deleteTeacher, 
    updateTeacherSubject,assignTeacher,teacherAttendance 
} = require('../controllers/teacher-controller.js');

// ================== Admin ==================
router.post('/AdminReg', adminRegister);
router.post('/AdminLogin', adminLogIn);
router.post('/upload', upload.single('resultFile'), resultController.uploadResult);
router.get("/Admin/:id", getAdminDetail);


// ================== Students ==================
router.post('/StudentReg', studentRegister);
router.post('/StudentLogin', studentLogIn);
router.get("/Students/:id", getStudents);
router.get("/Student/:id", getStudentById);
router.get("/Student/class/:id", getSclassStudents);

router.delete("/Students/:id", deleteStudents);
router.delete("/StudentsClass/:id", deleteStudentsByClass);
router.delete("/Student/:id", deleteStudent);

router.put("/Student/:id", updateStudent);
router.put('/UpdateExamResult/:id', updateExamResult);
router.put('/StudentAttendance/:id', studentAttendance);

router.put('/RemoveAllStudentsSubAtten/:id', clearAllStudentsAttendanceBySubject);
router.put('/RemoveAllStudentsAtten/:id', clearAllStudentsAttendance);
router.put('/RemoveStudentSubAtten/:id', removeStudentAttendanceBySubject);
router.put('/RemoveStudentAtten/:id', removeStudentAttendance);

// ================== Parents ==================
router.post("/ParentReg", parentRegister);
router.post("/ParentLogin", parentLogIn);
router.get("/Parents/:id", getParents);
router.get("/Parent/:id", getParentDetail);
router.get('/parents/:parentId/children', getMyChild);
router.get('/complains/user/:userId', getComplainsByUser);
router.get('/api/parent/results/:parentId', getParentResults);

// ================== Complains ==================
router.post('/ComplainCreate', complainCreate);
router.get('/ComplainList/:id', complainList);

// Add these route fixes to your route.js file
// Fix the parent results route - it should match what the frontend is calling
router.get('/api/parent/results/:parentId', getParentResults);

// Fix the parent children route to match frontend expectations
router.get('/parents/:parentId/children', getMyChild);

// Make sure parent details route exists
router.get('/Parent/:id', getParentDetail);

// Add a route to get student with full details including populated fields
router.get('/student-full/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id)
            .populate('sclassName', 'sclassName')
            .populate('school', 'schoolName')
            .populate('parent', 'name email')
            .populate('examResult.subName', 'subName subCode')
            .populate('attendance.subName', 'subName subCode');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Remove password before sending
        const studentData = { ...student._doc, password: undefined };
        res.json(studentData);
    } catch (err) {
        console.error('Error fetching student:', err);
        res.status(500).json({ message: err.message });
    }
});

// ================== Teachers ==================
router.post('/TeacherReg', teacherRegister);
router.post('/TeacherLogin', teacherLogIn);
router.get("/Teachers/:id", getTeachers);
router.get("/Teacher/:id", getTeacherDetail);
router.get('/Teacher/Student/:id', getStudentDetailForTeacher);

router.delete("/Teachers/:id", deleteTeachers);
router.delete("/TeachersClass/:id", deleteTeachersByClass);
router.delete("/Teacher/:id", deleteTeacher);

router.put("/TeacherSubject", updateTeacherSubject);
router.post('/TeacherAttendance/:id', teacherAttendance);

router.post('/AssignTeacher', assignTeacher);
// ================== Notices ==================
router.post('/NoticeCreate', noticeCreate);
router.get('/NoticeList/:id', noticeList);
router.delete("/Notices/:id", deleteNotices);
router.delete("/Notice/:id", deleteNotice);
router.put("/Notice/:id", updateNotice);



// ================== Classes ==================
router.post('/SclassCreate', sclassCreate);
router.get('/SclassList/:id', sclassList);
router.get("/Sclass/:id", getSclassDetail);
router.get("/Sclass/Students/:id", getSclassStudents);

// ================== Subjects ==================
router.post('/SubjectCreate', subjectCreate);
router.get('/AllSubjects/:id', allSubjects);
router.get('/FreeSubjectList/:id', freeSubjectList);
router.get("/Subject/:id", getSubjectDetail);
router.delete("/Subject/:id", deleteSubject);
router.delete("/Subjects/:id", deleteSubjects);
router.delete("/SubjectsClass/:id", deleteSubjectsByClass);

router.get('/ClassSubjects/:id', async (req, res) => {
    try {
        console.log("🔍 ClassSubjects route - Class ID:", req.params.id);
        
        const subjects = await Subject.find({ sclassName: req.params.id })
            .populate('teacher', 'name')
            .select('subName subCode sessions description videoLink isActive');
        
        console.log("📚 Found subjects:", subjects.length);
        
        // ✅ Always return an array, even if empty
        res.json(subjects);
        
    } catch (err) {
        console.error('💥 Error fetching class subjects:', err);
        res.status(500).json({ error: err.message, subjects: [] });
    }
});

// ================== EXAM ROUTES - COMPLETE SECTION ==================
// ================== EXAM ROUTES - COMPLETE FIXED SECTION =================



// ✅ 1. CREATE NEW EXAM - Uses controller function
router.post('/exams/add', addExam);

// ✅ 2. GET EXAMS BY SUBJECT ID (for Admin dashboard exam list)
router.get('/exams/subject/:subjectId', getExamsBySubject);

// ✅ 3. GET SINGLE EXAM BY ID (for editing) - FIXED ROUTE
router.get('/exams/:examId', getExamById);

// ✅ 4. UPDATE EXISTING EXAM - FIXED ROUTE
router.put('/exams/:examId', updateExam);

// ✅ 5. DELETE EXAM
router.delete('/exams/:examId', deleteExam);

// ✅ 6. GET EXAM FOR STUDENT (for taking exam) - Enhanced with completion check
router.get('/exam/:examId', async (req, res) => {
    try {
        const { examId } = req.params;
        const { studentId } = req.query; // Optional student ID to check completion
        
        console.log('📖 Student fetching exam for taking:', examId, 'Student:', studentId);

        if (!mongoose.Types.ObjectId.isValid(examId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid exam ID"
            });
        }

        const exam = await Exam.findById(examId)
            .populate('subject', 'subName subCode')
            .select('title description questions timeLimit passingMarks totalMarks scheduleType subject isActive');

        if (!exam) {
            return res.status(404).json({
                success: false,
                error: 'Exam not found'
            });
        }

        if (!exam.isActive) {
            return res.json({
                success: false,
                error: 'This exam is not currently active'
            });
        }

        // Check if student has already completed this exam (if studentId provided)
        let hasCompleted = false;
        let previousResult = null;

        if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
            const existingResult = await ExamResult.findOne({
                exam: examId,
                student: studentId
            }).select('percentage passed submittedAt timeSpent answers obtainedMarks totalMarks score totalQuestions');

            if (existingResult) {
                hasCompleted = true;
                // Convert Map to Object if necessary
                let answersObject = {};
                if (existingResult.answers instanceof Map) {
                    answersObject = Object.fromEntries(existingResult.answers);
                } else {
                    answersObject = existingResult.answers || {};
                }

                previousResult = {
                    percentage: existingResult.percentage,
                    passed: existingResult.passed,
                    submittedAt: existingResult.submittedAt,
                    timeSpent: existingResult.timeSpent,
                    answers: answersObject,
                    obtainedMarks: existingResult.obtainedMarks,
                    totalMarks: existingResult.totalMarks,
                    score: existingResult.score,
                    totalQuestions: existingResult.totalQuestions
                };
            }
        }

        res.json({
            success: true,
            message: hasCompleted ? 
                'Exam completed - you can review your answers.' : 
                'Exam is available to take anytime.',
            ...exam.toObject(),
            hasCompleted,
            previousResult
        });

    } catch (error) {
        console.error('❌ Error fetching exam for student:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch exam: ' + error.message
        });
    }
});
// In your routes file


// ✅ 7. SUBMIT EXAM RESULT
router.post('/exam/submit', submitExamResult);

// ✅ 8. CHECK IF EXAM IS COMPLETED BY STUDENT
router.get('/exam/:examId/completed/:studentId', async (req, res) => {
    try {
        const { examId, studentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(examId) || !mongoose.Types.ObjectId.isValid(studentId)) {
            return res.json({
                success: false,
                error: 'Invalid exam or student ID',
                isCompleted: false
            });
        }

        const examResult = await ExamResult.findOne({
            exam: examId,
            student: studentId
        }).select('_id percentage passed submittedAt');

        res.json({
            success: true,
            isCompleted: !!examResult,
            result: examResult || null
        });
    } catch (error) {
        console.error('❌ Error checking exam completion:', error);
        res.json({
            success: false,
            error: error.message,
            isCompleted: false
        });
    }
});

// ================== EXAM RESULTS ROUTES - FIXED FOR ADMIN DASHBOARD ==================

// ✅ 9. Get exam results by SUBJECT ID (FIXED - This is what the Results button calls)
// Add this debug version to your backend route (replace the existing route):

router.get('/exam-results/:subjectId', async (req, res) => {
    try {
        const { subjectId } = req.params;
        console.log('📊 Admin fetching exam results for subject:', subjectId);

        // Validate subject ID
        if (!mongoose.Types.ObjectId.isValid(subjectId)) {
            console.log('❌ Invalid subject ID:', subjectId);
            return res.status(400).json({
                success: false,
                error: 'Invalid subject ID',
                examResults: []
            });
        }

        // Check if subject exists
        const subject = await Subject.findById(subjectId);
        if (!subject) {
            console.log('❌ Subject not found:', subjectId);
            return res.status(404).json({
                success: false,
                error: 'Subject not found',
                examResults: []
            });
        }

        console.log('✅ Found subject:', subject.subName);

        // Get all exams for this subject
        const exams = await Exam.find({ subject: subjectId })
            .populate('subject', 'subName subCode')
            .select('title description totalMarks passingMarks questions')
            .sort({ createdAt: -1 });

        console.log(`📊 Found ${exams.length} exams for subject ${subjectId}`);

        if (exams.length === 0) {
            console.log('ℹ️ No exams found for this subject');
            return res.json({
                success: true,
                examResults: [],
                message: 'No exams found for this subject'
            });
        }

        // Get results for all exams in this subject
        const examResults = [];
        
        for (const exam of exams) {
            try {
                console.log(`📊 Processing exam: ${exam.title} (${exam._id})`);
                
                const results = await ExamResult.find({ exam: exam._id })
                    .populate('student', 'name rollNum email')
                    .sort({ percentage: -1 });

                console.log(`📊 Found ${results.length} results for exam ${exam.title}`);

                // Debug: Log the first result structure
                if (results.length > 0) {
                    console.log('📊 Sample result structure:', JSON.stringify(results[0], null, 2));
                }

                examResults.push({
                    exam: {
                        _id: exam._id,
                        title: exam.title,
                        description: exam.description,
                        subject: exam.subject,
                        totalMarks: exam.totalMarks,
                        passingMarks: exam.passingMarks,
                        totalQuestions: exam.questions ? exam.questions.length : 0
                    },
                    results: results.map(result => ({
                        _id: result._id,
                        studentId: result.student, // Student object with populated fields
                        score: result.score,
                        totalQuestions: result.totalQuestions,
                        obtainedMarks: result.obtainedMarks || (result.score * (exam.totalMarks / (exam.questions?.length || 1))),
                        totalMarks: result.totalMarks || exam.totalMarks,
                        percentage: result.percentage,
                        passed: result.passed,
                        timeSpent: result.timeSpent,
                        submittedAt: result.submittedAt || result.createdAt,
                        createdAt: result.createdAt,
                        questionAnalysis: result.questionAnalysis || []
                    }))
                });
            } catch (examError) {
                console.error(`❌ Error processing exam ${exam._id}:`, examError);
            }
        }

        console.log(`📊 Final examResults array length: ${examResults.length}`);
        console.log('📊 Total submissions across all exams:', examResults.reduce((total, exam) => total + exam.results.length, 0));
        
        // Debug: Log the structure of the response
        console.log('📊 Response structure preview:', {
            success: true,
            examResultsCount: examResults.length,
            firstExamTitle: examResults[0]?.exam?.title,
            firstExamResultsCount: examResults[0]?.results?.length
        });

        res.json({
            success: true,
            examResults: examResults,
            count: examResults.reduce((total, exam) => total + exam.results.length, 0),
            subject: {
                _id: subject._id,
                subName: subject.subName,
                subCode: subject.subCode
            }
        });

    } catch (error) {
        console.error('❌ Error fetching exam results by subject:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch exam results: ' + error.message,
            examResults: []
        });
    }
});

// Add this new route to your routes file for individual exam results:

// Get results for a SINGLE exam (not subject)
router.get('/exam-results/exam/:examId', async (req, res) => {
    try {
        const { examId } = req.params;
        console.log('📊 Admin fetching results for single exam:', examId);

        // Validate exam ID
        if (!mongoose.Types.ObjectId.isValid(examId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid exam ID',
                examResult: null
            });
        }

        // Get the specific exam
        const exam = await Exam.findById(examId)
            .populate('subject', 'subName subCode')
            .select('title description totalMarks passingMarks questions createdAt');

        if (!exam) {
            return res.status(404).json({
                success: false,
                error: 'Exam not found',
                examResult: null
            });
        }

        console.log('✅ Found exam:', exam.title);

        // Get results for this specific exam
        const results = await ExamResult.find({ exam: examId })
            .populate('student', 'name rollNum email')
            .sort({ percentage: -1 });

        console.log(`📊 Found ${results.length} results for exam ${exam.title}`);

        // Format the response
        const examResult = {
            exam: {
                _id: exam._id,
                title: exam.title,
                description: exam.description,
                subject: exam.subject,
                totalMarks: exam.totalMarks,
                passingMarks: exam.passingMarks,
                totalQuestions: exam.questions ? exam.questions.length : 0,
                createdAt: exam.createdAt
            },
            results: results.map(result => ({
                _id: result._id,
                studentId: result.student,
                score: result.score,
                totalQuestions: result.totalQuestions,
                obtainedMarks: result.obtainedMarks || (result.score * (exam.totalMarks / (exam.questions?.length || 1))),
                totalMarks: result.totalMarks || exam.totalMarks,
                percentage: result.percentage,
                passed: result.passed,
                timeSpent: result.timeSpent,
                submittedAt: result.submittedAt || result.createdAt,
                createdAt: result.createdAt,
                answers: result.answers instanceof Map ? Object.fromEntries(result.answers) : result.answers
            })),
            statistics: calculateExamStatistics(results, exam)
        };

        res.json({
            success: true,
            examResult: examResult,
            submissionCount: results.length,
            hasSubmissions: results.length > 0
        });

    } catch (error) {
        console.error('❌ Error fetching single exam results:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch exam results: ' + error.message,
            examResult: null
        });
    }
});

// Helper function to calculate statistics for a single exam
function calculateExamStatistics(results, exam) {
    if (!results || results.length === 0) {
        return {
            totalSubmissions: 0,
            passed: 0,
            failed: 0,
            passRate: 0,
            averageScore: 0,
            averageTime: 0,
            highestScore: 0,
            lowestScore: 0,
            gradeDistribution: { 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C': 0, 'F': 0 }
        };
    }

    const totalSubmissions = results.length;
    const passed = results.filter(r => r.passed).length;
    const failed = totalSubmissions - passed;
    const passRate = Math.round((passed / totalSubmissions) * 100);
    
    const totalScore = results.reduce((sum, r) => sum + r.percentage, 0);
    const averageScore = Math.round(totalScore / totalSubmissions);
    
    const totalTime = results.reduce((sum, r) => sum + (r.timeSpent || 0), 0);
    const averageTime = Math.round(totalTime / totalSubmissions);
    
    const highestScore = Math.max(...results.map(r => r.percentage));
    const lowestScore = Math.min(...results.map(r => r.percentage));

    const gradeDistribution = {
        'A+': results.filter(r => r.percentage >= 90).length,
        'A': results.filter(r => r.percentage >= 80 && r.percentage < 90).length,
        'B+': results.filter(r => r.percentage >= 70 && r.percentage < 80).length,
        'B': results.filter(r => r.percentage >= 60 && r.percentage < 70).length,
        'C': results.filter(r => r.percentage >= 50 && r.percentage < 60).length,
        'F': results.filter(r => r.percentage < 50).length
    };

    return {
        totalSubmissions,
        passed,
        failed,
        passRate,
        averageScore,
        averageTime,
        highestScore,
        lowestScore,
        gradeDistribution
    };
}

// ✅ 10. Get student exam results (for student profile view)
router.get('/student/:studentId/exam-results', async (req, res) => {
    try {
        const { studentId } = req.params;
        console.log("📊 Fetching exam results for student:", studentId);

        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid student ID",
                examResults: []
            });
        }

        const examResults = await ExamResult.find({ student: studentId })
            .populate({
                path: 'exam',
                select: 'title description subject timeLimit questions totalMarks passingMarks',
                populate: {
                    path: 'subject',
                    select: 'subName subCode'
                }
            })
            .sort({ createdAt: -1 });

        console.log(`Found ${examResults.length} exam results for student`);

        const formattedResults = examResults.map(result => {
            const resultObj = result.toObject();
            
            // Handle Map conversion for answers
            if (resultObj.answers instanceof Map) {
                resultObj.answers = Object.fromEntries(resultObj.answers);
            }
            
            return {
                _id: resultObj._id,
                examId: resultObj.exam,
                score: resultObj.score,
                totalQuestions: resultObj.totalQuestions,
                totalMarks: resultObj.totalMarks,
                obtainedMarks: resultObj.obtainedMarks,
                percentage: resultObj.percentage,
                passed: resultObj.passed,
                timeSpent: resultObj.timeSpent,
                submittedAt: resultObj.submittedAt || resultObj.createdAt,
                createdAt: resultObj.createdAt,
                startTime: resultObj.startTime,
                endTime: resultObj.endTime
            };
        });

        res.json({
            success: true,
            examResults: formattedResults,
            count: formattedResults.length
        });

    } catch (error) {
        console.error('❌ Error fetching student exam results:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            examResults: []
        });
    }
});

// ✅ 11. Get specific exam result details (for detailed view)
router.get('/exam-result/:examId/:studentId', async (req, res) => {
    try {
        const { examId, studentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(examId) || !mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid exam or student ID'
            });
        }

        const examResult = await ExamResult.findOne({
            exam: examId,
            student: studentId
        })
        .populate('exam', 'title questions totalMarks passingMarks')
        .populate('student', 'name rollNum');

        if (!examResult) {
            return res.status(404).json({
                success: false,
                error: 'Exam result not found'
            });
        }

        // Convert Map to Object for answers
        let answers = {};
        if (examResult.answers instanceof Map) {
            answers = Object.fromEntries(examResult.answers);
        } else {
            answers = examResult.answers || {};
        }

        res.json({
            success: true,
            examResult: {
                ...examResult.toObject(),
                answers
            }
        });

    } catch (error) {
        console.error('❌ Error fetching exam result details:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch exam result details: ' + error.message
        });
    }
});

// ✅ 12. Route to get exam completion statistics (for admin dashboard analytics)
router.get('/admin/exam-stats/:examId', async (req, res) => {
    try {
        const { examId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(examId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid exam ID'
            });
        }

        // Get exam details
        const exam = await Exam.findById(examId)
            .populate('subject', 'subName subCode')
            .populate('class', 'sclassName')
            .select('title subject class totalMarks passingMarks questions');

        if (!exam) {
            return res.status(404).json({
                success: false,
                error: 'Exam not found'
            });
        }

        // Get all results for this exam
        const results = await ExamResult.find({ exam: examId })
            .populate('student', 'name rollNum sclassName')
            .select('percentage passed timeSpent obtainedMarks submittedAt');

        // Calculate detailed statistics
        const completedCount = results.length;
        const passedCount = results.filter(r => r.passed).length;
        const failedCount = completedCount - passedCount;
        
        const averageScore = completedCount > 0 
            ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / completedCount)
            : 0;

        const averageTime = completedCount > 0
            ? Math.round(results.reduce((sum, r) => sum + r.timeSpent, 0) / completedCount)
            : 0;

        // Grade distribution
        const gradeDistribution = {
            'A+': results.filter(r => r.percentage >= 90).length,
            'A': results.filter(r => r.percentage >= 80 && r.percentage < 90).length,
            'B+': results.filter(r => r.percentage >= 70 && r.percentage < 80).length,
            'B': results.filter(r => r.percentage >= 60 && r.percentage < 70).length,
            'C': results.filter(r => r.percentage >= 50 && r.percentage < 60).length,
            'F': results.filter(r => r.percentage < 50).length
        };

        res.json({
            success: true,
            exam: {
                _id: exam._id,
                title: exam.title,
                subject: exam.subject,
                class: exam.class,
                totalMarks: exam.totalMarks,
                passingMarks: exam.passingMarks,
                totalQuestions: exam.questions?.length || 0
            },
            statistics: {
                participation: {
                    completedCount,
                    completionRate: 100 // Since we only have completed results
                },
                performance: {
                    passedCount,
                    failedCount,
                    passRate: completedCount > 0 ? Math.round((passedCount / completedCount) * 100) : 0,
                    averageScore,
                    highestScore: completedCount > 0 ? Math.max(...results.map(r => r.percentage)) : 0,
                    lowestScore: completedCount > 0 ? Math.min(...results.map(r => r.percentage)) : 0
                },
                timing: {
                    averageTime,
                    fastestTime: completedCount > 0 ? Math.min(...results.map(r => r.timeSpent)) : 0,
                    slowestTime: completedCount > 0 ? Math.max(...results.map(r => r.timeSpent)) : 0
                },
                gradeDistribution
            }
        });

    } catch (error) {
        console.error('❌ Error fetching exam statistics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch exam statistics: ' + error.message
        });
    }
});

// ✅ 3. FIXED - Get enhanced student details with populated fields
router.get('/student-full/:id', async (req, res) => {
    try {
        const studentId = req.params.id;
        console.log('📖 Fetching full student details for:', studentId);

        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid student ID' 
            });
        }

        const student = await Student.findById(studentId)
            .populate('sclassName', 'sclassName')
            .populate('school', 'schoolName')
            .populate('parent', 'name email')
            .populate({
                path: 'examResult.subName',
                select: 'subName subCode'
            })
            .populate({
                path: 'attendance.subName',
                select: 'subName subCode'
            });

        if (!student) {
            return res.status(404).json({ 
                success: false,
                message: 'Student not found' 
            });
        }

        // Remove password before sending
        const studentData = { ...student._doc };
        delete studentData.password;

        console.log('✅ Student found:', student.name);
        res.json({
            success: true,
            ...studentData
        });
    } catch (err) {
        console.error('❌ Error fetching full student details:', err);
        res.status(500).json({ 
            success: false,
            message: err.message 
        });
    }
});

// ✅ 4. Get parent results (for parent dashboard)
router.get('/parent/results/:parentId', async (req, res) => {
    try {
        const { parentId } = req.params;
        console.log('👨‍👩‍👧‍👦 Fetching results for parent:', parentId);

        if (!mongoose.Types.ObjectId.isValid(parentId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid parent ID'
            });
        }

        // Find all children of this parent
        const children = await Student.find({ parent: parentId })
            .populate('sclassName', 'sclassName')
            .select('name rollNum sclassName');

        if (children.length === 0) {
            return res.json({
                success: true,
                children: [],
                examResults: [],
                message: 'No children found for this parent'
            });
        }

        // Get exam results for all children
        const childIds = children.map(child => child._id);
        const examResults = await ExamResult.find({ 
            student: { $in: childIds } 
        })
        .populate({
            path: 'exam',
            select: 'title description subject',
            populate: {
                path: 'subject',
                select: 'subName subCode'
            }
        })
        .populate('student', 'name rollNum')
        .sort({ createdAt: -1 });

        // Group results by child
        const resultsByChild = {};
        examResults.forEach(result => {
            const studentId = result.student._id.toString();
            if (!resultsByChild[studentId]) {
                resultsByChild[studentId] = [];
            }
            resultsByChild[studentId].push({
                _id: result._id,
                examTitle: result.exam.title,
                subject: result.exam.subject,
                score: result.score,
                totalQuestions: result.totalQuestions,
                percentage: result.percentage,
                passed: result.passed,
                submittedAt: result.endTime,
                timeSpent: result.timeSpent
            });
        });

        const childrenWithResults = children.map(child => ({
            _id: child._id,
            name: child.name,
            rollNum: child.rollNum,
            className: child.sclassName?.sclassName || 'No Class',
            examResults: resultsByChild[child._id.toString()] || []
        }));

        res.json({
            success: true,
            children: childrenWithResults,
            totalResults: examResults.length
        });

    } catch (error) {
        console.error('❌ Error fetching parent results:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ✅ 5. Alternative route for parent results (matching frontend expectations)
router.get('/api/parent/results/:parentId', async (req, res) => {
    try {
        // Forward to the main parent results handler
        req.url = `/parent/results/${req.params.parentId}`;
        return router.handle(req, res);
    } catch (error) {
        console.error('❌ Error in API parent results route:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ✅ 6. Get specific student by ID with error handling
router.get('/Student/:id', async (req, res) => {
    try {
        const studentId = req.params.id;
        console.log('👨‍🎓 Fetching student:', studentId);

        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid student ID' 
            });
        }

        const student = await Student.findById(studentId)
            .populate('sclassName', 'sclassName')
            .populate('school', 'schoolName')
            .populate('parent', 'name email')
            .populate({
                path: 'examResult.subName',
                select: 'subName subCode'
            })
            .populate({
                path: 'attendance.subName', 
                select: 'subName subCode'
            });

        if (!student) {
            return res.status(404).json({ 
                success: false,
                message: 'Student not found' 
            });
        }

        // Remove sensitive information
        const studentData = { ...student._doc };
        delete studentData.password;

        console.log('✅ Student found:', student.name);
        res.json({
            success: true,
            ...studentData
        });
    } catch (err) {
        console.error('❌ Error fetching student:', err);
        res.status(500).json({ 
            success: false,
            message: err.message 
        });
    }
});

// ✅ 7. Get subjects for a class with better error handling
router.get('/ClassSubjects/:id', async (req, res) => {
    try {
        const classId = req.params.id;
        console.log("📚 ClassSubjects route - Class ID:", classId);
        
        if (!mongoose.Types.ObjectId.isValid(classId)) {
            console.log("❌ Invalid class ID");
            return res.status(400).json({ 
                success: false,
                error: 'Invalid class ID',
                subjects: [] 
            });
        }
        
        const subjects = await Subject.find({ sclassName: classId })
            .populate('teacher', 'name')
            .select('subName subCode sessions description videoLink isActive');
        
        console.log("📚 Found subjects:", subjects.length);
        
        // Always return an array, even if empty
        res.json({
            success: true,
            subjects: subjects,
            count: subjects.length
        });
        
    } catch (err) {
        console.error('💥 Error fetching class subjects:', err);
        res.status(500).json({ 
            success: false,
            error: err.message, 
            subjects: [] 
        });
    }
});

// ================== END FIXED EXAM RESULTS ROUTES ==================

// ✅ Export the modified submitExamResult function

// ================== END OF EXAM ROUTES ==================
// ================== END OF EXAM ROUTES ==================

// ================== SUBJECT MANAGEMENT ROUTES ==================
// Get unassigned subjects (subjects not assigned to any class)
router.get('/UnassignedSubjects/:id', async (req, res) => {
    try {
        const subjects = await Subject.find({ 
            school: req.params.id,
            sclassName: null 
        }).populate('teacher', 'name');
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get ALL subjects for a school (for assignment dialog that shows all subjects)
router.get('/AllSchoolSubjects/:id', async (req, res) => {
    try {
        const subjects = await Subject.find({ 
            school: req.params.id
        }).populate('teacher', 'name').populate('sclassName', 'sclassName');
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.post('/AssignTeacherToSubject', assignTeacherToSubject);

// Assign subjects to a class
router.post('/AssignSubjectsToClass', async (req, res) => {
    try {
        const { subjectIds, classId } = req.body;
        
        if (!subjectIds || !classId) {
            return res.status(400).json({ message: 'Subject IDs and Class ID are required' });
        }
        
        const result = await Subject.updateMany(
            { _id: { $in: subjectIds } },
            { sclassName: classId }
        );
        
        res.json({ 
            message: `${subjectIds.length} subjects assigned successfully`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Remove subjects from a class (make them unassigned)
router.post('/RemoveSubjectsFromClass', async (req, res) => {
    try {
        const { subjectIds } = req.body;
        
        if (!subjectIds) {
            return res.status(400).json({ message: 'Subject IDs are required' });
        }
        
        const result = await Subject.updateMany(
            { _id: { $in: subjectIds } },
            { sclassName: null }
        );
        
        res.json({ 
            message: `${subjectIds.length} subjects removed from class successfully`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ================== Class Assignment Routes ==================
// Assign students to a class
router.post('/class/assign-students/:classId', async (req, res) => {
    try {
        const { studentIds } = req.body;
        const { classId } = req.params;
        
        const result = await Student.updateMany(
            { _id: { $in: studentIds } },
            { sclassName: classId }
        );
        
        res.json({ 
            success: true,
            message: `${studentIds.length} students assigned successfully`,
            modifiedCount: result.modifiedCount 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Assign teachers to a class  
router.post('/class/assign-teachers/:classId', async (req, res) => {
    try {
        const { teacherIds } = req.body;
        const { classId } = req.params;
        
        const result = await Teacher.updateMany(
            { _id: { $in: teacherIds } },
            { teachSclass: classId }
        );
        
        res.json({ 
            success: true,
            message: `${teacherIds.length} teachers assigned successfully`,
            modifiedCount: result.modifiedCount 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get unassigned students (students without a class)
router.get('/UnassignedStudents/:schoolId', async (req, res) => {
    try {
        const students = await Student.find({ 
            school: req.params.schoolId,
            $or: [
                { sclassName: null },
                { sclassName: { $exists: false } }
            ]
        }).populate('sclassName', 'sclassName');
        
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ================== DEBUG ROUTES (Remove in production) ==================
router.get('/Debug/AllSubjects/:schoolId', async (req, res) => {
    try {
        console.log("=== DEBUG ALL SUBJECTS ===");
        const allSubjects = await Subject.find({ school: req.params.schoolId })
            .populate('sclassName', 'sclassName')
            .populate('teacher', 'name');
        
        console.log("Total subjects in school:", allSubjects.length);
        
        const subjectsByClass = {};
        const unassignedSubjects = [];
        
        allSubjects.forEach(subject => {
            if (subject.sclassName) {
                const className = subject.sclassName.sclassName;
                const classId = subject.sclassName._id.toString();
                
                if (!subjectsByClass[className]) {
                    subjectsByClass[className] = {
                        classId: classId,
                        subjects: []
                    };
                }
                
                subjectsByClass[className].subjects.push({
                    id: subject._id,
                    name: subject.subName,
                    code: subject.subCode,
                    isActive: subject.isActive,
                    sessions: subject.sessions
                });
            } else {
                unassignedSubjects.push({
                    id: subject._id,
                    name: subject.subName,
                    code: subject.subCode,
                    isActive: subject.isActive
                });
            }
        });
        
        console.log("Subjects grouped by class:", subjectsByClass);
        console.log("Unassigned subjects:", unassignedSubjects);
        
        res.json({
            totalSubjects: allSubjects.length,
            subjectsByClass: subjectsByClass,
            unassignedSubjects: unassignedSubjects,
            requestedSchoolId: req.params.schoolId
        });
    } catch (err) {
        console.error("Error in debug route:", err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/Debug/StudentData/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        console.log("=== STUDENT DEBUG ===");
        
        const student = await Student.findById(studentId)
            .populate('sclassName', 'sclassName')
            .populate('school', 'schoolName');
            
        console.log("Student found:", !!student);
        if (student) {
            console.log("Student name:", student.name);
            console.log("Student class:", student.sclassName);
            console.log("Student school:", student.school);
        }
        
        if (student && student.sclassName) {
            const subjects = await Subject.find({ sclassName: student.sclassName._id })
                .populate('teacher', 'name');
            console.log("Subjects found for class:", subjects.length);
            
            res.json({
                debug: true,
                student: {
                    id: student._id,
                    name: student.name,
                    class: student.sclassName,
                    school: student.school
                },
                subjects: subjects,
                classId: student.sclassName._id
            });
        } else {
            res.json({
                debug: true,
                error: "Student or class not found",
                student: student
            });
        }
        
    } catch (error) {
        console.error("Debug error:", error);
        res.status(500).json({ debug: true, error: error.message });
    }
});

// Enhanced class creation route
router.post('/SclassCreate', async (req, res) => {
    try {
        const { sclassName, adminID, studentId } = req.body;
        
        if (studentId) {
            const existingStudent = await Student.findById(studentId);
            if (existingStudent && existingStudent.sclassName) {
                return res.json({ 
                    message: 'Student is already assigned to another class' 
                });
            }
        }
        
        const newClass = new (require('../models/sclassSchema'))({
            sclassName,
            school: adminID
        });
        
        const savedClass = await newClass.save();
        
        if (studentId) {
            await Student.findByIdAndUpdate(studentId, {
                sclassName: savedClass._id
            });
        }
        
        res.json(savedClass);
    } catch (error) {
        console.error('Error creating class:', error);
        res.status(500).json({ 
            message: 'Failed to create class' 
        });
    }
});

// Enhanced route to fetch students for a specific class
router.get('/Sclass/Students/:classId', async (req, res) => {
    try {
        const { classId } = req.params;
        
        const students = await Student.find({ 
            sclassName: classId 
        }).populate('sclassName', 'sclassName');
        
        console.log(`Found ${students.length} students for class ${classId}`);
        
        res.json(students);
    } catch (error) {
        console.error('Error fetching class students:', error);
        res.status(500).json({ 
            error: 'Failed to fetch students' 
        });
    }
});

// Alternative endpoint to get students by school and then filter by class
router.get('/Students/ByClass/:classId/:adminId', async (req, res) => {
    try {
        const { classId, adminId } = req.params;
        
        const students = await Student.find({ 
            school: adminId,
            sclassName: classId 
        }).populate('sclassName', 'sclassName');
        
        res.json(students);
    } catch (error) {
        console.error('Error fetching students by class:', error);
        res.status(500).json({ 
            error: 'Failed to fetch students' 
        });
    }
});

// Debug route to check student assignments (remove in production)
router.get('/debug/students/:adminId', async (req, res) => {
    try {
        const { adminId } = req.params;
        
        const students = await Student.find({ school: adminId })
            .populate('sclassName', 'sclassName')
            .select('name rollNum sclassName');
        
        const classes = await (require('../models/sclassSchema')).find({ school: adminId })
            .select('sclassName');
        
        res.json({
            students: students,
            classes: classes,
            studentsWithClasses: students.filter(s => s.sclassName),
            studentsWithoutClasses: students.filter(s => !s.sclassName)
        });
    } catch (error) {
        console.error('Error in debug route:', error);
        res.status(500).json({ error: 'Debug failed' });
    }
});

// Enhanced unassigned students route
router.get('/UnassignedStudents/:adminId', async (req, res) => {
    try {
        const { adminId } = req.params;
        
        const unassignedStudents = await Student.find({ 
            school: adminId,
            $or: [
                { sclassName: { $exists: false } },
                { sclassName: null }
            ]
        }).select('name rollNum _id');
        
        if (unassignedStudents.length === 0) {
            return res.json({ 
                message: 'No unassigned students found' 
            });
        }
        
        res.json(unassignedStudents);
    } catch (error) {
        console.error('Error fetching unassigned students:', error);
        res.status(500).json({ 
            message: 'Failed to fetch unassigned students' 
        });
    }
});

// Check if student can be assigned to a class
router.get('/StudentAssignmentStatus/:studentId', async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId)
            .populate('sclassName', 'sclassName')
            .select('name rollNum sclassName');
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        res.json({
            student: {
                id: student._id,
                name: student.name,
                rollNum: student.rollNum
            },
            hasClass: !!student.sclassName,
            currentClass: student.sclassName,
            canBeAssigned: !student.sclassName
        });
    } catch (error) {
        console.error('Error checking student assignment status:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get class capacity information (for one-student-per-class system)
router.get('/ClassCapacity/:classId', async (req, res) => {
    try {
        const classInfo = await (require('../models/sclassSchema')).findById(req.params.classId);
        if (!classInfo) {
            return res.status(404).json({ message: 'Class not found' });
        }

        const currentStudent = await Student.findOne({ sclassName: req.params.classId })
            .select('name rollNum _id');

        const subjectCount = await Subject.countDocuments({ sclassName: req.params.classId });

        res.json({
            class: {
                id: classInfo._id,
                name: classInfo.sclassName
            },
            currentStudent: currentStudent,
            hasStudent: !!currentStudent,
            isFull: !!currentStudent,
            capacity: 1,
            subjectCount: subjectCount,
            canAcceptNewStudent: !currentStudent
        });
    } catch (error) {
        console.error('Error fetching class capacity:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get classes that need student assignment (empty classes)
router.get('/EmptyClasses/:schoolId', async (req, res) => {
    try {
        const allClasses = await (require('../models/sclassSchema')).find({ school: req.params.schoolId });
        
        const emptyClasses = [];
        
        for (const classItem of allClasses) {
            const studentCount = await Student.countDocuments({ sclassName: classItem._id });
            if (studentCount === 0) {
                emptyClasses.push({
                    _id: classItem._id,
                    sclassName: classItem.sclassName,
                    createdAt: classItem.createdAt
                });
            }
        }

        res.json({
            emptyClasses: emptyClasses,
            count: emptyClasses.length
        });
    } catch (error) {
        console.error('Error fetching empty classes:', error);
        res.status(500).json({ message: error.message });
    }
});

// Enhanced class details with student and subject information
router.get('/Sclass/enhanced/:id', getSclassDetailEnhanced);

// Get class statistics for admin dashboard
router.get('/ClassStats/:schoolId', getClassStats);

// Reassign student to a different class
router.put('/ReassignStudent', reassignStudent);

// Remove student from class (make class empty)
router.put('/RemoveStudentFromClass', removeStudentFromClass);

// Route to get classes with their assigned students (for overview)
router.get('/ClassesWithStudents/:schoolId', async (req, res) => {
    try {
        const classes = await (require('../models/sclassSchema')).find({ school: req.params.schoolId })
            .populate({
                path: 'school',
                select: 'schoolName'
            });
        
        const classesWithStudents = await Promise.all(
            classes.map(async (classItem) => {
                const students = await Student.find({ sclassName: classItem._id })
                    .select('name rollNum _id');
                
                const subjects = await Subject.find({ sclassName: classItem._id })
                    .select('subName subCode _id')
                    .populate('teacher', 'name');
                
                return {
                    _id: classItem._id,
                    sclassName: classItem.sclassName,
                    createdAt: classItem.createdAt,
                    students: students,
                    subjects: subjects,
                    studentCount: students.length,
                    subjectCount: subjects.length
                };
            })
        );
        
        res.json(classesWithStudents);
    } catch (error) {
        console.error('Error fetching classes with students:', error);
        res.status(500).json({ message: error.message });
    }
});



// Add these lesson plan routes to your existing route.js file



// ================== LESSON PLANS ROUTES ==================

router.post('/lesson-plans', createLessonPlan);
router.get('/lesson-plans/school/:schoolId', getAllLessonPlans);
router.get('/lesson-plans/subject/:subjectId', getLessonPlansBySubject);
router.get('/lesson-plans/:id', getLessonPlanById);
router.put('/lesson-plans/:id', updateLessonPlan);
router.delete('/lesson-plans/:id', deleteLessonPlan);

// Teacher Routes

// Route to get lesson plans by class (useful for admin dashboard)
router.get('/lesson-plans/class/:classId', async (req, res) => {
    try {
        const { classId } = req.params;
        const { term, subject, status = 'Published' } = req.query;

        const filter = {
            class: classId,
            status,
            isActive: true
        };

        if (term) filter.term = term;
        if (subject) filter.subject = subject;

        const lessonPlans = await LessonPlan.find(filter)
            .populate('subject', 'subName subCode')
            .populate('teacher', 'name')
            .populate('class', 'sclassName')
            .sort({ lessonDate: 1, week: 1 });

        res.json({
            success: true,
            lessonPlans,
            count: lessonPlans.length
        });

    } catch (error) {
        console.error('Error fetching lesson plans by class:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch lesson plans',
            error: error.message
        });
    }
});

// Search lesson plans (for admin dashboard)
router.get('/lesson-plans/search/:schoolId', async (req, res) => {
    try {
        const { schoolId } = req.params;
        const { 
            q, // search query
            subject,
            class: classId,
            teacher,
            term,
            status,
            dateFrom,
            dateTo,
            page = 1,
            limit = 20
        } = req.query;

        const filter = { school: schoolId };
        
        // Text search
        if (q) {
            filter.$or = [
                { title: { $regex: q, $options: 'i' } },
                { notes: { $regex: q, $options: 'i' } },
                { 'objectives': { $regex: q, $options: 'i' } }
            ];
        }

        // Other filters
        if (subject) filter.subject = subject;
        if (classId) filter.class = classId;
        if (teacher) filter.teacher = teacher;
        if (term) filter.term = term;
        if (status) filter.status = status;

        // Date range filter
        if (dateFrom || dateTo) {
            filter.lessonDate = {};
            if (dateFrom) filter.lessonDate.$gte = new Date(dateFrom);
            if (dateTo) filter.lessonDate.$lte = new Date(dateTo);
        }

        const skip = (page - 1) * limit;

        const lessonPlans = await LessonPlan.find(filter)
            .populate('subject', 'subName subCode')
            .populate('class', 'sclassName')
            .populate('teacher', 'name')
            .sort({ lessonDate: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await LessonPlan.countDocuments(filter);

        res.json({
            success: true,
            lessonPlans,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            },
            searchQuery: q,
            filters: {
                subject,
                class: classId,
                teacher,
                term,
                status,
                dateFrom,
                dateTo
            }
        });

    } catch (error) {
        console.error('Error searching lesson plans:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search lesson plans',
            error: error.message
        });
    }
});

// Get upcoming lesson plans (for dashboard widgets)
router.get('/lesson-plans/upcoming/:schoolId', async (req, res) => {
    try {
        const { schoolId } = req.params;
        const { days = 7, limit = 10 } = req.query;

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + parseInt(days));

        const lessonPlans = await LessonPlan.find({
            school: schoolId,
            lessonDate: {
                $gte: startDate,
                $lte: endDate
            },
            status: 'Published',
            isActive: true
        })
        .populate('subject', 'subName subCode')
        .populate('class', 'sclassName')
        .populate('teacher', 'name')
        .sort({ lessonDate: 1 })
        .limit(parseInt(limit));

        res.json({
            success: true,
            lessonPlans,
            count: lessonPlans.length,
            dateRange: {
                from: startDate,
                to: endDate,
                days: parseInt(days)
            }
        });

    } catch (error) {
        console.error('Error fetching upcoming lesson plans:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch upcoming lesson plans',
            error: error.message
        });
    }
});

// Bulk operations route
router.post('/lesson-plans/bulk-action', async (req, res) => {
    try {
        const { action, lessonPlanIds, data } = req.body;

        if (!action || !lessonPlanIds || !Array.isArray(lessonPlanIds)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request data'
            });
        }

        let result;

        switch (action) {
            case 'delete':
                result = await LessonPlan.deleteMany({ _id: { $in: lessonPlanIds } });
                break;
            
            case 'archive':
                result = await LessonPlan.updateMany(
                    { _id: { $in: lessonPlanIds } },
                    { status: 'Archived' }
                );
                break;
            
            case 'publish':
                result = await LessonPlan.updateMany(
                    { _id: { $in: lessonPlanIds } },
                    { status: 'Published' }
                );
                break;
            
            case 'draft':
                result = await LessonPlan.updateMany(
                    { _id: { $in: lessonPlanIds } },
                    { status: 'Draft' }
                );
                break;
            
            case 'update_term':
                if (!data.term) {
                    return res.status(400).json({
                        success: false,
                        message: 'Term is required for update_term action'
                    });
                }
                result = await LessonPlan.updateMany(
                    { _id: { $in: lessonPlanIds } },
                    { term: data.term }
                );
                break;
            
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid action'
                });
        }

        res.json({
            success: true,
            message: `Bulk ${action} completed successfully`,
            affectedCount: result.modifiedCount || result.deletedCount,
            action
        });

    } catch (error) {
        console.error('Error performing bulk action:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to perform bulk action',
            error: error.message
        });
    }
});

// Export the LessonPlan model import (add this to the top of your route.js file)
// const LessonPlan = require('../models/lessonPlanSchema.js');

module.exports = router;