import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Card,
    CardContent,
    Grid,
    Button,
    Chip,
    IconButton,
    Alert,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Collapse,
    LinearProgress,
    Tabs,
    Tab,
    Divider,
    Stack,
    Tooltip
} from '@mui/material';
import {
    Assignment as AssignmentIcon,
    Schedule as ScheduleIcon,
    People as PeopleIcon,
    TrendingUp as TrendingUpIcon,
    ArrowBack as ArrowBackIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Person as PersonIcon,
    Quiz as QuizIcon,
    School as SchoolIcon,
    AccessTime as AccessTimeIcon,
    Grade as GradeIcon
} from '@mui/icons-material';
import { BlueButton, GreenButton } from '../../components/buttonStyles';
import { StyledTableCell, StyledTableRow } from '../../components/styles';
import axios from 'axios';

const REACT_APP_BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

// Custom Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`exam-tabpanel-${index}`}
            aria-labelledby={`exam-tab-${index}`}
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

const ExamsPage = () => {
    const navigate = useNavigate();
    const { currentUser } = useSelector((state) => state.user);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [tabValue, setTabValue] = useState(0);
    const [expandedRows, setExpandedRows] = useState(new Set());
    
    // Data states
    const [teacherData, setTeacherData] = useState(null);
    const [exams, setExams] = useState([]);
    const [examResults, setExamResults] = useState([]);
    const [myStudents, setMyStudents] = useState([]);
    const [stats, setStats] = useState({
        totalExams: 0,
        totalStudents: 0,
        totalSubmissions: 0,
        averageScore: 0,
        passRate: 0,
        subjectBreakdown: []
    });

    useEffect(() => {
        if (currentUser) {
            fetchAllExamData();
        }
    }, [currentUser]);

    const fetchAllExamData = async () => {
        try {
            setLoading(true);
            setError('');

            // 1. First, get the current teacher's detailed information
            const teacherResponse = await axios.get(`${REACT_APP_BASE_URL}/Teacher/${currentUser._id}`);
            const teacherData = teacherResponse.data;

            if (teacherData.message) {
                setError("Teacher data not found");
                return;
            }

            console.log("Teacher data:", teacherData);

            // 2. Populate teacher assignments if needed
            if (teacherData.assignments && teacherData.assignments.length > 0) {
                for (let assignment of teacherData.assignments) {
                    if (assignment.subject && typeof assignment.subject === 'string') {
                        try {
                            const subjectResponse = await axios.get(`${REACT_APP_BASE_URL}/Subject/${assignment.subject}`);
                            const subjectData = subjectResponse.data;
                            if (subjectData && !subjectData.message) {
                                assignment.subject = subjectData;
                            }
                        } catch (error) {
                            console.error('Error fetching subject:', error);
                        }
                    }

                    if (assignment.class && typeof assignment.class === 'string') {
                        try {
                            const classResponse = await axios.get(`${REACT_APP_BASE_URL}/Sclass/${assignment.class}`);
                            const classData = classResponse.data;
                            if (classData && !classData.message) {
                                assignment.class = classData;
                            }
                        } catch (error) {
                            console.error('Error fetching class:', error);
                        }
                    }
                }
            }

            setTeacherData(teacherData);

            // 3. Get all exams for teacher's subjects
            const allExams = [];
            const subjectIds = new Set();

            if (teacherData.assignments && teacherData.assignments.length > 0) {
                teacherData.assignments.forEach(assignment => {
                    const subjectId = assignment.subject._id || assignment.subject;
                    subjectIds.add(subjectId);
                });
            } else if (teacherData.teachSubject) {
                const subjectId = teacherData.teachSubject._id || teacherData.teachSubject;
                subjectIds.add(subjectId);
            }

            // Fetch exams for each subject
            for (const subjectId of subjectIds) {
                try {
                    const examResponse = await axios.get(`${REACT_APP_BASE_URL}/Subject/${subjectId}/exams`);
                    if (examResponse.data.success && examResponse.data.exams) {
                        allExams.push(...examResponse.data.exams);
                    }
                } catch (error) {
                    console.warn(`Could not fetch exams for subject ${subjectId}:`, error);
                }
            }

            setExams(allExams);
            console.log("Found exams:", allExams.length);

            // 4. Get students from teacher's classes
            const studentResponse = await axios.get(`${REACT_APP_BASE_URL}/Students/${currentUser.school._id}`);
            let allStudents = [];
            
            if (studentResponse.data.success) {
                allStudents = studentResponse.data;
            } else if (Array.isArray(studentResponse.data)) {
                allStudents = studentResponse.data;
            }

            // Filter students for teacher's classes
            let myStudents = [];
            if (teacherData.assignments && teacherData.assignments.length > 0) {
                const myClassIds = teacherData.assignments.map(assignment => 
                    assignment.class._id || assignment.class
                );
                myStudents = allStudents.filter(student => {
                    if (!student.sclassName) return false;
                    const studentClassId = student.sclassName._id || student.sclassName;
                    return myClassIds.includes(studentClassId);
                });
            } else if (teacherData.teachSclass) {
                const teacherClassId = teacherData.teachSclass._id || teacherData.teachSclass;
                myStudents = allStudents.filter(student => {
                    if (!student.sclassName) return false;
                    const studentClassId = student.sclassName._id || student.sclassName;
                    return studentClassId === teacherClassId;
                });
            }

            setMyStudents(myStudents);
            console.log("My students:", myStudents.length);

            // 5. Get exam results for all students
            const allExamResults = [];
            for (const student of myStudents) {
                try {
                    const resultsResponse = await axios.get(`${REACT_APP_BASE_URL}/student/${student._id}/exam-results`);
                    if (resultsResponse.data.success && resultsResponse.data.examResults) {
                        // Add student info to each result
                        const studentResults = resultsResponse.data.examResults.map(result => ({
                            ...result,
                            studentInfo: {
                                _id: student._id,
                                name: student.name,
                                rollNum: student.rollNum,
                                sclassName: student.sclassName
                            }
                        }));
                        allExamResults.push(...studentResults);
                    }
                } catch (error) {
                    console.warn(`Could not fetch results for student ${student._id}:`, error);
                }
            }

            setExamResults(allExamResults);
            console.log("Total exam results:", allExamResults.length);

            // 6. Calculate statistics
            calculateStats(allExams, allExamResults, myStudents, subjectIds);

        } catch (err) {
            console.error('Error fetching exam data:', err);
            setError("Failed to fetch exam data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (exams, examResults, students, subjectIds) => {
        const totalExams = exams.length;
        const totalStudents = students.length;
        const totalSubmissions = examResults.length;
        
        // Calculate average score
        const averageScore = totalSubmissions > 0 
            ? Math.round(examResults.reduce((sum, result) => sum + result.percentage, 0) / totalSubmissions)
            : 0;

        // Calculate pass rate using proper logic
        const passedResults = examResults.filter(result => result.percentage >= 60).length;
        
        const passRate = totalSubmissions > 0 
            ? Math.round((passedResults / totalSubmissions) * 100)
            : 0;

        // Calculate subject breakdown
        const subjectBreakdown = {};
        examResults.forEach(result => {
            const subjectName = result.examId?.subject?.subName || 'Unknown Subject';
            if (!subjectBreakdown[subjectName]) {
                subjectBreakdown[subjectName] = {
                    name: subjectName,
                    totalSubmissions: 0,
                    totalScore: 0,
                    passed: 0
                };
            }
            subjectBreakdown[subjectName].totalSubmissions++;
            subjectBreakdown[subjectName].totalScore += result.percentage;
            
            // Calculate pass status for this result
            const examPassingPercentage = result.examId?.passingMarks && result.examId?.totalMarks
                ? (result.examId.passingMarks / result.examId.totalMarks) * 100 
                : 60;
            if (result.percentage >= examPassingPercentage) {
                subjectBreakdown[subjectName].passed++;
            }
        });

        const subjectBreakdownArray = Object.values(subjectBreakdown).map(subject => ({
            ...subject,
            averageScore: subject.totalSubmissions > 0 
                ? Math.round(subject.totalScore / subject.totalSubmissions)
                : 0,
            passRate: subject.totalSubmissions > 0
                ? Math.round((subject.passed / subject.totalSubmissions) * 100)
                : 0
        }));

        setStats({
            totalExams,
            totalStudents,
            totalSubmissions,
            averageScore,
            passRate,
            subjectBreakdown: subjectBreakdownArray
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

    const toggleRowExpansion = (examId) => {
        const newExpandedRows = new Set(expandedRows);
        if (newExpandedRows.has(examId)) {
            newExpandedRows.delete(examId);
        } else {
            newExpandedRows.add(examId);
        }
        setExpandedRows(newExpandedRows);
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleViewStudent = (studentId) => {
        navigate(`/Teacher/class/student/${studentId}`);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading exam data...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Button variant="contained" onClick={fetchAllExamData}>
                    Retry
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Box>
                        <Typography variant="h4" gutterBottom>
                            Student Exam Results
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            View exam performance of your students
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={2.4}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <AssignmentIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h4" color="primary">
                                {stats.totalExams}
                            </Typography>
                            <Typography color="textSecondary">
                                Available Exams
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <PeopleIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h4" color="secondary">
                                {stats.totalStudents}
                            </Typography>
                            <Typography color="textSecondary">
                                My Students
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <QuizIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h4" color="info.main">
                                {stats.totalSubmissions}
                            </Typography>
                            <Typography color="textSecondary">
                                Total Submissions
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <TrendingUpIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h4" color="success.main">
                                {stats.averageScore}%
                            </Typography>
                            <Typography color="textSecondary">
                                Average Score
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h4" color="success.main">
                                {stats.passRate}%
                            </Typography>
                            <Typography color="textSecondary">
                                Pass Rate
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Tabs */}
            <Paper elevation={0}>
                <Tabs 
                    value={tabValue} 
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        borderBottom: 1,
                        borderColor: 'divider'
                    }}
                >
                    
                    <Tab label={`Student Results (${examResults.length})`} />
                    <Tab label={`Available Exams (${exams.length})`} />
                    <Tab label={`Subject Analysis (${stats.subjectBreakdown.length})`} />
                </Tabs>

                {/* Available Exams Tab */}
                <TabPanel value={tabValue} index={1}>
                    {exams.length > 0 ? (
                        <Grid container spacing={3}>
                            {exams.map((exam) => (
                                <Grid item xs={12} md={6} lg={4} key={exam._id}>
                                    <Card elevation={2}>
                                        <CardContent>
                                            <Typography variant="h6" color="primary" gutterBottom>
                                                {exam.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                Subject: {exam.subject?.subName || 'Unknown'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                Class: {exam.class?.sclassName || 'Unknown'}
                                            </Typography>
                                            
                                            <Grid container spacing={1} sx={{ mb: 2 }}>
                                                <Grid item xs={6}>
                                                    <Typography variant="caption">Questions</Typography>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {exam.totalQuestions || exam.questions?.length || 0}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="caption">Total Marks</Typography>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {exam.totalMarks}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="caption">Duration</Typography>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {Math.floor(exam.timeLimit / 60)} min
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="caption">Passing</Typography>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {exam.passingMarks}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                            
                                            <Chip
                                                label={exam.isActive ? 'Active' : 'Inactive'}
                                                color={exam.isActive ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Alert severity="info">
                            No exams found for your subjects. Contact your administrator if you believe this is an error.
                        </Alert>
                    )}
                </TabPanel>

                {/* Student Results Tab */}
                <TabPanel value={tabValue} index={0}>
                    {examResults.length > 0 ? (
                        <TableContainer component={Paper} elevation={2}>
                            <Table>
                                <TableHead>
                                    <StyledTableRow>
                                        <StyledTableCell>Student</StyledTableCell>
                                        <StyledTableCell>Exam</StyledTableCell>
                                        <StyledTableCell>Subject</StyledTableCell>
                                        <StyledTableCell>Score</StyledTableCell>
                                        <StyledTableCell>Grade</StyledTableCell>
                                        <StyledTableCell>Status</StyledTableCell>
                                        <StyledTableCell>Date</StyledTableCell>
                                        
                                    </StyledTableRow>
                                </TableHead>
                                <TableBody>
                                    {examResults.map((result, index) => {
                                        const gradeInfo = getGradeFromPercentage(result.percentage);
                                        return (
                                            <StyledTableRow key={result._id || index} hover>
                                                <StyledTableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                                            <PersonIcon fontSize="small" />
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight="medium">
                                                                {result.studentInfo?.name || 'Unknown'}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Roll: {result.studentInfo?.rollNum || 'N/A'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </StyledTableCell>
                                                <StyledTableCell>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {result.examId?.title || 'Unknown Exam'}
                                                    </Typography>
                                                </StyledTableCell>
                                                <StyledTableCell>
                                                    <Typography variant="body2">
                                                        {result.examId?.subject?.subName || 'Unknown'}
                                                    </Typography>
                                                </StyledTableCell>
                                                <StyledTableCell>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="bold">
                                                            {result.score}/{result.totalQuestions}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {result.percentage}%
                                                        </Typography>
                                                    </Box>
                                                </StyledTableCell>
                                                <StyledTableCell>
                                                    <Chip
                                                        label={gradeInfo.grade}
                                                        color={gradeInfo.color}
                                                        size="small"
                                                    />
                                                </StyledTableCell>
                                             
                                    <StyledTableCell>
                                        {(() => {
                                            // Use a simple 60% threshold or calculate from available data
                                            const passingThreshold = 60; // Default passing percentage
                                            const isPassed = result.percentage >= passingThreshold;
                                            
                                            return (
                                                <Chip
                                                    icon={isPassed ? <CheckCircleIcon /> : <CancelIcon />}
                                                    label={isPassed ? 'PASSED' : 'FAILED'}
                                                    color={isPassed ? 'success' : 'error'}
                                                    size="small"
                                                />
                                            );
                                        })()}
                                    </StyledTableCell>
                                                <StyledTableCell>
                                                    <Typography variant="body2">
                                                        {formatDate(result.submittedAt || result.endTime)}
                                                    </Typography>
                                                </StyledTableCell>
                                                
                                            </StyledTableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Alert severity="info">
                            No exam results found. Results will appear here once students complete exams.
                        </Alert>
                    )}
                </TabPanel>

                {/* Subject Analysis Tab */}
                <TabPanel value={tabValue} index={2}>
                    {stats.subjectBreakdown.length > 0 ? (
                        <Grid container spacing={3}>
                            {stats.subjectBreakdown.map((subject, index) => (
                                <Grid item xs={12} md={6} key={index}>
                                    <Card elevation={2}>
                                        <CardContent>
                                            <Typography variant="h6" color="primary" gutterBottom>
                                                {subject.name}
                                            </Typography>
                                            
                                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                                <Grid item xs={4}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Submissions
                                                    </Typography>
                                                    <Typography variant="h6">
                                                        {subject.totalSubmissions}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Avg Score
                                                    </Typography>
                                                    <Typography variant="h6" color="primary">
                                                        {subject.averageScore}%
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Pass Rate
                                                    </Typography>
                                                    <Typography variant="h6" color="success.main">
                                                        {subject.passRate}%
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                            
                                            <Box sx={{ mb: 1 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Average Performance
                                                </Typography>
                                                <LinearProgress 
                                                    variant="determinate" 
                                                    value={subject.averageScore} 
                                                    sx={{ height: 8, borderRadius: 4, mt: 1 }}
                                                    color={subject.averageScore >= 70 ? 'success' : subject.averageScore >= 50 ? 'warning' : 'error'}
                                                />
                                            </Box>
                                            
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    Pass Rate
                                                </Typography>
                                                <LinearProgress 
                                                    variant="determinate" 
                                                    value={subject.passRate} 
                                                    sx={{ height: 8, borderRadius: 4, mt: 1 }}
                                                    color="success"
                                                />
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Alert severity="info">
                            No subject analysis available. Data will appear here once students complete exams in your subjects.
                        </Alert>
                    )}
                </TabPanel>
            </Paper>
        </Box>
    );
};

export default ExamsPage;