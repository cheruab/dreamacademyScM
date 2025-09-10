import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { getExams } from "../../../redux/userRelated/userHandle";
import { underControl } from "../../../redux/userRelated/userSlice";
import { 
    Box, 
    Typography, 
    Card, 
    CardContent, 
    Button, 
    CircularProgress,
    Alert,
    Grid,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Paper,
    Divider
} from "@mui/material";
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    Quiz as QuizIcon,
    ExpandMore as ExpandMoreIcon,
    Schedule as ScheduleIcon,
    Assignment as AssignmentIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Refresh as RefreshIcon
} from "@mui/icons-material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ExamList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { subjectId } = useParams();
    const { examId } = useParams();

    const { status, response, loading } = useSelector((state) => state.user);
    
    const [selectedExam, setSelectedExam] = useState(null);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [examToDelete, setExamToDelete] = useState(null);
    const [localLoading, setLocalLoading] = useState(false);
    const [localError, setLocalError] = useState('');
    const [exams, setExams] = useState([]); // Add local state for exams

    const REACT_APP_BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

    useEffect(() => {
        console.log("ExamList - Fetching exams for subjectId:", subjectId);
        fetchExams();
        
        // Cleanup function
        return () => {
            dispatch(underControl()); // Reset state when component unmounts
        };
    }, [dispatch, subjectId]);

    const fetchExams = async () => {
        setLocalLoading(true);
        setLocalError('');
        
        try {
            const response = await fetch(`${REACT_APP_BASE_URL}/exams/subject/${subjectId}`);
            const data = await response.json();
            
            console.log("Direct fetch result:", data);
            
            if (response.ok && data) {
                // Handle the response structure properly
                if (data.success && data.exams && Array.isArray(data.exams)) {
                    setExams(data.exams);
                    console.log("Setting exams:", data.exams);
                } else if (Array.isArray(data)) {
                    setExams(data);
                } else if (data.data && Array.isArray(data.data)) {
                    setExams(data.data);
                } else {
                    console.warn("Unexpected response format:", data);
                    setExams([]);
                }
                setLocalError('');
            } else {
                throw new Error(data.message || 'Failed to fetch exams');
            }
        } catch (error) {
            console.error("Error fetching exams:", error);
            setLocalError(`Failed to load exams: ${error.message}`);
            
            // Fallback to Redux action
            try {
                dispatch(getExams(subjectId));
            } catch (reduxError) {
                console.error("Redux fallback failed:", reduxError);
            }
        } finally {
            setLocalLoading(false);
        }
    };

    // Also handle Redux response updates
    useEffect(() => {
        if (response && !localLoading) {
            let reduxExams = [];
            if (response.exams && Array.isArray(response.exams)) {
                reduxExams = response.exams;
            } else if (Array.isArray(response)) {
                reduxExams = response;
            } else if (response.data && Array.isArray(response.data)) {
                reduxExams = response.data;
            }
            
            if (reduxExams.length > 0) {
                setExams(reduxExams);
                console.log("Updated exams from Redux:", reduxExams);
            }
        }
    }, [response, localLoading]);

    // Debug logs
    console.log("ExamList - Current state:", { 
        status, 
        response, 
        loading, 
        localLoading, 
        examsCount: exams.length 
    });

    const handleEditExam = (examId) => {
        // Use consistent route format
        navigate(`/Admin/addexam/${subjectId}/${examId}`);
    };

    const handleViewDetails = (exam) => {
        console.log("Viewing exam details:", exam);
        setSelectedExam(exam);
        setShowDetailsDialog(true);
    };

    const handleDeleteExam = (exam) => {
        setExamToDelete(exam);
        setShowDeleteDialog(true);
    };

    const confirmDeleteExam = async () => {
        if (!examToDelete) return;
        
        setLocalLoading(true);
        try {
            const response = await fetch(`${REACT_APP_BASE_URL}/exams/${examToDelete._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();
            
            if (response.ok) {
                // Refresh the exam list
                fetchExams();
                setShowDeleteDialog(false);
                setExamToDelete(null);
                alert('Exam deleted successfully');
            } else {
                throw new Error(result.message || 'Failed to delete exam');
            }
        } catch (error) {
            console.error('Error deleting exam:', error);
            alert(`Error deleting exam: ${error.message}`);
        } finally {
            setLocalLoading(false);
        }
    };

    const getExamStatus = (exam) => {
        const now = new Date();
        const startTime = new Date(exam.startTime);
        const endTime = new Date(exam.endTime);
        
        if (now < startTime) {
            return { status: 'upcoming', color: 'info', text: 'Upcoming' };
        } else if (now >= startTime && now <= endTime) {
            return { status: 'active', color: 'success', text: 'Active' };
        } else {
            return { status: 'ended', color: 'error', text: 'Ended' };
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'Not set';
        try {
            return new Date(dateString).toLocaleString();
        } catch (error) {
            return 'Invalid date';
        }
    };

    const formatDuration = (timeLimit) => {
        if (!timeLimit) return 'Not set';
        const hours = Math.floor(timeLimit / 3600);
        const minutes = Math.floor((timeLimit % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    const handleBack = () => {
        navigate(-1); // Go back to previous page
    };

    const getTotalMarks = (exam) => {
        if (!exam.questions || !Array.isArray(exam.questions)) return 0;
        return exam.questions.reduce((sum, q) => sum + (parseInt(q.marks) || 1), 0);
    };

    const isLoading = loading || localLoading;

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" p={3} minHeight="50vh">
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading exams...</Typography>
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Box sx={{ mb: 2 }}>
                            <Button
                                startIcon={<ArrowBackIcon />}
                                onClick={handleBack}
                                variant="outlined"
                                sx={{ mb: 2 }}
                            >
                                Back to Subjects
                            </Button>
                        </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" gutterBottom>
                    Exam Management
                </Typography>
                <Box display="flex" gap={2}>
                    <Button 
                        variant="outlined" 
                        startIcon={<RefreshIcon />}
                        onClick={fetchExams}
                        disabled={isLoading}
                    >
                        Refresh
                    </Button>
                    <Button 
                        variant="contained" 
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => navigate(`/Admin/addexam/${subjectId}`)}
                        size="large"
                    >
                        Create New Exam
                    </Button>
                </Box>
            </Box>

            {localError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {localError}
                    <Button onClick={fetchExams} size="small" sx={{ ml: 2 }}>
                        Retry
                    </Button>
                </Alert>
            )}

          
            
            {(!exams || exams.length === 0) ? (
                <Paper elevation={2} sx={{ p: 6, textAlign: 'center' }}>
                    <QuizIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No exams available for this subject
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Create your first exam to start assessing student knowledge.
                    </Typography>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={<AddIcon />}
                        onClick={() => navigate(`/Admin/addexam/${subjectId}`)}
                        size="large"
                    >
                        Create First Exam
                    </Button>
                </Paper>
            ) : (
                <Box>
                    <Alert severity="info" sx={{ mb: 3 }}>
                        <Typography variant="body2">
                            {exams.length} exam{exams.length !== 1 ? 's' : ''} found for this subject. 
                            Click on any exam to view details or use the action buttons to manage them.
                        </Typography>
                    </Alert>
                    
                    <Grid container spacing={3}>
                        {exams.map((exam, index) => {
                            if (!exam) return null; // Skip null/undefined exams
                            
                            const examStatus = getExamStatus(exam);
                            const totalMarks = getTotalMarks(exam);
                            
                            return (
                                <Grid item xs={12} md={6} lg={4} key={exam._id || index}>
                                    <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                                <Typography variant="h6" gutterBottom color="primary" sx={{ flexGrow: 1 }}>
                                                    {exam.title || 'Untitled Exam'}
                                                </Typography>
                                                <Chip 
                                                    label={examStatus.text}
                                                    color={examStatus.color}
                                                    size="small"
                                                />
                                            </Box>
                                            
                                            {exam.description && (
                                                <Typography variant="body2" color="text.secondary" paragraph>
                                                    {exam.description}
                                                </Typography>
                                            )}
                                            
                                            <Box sx={{ mb: 2 }}>
                                                <Grid container spacing={1}>
                                                    <Grid item xs={6}>
                                                        <Typography variant="caption" color="text.secondary" display="block">
                                                            Questions
                                                        </Typography>
                                                        <Typography variant="body2" fontWeight="bold">
                                                            {exam.questions?.length || 0}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="caption" color="text.secondary" display="block">
                                                            Total Marks
                                                        </Typography>
                                                        <Typography variant="body2" fontWeight="bold">
                                                            {totalMarks}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="caption" color="text.secondary" display="block">
                                                            Duration
                                                        </Typography>
                                                        <Typography variant="body2" fontWeight="bold">
                                                            {formatDuration(exam.timeLimit)}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="caption" color="text.secondary" display="block">
                                                            Pass %
                                                        </Typography>
                                                        <Typography variant="body2" fontWeight="bold">
                                                            {exam.passingMarks || 60}%
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                            
                                            <Divider sx={{ my: 2 }} />
                                            
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    Schedule
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                                                    <strong>Start:</strong> {formatDateTime(exam.startTime)}
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                                                    <strong>End:</strong> {formatDateTime(exam.endTime)}
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                        
                                        <Box sx={{ p: 2, pt: 0 }}>
                                            <Grid container spacing={1}>
                                                <Grid item xs={6}>
                                                    <Button
                                                        fullWidth
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={<VisibilityIcon />}
                                                        onClick={() => handleViewDetails(exam)}
                                                    >
                                                        View
                                                    </Button>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Button
                                                        fullWidth
                                                        variant="contained"
                                                        size="small"
                                                        startIcon={<EditIcon />}
                                                        onClick={() => handleEditExam(exam._id)}
                                                        color="primary"
                                                    >
                                                        Edit
                                                    </Button>
                                                </Grid>
<Grid item xs={6}>
    <Button
        fullWidth
        variant="outlined"
        size="small"
        startIcon={<AssignmentIcon />}
        onClick={() => navigate(`/Admin/exam-results/exam/${exam._id}`)}
        color="success"
    >
        Results
    </Button>
</Grid>
                                                <Grid item xs={6}>
                                                    <Button
                                                        fullWidth
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={<DeleteIcon />}
                                                        onClick={() => handleDeleteExam(exam)}
                                                        color="error"
                                                    >
                                                        Delete
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Box>
            )}

            {/* Exam Details Dialog */}
            <Dialog 
                open={showDetailsDialog} 
                onClose={() => setShowDetailsDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <QuizIcon />
                        Exam Details: {selectedExam?.title || 'Unknown Exam'}
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {selectedExam && (
                        <Box>
                            {/* Basic Info */}
                            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                                <Typography variant="h6" gutterBottom>Basic Information</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" color="text.secondary">Title</Typography>
                                        <Typography variant="body1">{selectedExam.title || 'N/A'}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" color="text.secondary">Status</Typography>
                                        <Box>
                                            <Chip 
                                                label={getExamStatus(selectedExam).text}
                                                color={getExamStatus(selectedExam).color}
                                                size="small"
                                            />
                                        </Box>
                                    </Grid>
                                    {selectedExam.description && (
                                        <Grid item xs={12}>
                                            <Typography variant="caption" color="text.secondary">Description</Typography>
                                            <Typography variant="body2">{selectedExam.description}</Typography>
                                        </Grid>
                                    )}
                                </Grid>
                            </Paper>

                            {/* Exam Settings */}
                            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                                <Typography variant="h6" gutterBottom>Exam Settings</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6} sm={3}>
                                        <Typography variant="caption" color="text.secondary">Duration</Typography>
                                        <Typography variant="body1">{formatDuration(selectedExam.timeLimit)}</Typography>
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <Typography variant="caption" color="text.secondary">Questions</Typography>
                                        <Typography variant="body1">{selectedExam.questions?.length || 0}</Typography>
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <Typography variant="caption" color="text.secondary">Total Marks</Typography>
                                        <Typography variant="body1">{getTotalMarks(selectedExam)}</Typography>
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <Typography variant="caption" color="text.secondary">Passing %</Typography>
                                        <Typography variant="body1">{selectedExam.passingMarks || 60}%</Typography>
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* Schedule */}
                            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                                <Typography variant="h6" gutterBottom>Schedule</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" color="text.secondary">Start Time</Typography>
                                        <Typography variant="body1">{formatDateTime(selectedExam.startTime)}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" color="text.secondary">End Time</Typography>
                                        <Typography variant="body1">{formatDateTime(selectedExam.endTime)}</Typography>
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* Questions Preview */}
                            {selectedExam.questions && selectedExam.questions.length > 0 && (
                                <Paper elevation={1} sx={{ p: 2 }}>
                                    <Typography variant="h6" gutterBottom>Questions Preview</Typography>
                                    <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                                        {selectedExam.questions.map((question, index) => {
                                            if (!question) return null;
                                            
                                            return (
                                                <Accordion key={index}>
                                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                        <Typography variant="subtitle2">
                                                            Question {index + 1} ({question.marks || 1} mark{(question.marks || 1) > 1 ? 's' : ''})
                                                        </Typography>
                                                    </AccordionSummary>
                                                    <AccordionDetails>
                                                        <Typography variant="body2" paragraph>
                                                            <strong>Q:</strong> {question.question || 'No question text'}
                                                        </Typography>
                                                        {question.options && question.options.length > 0 && (
                                                            <Box sx={{ ml: 2 }}>
                                                                {question.options.map((option, optIndex) => (
                                                                    <Typography 
                                                                        key={optIndex}
                                                                        variant="body2" 
                                                                        sx={{ 
                                                                            mb: 0.5,
                                                                            p: 0.5,
                                                                            backgroundColor: question.correctAnswer === String.fromCharCode(65 + optIndex) 
                                                                                ? 'success.light' : 'transparent',
                                                                            borderRadius: 1,
                                                                            display: 'flex',
                                                                            alignItems: 'center'
                                                                        }}
                                                                    >
                                                                        {String.fromCharCode(65 + optIndex)}. {option || 'Empty option'}
                                                                        {question.correctAnswer === String.fromCharCode(65 + optIndex) && (
                                                                            <CheckCircleIcon sx={{ ml: 1, fontSize: 16, color: 'success.dark' }} />
                                                                        )}
                                                                    </Typography>
                                                                ))}
                                                            </Box>
                                                        )}
                                                        {question.explanation && (
                                                            <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    <strong>Explanation:</strong> {question.explanation}
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                    </AccordionDetails>
                                                </Accordion>
                                            );
                                        })}
                                    </Box>
                                </Paper>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
                    {selectedExam && (
                        <Button 
                            variant="contained" 
                            startIcon={<EditIcon />}
                            onClick={() => {
                                setShowDetailsDialog(false);
                                handleEditExam(selectedExam._id);
                            }}
                        >
                            Edit Exam
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog 
                open={showDeleteDialog} 
                onClose={() => setShowDeleteDialog(false)}
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <DeleteIcon color="error" />
                        Confirm Delete
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        This action cannot be undone!
                    </Alert>
                    <Typography>
                        Are you sure you want to delete the exam "{examToDelete?.title || 'this exam'}"?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        This will permanently delete:
                        <br />• The exam and all its questions
                        <br />• All student results for this exam
                        <br />• Any associated data
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setShowDeleteDialog(false)}
                        startIcon={<CancelIcon />}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="contained" 
                        color="error"
                        onClick={confirmDeleteExam}
                        startIcon={isLoading ? <CircularProgress size={16} /> : <DeleteIcon />}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Deleting...' : 'Delete Exam'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ExamList;