import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Paper,
    Typography,
    TextField,
    IconButton,
    InputAdornment,
    Alert,
    CircularProgress,
    Grid
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { 
    Visibility, 
    VisibilityOff, 
    Security, 
    LockReset,
    AdminPanelSettings 
} from '@mui/icons-material';
import { LightPurpleButton } from '../../components/buttonStyles';
import { changeAdminPassword } from '../../redux/userRelated/userHandle';
import Popup from '../../components/Popup';

const defaultTheme = createTheme();

const AdminPasswordChangePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { currentUser, currentRole, status, response, error } = useSelector(state => state.user);

    // Redirect if not admin
    useEffect(() => {
        if (!currentUser || currentRole !== 'Admin') {
            navigate('/Adminlogin');
        }
    }, [currentUser, currentRole, navigate]);

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false
    });

    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        feedback: "",
        color: "error"
    });

    const [loading, setLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);

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

    const handleInputChange = (field) => (event) => {
        const value = event.target.value;
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user starts typing
        setErrors(prev => ({
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
            const newPass = field === 'newPassword' ? value : formData.newPassword;
            const confirmPass = field === 'confirmPassword' ? value : formData.confirmPassword;
            
            if (confirmPass && newPass !== confirmPass) {
                setErrors(prev => ({
                    ...prev,
                    confirmPassword: true
                }));
            } else {
                setErrors(prev => ({
                    ...prev,
                    confirmPassword: false
                }));
            }
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const validateForm = () => {
        const newErrors = {
            currentPassword: !formData.currentPassword.trim(),
            newPassword: !formData.newPassword.trim() || formData.newPassword.length < 8,
            confirmPassword: formData.newPassword !== formData.confirmPassword
        };

        setErrors(newErrors);

        // Check password strength
        if (formData.newPassword && passwordStrength.score < 3) {
            setMessage("New password is too weak. Please use a stronger password.");
            setShowPopup(true);
            return false;
        }

        // Check if new password is same as current
        if (formData.currentPassword === formData.newPassword) {
            setMessage("New password must be different from current password.");
            setShowPopup(true);
            return false;
        }

        return !Object.values(newErrors).some(error => error);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        
        try {
            const changeData = {
                adminId: currentUser._id,
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            };

            const result = await dispatch(changeAdminPassword(changeData));
            
            if (result.success) {
                setSuccess(true);
                setMessage("Password changed successfully! You will be redirected to login.");
                setShowPopup(true);
                
                // Clear form
                setFormData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });

                // Redirect to login after success
                setTimeout(() => {
                    navigate('/Adminlogin');
                }, 3000);
            } else {
                setMessage(result.message || "Failed to change password");
                setShowPopup(true);
            }
        } catch (err) {
            console.error('Password change error:', err);
            setMessage("Failed to change password. Please try again.");
            setShowPopup(true);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/Admin/dashboard');
    };

    if (!currentUser || currentRole !== 'Admin') {
        return null; // Will redirect via useEffect
    }

    return (
        <ThemeProvider theme={defaultTheme}>
            <Box
                sx={{
                    minHeight: '100vh',
                    bgcolor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 4
                }}
            >
                <Paper
                    elevation={8}
                    sx={{
                        width: '100%',
                        maxWidth: 500,
                        p: 4,
                        borderRadius: 2
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
                            bgcolor: '#f3e5f5',
                            border: '2px solid #7f56da'
                        }}
                    >
                        <LockReset 
                            sx={{ 
                                fontSize: 32, 
                                color: '#7f56da',
                                mr: 2 
                            }} 
                        />
                        <Typography 
                            variant="h5" 
                            sx={{ 
                                color: "#2c2143",
                                fontWeight: 'bold'
                            }}
                        >
                            Change Admin Password
                        </Typography>
                    </Box>

                    {/* Admin Info */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 3,
                            p: 2,
                            bgcolor: '#e3f2fd',
                            borderRadius: 1
                        }}
                    >
                        <AdminPanelSettings 
                            sx={{ 
                                color: '#1976d2',
                                mr: 1 
                            }} 
                        />
                        <Typography variant="body1" sx={{ color: '#1976d2' }}>
                            <strong>Admin:</strong> {currentUser?.name} ({currentUser?.email})
                        </Typography>
                    </Box>

                    {success && (
                        <Alert severity="success" sx={{ mb: 3 }}>
                            Password changed successfully! Redirecting to login...
                        </Alert>
                    )}

                    <Alert severity="info" sx={{ mb: 3 }}>
                        <Typography variant="body2">
                            <Security sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                            For security purposes, you will be logged out after changing your password.
                        </Typography>
                    </Alert>

                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        {/* Current Password */}
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="currentPassword"
                            label="Current Password"
                            type={showPasswords.current ? 'text' : 'password'}
                            value={formData.currentPassword}
                            onChange={handleInputChange('currentPassword')}
                            error={errors.currentPassword}
                            helperText={errors.currentPassword && 'Current password is required'}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton 
                                            onClick={() => togglePasswordVisibility('current')}
                                            edge="end"
                                        >
                                            {showPasswords.current ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* New Password */}
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="newPassword"
                            label="New Password"
                            type={showPasswords.new ? 'text' : 'password'}
                            value={formData.newPassword}
                            onChange={handleInputChange('newPassword')}
                            error={errors.newPassword}
                            helperText={
                                errors.newPassword 
                                    ? 'Password must be at least 8 characters' 
                                    : 'Must be different from current password'
                            }
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton 
                                            onClick={() => togglePasswordVisibility('new')}
                                            edge="end"
                                        >
                                            {showPasswords.new ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* Password Strength Indicator */}
                        {formData.newPassword && passwordStrength.feedback && (
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

                        {/* Confirm New Password */}
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="confirmPassword"
                            label="Confirm New Password"
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={handleInputChange('confirmPassword')}
                            error={errors.confirmPassword}
                            helperText={errors.confirmPassword && 'Passwords do not match'}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton 
                                            onClick={() => togglePasswordVisibility('confirm')}
                                            edge="end"
                                        >
                                            {showPasswords.confirm ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* Action Buttons */}
                        <Grid container spacing={2} sx={{ mt: 3 }}>
                            <Grid item xs={6}>
                                <LightPurpleButton
                                    fullWidth
                                    variant="outlined"
                                    onClick={handleCancel}
                                    disabled={loading}
                                >
                                    Cancel
                                </LightPurpleButton>
                            </Grid>
                            <Grid item xs={6}>
                                <LightPurpleButton
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    disabled={loading || success}
                                >
                                    {loading ? (
                                        <CircularProgress size={24} color="inherit" />
                                    ) : (
                                        "Change Password"
                                    )}
                                </LightPurpleButton>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Security Notice */}
                    <Box sx={{ mt: 3, p: 2, bgcolor: '#fff3cd', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                            <strong>Security Notice:</strong> Your password should be unique and not used elsewhere. 
                            Keep it confidential and change it regularly for optimal security.
                        </Typography>
                    </Box>
                </Paper>
            </Box>

            <Popup 
                message={message} 
                setShowPopup={setShowPopup} 
                showPopup={showPopup} 
            />
        </ThemeProvider>
    );
};

export default AdminPasswordChangePage;