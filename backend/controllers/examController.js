const Exam = require('../models/examSchema.js');
const ExamResult = require('../models/examResultSchema.js');
const Subject = require('../models/subjectSchema.js');
const Student = require('../models/studentSchema.js');
const mongoose = require('mongoose');

// Add a new exam
// Add a new exam - FIXED VERSION
// Improved addExam controller with better debugging
// Update the addExam function - SIMPLIFIED VERSION
// Update the addExam function - COMPLETELY FIXED
// Update the addExam function - FINAL FIX
const addExam = async (req, res) => {
    try {
        console.log("📝 Creating new exam with data:", JSON.stringify(req.body, null, 2));

        const {
            subjectId,
            title,
            description,
            questions,
            timeLimit,
            passingMarks,
            schoolId,
            classId,
            teacherId,
            totalMarks
        } = req.body;

        // ✅ Validate required fields
        if (!subjectId || !title || !questions || questions.length === 0) {
            return res.status(400).json({
                success: false,
                error: "Subject ID, title, and at least one question are required"
            });
        }

        // ✅ Calculate totalMarks
        let calculatedTotalMarks = totalMarks;
        if (!calculatedTotalMarks || calculatedTotalMarks <= 0) {
            calculatedTotalMarks = questions.reduce((sum, q) => sum + (parseInt(q.marks) || 1), 0);
            console.log("📊 Calculated totalMarks from questions:", calculatedTotalMarks);
        }

        if (calculatedTotalMarks <= 0) {
            return res.status(400).json({
                success: false,
                error: "Total marks must be greater than 0"
            });
        }

        // ✅ Fetch and validate subject
        const subject = await Subject.findById(subjectId).populate('sclassName').populate('school');
        if (!subject) {
            return res.status(404).json({
                success: false,
                error: "Subject not found"
            });
        }

        // ✅ Build exam data object - COMPLETELY exclude date fields
        const examData = {
            title: title.trim(),
            description: description?.trim() || '',
            subject: subjectId,
            class: classId || subject.sclassName?._id,
            school: schoolId || subject.school?._id,
            teacher: teacherId,
            questions: questions.map(q => ({
                question: q.question.trim(),
                options: q.options.filter(opt => opt?.trim()).map(opt => opt.trim()),
                correctAnswer: q.correctAnswer,
                marks: parseInt(q.marks) || 1,
                difficulty: q.difficulty || 'Medium',
                category: q.category || 'General',
                explanation: q.explanation?.trim() || ''
            })),
            timeLimit: parseInt(timeLimit) || 3600,
            totalMarks: calculatedTotalMarks,
            passingMarks: parseInt(passingMarks) || Math.ceil(calculatedTotalMarks * 0.6),
            scheduleType: 'flexible',
            isActive: true,
            allowedAttempts: 1,
            randomizeQuestions: false,
            showResultsImmediately: true
        };

        // ✅ DO NOT include any date fields at all
        console.log("✅ Final exam data to save (no date fields):", {
            ...examData,
            questions: `${examData.questions.length} questions`
        });

        // ✅ Create and save exam
        const newExam = new Exam(examData);
        const savedExam = await newExam.save();
        console.log("✅ Exam saved successfully with ID:", savedExam._id);

        // ✅ Return populated response
        const populatedExam = await Exam.findById(savedExam._id)
            .populate('subject', 'subName subCode')
            .populate('class', 'sclassName')
            .populate('teacher', 'name');

        res.status(201).json({
            success: true,
            message: "Exam created successfully",
            exam: populatedExam
        });

    } catch (error) {
        console.error("❌ Error creating exam:", error);

        if (error.name === 'ValidationError') {
            const errorMessages = Object.values(error.errors).map(err => {
                return `${err.path}: ${err.message}`;
            });
            
            return res.status(400).json({
                success: false,
                error: `Validation failed: ${errorMessages.join(', ')}`,
                details: error.errors
            });
        }

        res.status(500).json({
            success: false,
            error: error.message || "Failed to create exam"
        });
    }
};

// Get exams by subject ID
const getExamsBySubject = async (req, res) => {
    try {
        const { subjectId } = req.params;
        console.log("Fetching exams for subject:", subjectId);

        if (!mongoose.Types.ObjectId.isValid(subjectId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid subject ID"
            });
        }

        const exams = await Exam.find({ subject: subjectId })
            .populate('subject', 'subName subCode')
            .populate('class', 'sclassName')
            .populate('teacher', 'name')
            .sort({ createdAt: -1 });

        console.log(`Found ${exams.length} exams for subject ${subjectId}`);

        // Add computed fields for each exam
        const enrichedExams = exams.map(exam => {
            const examObj = exam.toObject();
            
            // Add availability status based on schedule type
            let isCurrentlyAvailable = false;
            let isUpcoming = false;
            let hasEnded = false;
            
            const now = new Date();
            
            if (exam.scheduleType === 'fixed') {
                if (exam.startTime && exam.endTime) {
                    isCurrentlyAvailable = now >= exam.startTime && now <= exam.endTime;
                    isUpcoming = now < exam.startTime;
                    hasEnded = now > exam.endTime;
                }
            } else {
                // Flexible exam - available anytime within the window
                if (exam.availableFrom && exam.availableUntil) {
                    isCurrentlyAvailable = now >= exam.availableFrom && now <= exam.availableUntil;
                    isUpcoming = now < exam.availableFrom;
                    hasEnded = now > exam.availableUntil;
                }
            }
            
            return {
                ...examObj,
                totalQuestions: examObj.questions.length,
                isCurrentlyAvailable,
                isUpcoming,
                hasEnded
            };
        });

        res.json({
            success: true,
            exams: enrichedExams,
            count: enrichedExams.length
        });

    } catch (error) {
        console.error("Error fetching exams:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Failed to fetch exams"
        });
    }
};

