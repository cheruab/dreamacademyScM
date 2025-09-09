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
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  Divider,
  Badge,
  Tooltip,
  Stack
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import QuizIcon from '@mui/icons-material/Quiz';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import GradeIcon from '@mui/icons-material/Grade';
import TimerIcon from '@mui/icons-material/Timer';
import BookIcon from '@mui/icons-material/Book';
import ArticleIcon from '@mui/icons-material/Article';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import AssignmentIcon from '@mui/icons-material/Assignment';
import axios from 'axios';

// Modern professional theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
      light: '#60a5fa',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7c3aed',
      light: '#a78bfa',
      dark: '#5b21b6',
      contrastText: '#ffffff',
    },
    success: {
      main: '#059669',
      light: '#34d399',
      dark: '#047857',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#d97706',
      light: '#fbbf24',
      dark: '#92400e',
      contrastText: '#ffffff',
    },
    error: {
      main: '#dc2626',
      light: '#f87171',
      dark: '#991b1b',
      contrastText: '#ffffff',
    },
    info: {
      main: '#0891b2',
      light: '#22d3ee',
      dark: '#0e7490',
      contrastText: '#ffffff',
    },
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '2rem',
      letterSpacing: '-0.02em',
      color: '#0f172a',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
      letterSpacing: '-0.01em',
      color: '#1e293b',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
      color: '#334155',
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
      color: '#475569',
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#64748b',
    },
    body2: {
      fontSize: '0.8rem',
      lineHeight: 1.5,
      color: '#64748b',
    },
    button: {
      fontWeight: 500,
      fontSize: '0.875rem',
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          '&:hover': {
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontSize: '0.75rem',
          fontWeight: 500,
          height: 28,
        },
      },
    },
  },
});

const lessonPlanStyles = {
  primaryButton: { 
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', 
    color: 'white', 
    border: 'none', 
    padding: '12px 24px', 
    borderRadius: '8px', 
    fontSize: '0.875rem', 
    cursor: 'pointer', 
    fontWeight: '500', 
    transition: 'all 0.2s ease-in-out',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    '&:hover': {
      background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
      transform: 'translateY(-1px)',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    }
  },
};

