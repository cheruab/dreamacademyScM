import React, { useEffect, useState } from 'react'
import { Container, Grid, Paper, Typography, Box, Divider } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux';
import { calculateOverallAttendancePercentage } from '../../components/attendanceCalculator';
import CustomPieChart from '../../components/CustomPieChart';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import styled from 'styled-components';
import SeeNotice from '../../components/SeeNotice';
import CountUp from 'react-countup';
import Subject from "../../assets/subjects.svg";
import Assignment from "../../assets/assignment.svg";
import { getSubjectList } from '../../redux/sclassRelated/sclassHandle';

// Import the components to display
import StudentSubjects from './StudentSubjects';
import ViewStdAttendance from './ViewStdAttendance';
import StudentComplain from './StudentComplain';

const StudentHomePage = () => {
    const dispatch = useDispatch();

    const { userDetails, currentUser, loading, response } = useSelector((state) => state.user);
    const { subjectsList } = useSelector((state) => state.sclass);

    const [subjectAttendance, setSubjectAttendance] = useState([]);

    const classID = currentUser.sclassName._id

    useEffect(() => {
        dispatch(getUserDetails(currentUser._id, "Student"));
        dispatch(getSubjectList(classID, "ClassSubjects"));
    }, [dispatch, currentUser._id, classID]);

    const numberOfSubjects = subjectsList && subjectsList.length;

    useEffect(() => {
        if (userDetails) {
            setSubjectAttendance(userDetails.attendance || []);
        }
    }, [userDetails])

    const overallAttendancePercentage = calculateOverallAttendancePercentage(subjectAttendance);
    const overallAbsentPercentage = 100 - overallAttendancePercentage;

    const chartData = [
        { name: 'Present', value: overallAttendancePercentage },
        { name: 'Absent', value: overallAbsentPercentage }
    ];

    return (
        <>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                {/* Welcome Section with Statistics */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12}>
                        <Typography variant="h3" align="center" gutterBottom sx={{ 
                            mb: 3,
                            fontWeight: 'bold',
                            color: '#2c3e50'
                        }}>
                            Welcome Back, {currentUser.name}!
                        </Typography>
                    </Grid>
                    
                    </Grid>


                {/* 1. Student Subjects Section */}
                <Box sx={{ mb: 6 }}>
                   
                    <StudentSubjects />
                </Box>

                <Divider sx={{ mb: 4 }} />

                {/* 2. Student Attendance Section */}
                <Box sx={{ mb: 6 }}>
                    <Typography variant="h4" gutterBottom sx={{ 
                        mb: 3,
                        color: '#34495e',
                        borderBottom: '2px solid #e74c3c',
                        paddingBottom: 1
                    }}>
                        Your Attendance Record
                    </Typography>
                    <ViewStdAttendance />
                </Box>

                <Divider sx={{ mb: 4 }} />

                {/* 3. Student Complain Section */}
                <Box sx={{ mb: 6 }}>
                    <Typography variant="h4" gutterBottom sx={{ 
                        mb: 3,
                        color: '#34495e',
                        borderBottom: '2px solid #f39c12',
                        paddingBottom: 1
                    }}>
                        Submit a Complaint
                    </Typography>
                    <StudentComplain />
                </Box>

                <Divider sx={{ mb: 4 }} />

                {/* Notices Section at the bottom */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h5" gutterBottom sx={{ 
                            mb: 2,
                            color: '#34495e',
                            textAlign: 'center'
                        }}>
                            Important Notices
                        </Typography>
                        <SeeNotice />
                    </Paper>
                </Grid>
            </Container>
        </>
    )
}

const ChartContainer = styled.div`
  padding: 2px;
  display: flex;
  flex-direction: column;
  height: 240px;
  justify-content: center;
  align-items: center;
  text-align: center;
`;

const StyledPaper = styled(Paper)`
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 200px;
  justify-content: space-between;
  align-items: center;
  text-align: center;
`;

const Title = styled.p`
  font-size: 1.25rem;
`;

const Data = styled(CountUp)`
  font-size: calc(1.3rem + .6vw);
  color: green;
`;

export default StudentHomePage