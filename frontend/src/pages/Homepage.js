import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import styled from 'styled-components';
import logo1 from "../assets/logoo.png";
import { LightPurpleButton } from '../components/buttonStyles';

const Homepage = () => {
  return (
    <Background>
      <Card>
        <Logo src={logo1} alt="Dream Academy Logo" />
        <Content>
          <Title>
            Welcome to <Highlight>Dream Academy</Highlight>
          </Title>
          <Text>
            Manage classes, track attendance, assess performance, and communicate seamlessly — 
            all in one elegant platform.
          </Text>
          <ButtonGroup>
            <StyledLink to="/choose">
              <LightPurpleButton variant="contained" fullWidth>
                Login
              </LightPurpleButton>
            </StyledLink>
            <StyledLink to="/chooseasguest">
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  mt: 2,
                  mb: 2,
                  color: "#7f56da",
                  borderColor: "#7f56da",
                  fontWeight: "600",
                }}
              >
                Login as Guest
              </Button>
            </StyledLink>
            <Text small>
              Don't have an account?{" "}
              <Link to="/Adminregister" style={{ color: "#7f56da", fontWeight: "600" }}>
                Sign up
              </Link>
            </Text>
          </ButtonGroup>
        </Content>
      </Card>
    </Background>
  );
};

export default Homepage;

/* --- Styled Components --- */

const Background = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  background: linear-gradient(-45deg, #7f56da, #4a90e2, #ff6ec7, #fdbb2d);
  background-size: 400% 400%;
  animation: gradientBG 12s ease infinite;

  @keyframes gradientBG {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  border: 4px solid rgba(127, 86, 218, 0.3);
  padding: 3rem 2.5rem 2.5rem 2.5rem;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 
    0 20px 50px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(127, 86, 218, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(16px);
  animation: fadeUp 0.6s ease-out;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #e5dcf7ff, #d9dcdfff, #d1b5c7ff, #beb5d1ff);
    border-radius: 26px;
    z-index: -1;
    background-size: 200% 200%;
    animation: gradientBorder 3s ease infinite;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(25px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes gradientBorder {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

const Logo = styled.img`
  width: 180px;
  height: auto;
  margin-bottom: 1rem;
  filter: drop-shadow(0 4px 8px rgba(127, 86, 218, 0.2));
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    filter: drop-shadow(0 6px 12px rgba(127, 86, 218, 0.3));
  }

  @media (max-width: 1024px) {
    width: 120px;
  }
`;

const Content = styled.div``;

const Title = styled.h1`
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #2d2d2d;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const Highlight = styled.span`
  color: #7f56da;
  background: linear-gradient(45deg, #7f56da, #4a90e2);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Text = styled.p`
  font-size: ${(props) => (props.small ? "0.9rem" : "1.05rem")};
  line-height: 1.6;
  margin: ${(props) => (props.small ? "0" : "1.5rem 0")};
  color: #4a4a4a;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
`;

const ButtonGroup = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledLink = styled(Link)`
  width: 100%;
  text-decoration: none;
`;