const StudentSubjects = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentUser, response, loading, error } = useSelector(state => state.user);
    
    // Local state for subjects, exams, and lesson plans
    const [subjectsList, setSubjectsList] = useState([]);
    const [subjectsLoading, setSubjectsLoading] = useState(true);
    const [subjectsError, setSubjectsError] = useState('');
    const [subjectExams, setSubjectExams] = useState({});
    const [subjectLessonPlans, setSubjectLessonPlans] = useState({});
    const [loadingExams, setLoadingExams] = useState({});
    const [loadingLessonPlans, setLoadingLessonPlans] = useState({});
    const [examResults, setExamResults] = useState([]);
    const [selectedLessonPlan, setSelectedLessonPlan] = useState(null);

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
                    setSubjectsList([]);
                    setSubjectsError(response.data.message);
                } else if (Array.isArray(response.data)) {
                    console.log("Subjects fetched:", response.data);
                    setSubjectsList(response.data);
                    setSubjectsError('');
                    
                    // Auto-fetch exams and lesson plans for all subjects
                    response.data.forEach(subject => {
                        fetchSubjectExams(subject._id);
                        fetchSubjectLessonPlans(subject._id);
                    });
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
        if (subjectExams[subjectId]) return;
        
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
        if (subjectLessonPlans[subjectId]) return;
        
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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}min`;
    };

    const formatDateOnly = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
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

    // Check if exam is available
    const isExamAvailable = (exam) => {
        if (exam.scheduleType === 'flexible') {
            const now = new Date();
            const availableFrom = exam.availableFrom ? new Date(exam.availableFrom) : new Date(0);
            const availableUntil = exam.availableUntil ? new Date(exam.availableUntil) : new Date('2099-12-31');
            
            return now >= availableFrom && now <= availableUntil;
        }
        
        const now = new Date();
        const startTime = exam.startTime ? new Date(exam.startTime) : new Date(0);
        const endTime = exam.endTime ? new Date(exam.endTime) : new Date('2099-12-31');
        
        return now >= startTime && now <= endTime;
    };

    // Get exam button props
    const getExamButtonProps = (exam) => {
        const status = getExamStatus(exam._id);
        const available = isExamAvailable(exam);

        if (status.completed) {
            return {
                color: status.passed ? 'success' : 'error',
                variant: 'outlined',
                startIcon: status.passed ? <CheckCircleIcon /> : <GradeIcon />,
                text: `${status.percentage}%`,
                disabled: false,
                onClick: () => {
                    navigate(`/Student/exam/${exam._id}`);
                }
            };
        }

        if (!available) {
            return {
                color: 'inherit',
                variant: 'outlined',
                startIcon: <LockIcon />,
                text: 'Unavailable',
                disabled: true,
                onClick: () => {}
            };
        }

        return {
            color: 'primary',
            variant: 'contained',
            startIcon: <PlayArrowIcon />,
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
                return `Available ${formatDate(exam.availableFrom)} - ${formatDate(exam.availableUntil)}`;
            }
            return 'Available anytime';
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
                    flexDirection: 'column',
                    justifyContent: 'center', 
                    alignItems: 'center',
                    minHeight: '60vh',
                    gap: 2
                }}>
                    <CircularProgress size={40} thickness={4} />
                    <Typography variant="body1" color="text.secondary">Loading your courses...</Typography>
                </Box>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ 
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                py: 4
            }}>
                <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
                    {/* Header Section */}
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Typography variant="h4" sx={{ 
                            mb: 2,
                            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            Course Dashboard
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                            Access your course materials, lesson plans, and take flexible exams at your own pace
                        </Typography>
                    </Box>

                    {/* Subjects Grid */}
                    <Stack spacing={4}>
                        {subjectsList.length > 0 ? (
                            subjectsList.map((subject) => {
                                const examStats = getSubjectExamStats(subject._id);
                                const lessonStats = getSubjectLessonStats(subject._id);
                                
                                return (
                                    <Paper 
                                        key={subject._id} 
                                        elevation={0}
                                        sx={{ 
                                            borderRadius: 3,
                                            overflow: 'hidden',
                                            border: '1px solid',
                                            borderColor: 'grey.200',
                                            transition: 'all 0.3s ease-in-out',
                                            '&:hover': {
                                                borderColor: 'primary.main',
                                                boxShadow: '0 20px 25px -5px rgba(15, 170, 15, 0.97), 0 10px 10px -5px rgba(20, 190, 34, 0.84)',
                                            }
                                        }}
                                    >
                                        {/* Subject Header */}
                                        <Box sx={{ 
                                            p: 4,
                                            background: 'linear-gradient(135deg, #22773eff 0%, #12993fff 100%)',
                                            color: 'white'
                                        }}>
                                            <Grid container spacing={3} alignItems="center">
                                                <Grid item xs={12} lg={8}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                        <SchoolIcon sx={{ fontSize: 32 }} />
                                                        <Box>
                                                            <Typography variant="h5" sx={{ mb: 0.5, color: 'white' }}>
                                                                {subject.subName}
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ opacity: 0.8, color: 'white' }}>
                                                                {subject.subCode} • {subject.sessions} Sessions
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 2, lineHeight: 1.6,color: 'white' }}>
                                                        {subject.description || "Comprehensive course covering essential topics and practical applications."}
                                                    </Typography>
                                                </Grid>
                                                
                                                <Grid item xs={12} lg={4}>
                                                    <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', lg: 'flex-end' }}>
                                                        {lessonStats.total > 0 && (
                                                            <Chip 
                                                                icon={<BookIcon />}
                                                                label={`${lessonStats.published} Plans`}
                                                                sx={{ 
                                                                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                                                    color: 'white',
                                                                    border: '1px solid rgba(59, 130, 246, 0.3)',
                                                                    '& .MuiChip-icon': { color: 'white' }
                                                                }}
                                                            />
                                                        )}
                                                        {examStats.total > 0 && (
                                                            <Chip 
                                                                icon={<QuizIcon />}
                                                                label={`${examStats.completed}/${examStats.total} Exams`}
                                                                sx={{ 
                                                                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                                                                    color: 'white',
                                                                    border: '1px solid rgba(34, 197, 94, 0.3)',
                                                                    '& .MuiChip-icon': { color: 'white' }
                                                                }}
                                                            />
                                                        )}
                                                        <Chip 
                                                            icon={<TrendingUpIcon />}
                                                            label="Active"
                                                            sx={{ 
                                                                backgroundColor: 'rgba(168, 85, 247, 0.2)',
                                                                color: 'white',
                                                                border: '1px solid rgba(168, 85, 247, 0.3)',
                                                                '& .MuiChip-icon': { color: 'white' }
                                                            }}
                                                        />
                                                    </Stack>
                                                </Grid>
                                            </Grid>
                                        </Box>

                                        {/* Subject Content - Always Visible */}
                                        <Box sx={{ p: 4 }}>
                                            <Grid container spacing={4}>
                                                {/* Video Section */}
                                                <Grid item xs={12} lg={4}>
                                                    <Card sx={{ height: '100%', borderRadius: 2 }}>
                                                        <CardContent sx={{ p: 3 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                                                <VideoLibraryIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                                                                <Typography variant="h6" color="text.primary">
                                                                    Course Video
                                                                </Typography>
                                                            </Box>
                                                            
                                                            {validateYouTubeUrl(subject.videoLink) ? (
                                                                <Box sx={{
                                                                    position: 'relative',
                                                                    paddingTop: '56.25%',
                                                                    backgroundColor: 'grey.900',
                                                                    borderRadius: 2,
                                                                    overflow: 'hidden',
                                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
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
                                                                    p: 4, 
                                                                    textAlign: 'center',
                                                                    backgroundColor: 'grey.50',
                                                                    borderRadius: 2,
                                                                    border: '2px dashed',
                                                                    borderColor: 'grey.300'
                                                                }}>
                                                                    <VideoLibraryIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                                                                    <Typography color="text.secondary" variant="body2">
                                                                        {subject.videoLink ? "Invalid video URL" : "No video available"}
                                                                    </Typography>
                                                                </Box>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                </Grid>

                                                {/* Lesson Plans Section */}
                                                <Grid item xs={12} lg={4}>
                                                    <Card sx={{ height: '100%', borderRadius: 2 }}>
                                                        <CardContent sx={{ p: 3 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                                                <BookIcon sx={{ color: 'info.main', fontSize: 24 }} />
                                                                <Typography variant="h6" color="text.primary">
                                                                    Lesson Plans
                                                                </Typography>
                                                                {lessonStats.published > 0 && (
                                                                    <Chip 
                                                                        label={lessonStats.published}
                                                                        size="small"
                                                                        color="info"
                                                                        sx={{ ml: 1 }}
                                                                    />
                                                                )}
                                                            </Box>

                                                            {loadingLessonPlans[subject._id] ? (
                                                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                                                    <CircularProgress size={32} />
                                                                </Box>
                                                            ) : subjectLessonPlans[subject._id] && subjectLessonPlans[subject._id].length > 0 ? (
                                                                <Stack spacing={2}>
                                                                    {subjectLessonPlans[subject._id]
                                                                        .filter(plan => plan.status === 'Published')
                                                                        .slice(0, 3)
                                                                        .map((plan) => (
                                                                        <Paper 
                                                                            key={plan._id}
                                                                            variant="outlined"
                                                                            sx={{ 
                                                                                p: 2.5,
                                                                                borderRadius: 2,
                                                                                borderLeft: '4px solid',
                                                                                borderLeftColor: 'info.main',
                                                                                transition: 'all 0.2s ease-in-out',
                                                                                '&:hover': {
                                                                                    transform: 'translateX(4px)',
                                                                                    borderLeftColor: 'info.dark',
                                                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                                                                }
                                                                            }}
                                                                        >
                                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                                                                <Typography variant="subtitle1" fontWeight="600" sx={{ flex: 1, color: 'text.primary' }}>
                                                                                    {plan.title}
                                                                                </Typography>
                                                                                <Chip
                                                                                    icon={<CalendarTodayIcon sx={{ fontSize: 16 }} />}
                                                                                    label={`Week ${plan.week}`}
                                                                                    size="small"
                                                                                    variant="outlined"
                                                                                    sx={{ 
                                                                                        borderColor: 'info.main',
                                                                                        color: 'info.main',
                                                                                        fontSize: '0.7rem'
                                                                                    }}
                                                                                />
                                                                            </Box>
                                                                            
                                                                            <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                                                                                <Chip 
                                                                                    label={formatDuration(plan.duration)} 
                                                                                    size="small"
                                                                                    sx={{ 
                                                                                        backgroundColor: 'secondary.50',
                                                                                        color: 'secondary.main',
                                                                                        border: '1px solid',
                                                                                        borderColor: 'secondary.200'
                                                                                    }}
                                                                                />
                                                                                <Chip 
                                                                                    label={plan.term} 
                                                                                    size="small"
                                                                                    sx={{ 
                                                                                        backgroundColor: 'info.50',
                                                                                        color: 'info.main',
                                                                                        border: '1px solid',
                                                                                        borderColor: 'info.200'
                                                                                    }}
                                                                                />
                                                                            </Stack>

                                                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                                                                                {formatDateOnly(plan.lessonDate)}
                                                                            </Typography>

                                                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                                                <Button
                                                                                    variant="outlined"
                                                                                    size="small"
                                                                                    startIcon={<ArticleIcon sx={{ fontSize: 16 }} />}
                                                                                    onClick={() => setSelectedLessonPlan(plan)}
                                                                                    sx={{ 
                                                                                        borderRadius: 2,
                                                                                        textTransform: 'none',
                                                                                        fontSize: '0.8rem'
                                                                                    }}
                                                                                >
                                                                                    View Lesson Plan
                                                                                </Button>
                                                                            </Box>
                                                                        </Paper>
                                                                    ))}
                                                                    
                                                                    {subjectLessonPlans[subject._id].filter(plan => plan.status === 'Published').length > 3 && (
                                                                        <Button
                                                                            variant="text"
                                                                            size="small"
                                                                            color="info"
                                                                            sx={{ mt: 1, fontSize: '0.8rem' }}
                                                                        >
                                                                            View All {subjectLessonPlans[subject._id].filter(plan => plan.status === 'Published').length} Lesson Plans
                                                                        </Button>
                                                                    )}
                                                                </Stack>
                                                            ) : (
                                                                <Box sx={{ 
                                                                    py: 6, 
                                                                    textAlign: 'center',
                                                                    backgroundColor: 'grey.50',
                                                                    borderRadius: 2,
                                                                    border: '2px dashed',
                                                                    borderColor: 'grey.300'
                                                                }}>
                                                                    <BookIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                                                                    <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
                                                                        No lesson plans available
                                                                    </Typography>
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        Your instructor will publish lesson plans here
                                                                    </Typography>
                                                                </Box>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                </Grid>

                                                {/* Exams Section */}
                                                <Grid item xs={12} lg={4}>
                                                    <Card sx={{ height: '100%', borderRadius: 2 }}>
                                                        <CardContent sx={{ p: 3 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                                                <AssignmentIcon sx={{ color: 'success.main', fontSize: 24 }} />
                                                                <Typography variant="h6" color="text.primary">
                                                                    Assessments
                                                                </Typography>
                                                                {examStats.total > 0 && (
                                                                    <Chip 
                                                                        label={`${examStats.completed}/${examStats.total}`}
                                                                        size="small"
                                                                        color="success"
                                                                        sx={{ ml: 1 }}
                                                                    />
                                                                )}
                                                            </Box>

                                                            {/* Exam Stats Bar */}
                                                            {examStats.total > 0 && (
                                                                <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                                                                    <Chip 
                                                                        icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                                                                        label={`${examStats.completed} Done`}
                                                                        size="small"
                                                                        variant="outlined"
                                                                        sx={{ 
                                                                            borderColor: 'success.main',
                                                                            color: 'success.main',
                                                                            fontSize: '0.7rem'
                                                                        }}
                                                                    />
                                                                    <Chip 
                                                                        icon={<TimerIcon sx={{ fontSize: 16 }} />}
                                                                        label="Flexible"
                                                                        size="small"
                                                                        variant="outlined"
                                                                        sx={{ 
                                                                            borderColor: 'info.main',
                                                                            color: 'info.main',
                                                                            fontSize: '0.7rem'
                                                                        }}
                                                                    />
                                                                </Stack>
                                                            )}

                                                            {loadingExams[subject._id] ? (
                                                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                                                    <CircularProgress size={32} />
                                                                </Box>
                                                            ) : subjectExams[subject._id] && subjectExams[subject._id].length > 0 ? (
                                                                <Stack spacing={2}>
                                                                    {subjectExams[subject._id].map((exam) => {
                                                                        const buttonProps = getExamButtonProps(exam);
                                                                        const status = getExamStatus(exam._id);
                                                                        
                                                                        return (
                                                                            <Paper 
                                                                                key={exam._id}
                                                                                variant="outlined"
                                                                                sx={{ 
                                                                                    p: 2.5,
                                                                                    borderRadius: 2,
                                                                                    borderLeft: '4px solid',
                                                                                    borderLeftColor: status.completed 
                                                                                        ? (status.passed ? 'success.main' : 'error.main')
                                                                                        : 'primary.main',
                                                                                    transition: 'all 0.2s ease-in-out',
                                                                                    '&:hover': {
                                                                                        transform: 'translateY(-2px)',
                                                                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                                                                    <Typography variant="subtitle1" fontWeight="600" color="text.primary">
                                                                                        {exam.title}
                                                                                    </Typography>
                                                                                    <Stack direction="row" spacing={0.5}>
                                                                                        {status.completed && (
                                                                                            <Chip
                                                                                                icon={status.passed ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <GradeIcon sx={{ fontSize: 16 }} />}
                                                                                                label={status.passed ? 'Passed' : 'Failed'}
                                                                                                size="small"
                                                                                                color={status.passed ? 'success' : 'error'}
                                                                                                sx={{ fontSize: '0.7rem' }}
                                                                                            />
                                                                                        )}
                                                                                        {exam.scheduleType === 'flexible' && (
                                                                                            <Chip
                                                                                                icon={<TimerIcon sx={{ fontSize: 16 }} />}
                                                                                                label="Flexible"
                                                                                                size="small"
                                                                                                variant="outlined"
                                                                                                sx={{ 
                                                                                                    borderColor: 'info.main',
                                                                                                    color: 'info.main',
                                                                                                    fontSize: '0.7rem'
                                                                                                }}
                                                                                            />
                                                                                        )}
                                                                                    </Stack>
                                                                                </Box>
                                                                                
                                                                                {exam.description && (
                                                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.5 }}>
                                                                                        {exam.description}
                                                                                    </Typography>
                                                                                )}
                                                                                
                                                                                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                                                                    <Chip 
                                                                                        label={`${exam.questions?.length || 0} Questions`} 
                                                                                        size="small"
                                                                                        sx={{ 
                                                                                            backgroundColor: 'primary.50',
                                                                                            color: 'primary.main',
                                                                                            fontSize: '0.7rem'
                                                                                        }}
                                                                                    />
                                                                                    <Chip 
                                                                                        label={formatExamDuration(exam.timeLimit)} 
                                                                                        size="small"
                                                                                        sx={{ 
                                                                                            backgroundColor: 'warning.50',
                                                                                            color: 'warning.main',
                                                                                            fontSize: '0.7rem'
                                                                                        }}
                                                                                    />
                                                                                    <Chip 
                                                                                        label={`${exam.passingMarks || 60}% to pass`} 
                                                                                        size="small"
                                                                                        sx={{ 
                                                                                            backgroundColor: 'success.50',
                                                                                            color: 'success.main',
                                                                                            fontSize: '0.7rem'
                                                                                        }}
                                                                                    />
                                                                                </Stack>

                                                                                <Box sx={{ mb: 2 }}>
                                                                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                                                                        Schedule
                                                                                    </Typography>
                                                                                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                                                                                        {getExamScheduleText(exam)}
                                                                                    </Typography>
                                                                                    {status.completed && (
                                                                                        <Typography variant="caption" color="success.main" sx={{ fontWeight: 500 }}>
                                                                                            Completed: {formatDate(status.completedAt)}
                                                                                        </Typography>
                                                                                    )}
                                                                                </Box>

                                                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                                                    <Button
                                                                                        variant={buttonProps.variant}
                                                                                        size="small"
                                                                                        color={buttonProps.color}
                                                                                        startIcon={buttonProps.startIcon}
                                                                                        onClick={buttonProps.onClick}
                                                                                        disabled={buttonProps.disabled}
                                                                                        sx={{ 
                                                                                            minWidth: 120,
                                                                                            borderRadius: 2,
                                                                                            textTransform: 'none',
                                                                                            fontSize: '0.8rem',
                                                                                            fontWeight: 500
                                                                                        }}
                                                                                    >
                                                                                        {buttonProps.text}
                                                                                    </Button>
                                                                                </Box>
                                                                            </Paper>
                                                                        );
                                                                    })}
                                                                </Stack>
                                                            ) : (
                                                                <Box sx={{ 
                                                                    py: 6, 
                                                                    textAlign: 'center',
                                                                    backgroundColor: 'grey.50',
                                                                    borderRadius: 2,
                                                                    border: '2px dashed',
                                                                    borderColor: 'grey.300'
                                                                }}>
                                                                    <AssignmentIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                                                                    <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
                                                                        No assessments available
                                                                    </Typography>
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        Flexible exams will appear here when ready
                                                                    </Typography>
                                                                </Box>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </Paper>
                                );
                            })
                        ) : subjectsError ? (
                            <Paper sx={{ 
                                p: 6, 
                                textAlign: 'center',
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: 'error.200',
                                backgroundColor: 'error.50'
                            }}>
                                <Typography color="error.main" variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                    {subjectsError}
                                </Typography>
                                <Typography color="text.secondary" variant="body2">
                                    Please contact your administrator if this problem persists.
                                </Typography>
                            </Paper>
                        ) : (
                            <Paper sx={{ 
                                p: 6, 
                                textAlign: 'center',
                                borderRadius: 3,
                                border: '2px dashed',
                                borderColor: 'grey.300',
                                backgroundColor: 'grey.50'
                            }}>
                                <SchoolIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                    No courses available
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Your courses will appear here once they're assigned
                                </Typography>
                            </Paper>
                        )}
                    </Stack>

                    {/* Info Section */}
                    <Paper elevation={0} sx={{ 
                        p: 4, 
                        mt: 6, 
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 50%, #f3e8ff 100%)',
                        border: '1px solid',
                        borderColor: 'primary.100'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <SchoolIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                            <Typography variant="h6" color="primary.main" fontWeight="600">
                                Learning Platform Features
                            </Typography>
                        </Box>
                        <Grid container spacing={4}>
                            <Grid item xs={12} md={4}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <BookIcon sx={{ fontSize: 40, color: 'info.main', mb: 2 }} />
                                    <Typography variant="h6" color="text.primary" sx={{ mb: 1, fontWeight: 600 }}>
                                        Interactive Lessons
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                        Access detailed lesson plans with objectives, materials, and structured content for effective learning.
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <TimerIcon sx={{ fontSize: 40, color: 'warning.main', mb: 2 }} />
                                    <Typography variant="h6" color="text.primary" sx={{ mb: 1, fontWeight: 600 }}>
                                        Flexible Scheduling
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                        Take assessments at your own pace within availability periods. Perfect for self-directed learning.
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main', mb: 2 }} />
                                    <Typography variant="h6" color="text.primary" sx={{ mb: 1, fontWeight: 600 }}>
                                        Instant Feedback
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                        Get immediate results and review questions after completing assessments to enhance understanding.
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                </Container>
            </Box>

            {/* Lesson Plan Modal */}
            {selectedLessonPlan && (
                <Box sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1300,
                    p: 2
                }}>
                    <Paper sx={{
                        maxWidth: 900,
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        borderRadius: 3,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        <Box sx={{ 
                            p: 4,
                            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                            color: 'white'
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                                        Lesson Plan Details
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                        {selectedLessonPlan.subject?.subName} • Week {selectedLessonPlan.week}
                                    </Typography>
                                </Box>
                                <Button
                                    onClick={() => setSelectedLessonPlan(null)}
                                    sx={{
                                        minWidth: 'auto',
                                        p: 1,
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                        }
                                    }}
                                >
                                    <Typography sx={{ fontSize: 24, fontWeight: 300 }}>×</Typography>
                                </Button>
                            </Box>
                        </Box>
                        
                        <Box sx={{ p: 4 }}>
                            <Typography variant="h6" color="text.primary" sx={{ mb: 3, fontWeight: 600 }}>
                                {selectedLessonPlan.title}
                            </Typography>
                            
                            <Grid container spacing={3} sx={{ mb: 4 }}>
                                <Grid item xs={12} sm={6}>
                                    <Stack spacing={2}>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                Duration
                                            </Typography>
                                            <Typography variant="body1" fontWeight="500">
                                                {formatDuration(selectedLessonPlan.duration)}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                Term
                                            </Typography>
                                            <Typography variant="body1" fontWeight="500">
                                                {selectedLessonPlan.term}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Stack spacing={2}>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                Date
                                            </Typography>
                                            <Typography variant="body1" fontWeight="500">
                                                {formatDate(selectedLessonPlan.lessonDate)}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                Week
                                            </Typography>
                                            <Typography variant="body1" fontWeight="500">
                                                Week {selectedLessonPlan.week}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            <Stack spacing={4}>
                                {selectedLessonPlan.objectives && selectedLessonPlan.objectives.length > 0 && (
                                    <Box>
                                        <Typography variant="h6" color="primary.main" sx={{ mb: 2, fontWeight: 600 }}>
                                            Learning Objectives
                                        </Typography>
                                        <Stack spacing={1}>
                                            {selectedLessonPlan.objectives.map((obj, index) => (
                                                <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                                    <Box sx={{ 
                                                        width: 6, 
                                                        height: 6, 
                                                        borderRadius: '50%', 
                                                        backgroundColor: 'primary.main',
                                                        mt: 1,
                                                        flexShrink: 0
                                                    }} />
                                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                                        {typeof obj === 'object' ? obj.description || obj.type : obj}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Stack>
                                    </Box>
                                )}

                                {selectedLessonPlan.materials && selectedLessonPlan.materials.length > 0 && (
                                    <Box>
                                        <Typography variant="h6" color="primary.main" sx={{ mb: 2, fontWeight: 600 }}>
                                            Required Materials
                                        </Typography>
                                        <Stack spacing={1}>
                                            {selectedLessonPlan.materials.map((material, index) => (
                                                <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                                    <Box sx={{ 
                                                        width: 6, 
                                                        height: 6, 
                                                        borderRadius: '50%', 
                                                        backgroundColor: 'info.main',
                                                        mt: 1,
                                                        flexShrink: 0
                                                    }} />
                                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                                        {typeof material === 'object' ? material.description || material.type : material}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Stack>
                                    </Box>
                                )}

                                {selectedLessonPlan.activities && selectedLessonPlan.activities.length > 0 && (
                                    <Box>
                                        <Typography variant="h6" color="primary.main" sx={{ mb: 2, fontWeight: 600 }}>
                                            Learning Activities
                                        </Typography>
                                        <Stack spacing={1}>
                                            {selectedLessonPlan.activities.map((activity, index) => (
                                                <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                                    <Box sx={{ 
                                                        width: 6, 
                                                        height: 6, 
                                                        borderRadius: '50%', 
                                                        backgroundColor: 'success.main',
                                                        mt: 1,
                                                        flexShrink: 0
                                                    }} />
                                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                                        {typeof activity === 'object' ? activity.description || activity.type : activity}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Stack>
                                    </Box>
                                )}

                                {selectedLessonPlan.assessment && (
                                    <Box>
                                        <Typography variant="h6" color="primary.main" sx={{ mb: 2, fontWeight: 600 }}>
                                            Assessment Method
                                        </Typography>
                                        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, backgroundColor: 'grey.50' }}>
                                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                                {typeof selectedLessonPlan.assessment === 'object' 
                                                    ? selectedLessonPlan.assessment.description || selectedLessonPlan.assessment.type 
                                                    : selectedLessonPlan.assessment}
                                            </Typography>
                                        </Paper>
                                    </Box>
                                )}

                                {selectedLessonPlan.notes && (
                                    <Box>
                                        <Typography variant="h6" color="primary.main" sx={{ mb: 2, fontWeight: 600 }}>
                                            Additional Notes
                                        </Typography>
                                        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, backgroundColor: 'grey.50' }}>
                                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                                {typeof selectedLessonPlan.notes === 'object' 
                                                    ? selectedLessonPlan.notes.description || selectedLessonPlan.notes.type 
                                                    : selectedLessonPlan.notes}
                                            </Typography>
                                        </Paper>
                                    </Box>
                                )}
                                </Stack>

                            <Box sx={{ textAlign: 'center', mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'grey.200' }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<ArticleIcon />}
                                    onClick={() => {
                                        setSelectedLessonPlan(null);
                                        window.location.href = `/lesson-plan/?planId=${selectedLessonPlan._id}`;
                                    }}
                                    sx={{
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: 2,
                                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                        fontSize: '0.9rem',
                                        fontWeight: 500,
                                        boxShadow: '0 4px 12px rgba(6, 168, 74, 0.83)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 8px 25px rgba(37, 99, 235, 0.4)'
                                        }
                                    }}
                                >
                                    View Complete Lesson Plan
                                </Button>
                            </Box>
                        </Box>
                    </Paper>
                </Box>
            )}
        </ThemeProvider>
    );
};

export default StudentSubjects;