import { Container, Grid, Paper, Typography, Box } from '@mui/material';
import SeeNotice from '../../components/SeeNotice';
import styled from 'styled-components';
import CountUp from 'react-countup';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getAllSclasses } from '../../redux/sclassRelated/sclassHandle';
import { getAllStudents } from '../../redux/studentRelated/studentHandle';
import { getAllTeachers } from '../../redux/teacherRelated/teacherHandle';
import { School, Class, Groups, Announcement } from '@mui/icons-material';

const AdminHomePage = () => {
    const dispatch = useDispatch();
    const { studentsList } = useSelector((state) => state.student);
    const { sclassesList } = useSelector((state) => state.sclass);
    const { teachersList } = useSelector((state) => state.teacher);
    const { currentUser } = useSelector(state => state.user);

    const adminID = currentUser._id;

    useEffect(() => {
        dispatch(getAllStudents(adminID));
        dispatch(getAllSclasses(adminID, "Sclass"));
        dispatch(getAllTeachers(adminID));
    }, [adminID, dispatch]);

    const numberOfStudents = studentsList?.length || 0;
    const numberOfClasses = sclassesList?.length || 0;
    const numberOfTeachers = teachersList?.length || 0;

    return (
        <Box sx={{ 
            background: 'linear-gradient(135deg, #047e59ff 0%, #2e9713ff 100%)',
            minHeight: '100vh',
            py: 4
        }}>
            <Container maxWidth="xl">
                {/* Welcome Banner */}
                <Box sx={{ mb: 4, textAlign: "center" }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Welcome back, {currentUser?.name || "Admin"} 👋
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Here's a quick overview of your school's activity today
                    </Typography>
                </Box>

                <Grid container spacing={4} justifyContent="center">
                    {/* Students */}
                    <Grid item xs={12} sm={6} md={3}>
                        <StyledPaper color="#7869a1ff">
                            <StyledIcon>
                                <Groups fontSize="large" />
                            </StyledIcon>
                            <Title>Total Students</Title>
                            <Data start={0} end={numberOfStudents} duration={2.5} />
                        </StyledPaper>
                    </Grid>

                    {/* Classes */}
                    <Grid item xs={12} sm={6} md={3}>
                        <StyledPaper color="#64b5f6">
                            <StyledIcon>
                                <Class fontSize="large" />
                            </StyledIcon>
                            <Title>Total Classes</Title>
                            <Data start={0} end={numberOfClasses} duration={2.5} />
                        </StyledPaper>
                    </Grid>

                    {/* Teachers */}
                    <Grid item xs={12} sm={6} md={3}>
                        <StyledPaper color="#ffb74d">
                            <StyledIcon>
                                <School fontSize="large" />
                            </StyledIcon>
                            <Title>Total Teachers</Title>
                            <Data start={0} end={numberOfTeachers} duration={2.5} />
                        </StyledPaper>
                    </Grid>

                    {/* Notices */}
                    <Grid item xs={12}>
                        <Paper sx={{ 
                            p: 3, 
                            borderRadius: 3, 
                            boxShadow: 4,
                            background: 'rgba(243, 201, 201, 0.9)',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <Typography variant="h6" fontWeight="bold" mb={2}>
                                <Announcement sx={{ verticalAlign: 'middle', mr: 1 }} /> Latest Notices
                            </Typography>
                            <SeeNotice />
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

// Styled Components
const StyledPaper = styled(Paper)`
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 180px;
  border-radius: 20px !important;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background-color: '#349ccce7'};
  color: #333;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  }
`;

const StyledIcon = styled.div`
  font-size: 50px;
  margin-bottom: 12px;
  color: inherit;
`;

const Title = styled.p`
  font-size: 1.2rem;
  font-weight: 600;
  margin: 6px 0;
  font-family: 'Roboto', sans-serif;
`;

const Data = styled(CountUp)`
  font-size: 2rem;
  font-weight: bold;
  color: inherit;
`;

export default AdminHomePage;