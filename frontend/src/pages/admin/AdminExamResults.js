import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Grid,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Tabs,
    Tab,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    TrendingUp as TrendingUpIcon,
    Visibility as VisibilityIcon,
    Download as DownloadIcon,
    Add as AddIcon,
    Assessment as AssessmentIcon,
    People as PeopleIcon,
    Quiz as QuizIcon,
    ArrowBack as ArrowBackIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';

const AdminExamResults = () => {
    const { subjectId } = useParams();
    const navigate = useNavigate();
    const [examResults, setExamResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statistics, setStatistics] = useState({});
    const [tabValue, setTabValue] = useState(0);
    const [selectedExam, setSelectedExam] = useState('all');
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [selectedResult, setSelectedResult] = useState(null);
    const [subjectData, setSubjectData] = useState(null);

    const REACT_APP_BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

    useEffect(() => {
        if (subjectId) {
            Promise.all([
                fetchExamResults(),
                fetchSubjectDetails()
            ]);
        }
    }, [subjectId]);

    const fetchSubjectDetails = async () => {
        try {
            console.log('📚 Fetching subject details for:', subjectId);
            const response = await fetch(`${REACT_APP_BASE_URL}/Subject/${subjectId}`);
            const data = await response.json();
            
            if (response.ok && data) {
                setSubjectData(data);
                console.log('✅ Subject details loaded:', data.subName);
            } else {
                console.warn('⚠️ Subject details not found');
            }
        } catch (err) {
            console.error('❌ Error fetching subject details:', err);
        }
    };

// Replace your existing fetchExamResults function with this fixed version:

const fetchExamResults = async () => {
    try {
        setLoading(true);
        setError(null);
        console.log('📊 Fetching exam results for subject:', subjectId);
        
        const response = await fetch(`${REACT_APP_BASE_URL}/exam-results/${subjectId}`);
        const data = await response.json();
        
        console.log('📊 Exam Results API Response:', data);
        console.log('📊 Response success:', data.success);
        console.log('📊 Exam results array:', data.examResults);
        
        if (data.success) {
            if (data.examResults && data.examResults.length > 0) {
                console.log('📊 Setting exam results:', data.examResults);
                setExamResults(data.examResults);
                
                // Debug: Log the structure of the first exam result
                console.log('📊 First exam result structure:', JSON.stringify(data.examResults[0], null, 2));
                
                calculateStatistics(data.examResults);
                console.log('✅ Exam results loaded:', data.examResults.length, 'exams');
            } else {
                console.log('ℹ️ No exam results found - examResults array is empty');
                setExamResults([]);
                setStatistics({
                    totalStudents: 0,
                    totalPassed: 0,
                    totalFailed: 0,
                    averageScore: 0,
                    passRate: 0,
                    highestScore: 0,
                    lowestScore: 0,
                    totalExams: 0,
                    examStats: {}
                });
            }
        } else {
            console.error('❌ API Error:', data.error);
            setError(data.error || 'Failed to fetch exam results');
            setExamResults([]);
        }
    } catch (err) {
        console.error('❌ Network error fetching exam results:', err);
        setError('Network error. Could not fetch results. Please check if the server is running.');
        setExamResults([]);
    } finally {
        setLoading(false);
    }
};


    const getScoreColor = (percentage) => {
        if (percentage >= 80) return 'success';
        if (percentage >= 60) return 'warning';
        return 'error';
    };

    const getGradeFromPercentage = (percentage) => {
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B+';
        if (percentage >= 60) return 'B';
        if (percentage >= 50) return 'C';
        return 'F';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    const formatTime = (seconds) => {
        if (!seconds) return 'N/A';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    const handleViewDetails = (result) => {
        setSelectedResult(result);
        setDetailDialogOpen(true);
    };

    const handleExportResults = () => {
        if (!examResults || examResults.length === 0) {
            alert('No results to export');
            return;
        }

        // Create CSV content
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Exam Title,Student Name,Roll Number,Score,Percentage,Status,Time Spent,Submitted At\n";
        
        examResults.forEach(examData => {
            examData.results.forEach(result => {
                const row = [
                    `"${examData.exam.title}"`,
                    `"${result.studentId?.name || 'Unknown'}"`,
                    result.studentId?.rollNum || 'N/A',
                    `${result.score}/${result.totalQuestions}`,
                    `${result.percentage}%`,
                    result.passed ? 'PASSED' : 'FAILED',
                    formatTime(result.timeSpent),
                    formatDate(result.submittedAt)
                ].join(',');
                csvContent += row + "\n";
            });
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `exam_results_${subjectData?.subName || 'subject'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredResults = selectedExam === 'all' 
        ? examResults 
        : examResults.filter(examData => examData.exam._id === selectedExam);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading exam results...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4">
                        Exam Results - Error
                    </Typography>
                </Box>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                        variant="contained" 
                        startIcon={<RefreshIcon />}
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </Button>
                    <Button 
                        variant="outlined" 
                        onClick={() => navigate(`/Admin/addexam/${subjectId}`)}
                    >
                        Create Exam Instead
                    </Button>
                </Box>
            </Box>
        );
    }

    if (!examResults || examResults.length === 0) {
        return (
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h4" gutterBottom>
                            Exam Results
                        </Typography>
                        {subjectData && (
                            <Typography variant="subtitle1" color="text.secondary">
                                Subject: {subjectData.subName} ({subjectData.subCode})
                            </Typography>
                        )}
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate(`/Admin/addexam/${subjectId}`)}
                    >
                        Create New Exam
                    </Button>
                </Box>
                <Alert severity="info" sx={{ mb: 2 }}>
                    No exam results found for this subject. Students need to complete exams to see results here.
                </Alert>
                <Card>
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                        <QuizIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            Get Started
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            Create exams for this subject and invite students to take them.
                            Results and analytics will appear here once students complete the exams.
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<AddIcon />}
                            onClick={() => navigate(`/Admin/addexam/${subjectId}`)}
                        >
                            Create Your First Exam
                        </Button>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h4" gutterBottom>
                        Exam Results Dashboard
                    </Typography>
                    {subjectData && (
                        <Typography variant="subtitle1" color="text.secondary">
                            Subject: {subjectData.subName} ({subjectData.subCode})
                            {subjectData.sclassName?.sclassName && (
                                <> • Class: {subjectData.sclassName.sclassName}</>
                            )}
                        </Typography>
                    )}
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchExamResults}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={handleExportResults}
                        disabled={!examResults || examResults.length === 0}
                    >
                        Export Results
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate(`/Admin/addexam/${subjectId}`)}
                    >
                        Create New Exam
                    </Button>
                </Box>
            </Box>

            {/* Overall Statistics */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={2}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <QuizIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography color="textSecondary" gutterBottom>
                                Total Exams
                            </Typography>
                            <Typography variant="h4">
                                {statistics.totalExams || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <PeopleIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography color="textSecondary" gutterBottom>
                                Total Submissions
                            </Typography>
                            <Typography variant="h4">
                                {statistics.totalStudents || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography color="textSecondary" gutterBottom>
                                Pass Rate
                            </Typography>
                            <Typography variant="h4" color="success.main">
                                {statistics.passRate || 0}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <TrendingUpIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography color="textSecondary" gutterBottom>
                                Average Score
                            </Typography>
                            <Typography variant="h4" color="primary.main">
                                {statistics.averageScore || 0}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <AssessmentIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography color="textSecondary" gutterBottom>
                                Highest Score
                            </Typography>
                            <Typography variant="h4" color="success.main">
                                {statistics.highestScore || 0}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <CancelIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography color="textSecondary" gutterBottom>
                                Lowest Score
                            </Typography>
                            <Typography variant="h4" color="error.main">
                                {statistics.lowestScore || 0}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filter Controls */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Filter by Exam</InputLabel>
                            <Select
                                value={selectedExam}
                                onChange={(e) => setSelectedExam(e.target.value)}
                                label="Filter by Exam"
                            >
                                <MenuItem value="all">All Exams</MenuItem>
                                {examResults.map(examData => (
                                    <MenuItem key={examData.exam._id} value={examData.exam._id}>
                                        {examData.exam.title} ({examData.results.length} submissions)
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Typography variant="body2" color="text.secondary">
                            Showing {filteredResults.reduce((sum, exam) => sum + exam.results.length, 0)} results
                            {selectedExam !== 'all' && ' for selected exam'}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            {/* Exam Results by Exam */}
            {filteredResults.map((examData, index) => (
                <Accordion key={examData.exam._id} defaultExpanded={filteredResults.length === 1}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mr: 2 }}>
                            <Box>
                                <Typography variant="h6">
                                    {examData.exam.title}
                                </Typography>
                                {examData.exam.description && (
                                    <Typography variant="body2" color="text.secondary">
                                        {examData.exam.description}
                                    </Typography>
                                )}
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Chip 
                                    label={`${examData.results.length} submissions`}
                                    color="primary"
                                    size="small"
                                />
                                {statistics.examStats?.[examData.exam._id] && (
                                    <Chip 
                                        label={`${statistics.examStats[examData.exam._id].passRate}% pass rate`}
                                        color={statistics.examStats[examData.exam._id].passRate >= 60 ? "success" : "error"}
                                        size="small"
                                    />
                                )}
                            </Box>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        {/* Exam-specific Statistics */}
                        {statistics.examStats?.[examData.exam._id] && (
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={6} md={2}>
                                    <Card variant="outlined">
                                        <CardContent sx={{ textAlign: 'center', py: 1 }}>
                                            <Typography variant="h6" color="primary">
                                                {statistics.examStats[examData.exam._id].averageScore}%
                                            </Typography>
                                            <Typography variant="caption">Average</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={6} md={2}>
                                    <Card variant="outlined">
                                        <CardContent sx={{ textAlign: 'center', py: 1 }}>
                                            <Typography variant="h6" color="success.main">
                                                {statistics.examStats[examData.exam._id].passed}
                                            </Typography>
                                            <Typography variant="caption">Passed</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={6} md={2}>
                                    <Card variant="outlined">
                                        <CardContent sx={{ textAlign: 'center', py: 1 }}>
                                            <Typography variant="h6" color="error.main">
                                                {statistics.examStats[examData.exam._id].failed}
                                            </Typography>
                                            <Typography variant="caption">Failed</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={6} md={2}>
                                    <Card variant="outlined">
                                        <CardContent sx={{ textAlign: 'center', py: 1 }}>
                                            <Typography variant="h6" color="success.main">
                                                {statistics.examStats[examData.exam._id].highestScore}%
                                            </Typography>
                                            <Typography variant="caption">Highest</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={6} md={2}>
                                    <Card variant="outlined">
                                        <CardContent sx={{ textAlign: 'center', py: 1 }}>
                                            <Typography variant="h6" color="error.main">
                                                {statistics.examStats[examData.exam._id].lowestScore}%
                                            </Typography>
                                            <Typography variant="caption">Lowest</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        )}
                        
                        <TableContainer component={Paper} variant="outlined">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Student Name</strong></TableCell>
                                        <TableCell><strong>Roll Number</strong></TableCell>
                                        <TableCell><strong>Score</strong></TableCell>
                                        <TableCell><strong>Percentage</strong></TableCell>
                                        <TableCell><strong>Grade</strong></TableCell>
                                        <TableCell><strong>Status</strong></TableCell>
                                        <TableCell><strong>Time Spent</strong></TableCell>
                                        <TableCell><strong>Submitted At</strong></TableCell>
                                        <TableCell><strong>Actions</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {examData.results.map((result) => (
                                        <TableRow key={result._id} hover>
                                            <TableCell>{result.studentId?.name || 'Unknown'}</TableCell>
                                            <TableCell>{result.studentId?.rollNum || 'N/A'}</TableCell>
                                            <TableCell>
                                                <strong>{result.score}/{result.totalQuestions}</strong>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <TrendingUpIcon 
                                                        color={getScoreColor(result.percentage)}
                                                        sx={{ mr: 1, fontSize: 18 }}
                                                    />
                                                    <strong>{result.percentage}%</strong>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={getGradeFromPercentage(result.percentage)}
                                                    color={getScoreColor(result.percentage)}
                                                    size="small"
                                                    sx={{ fontWeight: 'bold' }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={result.passed ? <CheckCircleIcon /> : <CancelIcon />}
                                                    label={result.passed ? 'PASSED' : 'FAILED'}
                                                    color={result.passed ? 'success' : 'error'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {formatTime(result.timeSpent)}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(result.submittedAt)}
                                            </TableCell>
                                            <TableCell>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleViewDetails(result)}
                                                    title="View Details"
                                                >
                                                    <VisibilityIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </AccordionDetails>
                </Accordion>
            ))}

            {/* Detail Dialog */}
            <Dialog 
                open={detailDialogOpen} 
                onClose={() => setDetailDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Detailed Results: {selectedResult?.studentId?.name || 'Unknown Student'}
                </DialogTitle>
                <DialogContent>
                    {selectedResult && (
                        <Box>
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">Score</Typography>
                                    <Typography variant="h6">{selectedResult.score}/{selectedResult.totalQuestions}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">Percentage</Typography>
                                    <Typography variant="h6" color={getScoreColor(selectedResult.percentage) + '.main'}>
                                        {selectedResult.percentage}%
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">Time Spent</Typography>
                                    <Typography variant="h6">{formatTime(selectedResult.timeSpent)}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">Status</Typography>
                                    <Chip
                                        label={selectedResult.passed ? 'PASSED' : 'FAILED'}
                                        color={selectedResult.passed ? 'success' : 'error'}
                                        size="small"
                                    />
                                </Grid>
                            </Grid>
                            
                            <Divider sx={{ mb: 2 }} />
                            
                            <Typography variant="h6" gutterBottom>Question Analysis</Typography>
                            {selectedResult.questionAnalysis && selectedResult.questionAnalysis.length > 0 ? (
                                <List>
                                    {selectedResult.questionAnalysis.map((analysis, index) => (
                                        <ListItem key={index}>
                                            <ListItemIcon>
                                                {analysis.isCorrect ? 
                                                    <CheckCircleIcon color="success" /> : 
                                                    <CancelIcon color="error" />
                                                }
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={`Question ${index + 1}`}
                                                secondary={
                                                    <Box>
                                                        <Typography variant="body2">
                                                            Your answer: {analysis.userAnswer || 'No answer'}
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            Correct answer: {analysis.correctAnswer}
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            Marks: {analysis.marksObtained || 0}/{analysis.marks || 1}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    No detailed question analysis available.
                                </Typography>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailDialogOpen(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminExamResults;