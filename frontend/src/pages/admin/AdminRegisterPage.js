import * as React from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
    Grid, 
    Box, 
    Typography, 
    Paper, 
    TextField, 
    CssBaseline, 
    IconButton, 
    InputAdornment, 
    CircularProgress,
    Alert,
    Stepper,
    Step,
    StepLabel
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { 
    Visibility, 
    VisibilityOff, 
    AdminPanelSettings, 
    Security,
    School
} from '@mui/icons-material';
import bgpic from "../../assets/logo1.svg";
import { LightPurpleButton } from '../../components/buttonStyles';
import { adminRegister, checkAdminExists } from '../../redux/userRelated/userHandle';
import styled from 'styled-components';
import Popup from '../../components/Popup';

const defaultTheme = createTheme();

const AdminRegisterPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { status, currentUser, response, error, currentRole } = useSelector(state => state.user);
    

    const [toggle, setToggle] = useState(false);
    const [loader, setLoader] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [adminExists, setAdminExists] = useState(null);
    const [checkingAdmin, setCheckingAdmin] = useState(true);

    // Form validation states
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [adminNameError, setAdminNameError] = useState(false);
    const [schoolNameError, setSchoolNameError] = useState(false);
    const [adminKeyError, setAdminKeyError] = useState(false);

    // Password strength state
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        feedback: "",
        color: "error"
    });

    const steps = ['Verify Access', 'Admin Details', 'School Information'];
    const [activeStep, setActiveStep] = useState(0);

    // Check if admin exists on component mount


useEffect(() => {
    dispatch(checkAdminExists());
}, [dispatch]);

