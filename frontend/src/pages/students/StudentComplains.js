import { useEffect, useState } from 'react';
import { Box, CircularProgress, Stack, TextField, Typography, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';
import Popup from '../../components/Popup';
import { BlueButton } from '../../components/buttonStyles';
import { addStuff, getComplains } from '../../redux/userRelated/userHandle';
 // Import getComplains action to fetch complaints
import { useDispatch, useSelector } from 'react-redux';

const StudentComplains = () => {
    const dispatch = useDispatch();

    const { status, currentUser, error, complains, loading } = useSelector(state => state.user);

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

    // Fetch complaints of current user (parent) on component mount
    useEffect(() => {
        if (user) {
            dispatch(getComplains(user));  // Assuming this fetches complaints by user ID
        }
    }, [dispatch, user]);

    const fields = {
        user,
        date,
        complaint,
        school,
    };

    const submitHandler = (event) => {
        event.preventDefault();
        setLoader(true);
        dispatch(addStuff(fields, address));
    };

    useEffect(() => {
        if (status === "added") {
            setLoader(false);
            setShowPopup(true);
            setMessage("Done Successfully");
            setComplaint("");
            setDate(todayDate);
            dispatch(getComplains(user)); // Refresh complaints list after adding new
        }
        else if (error) {
            setLoader(false);
            setShowPopup(true);
            setMessage("Network Error");
        }
    }, [status, error, dispatch, user, todayDate]);

    return (
        <>
            <Box
                sx={{
                    flex: '1 1 auto',
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'center'
                }}
            >
                <Box
                    sx={{
                        maxWidth: 550,
                        px: 3,
                        py: '100px',
                        width: '100%'
                    }}
                >
                    <Stack spacing={1} sx={{ mb: 3 }}>
                        <Typography variant="h4">Complain</Typography>
                    </Stack>
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
                            />
                            <TextField
                                fullWidth
                                label="Write your complain"
                                variant="outlined"
                                value={complaint}
                                onChange={(event) => setComplaint(event.target.value)}
                                required
                                multiline
                                maxRows={4}
                            />
                        </Stack>
                        <BlueButton
                            fullWidth
                            size="large"
                            sx={{ mt: 3 }}
                            variant="contained"
                            type="submit"
                            disabled={loader}
                        >
                            {loader ? <CircularProgress size={24} color="inherit" /> : "Add"}
                        </BlueButton>
                    </form>

                    {/* Show Complaints Submitted */}
                    <Box sx={{ mt: 6 }}>
                        <Typography variant="h5" gutterBottom>
                            Your Submitted Complaints
                        </Typography>

                        {loading ? (
                            <CircularProgress />
                        ) : complains && complains.length > 0 ? (
                            <Paper elevation={3} sx={{ maxHeight: 300, overflow: 'auto', p: 2 }}>
                                <List>
                                    {complains.map((item) => (
                                        <div key={item._id}>
                                            <ListItem alignItems="flex-start">
                                                <ListItemText
                                                    primary={`Date: ${new Date(item.date).toLocaleDateString()}`}
                                                    secondary={item.complaint}
                                                />
                                            </ListItem>
                                            <Divider component="li" />
                                        </div>
                                    ))}
                                </List>
                            </Paper>
                        ) : (
                            <Typography>No complaints submitted yet.</Typography>
                        )}
                    </Box>
                </Box>
            </Box>

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
};

export default StudentComplains;
