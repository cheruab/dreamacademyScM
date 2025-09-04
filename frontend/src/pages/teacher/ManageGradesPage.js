import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
    Button,
    IconButton,
    Alert,
    CircularProgress,
    Card,
    CardContent,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Avatar
} from '@mui/material';
import {
    Grade as GradeIcon,
    Refresh as RefreshIcon,
    ArrowBack as ArrowBackIcon,
    Visibility as VisibilityIcon,
    TrendingUp as TrendingUpIcon,
    Person as PersonIcon,
    SubjectOutlined as SubjectIcon,
    Assignment as AssignmentIcon
} from '@mui/icons-material';
import { getAllStudents } from '../../redux/studentRelated/studentHandle';
import { GreenButton } from '../../components/buttonStyles';
import axios from 'axios';

const REACT_APP_BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

const ManageGradesPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentUser } = useSelector((state) => state.user);
    const { studentsList } = useSelector((state) => state.student);

    const [selectedExam, setSelectedExam] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [maxMarks, setMaxMarks] = useState(100);
    const [gradeRecords, setGradeRecords] = useState({});
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [alertType, setAlertType] = useState('success');

    // Teacher data state
    const [teacherData, setTeacherData] = useState(null);
    const [myStudents, setMyStudents] = useState([]);
    const [mySubjects, setMySubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTeacherDataAndStudents();
    }, [currentUser]);

    useEffect(() => {
        if (studentsList && teacherData && studentsList.length > 0) {
            filterMyStudents();
        }
    }, [studentsList, teacherData]);

    // Load existing grades when exam or subject changes
    useEffect(() => {
        if (selectedExam && selectedSubject && myStudents.length > 0) {
            loadExistingGrades();
        }
    }, [selectedExam, selectedSubject, myStudents]);

    const fetchTeacherDataAndStudents = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get teacher's detailed information
            const teacherResponse = await fetch(`${REACT_APP_BASE_URL}/Teacher/${currentUser._id}`);
            const teacherData = await teacherResponse.json();

            if (teacherData.message) {
                setError("Teacher data not found");
                return;
            }

            // Populate assignments if needed
            if (teacherData.assignments && teacherData.assignments.length > 0) {
                for (let assignment of teacherData.assignments) {
                    if (assignment.subject && typeof assignment.subject === 'string') {
                        try {
                            const subjectResponse = await fetch(`${REACT_APP_BASE_URL}/Subject/${assignment.subject}`);
                            const subjectData = await subjectResponse.json();
                            if (subjectData && !subjectData.message) {
                                assignment.subject = subjectData;
                            }
                        } catch (error) {
                            console.error('Error fetching subject:', error);
                        }
                    }

                    if (assignment.class && typeof assignment.class === 'string') {
                        try {
                            const classResponse = await fetch(`${REACT_APP_BASE_URL}/Sclass/${assignment.class}`);
                            const classData = await classResponse.json();
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

            // Extract unique subjects taught by teacher
            const subjects = [];
            if (teacherData.assignments && teacherData.assignments.length > 0) {
                teacherData.assignments.forEach(assignment => {
                    const subject = assignment.subject;
                    if (subject && !subjects.find(s => s._id === subject._id)) {
                        subjects.push({
                            _id: subject._id,
                            subName: subject.subName,
                            subCode: subject.subCode
                        });
                    }
                });
            } else if (teacherData.teachSubject) {
                subjects.push(teacherData.teachSubject);
            }
            
            setMySubjects(subjects);
            if (subjects.length === 1) {
                setSelectedSubject(subjects[0]._id);
            }

            // Get all students from school
            if (teacherData.assignments || teacherData.teachSclass) {
                dispatch(getAllStudents(currentUser.school._id));
            } else {
                setError("You are not assigned to any classes yet");
            }

        } catch (err) {
            console.error('Error fetching teacher data:', err);
            setError("Error loading teacher information");
        } finally {
            setLoading(false);
        }
    };

    const filterMyStudents = () => {
        if (!studentsList || !teacherData) return;

        let filteredStudents = [];

        if (teacherData.assignments && teacherData.assignments.length > 0) {
            const myClassIds = teacherData.assignments.map(assignment => 
                assignment.class._id || assignment.class
            );

            filteredStudents = studentsList.filter(student => {
                if (!student.sclassName) return false;
                const studentClassId = student.sclassName._id || student.sclassName;
                return myClassIds.includes(studentClassId);
            });
        } else if (teacherData.teachSclass) {
            const teacherClassId = teacherData.teachSclass._id || teacherData.teachSclass;
            filteredStudents = studentsList.filter(student => {
                if (!student.sclassName) return false;
                const studentClassId = student.sclassName._id || student.sclassName;
                return studentClassId === teacherClassId;
            });
        }

        setMyStudents(filteredStudents);
    };

    const loadExistingGrades = async () => {
        if (!selectedSubject || !selectedExam || !myStudents.length) return;

        const existingGrades = {};
        
        // Check each student for existing exam results
        for (const student of myStudents) {
            try {
                // This would typically fetch existing exam results from your API
                // For now, we'll just initialize empty records
                existingGrades[student._id] = 0;
            } catch (error) {
                console.warn(`Could not fetch grades for student ${student._id}:`, error);
            }
        }
        
        setGradeRecords(existingGrades);
    };

    const handleGradeChange = (studentId, marks) => {
        setGradeRecords(prev => ({
            ...prev,
            [studentId]: Math.min(Math.max(parseInt(marks) || 0, 0), maxMarks)
        }));
    };

    const handleSaveGrades = async () => {
        if (!selectedSubject) {
            setMessage('Please select a subject');
            setAlertType('error');
            return;
        }

        if (!selectedExam.trim()) {
            setMessage('Please enter an exam name');
            setAlertType('error');
            return;
        }

        const studentsWithGrades = Object.keys(gradeRecords).filter(
            studentId => gradeRecords[studentId] !== undefined && gradeRecords[studentId] !== ''
        );

        if (studentsWithGrades.length === 0) {
            setMessage('Please enter grades for at least one student');
            setAlertType('warning');
            return;
        }

        setSubmitting(true);
        try {
            const gradePromises = studentsWithGrades.map(async (studentId) => {
                const gradeData = {
                    subName: selectedSubject,
                    marksObtained: parseInt(gradeRecords[studentId]),
                    examName: selectedExam,
                    maxMarks: maxMarks
                };

                return axios.put(
                    `${REACT_APP_BASE_URL}/UpdateExamResult/${studentId}`,
                    gradeData
                );
            });

            await Promise.all(gradePromises);
            
            setMessage(`Successfully recorded grades for ${studentsWithGrades.length} students`);
            setAlertType('success');
            setSaveDialogOpen(true);
            
        } catch (error) {
            console.error('Error saving grades:', error);
            setMessage('Failed to save grades. Please try again.');
            setAlertType('error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCloseDialog = () => {
        setSaveDialogOpen(false);
        setMessage('');
        // Reset grade records after successful save
        setGradeRecords({});
    };

    const getGradeColor = (percentage) => {
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

    // Get students for selected subject
    const getStudentsForSubject = () => {
        if (!selectedSubject || !teacherData || !myStudents.length) return [];
        
        if (teacherData.assignments) {
            // Find which classes this subject is taught in
            const relevantAssignments = teacherData.assignments.filter(
                assignment => assignment.subject._id === selectedSubject
            );
            
            const relevantClassIds = relevantAssignments.map(assignment => 
                assignment.class._id || assignment.class
            );
            
            return myStudents.filter(student => {
                if (!student.sclassName) return false;
                const studentClassId = student.sclassName._id || student.sclassName;
                return relevantClassIds.includes(studentClassId);
            });
        } else {
            return myStudents;
        }
    };

    const studentsForSelectedSubject = getStudentsForSubject();

    const getGradeStats = () => {
        const studentsWithGrades = studentsForSelectedSubject.filter(student => 
            gradeRecords[student._id] !== undefined && gradeRecords[student._id] !== '' && gradeRecords[student._id] > 0
        );
        
        const totalGraded = studentsWithGrades.length;
        const averageMarks = totalGraded > 0 ? 
            Math.round(studentsWithGrades.reduce((sum, student) => sum + gradeRecords[student._id], 0) / totalGraded) : 0;
        const averagePercentage = maxMarks > 0 ? Math.round((averageMarks / maxMarks) * 100) : 0;
        
        const gradeDistribution = {
            'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C': 0, 'F': 0
        };
        
        studentsWithGrades.forEach(student => {
            const percentage = maxMarks > 0 ? Math.round((gradeRecords[student._id] / maxMarks) * 100) : 0;
            const grade = getGradeFromPercentage(percentage);
            gradeDistribution[grade]++;
        });

        return { totalGraded, averageMarks, averagePercentage, gradeDistribution };
    };

    const stats = getGradeStats();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading your classes and students...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Typography variant="body1" color="textSecondary">
                    Contact your administrator to get assigned to classes and subjects.
                </Typography>
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
                        Manage Grades
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Record and manage exam grades for your students
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() => window.location.reload()}
                >
                    Refresh
                </Button>
            </Box>

            {/* Filters */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <SubjectIcon sx={{ mr: 1 }} />
                                Select Subject
                            </Typography>
                            <FormControl fullWidth>
                                <InputLabel>Subject</InputLabel>
                                <Select
                                    value={selectedSubject}
                                    label="Subject"
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                >
                                    {mySubjects.map(subject => (
                                        <MenuItem key={subject._id} value={subject._id}>
                                            {subject.subName} ({subject.subCode})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <AssignmentIcon sx={{ mr: 1 }} />
                                Exam Details
                            </Typography>
                            <TextField
                                fullWidth
                                label="Exam Name"
                                value={selectedExam}
                                onChange={(e) => setSelectedExam(e.target.value)}
                                placeholder="e.g., Mid-Term Exam"
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label="Maximum Marks"
                                type="number"
                                value={maxMarks}
                                onChange={(e) => setMaxMarks(Math.max(1, parseInt(e.target.value) || 1))}
                                inputProps={{ min: 1 }}
                            />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Grade Statistics
                            </Typography>
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={3}>
                                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light' }}>
                                        <Typography variant="h4">{stats.totalGraded}</Typography>
                                        <Typography variant="body2">Graded</Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={3}>
                                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
                                        <Typography variant="h4">{stats.averageMarks}</Typography>
                                        <Typography variant="body2">Avg Marks</Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={3}>
                                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light' }}>
                                        <Typography variant="h4">{stats.averagePercentage}%</Typography>
                                        <Typography variant="body2">Avg %</Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={3}>
                                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light' }}>
                                        <Typography variant="h4">{studentsForSelectedSubject.length}</Typography>
                                        <Typography variant="body2">Total</Typography>
                                    </Paper>
                                </Grid>
                            </Grid>
                            
                            {/* Grade Distribution */}
                            <Typography variant="subtitle2" gutterBottom>Grade Distribution:</Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {Object.entries(stats.gradeDistribution).map(([grade, count]) => (
                                    <Chip 
                                        key={grade}
                                        label={`${grade}: ${count}`}
                                        size="small"
                                        color={grade.includes('A') ? 'success' : grade.includes('B') ? 'primary' : grade === 'C' ? 'warning' : 'error'}
                                        variant="outlined"
                                    />
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {message && (
                <Alert severity={alertType} sx={{ mb: 2 }}>
                    {message}
                </Alert>
            )}

            {/* Grades Table */}
            {selectedSubject ? (
                studentsForSelectedSubject.length > 0 ? (
                    <Paper>
                        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                            <Typography variant="h6">
                                Students in {mySubjects.find(s => s._id === selectedSubject)?.subName} ({studentsForSelectedSubject.length})
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                {selectedExam ? `Exam: ${selectedExam}` : 'Enter exam name above'} | Max Marks: {maxMarks}
                            </Typography>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Student</strong></TableCell>
                                        <TableCell><strong>Class</strong></TableCell>
                                        <TableCell><strong>Roll No</strong></TableCell>
                                        <TableCell><strong>Marks Obtained</strong></TableCell>
                                        <TableCell><strong>Percentage</strong></TableCell>
                                        <TableCell><strong>Grade</strong></TableCell>
                                        <TableCell><strong>Actions</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {studentsForSelectedSubject.map((student) => {
                                        const marks = gradeRecords[student._id] || 0;
                                        const percentage = maxMarks > 0 ? Math.round((marks / maxMarks) * 100) : 0;
                                        const gradeInfo = getGradeFromPercentage(percentage);
                                        const gradeColor = getGradeColor(percentage);

                                        return (
                                            <TableRow key={student._id} hover>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Avatar sx={{ mr: 2, width: 40, height: 40 }}>
                                                            <PersonIcon />
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body1" fontWeight="bold">
                                                                {student.name}
                                                            </Typography>
                                                            <Typography variant="body2" color="textSecondary">
                                                                ID: {student._id?.slice(-6)}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={student.sclassName?.sclassName || 'N/A'} 
                                                        size="small" 
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="h6">
                                                        {student.rollNum}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        type="number"
                                                        value={marks}
                                                        onChange={(e) => handleGradeChange(student._id, e.target.value)}
                                                        inputProps={{ 
                                                            min: 0, 
                                                            max: maxMarks,
                                                            style: { width: '80px' }
                                                        }}
                                                        variant="outlined"
                                                        size="small"
                                                    />
                                                    <Typography variant="caption" display="block" color="text.secondary">
                                                        / {maxMarks}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <TrendingUpIcon 
                                                            color={gradeColor}
                                                            sx={{ fontSize: 18 }}
                                                        />
                                                        <Typography color={`${gradeColor}.main`} fontWeight="bold">
                                                            {percentage}%
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={gradeInfo}
                                                        color={gradeColor}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => navigate(`/Teacher/class/student/${student._id}`)}
                                                        title="View Student Profile"
                                                    >
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Save Button */}
                        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="textSecondary">
                                {stats.totalGraded} of {studentsForSelectedSubject.length} students graded
                            </Typography>
                            <GreenButton
                                variant="contained"
                                size="large"
                                onClick={handleSaveGrades}
                                disabled={submitting || !selectedExam || stats.totalGraded === 0}
                                startIcon={submitting ? <CircularProgress size={20} /> : <GradeIcon />}
                            >
                                {submitting ? 'Saving...' : 'Save Grades'}
                            </GreenButton>
                        </Box>
                    </Paper>
                ) : (
                    <Alert severity="info">
                        No students found for the selected subject.
                    </Alert>
                )
            ) : (
                <Alert severity="info">
                    Please select a subject to view students and record grades.
                </Alert>
            )}

            {/* Success Dialog */}
            <Dialog open={saveDialogOpen} onClose={handleCloseDialog}>
                <DialogTitle>Grades Saved Successfully</DialogTitle>
                <DialogContent>
                    <Typography>
                        Grade records for {selectedExam} have been saved successfully.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>OK</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ManageGradesPage;