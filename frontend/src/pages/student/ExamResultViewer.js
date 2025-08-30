import React, { useEffect, useState } from 'react';
import { CheckCircle, X, HelpCircle, Award, Clock, Calendar, TrendingUp, ArrowLeft } from 'lucide-react';

const ExamResultViewer = () => {
    const [examResult, setExamResult] = useState(null);
    const [examDetails, setExamDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Mock current user and exam data - replace with your actual data source
    const currentUser = { _id: "student123", name: "John Doe" };
    const examId = "exam123"; // This would come from URL params in real app


    // API function to fetch exam details - FIXED
    const fetchExamDetails = async (examId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/exam/${examId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Add authorization header if needed
                    // 'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            console.log('API Response:', data); // Debug log
            
            if (data.success) {
                // ✅ FIXED: Return the exam data directly since your backend returns it at root level
                return data.exam || data; // Handle both nested and flat structures
            } else {
                throw new Error(data.error || 'Failed to fetch exam details');
            }
        } catch (err) {
            console.error('Error fetching exam details:', err);
            throw err;
        }
    };

    // API function to fetch exam result
    const fetchExamResult = async (examId, studentId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/exam-result/${examId}/${studentId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Add authorization header if needed
                    // 'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                return data.examResult || data;
            } else {
                throw new Error(data.error || 'Failed to fetch exam result');
            }
        } catch (err) {
            console.error('Error fetching exam result:', err);
            throw err;
        }
    };

    // Fetch data on component mount
    useEffect(() => {
        const loadExamData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // ✅ FIXED: Handle the actual response structure from your backend
                const examData = await fetchExamDetails(examId);
                console.log('Received exam data:', examData); // Debug log
                
                // Try to fetch exam result, but don't fail if it doesn't exist
                let resultData = null;
                try {
                    resultData = await fetchExamResult(examId, currentUser._id);
                } catch (resultError) {
                    console.log('No exam result found (student may not have taken the exam yet)');
                    // This is OK - student may not have taken the exam yet
                }
                
                setExamDetails(examData);
                setExamResult(resultData);
                
                // If no result data, create a mock result for the component to work
                if (!resultData) {
                    const mockResult = {
                        _id: "result123",
                        studentId: currentUser._id,
                        examId: examId,
                        answers: {},
                        score: 0,
                        totalQuestions: examData.questions?.length || 0,
                        timeSpent: 0,
                        submittedAt: new Date(),
                        percentage: 0
                    };
                    setExamResult(mockResult);
                }
                
            } catch (err) {
                setError(err.message);
                console.error('Error loading exam data:', err);
                
                // Fallback to mock data for demonstration
                const mockExamResult = {
                    _id: "result123",
                    studentId: currentUser._id,
                    examId: examId,
                    answers: {
                        "68ab54f3199329e1491fa64d": "2", // Paris (correct)
                        "68ab54f3199329e1491fa64e": "1", // 4 (correct)
                    },
                    score: 2,
                    totalQuestions: 2,
                    timeSpent: 1800, // 30 minutes in seconds
                    submittedAt: new Date('2024-03-15T14:30:00'),
                    percentage: 100
                };

                // ✅ FIXED: Use the actual structure from your backend response
                const mockExamDetails = {
                    _id: "68ab54f3199329e1491fa64c",
                    title: "gubjkmb",
                    description: "jbnm,",
                    subject: {
                        _id: "68a9909629c134b795a1b670",
                        subName: "BIOPHYSICS",
                        subCode: "1001"
                    },
                    timeLimit: 3600,
                    totalMarks: 2,
                    passingMarks: 60,
                    scheduleType: "flexible",
                    questions: [
                        {
                            _id: "68ab54f3199329e1491fa64d",
                            question: "What is the capital of France?",
                            options: ["London", "Berlin", "Paris", "Madrid"],
                            correctAnswer: "2", // Index-based (0,1,2,3)
                            marks: 1,
                            difficulty: "Medium",
                            category: "General",
                            explanation: ""
                        },
                        {
                            _id: "68ab54f3199329e1491fa64e",
                            question: "What is 2 + 2?",
                            options: ["3", "4", "5", "6"],
                            correctAnswer: "1", // Index-based (0,1,2,3)
                            marks: 1,
                            difficulty: "Medium",
                            category: "General",
                            explanation: ""
                        }
                    ],
                    isActive: true
                };

                console.log('Using mock data due to API error:', err.message);
                setExamResult(mockExamResult);
                setExamDetails(mockExamDetails);
            } finally {
                setLoading(false);
            }
        };

        loadExamData();
    }, [examId, currentUser._id]);

    const getScoreColor = (percentage) => {
        if (percentage >= 80) return 'text-green-600';
        if (percentage >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBgColor = (percentage) => {
        if (percentage >= 80) return 'bg-green-50 border-green-200';
        if (percentage >= 60) return 'bg-yellow-50 border-yellow-200';
        return 'bg-red-50 border-red-200';
    };

    const getGradeFromPercentage = (percentage) => {
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B+';
        if (percentage >= 60) return 'B';
        if (percentage >= 50) return 'C';
        return 'F';
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    // ✅ FIXED: Handle your backend's answer format (letter-based like "C" vs index-based)
    const isAnswerCorrect = (questionId, userAnswer, correctAnswer, question) => {
        // Handle multiple choice questions
        if (question.options && question.options.length > 0) {
            // Convert letter-based answers (A, B, C, D) to index-based (0, 1, 2, 3)
            const convertLetterToIndex = (letter) => {
                if (typeof letter === 'string' && letter.length === 1) {
                    const upperLetter = letter.toUpperCase();
                    if (upperLetter >= 'A' && upperLetter <= 'Z') {
                        return (upperLetter.charCodeAt(0) - 65).toString();
                    }
                }
                return letter;
            };
            
            const normalizedUserAnswer = convertLetterToIndex(userAnswer);
            const normalizedCorrectAnswer = convertLetterToIndex(correctAnswer);
            
            return normalizedUserAnswer === normalizedCorrectAnswer;
        }
        // Handle short answer questions
        return userAnswer?.toLowerCase().trim() === correctAnswer?.toLowerCase().trim();
    };

    const calculatePercentage = (score, total) => {
        return Math.round((score / total) * 100);
    };

    const handleBack = () => {
        // In a real app with router, this would be: navigate(-1)
        window.history.back();
    };

    const handleDashboard = () => {
        // In a real app with router, this would be: navigate('/dashboard')
        console.log('Navigate to dashboard');
        alert('Navigation to dashboard - implement with your routing system');
    };

    const handleReview = () => {
        // In a real app with router, this would be: navigate(`/exams/${examId}/review`)
        console.log('Navigate to review');
        alert('Navigation to review - implement with your routing system');
    };

    const handleRetry = () => {
        window.location.reload();
    };

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-300 rounded w-1/2 mb-4"></div>
                            <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        </div>
                        <div className="text-center mt-4">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent border-solid rounded-full animate-spin mx-auto"></div>
                            <p className="text-gray-600 mt-2">Loading exam results...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Show error state (but still show mock data if available)
    if (error && !examResult) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <X className="h-6 w-6 text-red-600 mr-2" />
                            <p className="text-red-800">
                                {error || 'Failed to load exam results. Please try again.'}
                            </p>
                        </div>
                        <button 
                            onClick={handleRetry}
                            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!examResult || !examDetails) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <HelpCircle className="h-6 w-6 text-yellow-600 mr-2" />
                            <p className="text-yellow-800">No exam results found.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Calculate percentage if not provided
    const percentage = examResult.percentage || calculatePercentage(examResult.score, examResult.totalQuestions || examDetails.questions?.length);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* API Error Warning (if using mock data) */}
                {error && (
                    <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center text-sm text-yellow-800">
                            <HelpCircle className="h-4 w-4 mr-2" />
                            <span>Using demo data - API connection failed: {error}</span>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 flex-1">Exam Results</h1>
                </div>

                {/* Exam Info Card */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{examDetails.title}</h2>
                    <p className="text-gray-600 mb-4">
                        Subject: {examDetails.subject?.subName || examDetails.subject?.name || examDetails.subject || 'N/A'}
                        {examDetails.subject?.subCode && ` (${examDetails.subject.subCode})`}
                    </p>
                    {examDetails.description && (
                        <p className="text-gray-600 mb-4">{examDetails.description}</p>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="text-sm text-gray-500">Submitted</p>
                                <p className="font-medium">
                                    {examResult.submittedAt 
                                        ? new Date(examResult.submittedAt).toLocaleDateString()
                                        : new Date().toLocaleDateString()
                                    }
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="text-sm text-gray-500">Time Taken</p>
                                <p className="font-medium">
                                    {examResult.timeSpent ? formatTime(examResult.timeSpent) : 'N/A'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <HelpCircle className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="text-sm text-gray-500">Questions</p>
                                <p className="font-medium">
                                    {examResult.totalQuestions || examDetails.questions?.length || 0}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Award className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="text-sm text-gray-500">Total Score</p>
                                <p className="font-medium">
                                    {examResult.score}/{examResult.totalQuestions || examDetails.questions?.length || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Score Summary Card */}
                <div className={`rounded-lg shadow-lg p-6 mb-6 border-2 ${getScoreBgColor(percentage)}`}>
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="h-6 w-6 text-blue-600" />
                        <h2 className="text-2xl font-bold text-gray-900">Your Score</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                        <div className="text-center">
                            <div className={`text-6xl font-bold ${getScoreColor(percentage)} mb-2`}>
                                {percentage}%
                            </div>
                            <div className="text-3xl font-bold text-gray-700 mb-2">
                                {getGradeFromPercentage(percentage)}
                            </div>
                            <p className="text-gray-600">
                                {examResult.score}/{examResult.totalQuestions || examDetails.questions?.length || 0} Correct
                            </p>
                        </div>
                        
                        <div className="md:col-span-2">
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-2">
                                    Progress: {examResult.score}/{examResult.totalQuestions || examDetails.questions?.length || 0}
                                </p>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className={`h-3 rounded-full transition-all duration-500 ${
                                            percentage >= 80 ? 'bg-green-500' :
                                            percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                            
                            <div className="flex gap-4 flex-wrap">
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    <CheckCircle className="h-4 w-4" />
                                    {examResult.score} Correct
                                </span>
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                    <X className="h-4 w-4" />
                                    {(examResult.totalQuestions || examDetails.questions?.length || 0) - examResult.score} Incorrect
                                </span>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    percentage >= 60 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {percentage >= 60 ? 'PASSED' : 'FAILED'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Results */}
                {examDetails.questions && examDetails.questions.length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Question by Question Analysis</h2>
                        
                        <div className="space-y-6">
                            {examDetails.questions.map((question, index) => {
                                const userAnswer = examResult.answers?.[question._id];
                                const isCorrect = isAnswerCorrect(question._id, userAnswer, question.correctAnswer, question);
                                
                                return (
                                    <div key={question._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0 mt-1">
                                                {isCorrect ? (
                                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                                ) : (
                                                    <X className="h-6 w-6 text-red-600" />
                                                )}
                                            </div>
                                            
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        Question {index + 1}
                                                    </h3>
                                                </div>
                                                
                                                <p className="text-gray-800 mb-4">{question.question}</p>
                                                
                                                {/* Multiple Choice Options */}
                                                {question.options && question.options.length > 0 && (
                                                    <div className="mb-4">
                                                        <p className="text-sm font-medium text-gray-600 mb-2">Options:</p>
                                                        <div className="space-y-1">
                                                            {question.options.map((option, optIndex) => {
                                                                // Convert letter-based answers to index for comparison
                                                                const convertLetterToIndex = (letter) => {
                                                                    if (typeof letter === 'string' && letter.length === 1) {
                                                                        const upperLetter = letter.toUpperCase();
                                                                        if (upperLetter >= 'A' && upperLetter <= 'Z') {
                                                                            return upperLetter.charCodeAt(0) - 65;
                                                                        }
                                                                    }
                                                                    return parseInt(letter) || letter;
                                                                };
                                                                
                                                                const normalizedUserAnswer = convertLetterToIndex(userAnswer);
                                                                const normalizedCorrectAnswer = convertLetterToIndex(question.correctAnswer);
                                                                
                                                                const isUserAnswer = optIndex === normalizedUserAnswer;
                                                                const isCorrectOption = optIndex === normalizedCorrectAnswer;
                                                                
                                                                return (
                                                                    <div 
                                                                        key={optIndex}
                                                                        className={`p-2 rounded ${
                                                                            isCorrectOption ? 'bg-green-100 text-green-800' :
                                                                            isUserAnswer ? 'bg-red-100 text-red-800' :
                                                                            'text-gray-700'
                                                                        }`}
                                                                    >
                                                                        <span className="font-medium">
                                                                            {String.fromCharCode(65 + optIndex)}.
                                                                        </span>{' '}
                                                                        {option}
                                                                        {isUserAnswer && (
                                                                            <span className="ml-2 text-xs font-medium">
                                                                                (Your answer)
                                                                            </span>
                                                                        )}
                                                                        {isCorrectOption && (
                                                                            <span className="ml-2 text-green-600">✓</span>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* Answer Summary */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-600 mb-1">Your Answer:</p>
                                                        <p className={`font-medium ${
                                                            isCorrect ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                            {question.options && question.options.length > 0 && userAnswer !== undefined
                                                                ? (() => {
                                                                    const convertLetterToIndex = (letter) => {
                                                                        if (typeof letter === 'string' && letter.length === 1) {
                                                                            const upperLetter = letter.toUpperCase();
                                                                            if (upperLetter >= 'A' && upperLetter <= 'Z') {
                                                                                return upperLetter.charCodeAt(0) - 65;
                                                                            }
                                                                        }
                                                                        return parseInt(letter) || letter;
                                                                    };
                                                                    const normalizedIndex = convertLetterToIndex(userAnswer);
                                                                    const optionText = question.options[normalizedIndex];
                                                                    return optionText 
                                                                        ? `${String.fromCharCode(65 + normalizedIndex)}. ${optionText}`
                                                                        : 'Invalid option';
                                                                })()
                                                                : userAnswer || 'No answer'
                                                            }
                                                        </p>
                                                    </div>
                                                    
                                                    {!isCorrect && (
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-600 mb-1">Correct Answer:</p>
                                                            <p className="font-medium text-green-600">
                                                                {question.options && question.options.length > 0
                                                                    ? (() => {
                                                                        const convertLetterToIndex = (letter) => {
                                                                            if (typeof letter === 'string' && letter.length === 1) {
                                                                                const upperLetter = letter.toUpperCase();
                                                                                if (upperLetter >= 'A' && upperLetter <= 'Z') {
                                                                                    return upperLetter.charCodeAt(0) - 65;
                                                                                }
                                                                            }
                                                                            return parseInt(letter) || letter;
                                                                        };
                                                                        const correctIndex = convertLetterToIndex(question.correctAnswer);
                                                                        const correctOption = question.options[correctIndex];
                                                                        return correctOption
                                                                            ? `${String.fromCharCode(65 + correctIndex)}. ${correctOption}`
                                                                            : question.correctAnswer;
                                                                    })()
                                                                    : question.correctAnswer
                                                                }
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 flex flex-wrap gap-4 justify-center">
                    <button
                        onClick={handleDashboard}
                        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                    <button
                        onClick={handleReview}
                        className="px-6 py-3 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
                    >
                        Review Questions
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExamResultViewer;
