import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import axios from 'axios';

import {
    Box, InputLabel,
    MenuItem, Select,
    Typography, Stack,
    TextField, CircularProgress, FormControl, Button
} from '@mui/material';
import { PurpleButton } from '../../../components/buttonStyles';
import Popup from '../../../components/Popup';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

const REACT_APP_BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

const StudentAttendance = ({ situation }) => {
    const params = useParams();

    const [studentID, setStudentID] = useState("");
    const [student, setStudent] = useState(null);
    const [subjectsList, setSubjectsList] = useState([]);
    const [subjectName, setSubjectName] = useState("");
    const [chosenSubName, setChosenSubName] = useState("");
    const [status, setStatus] = useState('');
    const [date, setDate] = useState('');
    const navigate = useNavigate();

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let stdID;
        
        if (situation === "Student") {
            stdID = params.id;
        } else if (situation === "Subject") {
            const { studentID: paramStudentID, subjectID } = params;
            stdID = paramStudentID;
            setChosenSubName(subjectID);
        } else {
            stdID = params.id;
        }

        if (stdID) {
            setStudentID(stdID);
            fetchStudentData(stdID);
        }
    }, [params, situation]);

     const handleBack = () => {
        navigate(-1); // Go back to previous page
    };

    const fetchStudentData = async (stdID) => {
        try {
            setLoading(true);
            setError('');
            
            // Fetch student details
            const studentResponse = await axios.get(`${REACT_APP_BASE_URL}/Student/${stdID}`);
            const studentData = studentResponse.data;
            
            if (!studentData || (!studentData.name && !studentData._id)) {
                throw new Error('Student not found');
            }
            
            setStudent(studentData);
            
            // Fetch subjects if student has a class and we need to show subject selection
            if (studentData.sclassName?._id && (situation === "Student" || !situation)) {
                try {
                    const subjectsResponse = await axios.get(`${REACT_APP_BASE_URL}/ClassSubjects/${studentData.sclassName._id}`);
                    let subjectsData = [];
                    
                    if (subjectsResponse.data.success) {
                        subjectsData = subjectsResponse.data.subjects || [];
                    } else if (Array.isArray(subjectsResponse.data)) {
                        subjectsData = subjectsResponse.data;
                    }
                    
                    setSubjectsList(subjectsData);
                } catch (subjectsError) {
                    console.warn('Could not fetch subjects:', subjectsError);
                    setSubjectsList([]);
                }
            }
            
        } catch (err) {
            console.error('Error fetching student data:', err);
            setError('Failed to load student data. Please check if the student exists.');
            setStudent(null);
        } finally {
            setLoading(false);
        }
    };

    const changeHandler = (event) => {
        const selectedSubject = subjectsList.find(
            (subject) => subject.subName === event.target.value
        );
        if (selectedSubject) {
            setSubjectName(selectedSubject.subName);
            setChosenSubName(selectedSubject._id);
        }
    };

    const submitHandler = async (event) => {
        event.preventDefault();
        setLoader(true);
        
        try {
            const attendanceData = {
                subName: chosenSubName,
                status,
                date
            };
            
            const response = await axios.put(
                `${REACT_APP_BASE_URL}/StudentAttendance/${studentID}`,
                attendanceData
            );
            
            setShowPopup(true);
            setMessage("Attendance recorded successfully!");
            
            // Reset form
            setStatus('');
            setDate('');
            if (situation === "Student" || !situation) {
                setSubjectName('');
                setChosenSubName('');
            }
            
        } catch (error) {
            console.error('Error submitting attendance:', error);
            setShowPopup(true);
            setMessage("Error recording attendance. Please try again.");
        } finally {
            setLoader(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading student details...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="error" variant="h6">{error}</Typography>
            </Box>
        );
    }

    return (
        <>
        <Box sx={{ mb: 2, mt: 2}}>
                            <Button
                                startIcon={<ArrowBackIcon />}
                                onClick={handleBack}
                                variant="outlined"
                                sx={{ mb: 2 }}
                            >
                                Back to Students
                            </Button>
                        </Box>
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
                        <Typography variant="h4">
                            Student Name: {student?.name || 'Unknown'}
                        </Typography>
                        <Typography variant="body2">
                            Student ID: {studentID}
                        </Typography>
                        <Typography variant="body2">
                            Class: {student?.sclassName?.sclassName || 'No class assigned'}
                        </Typography>
                    </Stack>

                    <form onSubmit={submitHandler}>
                        <Stack spacing={3}>
                            {(situation === "Student" || !situation) && (
                                <FormControl fullWidth>
                                    <InputLabel id="subject-select-label">Select Subject</InputLabel>
                                    <Select
                                        labelId="subject-select-label"
                                        id="subject-select"
                                        value={subjectName}
                                        label="Select Subject"
                                        onChange={changeHandler} 
                                        required
                                    >
                                        {subjectsList.length > 0 ? (
                                            subjectsList.map((subject, index) => (
                                                <MenuItem key={index} value={subject.subName}>
                                                    {subject.subName}
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem value="" disabled>
                                                {student?.sclassName ? "No subjects available for this class" : "Student not assigned to any class"}
                                            </MenuItem>
                                        )}
                                    </Select>
                                </FormControl>
                            )}
                            
                            <FormControl fullWidth>
                                <InputLabel id="status-select-label">Attendance Status</InputLabel>
                                <Select
                                    labelId="status-select-label"
                                    id="status-select"
                                    value={status}
                                    label="Attendance Status"
                                    onChange={(event) => setStatus(event.target.value)}
                                    required
                                >
                                    <MenuItem value="Present">Present</MenuItem>
                                    <MenuItem value="Absent">Absent</MenuItem>
                                </Select>
                            </FormControl>
                            
                            <FormControl>
                                <TextField
                                    label="Select Date"
                                    type="date"
                                    value={date}
                                    onChange={(event) => setDate(event.target.value)} 
                                    required
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </FormControl>
                        </Stack>

                        <PurpleButton
                            fullWidth
                            size="large"
                            sx={{ mt: 3 }}
                            variant="contained"
                            type="submit"
                            disabled={loader || !student || (subjectsList.length === 0 && (situation === "Student" || !situation))}
                        >
                            {loader ? <CircularProgress size={24} color="inherit" /> : "Submit"}
                        </PurpleButton>
                    </form>
                </Box>
            </Box>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
};

export default StudentAttendance;