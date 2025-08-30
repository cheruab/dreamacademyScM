import { useEffect, useState } from 'react';
import { 
    Box, 
    CircularProgress, 
    Stack, 
    TextField, 
    Typography, 
    Paper, 
    List, 
    ListItem, 
    ListItemText, 
    Divider,
    Card,
    CardContent,
    Chip,
    Alert
} from '@mui/material';
import Popup from '../../components/Popup';
import { BlueButton } from '../../components/buttonStyles';
import { addStuff, getComplains } from '../../redux/userRelated/userHandle';
import { useDispatch, useSelector } from 'react-redux';
import FeedbackIcon from '@mui/icons-material/Feedback';
import SendIcon from '@mui/icons-material/Send';

const StudentComplains = ({ child }) => {
    const dispatch = useDispatch();

    const { status, currentUser, error, complains, loadingComplains } = useSelector(state => state.user);

    const user = currentUser._id;
    const school = currentUser.school._id;
    const address = "Complain";

    // Pre-fill date with today
    const todayDate = new Date().toISOString().split('T')[0];

    const [complaint, setComplaint] = useState("");
    const [date, setDate] = useState(todayDate);

    const [loader, setLoader] = useState(false);
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    // Fetch complaints of current user
    useEffect(() => {
        if (user) {
            dispatch(getComplains(user));
        }
    }, [dispatch, user]);

    const fields = {
        user,
        date,
        complaint,
        school,
        userType: "parent",
    };

    const submitHandler = (event) => {
        event.preventDefault();
        if (!complaint.trim()) {
            setMessage("Please enter a complaint");
            setShowPopup(true);
            return;
        }
        setLoader(true);
        dispatch(addStuff(fields, address));
    };

    useEffect(() => {
        if (status === "added") {
            setLoader(false);
            setShowPopup(true);
            setMessage("Complaint submitted successfully! We will review it soon.");
            setComplaint("");
            setDate(todayDate);
            dispatch(getComplains(user)); // Refresh complaints list
        }
        else if (error) {
            setLoader(false);
            setShowPopup(true);
            setMessage("Network Error - Please try again");
        }
    }, [status, error, dispatch, user, todayDate]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getComplaintStatus = (complaint) => {
        return complaint.status || "Submitted";
    };

    return (
        <Box sx={{ maxWidth: 800, margin: '0 auto', p: 2 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <FeedbackIcon sx={{ fontSize: 30, color: '#f44336', mr: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                    💬 Submit a Complaint
                </Typography>
            </Box>

            {/* Info Card */}
            <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                    <strong>Dear {currentUser?.name},</strong> you can submit complaints or concerns regarding your child <strong>{child?.name}</strong> here. 
                    We take all feedback seriously and will respond appropriately.
                </Typography>
            </Alert>

            {/* Complaint Form */}
            <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                        ✍️ New Complaint
                    </Typography>
                    
                    <form onSubmit={submitHandler}>
                        <Stack spacing={3}>
                            <TextField
                                fullWidth
                                label="Select Date"
                                type="date"
                                value={date}
                                onChange={(event) => setDate(event.target.value)}
                                required
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2
                                    }
                                }}
                            />
                            <TextField
                                fullWidth
                                label={`Write your complaint about ${child?.name || 'your child'}`}
                                variant="outlined"
                                value={complaint}
                                onChange={(event) => setComplaint(event.target.value)}
                                required
                                multiline
                                rows={4}
                                placeholder="Please describe your concern in detail..."
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2
                                    }
                                }}
                            />
                        </Stack>
                        <BlueButton
                            fullWidth
                            size="large"
                            sx={{ 
                                mt: 3,
                                py: 1.5,
                                borderRadius: 2,
                                fontSize: '1.1rem',
                                fontWeight: 'bold'
                            }}
                            variant="contained"
                            type="submit"
                            disabled={loader}
                            startIcon={loader ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                        >
                            {loader ? "Submitting..." : "Submit Complaint"}
                        </BlueButton>
                    </form>
                </CardContent>
            </Card>

            {/* Previous Complaints Section */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                            📋 Your Previous Complaints
                        </Typography>
                        {loadingComplains && <CircularProgress size={20} />}
                    </Box>

                    {loadingComplains ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                            <CircularProgress />
                            <Typography sx={{ ml: 2 }}>Loading complaints...</Typography>
                        </Box>
                    ) : complains && complains.length > 0 ? (
                        <Paper elevation={2} sx={{ maxHeight: 400, overflow: 'auto', borderRadius: 2 }}>
                            <List sx={{ p: 0 }}>
                                {complains.map((item, index) => (
                                    <div key={item._id || index}>
                                        <ListItem 
                                            alignItems="flex-start" 
                                            sx={{ 
                                                py: 2,
                                                '&:hover': { backgroundColor: '#f9f9f9' }
                                            }}
                                        >
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                                            📅 {formatDate(item.date)}
                                                        </Typography>
                                                        <Chip 
                                                            label={getComplaintStatus(item)} 
                                                            size="small" 
                                                            color="primary"
                                                            variant="outlined"
                                                        />
                                                    </Box>
                                                }
                                                secondary={
                                                    <Typography 
                                                        variant="body2" 
                                                        sx={{ 
                                                            color: 'text.primary',
                                                            backgroundColor: '#f8f9fa',
                                                            p: 2,
                                                            borderRadius: 1,
                                                            mt: 1,
                                                            border: '1px solid #e0e0e0'
                                                        }}
                                                    >
                                                        {item.complaint}
                                                    </Typography>
                                                }
                                            />
                                        </ListItem>
                                        {index < complains.length - 1 && <Divider />}
                                    </div>
                                ))}
                            </List>
                        </Paper>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                            <FeedbackIcon sx={{ fontSize: 60, mb: 2, opacity: 0.5 }} />
                            <Typography variant="h6">
                                No complaints submitted yet
                            </Typography>
                            <Typography variant="body2">
                                Your submitted complaints will appear here for future reference
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Box>
    );
};

export default StudentComplains;