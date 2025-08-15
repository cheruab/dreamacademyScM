import { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const ViewStdAttendances = ({ childData }) => {
    const [attendance, setAttendance] = useState([]);

    useEffect(() => {
        if (childData && childData.attendance) {
            setAttendance(childData.attendance);
        }
    }, [childData]);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                {childData?.name}'s Attendance
            </Typography>

            {attendance.length === 0 ? (
                <Typography>No attendance records found.</Typography>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Subject</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {attendance.map((record) => (
                                <TableRow key={record._id || record.date}>
                                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{record.subName?.subName || 'N/A'}</TableCell>
                                    <TableCell>{record.status}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default ViewStdAttendances;
