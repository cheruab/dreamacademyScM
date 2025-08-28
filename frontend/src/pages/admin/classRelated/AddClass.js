import React, { useEffect, useState } from "react";
import { 
    Box, 
    Button, 
    CircularProgress, 
    Stack, 
    TextField, 
    Typography,
    Autocomplete,
    Alert,
    Paper
} from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import { BlueButton } from "../../../components/buttonStyles";
import Popup from "../../../components/Popup";
import Classroom from "../../../assets/classroom.png";
import styled from "styled-components";
import axios from 'axios';

const AddClass = () => {
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [availableStudents, setAvailableStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const userState = useSelector(state => state.user);
    const { status, currentUser, response, error, tempDetails } = userState;

    const adminID = currentUser._id
    const address = "Sclass"

    const [loader, setLoader] = useState(false)
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    // Fetch available students (unassigned students)
    useEffect(() => {
        const fetchUnassignedStudents = async () => {
            if (!currentUser?._id) return;
            
            setLoadingStudents(true);
            try {
                const response = await axios.get(`http://localhost:5000/UnassignedStudents/${currentUser._id}`);
                
                if (Array.isArray(response.data)) {
                    setAvailableStudents(response.data);
                } else {
                    setAvailableStudents([]);
                    if (response.data.message) {
                        setMessage(response.data.message);
                        setShowPopup(true);
                    }
                }
            } catch (error) {
                console.error('Error fetching unassigned students:', error);
                setMessage('Failed to load available students');
                setShowPopup(true);
                setAvailableStudents([]);
            } finally {
                setLoadingStudents(false);
            }
        };

        fetchUnassignedStudents();
    }, [currentUser]);

    const submitHandler = async (event) => {
        event.preventDefault();
        
        if (!selectedStudent) {
            setMessage("Please select a student for this class");
            setShowPopup(true);
            return;
        }

        setLoader(true);

        try {
            // Create class name based on student's name
            const sclassName = `${selectedStudent.name}'s Class`;

            // Create the class first
            const classData = {
                sclassName,
                adminID,
            };

            const classResponse = await axios.post('http://localhost:5000/SclassCreate', classData, {
                headers: { 'Content-Type': 'application/json' },
            });

            if (classResponse.data.message) {
                setMessage(classResponse.data.message);
                setShowPopup(true);
                setLoader(false);
                return;
            }

            const newClass = classResponse.data;

            // Assign the student to the newly created class
            await axios.put(`http://localhost:5000/Student/${selectedStudent._id}`, {
                sclassName: newClass._id
            }, {
                headers: { 'Content-Type': 'application/json' },
            });

            // Navigate to the class details page
            navigate("/Admin/classes/class/" + newClass._id);
            setLoader(false);

        } catch (error) {
            console.error('Error creating class:', error);
            setMessage(error.response?.data?.message || "Failed to create class");
            setShowPopup(true);
            setLoader(false);
        }
    };

    return (
        <>
            <StyledContainer>
                <StyledBox>
                    <Stack sx={{
                        alignItems: 'center',
                        mb: 3
                    }}>
                        <img
                            src={Classroom}
                            alt="classroom"
                            style={{ width: '80%' }}
                        />
                        <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
                            Create Student Class
                        </Typography>
                        <Typography variant="body1" color="text.secondary" align="center">
                            Select a student to create a personalized class. Each class is designed for one student only.
                        </Typography>
                    </Stack>

                    <form onSubmit={submitHandler}>
                        <Stack spacing={3}>
                            {loadingStudents ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                    <CircularProgress size={30} />
                                    <Typography sx={{ ml: 2 }}>Loading available students...</Typography>
                                </Box>
                            ) : availableStudents.length > 0 ? (
                                <>
                                    <Autocomplete
                                        value={selectedStudent}
                                        onChange={(event, newValue) => {
                                            setSelectedStudent(newValue);
                                        }}
                                        options={availableStudents}
                                        getOptionLabel={(option) => `${option.name} (Roll: ${option.rollNum})`}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Select Student"
                                                variant="outlined"
                                                required
                                                helperText="Choose a student who doesn't have a class assigned yet"
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <Box component="li" {...props}>
                                                <Box>
                                                    <Typography variant="body1">
                                                        {option.name}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Roll: {option.rollNum} | ID: {option._id.slice(-6)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        )}
                                    />
                                    
                                    {selectedStudent && (
                                        <Alert severity="info" sx={{ mt: 2 }}>
                                            <Typography variant="body2">
                                                <strong>Class will be created as:</strong> "{selectedStudent.name} Class"
                                            </Typography>
                                        </Alert>
                                    )}
                                </>
                            ) : (
                                <Alert severity="warning">
                                    <Typography variant="body1" gutterBottom>
                                        No unassigned students available
                                    </Typography>
                                    <Typography variant="body2">
                                        All students already have classes assigned or no students exist in the system.
                                    </Typography>
                                </Alert>
                            )}

                            <BlueButton
                                fullWidth
                                size="large"
                                sx={{ mt: 3 }}
                                variant="contained"
                                type="submit"
                                disabled={loader || !selectedStudent || availableStudents.length === 0}
                            >
                                {loader ? <CircularProgress size={24} color="inherit" /> : "Create Student Class"}
                            </BlueButton>
                            
                            <Button variant="outlined" onClick={() => navigate(-1)}>
                                Go Back
                            </Button>
                        </Stack>
                    </form>
                </StyledBox>
            </StyledContainer>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    )
}

export default AddClass

const StyledContainer = styled(Box)`
  flex: 1 1 auto;
  align-items: center;
  display: flex;
  justify-content: center;
`;

const StyledBox = styled(Box)`
  max-width: 600px;
  padding: 50px 3rem 50px;
  margin-top: 1rem;
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  border: 1px solid #ccc;
  border-radius: 4px;
`;