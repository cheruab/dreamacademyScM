import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
    Button, 
    Grid, 
    Box, 
    Typography, 
    Paper, 
    Checkbox, 
    FormControlLabel, 
    TextField, 
    CssBaseline, 
    IconButton, 
    InputAdornment, 
    CircularProgress, 
    Backdrop,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
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
    LockReset 
} from '@mui/icons-material';
import bgpic from "../../assets/logo1.svg"
import { LightPurpleButton } from '../../components/buttonStyles';
import styled from 'styled-components';
import { adminLogin, resetAdminPassword } from '../../redux/userRelated/userHandle';
import Popup from '../../components/Popup';

const defaultTheme = createTheme();

const AdminLoginPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { status, currentUser, response, error, currentRole } = useSelector(state => state.user);

    // Login form states
    const [toggle, setToggle] = useState(false);
    const [loader, setLoader] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);

    // Password reset dialog states
    const [showResetDialog, setShowResetDialog] = useState(false);
    const [resetStep, setResetStep] = useState(0);
    const [resetLoader, setResetLoader] = useState(false);
    const [resetData, setResetData] = useState({
        email: '',
        currentPassword: '',
        secretKey: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [resetErrors, setResetErrors] = useState({
        email: false,
        currentPassword: false,
        secretKey: false,
        newPassword: false,
        confirmPassword: false
    });
    const [showResetPasswords, setShowResetPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        feedback: "",
        color: "error"
    });

    const resetSteps = ['Verify Identity', 'Enter Security Key', 'Set New Password'];

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

    // Handle login form submission
    const handleSubmit = (event) => {
        event.preventDefault();
        
        const email = event.target.email.value.trim();
        const password = event.target.password.value;

        // Basic validation - only check if fields are not empty
        if (!email || !password) {
            if (!email) setEmailError(true);
            if (!password) setPasswordError(true);
            return;
        }

        const fields = { email, password };
        setLoader(true);
        dispatch(adminLogin(fields));
    };

    const handleInputChange = (event) => {
        const { name } = event.target;
        if (name === 'email') setEmailError(false);
        if (name === 'password') setPasswordError(false);
    };

    // Handle forgot password click
    const handleForgotPassword = () => {
        setShowResetDialog(true);
        setResetStep(0);
        setResetData({
            email: '',
            currentPassword: '',
            secretKey: '',
            newPassword: '',
            confirmPassword: ''
        });
        setResetErrors({
            email: false,
            currentPassword: false,
            secretKey: false,
            newPassword: false,
            confirmPassword: false
        });
    };

    // Handle reset dialog close
    const handleResetDialogClose = () => {
        setShowResetDialog(false);
        setResetStep(0);
        setResetData({
            email: '',
            currentPassword: '',
            secretKey: '',
            newPassword: '',
            confirmPassword: ''
        });
        setResetErrors({
            email: false,
            currentPassword: false,
            secretKey: false,
            newPassword: false,
            confirmPassword: false
        });
    };

    // Handle reset form input changes
    const handleResetInputChange = (field) => (event) => {
        const value = event.target.value;
        setResetData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user starts typing
        setResetErrors(prev => ({
            ...prev,
            [field]: false
        }));

        // Check password strength for new password
        if (field === 'newPassword') {
            const strength = checkPasswordStrength(value);
            setPasswordStrength(strength);
        }

        // Check password confirmation match
        if (field === 'confirmPassword' || field === 'newPassword') {
            const newPass = field === 'newPassword' ? value : resetData.newPassword;
            const confirmPass = field === 'confirmPassword' ? value : resetData.confirmPassword;
            
            if (confirmPass && newPass !== confirmPass) {
                setResetErrors(prev => ({
                    ...prev,
                    confirmPassword: true
                }));
            } else {
                setResetErrors(prev => ({
                    ...prev,
                    confirmPassword: false
                }));
            }
        }
    };

    // Toggle reset password visibility
    const toggleResetPasswordVisibility = (field) => {
        setShowResetPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    // Handle reset step navigation
    const handleResetNext = () => {
        if (resetStep === 0) {
            // Validate email and current password - only check if not empty
            const newErrors = {
                ...resetErrors,
                email: !resetData.email.trim(),
                currentPassword: !resetData.currentPassword.trim()
            };
            setResetErrors(newErrors);

            if (!newErrors.email && !newErrors.currentPassword) {
                setResetStep(1);
            }
        } else if (resetStep === 1) {
            // Validate secret key
            if (!resetData.secretKey.trim()) {
                setResetErrors(prev => ({ ...prev, secretKey: true }));
                return;
            }
            setResetStep(2);
        }
    };

    const handleResetBack = () => {
        setResetStep(prev => Math.max(0, prev - 1));
    };

    // Handle password reset submission
    const handleResetSubmit = async () => {
        // Validate new password and confirmation
        const newErrors = {
            ...resetErrors,
            newPassword: !resetData.newPassword.trim() || resetData.newPassword.length < 8,
            confirmPassword: resetData.newPassword !== resetData.confirmPassword
        };
        setResetErrors(newErrors);

        // Check password strength
        if (resetData.newPassword && passwordStrength.score < 3) {
            setMessage("New password is too weak. Please use a stronger password.");
            setShowPopup(true);
            return;
        }

        if (!newErrors.newPassword && !newErrors.confirmPassword) {
            setResetLoader(true);
            
            try {
                const resetPayload = {
                    email: resetData.email,
                    currentPassword: resetData.currentPassword,
                    secretKey: resetData.secretKey,
                    newPassword: resetData.newPassword
                };

                const result = await dispatch(resetAdminPassword(resetPayload));
                
                if (result.success) {
                    setMessage("Password reset successfully! Please login with your new password.");
                    setShowPopup(true);
                    handleResetDialogClose();
                } else {
                    setMessage(result.message || "Failed to reset password");
                    setShowPopup(true);
                }
            } catch (err) {
                console.error('Password reset error:', err);
                setMessage("Failed to reset password. Please check your credentials.");
                setShowPopup(true);
            } finally {
                setResetLoader(false);
            }
        }
    };

    useEffect(() => {
        if (status === 'success' || currentUser !== null) {
            if (currentRole === 'Admin') {
                navigate('/Admin/dashboard');
            }
        } else if (status === 'failed') {
            setMessage(response || 'Login failed');
            setShowPopup(true);
            setLoader(false);
        } else if (status === 'error') {
            setMessage("Network Error. Please try again.");
            setShowPopup(true);
            setLoader(false);
        }
    }, [status, currentRole, navigate, error, response, currentUser]);

    return (
        <ThemeProvider theme={defaultTheme}>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                    <Box
                        sx={{
                            my: 8,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        {/* Admin Icon */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: 3,
                                p: 2,
                                borderRadius: 2,
                                bgcolor: '#f3e5f5',
                                border: '2px solid #7f56da'
                            }}
                        >
                            <AdminPanelSettings 
                                sx={{ 
                                    fontSize: 40, 
                                    color: '#7f56da',
                                    mr: 1 
                                }} 
                            />
                            <Typography 
                                variant="h4" 
                                sx={{ 
                                    color: "#2c2143",
                                    fontWeight: 'bold'
                                }}
                            >
                                Admin Access
                            </Typography>
                        </Box>

                        <Typography variant="h6" sx={{ mb: 3, textAlign: 'center' }}>
                            Secure Admin Portal - Authorized Access Only
                        </Typography>

                        <Box 
                            component="form" 
                            noValidate 
                            onSubmit={handleSubmit} 
                            sx={{ mt: 2, width: '100%' }}
                        >
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Admin Email Address"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                error={emailError}
                                helperText={emailError && 'Email address is required'}
                                onChange={handleInputChange}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': {
                                            borderColor: '#7f56da',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#7f56da',
                                        },
                                    },
                                }}
                            />
                            
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Admin Password"
                                type={toggle ? 'text' : 'password'}
                                id="password"
                                autoComplete="current-password"
                                error={passwordError}
                                helperText={passwordError && 'Password is required'}
                                onChange={handleInputChange}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton 
                                                onClick={() => setToggle(!toggle)}
                                            >
                                                {toggle ? (
                                                    <Visibility />
                                                ) : (
                                                    <VisibilityOff />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': {
                                            borderColor: '#7f56da',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#7f56da',
                                        },
                                    },
                                }}
                            />
                            
                            <Grid container sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox 
                                            value="remember" 
                                            color="primary" 
                                        />
                                    }
                                    label="Remember me"
                                />
                                <StyledLink 
                                    component="button"
                                    type="button"
                                    onClick={handleForgotPassword}
                                    sx={{ cursor: 'pointer', background: 'none', border: 'none' }}
                                >
                                    Forgot password?
                                </StyledLink>
                            </Grid>
                            
                            <LightPurpleButton
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                            >
                                {loader ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    "Admin Login"
                                )}
                            </LightPurpleButton>
                        </Box>
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

            {/* Password Reset Dialog */}
            <Dialog
                open={showResetDialog}
                onClose={handleResetDialogClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 2 }
                }}
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center">
                        <LockReset sx={{ mr: 2, color: '#7f56da' }} />
                        <Typography variant="h5" component="span" fontWeight="bold">
                            Reset Admin Password
                        </Typography>
                    </Box>
                </DialogTitle>

                <DialogContent>
                    {/* Stepper */}
                    <Box sx={{ width: '100%', mb: 4 }}>
                        <Stepper activeStep={resetStep} alternativeLabel>
                            {resetSteps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </Box>

                    <Alert severity="warning" sx={{ mb: 3 }}>
                        <Typography variant="body2">
                            <Security sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                            This is a secure password reset process. You will need your current password and the admin secret key.
                        </Typography>
                    </Alert>

                    {resetStep === 0 && (
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                Verify Your Identity
                            </Typography>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Admin Email Address"
                                value={resetData.email}
                                onChange={handleResetInputChange('email')}
                                error={resetErrors.email}
                                helperText={resetErrors.email && 'Email address is required'}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Current Password"
                                type={showResetPasswords.current ? 'text' : 'password'}
                                value={resetData.currentPassword}
                                onChange={handleResetInputChange('currentPassword')}
                                error={resetErrors.currentPassword}
                                helperText={resetErrors.currentPassword && 'Current password is required'}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton 
                                                onClick={() => toggleResetPasswordVisibility('current')}
                                                edge="end"
                                            >
                                                {showResetPasswords.current ? <Visibility /> : <VisibilityOff />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>
                    )}

                    {resetStep === 1 && (
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                Enter Security Key
                            </Typography>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Admin Secret Key"
                                type="password"
                                value={resetData.secretKey}
                                onChange={handleResetInputChange('secretKey')}
                                error={resetErrors.secretKey}
                                helperText={resetErrors.secretKey ? 'Secret key is required' : 'Enter the admin secret key (Default: ADMIN_RESET_2024)'}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Security color={resetErrors.secretKey ? "error" : "primary"} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>
                    )}

                    {resetStep === 2 && (
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                Set New Password
                            </Typography>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="New Password"
                                type={showResetPasswords.new ? 'text' : 'password'}
                                value={resetData.newPassword}
                                onChange={handleResetInputChange('newPassword')}
                                error={resetErrors.newPassword}
                                helperText={
                                    resetErrors.newPassword 
                                        ? 'Password must be at least 8 characters' 
                                        : 'Must be different from current password'
                                }
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton 
                                                onClick={() => toggleResetPasswordVisibility('new')}
                                                edge="end"
                                            >
                                                {showResetPasswords.new ? <Visibility /> : <VisibilityOff />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Password Strength Indicator */}
                            {resetData.newPassword && passwordStrength.feedback && (
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

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Confirm New Password"
                                type={showResetPasswords.confirm ? 'text' : 'password'}
                                value={resetData.confirmPassword}
                                onChange={handleResetInputChange('confirmPassword')}
                                error={resetErrors.confirmPassword}
                                helperText={resetErrors.confirmPassword && 'Passwords do not match'}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton 
                                                onClick={() => toggleResetPasswordVisibility('confirm')}
                                                edge="end"
                                            >
                                                {showResetPasswords.confirm ? <Visibility /> : <VisibilityOff />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={resetStep === 0 ? handleResetDialogClose : handleResetBack}
                                disabled={resetLoader}
                            >
                                {resetStep === 0 ? 'Cancel' : 'Back'}
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
                            <LightPurpleButton
                                fullWidth
                                variant="contained"
                                onClick={resetStep === 2 ? handleResetSubmit : handleResetNext}
                                disabled={resetLoader}
                            >
                                {resetLoader ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    resetStep === 2 ? 'Reset Password' : 'Next'
                                )}
                            </LightPurpleButton>
                        </Grid>
                    </Grid>
                </DialogActions>
            </Dialog>
            
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loader}
            >
                <CircularProgress color="primary" />
                <Typography sx={{ ml: 2 }}>
                    Authenticating Admin...
                </Typography>
            </Backdrop>
            
            <Popup 
                message={message} 
                setShowPopup={setShowPopup} 
                showPopup={showPopup} 
            />
        </ThemeProvider>
    );
};

export default AdminLoginPage;

const StyledLink = styled.span`
    margin-top: 9px;
    text-decoration: none;
    color: #7f56da;
    font-weight: 500;
    cursor: pointer;
    &:hover {
        color: #5e3a9b;
        text-decoration: underline;
    }
`;