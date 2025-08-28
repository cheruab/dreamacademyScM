import { Container, Grid, Paper, Typography, Box } from '@mui/material';
import SeeNotice from '../../components/SeeNotice';
import Students from "../../assets/img1.png";
import Classes from "../../assets/img2.png";
import Teachers from "../../assets/img3.png";
import Fees from "../../assets/img4.png";
import styled from 'styled-components';
import CountUp from 'react-countup';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getAllSclasses } from '../../redux/sclassRelated/sclassHandle';
import { getAllStudents } from '../../redux/studentRelated/studentHandle';
import { getAllTeachers } from '../../redux/teacherRelated/teacherHandle';

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
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {/* Welcome Banner */}
            <Box sx={{ mb: 4, textAlign: "center" }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Welcome back, {currentUser?.name || "Admin"} 👋
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Here’s a quick overview of your school’s activity today
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* Students */}
                <Grid item xs={12} sm={6} md={3}>
                    <StyledPaper>
                        <IconImg src={Students} alt="Students" />
                        <Title>Total Students</Title>
                        <Data start={0} end={numberOfStudents} duration={2.5} />
                    </StyledPaper>
                </Grid>

                {/* Classes */}
                <Grid item xs={12} sm={6} md={3}>
                    <StyledPaper>
                        <IconImg src={Classes} alt="Classes" />
                        <Title>Total Classes</Title>
                        <Data start={0} end={numberOfClasses} duration={2.5} />
                    </StyledPaper>
                </Grid>

                {/* Teachers */}
                <Grid item xs={12} sm={6} md={3}>
                    <StyledPaper>
                        <IconImg src={Teachers} alt="Teachers" />
                        <Title>Total Teachers</Title>
                        <Data start={0} end={numberOfTeachers} duration={2.5} />
                    </StyledPaper>
                </Grid>

                {/* Fees */}
                <Grid item xs={12} sm={6} md={3}>
                    <StyledPaper>
                        <IconImg src={Fees} alt="Fees" />
                        <Title>Fees Collection</Title>
                        <Data start={0} end={23000} duration={3} prefix="$" />
                    </StyledPaper>
                </Grid>

                {/* Notices */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 4 }}>
                        <Typography variant="h6" fontWeight="bold" mb={2}>
                            📢 Latest Notices
                        </Typography>
                        <SeeNotice />
                    </Paper>
                </Grid>
            </Grid>
        </Container>
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
  height: 220px;
  border-radius: 20px !important;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.2);
  }
`;

const IconImg = styled.img`
  width: 60px;
  margin-bottom: 12px;
`;

const Title = styled.p`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 6px 0;
`;

const Data = styled(CountUp)`
  font-size: calc(1.5rem + .8vw);
  font-weight: bold;
  color: #2e7d32;
`;

export default AdminHomePage;