// Get exam by ID
const getExamById = async (req, res) => {
    try {
        const { examId } = req.params;
        console.log("Fetching exam with ID:", examId);

        if (!mongoose.Types.ObjectId.isValid(examId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid exam ID"
            });
        }

        const exam = await Exam.findById(examId)
            .populate('subject', 'subName subCode')
            .populate('class', 'sclassName')
            .populate('school', 'schoolName')
            .populate('teacher', 'name');

        if (!exam) {
            return res.status(404).json({
                success: false,
                error: "Exam not found"
            });
        }

        // Add computed fields
        const examObj = exam.toObject();
        const now = new Date();
        
        let isCurrentlyAvailable = false;
        let isUpcoming = false;
        let hasEnded = false;
        
        if (exam.scheduleType === 'fixed') {
            if (exam.startTime && exam.endTime) {
                isCurrentlyAvailable = now >= exam.startTime && now <= exam.endTime;
                isUpcoming = now < exam.startTime;
                hasEnded = now > exam.endTime;
            }
        } else {
            // Flexible exam
            if (exam.availableFrom && exam.availableUntil) {
                isCurrentlyAvailable = now >= exam.availableFrom && now <= exam.availableUntil;
                isUpcoming = now < exam.availableFrom;
                hasEnded = now > exam.availableUntil;
            }
        }

        const enrichedExam = {
            ...examObj,
            totalQuestions: examObj.questions.length,
            isCurrentlyAvailable,
            isUpcoming,
            hasEnded
        };

        console.log("Exam found:", exam._id);

        res.json({
            success: true,
            exam: enrichedExam
        });

    } catch (error) {
        console.error("Error fetching exam:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Failed to fetch exam"
        });
    }
};

