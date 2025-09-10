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
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Avatar,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Divider
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    CalendarToday as CalendarIcon,
    Refresh as RefreshIcon,
    ArrowBack as ArrowBackIcon,
    Save as SaveIcon,
    Person as PersonIcon,
    SubjectOutlined as SubjectIcon,
    History as HistoryIcon
} from '@mui/icons-material';
import { getAllStudents } from '../../redux/studentRelated/studentHandle';
import { GreenButton } from '../../components/buttonStyles';
import axios from 'axios';

const REACT_APP_BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

const ManageAttendancePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentUser } = useSelector((state) => state.user);
    const { studentsList } = useSelector((state) => state.student);

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [attendanceRecords, setAttendanceRecords] = useState({});
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [alertType, setAlertType] = useState('success');
    
    // State for saved attendance history
    const [savedAttendanceHistory, setSavedAttendanceHistory] = useState([]);
    
    // Teacher data state
    const [teacherData, setTeacherData] = useState(null);
    const [myStudents, setMyStudents] = useState([]);
    const [mySubjects, setMySubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load saved attendance history from localStorage on component mount
    useEffect(() => {
        const loadSavedAttendanceHistoryFromStorage = () => {
            try {
                const saved = localStorage.getItem('teacherAttendanceHistory');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    // Only restore if it's from the same teacher
                    if (parsed.teacherId === currentUser?._id) {
                        setSavedAttendanceHistory(parsed.records || []);
                    }
                }
            } catch (error) {
                console.error('Error loading saved attendance history from localStorage:', error);
            }
        };
        
        if (currentUser?._id) {
            loadSavedAttendanceHistoryFromStorage();
        }
    }, [currentUser]);

    useEffect(() => {
        fetchTeacherDataAndStudents();
    }, [currentUser]);

    useEffect(() => {
        if (studentsList && teacherData && studentsList.length > 0) {
            filterMyStudents();
        }
    }, [studentsList, teacherData]);

    // Load existing attendance when date or subject changes
    useEffect(() => {
        if (selectedSubject && myStudents.length > 0) {
            loadExistingAttendance();
        }
    }, [selectedDate, selectedSubject, myStudents]);

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
            console.error('Error fetching teacher ', err);
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

    const loadExistingAttendance = async () => {
        if (!selectedSubject || !myStudents.length) return;

        const existingRecords = {};
        
        // Check each student for existing attendance on selected date
        for (const student of myStudents) {
            try {
                const response = await axios.get(`${REACT_APP_BASE_URL}/Student/${student._id}/attendance`);
                const attendanceHistory = response.data || [];
                
                const existingAttendance = attendanceHistory.find(att => 
                    att.subName === selectedSubject && 
                    new Date(att.date).toDateString() === new Date(selectedDate).toDateString()
                );
                
                if (existingAttendance) {
                    existingRecords[student._id] = existingAttendance.status;
                }
            } catch (error) {
                console.warn(`Could not fetch attendance for student ${student._id}:`, error);
            }
        }
        
        setAttendanceRecords(existingRecords);
    };

    const handleAttendanceChange = (studentId, status) => {
        setAttendanceRecords(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const handleSaveAttendance = async () => {
        if (!selectedSubject) {
            setMessage('Please select a subject');
            setAlertType('error');
            return;
        }

        const studentsWithAttendance = Object.keys(attendanceRecords).filter(
            studentId => attendanceRecords[studentId]
        );

        if (studentsWithAttendance.length === 0) {
            setMessage('Please mark attendance for at least one student');
            setAlertType('warning');
            return;
        }

        setSubmitting(true);
        try {
            const attendancePromises = studentsWithAttendance.map(async (studentId) => {
                const attendanceData = {
                    subName: selectedSubject,
                    status: attendanceRecords[studentId],
                    date: selectedDate
                };

                return axios.put(
                    `${REACT_APP_BASE_URL}/StudentAttendance/${studentId}`,
                    attendanceData
                );
            });

            await Promise.all(attendancePromises);
            
            // Create saved attendance records for this submission
            const newRecords = studentsWithAttendance.map(studentId => {
                const student = myStudents.find(s => s._id === studentId);
                return {
                    studentId,
                    studentName: student?.name || 'Unknown',
                    rollNum: student?.rollNum || 'N/A',
                    className: student?.sclassName?.sclassName || 'N/A',
                    status: attendanceRecords[studentId],
                    date: selectedDate,
                    subject: mySubjects.find(s => s._id === selectedSubject)?.subName || 'Unknown',
                    timestamp: new Date(),
                    // Add a unique ID for this submission batch
                    submissionId: Date.now() + Math.random().toString(36).substr(2, 9)
                };
            });
            
            // Add the new records to the history (prepend so newest is at top)
            setSavedAttendanceHistory(prevHistory => {
                const updatedHistory = [...newRecords, ...prevHistory];
                
                // Save to localStorage for persistence across reloads
                try {
                    localStorage.setItem('teacherAttendanceHistory', JSON.stringify({
                        teacherId: currentUser._id,
                        records: updatedHistory,
                        lastUpdated: new Date().toISOString()
                    }));
                } catch (error) {
                    console.error('Error saving to localStorage:', error);
                }
                
                return updatedHistory;
            });
            
            setMessage(`Successfully recorded attendance for ${studentsWithAttendance.length} students`);
            setAlertType('success');
            setSaveDialogOpen(true);
            
        } catch (error) {
            console.error('Error saving attendance:', error);
            setMessage('Failed to save attendance. Please try again.');
            setAlertType('error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCloseDialog = () => {
        setSaveDialogOpen(false);
        setMessage('');
    };

    const getStudentAttendanceStatus = (studentId) => {
        return attendanceRecords[studentId] || '';
    };

    const getAttendanceStats = () => {
        const totalMarked = Object.values(attendanceRecords).filter(status => status).length;
        const presentCount = Object.values(attendanceRecords).filter(status => status === 'Present').length;
        const absentCount = Object.values(attendanceRecords).filter(status => status === 'Absent').length;
        
        return { totalMarked, presentCount, absentCount };
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
    const stats = getAttendanceStats();

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
                        Manage Attendance
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Record attendance for your students
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
                                <CalendarIcon sx={{ mr: 1 }} />
                                Select Date
                            </Typography>
                            <TextField
                                fullWidth
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Attendance Summary
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={4}>
                                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
                                        <Typography variant="h4">{stats.presentCount}</Typography>
                                        <Typography variant="body2">Present</Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={4}>
                                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light' }}>
                                        <Typography variant="h4">{stats.absentCount}</Typography>
                                        <Typography variant="body2">Absent</Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={4}>
                                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light' }}>
                                        <Typography variant="h4">{stats.totalMarked}</Typography>
                                        <Typography variant="body2">Total Marked</Typography>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {message && (
                <Alert severity={alertType} sx={{ mb: 2 }}>
                    {message}
                </Alert>
            )}

            {/* Attendance Table */}
            {selectedSubject ? (
                studentsForSelectedSubject.length > 0 ? (
                    <Paper>
                        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                            <Typography variant="h6">
                                Students in {mySubjects.find(s => s._id === selectedSubject)?.subName} ({studentsForSelectedSubject.length})
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Date: {new Date(selectedDate).toLocaleDateString()}
                            </Typography>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Student</strong></TableCell>
                                        <TableCell><strong>Class</strong></TableCell>
                                        <TableCell><strong>Roll No</strong></TableCell>
                                        <TableCell><strong>Attendance Status</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {studentsForSelectedSubject.map((student) => (
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
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Chip
                                                        icon={<CheckCircleIcon />}
                                                        label="Present"
                                                        color={getStudentAttendanceStatus(student._id) === 'Present' ? 'success' : 'default'}
                                                        onClick={() => handleAttendanceChange(student._id, 'Present')}
                                                        variant={getStudentAttendanceStatus(student._id) === 'Present' ? 'filled' : 'outlined'}
                                                        clickable
                                                    />
                                                    <Chip
                                                        icon={<CancelIcon />}
                                                        label="Absent"
                                                        color={getStudentAttendanceStatus(student._id) === 'Absent' ? 'error' : 'default'}
                                                        onClick={() => handleAttendanceChange(student._id, 'Absent')}
                                                        variant={getStudentAttendanceStatus(student._id) === 'Absent' ? 'filled' : 'outlined'}
                                                        clickable
                                                    />
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Save Button */}
                        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="textSecondary">
                                {stats.totalMarked} of {studentsForSelectedSubject.length} students marked for {selectedDate}
                            </Typography>
                            <GreenButton
                                variant="contained"
                                size="large"
                                onClick={handleSaveAttendance}
                                disabled={submitting || stats.totalMarked === 0}
                                startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
                            >
                                {submitting ? 'Saving...' : 'Save Attendance'}
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
                    Please select a subject to view students and record attendance.
                </Alert>
            )}

            {/* Saved Attendance History Display */}
            {savedAttendanceHistory.length > 0 && (
                <>
                    <Divider sx={{ my: 4 }} />
                    <Paper sx={{ mt: 4 }}>
                        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: 'success.light' }}>
                            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                                <HistoryIcon sx={{ mr: 1 }} />
                                Attendance History
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                {savedAttendanceHistory.length} total submissions
                            </Typography>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Submission Time</strong></TableCell>
                                        <TableCell><strong>Student</strong></TableCell>
                                        <TableCell><strong>Class</strong></TableCell>
                                        <TableCell><strong>Roll No</strong></TableCell>
                                        <TableCell><strong>Subject</strong></TableCell>
                                        <TableCell><strong>Date</strong></TableCell>
                                        <TableCell><strong>Status</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {savedAttendanceHistory.map((record, index) => (
                                        <TableRow key={record.submissionId || index} hover>
                                            {index === 0 || 
                                             (index > 0 && 
                                              new Date(savedAttendanceHistory[index-1].timestamp).toDateString() !== 
                                              new Date(record.timestamp).toDateString()) || 
                                             (index > 0 && 
                                              savedAttendanceHistory[index-1].submissionId !== record.submissionId) ? (
                                                <TableCell rowSpan={
                                                    // Calculate how many records belong to this submission
                                                    (() => {
                                                        let count = 1;
                                                        for (let i = index + 1; i < savedAttendanceHistory.length; i++) {
                                                            if (savedAttendanceHistory[i].submissionId === record.submissionId) {
                                                                count++;
                                                            } else {
                                                                break;
                                                            }
                                                        }
                                                        return count;
                                                    })()
                                                }>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {new Date(record.timestamp).toLocaleString()}
                                                    </Typography>
                                                </TableCell>
                                            ) : null}
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Avatar sx={{ mr: 2, width: 32, height: 32, bgcolor: 'success.main' }}>
                                                        <PersonIcon fontSize="small" />
                                                    </Avatar>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {record.studentName}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={record.className} 
                                                    size="small" 
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {record.rollNum}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {record.subject}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {new Date(record.date).toLocaleDateString()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={record.status === 'Present' ? <CheckCircleIcon /> : <CancelIcon />}
                                                    label={record.status}
                                                    color={record.status === 'Present' ? 'success' : 'error'}
                                                    size="small"
                                                    variant="filled"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
                            <Typography variant="body2" color="textSecondary">
                                Showing {savedAttendanceHistory.length} attendance records from {savedAttendanceHistory.length > 0 ? 
                                    new Date(savedAttendanceHistory[savedAttendanceHistory.length - 1].timestamp).toLocaleDateString() : ''} 
                                    to {new Date(savedAttendanceHistory[0].timestamp).toLocaleDateString()}
                            </Typography>
                        </Box>
                    </Paper>
                </>
            )}

            {/* Success Dialog */}
            <Dialog open={saveDialogOpen} onClose={handleCloseDialog}>
                <DialogTitle>Attendance Saved Successfully</DialogTitle>
                <DialogContent>
                    <Typography>
                        Attendance records for {selectedDate} have been saved successfully.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>OK</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ManageAttendancePage;