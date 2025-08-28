import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Paper,
  Box,
  Container,
  CircularProgress,
  Backdrop,
} from '@mui/material';
import { AccountCircle, School, Group, FamilyRestroom } from '@mui/icons-material';
import styled, { keyframes } from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/userRelated/userHandle';
import Popup from '../components/Popup';

const ChooseUser = ({ visitor }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const password = "zxc"

  const { status, currentUser, currentRole } = useSelector(state => state.user);;

  const [loader, setLoader] = useState(false)
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  const navigateHandler = (user) => {
    if (user === "Admin") {
      if (visitor === "guest") {
        const email = "yogendra@12"
        const fields = { email, password }
        setLoader(true)
        dispatch(loginUser(fields, user))
      }
      else {
        navigate('/Adminlogin');
      }
    }

    else if (user === "Student") {
      if (visitor === "guest") {
        const rollNum = "1"
        const studentName = "Dipesh Awasthi"
        const fields = { rollNum, studentName, password }
        setLoader(true)
        dispatch(loginUser(fields, user))
      }
      else {
        navigate('/Studentlogin');
      }
    }

    else if (user === "Parent") {
      if (visitor === "guest") {
        const rollNum = "1"
        const studentName = "Dipesh Awasthi"
        const fields = { rollNum, studentName, password }
        setLoader(true)
        dispatch(loginUser(fields, user))
      }
      else {
        navigate('/Parentlogin');
      }
    }

    else if (user === "Teacher") {
      if (visitor === "guest") {
        const email = "tony@12"
        const fields = { email, password }
        setLoader(true)
        dispatch(loginUser(fields, user))
      }
      else {
        navigate('/Teacherlogin');
      }
    }
  }

  useEffect(() => {
    if (status === 'success' || currentUser !== null) {
      if (currentRole === 'Admin') {
        navigate('/Admin/dashboard');
      }
      else if (currentRole === 'Student') {
        navigate('/Student/dashboard')
       } else if (currentRole === 'Parent') {
        navigate('/Parent/dashboard');
      } else if (currentRole === 'Teacher') {
        navigate('/Teacher/dashboard');
      }
    }
    else if (status === 'error') {
      setLoader(false)
      setMessage("Network Error")
      setShowPopup(true)
    }
  }, [status, currentRole, navigate, currentUser]);

  return (
    <StyledContainer>
      <BackgroundElements>
        <FloatingShape className="shape-1" />
        <FloatingShape className="shape-2" />
        <FloatingShape className="shape-3" />
      </BackgroundElements>
      
      <ContentWrapper>
        <HeaderSection>
          <WelcomeTitle>Choose Your Role</WelcomeTitle>
          <WelcomeSubtitle>Select how you'd like to access the platform</WelcomeSubtitle>
        </HeaderSection>

        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={6} lg={3}>
              <UserCard onClick={() => navigateHandler("Admin")} className="admin">
                <IconWrapper className="admin-icon">
                  <AccountCircle sx={{ fontSize: 50 }} />
                </IconWrapper>
                <CardContent>
                  <UserTitle>Administrator</UserTitle>
                  <UserDescription>
                    Access the dashboard to manage app data and system settings
                  </UserDescription>
                </CardContent>
                <CardGlow className="admin-glow" />
              </UserCard>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <UserCard onClick={() => navigateHandler("Student")} className="student">
                <IconWrapper className="student-icon">
                  <School sx={{ fontSize: 50 }} />
                </IconWrapper>
                <CardContent>
                  <UserTitle>Student</UserTitle>
                  <UserDescription>
                    Explore course materials, assignments and track your progress
                  </UserDescription>
                </CardContent>
                <CardGlow className="student-glow" />
              </UserCard>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <UserCard onClick={() => navigateHandler("Parent")} className="parent">
                <IconWrapper className="parent-icon">
                  <FamilyRestroom sx={{ fontSize: 50 }} />
                </IconWrapper>
                <CardContent>
                  <UserTitle>ወላጅ</UserTitle>
                  <UserDescription>
                    
                    የልጅዎን የትምህርት ሁኔታ እና ውጤት ይክታተሉ
                  </UserDescription>
                </CardContent>
                <CardGlow className="parent-glow" />
              </UserCard>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <UserCard onClick={() => navigateHandler("Teacher")} className="teacher">
                <IconWrapper className="teacher-icon">
                  <Group sx={{ fontSize: 50 }} />
                </IconWrapper>
                <CardContent>
                  <UserTitle>Teacher</UserTitle>
                  <UserDescription>
                    Create courses, manage assignments and track student performance
                  </UserDescription>
                </CardContent>
                <CardGlow className="teacher-glow" />
              </UserCard>
            </Grid>
          </Grid>
        </Container>
      </ContentWrapper>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loader}
      >
        <LoaderContent>
          <CircularProgress color="inherit" size={60} />
          <LoaderText>Please Wait...</LoaderText>
        </LoaderContent>
      </Backdrop>
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </StyledContainer>
  );
};

