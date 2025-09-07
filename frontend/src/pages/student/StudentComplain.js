import { useEffect, useState } from 'react';
import { 
    Box, 
    CircularProgress, 
    Stack, 
    TextField, 
    Typography, 
    Paper, 
    Card,
    CardContent,
    Chip,
    Alert,
    Button
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    ChatBubbleOutline as ChatIcon
} from '@mui/icons-material';
import Popup from '../../components/Popup';
import { BlueButton } from '../../components/buttonStyles';
import { addStuff, getComplains } from '../../redux/userRelated/userHandle';
import { useDispatch, useSelector } from 'react-redux';
import FeedbackIcon from '@mui/icons-material/Feedback';
import SendIcon from '@mui/icons-material/Send';

const StudentComplain = () => {
    const dispatch = useDispatch();

    const { status, currentUser, error, complains, loadingComplains } = useSelector(state => state.user);

    const user = currentUser._id;
    const school = currentUser.school._id;
    const address = "Complain";

    // Pre-fill date with today
    const todayDate = new Date().toISOString().split('T')[0];

    const [complaint, setComplaint] = useState("");
    const [date, setDate] = useState(todayDate);
    const [category, setCategory] = useState("Other");
    const [priority, setPriority] = useState("Medium");

    const [loader, setLoader] = useState(false);
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [expandedComplaints, setExpandedComplaints] = useState({});

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
        userType: "student",
        category,
        priority,
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
            setCategory("Other");
            setPriority("Medium");
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
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getComplaintStatus = (complaint) => {
        return complaint.status || "Submitted";
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Submitted': return 'primary';
            case 'In Progress': return 'warning';
            case 'Responded': return 'success';
            case 'Rejected': return 'error';
            default: return 'default';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Critical': return 'error';
            case 'High': return 'warning';
            case 'Medium': return 'info';
            case 'Low': return 'success';
            default: return 'default';
        }
    };

    const toggleExpanded = (id) => {
        setExpandedComplaints(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const categories = ['Academic', 'Behavioral', 'Infrastructure', 'Staff', 'Other'];
    const priorities = ['Low', 'Medium', 'High', 'Critical'];

    return (
        <Box sx={{ maxWidth: 900, margin: '0 auto', p: 2 }}>
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
                    <strong>Dear {currentUser?.name},</strong> you can submit complaints or concerns here. 
                    We take all feedback seriously and will respond appropriately.
                </Typography>
            </Alert>

            {/* Complaint Form */}
            <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                        ✏️ New Complaint
                    </Typography>
                    
                    <form onSubmit={submitHandler}>
                        <Stack spacing={3}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
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
                                    select
                                    fullWidth
                                    label="Category"
                                    value={category}
                                    onChange={(event) => setCategory(event.target.value)}
                                    SelectProps={{
                                        native: true,
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2
                                        }
                                    }}
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </TextField>
                                <TextField
                                    select
                                    fullWidth
                                    label="Priority"
                                    value={priority}
                                    onChange={(event) => setPriority(event.target.value)}
                                    SelectProps={{
                                        native: true,
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2
                                        }
                                    }}
                                >
                                    {priorities.map((pri) => (
                                        <option key={pri} value={pri}>
                                            {pri}
                                        </option>
                                    ))}
                                </TextField>
                            </Box>
                            
                            <TextField
                                fullWidth
                                label="Write your complaint"
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
                        <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
                            <Stack spacing={3}>
                                {complains.map((item, index) => (
                                    <Card 
                                        key={item._id || index}
                                        sx={{ 
                                            borderRadius: 2, 
                                            border: '1px solid #e0e0e0',
                                            '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
                                            transition: 'box-shadow 0.2s'
                                        }}
                                    >
                                        <CardContent sx={{ p: 3 }}>
                                            {/* Header */}
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                                    📅 {formatDate(item.date)}
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    {item.priority && (
                                                        <Chip 
                                                            label={item.priority} 
                                                            size="small" 
                                                            color={getPriorityColor(item.priority)}
                                                            variant="outlined"
                                                        />
                                                    )}
                                                    <Chip 
                                                        label={getComplaintStatus(item)} 
                                                        size="small" 
                                                        color={getStatusColor(getComplaintStatus(item))}
                                                    />
                                                </Box>
                                            </Box>

                                            {/* Category */}
                                            {item.category && (
                                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                                                    📂 Category: {item.category}
                                                </Typography>
                                            )}

                                            {/* Original Complaint */}
                                            <Paper sx={{ 
                                                p: 2, 
                                                backgroundColor: '#f8f9fa', 
                                                borderRadius: 1,
                                                mb: 2 
                                            }}>
                                                <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                                    {expandedComplaints[item._id] || item.complaint.length <= 200 
                                                        ? item.complaint 
                                                        : `${item.complaint.substring(0, 200)}...`}
                                                </Typography>
                                                
                                                {item.complaint.length > 200 && (
                                                    <Button 
                                                        size="small" 
                                                        onClick={() => toggleExpanded(item._id)}
                                                        endIcon={expandedComplaints[item._id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                        sx={{ mt: 1 }}
                                                    >
                                                        {expandedComplaints[item._id] ? 'Show Less' : 'Show More'}
                                                    </Button>
                                                )}
                                            </Paper>

                                            {/* Admin Response */}
                                            {item.response ? (
                                                <Paper sx={{ 
                                                    p: 2, 
                                                    backgroundColor: '#e3f2fd', 
                                                    borderRadius: 1,
                                                    border: '1px solid #2196f3' 
                                                }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        <ChatIcon sx={{ fontSize: 16, color: '#1976d2', mr: 1 }} />
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                                            Admin Response:
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                        {item.response}
                                                    </Typography>
                                                    {item.responseDate && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            Responded on: {formatDate(item.responseDate)}
                                                        </Typography>
                                                    )}
                                                </Paper>
                                            ) : (
                                                <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                                                    <Typography variant="body2">
                                                        ⏳ Awaiting admin response. We will get back to you soon.
                                                    </Typography>
                                                </Alert>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </Stack>
                        </Box>
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

export default StudentComplain;