// Submit exam result
// ✅ Enhanced submit exam result to prevent duplicate submissions
const submitExamResult = async (req, res) => {
    try {
        const { studentId, examId, answers, timeSpent } = req.body;
        
        console.log("=== EXAM SUBMISSION ===");
        console.log("Student ID:", studentId);
        console.log("Exam ID:", examId);
        console.log("Answers received:", answers);
        console.log("Time spent:", timeSpent);

        // Validate required fields
        if (!studentId || !examId || !answers) {
            return res.status(400).json({
                success: false,
                error: "Student ID, exam ID, and answers are required"
            });
        }

        // ✅ ENHANCED: Check if student has already submitted this exam
        const existingResult = await ExamResult.findOne({
            student: studentId,
            exam: examId
        });

        if (existingResult) {
            return res.status(400).json({
                success: false,
                error: "You have already submitted this exam. You cannot retake it.",
                isAlreadySubmitted: true,
                previousResult: {
                    percentage: existingResult.percentage,
                    passed: existingResult.passed,
                    endTime: existingResult.endTime,
                    obtainedMarks: existingResult.obtainedMarks,
                    totalMarks: existingResult.totalMarks
                }
            });
        }

        // Fetch exam details
        const exam = await Exam.findById(examId).populate('subject');
        if (!exam) {
            return res.status(404).json({
                success: false,
                error: "Exam not found"
            });
        }

        // Check if exam is available for taking
        const now = new Date();
        if (exam.scheduleType === 'fixed') {
            if (exam.startTime && exam.endTime) {
                if (now < exam.startTime || now > exam.endTime) {
                    return res.status(400).json({
                        success: false,
                        error: "Exam is not currently active"
                    });
                }
            }
        } else {
            // Flexible exam
            if (exam.availableFrom && exam.availableUntil) {
                if (now < exam.availableFrom || now > exam.availableUntil) {
                    return res.status(400).json({
                        success: false,
                        error: "Exam is not available at this time"
                    });
                }
            }
        }

        // Fetch student details
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                error: "Student not found"
            });
        }

        console.log("Exam questions count:", exam.questions.length);
        console.log("Total marks:", exam.totalMarks);

        // Calculate results
        let score = 0;
        let obtainedMarks = 0;
        const questionAnalysis = [];

        exam.questions.forEach((question, index) => {
            const questionId = question._id.toString();
            const userAnswer = answers[questionId];
            const isCorrect = userAnswer === question.correctAnswer;
            
            console.log(`Question ${index + 1}:`);
            console.log(`  ID: ${questionId}`);
            console.log(`  Correct Answer: ${question.correctAnswer}`);
            console.log(`  User Answer: ${userAnswer}`);
            console.log(`  Is Correct: ${isCorrect}`);
            console.log(`  Marks: ${question.marks || 1}`);
            
            if (isCorrect) {
                score++;
                obtainedMarks += question.marks || 1;
            }
            
            questionAnalysis.push({
                questionId: questionId,
                userAnswer: userAnswer || null,
                correctAnswer: question.correctAnswer,
                isCorrect: isCorrect,
                marks: question.marks || 1,
                marksObtained: isCorrect ? (question.marks || 1) : 0
            });
        });

        const totalQuestions = exam.questions.length;
        const percentage = Math.round((obtainedMarks / exam.totalMarks) * 100);
        const passed = percentage >= ((exam.passingMarks / exam.totalMarks) * 100);

        console.log("Final Results:");
        console.log(`Score: ${score}/${totalQuestions}`);
        console.log(`Marks: ${obtainedMarks}/${exam.totalMarks}`);
        console.log(`Percentage: ${percentage}%`);
        console.log(`Passed: ${passed}`);

        // Create exam result
        const examResult = new ExamResult({
            student: studentId,
            exam: examId,
            answers: answers,
            score: score,
            totalQuestions: totalQuestions,
            totalMarks: exam.totalMarks,
            obtainedMarks: obtainedMarks,
            percentage: percentage,
            passed: passed,
            timeSpent: timeSpent || 0,
            startTime: new Date(Date.now() - (timeSpent * 1000 || 0)),
            endTime: new Date(),
            questionAnalysis: questionAnalysis
        });

        const savedResult = await examResult.save();
        console.log("✅ Exam result saved:", savedResult._id);

        // Populate the saved result
        const populatedResult = await ExamResult.findById(savedResult._id)
            .populate('exam', 'title subject')
            .populate('student', 'name rollNum');

        res.json({
            success: true,
            message: "Exam submitted successfully",
            examResult: populatedResult,
            isFirstSubmission: true // Flag to indicate this is the first and only submission
        });

    } catch (error) {
        console.error("❌ Error submitting exam:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Failed to submit exam"
        });
    }
};
// Get exam results by subject
const getExamResultsBySubject = async (req, res) => {
    try {
        const { subjectId } = req.params;
        
        // Find all exams for this subject
        const exams = await Exam.find({ subject: subjectId }).select('_id');
        const examIds = exams.map(exam => exam._id);
        
        // Find all results for these exams
        const results = await ExamResult.find({ exam: { $in: examIds } })
            .populate('student', 'name rollNum')
            .populate('exam', 'title')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            results: results,
            count: results.length
        });

    } catch (error) {
        console.error("Error fetching exam results:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Failed to fetch exam results"
        });
    }
};

// Update exam
// Update the updateExam function - COMPLETELY FIXED
const updateExam = async (req, res) => {
    try {
        const { examId } = req.params;
        const updateData = { ...req.body };

        console.log("Updating exam:", examId);

        // Calculate totalMarks if questions are being updated
        if (updateData.questions) {
            const totalMarks = updateData.questions.reduce((sum, q) => sum + (parseInt(q.marks) || 1), 0);
            updateData.totalMarks = totalMarks;
            
            if (updateData.passingMarks) {
                updateData.passingMarks = Math.ceil(totalMarks * (parseInt(updateData.passingMarks) || 60) / 100);
            }
        }

        // Force scheduleType to flexible and explicitly set date fields to null
        updateData.scheduleType = 'flexible';
        updateData.startTime = null;
        updateData.endTime = null;
        updateData.availableFrom = null;
        updateData.availableUntil = null;

        const updatedExam = await Exam.findByIdAndUpdate(
            examId, 
            updateData, 
            { 
                new: true, 
                runValidators: true
            }
        ).populate('subject', 'subName subCode')
         .populate('class', 'sclassName')
         .populate('teacher', 'name');

        if (!updatedExam) {
            return res.status(404).json({
                success: false,
                error: "Exam not found"
            });
        }

        res.json({
            success: true,
            message: "Exam updated successfully",
            exam: updatedExam
        });

    } catch (error) {
        console.error("❌ Error updating exam:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Failed to update exam"
        });
    }
};

// Delete exam
const deleteExam = async (req, res) => {
    try {
        const { examId } = req.params;

        console.log("Deleting exam:", examId);

        // Check if exam exists
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({
                success: false,
                error: "Exam not found"
            });
        }

        // Delete all exam results for this exam
        await ExamResult.deleteMany({ exam: examId });
        console.log("Deleted exam results for exam:", examId);

        // Delete the exam
        await Exam.findByIdAndDelete(examId);
        console.log("Exam deleted:", examId);

        res.json({
            success: true,
            message: "Exam and all related results deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting exam:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Failed to delete exam"
        });
    }
};

module.exports = {
    addExam,
    getExamsBySubject,
    getExamById,
    submitExamResult,
    getExamResultsBySubject,
    updateExam,
    deleteExam
};