export default ChooseUser;

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-20px) rotate(120deg); }
  66% { transform: translateY(-10px) rotate(240deg); }
`;

const glow = keyframes`
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Styled Components
const StyledContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, 
    #667eea 0%, 
    #764ba2 25%, 
    #f093fb 50%, 
    #f5576c 75%, 
    #4facfe 100%
  );
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

const BackgroundElements = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const FloatingShape = styled.div`
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: ${float} 6s ease-in-out infinite;
  
  &.shape-1 {
    width: 100px;
    height: 100px;
    top: 10%;
    left: 10%;
    animation-delay: 0s;
  }
  
  &.shape-2 {
    width: 150px;
    height: 150px;
    top: 60%;
    right: 10%;
    animation-delay: 2s;
  }
  
  &.shape-3 {
    width: 80px;
    height: 80px;
    bottom: 20%;
    left: 20%;
    animation-delay: 4s;
  }
`;

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2rem 0;
  position: relative;
  z-index: 1;
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  animation: ${slideUp} 0.8s ease-out;
`;

const WelcomeTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  background: linear-gradient(45deg, #fff, #f0f0f0, #fff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
  text-shadow: 0 4px 20px rgba(255, 255, 255, 0.3);
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 300;
  max-width: 600px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    padding: 0 1rem;
  }
`;

const UserCard = styled(Paper)`
  position: relative;
  padding: 2.5rem 1.5rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.95) !important;
  border-radius: 24px !important;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: ${slideUp} 0.8s ease-out;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  
  &:hover {
    transform: translateY(-12px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  }
  
  &.admin:hover .admin-glow {
    opacity: 1;
  }
  
  &.student:hover .student-glow {
    opacity: 1;
  }
  
  &.parent:hover .parent-glow {
    opacity: 1;
  }
  
  &.teacher:hover .teacher-glow {
    opacity: 1;
  }
  
  @media (max-width: 768px) {
    padding: 2rem 1rem;
    min-height: 240px;
  }
`;

const CardGlow = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 24px;
  pointer-events: none;
  
  &.admin-glow {
    background: linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(255, 142, 83, 0.2));
  }
  
  &.student-glow {
    background: linear-gradient(135deg, rgba(74, 144, 226, 0.2), rgba(80, 227, 194, 0.2));
  }
  
  &.parent-glow {
    background: linear-gradient(135deg, rgba(245, 101, 101, 0.2), rgba(254, 178, 178, 0.2));
  }
  
  &.teacher-glow {
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2));
  }
`;

const IconWrapper = styled.div`
  margin-bottom: 1.5rem;
  display: inline-flex;
  padding: 1rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  
  &.admin-icon {
    background: linear-gradient(135deg, #ff6b6b, #ff8e53);
    color: white;
  }
  
  &.student-icon {
    background: linear-gradient(135deg, #4a90e2, #50e3c2);
    color: white;
  }
  
  &.parent-icon {
    background: linear-gradient(135deg, #f56565, #feb2b2);
    color: white;
  }
  
  &.teacher-icon {
    background: linear-gradient(135deg, #a855f7, #ec4899);
    color: white;
  }
`;

const CardContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const UserTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const UserDescription = styled.p`
  font-size: 0.95rem;
  color: #718096;
  line-height: 1.6;
  font-weight: 400;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const LoaderContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const LoaderText = styled.div`
  font-size: 1.1rem;
  font-weight: 500;
`;