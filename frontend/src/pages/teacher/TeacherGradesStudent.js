import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    Alert,
    CircularProgress,
    Avatar,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton
} from '@mui/material';
import {
    Grade as GradeIcon,
    Save as SaveIcon,
    Person as PersonIcon,
    Subject as SubjectIcon,
    History as HistoryIcon,
    Edit as EditIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import axios from 'axios';

const REACT_APP_BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

const TeacherGradesStudents = () => {
    const { studentId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser } = useSelector(state => state.user);
    
    const [student, setStudent] = useState(location.state?.student || null);
    const [subjects, setSubjects] = useState(location.state?.subjects || []);
    const [loading, setLoading] = useState(!student);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const [selectedSubject, setSelectedSubject] = useState('');
    const [marks, setMarks] = useState('');
    const [totalMarks, setTotalMarks] = useState(100);
    const [examType, setExamType] = useState('Assignment');
    const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
    
    const [gradeHistory, setGradeHistory] = useState([]);
    const [historyDialog, setHistoryDialog] = useState(false);

    useEffect(() => {
        if (!student && studentId) {
            fetchStudentData();
        } else if (student) {
            fetchGradeHistory();
        }
    }, [studentId, student]);

    const fetchStudentData = async () => {
        try {
            setLoading(true);
            setError('');

            // Fetch student details
            const studentResponse = await axios.get(`${REACT_APP_BASE_URL}/Student/${studentId}`);
            const studentData = studentResponse.data;
            setStudent(studentData);

            // Fetch teacher's subjects for this student's class
            const teacherResponse = await axios.get(`${REACT_APP_BASE_URL}/Teacher/${currentUser._id}`);
            const teacherData = teacherResponse.data;

            if (teacherData.assignments) {
                const classSubjects = teacherData.assignments
                    .filter(a => a.class._id === studentData.sclassName._id)
                    .map(a => ({
                        _id: a.subject._id,
                        subName: a.subject.subName,
                        subCode: a.subject.subCode
                    }));
                setSubjects(classSubjects);
            }

            fetchGradeHistory();
        } catch (err) {
            console.error('Error fetching student data:', err);
            setError('Failed to load student data');
        } finally {
            setLoading(false);
        }
    };

    const fetchGradeHistory = async () => {
        try {
            const response = await axios.get(`${REACT_APP_BASE_URL}/Student/${studentId}/grades`);
            if (response.data && Array.isArray(response.data)) {
                setGradeHistory(response.data);
            }
        } catch (err) {
            console.warn('Could not fetch grade history:', err);
            setGradeHistory([]);
        }
    };

    const handleSubmitGrade = async (e) => {
        e.preventDefault();
        
        if (!selectedSubject || !marks || !totalMarks) {
            setError('Please fill in all required fields');
            return;
        }

        if (parseFloat(marks) > parseFloat(totalMarks)) {
            setError('Marks obtained cannot be greater than total marks');
            return;
        }

        try {
            setSaving(true);
            setError('');

            const gradeData = {
                subName: selectedSubject,
                marksObtained: parseFloat(marks),
                totalMarks: parseFloat(totalMarks),
                examType,
                examDate,
                percentage: Math.round((parseFloat(marks) / parseFloat(totalMarks)) * 100),
                teacherId: currentUser._id
            };

            await axios.put(`${REACT_APP_BASE_URL}/Student/${studentId}/marks`, gradeData);
            
            setSuccess('Grade added successfully!');
            setMarks('');
            setTotalMarks(100);
            setExamType('Assignment');
            setExamDate(new Date().toISOString().split('T')[0]);
            setSelectedSubject('');
            
            // Refresh grade history
            fetchGradeHistory();

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error saving grade:', err);
            setError(err.response?.data?.message || 'Failed to save grade');
        } finally {
            setSaving(false);
        }
    };

    const getGradeColor = (percentage) => {
        if (percentage >= 90) return 'success';
        if (percentage >= 80) return 'info';
        if (percentage >= 70) return 'warning';
        if (percentage >= 60) return 'secondary';
        return 'error';
    };

    const getGradeLetter = (percentage) => {
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B';
        if (percentage >= 60) return 'C';
        return 'F';
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
                <Typography sx={{ ml: 2 }}>Loading student data...</Typography>
            </Box>
        );
    }

    if (!student) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">
                    Student not found or you don't have permission to grade this student.
                </Alert>
            </Box>
        );
    }

    // Calculate statistics from grade history
    const subjectGrades = gradeHistory.reduce((acc, grade) => {
        if (!acc[grade.subName]) {
            acc[grade.subName] = [];
        }
        acc[grade.subName].push(grade);
        return acc;
    }, {});

    const averageGrades = Object.keys(subjectGrades).map(subject => {
        const grades = subjectGrades[subject];
        const avg = grades.reduce((sum, g) => sum + g.percentage, 0) / grades.length;
        return { subject, average: Math.round(avg), count: grades.length };
    });

    const overallAverage = gradeHistory.length > 0
        ? Math.round(gradeHistory.reduce((sum, g) => sum + g.percentage, 0) / gradeHistory.length)
        : 0;

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <IconButton onClick={() => navigate('/Teacher/students')} sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <GradeIcon color="primary" sx={{ fontSize: '2rem' }} />
                        Manage Grades
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Add and manage grades for {student.name}
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<HistoryIcon />}
                    onClick={() => setHistoryDialog(true)}
                >
                    View Grade History
                </Button>
            </Box>

            <Grid container spacing={3}>
                {/* Student Info */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60, mr: 2 }}>
                                    {student.name?.charAt(0)?.toUpperCase()}
                                </Avatar>
                                <Box>
                                    <Typography variant="h6">{student.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Roll: {student.rollNum}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Class: {student.sclassName?.sclassName || student.className}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ textAlign: 'center', mb: 2 }}>
                                <Typography variant="h3" color="primary" gutterBottom>
                                    {overallAverage}%
                                </Typography>
                                <Chip 
                                    label={`Overall Grade: ${getGradeLetter(overallAverage)}`}
                                    color={getGradeColor(overallAverage)}
                                    size="large"
                                />
                            </Box>

                            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                                Subject Averages
                            </Typography>
                            {averageGrades.length > 0 ? (
                                averageGrades.map(({ subject, average, count }) => (
                                    <Box key={subject} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2">{subject}</Typography>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Chip 
                                                label={`${average}%`}
                                                color={getGradeColor(average)}
                                                size="small"
                                            />
                                            <Typography variant="caption" color="text.secondary">
                                                ({count} grades)
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    No grades recorded yet
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Add Grade Form */}
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EditIcon />
                                Add New Grade
                            </Typography>

                            {error && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            {success && (
                                <Alert severity="success" sx={{ mb: 2 }}>
                                    {success}
                                </Alert>
                            )}

                            <form onSubmit={handleSubmitGrade}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth required>
                                            <InputLabel>Subject</InputLabel>
                                            <Select
                                                value={selectedSubject}
                                                label="Subject"
                                                onChange={(e) => setSelectedSubject(e.target.value)}
                                            >
                                                {subjects.map(subject => (
                                                    <MenuItem key={subject._id} value={subject._id}>
                                                        {subject.subName} ({subject.subCode})
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth required>
                                            <InputLabel>Exam Type</InputLabel>
                                            <Select
                                                value={examType}
                                                label="Exam Type"
                                                onChange={(e) => setExamType(e.target.value)}
                                            >
                                                <MenuItem value="Assignment">Assignment</MenuItem>
                                                <MenuItem value="Quiz">Quiz</MenuItem>
                                                <MenuItem value="Midterm">Midterm Exam</MenuItem>
                                                <MenuItem value="Final">Final Exam</MenuItem>
                                                <MenuItem value="Project">Project</MenuItem>
                                                <MenuItem value="Practical">Practical</MenuItem>
                                                <MenuItem value="Test">Class Test</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            fullWidth
                                            label="Marks Obtained"
                                            type="number"
                                            value={marks}
                                            onChange={(e) => setMarks(e.target.value)}
                                            required
                                            inputProps={{ min: 0, step: 0.5 }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            fullWidth
                                            label="Total Marks"
                                            type="number"
                                            value={totalMarks}
                                            onChange={(e) => setTotalMarks(e.target.value)}
                                            required
                                            inputProps={{ min: 1, step: 0.5 }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            fullWidth
                                            label="Exam Date"
                                            type="date"
                                            value={examDate}
                                            onChange={(e) => setExamDate(e.target.value)}
                                            InputLabelProps={{ shrink: true }}
                                            required
                                        />
                                    </Grid>

                                    {marks && totalMarks && (
                                        <Grid item xs={12}>
                                            <Paper variant="outlined" sx={{ p: 2 }}>
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    Grade Preview:
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Typography variant="h6">
                                                        {Math.round((marks / totalMarks) * 100)}%
                                                    </Typography>
                                                    <Chip 
                                                        label={getGradeLetter(Math.round((marks / totalMarks) * 100))}
                                                        color={getGradeColor(Math.round((marks / totalMarks) * 100))}
                                                    />
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    )}

                                    <Grid item xs={12}>
                                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                            <Button
                                                variant="outlined"
                                                onClick={() => {
                                                    setMarks('');
                                                    setTotalMarks(100);
                                                    setSelectedSubject('');
                                                    setExamType('Assignment');
                                                }}
                                            >
                                                Reset
                                            </Button>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                startIcon={<SaveIcon />}
                                                disabled={saving || !selectedSubject || !marks || !totalMarks}
                                            >
                                                {saving ? 'Saving...' : 'Save Grade'}
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </form>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Grade History Dialog */}
            <Dialog open={historyDialog} onClose={() => setHistoryDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    Grade History - {student.name}
                </DialogTitle>
                <DialogContent>
                    {gradeHistory.length > 0 ? (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Subject</TableCell>
                                        <TableCell>Exam Type</TableCell>
                                        <TableCell>Marks</TableCell>
                                        <TableCell>Percentage</TableCell>
                                        <TableCell>Grade</TableCell>
                                        <TableCell>Date</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {gradeHistory
                                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                                        .map((grade) => (
                                        <TableRow key={grade._id}>
                                            <TableCell>
                                                <Chip 
                                                    icon={<SubjectIcon />}
                                                    label={grade.subName || 'Unknown Subject'}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>{grade.examType}</TableCell>
                                            <TableCell>
                                                {grade.marksObtained}/{grade.totalMarks}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {grade.percentage}%
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={getGradeLetter(grade.percentage)}
                                                    color={getGradeColor(grade.percentage)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(grade.date)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <GradeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">
                                No grades recorded yet
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Start adding grades to see the history here
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setHistoryDialog(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TeacherGradesStudents;