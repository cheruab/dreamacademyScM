import { useState, useEffect } from 'react';
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
    LinearProgress
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const ViewStdAttendances = ({ childData }) => {
    const [attendance, setAttendance] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        present: 0,
        absent: 0,
        percentage: 0
    });

    useEffect(() => {
        if (childData && childData.attendance) {
            const attendanceData = childData.attendance;
            setAttendance(attendanceData);

            // Calculate stats
            const total = attendanceData.length;
            const present = attendanceData.filter(record => record.status === 'Present').length;
            const absent = total - present;
            const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

            setStats({ total, present, absent, percentage });
        }
    }, [childData]);

    const getStatusColor = (status) => {
        return status === 'Present' ? 'success' : 'error';
    };

    const getStatusIcon = (status) => {
        return status === 'Present' ? 
            <CheckCircleIcon sx={{ fontSize: 16 }} /> : 
            <CancelIcon sx={{ fontSize: 16 }} />;
    };

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <EventIcon sx={{ fontSize: 30, color: '#4caf50', mr: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                    📊 {childData?.name}'s Attendance Record
                </Typography>
            </Box>

            {/* Attendance Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={3}>
                    <Card sx={{ textAlign: 'center', bgcolor: '#e8f5e8' }}>
                        <CardContent sx={{ py: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                                {stats.total}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Sessions
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <Card sx={{ textAlign: 'center', bgcolor: '#e8f5e8' }}>
                        <CardContent sx={{ py: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                                {stats.present}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Present
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <Card sx={{ textAlign: 'center', bgcolor: '#ffebee' }}>
                        <CardContent sx={{ py: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                                {stats.absent}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Absent
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <Card sx={{ textAlign: 'center', bgcolor: '#e3f2fd' }}>
                        <CardContent sx={{ py: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                                {stats.percentage}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
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
                    {stats.percentage >= 75 ? 'Excellent attendance! 🌟' : 
                     stats.percentage >= 60 ? 'Good attendance, keep it up! 👍' : 
                     'Attendance needs improvement 📈'}
                </Typography>
            </Card>

            {/* Attendance Table */}
            {attendance.length === 0 ? (
                <Card sx={{ textAlign: 'center', py: 4 }}>
                    <CardContent>
                        <EventIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                            No attendance records found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Attendance records will appear here once marked by teachers
                        </Typography>
                    </CardContent>
                </Card>
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
                                {attendance.map((record, index) => (
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
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {record.subName?.subName || 
                                                 record.subName?.name || 
                                                 'Unknown Subject'}
                                            </Typography>
                                            {record.subName?.subCode && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {record.subName.subCode}
                                                </Typography>
                                            )}
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

export default ViewStdAttendances;