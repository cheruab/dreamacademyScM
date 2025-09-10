import React from 'react';
import { Container, Box, Typography, Paper, Divider } from '@mui/material';
import { useSelector } from 'react-redux';
import TeacherStudentsList from './TeacherStudentsList';
import ExamsPage from './ExamsPage';
import ManageAttendancePage from './ManageAttendancePage';
import ManageGradesPage from './ManageGradesPage';

const TeacherHomePage = () => {
    const { currentUser } = useSelector((state) => state.user);

    return (
        <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
            {/* Welcome Header */}
            <Paper elevation={2} sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Welcome back, {currentUser?.name || 'Teacher'}!
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Manage your classes, students, and academic activities all in one place
                </Typography>
            </Paper>

            {/* Students List Section */}
            <Box sx={{ mb: 6 }}>
                
                <TeacherStudentsList />
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Exams Section */}
            <Box sx={{ mb: 6 }}>
                
                <ExamsPage />
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Attendance Management Section */}
            <Box sx={{ mb: 6 }}>
                
                <ManageAttendancePage />
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Grades Management Section */}
            <Box sx={{ mb: 6 }}>
                
                <ManageGradesPage />
            </Box>
        </Container>
    );
};

export default TeacherHomePage;