import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
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
    IconButton,
    TextField,
    RadioGroup,
    Radio,
    FormControlLabel
} from '@mui/material';
import {
    EventAvailable as AttendanceIcon,
    Save as SaveIcon,
    Person as PersonIcon,
    History as HistoryIcon,
    CheckCircle as PresentIcon,
    Cancel as AbsentIcon,
    ArrowBack as ArrowBackIcon,
    CalendarToday as CalendarIcon
} from '@mui/icons-material';
import axios from 'axios';

const REACT_APP_BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

const TeacherAttendanceStudent = () => {
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
    const [attendanceStatus, setAttendanceStatus] = useState('Present');
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [historyDialog, setHistoryDialog] = useState(false);

    useEffect(() => {
        if (!student && studentId) {
            fetchStudentData();
        } else if (student) {
            fetchAttendanceHistory();
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

            fetchAttendanceHistory();
        } catch (err) {
            console.error('Error fetching student data:', err);
            setError('Failed to load student data');
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendanceHistory = async () => {
        try {
            const response = await axios.get(`${REACT_APP_BASE_URL}/Student/${studentId}/attendance`);
            if (response.data && Array.isArray(response.data)) {
                setAttendanceHistory(response.data);
            }
        } catch (err) {
            console.warn('Could not fetch attendance history:', err);
            setAttendanceHistory([]);
        }
    };

    const handleSubmitAttendance = async (e) => {
        e.preventDefault();
        
        if (!selectedSubject || !attendanceDate) {
            setError('Please fill in all required fields');
            return;
        }

        // Check if attendance already exists for this date and subject
        const existingAttendance = attendanceHistory.find(
            att => att.subName === selectedSubject && 
                   new Date(att.date).toDateString() === new Date(attendanceDate).toDateString()
        );

        if (existingAttendance) {
            setError('Attendance for this subject and date already exists');
            return;
        }

        try {
            setSaving(true);
            setError('');

            const attendanceData = {
                subName: selectedSubject,
                status: attendanceStatus,
                date: attendanceDate
            };

            await axios.put(`${REACT_APP_BASE_URL}/StudentAttendance/${studentId}`, attendanceData);
            
            setSuccess('Attendance recorded successfully!');
            setSelectedSubject('');
            setAttendanceStatus('Present');
            setAttendanceDate(new Date().toISOString().split('T')[0]);
            
            // Refresh attendance history
            fetchAttendanceHistory();

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error saving attendance:', err);
            setError(err.response?.data?.message || 'Failed to save attendance');
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getAttendanceStats = () => {
        if (attendanceHistory.length === 0) {
            return { total: 0, present: 0, absent: 0, rate: 0 };
        }

        const present = attendanceHistory.filter(att => att.status === 'Present').length;
        const total = attendanceHistory.length;
        const rate = Math.round((present / total) * 100);

        return {
            total,
            present,
            absent: total - present,
            rate
        };
    };

    const getSubjectAttendanceStats = () => {
        const subjectStats = {};
        
        attendanceHistory.forEach(att => {
            if (!subjectStats[att.subName]) {
                subjectStats[att.subName] = { total: 0, present: 0 };
            }
            subjectStats[att.subName].total++;
            if (att.status === 'Present') {
                subjectStats[att.subName].present++;
            }
        });

        return Object.keys(subjectStats).map(subject => ({
            subject,
            total: subjectStats[subject].total,
            present: subjectStats[subject].present,
            rate: Math.round((subjectStats[subject].present / subjectStats[subject].total) * 100)
        }));
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
                    Student not found or you don't have permission to manage attendance for this student.
                </Alert>
            </Box>
        );
    }

    const overallStats = getAttendanceStats();
    const subjectStats = getSubjectAttendanceStats();

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <IconButton onClick={() => navigate('/Teacher/students')} sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <AttendanceIcon color="primary" sx={{ fontSize: '2rem' }} />
                        Manage Attendance
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Record and manage attendance for {student.name}
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<HistoryIcon />}
                    onClick={() => setHistoryDialog(true)}
                >
                    View Attendance History
                </Button>
            </Box>

            <Grid container spacing={3}>
                {/* Student Info & Stats */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ mb: 3 }}>
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
                                <Typography variant="h3" color={overallStats.rate >= 75 ? 'success.main' : overallStats.rate >= 50 ? 'warning.main' : 'error.main'} gutterBottom>
                                    {overallStats.rate}%
                                </Typography>
                                <Chip 
                                    label={`Overall Attendance`}
                                    color={overallStats.rate >= 75 ? 'success' : overallStats.rate >= 50 ? 'warning' : 'error'}
                                    size="large"
                                />
                            </Box>

                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={4}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h6" color="text.primary">
                                            {overallStats.total}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Total Days
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={4}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h6" color="success.main">
                                            {overallStats.present}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Present
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={4}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h6" color="error.main">
                                            {overallStats.absent}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Absent
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Subject-wise Stats */}
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Subject-wise Attendance
                            </Typography>
                            {subjectStats.length > 0 ? (
                                subjectStats.map(({ subject, total, present, rate }) => (
                                    <Box key={subject} sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                            <Typography variant="body2" fontWeight="600">
                                                {subjects.find(s => s._id === subject)?.subName || subject}
                                            </Typography>
                                            <Chip 
                                                label={`${rate}%`}
                                                color={rate >= 75 ? 'success' : rate >= 50 ? 'warning' : 'error'}
                                                size="small"
                                            />
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                            {present}/{total} days present
                                        </Typography>
                                    </Box>
                                ))
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    No attendance records yet
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Record Attendance Form */}
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CalendarIcon />
                                Record Attendance
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

                            <form onSubmit={handleSubmitAttendance}>
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
                                        <TextField
                                            fullWidth
                                            label="Date"
                                            type="date"
                                            value={attendanceDate}
                                            onChange={(e) => setAttendanceDate(e.target.value)}
                                            InputLabelProps={{ shrink: true }}
                                            required
                                            inputProps={{
                                                max: new Date().toISOString().split('T')[0]
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Typography variant="body1" gutterBottom>
                                            Attendance Status
                                        </Typography>
                                        <RadioGroup
                                            row
                                            value={attendanceStatus}
                                            onChange={(e) => setAttendanceStatus(e.target.value)}
                                        >
                                            <FormControlLabel 
                                                value="Present" 
                                                control={<Radio color="success" />} 
                                                label={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <PresentIcon color="success" />
                                                        Present
                                                    </Box>
                                                }
                                            />
                                            <FormControlLabel 
                                                value="Absent" 
                                                control={<Radio color="error" />} 
                                                label={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <AbsentIcon color="error" />
                                                        Absent
                                                    </Box>
                                                }
                                            />
                                        </RadioGroup>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                            <Button
                                                variant="outlined"
                                                onClick={() => {
                                                    setSelectedSubject('');
                                                    setAttendanceStatus('Present');
                                                    setAttendanceDate(new Date().toISOString().split('T')[0]);
                                                }}
                                            >
                                                Reset
                                            </Button>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                startIcon={<SaveIcon />}
                                                disabled={saving || !selectedSubject || !attendanceDate}
                                            >
                                                {saving ? 'Recording...' : 'Record Attendance'}
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Recent Attendance */}
                    <Card sx={{ mt: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Recent Attendance (Last 10 records)
                            </Typography>
                            {attendanceHistory.length > 0 ? (
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Date</TableCell>
                                                <TableCell>Subject</TableCell>
                                                <TableCell>Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {attendanceHistory
                                                .sort((a, b) => new Date(b.date) - new Date(a.date))
                                                .slice(0, 10)
                                                .map((attendance) => (
                                                <TableRow key={`${attendance.subName}-${attendance.date}`}>
                                                    <TableCell>{formatDate(attendance.date)}</TableCell>
                                                    <TableCell>
                                                        {subjects.find(s => s._id === attendance.subName)?.subCode || 'Unknown'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            icon={attendance.status === 'Present' ? <PresentIcon /> : <AbsentIcon />}
                                                            label={attendance.status}
                                                            color={attendance.status === 'Present' ? 'success' : 'error'}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    No attendance records yet
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Attendance History Dialog */}
            <Dialog open={historyDialog} onClose={() => setHistoryDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    Complete Attendance History - {student.name}
                </DialogTitle>
                <DialogContent>
                    {attendanceHistory.length > 0 ? (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Subject</TableCell>
                                        <TableCell>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {attendanceHistory
                                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                                        .map((attendance, index) => (
                                        <TableRow key={`${attendance.subName}-${attendance.date}-${index}`}>
                                            <TableCell>{formatDate(attendance.date)}</TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={subjects.find(s => s._id === attendance.subName)?.subName || 'Unknown Subject'}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    icon={attendance.status === 'Present' ? <PresentIcon /> : <AbsentIcon />}
                                                    label={attendance.status}
                                                    color={attendance.status === 'Present' ? 'success' : 'error'}
                                                    size="small"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <AttendanceIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">
                                No attendance records yet
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Start recording attendance to see the history here
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

export default TeacherAttendanceStudent;