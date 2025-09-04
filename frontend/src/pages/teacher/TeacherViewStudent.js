import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import { useNavigate, useParams } from 'react-router-dom'
import { 
    Box, 
    Button, 
    Collapse, 
    Table, 
    TableBody, 
    TableHead, 
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    Alert,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    LinearProgress,
    Divider,
    Paper,
    Avatar,
    List,
    ListItem,
    ListItemText,
    ListItemIcon
} from '@mui/material';
import { 
    KeyboardArrowDown, 
    KeyboardArrowUp,
    Person,
    School,
    Class,
    Assignment,
    Quiz,
    TrendingUp,
    CheckCircle,
    Cancel,
    CalendarToday,
    Grade,
    ExpandMore,
    Assessment,
    BookmarkBorder
} from '@mui/icons-material';
import { calculateOverallAttendancePercentage, calculateSubjectAttendancePercentage, groupAttendanceBySubject } from '../../components/attendanceCalculator';
import CustomPieChart from '../../components/CustomPieChart'
import { PurpleButton, GreenButton, BlueButton } from '../../components/buttonStyles';
import { StyledTableCell, StyledTableRow } from '../../components/styles';
import axios from 'axios';

const TeacherViewStudent = () => {
    const navigate = useNavigate()
    const params = useParams()
    const dispatch = useDispatch();
    const { currentUser, userDetails, response, loading, error } = useSelector((state) => state.user);

    const address = "Student"
    const studentID = params.id
    const teachSubject = currentUser.teachSubject?.subName
    const teachSubjectID = currentUser.teachSubject?._id

    // Enhanced state management
    const [sclassName, setSclassName] = useState('');
    const [studentSchool, setStudentSchool] = useState('');
    const [subjectMarks, setSubjectMarks] = useState('');
    const [subjectAttendance, setSubjectAttendance] = useState([]);
    const [examResults, setExamResults] = useState([]);
    const [studentExamHistory, setStudentExamHistory] = useState([]);
    const [subjectDetails, setSubjectDetails] = useState(null);
    const [attendanceStats, setAttendanceStats] = useState({});
    const [gradeAnalysis, setGradeAnalysis] = useState({});
    const [openStates, setOpenStates] = useState({});
    const [loadingExams, setLoadingExams] = useState(false);

    const handleOpen = (subId) => {
        setOpenStates((prevState) => ({
            ...prevState,
            [subId]: !prevState[subId],
        }));
    }; 

    useEffect(() => {
        dispatch(getUserDetails(studentID, address));
    }, [dispatch, studentID]);

    // Fetch exam results for this student and subject
    useEffect(() => {
        const fetchExamResults = async () => {
            if (studentID && teachSubjectID) {
                setLoadingExams(true);
                try {
                    // Get student exam results
                    const examResponse = await axios.get(
                        `${process.env.REACT_APP_BASE_URL}/student/${studentID}/exam-results`
                    );
                    
                    if (examResponse.data.success) {
                        // Filter results for current teacher's subject
                        const subjectExamResults = examResponse.data.examResults.filter(
                            result => result.examId?.subject?._id === teachSubjectID
                        );
                        setStudentExamHistory(subjectExamResults);
                        
                        // Calculate grade analysis
                        const analysis = calculateGradeAnalysis(subjectExamResults);
                        setGradeAnalysis(analysis);
                    }

                    // Get subject details
                    const subjectResponse = await axios.get(
                        `${process.env.REACT_APP_BASE_URL}/Subject/${teachSubjectID}`
                    );
                    setSubjectDetails(subjectResponse.data);

                } catch (error) {
                    console.error('Error fetching exam data:', error);
                } finally {
                    setLoadingExams(false);
                }
            }
        };

        if (userDetails && teachSubjectID) {
            fetchExamResults();
        }
    }, [studentID, teachSubjectID, userDetails]);

    useEffect(() => {
        if (userDetails) {
            setSclassName(userDetails.sclassName || '');
            setStudentSchool(userDetails.school || '');
            setSubjectMarks(userDetails.examResult || '');
            setSubjectAttendance(userDetails.attendance || []);
            
            // Calculate enhanced attendance statistics
            if (userDetails.attendance) {
                const stats = calculateAttendanceStats(userDetails.attendance, teachSubjectID);
                setAttendanceStats(stats);
            }
        }
    }, [userDetails, teachSubjectID]);

    // Calculate grade analysis from exam results
    const calculateGradeAnalysis = (examResults) => {
        if (!examResults.length) return {};

        const totalExams = examResults.length;
        const totalScore = examResults.reduce((sum, result) => sum + result.percentage, 0);
        const averageScore = totalScore / totalExams;
        
        const passed = examResults.filter(result => result.passed).length;
        const failed = totalExams - passed;
        
        const recentExams = examResults
            .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
            .slice(0, 5);

        const trend = calculateTrend(recentExams);

        return {
            totalExams,
            averageScore: averageScore.toFixed(1),
            passed,
            failed,
            passRate: ((passed / totalExams) * 100).toFixed(1),
            trend,
            recentExams,
            bestScore: Math.max(...examResults.map(r => r.percentage)),
            worstScore: Math.min(...examResults.map(r => r.percentage))
        };
    };

    // Calculate attendance statistics
    const calculateAttendanceStats = (attendance, subjectId) => {
        const subjectAttendance = attendance.filter(
            att => att.subName._id === subjectId
        );

        const totalSessions = subjectAttendance.length;
        const presentSessions = subjectAttendance.filter(att => att.status === 'Present').length;
        const absentSessions = totalSessions - presentSessions;
        const attendanceRate = totalSessions > 0 ? ((presentSessions / totalSessions) * 100).toFixed(1) : 0;

        // Calculate recent attendance trend (last 10 sessions)
        const recentAttendance = subjectAttendance
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);

        return {
            totalSessions,
            presentSessions,
            absentSessions,
            attendanceRate,
            recentAttendance
        };
    };

    // Calculate performance trend
    const calculateTrend = (recentExams) => {
        if (recentExams.length < 2) return 'stable';
        
        const firstHalf = recentExams.slice(0, Math.floor(recentExams.length / 2));
        const secondHalf = recentExams.slice(Math.floor(recentExams.length / 2));
        
        const firstAvg = firstHalf.reduce((sum, exam) => sum + exam.percentage, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, exam) => sum + exam.percentage, 0) / secondHalf.length;
        
        const difference = secondAvg - firstAvg;
        
        if (difference > 5) return 'improving';
        if (difference < -5) return 'declining';
        return 'stable';
    };

    const getTrendColor = (trend) => {
        switch (trend) {
            case 'improving': return 'success';
            case 'declining': return 'error';
            default: return 'info';
        }
    };

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'improving': return <TrendingUp />;
            case 'declining': return <TrendingUp style={{ transform: 'rotate(180deg)' }} />;
            default: return <TrendingUp style={{ transform: 'rotate(90deg)' }} />;
        }
    };

    const getGradeColor = (percentage) => {
        if (percentage >= 90) return 'success';
        if (percentage >= 75) return 'info';
        if (percentage >= 60) return 'warning';
        return 'error';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const overallAttendancePercentage = calculateOverallAttendancePercentage(subjectAttendance);
    const overallAbsentPercentage = 100 - overallAttendancePercentage;

    const chartData = [
        { name: 'Present', value: overallAttendancePercentage },
        { name: 'Absent', value: overallAbsentPercentage }
    ];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <div>Loading student details...</div>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Student Header Information */}
            <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item>
                            <Avatar sx={{ width: 60, height: 60, bgcolor: 'white', color: '#667eea' }}>
                                <Person fontSize="large" />
                            </Avatar>
                        </Grid>
                        <Grid item xs>
                            <Typography variant="h4" gutterBottom>
                                {userDetails.name}
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item>
                                    <Typography variant="body1">
                                        <strong>Roll Number:</strong> {userDetails.rollNum}
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <Typography variant="body1">
                                        <strong>Class:</strong> {sclassName.sclassName || 'Not Assigned'}
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <Typography variant="body1">
                                        <strong>School:</strong> {studentSchool.schoolName}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item>
                            <Chip 
                                label={`Subject: ${teachSubject}`} 
                                variant="outlined" 
                                sx={{ color: 'white', borderColor: 'white' }}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Performance Overview Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Assignment color="primary" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h6" color="textSecondary">
                                Attendance Rate
                            </Typography>
                            <Typography variant="h4" color="primary">
                                {attendanceStats.attendanceRate || 0}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Quiz color="secondary" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h6" color="textSecondary">
                                Total Exams
                            </Typography>
                            <Typography variant="h4" color="secondary">
                                {gradeAnalysis.totalExams || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Grade color="success" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h6" color="textSecondary">
                                Average Score
                            </Typography>
                            <Typography variant="h4" color="success.main">
                                {gradeAnalysis.averageScore || 0}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            {getTrendIcon(gradeAnalysis.trend)}
                            <Typography variant="h6" color="textSecondary">
                                Performance Trend
                            </Typography>
                            <Chip 
                                label={gradeAnalysis.trend || 'No data'} 
                                color={getTrendColor(gradeAnalysis.trend)}
                                variant="outlined"
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Detailed Sections */}
            <Grid container spacing={3}>
                {/* Attendance Section */}
                <Grid item xs={12} lg={6}>
                    <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                                <CalendarToday sx={{ mr: 1 }} />
                                Attendance Details
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {attendanceStats.totalSessions > 0 ? (
                                <Box>
                                    {/* Attendance Summary */}
                                    <Grid container spacing={2} sx={{ mb: 2 }}>
                                        <Grid item xs={4}>
                                            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
                                                <Typography variant="h6">{attendanceStats.presentSessions}</Typography>
                                                <Typography variant="body2">Present</Typography>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light' }}>
                                                <Typography variant="h6">{attendanceStats.absentSessions}</Typography>
                                                <Typography variant="body2">Absent</Typography>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light' }}>
                                                <Typography variant="h6">{attendanceStats.totalSessions}</Typography>
                                                <Typography variant="body2">Total Sessions</Typography>
                                            </Paper>
                                        </Grid>
                                    </Grid>

                                    {/* Progress Bar */}
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="textSecondary" gutterBottom>
                                            Attendance Progress: {attendanceStats.attendanceRate}%
                                        </Typography>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={parseFloat(attendanceStats.attendanceRate)} 
                                            sx={{ height: 10, borderRadius: 1 }}
                                            color={attendanceStats.attendanceRate >= 75 ? 'success' : 'error'}
                                        />
                                    </Box>

                                    {/* Recent Attendance */}
                                    {attendanceStats.recentAttendance && (
                                        <Box>
                                            <Typography variant="subtitle2" gutterBottom>
                                                Recent Attendance (Last 10 sessions)
                                            </Typography>
                                            <List dense>
                                                {attendanceStats.recentAttendance.map((record, index) => (
                                                    <ListItem key={index}>
                                                        <ListItemIcon>
                                                            {record.status === 'Present' ? 
                                                                <CheckCircle color="success" /> : 
                                                                <Cancel color="error" />
                                                            }
                                                        </ListItemIcon>
                                                        <ListItemText 
                                                            primary={formatDate(record.date)}
                                                            secondary={record.status}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Box>
                                    )}

                                    <Box sx={{ mt: 2 }}>
                                        <GreenButton
                                            variant="contained"
                                            fullWidth
                                            onClick={() =>
                                                navigate(
                                                    `/Teacher/class/student/attendance/${studentID}/${teachSubjectID}`
                                                )
                                            }
                                        >
                                            Add Attendance
                                        </GreenButton>
                                    </Box>
                                </Box>
                            ) : (
                                <Alert severity="info">
                                    No attendance records found for {teachSubject}
                                </Alert>
                            )}
                        </AccordionDetails>
                    </Accordion>
                </Grid>

                {/* Exam Results Section */}
                <Grid item xs={12} lg={6}>
                    <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                                <Assessment sx={{ mr: 1 }} />
                                Exam Performance
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {loadingExams ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                    <Typography>Loading exam results...</Typography>
                                </Box>
                            ) : studentExamHistory.length > 0 ? (
                                <Box>
                                    {/* Performance Summary */}
                                    <Grid container spacing={2} sx={{ mb: 2 }}>
                                        <Grid item xs={6}>
                                            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
                                                <Typography variant="h6">{gradeAnalysis.passed}</Typography>
                                                <Typography variant="body2">Passed</Typography>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light' }}>
                                                <Typography variant="h6">{gradeAnalysis.failed}</Typography>
                                                <Typography variant="body2">Failed</Typography>
                                            </Paper>
                                        </Grid>
                                    </Grid>

                                    {/* Score Range */}
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="textSecondary">
                                            Score Range: {gradeAnalysis.worstScore}% - {gradeAnalysis.bestScore}%
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Pass Rate: {gradeAnalysis.passRate}%
                                        </Typography>
                                    </Box>

                                    {/* Individual Exam Results */}
                                    <Typography variant="subtitle2" gutterBottom>
                                        Recent Exam Results
                                    </Typography>
                                    <List>
                                        {studentExamHistory.slice(0, 5).map((result, index) => (
                                            <ListItem key={index} divider>
                                                <ListItemIcon>
                                                    <BookmarkBorder color={getGradeColor(result.percentage)} />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={result.examId?.title || 'Exam'}
                                                    secondary={
                                                        <Box>
                                                            <Typography variant="body2">
                                                                Score: {result.percentage}% ({result.score}/{result.totalQuestions})
                                                            </Typography>
                                                            <Typography variant="caption" color="textSecondary">
                                                                {formatDate(result.submittedAt)} • 
                                                                <Chip 
                                                                    size="small" 
                                                                    label={result.passed ? 'Passed' : 'Failed'}
                                                                    color={result.passed ? 'success' : 'error'}
                                                                    variant="outlined"
                                                                    sx={{ ml: 1 }}
                                                                />
                                                            </Typography>
                                                        </Box>
                                                    }
                                                />
                                            </ListItem>
                                        ))}
                                    </List>

                                    <Box sx={{ mt: 2 }}>
                                        <BlueButton
                                            variant="contained"
                                            fullWidth
                                            onClick={() =>
                                                navigate(
                                                    `/Teacher/class/student/marks/${studentID}/${teachSubjectID}`
                                                )
                                            }
                                        >
                                            Add Marks
                                        </BlueButton>
                                    </Box>
                                </Box>
                            ) : (
                                <Alert severity="info">
                                    No exam results found for {teachSubject}
                                </Alert>
                            )}
                        </AccordionDetails>
                    </Accordion>
                </Grid>

                {/* Subject Details */}
                {subjectDetails && (
                    <Grid item xs={12}>
                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                                    <School sx={{ mr: 1 }} />
                                    Subject Information
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" gutterBottom>Subject Details</Typography>
                                        <Typography><strong>Subject:</strong> {subjectDetails.subName}</Typography>
                                        <Typography><strong>Code:</strong> {subjectDetails.subCode}</Typography>
                                        <Typography><strong>Total Sessions:</strong> {subjectDetails.sessions}</Typography>
                                        {subjectDetails.description && (
                                            <Typography><strong>Description:</strong> {subjectDetails.description}</Typography>
                                        )}
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" gutterBottom>Class Information</Typography>
                                        <Typography><strong>Class:</strong> {sclassName.sclassName}</Typography>
                                        <Typography><strong>Teacher:</strong> {currentUser.name}</Typography>
                                        <Typography><strong>School:</strong> {studentSchool.schoolName}</Typography>
                                    </Grid>
                                </Grid>
                                {subjectDetails.videoLink && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>Learning Resources</Typography>
                                        <Button 
                                            variant="outlined" 
                                            href={subjectDetails.videoLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            View Video Resources
                                        </Button>
                                    </Box>
                                )}
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                )}
            </Grid>

            {/* Quick Actions */}
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
                <PurpleButton
                    variant="contained"
                    onClick={() => navigate(`/Teacher/class/student/attendance/${studentID}/${teachSubjectID}`)}
                >
                    Manage Attendance
                </PurpleButton>
                <GreenButton
                    variant="contained"
                    onClick={() => navigate(`/Teacher/class/student/marks/${studentID}/${teachSubjectID}`)}
                >
                    Add/Update Marks
                </GreenButton>
                <BlueButton
                    variant="outlined"
                    onClick={() => navigate('/Teacher/class')}
                >
                    Back to Class
                </BlueButton>
            </Box>
        </Box>
    );
};

export default TeacherViewStudent;