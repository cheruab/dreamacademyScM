import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Container,
    Paper,
    Typography,
    Button,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    LinearProgress,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Chip,
    Grid,
    IconButton,
    CircularProgress,
    Divider,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import TimerIcon from '@mui/icons-material/Timer';
import QuizIcon from '@mui/icons-material/Quiz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import FlagIcon from '@mui/icons-material/Flag';
import ErrorIcon from '@mui/icons-material/Error';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getExamById, submitExamResult } from '../../redux/userRelated/userHandle';

// Theme configuration (same as before)
const examTheme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#dc004e',
            light: '#ff5983',
            dark: '#9a0036',
            contrastText: '#ffffff',
        },
        success: {
            main: '#2e7d32',
            light: '#4caf50',
            dark: '#1b5e20',
            contrastText: '#ffffff',
        },
        warning: {
            main: '#ed6c02',
            light: '#ff9800',
            dark: '#e65100',
            contrastText: '#ffffff',
        },
        error: {
            main: '#d32f2f',
            light: '#f44336',
            dark: '#c62828',
            contrastText: '#ffffff',
        },
        info: {
            main: '#0288d1',
            light: '#03dac6',
            dark: '#01579b',
            contrastText: '#ffffff',
        },
        grey: {
            50: '#fafafa',
            100: '#f5f5f5',
            200: '#eeeeee',
            300: '#e0e0e0',
            400: '#bdbdbd',
            500: '#9e9e9e',
            600: '#757575',
            700: '#616161',
            800: '#424242',
            900: '#212121',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                },
            },
        },
    },
});

