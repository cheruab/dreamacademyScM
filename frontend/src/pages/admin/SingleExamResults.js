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
    Divider
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    TrendingUp as TrendingUpIcon,
    Visibility as VisibilityIcon,
    Download as DownloadIcon,
    Assessment as AssessmentIcon,
    People as PeopleIcon,
    Quiz as QuizIcon,
    ArrowBack as ArrowBackIcon,
    Refresh as RefreshIcon,
    Schedule as ScheduleIcon
} from '@mui/icons-material';

const SingleExamResults = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [examResult, setExamResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [selectedResult, setSelectedResult] = useState(null);

    const REACT_APP_BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

    useEffect(() => {
        if (examId) {
            fetchSingleExamResults();
        }
    }, [examId]);

    const fetchSingleExamResults = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching results for exam:', examId);
            
            const response = await fetch(`${REACT_APP_BASE_URL}/exam-results/exam/${examId}`);
            const data = await response.json();
            
            console.log('Single Exam Results API Response:', data);
            
            if (data.success) {
                setExamResult(data.examResult);
                console.log('Exam results loaded:', data.examResult);
            } else {
                setError(data.error || 'Failed to fetch exam results');
            }
        } catch (err) {
            console.error('Error fetching exam results:', err);
            setError('Network error. Could not fetch results.');
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
        if (!examResult || !examResult.results || examResult.results.length === 0) {
            alert('No results to export');
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Student Name,Roll Number,Score,Percentage,Status,Time Spent,Submitted At\\n";
        
        examResult.results.forEach(result => {
            const row = [
                `"${result.studentId?.name || 'Unknown'}"`,
                result.studentId?.rollNum || 'N/A',
                `${result.score}/${result.totalQuestions}`,
                `${result.percentage}%`,
                result.passed ? 'PASSED' : 'FAILED',
                formatTime(result.timeSpent),
                formatDate(result.submittedAt)
            ].join(',');
            csvContent += row + "\\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${examResult.exam.title}_results.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
                    <Typography variant="h4">Exam Results - Error</Typography>
                </Box>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Button 
                    variant="contained" 
                    startIcon={<RefreshIcon />}
                    onClick={fetchSingleExamResults}
                >
                    Retry
                </Button>
            </Box>
        );
    }

    if (!examResult) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="warning">No exam data found</Alert>
            </Box>
        );
    }

    const { exam, results, statistics } = examResult;
    const hasSubmissions = results && results.length > 0;

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h4" gutterBottom>
                        {exam.title} - Results
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Subject: {exam.subject?.subName} ({exam.subject?.subCode})
                    </Typography>
                    {exam.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {exam.description}
                        </Typography>
                    )}
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchSingleExamResults}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={handleExportResults}
                        disabled={!hasSubmissions}
                    >
                        Export Results
                    </Button>
                </Box>
            </Box>

            {/* Exam Information Card */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Exam Information
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                            <Typography variant="body2" color="text.secondary">Total Questions</Typography>
                            <Typography variant="h6">{exam.totalQuestions}</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Typography variant="body2" color="text.secondary">Total Marks</Typography>
                            <Typography variant="h6">{exam.totalMarks}</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Typography variant="body2" color="text.secondary">Passing Marks</Typography>
                            <Typography variant="h6">{exam.passingMarks}%</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Typography variant="body2" color="text.secondary">Created</Typography>
                            <Typography variant="h6">{formatDate(exam.createdAt)}</Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {!hasSubmissions ? (
                /* No Submissions State */
                <Card>
                    <CardContent sx={{ textAlign: 'center', py: 6 }}>
                        <QuizIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h5" gutterBottom>
                            No Submissions Yet
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            This exam hasn't been taken by any students yet. Results and statistics will appear here once students complete the exam.
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<RefreshIcon />}
                            onClick={fetchSingleExamResults}
                        >
                            Check for New Submissions
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Statistics Cards */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={2}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <PeopleIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                                    <Typography color="textSecondary" gutterBottom>
                                        Total Submissions
                                    </Typography>
                                    <Typography variant="h4">
                                        {statistics.totalSubmissions}
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
                                        {statistics.passRate}%
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
                                        {statistics.averageScore}%
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
                                        {statistics.highestScore}%
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
                                        {statistics.lowestScore}%
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <ScheduleIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
                                    <Typography color="textSecondary" gutterBottom>
                                        Avg Time
                                    </Typography>
                                    <Typography variant="h4" color="info.main">
                                        {formatTime(statistics.averageTime)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Results Table */}
                    <Paper sx={{ mb: 3 }}>
                        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                            <Typography variant="h6">Student Results</Typography>
                        </Box>
                        <TableContainer>
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
                                    {results.map((result, index) => (
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
                                            <TableCell>{formatTime(result.timeSpent)}</TableCell>
                                            <TableCell>{formatDate(result.submittedAt)}</TableCell>
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
                    </Paper>
                </>
            )}

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
                            
                            <Typography variant="h6" gutterBottom>Answer Summary</Typography>
                            {selectedResult.answers ? (
                                <Typography variant="body2" color="text.secondary">
                                    Student provided answers for {Object.keys(selectedResult.answers).length} questions.
                                    Detailed question-by-question analysis would require the full exam questions.
                                </Typography>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    No detailed answer analysis available.
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

export default SingleExamResults;