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
    CircularProgress
} from '@mui/material';
import {
    Add as AddIcon,
    Assignment as AssignmentIcon,
    Schedule as ScheduleIcon,
    People as PeopleIcon,
    TrendingUp as TrendingUpIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { BlueButton, GreenButton } from '../../components/buttonStyles';

const ExamsPage = () => {
    const navigate = useNavigate();
    const { currentUser } = useSelector((state) => state.user);
    const [loading, setLoading] = useState(false);
    const [exams, setExams] = useState([]);

    const teachSubject = currentUser.teachSubject;

    useEffect(() => {
        // Simulate loading exams - in a real app, this would fetch from an API
        setLoading(true);
        setTimeout(() => {
            setExams([
                {
                    _id: '1',
                    title: 'First Term Examination',
                    description: 'Comprehensive first term assessment',
                    totalQuestions: 25,
                    totalMarks: 100,
                    duration: 120,
                    submissions: 18,
                    averageScore: 72,
                    status: 'completed',
                    createdAt: '2023-09-20',
                    scheduledDate: '2023-09-25'
                },
                {
                    _id: '2',
                    title: 'Chapter 3-5 Test',
                    description: 'Covering chapters 3 to 5 material',
                    totalQuestions: 15,
                    totalMarks: 50,
                    duration: 60,
                    submissions: 0,
                    averageScore: 0,
                    status: 'scheduled',
                    createdAt: '2023-10-10',
                    scheduledDate: '2023-10-15'
                }
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const handleCreateExam = () => {
        navigate(`/Teacher/assessments/exams/create`);
    };

    const handleViewResults = (examId) => {
        navigate(`/Teacher/assessments/exams/results/${examId}`);
    };

    const handleEditExam = (examId) => {
        navigate(`/Teacher/assessments/exams/edit/${examId}`);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'scheduled': return 'warning';
            case 'active': return 'info';
            case 'completed': return 'success';
            case 'draft': return 'default';
            default: return 'default';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading exams...</Typography>
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
                            Exams Management
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            Subject: {teachSubject?.subName}
                        </Typography>
                    </Box>
                </Box>
                <GreenButton
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateExam}
                >
                    Create New Exam
                </GreenButton>
            </Box>

            {/* Statistics */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <AssignmentIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h4" color="primary">
                                {exams.length}
                            </Typography>
                            <Typography color="textSecondary">
                                Total Exams
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <PeopleIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h4" color="secondary">
                                {exams.reduce((sum, exam) => sum + exam.submissions, 0)}
                            </Typography>
                            <Typography color="textSecondary">
                                Total Submissions
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <TrendingUpIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h4" color="success.main">
                                {exams.filter(exam => exam.submissions > 0).length > 0 
                                    ? Math.round(exams.filter(exam => exam.submissions > 0)
                                        .reduce((sum, exam) => sum + exam.averageScore, 0) / 
                                        exams.filter(exam => exam.submissions > 0).length) 
                                    : 0}%
                            </Typography>
                            <Typography color="textSecondary">
                                Average Score
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <ScheduleIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h4" color="info.main">
                                {exams.filter(exam => exam.status === 'scheduled').length}
                            </Typography>
                            <Typography color="textSecondary">
                                Upcoming Exams
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Exams List */}
            {exams.length > 0 ? (
                <Grid container spacing={3}>
                    {exams.map((exam) => (
                        <Grid item xs={12} md={6} key={exam._id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Typography variant="h6" component="h2">
                                            {exam.title}
                                        </Typography>
                                        <Chip
                                            label={exam.status}
                                            color={getStatusColor(exam.status)}
                                            size="small"
                                        />
                                    </Box>
                                    
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {exam.description}
                                    </Typography>
                                    
                                    <Grid container spacing={1} sx={{ mb: 2 }}>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" display="block">
                                                Questions
                                            </Typography>
                                            <Typography variant="body2" fontWeight="bold">
                                                {exam.totalQuestions}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" display="block">
                                                Total Marks
                                            </Typography>
                                            <Typography variant="body2" fontWeight="bold">
                                                {exam.totalMarks}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" display="block">
                                                Duration
                                            </Typography>
                                            <Typography variant="body2" fontWeight="bold">
                                                {exam.duration} min
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" display="block">
                                                Scheduled
                                            </Typography>
                                            <Typography variant="body2" fontWeight="bold">
                                                {formatDate(exam.scheduledDate)}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" display="block">
                                                Submissions
                                            </Typography>
                                            <Typography variant="body2" fontWeight="bold">
                                                {exam.submissions}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" display="block">
                                                Avg. Score
                                            </Typography>
                                            <Typography variant="body2" fontWeight="bold" color={
                                                exam.averageScore >= 80 ? 'success.main' : 
                                                exam.averageScore >= 60 ? 'warning.main' : 'error.main'
                                            }>
                                                {exam.submissions > 0 ? `${exam.averageScore}%` : 'N/A'}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                                
                                <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                                    {exam.submissions > 0 && (
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => handleViewResults(exam._id)}
                                        >
                                            View Results
                                        </Button>
                                    )}
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => handleEditExam(exam._id)}
                                    >
                                        {exam.status === 'draft' ? 'Edit' : 'View Details'}
                                    </Button>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Card>
                    <CardContent sx={{ textAlign: 'center', py: 6 }}>
                        <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h5" gutterBottom>
                            No Exams Yet
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            Create your first exam to evaluate student performance comprehensively.
                        </Typography>
                        <GreenButton
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleCreateExam}
                        >
                            Create Your First Exam
                        </GreenButton>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default ExamsPage;