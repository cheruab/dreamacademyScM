import React, { useEffect, useState } from 'react';
import { 
    Box, 
    Typography, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper,
    Chip,
    Card,
    CardContent,
    Grid,
    LinearProgress,
    CircularProgress,
    Alert
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useSelector } from 'react-redux';
import axios from 'axios';

const REACT_APP_BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

const ViewStdAttendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        present: 0,
        absent: 0,
        percentage: 0
    });

    const { currentUser } = useSelector((state) => state.user);

    useEffect(() => {
        const fetchStudentData = async () => {
            if (!currentUser?._id) {
                setError('No student ID found');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError('');
                
                console.log('Fetching student data for ID:', currentUser._id);
                
                // Direct API call exactly like parent side does with getMyChild
                // Try the Student endpoint first (maps to getStudentById which has attendance population)
                const response = await axios.get(`${REACT_APP_BASE_URL}/Student/${currentUser._id}`);
                const studentData = response.data;
                
                console.log('Full response:', response);
                console.log('Response status:', response.status);
                
                console.log('Student data received:', studentData);
                console.log('Attendance data:', studentData.attendance);

                if (studentData && studentData.attendance) {
                    const attendanceData = studentData.attendance;
                    setAttendance(attendanceData);

                    // Calculate stats exactly like parent side
                    const total = attendanceData.length;
                    const present = attendanceData.filter(record => record.status === 'Present').length;
                    const absent = total - present;
                    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

                    setStats({ total, present, absent, percentage });
                    console.log('Stats calculated:', { total, present, absent, percentage });
                } else {
                    console.log('No attendance data found in response');
                    setAttendance([]);
                    setStats({ total: 0, present: 0, absent: 0, percentage: 0 });
                }
            } catch (err) {
                console.error('Error fetching student data:', err);
                setError('Failed to load attendance data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchStudentData();
    }, [currentUser?._id]);

    const getStatusColor = (status) => {
        return status === 'Present' ? 'success' : 'error';
    };

    const getStatusIcon = (status) => {
        return status === 'Present' ? 
            <CheckCircleIcon sx={{ fontSize: 16 }} /> : 
            <CancelIcon sx={{ fontSize: 16 }} />;
    };

    // Show loading state
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading attendance data...</Typography>
            </Box>
        );
    }

    // Show error state
    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">
                    {error}
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, pb: 4 }}>
            <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4 }}>
                My Attendance
            </Typography>

            {/* Attendance Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={2}>
                        <CardContent sx={{ textAlign: 'center', py: 3 }}>
                            <EventIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
                            <Typography variant="h4" color="primary.main">
                                {stats.total}
                            </Typography>
                            <Typography color="textSecondary">
                                Total Classes
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={2}>
                        <CardContent sx={{ textAlign: 'center', py: 3 }}>
                            <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 2 }} />
                            <Typography variant="h4" color="success.main">
                                {stats.present}
                            </Typography>
                            <Typography color="textSecondary">
                                Present
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={2}>
                        <CardContent sx={{ textAlign: 'center', py: 3 }}>
                            <CancelIcon color="error" sx={{ fontSize: 40, mb: 2 }} />
                            <Typography variant="h4" color="error.main">
                                {stats.absent}
                            </Typography>
                            <Typography color="textSecondary">
                                Absent
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={2}>
                        <CardContent sx={{ textAlign: 'center', py: 3 }}>
                            <Typography variant="h4" 
                                color={stats.percentage >= 75 ? 'success.main' : stats.percentage >= 60 ? 'warning.main' : 'error.main'}>
                                {stats.percentage}%
                            </Typography>
                            <Typography color="textSecondary">
                                Attendance Rate
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Attendance Progress Bar */}
            <Card sx={{ mb: 3, p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Overall Attendance Progress
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: '100%' }}>
                        <LinearProgress 
                            variant="determinate" 
                            value={stats.percentage} 
                            sx={{ 
                                height: 10, 
                                borderRadius: 5,
                                bgcolor: '#ffcdd2',
                                '& .MuiLinearProgress-bar': {
                                    bgcolor: stats.percentage >= 75 ? '#4caf50' : stats.percentage >= 60 ? '#ff9800' : '#f44336'
                                }
                            }}
                        />
                    </Box>
                    <Typography variant="body2" sx={{ minWidth: 50 }}>
                        {stats.percentage}%
                    </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {stats.percentage >= 75 ? 'Excellent attendance!' : 
                     stats.percentage >= 60 ? 'Good attendance, keep it up!' : 
                     'Attendance needs improvement'}
                </Typography>
            </Card>

            {/* Attendance Status Alerts */}
            {stats.percentage < 75 && stats.total > 0 && (
                <Alert 
                    severity={stats.percentage < 50 ? 'error' : 'warning'} 
                    sx={{ mb: 3 }}
                >
                    <Typography variant="body1" fontWeight="bold">
                        {stats.percentage < 50 ? 'Critical Attendance Alert!' : 'Attendance Warning!'}
                    </Typography>
                    <Typography variant="body2">
                        Your attendance is {stats.percentage}%. 
                        {stats.percentage < 50 ? 
                            ' This is critically low and may affect your academic standing.' : 
                            ' Try to maintain at least 75% attendance for good academic standing.'
                        }
                    </Typography>
                </Alert>
            )}

            {stats.percentage >= 90 && stats.total > 0 && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    <Typography variant="body1" fontWeight="bold">
                        Excellent Attendance!
                    </Typography>
                    <Typography variant="body2">
                        Your attendance is {stats.percentage}%. Keep up the great work!
                    </Typography>
                </Alert>
            )}

            {/* Attendance Table */}
            {attendance.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <EventIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 3 }} />
                    <Typography variant="h5" color="text.secondary" gutterBottom>
                        No Attendance Records Found
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
                        Your attendance records will appear here once your teachers start recording attendance.
                        Check back later or contact your teacher if you believe this is an error.
                    </Typography>
                </Box>
            ) : (
                <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <TableContainer sx={{ maxHeight: 400 }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                                        Date
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                                        Subject
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', textAlign: 'center' }}>
                                        Status
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {attendance
                                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                                    .map((record, index) => (
                                    <TableRow 
                                        key={record._id || index}
                                        sx={{ 
                                            '&:hover': { backgroundColor: '#f9f9f9' },
                                            '&:nth-of-type(odd)': { backgroundColor: '#fafafa' }
                                        }}
                                    >
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <EventIcon sx={{ mr: 1, color: 'grey.600', fontSize: 18 }} />
                                                {new Date(record.date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {record.subName?.subName || 'Unknown Subject'}
                                                </Typography>
                                                {record.subName?.subCode && (
                                                    <Typography variant="caption" color="textSecondary">
                                                        Code: {record.subName.subCode}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: 'center' }}>
                                            <Chip
                                                icon={getStatusIcon(record.status)}
                                                label={record.status}
                                                color={getStatusColor(record.status)}
                                                variant="outlined"
                                                size="small"
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}
        </Box>
    );
};

export default ViewStdAttendance;