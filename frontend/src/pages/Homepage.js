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
              Don’t have an account?{" "}
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
  background: rgba(255, 255, 255, 0.9);
  border-radius: 24px;
  padding: 3rem 2.5rem 2.5rem 2.5rem;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(12px);
  animation: fadeUp 0.6s ease-out;

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(25px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const Logo = styled.img`
  width: 160px;
  height: auto;
  margin-bottom:0.8rem;

  @media (max-width: 1024px) {
    width: 100px;
  }
`;

const Content = styled.div``;

const Title = styled.h1`
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #2d2d2d;

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const Highlight = styled.span`
  color: #7f56da;
`;

const Text = styled.p`
  font-size: ${(props) => (props.small ? "0.9rem" : "1rem")};
  line-height: 1.6;
  margin: ${(props) => (props.small ? "0" : "1.5rem 0")};
  color: #444;
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
