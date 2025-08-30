import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    Avatar,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    LinearProgress,
    CircularProgress,
    Alert,
    Tabs,
    Tab,
    Divider,
    Button,
    IconButton,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Badge,
    Tooltip,
    Stack
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    School as SchoolIcon,
    Class as ClassIcon,
    Grade as GradeIcon,
    Assignment as AssignmentIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    TrendingUp as TrendingUpIcon,
    CalendarToday as CalendarIcon,
    ExpandMore as ExpandMoreIcon,
    Quiz as QuizIcon,
    AccessTime as AccessTimeIcon,
    ArrowBack as ArrowBackIcon,
    Edit as EditIcon,
    Assessment as AssessmentIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';

// Enhanced theme for better visual appeal
const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0',
        },
        secondary: {
            main: '#dc004e',
        },
        success: {
            main: '#2e7d32',
        },
        warning: {
            main: '#ed6c02',
        },
        error: {
            main: '#d32f2f',
        },
        background: {
            default: '#f5f5f5',
            paper: '#ffffff',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 700,
            color: '#1565c0',
        },
        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 500,
        },
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderRadius: '12px',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: '12px',
                },
            },
        },
    },
});

const REACT_APP_BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

// Custom Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`student-tabpanel-${index}`}
            aria-labelledby={`student-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const ComprehensiveStudentView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [student, setStudent] = useState(null);
    const [examResults, setExamResults] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tabValue, setTabValue] = useState(0);
    const [stats, setStats] = useState({
        totalSubjects: 0,
        averageMarks: 0,
        totalExams: 0,
        passedExams: 0,
        attendancePercentage: 0,
        totalClasses: 0,
        presentDays: 0
    });

    useEffect(() => {
        if (id) {
            fetchAllStudentData();
        }
    }, [id]);

    const fetchAllStudentData = async () => {
        try {
            setLoading(true);
            setError('');
            console.log('🔍 Fetching student data for ID:', id);

            // ✅ FIXED: Use the correct API endpoint
            const studentResponse = await axios.get(`${REACT_APP_BASE_URL}/Student/${id}`);
            console.log('👨‍🎓 Student API Response:', studentResponse.data);

            // Handle both formats: with success flag and without
            const studentData = studentResponse.data.success ? studentResponse.data : studentResponse.data;
            if (!studentData || (!studentData.name && !studentData._id)) {
                throw new Error('Student data not found');
            }
            
            setStudent(studentData);
            console.log('✅ Student data set:', studentData.name);

            // Fetch class subjects if student has a class
            let subjectsData = [];
            if (studentData.sclassName?._id) {
                console.log('📚 Fetching subjects for class:', studentData.sclassName._id);
                try {
                    const subjectsResponse = await axios.get(`${REACT_APP_BASE_URL}/ClassSubjects/${studentData.sclassName._id}`);
                    console.log('📚 Subjects API Response:', subjectsResponse.data);
                    
                    // Handle both response formats
                    if (subjectsResponse.data.success) {
                        subjectsData = subjectsResponse.data.subjects || [];
                    } else if (Array.isArray(subjectsResponse.data)) {
                        subjectsData = subjectsResponse.data;
                    } else {
                        subjectsData = [];
                    }
                    setSubjects(subjectsData);
                    console.log('✅ Subjects loaded:', subjectsData.length);
                } catch (subjectsError) {
                    console.warn('⚠️ Could not fetch subjects:', subjectsError);
                    setSubjects([]);
                }
            } else {
                console.log('⚠️ Student has no class assigned');
                setSubjects([]);
            }

            // ✅ FIXED: Fetch exam results using the corrected endpoint
            let examResultsData = [];
            try {
                console.log('📊 Fetching exam results for student:', id);
                const examResultsResponse = await axios.get(`${REACT_APP_BASE_URL}/student/${id}/exam-results`);
                console.log('📊 Exam Results API Response:', examResultsResponse.data);
                
                if (examResultsResponse.data.success && examResultsResponse.data.examResults) {
                    examResultsData = examResultsResponse.data.examResults;
                } else if (Array.isArray(examResultsResponse.data)) {
                    examResultsData = examResultsResponse.data;
                } else {
                    examResultsData = [];
                }
                setExamResults(examResultsData);
                console.log('✅ Exam results loaded:', examResultsData.length);
            } catch (examError) {
                console.warn('⚠️ Could not fetch exam results:', examError);
                setExamResults([]);
            }

            // Calculate statistics
            calculateStats(studentData, subjectsData, examResultsData);

        } catch (err) {
            console.error('❌ Error fetching student data:', err);
            let errorMessage = 'Failed to fetch student data. Please try again.';
            
            if (err.response?.status === 404) {
                errorMessage = 'Student not found.';
            } else if (err.response?.status === 400) {
                errorMessage = 'Invalid student ID.';
            } else if (err.code === 'ECONNREFUSED') {
                errorMessage = 'Cannot connect to server. Please check if the server is running.';
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (studentData, subjectsData, examResultsData) => {
        const totalSubjects = subjectsData.length;
        
        // Calculate exam statistics
        const totalExams = examResultsData.length;
        const passedExams = examResultsData.filter(result => result.passed).length;
        const averageScore = totalExams > 0 
            ? Math.round(examResultsData.reduce((sum, result) => sum + result.percentage, 0) / totalExams)
            : 0;

        // Calculate attendance statistics
        const attendance = studentData.attendance || [];
        const totalClasses = attendance.length;
        const presentDays = attendance.filter(record => record.status === 'Present').length;
        const attendancePercentage = totalClasses > 0 
            ? Math.round((presentDays / totalClasses) * 100)
            : 0;

        // Calculate average marks from exam results (prefer exam results over examResult field)
        const totalMarks = studentData.examResult || [];
        const averageMarks = totalExams > 0 ? averageScore : (
            totalMarks.length > 0
                ? Math.round(totalMarks.reduce((sum, result) => sum + (result.marksObtained || 0), 0) / totalMarks.length)
                : 0
        );

        setStats({
            totalSubjects,
            averageMarks: averageScore || averageMarks, // Use exam average if available
            totalExams,
            passedExams,
            attendancePercentage,
            totalClasses,
            presentDays
        });

        console.log('📊 Statistics calculated:', {
            totalSubjects,
            averageMarks: averageScore || averageMarks,
            totalExams,
            passedExams,
            attendancePercentage
        });
    };

    const getGradeFromPercentage = (percentage) => {
        if (percentage >= 90) return { grade: 'A+', color: 'success' };
        if (percentage >= 80) return { grade: 'A', color: 'success' };
        if (percentage >= 70) return { grade: 'B+', color: 'info' };
        if (percentage >= 60) return { grade: 'B', color: 'warning' };
        if (percentage >= 50) return { grade: 'C', color: 'warning' };
        return { grade: 'F', color: 'error' };
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (seconds) => {
        if (!seconds) return 'N/A';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    if (loading) {
        return (
            <ThemeProvider theme={theme}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <CircularProgress size={60} />
                    <Typography sx={{ ml: 2 }}>Loading student details...</Typography>
                </Box>
            </ThemeProvider>
        );
    }

    if (error) {
        return (
            <ThemeProvider theme={theme}>
                <Box sx={{ p: 3 }}>
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                    <Button variant="contained" onClick={fetchAllStudentData}>
                        Retry
                    </Button>
                </Box>
            </ThemeProvider>
        );
    }

    if (!student) {
        return (
            <ThemeProvider theme={theme}>
                <Box sx={{ p: 3 }}>
                    <Alert severity="warning">
                        Student not found.
                    </Alert>
                    <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
                        Go Back
                    </Button>
                </Box>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', p: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <IconButton 
                        onClick={() => navigate(-1)} 
                        sx={{ mr: 2 }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4" sx={{ flexGrow: 1 }}>
                        Student Profile
                    </Typography>
                    <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => navigate(`/Admin/students/edit/${id}`)}
                    >
                        Edit Student
                    </Button>
                </Box>

                {/* Student Basic Info Card */}
                <Paper elevation={0} sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    <Box sx={{ p: 4 }}>
                        <Grid container spacing={3} alignItems="center">
                            <Grid item>
                                <Avatar 
                                    sx={{ 
                                        width: 100, 
                                        height: 100, 
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        fontSize: '2.5rem',
                                        border: '4px solid rgba(255,255,255,0.3)'
                                    }}
                                >
                                    {student.name?.charAt(0)?.toUpperCase() || 'S'}
                                </Avatar>
                            </Grid>
                            <Grid item xs>
                                <Typography variant="h4" sx={{ mb: 1, color: 'white' }}>
                                    {student.name || 'Unknown Student'}
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item>
                                        <Chip 
                                            icon={<PersonIcon />}
                                            label={`Roll No: ${student.rollNum || 'N/A'}`}
                                            sx={{ 
                                                backgroundColor: 'rgba(255,255,255,0.2)',
                                                color: 'white',
                                                '& .MuiChip-icon': { color: 'white' }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item>
                                        <Chip 
                                            icon={<ClassIcon />}
                                            label={student.sclassName?.sclassName || 'Class'}
                                            sx={{ 
                                                backgroundColor: 'rgba(255,255,255,0.2)',
                                                color: 'white',
                                                '& .MuiChip-icon': { color: 'white' }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item>
                                        <Chip 
                                            icon={<SchoolIcon />}
                                            label={student.school?.schoolName || 'School Info Not Available'}
                                            sx={{ 
                                                backgroundColor: 'rgba(255,255,255,0.2)',
                                                color: 'white',
                                                '& .MuiChip-icon': { color: 'white' }
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>

                {/* Statistics Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={2}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                <AssignmentIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                                <Typography variant="h4" color="primary.main">
                                    {stats.totalSubjects}
                                </Typography>
                                <Typography color="textSecondary">
                                    Total Subjects
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                <TrendingUpIcon color="success" sx={{ fontSize: 48, mb: 2 }} />
                                <Typography variant="h4" color="success.main">
                                    {stats.averageMarks}%
                                </Typography>
                                <Typography color="textSecondary">
                                    Average Score
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                <QuizIcon color="info" sx={{ fontSize: 48, mb: 2 }} />
                                <Typography variant="h4" color="info.main">
                                    {stats.totalExams}
                                </Typography>
                                <Typography color="textSecondary">
                                    Total Exams
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                <CheckCircleIcon color="success" sx={{ fontSize: 48, mb: 2 }} />
                                <Typography variant="h4" color="success.main">
                                    {stats.passedExams}
                                </Typography>
                                <Typography color="textSecondary">
                                    Passed Exams
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                <CalendarIcon color="warning" sx={{ fontSize: 48, mb: 2 }} />
                                <Typography variant="h4" color="warning.main">
                                    {stats.attendancePercentage}%
                                </Typography>
                                <Typography color="textSecondary">
                                    Attendance
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                <AccessTimeIcon color="secondary" sx={{ fontSize: 48, mb: 2 }} />
                                <Typography variant="h4" color="secondary.main">
                                    {stats.presentDays}/{stats.totalClasses}
                                </Typography>
                                <Typography color="textSecondary">
                                    Present Days
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Detailed Information Tabs */}
                <Paper elevation={0}>
                    <Tabs 
                        value={tabValue} 
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            borderBottom: 1,
                            borderColor: 'divider',
                            '& .MuiTab-root': {
                                minHeight: 64,
                                fontSize: '1.1rem',
                                fontWeight: 600
                            }
                        }}
                    >
                        <Tab label={`Subjects (${stats.totalSubjects})`} />
                        <Tab label={`Exam Results (${stats.totalExams})`} />
                        <Tab label={`Attendance (${stats.totalClasses})`} />
                        <Tab label="Academic Performance" />
                    </Tabs>

                    {/* Subjects Tab */}
                    <TabPanel value={tabValue} index={0}>
                        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                            Enrolled Subjects
                        </Typography>
                        {subjects.length > 0 ? (
                            <Grid container spacing={3}>
                                {subjects.map((subject, index) => (
                                    <Grid item xs={12} md={6} key={subject._id || index}>
                                        <Card elevation={2}>
                                            <CardContent>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                    <Box>
                                                        <Typography variant="h6" color="primary">
                                                            {subject.subName || 'Unknown Subject'}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Code: {subject.subCode || 'N/A'}
                                                        </Typography>
                                                    </Box>
                                                    <Chip 
                                                        label={subject.isActive ? 'Active' : 'Inactive'}
                                                        color={subject.isActive ? 'success' : 'default'}
                                                        size="small"
                                                    />
                                                </Box>
                                                
                                                <Typography variant="body2" sx={{ mb: 2 }}>
                                                    {subject.description || 'No description available'}
                                                </Typography>
                                                
                                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                    <Chip 
                                                        icon={<AccessTimeIcon />}
                                                        label={`${subject.sessions || 0} Sessions`}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                    {subject.teacher && (
                                                        <Chip 
                                                            label={`Teacher: ${subject.teacher.name}`}
                                                            size="small"
                                                            variant="outlined"
                                                            color="primary"
                                                        />
                                                    )}
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Alert severity="info">
                                No subjects enrolled yet. The student needs to be assigned to a class with subjects.
                            </Alert>
                        )}
                    </TabPanel>

                    {/* Exam Results Tab */}
                    <TabPanel value={tabValue} index={1}>
                        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                            Exam Results & Performance
                        </Typography>
                        {examResults.length > 0 ? (
                            <Grid container spacing={3}>
                                {examResults.map((result, index) => {
                                    const gradeInfo = getGradeFromPercentage(result.percentage);
                                    return (
                                        <Grid item xs={12} key={result._id || index}>
                                            <Card elevation={2}>
                                                <CardContent>
                                                    <Grid container spacing={3} alignItems="center">
                                                        <Grid item xs={12} md={6}>
                                                            <Typography variant="h6" color="primary" gutterBottom>
                                                                {result.examId?.title || `Exam ${index + 1}`}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                                Subject: {result.examId?.subject?.subName || 'Unknown'}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Submitted: {formatDate(result.submittedAt || result.createdAt)}
                                                            </Typography>
                                                        </Grid>
                                                        
                                                        <Grid item xs={12} md={6}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                                <Typography variant="h4" color={gradeInfo.color + '.main'}>
                                                                    {result.percentage}%
                                                                </Typography>
                                                                <Chip
                                                                    label={gradeInfo.grade}
                                                                    color={gradeInfo.color}
                                                                    sx={{ fontSize: '1rem', fontWeight: 'bold' }}
                                                                />
                                                            </Box>
                                                            
                                                            <Box sx={{ mb: 2 }}>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    Score Progress
                                                                </Typography>
                                                                <LinearProgress 
                                                                    variant="determinate" 
                                                                    value={result.percentage} 
                                                                    sx={{ height: 8, borderRadius: 4 }}
                                                                    color={gradeInfo.color}
                                                                />
                                                            </Box>
                                                            
                                                            <Grid container spacing={2}>
                                                                <Grid item xs={4}>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        Score
                                                                    </Typography>
                                                                    <Typography variant="body1" fontWeight="bold">
                                                                        {result.score}/{result.totalQuestions}
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item xs={4}>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        Time
                                                                    </Typography>
                                                                    <Typography variant="body1" fontWeight="bold">
                                                                        {formatTime(result.timeSpent)}
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item xs={4}>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        Status
                                                                    </Typography>
                                                                    <Chip
                                                                        icon={result.passed ? <CheckCircleIcon /> : <CancelIcon />}
                                                                        label={result.passed ? 'PASSED' : 'FAILED'}
                                                                        color={result.passed ? 'success' : 'error'}
                                                                        size="small"
                                                                    />
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        ) : (
                            <Alert severity="info">
                                No exam results available yet. Results will appear here once the student completes exams.
                            </Alert>
                        )}
                    </TabPanel>

                    {/* Attendance Tab */}
                    <TabPanel value={tabValue} index={2}>
                        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                            Attendance Record
                        </Typography>
                        
                        {/* Attendance Summary */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} md={4}>
                                <Card>
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <CheckCircleIcon color="success" sx={{ fontSize: 48, mb: 2 }} />
                                        <Typography variant="h4" color="success.main">
                                            {stats.presentDays}
                                        </Typography>
                                        <Typography color="textSecondary">
                                            Present Days
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Card>
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <CancelIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
                                        <Typography variant="h4" color="error.main">
                                            {stats.totalClasses - stats.presentDays}
                                        </Typography>
                                        <Typography color="textSecondary">
                                            Absent Days
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Card>
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <TrendingUpIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                                        <Typography variant="h4" color="primary.main">
                                            {stats.attendancePercentage}%
                                        </Typography>
                                        <Typography color="textSecondary">
                                            Attendance Rate
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* Attendance Details */}
                        {student.attendance && student.attendance.length > 0 ? (
                            <TableContainer component={Paper} elevation={2}>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: 'primary.main' }}>
                                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Subject</TableCell>
                                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {student.attendance
                                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                                            .map((record, index) => (
                                                <TableRow key={index} hover>
                                                    <TableCell>{formatDate(record.date)}</TableCell>
                                                    <TableCell>
                                                        {record.subName?.subName || 'Unknown Subject'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            icon={record.status === 'Present' ? <CheckCircleIcon /> : <CancelIcon />}
                                                            label={record.status}
                                                            color={record.status === 'Present' ? 'success' : 'error'}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Alert severity="info">
                                No attendance records available.
                            </Alert>
                        )}
                    </TabPanel>

                    {/* Academic Performance Tab */}
                    <TabPanel value={tabValue} index={3}>
                        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                            Academic Performance Analysis
                        </Typography>
                        
                        {/* Performance Overview */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} md={6}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom color="primary">
                                            Overall Performance
                                        </Typography>
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Average Score: {stats.averageMarks}%
                                            </Typography>
                                            <LinearProgress 
                                                variant="determinate" 
                                                value={stats.averageMarks} 
                                                sx={{ height: 10, borderRadius: 5, mt: 1 }}
                                            />
                                        </Box>
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Attendance: {stats.attendancePercentage}%
                                            </Typography>
                                            <LinearProgress 
                                                variant="determinate" 
                                                value={stats.attendancePercentage} 
                                                sx={{ height: 10, borderRadius: 5, mt: 1 }}
                                                color="secondary"
                                            />
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Pass Rate: {stats.totalExams > 0 ? Math.round((stats.passedExams / stats.totalExams) * 100) : 0}%
                                            </Typography>
                                            <LinearProgress 
                                                variant="determinate" 
                                                value={stats.totalExams > 0 ? (stats.passedExams / stats.totalExams) * 100 : 0} 
                                                sx={{ height: 10, borderRadius: 5, mt: 1 }}
                                                color="success"
                                            />
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom color="primary">
                                            Academic Summary
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2">Enrolled Subjects:</Typography>
                                                <Typography variant="body2" fontWeight="bold">{stats.totalSubjects}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2">Exams Taken:</Typography>
                                                <Typography variant="body2" fontWeight="bold">{stats.totalExams}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2">Exams Passed:</Typography>
                                                <Typography variant="body2" fontWeight="bold" color="success.main">
                                                    {stats.passedExams}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2">Class Attendance:</Typography>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {stats.presentDays}/{stats.totalClasses}
                                                </Typography>
                                            </Box>
                                            {stats.totalExams > 0 && (
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2">Current Grade:</Typography>
                                                    <Chip 
                                                        label={getGradeFromPercentage(stats.averageMarks).grade}
                                                        color={getGradeFromPercentage(stats.averageMarks).color}
                                                        size="small"
                                                    />
                                                </Box>
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* Performance Tips */}
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom color="primary">
                                    Performance Insights
                                </Typography>
                                <Grid container spacing={2}>
                                    {stats.averageMarks < 60 && (
                                        <Grid item xs={12}>
                                            <Alert severity="warning">
                                                <strong>Academic Support Needed:</strong> The student's average score is below 60%. 
                                                Consider additional tutoring or study support.
                                            </Alert>
                                        </Grid>
                                    )}
                                    {stats.attendancePercentage < 80 && (
                                        <Grid item xs={12}>
                                            <Alert severity="error">
                                                <strong>Attendance Concern:</strong> Attendance is below 80%. 
                                                Regular attendance is crucial for academic success.
                                            </Alert>
                                        </Grid>
                                    )}
                                    {stats.averageMarks >= 80 && stats.attendancePercentage >= 90 && (
                                        <Grid item xs={12}>
                                            <Alert severity="success">
                                                <strong>Excellent Performance:</strong> The student is performing very well 
                                                with good grades and excellent attendance. Keep up the great work!
                                            </Alert>
                                        </Grid>
                                    )}
                                    {stats.totalExams === 0 && (
                                        <Grid item xs={12}>
                                            <Alert severity="info">
                                                <strong>No Exam Data:</strong> The student hasn't taken any exams yet. 
                                                Performance analysis will be available after completing some exams.
                                            </Alert>
                                        </Grid>
                                    )}
                                </Grid>
                            </CardContent>
                        </Card>
                    </TabPanel>
                </Paper>
            </Box>
        </ThemeProvider>
    );
};

export default ComprehensiveStudentView;