useEffect(() => {
    if (response?.exists) {
        setAdminExists(true);
        setMessage("Admin account already exists. Only one admin is allowed per system.");
        setShowPopup(true);
    } else if (response?.exists === false) {
        setAdminExists(false);
    }
    setCheckingAdmin(false);
}, [response]);



    // Password strength checker
    const checkPasswordStrength = (password) => {
        let score = 0;
        let feedback = "";
        let color = "error";

        if (password.length >= 8) score++;
        if (password.match(/[a-z]/)) score++;
        if (password.match(/[A-Z]/)) score++;
        if (password.match(/[0-9]/)) score++;
        if (password.match(/[^a-zA-Z0-9]/)) score++;

        switch (score) {
            case 0:
            case 1:
                feedback = "Very Weak";
                color = "error";
                break;
            case 2:
                feedback = "Weak";
                color = "warning";
                break;
            case 3:
                feedback = "Fair";
                color = "info";
                break;
            case 4:
                feedback = "Good";
                color = "success";
                break;
            case 5:
                feedback = "Strong";
                color = "success";
                break;
            default:
                break;
        }

        return { score, feedback, color };
    };

    const handlePasswordChange = (e) => {
        const password = e.target.value;
        const strength = checkPasswordStrength(password);
        setPasswordStrength(strength);
        setPasswordError(false);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        
        const name = event.target.adminName?.value?.trim();
        const schoolName = event.target.schoolName?.value?.trim();
        const email = event.target.email?.value?.trim();
        const password = event.target.password?.value;
        const adminKey = event.target.adminKey?.value?.trim();

        // Reset errors
        setAdminNameError(false);
        setSchoolNameError(false);
        setEmailError(false);
        setPasswordError(false);
        setAdminKeyError(false);

        // Validation
        let hasErrors = false;

        if (!name) {
            setAdminNameError(true);
            hasErrors = true;
        }

        if (!schoolName) {
            setSchoolNameError(true);
            hasErrors = true;
        }

        if (!email) {
            setEmailError(true);
            hasErrors = true;
        } else {
            // Email format validation
            const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
            if (!emailRegex.test(email)) {
                setEmailError(true);
                setMessage("Please enter a valid email address");
                setShowPopup(true);
                hasErrors = true;
            }
        }

        if (!password) {
            setPasswordError(true);
            hasErrors = true;
        } else if (password.length < 8) {
            setPasswordError(true);
            setMessage("Password must be at least 8 characters long");
            setShowPopup(true);
            hasErrors = true;
        } else if (passwordStrength.score < 3) {
            setPasswordError(true);
            setMessage("Password is too weak. Please use a stronger password with uppercase, lowercase, numbers, and special characters.");
            setShowPopup(true);
            hasErrors = true;
        }

        if (!adminKey) {
            setAdminKeyError(true);
            setMessage("Admin registration key is required for security purposes");
            setShowPopup(true);
            hasErrors = true;
        }

        if (hasErrors) return;

        const fields = { name, email, password, schoolName, adminKey };
        setLoader(true);
        dispatch(adminRegister(fields));
    };

    const handleInputChange = (event) => {
        const { name } = event.target;
        if (name === 'email') setEmailError(false);
        if (name === 'password') setPasswordError(false);
        if (name === 'adminName') setAdminNameError(false);
        if (name === 'schoolName') setSchoolNameError(false);
        if (name === 'adminKey') setAdminKeyError(false);
    };

    useEffect(() => {
        if (status === 'success' || (currentUser !== null && currentRole === 'Admin')) {
            navigate('/Admin/dashboard');
        } else if (status === 'failed') {
            setMessage(response || 'Registration failed');
            setShowPopup(true);
            setLoader(false);
        } else if (status === 'error') {
            setMessage("Network Error. Please try again.");
            setShowPopup(true);
            setLoader(false);
        }
    }, [status, currentUser, currentRole, navigate, error, response]);

    // Show loading while checking admin existence
    if (checkingAdmin) {
        return (
            <ThemeProvider theme={defaultTheme}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                    <CircularProgress size={60} />
                    <Typography variant="h6" sx={{ ml: 2 }}>
                        Checking system status...
                    </Typography>
                </Box>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider theme={defaultTheme}>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                    <Box
                        sx={{
                            my: 6,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        {/* Header */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: 3,
                                p: 2,
                                borderRadius: 2,
                                bgcolor: adminExists ? '#ffebee' : '#f3e5f5',
                                border: `2px solid ${adminExists ? '#f44336' : '#7f56da'}`
                            }}
                        >
                            <AdminPanelSettings 
                                sx={{ 
                                    fontSize: 40, 
                                    color: adminExists ? '#f44336' : '#7f56da',
                                    mr: 1 
                                }} 
                            />
                            <Typography 
                                variant="h4" 
                                sx={{ 
                                    color: adminExists ? '#c62828' : "#2c2143",
                                    fontWeight: 'bold'
                                }}
                            >
                                Admin Registration
                            </Typography>
                        </Box>

                        {/* Admin Exists Warning */}
                        {adminExists && (
                            <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Registration Not Allowed
                                </Typography>
                                <Typography variant="body2">
                                    An admin account already exists in the system. Only one admin is allowed per system for security purposes.
                                </Typography>
                            </Alert>
                        )}

                        {!adminExists && (
                            <>
                                {/* Progress Stepper */}
                                <Box sx={{ width: '100%', mb: 4 }}>
                                    <Stepper activeStep={activeStep} alternativeLabel>
                                        {steps.map((label) => (
                                            <Step key={label}>
                                                <StepLabel>{label}</StepLabel>
                                            </Step>
                                        ))}
                                    </Stepper>
                                </Box>

                                <Alert severity="info" sx={{ width: '100%', mb: 3 }}>
                                    <Typography variant="body2">
                                        <Security sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                                        Creating the first admin account for your school management system.
                                        This is a secure one-time setup process.
                                    </Typography>
                                </Alert>

                                <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 2, width: '100%' }}>
                                    {/* Admin Registration Key */}
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="adminKey"
                                        label="Admin Registration Key"
                                        name="adminKey"
                                        type="password"
                                        autoComplete="off"
                                        error={adminKeyError}
                                        helperText={adminKeyError ? 'Registration key is required' : 'Enter the secure registration key provided by your system administrator'}
                                        onChange={handleInputChange}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Security color={adminKeyError ? "error" : "primary"} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                    {/* Admin Name */}
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="adminName"
                                        label="Admin Full Name"
                                        name="adminName"
                                        autoComplete="name"
                                        error={adminNameError}
                                        helperText={adminNameError && 'Full name is required'}
                                        onChange={handleInputChange}
                                    />

                                    {/* School Name */}
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="schoolName"
                                        label="School/Institution Name"
                                        name="schoolName"
                                        autoComplete="off"
                                        error={schoolNameError}
                                        helperText={schoolNameError && 'School name is required'}
                                        onChange={handleInputChange}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <School color={schoolNameError ? "error" : "primary"} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                    {/* Email */}
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="email"
                                        label="Admin Email Address"
                                        name="email"
                                        autoComplete="email"
                                        error={emailError}
                                        helperText={emailError ? 'Valid email address is required' : 'This will be used for admin login'}
                                        onChange={handleInputChange}
                                    />

                                    {/* Password with strength indicator */}
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        name="password"
                                        label="Admin Password"
                                        type={toggle ? 'text' : 'password'}
                                        id="password"
                                        autoComplete="new-password"
                                        error={passwordError}
                                        helperText={
                                            passwordError 
                                                ? 'Strong password is required' 
                                                : 'Must be at least 8 characters with uppercase, lowercase, numbers, and special characters'
                                        }
                                        onChange={(e) => {
                                            handleInputChange(e);
                                            handlePasswordChange(e);
                                        }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={() => setToggle(!toggle)}>
                                                        {toggle ? <Visibility /> : <VisibilityOff />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                    {/* Password Strength Indicator */}
                                    {passwordStrength.feedback && (
                                        <Box sx={{ mt: 1, mb: 2 }}>
                                            <Typography 
                                                variant="caption" 
                                                color={passwordStrength.color + '.main'}
                                                sx={{ fontWeight: 'bold' }}
                                            >
                                                Password Strength: {passwordStrength.feedback}
                                            </Typography>
                                            <Box
                                                sx={{
                                                    width: '100%',
                                                    height: 4,
                                                    bgcolor: 'grey.300',
                                                    borderRadius: 2,
                                                    mt: 0.5
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: `${(passwordStrength.score / 5) * 100}%`,
                                                        height: '100%',
                                                        bgcolor: passwordStrength.color + '.main',
                                                        borderRadius: 2,
                                                        transition: 'width 0.3s ease'
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Submit Button */}
                                    <LightPurpleButton
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        sx={{ mt: 3, mb: 2 }}
                                    >
                                        {loader ? (
                                            <CircularProgress size={24} color="inherit" />
                                        ) : (
                                            "Create Admin Account"
                                        )}
                                    </LightPurpleButton>

                                    {/* Links */}
                                    <Grid container sx={{ justifyContent: 'center' }}>
                                        <Grid item>
                                            <Typography variant="body2">
                                                Already have an admin account?{' '}
                                                <StyledLink to="/Adminlogin">
                                                    Sign In
                                                </StyledLink>
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </>
                        )}

                        {adminExists && (
                            <Box sx={{ width: '100%', mt: 3 }}>
                                <LightPurpleButton
                                    fullWidth
                                    variant="outlined"
                                    onClick={() => navigate('/Adminlogin')}
                                >
                                    Go to Admin Login
                                </LightPurpleButton>
                            </Box>
                        )}
                    </Box>
                </Grid>
                
                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={7}
                    sx={{
                        backgroundImage: `url(${bgpic})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: (t) =>
                            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
            </Grid>
            
            <Popup 
                message={message} 
                setShowPopup={setShowPopup} 
                showPopup={showPopup} 
            />
        </ThemeProvider>
    );
};

export default AdminRegisterPage;

const StyledLink = styled(Link)`
    text-decoration: none;
    color: #7f56da;
    font-weight: 500;
    &:hover {
        color: #5e3a9b;
        text-decoration: underline;
    }
`;