const ExamTaking = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    // Redux state
    const { response, loading, error, currentUser } = useSelector((state) => state.user);
    
    // Component state
    const [exam, setExam] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(null);
    const [isStarted, setIsStarted] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);
    const [results, setResults] = useState(null);
    const [examError, setExamError] = useState(null);
    const [startTime, setStartTime] = useState(null);
    
    // NEW STATE FOR COMPLETION CHECK
    const [hasCompletedExam, setHasCompletedExam] = useState(false);
    const [previousResult, setPreviousResult] = useState(null);
    const [viewMode, setViewMode] = useState(false); // true = viewing only, false = taking exam

    // Check if student has already completed this exam
    useEffect(() => {
        if (examId && currentUser?._id) {
            checkExamCompletion();
        }
    }, [examId, currentUser]);

    // Fetch exam data from database
    useEffect(() => {
        if (examId) {
            console.log("Fetching exam with ID:", examId);
            dispatch(getExamById(examId));
        }
    }, [examId, dispatch]);

    // Check if student has already completed this exam
    const checkExamCompletion = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL || 'http://localhost:5000'}/exam/${examId}/completed/${currentUser._id}`);
            const data = await response.json();
            
            if (data.success && data.isCompleted) {
                setHasCompletedExam(true);
                setPreviousResult(data.result);
                setViewMode(true);
                console.log('Student has already completed this exam:', data.result);
            } else {
                setHasCompletedExam(false);
                setViewMode(false);
            }
        } catch (error) {
            console.error('Error checking exam completion:', error);
            // If there's an error, assume exam not completed to avoid blocking legitimate attempts
            setHasCompletedExam(false);
            setViewMode(false);
        }
    };

    // Handle Redux response
    useEffect(() => {
        if (response) {
            console.log("Redux response:", response);
            
            if (response.status === 'examFetched' && response.exam) {
                const fetchedExam = response.exam;
                setExam(fetchedExam);
                console.log("Exam loaded:", fetchedExam);
            } else if (response.status === 'examSubmitted') {
                // Handle exam submission success
                const submissionResult = response.result;
                if (submissionResult) {
                    // Calculate detailed results
                    const calculatedResults = calculateDetailedResults(exam, answers);
                    setResults(calculatedResults);
                    setIsFinished(true);
                    setShowSubmitDialog(false);
                    setHasCompletedExam(true); // Mark as completed
                }
            }
        }
    }, [response, exam, answers]);

    // Handle Redux errors
    useEffect(() => {
        if (error) {
            console.error("Redux error:", error);
            setExamError(error);
        }
    }, [error]);

    // Timer countdown - only runs when exam is started and NOT in view mode
    useEffect(() => {
        if (isStarted && !isFinished && !viewMode && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleAutoSubmit();
                        return 0;
                    }
                    if (prev <= 300 && prev % 60 === 0) { // Show warning in last 5 minutes
                        setShowWarning(true);
                        setTimeout(() => setShowWarning(false), 3000);
                    }
                    return prev - 1;
                });
            }, 1000);
            
            return () => clearInterval(timer);
        }
    }, [isStarted, isFinished, viewMode, timeLeft]);

    const formatTime = (seconds) => {
        if (seconds === null) return '--:--';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const getTimeColor = () => {
        if (!timeLeft) return 'primary';
        if (timeLeft <= 300) return 'error'; // Red for last 5 minutes
        if (timeLeft <= 600) return 'warning'; // Orange for last 10 minutes
        return 'primary';
    };

    const handleStartExam = () => {
        if (!exam || viewMode || hasCompletedExam) return;
        
        // Set the timer based on exam time limit
        const examTimeLimit = exam.timeLimit || 3600; // Default 1 hour
        setTimeLeft(examTimeLimit);
        setStartTime(new Date()); // Record actual start time
        setIsStarted(true);
        
        console.log(`Exam started with ${examTimeLimit} seconds (${Math.floor(examTimeLimit / 60)} minutes)`);
    };

    const handleAnswerChange = (questionId, answer) => {
        // Don't allow answer changes in view mode
        if (viewMode) return;
        
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const handleNext = () => {
        if (currentQuestion < exam.questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1);
        }
    };

    const handleQuestionJump = (index) => {
        setCurrentQuestion(index);
    };

    const toggleFlag = (questionIndex) => {
        // Don't allow flagging in view mode
        if (viewMode) return;
        
        setFlaggedQuestions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(questionIndex)) {
                newSet.delete(questionIndex);
            } else {
                newSet.add(questionIndex);
            }
            return newSet;
        });
    };

    const calculateDetailedResults = (exam, answers) => {
        let correct = 0;
        let incorrect = 0;
        let unanswered = 0;
        const questionResults = [];

        if (!exam || !exam.questions) {
            return { correct: 0, incorrect: 0, unanswered: 0, percentage: 0, questionResults: [] };
        }

        exam.questions.forEach((question, index) => {
            const userAnswer = answers[question._id];
            const isCorrect = userAnswer === question.correctAnswer;
            
            const questionResult = {
                question: question.question,
                options: question.options,
                userAnswer,
                correctAnswer: question.correctAnswer,
                isCorrect,
                explanation: question.explanation || '',
                marks: question.marks || 1
            };
            
            questionResults.push(questionResult);

            if (!userAnswer) {
                unanswered++;
            } else if (isCorrect) {
                correct++;
            } else {
                incorrect++;
            }
        });

        const percentage = Math.round((correct / exam.questions.length) * 100);
        return { correct, incorrect, unanswered, percentage, questionResults };
    };

    const handleSubmitExam = () => {
        if (!exam || !startTime || viewMode) return;
        
        const calculatedResults = calculateDetailedResults(exam, answers);
        
        // Calculate actual time spent
        const endTime = new Date();
        const timeSpentMs = endTime - startTime;
        const timeSpentSeconds = Math.floor(timeSpentMs / 1000);
        
        console.log('=== EXAM SUBMISSION DEBUG ===');
        console.log('Exam ID:', exam._id);
        console.log('Total Questions:', exam.questions.length);
        console.log('Time spent:', timeSpentSeconds, 'seconds');
        console.log('Calculated Results:', calculatedResults);
        
        // Prepare submission data
        const submissionData = {
            studentId: currentUser._id,
            examId: exam._id,
            answers: answers,
            timeSpent: timeSpentSeconds,
            score: calculatedResults.correct,
            totalQuestions: exam.questions.length,
            percentage: calculatedResults.percentage
        };

        console.log('Submission Data:', submissionData);
        
        // Submit to backend via Redux
        dispatch(submitExamResult(submissionData));
        
        // Set local results for immediate display
        setResults(calculatedResults);
        setIsFinished(true);
        setShowSubmitDialog(false);
    };

    const handleAutoSubmit = () => {
        handleSubmitExam();
        // Show alert that time ran out
        setTimeout(() => {
            alert('Time has expired! Your exam has been automatically submitted.');
        }, 500);
    };

    const getAnsweredCount = () => {
        return Object.keys(answers).length;
    };

    const isExamAvailable = () => {
        // For flexible scheduling, always return true if exam exists and not in view mode
        return Boolean(exam) && !viewMode;
    };

    const getLetterFromIndex = (index) => {
        return String.fromCharCode(65 + index); // A, B, C, D, etc.
    };

    // Get previous answers for view mode
    const getPreviousAnswer = (questionId) => {
        if (!previousResult || !previousResult.answers) return null;
        
        // Handle both Map and regular object formats
        if (previousResult.answers instanceof Map) {
            return previousResult.answers.get(questionId);
        } else if (typeof previousResult.answers === 'object') {
            return previousResult.answers[questionId];
        }
        return null;
    };

    return (
        <ThemeProvider theme={examTheme}>
            {/* Loading state */}
            {loading && !exam && (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh', gap: 2 }}>
                    <CircularProgress />
                    <Typography>Loading exam...</Typography>
                </Box>
            )}

            {/* Error state */}
            {examError && !exam && (
                <Container maxWidth="md" sx={{ mt: 4 }}>
                    <Paper elevation={3} sx={{ p: 4 }}>
                        <Box textAlign="center">
                            <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
                            <Typography variant="h5" gutterBottom color="error">
                                Failed to Load Exam
                            </Typography>
                            <Typography variant="body1" color="text.secondary" paragraph>
                                {examError}
                            </Typography>
                            <Button 
                                variant="contained" 
                                onClick={() => navigate('/Student/subjects')}
                            >
                                Back to Subjects
                            </Button>
                        </Box>
                    </Paper>
                </Container>
            )}

            {/* Exam not found or not available */}
            {!loading && !exam && !examError && (
                <Container maxWidth="md" sx={{ mt: 4 }}>
                    <Paper elevation={3} sx={{ p: 4 }}>
                        <Box textAlign="center">
                            <QuizIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h5" gutterBottom>
                                Exam Not Available
                            </Typography>
                            <Typography variant="body1" color="text.secondary" paragraph>
                                The requested exam could not be found or is not currently available.
                            </Typography>
                            <Button 
                                variant="contained" 
                                onClick={() => navigate('/Student/subjects')}
                            >
                                Back to Subjects
                            </Button>
                        </Box>
                    </Paper>
                </Container>
            )}

            {/* Pre-exam screen - Show different content if already completed */}
            {exam && !isStarted && !isFinished && (
                <Container maxWidth="md" sx={{ mt: 4 }}>
                    <Paper elevation={3} sx={{ p: 4 }}>
                        <Box textAlign="center" mb={3}>
                            <QuizIcon sx={{ fontSize: 64, color: viewMode ? 'info.main' : 'primary.main', mb: 2 }} />
                            <Typography variant="h4" gutterBottom>
                                {exam.title}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" paragraph>
                                {exam.description || "Good luck on your exam!"}
                            </Typography>
                            
                            {/* Show completion status */}
                            {hasCompletedExam && (
                                <Alert severity="info" sx={{ mb: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        ✅ You have already completed this exam
                                    </Typography>
                                    {previousResult && (
                                        <Typography variant="body2">
                                            Your score: {previousResult.percentage}% 
                                            ({previousResult.passed ? 'PASSED' : 'FAILED'}) - 
                                            Completed on {new Date(previousResult.endTime).toLocaleDateString()}
                                        </Typography>
                                    )}
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        You can review the questions and your answers below.
                                    </Typography>
                                </Alert>
                            )}
                        </Box>

                        <Grid container spacing={3} mb={4}>
                            <Grid item xs={12} md={4}>
                                <Card variant="outlined">
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <TimerIcon color={viewMode ? "disabled" : "primary"} sx={{ fontSize: 32, mb: 1 }} />
                                        <Typography variant="h6">Time Limit</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {formatTime(exam.timeLimit || 3600)}
                                        </Typography>
                                        {viewMode && (
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Time spent: {formatTime(previousResult?.timeSpent || 0)}
                                            </Typography>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Card variant="outlined">
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <QuizIcon color={viewMode ? "disabled" : "secondary"} sx={{ fontSize: 32, mb: 1 }} />
                                        <Typography variant="h6">Questions</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {exam.questions?.length || 0} questions
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Card variant="outlined">
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <CheckCircleIcon color={viewMode ? "disabled" : "success"} sx={{ fontSize: 32, mb: 1 }} />
                                        <Typography variant="h6">Passing Score</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {exam.passingMarks || 60}%
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {!viewMode ? (
                            <Alert severity="info" sx={{ mb: 3 }}>
                                <strong>Flexible Exam Instructions:</strong>
                                <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                                    <li>You can start this exam anytime you're ready</li>
                                    <li>The timer ({formatTime(exam.timeLimit || 3600)}) will start when you click "Start Exam"</li>
                                    <li>You can navigate between questions and flag them for review</li>
                                    <li>Your progress will be saved automatically</li>
                                    <li>You'll see your results immediately after submission</li>
                                    <li><strong>Note: You can only take this exam once!</strong></li>
                                </ul>
                            </Alert>
                        ) : (
                            <Alert severity="warning" sx={{ mb: 3 }}>
                                <strong>Review Mode:</strong>
                                <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                                    <li>You are viewing this exam in review mode only</li>
                                    <li>You have already submitted your answers and cannot change them</li>
                                    <li>Navigate through questions to see your responses and the correct answers</li>
                                    <li>Use this to study and understand the material better</li>
                                </ul>
                            </Alert>
                        )}

                        <Box textAlign="center">
                            <Button
                                variant="contained"
                                size="large"
                                onClick={viewMode ? () => setIsStarted(true) : handleStartExam}
                                startIcon={viewMode ? <VisibilityIcon /> : <QuizIcon />}
                                sx={{ minWidth: 200 }}
                                disabled={!viewMode && (!isExamAvailable() || hasCompletedExam)}
                                color={viewMode ? 'info' : 'primary'}
                            >
                                {viewMode ? 'Review Exam' : 'Start Exam'}
                            </Button>
                        </Box>
                    </Paper>
                </Container>
            )}

            {/* Results screen with detailed question review */}
            {isFinished && results && (
                <Container maxWidth="lg" sx={{ mt: 4 }}>
                    <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                        <Box textAlign="center" mb={4}>
                            <CheckCircleIcon 
                                sx={{ 
                                    fontSize: 80, 
                                    color: results.percentage >= (exam?.passingMarks || 60) ? 'success.main' : 'error.main',
                                    mb: 2 
                                }} 
                            />
                            <Typography variant="h4" gutterBottom>
                                Exam Completed!
                            </Typography>
                            <Typography variant="h2" sx={{ 
                                color: results.percentage >= (exam?.passingMarks || 60) ? 'success.main' : 'error.main',
                                fontWeight: 'bold'
                            }}>
                                {results.percentage}%
                            </Typography>
                        </Box>

                        <Grid container spacing={3} mb={4}>
                            <Grid item xs={3}>
                                <Card variant="outlined">
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <Typography variant="h3" color="success.main">
                                            {results.correct}
                                        </Typography>
                                        <Typography variant="body2">Correct</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={3}>
                                <Card variant="outlined">
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <Typography variant="h3" color="error.main">
                                            {results.incorrect}
                                        </Typography>
                                        <Typography variant="body2">Incorrect</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={3}>
                                <Card variant="outlined">
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <Typography variant="h3" color="warning.main">
                                            {results.unanswered}
                                        </Typography>
                                        <Typography variant="body2">Unanswered</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={3}>
                                <Card variant="outlined">
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <Typography variant="h3" color="primary.main">
                                            {exam?.questions?.length || 0}
                                        </Typography>
                                        <Typography variant="body2">Total</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        <Alert severity={results.percentage >= (exam?.passingMarks || 60) ? "success" : "error"} sx={{ mb: 3 }}>
                            {results.percentage >= (exam?.passingMarks || 60)
                                ? "🎉 Congratulations! You passed the exam." 
                                : `You didn't meet the passing score of ${exam?.passingMarks || 60}%. You cannot retake this exam, but you can review the questions to learn from them.`
                            }
                        </Alert>

                        <Box textAlign="center" mb={4}>
                            <Button
                                variant="contained"
                                onClick={() => navigate('/Student/subjects')}
                                sx={{ mr: 2 }}
                            >
                                Back to Subjects
                            </Button>
                        </Box>
                    </Paper>

                    {/* Detailed Question Review - Same as before */}
                    <Paper elevation={3} sx={{ p: 4 }}>
                        <Typography variant="h5" gutterBottom mb={3}>
                            📋 Detailed Question Review
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Review your answers for each question. Correct answers are highlighted in green.
                            </Typography>
                        </Box>

                        {results.questionResults && results.questionResults.map((questionResult, index) => (
                            <Accordion key={index} sx={{ mb: 2 }}>
                                <AccordionSummary 
                                    expandIcon={<ExpandMoreIcon />}
                                    sx={{
                                        backgroundColor: questionResult.isCorrect 
                                            ? 'success.light' 
                                            : questionResult.userAnswer 
                                                ? 'error.light' 
                                                : 'warning.light',
                                        '&:hover': {
                                            backgroundColor: questionResult.isCorrect 
                                                ? 'success.main' 
                                                : questionResult.userAnswer 
                                                    ? 'error.main' 
                                                    : 'warning.main',
                                        }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <Box sx={{ mr: 2 }}>
                                            {questionResult.isCorrect ? (
                                                <CheckCircleIcon sx={{ color: 'success.dark' }} />
                                            ) : questionResult.userAnswer ? (
                                                <ErrorIcon sx={{ color: 'error.dark' }} />
                                            ) : (
                                                <WarningIcon sx={{ color: 'warning.dark' }} />
                                            )}
                                        </Box>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="h6" sx={{ color: 'text.primary' }}>
                                                Question {index + 1} - {questionResult.marks || 1} mark{(questionResult.marks || 1) > 1 ? 's' : ''}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                {questionResult.isCorrect ? 'Correct' : questionResult.userAnswer ? 'Incorrect' : 'Not Answered'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Box sx={{ p: 2 }}>
                                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                                            {questionResult.question}
                                        </Typography>
                                        
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="subtitle2" gutterBottom>
                                                Answer Options:
                                            </Typography>
                                            
                                            {questionResult.options && questionResult.options.map((option, optIndex) => {
                                                const optionLetter = getLetterFromIndex(optIndex);
                                                const isUserAnswer = questionResult.userAnswer === optionLetter;
                                                const isCorrectAnswer = questionResult.correctAnswer === optionLetter;
                                                
                                                return (
                                                    <Paper
                                                        key={optIndex}
                                                        variant="outlined"
                                                        sx={{
                                                            p: 2,
                                                            mb: 1,
                                                            backgroundColor: isCorrectAnswer 
                                                                ? 'success.light' 
                                                                : isUserAnswer && !isCorrectAnswer 
                                                                    ? 'error.light' 
                                                                    : 'background.paper',
                                                            border: isUserAnswer || isCorrectAnswer 
                                                                ? 2 
                                                                : 1,
                                                            borderColor: isCorrectAnswer 
                                                                ? 'success.main' 
                                                                : isUserAnswer 
                                                                    ? 'error.main' 
                                                                    : 'divider'
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                            <Typography variant="body1">
                                                                <strong>{optionLetter}.</strong> {option}
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                                {isUserAnswer && (
                                                                    <Chip 
                                                                        label="Your Answer" 
                                                                        size="small" 
                                                                        color={isCorrectAnswer ? 'success' : 'error'}
                                                                        variant="outlined"
                                                                    />
                                                                )}
                                                                {isCorrectAnswer && (
                                                                    <Chip 
                                                                        label="Correct Answer" 
                                                                        size="small" 
                                                                        color="success"
                                                                        icon={<CheckCircleIcon />}
                                                                    />
                                                                )}
                                                            </Box>
                                                        </Box>
                                                    </Paper>
                                                );
                                            })}
                                        </Box>

                                        {questionResult.explanation && (
                                            <Box sx={{ mt: 3, p: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
                                                <Typography variant="subtitle2" gutterBottom>
                                                    💡 Explanation:
                                                </Typography>
                                                <Typography variant="body2">
                                                    {questionResult.explanation}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        ))}

                        <Box textAlign="center" mt={4}>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/Student/subjects')}
                                size="large"
                            >
                                Return to Subjects
                            </Button>
                        </Box>
                    </Paper>
                </Container>
            )}

            {/* Exam taking/viewing interface */}
            {exam && isStarted && !isFinished && (
                <Container maxWidth="lg" sx={{ mt: 2 }}>
                    {/* Header with timer and progress - Modified for view mode */}
                    <Paper elevation={2} sx={{ p: 2, mb: 3, position: 'sticky', top: 0, zIndex: 100 }}>
                        <Grid container alignItems="center" justifyContent="space-between">
                            <Grid item>
                                <Typography variant="h6">
                                    {exam.title} {viewMode && <Chip label="REVIEW MODE" color="info" size="small" sx={{ ml: 1 }} />}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Question {currentQuestion + 1} of {exam.questions.length}
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Box display="flex" alignItems="center" gap={2}>
                                    {!viewMode && (
                                        <>
                                            <Chip
                                                icon={<TimerIcon />}
                                                label={formatTime(timeLeft)}
                                                color={getTimeColor()}
                                                variant="outlined"
                                            />
                                            <Button
                                                variant="contained"
                                                color="error"
                                                onClick={() => setShowSubmitDialog(true)}
                                            >
                                                Submit Exam
                                            </Button>
                                        </>
                                    )}
                                    {viewMode && previousResult && (
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Chip
                                                label={`Your Score: ${previousResult.percentage}%`}
                                                color={previousResult.passed ? 'success' : 'error'}
                                                variant="outlined"
                                            />
                                            <Button
                                                variant="outlined"
                                                startIcon={<ArrowBackIcon />}
                                                onClick={() => navigate('/Student/subjects')}
                                            >
                                                Back to Subjects
                                            </Button>
                                        </Box>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                        {!viewMode && (
                            <LinearProgress 
                                variant="determinate" 
                                value={(getAnsweredCount() / exam.questions.length) * 100}
                                sx={{ mt: 1 }}
                            />
                        )}
                    </Paper>

                    {/* Time warning - Only show if not in view mode */}
                    {showWarning && !viewMode && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            <WarningIcon sx={{ mr: 1 }} />
                            Warning: Only {Math.floor(timeLeft / 60)} minutes remaining!
                        </Alert>
                    )}

                    {/* Review mode alert */}
                    {viewMode && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            <VisibilityIcon sx={{ mr: 1 }} />
                            You are reviewing your completed exam. Your answers are shown below with correct answers highlighted.
                        </Alert>
                    )}

                    <Grid container spacing={3}>
                        {/* Question panel */}
                        <Grid item xs={12} md={8}>
                            <Paper elevation={3} sx={{ p: 3 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                    <Typography variant="h6">
                                        Question {currentQuestion + 1}
                                    </Typography>
                                    {!viewMode && (
                                        <IconButton
                                            onClick={() => toggleFlag(currentQuestion)}
                                            color={flaggedQuestions.has(currentQuestion) ? "warning" : "default"}
                                        >
                                            <FlagIcon />
                                        </IconButton>
                                    )}
                                </Box>

                                <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                                    {exam.questions[currentQuestion].question}
                                </Typography>

                                <FormControl component="fieldset" sx={{ width: '100%' }}>
                                    <RadioGroup
                                        value={viewMode ? 
                                            (getPreviousAnswer(exam.questions[currentQuestion]._id) || '') :
                                            (answers[exam.questions[currentQuestion]._id] || '')
                                        }
                                        onChange={(e) => {
                                            if (!viewMode) {
                                                const selectedValue = e.target.value;
                                                handleAnswerChange(exam.questions[currentQuestion]._id, selectedValue);
                                            }
                                        }}
                                    >
                                        {exam.questions[currentQuestion].options.map((option, index) => {
                                            const letter = String.fromCharCode(65 + index); // A, B, C, D...
                                            const isCorrectAnswer = exam.questions[currentQuestion].correctAnswer === letter;
                                            const userAnswer = viewMode ? 
                                                getPreviousAnswer(exam.questions[currentQuestion]._id) :
                                                answers[exam.questions[currentQuestion]._id];
                                            const isUserAnswer = userAnswer === letter;
                                            
                                            return (
                                                <Paper
                                                    key={index}
                                                    variant="outlined"
                                                    sx={{
                                                        p: 1,
                                                        mb: 1,
                                                        backgroundColor: viewMode ? (
                                                            isCorrectAnswer ? 'success.light' :
                                                            isUserAnswer && !isCorrectAnswer ? 'error.light' :
                                                            'background.paper'
                                                        ) : 'background.paper',
                                                        border: viewMode && (isCorrectAnswer || isUserAnswer) ? 2 : 1,
                                                        borderColor: viewMode ? (
                                                            isCorrectAnswer ? 'success.main' :
                                                            isUserAnswer ? 'error.main' :
                                                            'divider'
                                                        ) : 'divider'
                                                    }}
                                                >
                                                    <FormControlLabel
                                                        value={letter}
                                                        control={<Radio disabled={viewMode} />}
                                                        label={
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                                                <Typography>
                                                                    {letter}. {option}
                                                                </Typography>
                                                                {viewMode && (
                                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                                        {isUserAnswer && (
                                                                            <Chip 
                                                                                label="Your Answer" 
                                                                                size="small" 
                                                                                color={isCorrectAnswer ? 'success' : 'error'}
                                                                                variant="outlined"
                                                                            />
                                                                        )}
                                                                        {isCorrectAnswer && (
                                                                            <Chip 
                                                                                label="Correct" 
                                                                                size="small" 
                                                                                color="success"
                                                                                icon={<CheckCircleIcon />}
                                                                            />
                                                                        )}
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        }
                                                        sx={{ width: '100%', m: 0 }}
                                                    />
                                                </Paper>
                                            );
                                        })}
                                    </RadioGroup>
                                </FormControl>

                                {/* Show explanation in view mode if available */}
                                {viewMode && exam.questions[currentQuestion].explanation && (
                                    <Box sx={{ mt: 3, p: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            💡 Explanation:
                                        </Typography>
                                        <Typography variant="body2">
                                            {exam.questions[currentQuestion].explanation}
                                        </Typography>
                                    </Box>
                                )}

                                {/* Navigation buttons */}
                                <Box display="flex" justifyContent="space-between" mt={4}>
                                    <Button
                                        variant="outlined"
                                        onClick={handlePrevious}
                                        disabled={currentQuestion === 0}
                                        startIcon={<NavigateBeforeIcon />}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleNext}
                                        disabled={currentQuestion === exam.questions.length - 1}
                                        endIcon={<NavigateNextIcon />}
                                    >
                                        Next
                                    </Button>
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Question navigator - Modified for view mode */}
                        <Grid item xs={12} md={4}>
                            <Paper elevation={3} sx={{ p: 3 }}>
                                <Typography variant="h6" mb={2}>
                                    Question Navigator {viewMode && <Chip label="REVIEW" color="info" size="small" />}
                                </Typography>
                                
                                <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
                                    {exam.questions.map((question, index) => {
                                        const userAnswer = viewMode ? 
                                            getPreviousAnswer(question._id) :
                                            answers[question._id];
                                        const isCorrect = viewMode && userAnswer === question.correctAnswer;
                                        
                                        return (
                                            <Button
                                                key={index}
                                                variant={currentQuestion === index ? "contained" : "outlined"}
                                                size="small"
                                                onClick={() => handleQuestionJump(index)}
                                                sx={{ 
                                                    minWidth: 40,
                                                    position: 'relative',
                                                    backgroundColor: viewMode ? (
                                                        currentQuestion === index ? undefined :
                                                        isCorrect ? 'success.light' :
                                                        userAnswer && !isCorrect ? 'error.light' :
                                                        !userAnswer ? 'warning.light' :
                                                        undefined
                                                    ) : (
                                                        userAnswer && currentQuestion !== index ? 'success.light' : undefined
                                                    ),
                                                    color: viewMode ? (
                                                        currentQuestion === index ? undefined :
                                                        isCorrect ? 'success.contrastText' :
                                                        userAnswer && !isCorrect ? 'error.contrastText' :
                                                        !userAnswer ? 'warning.contrastText' :
                                                        undefined
                                                    ) : (
                                                        userAnswer && currentQuestion !== index ? 'success.contrastText' : undefined
                                                    )
                                                }}
                                            >
                                                {index + 1}
                                                {!viewMode && flaggedQuestions.has(index) && (
                                                    <FlagIcon 
                                                        sx={{ 
                                                            position: 'absolute', 
                                                            top: -8, 
                                                            right: -8, 
                                                            fontSize: 16,
                                                            color: 'warning.main'
                                                        }} 
                                                    />
                                                )}
                                            </Button>
                                        );
                                    })}
                                </Box>

                                <Box mb={2}>
                                    <Typography variant="body2" gutterBottom>Legend:</Typography>
                                    <Box display="flex" flexDirection="column" gap={1}>
                                        {viewMode ? (
                                            <>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Box width={20} height={20} bgcolor="success.light" borderRadius={1} />
                                                    <Typography variant="caption">Correct answer</Typography>
                                                </Box>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Box width={20} height={20} bgcolor="error.light" borderRadius={1} />
                                                    <Typography variant="caption">Wrong answer</Typography>
                                                </Box>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Box width={20} height={20} bgcolor="warning.light" borderRadius={1} />
                                                    <Typography variant="caption">Not answered</Typography>
                                                </Box>
                                            </>
                                        ) : (
                                            <>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Box width={20} height={20} bgcolor="success.light" borderRadius={1} />
                                                    <Typography variant="caption">Answered</Typography>
                                                </Box>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Box width={20} height={20} border={1} borderColor="grey.400" borderRadius={1} />
                                                    <Typography variant="caption">Not answered</Typography>
                                                </Box>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <FlagIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                                                    <Typography variant="caption">Flagged for review</Typography>
                                                </Box>
                                            </>
                                        )}
                                    </Box>
                                </Box>

                                <Box>
                                    {viewMode ? (
                                        <Typography variant="body2" color="text.secondary">
                                            Your final score: {previousResult?.percentage || 0}% 
                                            ({previousResult?.passed ? 'PASSED' : 'FAILED'})
                                        </Typography>
                                    ) : (
                                        <>
                                            <Typography variant="body2" color="text.secondary">
                                                Answered: {getAnsweredCount()} / {exam.questions.length}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Flagged: {flaggedQuestions.size}
                                            </Typography>
                                        </>
                                    )}
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Submit confirmation dialog - Only show if not in view mode */}
                    {!viewMode && (
                        <Dialog open={showSubmitDialog} onClose={() => setShowSubmitDialog(false)}>
                            <DialogTitle>Submit Exam?</DialogTitle>
                            <DialogContent>
                                <Typography paragraph>
                                    Are you sure you want to submit your exam? You have answered{' '}
                                    {getAnsweredCount()} out of {exam.questions.length} questions.
                                </Typography>
                                {getAnsweredCount() < exam.questions.length && (
                                    <Alert severity="warning">
                                        You have {exam.questions.length - getAnsweredCount()} unanswered questions.
                                        These will be marked as incorrect.
                                    </Alert>
                                )}
                                <Alert severity="error" sx={{ mt: 2 }}>
                                    <strong>Warning:</strong> Once you submit, you cannot retake this exam. 
                                    Make sure you have reviewed all your answers.
                                </Alert>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setShowSubmitDialog(false)}>Continue Exam</Button>
                                <Button variant="contained" color="error" onClick={handleSubmitExam}>
                                    Submit Final Answers
                                </Button>
                            </DialogActions>
                        </Dialog>
                    )}
                </Container>
            )}
        </ThemeProvider>
    );
};

export default ExamTaking;