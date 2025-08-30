import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import { getExams, getStudentExamResults } from '../../redux/userRelated/userHandle';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  CircularProgress,
  useTheme,
  Card,
  CardContent,
  Button,
  Collapse,
  Chip,
  Grid,
  Divider,
  Badge,
  Tooltip
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import QuizIcon from '@mui/icons-material/Quiz';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LockIcon from '@mui/icons-material/Lock';
import GradeIcon from '@mui/icons-material/Grade';
import TimerIcon from '@mui/icons-material/Timer';
import BookIcon from '@mui/icons-material/Book';
import ArticleIcon from '@mui/icons-material/Article';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SchoolIcon from '@mui/icons-material/School';
import axios from 'axios';

// Complete theme configuration
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3f51b5',
      light: '#7986cb',
      dark: '#303f9f',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f50057',
      light: '#ff5983',
      dark: '#c51162',
      contrastText: '#ffffff',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
      contrastText: '#ffffff',
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
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
      A100: '#f5f5f5',
      A200: '#eeeeee',
      A400: '#bdbdbd',
      A700: '#616161',
    },
    common: {
      black: '#000',
      white: '#fff',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
    background: {
      paper: '#ffffff',
      default: '#fafafa',
    },
    action: {
      active: 'rgba(0, 0, 0, 0.54)',
      hover: 'rgba(0, 0, 0, 0.04)',
      hoverOpacity: 0.04,
      selected: 'rgba(0, 0, 0, 0.08)',
      selectedOpacity: 0.08,
      disabled: 'rgba(0, 0, 0, 0.26)',
      disabledBackground: 'rgba(0, 0, 0, 0.12)',
      disabledOpacity: 0.38,
      focus: 'rgba(0, 0, 0, 0.12)',
      focusOpacity: 0.12,
      activatedOpacity: 0.12,
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      color: '#2c3e50',
    },
    h5: {
      fontWeight: 600,
      color: '#2c3e50',
    },
    h6: {
      fontWeight: 500,
      color: '#34495e',
    },
    body1: {
      color: '#7f8c8d',
    },
  },
  components: {
    Button: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

const StudentSubjects = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentUser, response, loading, error } = useSelector(state => state.user);
    
    // Local state for subjects, exams, and lesson plans
    const [subjectsList, setSubjectsList] = useState([]);
    const [subjectsLoading, setSubjectsLoading] = useState(true);
    const [subjectsError, setSubjectsError] = useState('');
    const [expandedSubject, setExpandedSubject] = useState(null);
    const [subjectExams, setSubjectExams] = useState({});
    const [subjectLessonPlans, setSubjectLessonPlans] = useState({});
    const [loadingExams, setLoadingExams] = useState({});
    const [loadingLessonPlans, setLoadingLessonPlans] = useState({});
    const [examResults, setExamResults] = useState([]);

    // Fetch subjects directly using axios
    useEffect(() => {
        const fetchSubjects = async () => {
            if (!currentUser?.sclassName?._id) {
                setSubjectsError("No class information available");
                setSubjectsLoading(false);
                return;
            }

            try {
                setSubjectsLoading(true);
                setSubjectsError('');
                
                const classId = currentUser.sclassName._id;
                console.log("Fetching subjects for class:", classId);
                
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/ClassSubjects/${classId}`);
                
                if (response.data && response.data.message) {
                    // Handle case where API returns { message: "No subjects found" }
                    setSubjectsList([]);
                    setSubjectsError(response.data.message);
                } else if (Array.isArray(response.data)) {
                    console.log("Subjects fetched:", response.data);
                    setSubjectsList(response.data);
                    setSubjectsError('');
                } else {
                    setSubjectsList([]);
                    setSubjectsError("Unexpected response format");
                }
            } catch (err) {
                console.error("Failed to fetch subjects:", err);
                if (err.response?.status === 404) {
                    setSubjectsError("No subjects found for this class");
                } else if (err.response?.data?.message) {
                    setSubjectsError(err.response.data.message);
                } else {
                    setSubjectsError("Failed to fetch subjects. Please try again later.");
                }
                setSubjectsList([]);
            } finally {
                setSubjectsLoading(false);
            }
        };

        fetchSubjects();
    }, [currentUser]);

    // Fetch student's exam results
    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getStudentExamResults(currentUser._id));
        }
    }, [dispatch, currentUser]);

    // Handle response for exam results
    useEffect(() => {
        if (response?.status === 'examResultsFetched' && response?.examResults) {
            setExamResults(response.examResults);
        } else if (response?.status === 'examsFetched' && response?.exams) {
            const exams = response.exams;

            if (exams.length > 0) {
                const groupedBySubject = exams.reduce((acc, exam) => {
                    const subjectId = exam.subject._id || exam.subject;
                    if (!acc[subjectId]) acc[subjectId] = [];
                    acc[subjectId].push(exam);
                    return acc;
                }, {});

                setSubjectExams(prev => ({
                    ...prev,
                    ...groupedBySubject
                }));
            }
        }

    }, [response]);

    // Function to fetch exams for a specific subject
    const fetchSubjectExams = async (subjectId) => {
        if (subjectExams[subjectId]) return; // Already fetched
        
        setLoadingExams(prev => ({ ...prev, [subjectId]: true }));
        try {
            await dispatch(getExams(subjectId));
        } catch (error) {
            console.error('Error fetching exams:', error);
        } finally {
            setLoadingExams(prev => ({ ...prev, [subjectId]: false }));
        }
    };

    // Function to fetch lesson plans for a specific subject
    const fetchSubjectLessonPlans = async (subjectId) => {
        if (subjectLessonPlans[subjectId]) return; // Already fetched
        
        setLoadingLessonPlans(prev => ({ ...prev, [subjectId]: true }));
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/lesson-plans/subject/${subjectId}`);
            if (response.data && response.data.success && response.data.lessonPlans) {
                setSubjectLessonPlans(prev => ({
                    ...prev,
                    [subjectId]: response.data.lessonPlans
                }));
            } else {
                setSubjectLessonPlans(prev => ({
                    ...prev,
                    [subjectId]: []
                }));
            }
        } catch (error) {
            console.error('Error fetching lesson plans:', error);
            setSubjectLessonPlans(prev => ({
                ...prev,
                [subjectId]: []
            }));
        } finally {
            setLoadingLessonPlans(prev => ({ ...prev, [subjectId]: false }));
        }
    };

    const validateYouTubeUrl = (url) => {
        if (!url) return false;
        const pattern = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/;
        return pattern.test(url);
    };

    const handleSubjectExpand = (subjectId) => {
        if (expandedSubject === subjectId) {
            setExpandedSubject(null);
        } else {
            setExpandedSubject(subjectId);
            fetchSubjectExams(subjectId);
            fetchSubjectLessonPlans(subjectId);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDateOnly = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Format duration for lesson plans
    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };

    // Get exam status for a student
    const getExamStatus = (examId) => {
        const result = examResults.find(result => result.examId === examId);
        if (result) {
            return {
                completed: true,
                score: result.score,
                percentage: result.percentage,
                completedAt: result.completedAt,
                passed: result.percentage >= 60
            };
        }
        return { completed: false };
    };

    // Updated: Always return true for flexible scheduling
    const isExamAvailable = (exam) => {
        // For flexible exams, they're always available
        // You can add additional logic here like availability windows if needed
        if (exam.scheduleType === 'flexible') {
            const now = new Date();
            const availableFrom = exam.availableFrom ? new Date(exam.availableFrom) : new Date(0);
            const availableUntil = exam.availableUntil ? new Date(exam.availableUntil) : new Date('2099-12-31');
            
            return now >= availableFrom && now <= availableUntil;
        }
        
        // For fixed schedule exams, check the time window
        const now = new Date();
        const startTime = exam.startTime ? new Date(exam.startTime) : new Date(0);
        const endTime = exam.endTime ? new Date(exam.endTime) : new Date('2099-12-31');
        
        return now >= startTime && now <= endTime;
    };

    // Updated: Get exam button props based on flexible scheduling
    const getExamButtonProps = (exam) => {
        const status = getExamStatus(exam._id);
        const available = isExamAvailable(exam);

        if (status.completed) {
            return {
                color: status.passed ? 'success' : 'error',
                variant: 'outlined',
                startIcon: status.passed ? <CheckCircleIcon /> : <GradeIcon />,
                text: `Score: ${status.percentage}%`,
                disabled: false,
                onClick: () => {
                    // Navigate to the exam taking page which will show results
                    navigate(`/Student/exam/${exam._id}`);
                }
            };
        }

        if (!available) {
            return {
                color: 'inherit',
                variant: 'outlined',
                startIcon: <LockIcon />,
                text: 'Not Available',
                disabled: true,
                onClick: () => {}
            };
        }

        return {
            color: 'success',
            variant: 'contained',
            startIcon: <QuizIcon />,
            text: 'Take Exam',
            disabled: false,
            onClick: () => {
                navigate(`/Student/exam/${exam._id}`);
            }
        };
    };

    // Count exams by status for each subject
    const getSubjectExamStats = (subjectId) => {
        const exams = subjectExams[subjectId] || [];
        let completed = 0, available = 0, upcoming = 0, passed = 0;

        exams.forEach(exam => {
            const status = getExamStatus(exam._id);
            const examAvailable = isExamAvailable(exam);

            if (status.completed) {
                completed++;
                if (status.passed) passed++;
            } else if (examAvailable) {
                available++;
            } else {
                upcoming++;
            }
        });

        return { total: exams.length, completed, available, upcoming, passed };
    };

    // Get lesson plans stats for each subject
    const getSubjectLessonStats = (subjectId) => {
        const plans = subjectLessonPlans[subjectId] || [];
        const published = plans.filter(plan => plan.status === 'Published').length;
        const drafts = plans.filter(plan => plan.status === 'Draft').length;
        
        return { total: plans.length, published, drafts };
    };

    // Format exam duration
    const formatExamDuration = (timeLimit) => {
        if (!timeLimit) return 'Not set';
        const hours = Math.floor(timeLimit / 3600);
        const minutes = Math.floor((timeLimit % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    // Get exam schedule display text
    const getExamScheduleText = (exam) => {
        if (exam.scheduleType === 'flexible') {
            if (exam.availableFrom && exam.availableUntil) {
                return `Available from ${formatDate(exam.availableFrom)} to ${formatDate(exam.availableUntil)}`;
            }
            return 'Take anytime when ready';
        } else {
            if (exam.startTime && exam.endTime) {
                return `${formatDate(exam.startTime)} - ${formatDate(exam.endTime)}`;
            }
            return formatDate(exam.createdAt);
        }
    };

    if (subjectsLoading) {
        return (
            <ThemeProvider theme={theme}>
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    minHeight: '60vh'
                }}>
                    <CircularProgress size={60} />
                    <Typography sx={{ ml: 2 }}>Loading subjects...</Typography>
                </Box>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="lg" sx={{ 
                mt: 4, 
                mb: 10,
                px: { xs: 2, sm: 3 }
            }}>
                <Typography variant="h4" align="center" gutterBottom sx={{ 
                    mb: 4,
                    textTransform: 'uppercase',
                    letterSpacing: 1.1
                }}>
                    Your Course Materials, Lesson Plans & Exams
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {subjectsList.length > 0 ? (
                        subjectsList.map((subject) => {
                            const examStats = getSubjectExamStats(subject._id);
                            const lessonStats = getSubjectLessonStats(subject._id);
                            return (
                                <Paper 
                                    key={subject._id} 
                                    elevation={3} 
                                    sx={{ 
                                        borderRadius: 2,
                                        background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {/* Subject Header */}
                                    <Box sx={{ 
                                        p: 3,
                                        borderBottom: '1px solid rgba(0,0,0,0.1)',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white'
                                    }}>
                                        <Grid container alignItems="center" justifyContent="space-between">
                                            <Grid item xs={12} md={8}>
                                                <Typography variant="h5" sx={{ mb: 1 }}>
                                                    {subject.subName} ({subject.subCode})
                                                </Typography>
                                                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                                                    {subject.description || "No description available"}
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                    <Chip 
                                                        icon={<AccessTimeIcon />}
                                                        label={`${subject.sessions} Sessions`} 
                                                        size="small"
                                                        sx={{ 
                                                            backgroundColor: 'rgba(255,255,255,0.2)',
                                                            color: 'white',
                                                            '& .MuiChip-icon': { color: 'white' }
                                                        }}
                                                    />
                                                    {lessonStats.total > 0 && (
                                                        <Badge badgeContent={lessonStats.published} color="info">
                                                            <Chip 
                                                                icon={<BookIcon />}
                                                                label="Lesson Plans" 
                                                                size="small"
                                                                sx={{ 
                                                                    backgroundColor: 'rgba(33, 150, 243, 0.2)',
                                                                    color: 'white',
                                                                    '& .MuiChip-icon': { color: 'white' }
                                                                }}
                                                            />
                                                        </Badge>
                                                    )}
                                                    {examStats.total > 0 && (
                                                        <>
                                                            <Badge badgeContent={examStats.completed} color="success">
                                                                <Chip 
                                                                    icon={<CheckCircleIcon />}
                                                                    label="Completed" 
                                                                    size="small"
                                                                    sx={{ 
                                                                        backgroundColor: 'rgba(76, 175, 80, 0.2)',
                                                                        color: 'white',
                                                                        '& .MuiChip-icon': { color: 'white' }
                                                                    }}
                                                                />
                                                            </Badge>
                                                            <Badge badgeContent={examStats.available} color="warning">
                                                                <Chip 
                                                                    icon={<QuizIcon />}
                                                                    label="Available" 
                                                                    size="small"
                                                                    sx={{ 
                                                                        backgroundColor: 'rgba(255, 152, 0, 0.2)',
                                                                        color: 'white',
                                                                        '& .MuiChip-icon': { color: 'white' }
                                                                    }}
                                                                />
                                                            </Badge>
                                                        </>
                                                    )}
                                                </Box>
                                            </Grid>
                                            <Grid item>
                                                <Button
                                                    variant="contained"
                                                    onClick={() => handleSubjectExpand(subject._id)}
                                                    sx={{ 
                                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                                        color: 'white',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(255,255,255,0.3)'
                                                        }
                                                    }}
                                                    endIcon={expandedSubject === subject._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                >
                                                    {expandedSubject === subject._id ? 'Hide Content' : 'View Content'}
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </Box>

                                    {/* Collapsible Content */}
                                    <Collapse in={expandedSubject === subject._id}>
                                        <Box sx={{ p: 3 }}>
                                            <Grid container spacing={3}>
                                                {/* Video Section */}
                                                <Grid item xs={12} lg={4}>
                                                    <Card elevation={2} sx={{ height: '100%' }}>
                                                        <CardContent>
                                                            <Typography variant="h6" sx={{ 
                                                                mb: 2,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 1
                                                            }}>
                                                                <PlayArrowIcon color="primary" />
                                                                Subject Video
                                                            </Typography>
                                                            {validateYouTubeUrl(subject.videoLink) ? (
                                                                <Box sx={{
                                                                    position: 'relative',
                                                                    paddingTop: '56.25%', // 16:9 aspect ratio
                                                                    backgroundColor: '#000',
                                                                    borderRadius: 1,
                                                                    overflow: 'hidden',
                                                                    border: '1px solid rgba(0,0,0,0.1)'
                                                                }}>
                                                                    <iframe
                                                                        src={subject.videoLink}
                                                                        frameBorder="0"
                                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                        allowFullScreen
                                                                        style={{
                                                                            position: 'absolute',
                                                                            top: 0,
                                                                            left: 0,
                                                                            width: '100%',
                                                                            height: '100%'
                                                                        }}
                                                                        title={`${subject.subName} Video`}
                                                                    />
                                                                </Box>
                                                            ) : (
                                                                <Box sx={{ 
                                                                    p: 3, 
                                                                    textAlign: 'center',
                                                                    backgroundColor: '#f5f5f5',
                                                                    borderRadius: 1
                                                                }}>
                                                                    <Typography color="text.secondary" variant="body2">
                                                                        {subject.videoLink ? "Invalid YouTube URL" : "No video available"}
                                                                    </Typography>
                                                                </Box>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                </Grid>

                                                {/* Lesson Plans Section */}
                                                <Grid item xs={12} lg={4}>
                                                    <Card elevation={2} sx={{ height: '100%' }}>
                                                        <CardContent>
                                                            <Typography variant="h6" sx={{ 
                                                                mb: 2,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 1
                                                            }}>
                                                                <BookIcon color="info" />
                                                                Lesson Plans ({lessonStats.published})
                                                            </Typography>

                                                            {/* Lesson Plan Stats */}
                                                            {lessonStats.total > 0 && (
                                                                <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                                    <Chip 
                                                                        icon={<ArticleIcon />}
                                                                        label={`${lessonStats.published} Published`}
                                                                        color="info"
                                                                        size="small"
                                                                        variant="outlined"
                                                                    />
                                                                    <Chip 
                                                                        icon={<SchoolIcon />}
                                                                        label="Study Materials"
                                                                        color="primary"
                                                                        size="small"
                                                                        variant="outlined"
                                                                    />
                                                                </Box>
                                                            )}

                                                            {loadingLessonPlans[subject._id] ? (
                                                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                                                    <CircularProgress size={30} />
                                                                </Box>
                                                            ) : subjectLessonPlans[subject._id] && subjectLessonPlans[subject._id].length > 0 ? (
                                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                                    {subjectLessonPlans[subject._id]
                                                                        .filter(plan => plan.status === 'Published') // Only show published lesson plans
                                                                        .slice(0, 3) // Show only first 3 for space
                                                                        .map((plan) => (
                                                                        <Paper 
                                                                            key={plan._id}
                                                                            variant="outlined"
                                                                            sx={{ 
                                                                                p: 2,
                                                                                transition: 'transform 0.2s',
                                                                                borderLeft: `4px solid #2196f3`,
                                                                                '&:hover': {
                                                                                    transform: 'translateX(3px)',
                                                                                    boxShadow: 1
                                                                                }
                                                                            }}
                                                                        >
                                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                                                <Typography variant="subtitle2" fontWeight="600" sx={{ flex: 1 }}>
                                                                                    {plan.title}
                                                                                </Typography>
                                                                                <Chip
                                                                                    icon={<CalendarTodayIcon />}
                                                                                    label={`Week ${plan.week}`}
                                                                                    color="primary"
                                                                                    size="small"
                                                                                    variant="outlined"
                                                                                />
                                                                            </Box>
                                                                            
                                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                                                                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                                                                                    <Chip 
                                                                                        label={formatDuration(plan.duration)} 
                                                                                        size="small"
                                                                                        color="secondary"
                                                                                        variant="outlined"
                                                                                    />
                                                                                    <Chip 
                                                                                        label={plan.term} 
                                                                                        size="small"
                                                                                        color="info"
                                                                                        variant="outlined"
                                                                                    />
                                                                                </Box>
                                                                            </Box>

                                                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                                                                Date: {formatDateOnly(plan.lessonDate)}
                                                                            </Typography>

                                                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                                                <Tooltip title="View detailed lesson plan">
                                                                                    <Button
                                                                                        variant="outlined"
                                                                                        size="small"
                                                                                        color="info"
                                                                                        startIcon={<ArticleIcon />}
                                                                                        onClick={() => window.open(`/Student/lesson-plan/?planId=${plan._id}`, '_blank')}
                                                                                        sx={{ minWidth: 100 }}
                                                                                    >
                                                                                        View Plan
                                                                                    </Button>
                                                                                </Tooltip>
                                                                            </Box>
                                                                        </Paper>
                                                                    ))}
                                                                    
                                                                    {subjectLessonPlans[subject._id].filter(plan => plan.status === 'Published').length > 3 && (
                                                                        <Button
                                                                            variant="text"
                                                                            size="small"
                                                                            color="info"
                                                                            onClick={() => {
                                                                                // You can navigate to a dedicated lesson plans page or show a modal
                                                                                console.log(`View all lesson plans for subject ${subject._id}`);
                                                                            }}
                                                                        >
                                                                            View All {subjectLessonPlans[subject._id].filter(plan => plan.status === 'Published').length} Lesson Plans
                                                                        </Button>
                                                                    )}
                                                                </Box>
                                                            ) : (
                                                                <Box sx={{ 
                                                                    p: 3, 
                                                                    textAlign: 'center',
                                                                    backgroundColor: '#f5f5f5',
                                                                    borderRadius: 1
                                                                }}>
                                                                    <BookIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                                                                    <Typography color="text.secondary" variant="body2">
                                                                        No lesson plans available yet
                                                                    </Typography>
                                                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                                                        Your teacher will publish lesson plans here
                                                                    </Typography>
                                                                </Box>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                </Grid>

                                                {/* Exams Section */}
                                                <Grid item xs={12} lg={4}>
                                                    <Card elevation={2} sx={{ height: '100%' }}>
                                                        <CardContent>
                                                            <Typography variant="h6" sx={{ 
                                                                mb: 2,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 1
                                                            }}>
                                                                <QuizIcon color="secondary" />
                                                                Flexible Exams ({examStats.total})
                                                            </Typography>

                                                            {/* Exam Stats */}
                                                            {examStats.total > 0 && (
                                                                <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                                    <Chip 
                                                                        icon={<CheckCircleIcon />}
                                                                        label={`${examStats.completed} Completed`}
                                                                        color="success"
                                                                        size="small"
                                                                        variant="outlined"
                                                                    />
                                                                    <Chip 
                                                                        icon={<QuizIcon />}
                                                                        label={`${examStats.available} Available`}
                                                                        color="warning"
                                                                        size="small"
                                                                        variant="outlined"
                                                                    />
                                                                    <Chip 
                                                                        icon={<TimerIcon />}
                                                                        label="Take Anytime"
                                                                        color="info"
                                                                        size="small"
                                                                        variant="outlined"
                                                                    />
                                                                </Box>
                                                            )}

                                                            {loadingExams[subject._id] ? (
                                                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                                                    <CircularProgress size={30} />
                                                                </Box>
                                                            ) : subjectExams[subject._id] && subjectExams[subject._id].length > 0 ? (
                                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                                    {subjectExams[subject._id].map((exam) => {
                                                                        const buttonProps = getExamButtonProps(exam);
                                                                        const status = getExamStatus(exam._id);
                                                                        
                                                                        return (
                                                                            <Paper 
                                                                                key={exam._id}
                                                                                variant="outlined"
                                                                                sx={{ 
                                                                                    p: 2,
                                                                                    transition: 'transform 0.2s',
                                                                                    borderLeft: `4px solid ${
                                                                                        status.completed 
                                                                                            ? (status.passed ? '#4caf50' : '#f44336')
                                                                                            : '#2196f3'
                                                                                    }`,
                                                                                    '&:hover': {
                                                                                        transform: 'translateX(5px)',
                                                                                        boxShadow: 2
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                                                    <Typography variant="subtitle1" fontWeight="600">
                                                                                        {exam.title}
                                                                                    </Typography>
                                                                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                                                        {status.completed && (
                                                                                            <Chip
                                                                                                icon={status.passed ? <CheckCircleIcon /> : <GradeIcon />}
                                                                                                label={status.passed ? 'Passed' : 'Failed'}
                                                                                                color={status.passed ? 'success' : 'error'}
                                                                                                size="small"
                                                                                            />
                                                                                        )}
                                                                                        {exam.scheduleType === 'flexible' && (
                                                                                            <Chip
                                                                                                icon={<TimerIcon />}
                                                                                                label="Flexible"
                                                                                                color="info"
                                                                                                size="small"
                                                                                                variant="outlined"
                                                                                            />
                                                                                        )}
                                                                                    </Box>
                                                                                </Box>
                                                                                
                                                                                {exam.description && (
                                                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                                                        {exam.description}
                                                                                    </Typography>
                                                                                )}
                                                                                
                                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                                                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                                                                                        <Chip 
                                                                                            label={`${exam.questions?.length || 0} Questions`} 
                                                                                            size="small"
                                                                                            color="primary"
                                                                                            variant="outlined"
                                                                                        />
                                                                                        <Chip 
                                                                                            label={`Duration: ${formatExamDuration(exam.timeLimit)}`} 
                                                                                            size="small"
                                                                                            color="secondary"
                                                                                            variant="outlined"
                                                                                        />
                                                                                        <Chip 
                                                                                            label={`Pass: ${exam.passingMarks || 60}%`} 
                                                                                            size="small"
                                                                                            color="warning"
                                                                                            variant="outlined"
                                                                                        />
                                                                                    </Box>
                                                                                </Box>

                                                                                <Box sx={{ mb: 2 }}>
                                                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                                                        Schedule:
                                                                                    </Typography>
                                                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                                        {getExamScheduleText(exam)}
                                                                                    </Typography>
                                                                                    {status.completed && (
                                                                                        <Typography variant="caption" color="text.secondary">
                                                                                            Completed: {formatDate(status.completedAt)}
                                                                                        </Typography>
                                                                                    )}
                                                                                </Box>

                                                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                                                    <Tooltip title={
                                                                                        status.completed 
                                                                                            ? "View your results and review answers"
                                                                                            : isExamAvailable(exam)
                                                                                                ? "Start taking this exam anytime - timer begins when you start"
                                                                                                : "This exam is not currently available"
                                                                                    }>
                                                                                        <span>
                                                                                            <Button
                                                                                                variant={buttonProps.variant}
                                                                                                size="small"
                                                                                                color={buttonProps.color}
                                                                                                startIcon={buttonProps.startIcon}
                                                                                                onClick={buttonProps.onClick}
                                                                                                disabled={buttonProps.disabled}
                                                                                                sx={{ minWidth: 120 }}
                                                                                            >
                                                                                                {buttonProps.text}
                                                                                            </Button>
                                                                                        </span>
                                                                                    </Tooltip>
                                                                                </Box>
                                                                            </Paper>
                                                                        );
                                                                    })}
                                                                </Box>
                                                            ) : (
                                                                <Box sx={{ 
                                                                    p: 3, 
                                                                    textAlign: 'center',
                                                                    backgroundColor: '#f5f5f5',
                                                                    borderRadius: 1
                                                                }}>
                                                                    <QuizIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                                                                    <Typography color="text.secondary" variant="body2">
                                                                        No exams available yet
                                                                    </Typography>
                                                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                                                        Check back later for flexible exams you can take anytime
                                                                    </Typography>
                                                                </Box>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </Collapse>
                                </Paper>
                            );
                        })
                    ) : subjectsError ? (
                        <Paper sx={{ p: 4, textAlign: 'center' }}>
                            <Typography color="error" variant="h6" sx={{ mb: 2 }}>
                                {subjectsError}
                            </Typography>
                            <Typography color="text.secondary">
                                Please contact your administrator if this problem persists.
                            </Typography>
                        </Paper>
                    ) : (
                        <Paper sx={{ p: 4, textAlign: 'center' }}>
                            <Typography align="center" variant="h6" color="text.secondary">
                                No subjects available
                            </Typography>
                        </Paper>
                    )}
                </Box>

                {/* Info card about flexible scheduling and lesson plans */}
                <Paper elevation={2} sx={{ p: 3, mt: 4, background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)' }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SchoolIcon color="primary" />
                        About Your Learning Materials
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Lesson Plans:</strong> Access detailed study materials, objectives, and structured content for each lesson.
                                <br />
                                <strong>Study at your pace:</strong> Review lesson plans anytime to understand what will be covered in class.
                                <br />
                                <strong>Track your progress:</strong> See which topics have been taught and prepare for upcoming lessons.
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Flexible Exams:</strong> Take exams when you're ready within the availability period.
                                <br />
                                <strong>Instant Results:</strong> Get immediate feedback and review correct answers after completion.
                                <br />
                                <strong>One Attempt:</strong> Each exam can only be taken once, so make sure you're prepared.
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>
            </Container>
        </ThemeProvider>
    );
};

export default StudentSubjects;
