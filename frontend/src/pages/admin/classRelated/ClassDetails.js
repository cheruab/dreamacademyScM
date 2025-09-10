import { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'
import { getClassDetails, getClassStudents, getSubjectList } from "../../../redux/sclassRelated/sclassHandle";
import { deleteUser } from '../../../redux/userRelated/userHandle';
import {
    Box, Container, Typography, Grid, Paper, Button, 
    Dialog, DialogTitle, DialogContent, DialogActions,
    List, ListItem, ListItemText, Checkbox, ListItemButton,
    Alert, CircularProgress, Card, CardContent, Divider,
    Chip, Avatar
} from '@mui/material';
import { resetSubjects } from "../../../redux/sclassRelated/sclassSlice";
import { BlueButton, GreenButton, PurpleButton, RedButton } from "../../../components/buttonStyles";
import TableTemplate from "../../../components/TableTemplate";
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import PostAddIcon from '@mui/icons-material/PostAdd';
import DeleteIcon from "@mui/icons-material/Delete";
import AssignmentIcon from '@mui/icons-material/Assignment';
import QuizIcon from '@mui/icons-material/Quiz';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GradeIcon from '@mui/icons-material/Grade';
import TeacherIcon from '@mui/icons-material/School';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import BookIcon from '@mui/icons-material/Book';
import Popup from "../../../components/Popup";
import styled from 'styled-components';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ClassDetails = () => {
    const params = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { subjectsList, sclassStudents, sclassDetails, loading, error, response, getresponse } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector((state) => state.user);

    const classID = params.id

    // Assignment dialog states
    const [step, setStep] = useState(1); // 1=select subject, 2=select teacher
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [assignDialogType, setAssignDialogType] = useState('');
    const [availableItems, setAvailableItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [assignLoading, setAssignLoading] = useState(false);
    

    useEffect(() => {
        dispatch(getClassDetails(classID, "Sclass"));
        dispatch(getSubjectList(classID, "ClassSubjects"))
        dispatch(getClassStudents(classID));
    }, [dispatch, classID])

    if (error) {
        console.log(error)
    }

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const deleteHandler = (deleteID, address) => {
        setMessage("Sorry the delete function has been disabled for now.")
        setShowPopup(true)
    }
        const handleBack = () => {
        navigate(-1); // Go back to previous page
    };

    // Fetch available items for assignment
    const fetchAvailableItems = async (type) => {
        setAssignLoading(true);
        try {
            let url = '';
            switch (type) {
                case 'subjects':
                    url = `${process.env.REACT_APP_BASE_URL}/AllSchoolSubjects/${currentUser._id}`;
                    break;
                case 'teachers':
                    url = `${process.env.REACT_APP_BASE_URL}/Teachers/${currentUser._id}`;
                    break;
            }

            const response = await fetch(url);
            const data = await response.json();
            
            if (Array.isArray(data)) {
                setAvailableItems(data);
            } else {
                setAvailableItems([]);
                setMessage(`No ${type} available for assignment`);
                setShowPopup(true);
            }
        } catch (error) {
            console.error(`Error fetching ${type}:`, error);
            setMessage(`Error loading ${type}`);
            setShowPopup(true);
            setAvailableItems([]);
        }
        setAssignLoading(false);
    };

    // Handle assignment dialog
    const handleAssignClick = (type) => {
    setAssignDialogType(type);
    setSelectedItems([]);
    setAssignDialogOpen(true);
    setStep(1);

    if (type === 'teachers') {
        // start with showing subjects first
        setAvailableItems(subjectsList);
    } else {
        fetchAvailableItems(type);
    }
};


    // Handle item selection
    const handleItemToggle = (itemId) => {
        setSelectedItems(prev => 
            prev.includes(itemId) 
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    // Handle assignment submission
const handleAssignSubmit = async () => {
    if (selectedItems.length === 0) {
        setMessage('Please select at least one item');
        setShowPopup(true);
        return;
    }

    // Additional validation for teacher assignment
    if (assignDialogType === 'teachers' && !selectedSubject) {
        setMessage('Please select a subject first');
        setShowPopup(true);
        return;
    }

    setAssignLoading(true);
    try {
        let url = '';
        let body = {};
        
        console.log('=== ASSIGNMENT DEBUG ===');
        console.log('Dialog Type:', assignDialogType);
        console.log('Selected Items:', selectedItems);
        console.log('Selected Subject:', selectedSubject);
        console.log('Class ID:', classID);
        
        switch (assignDialogType) {
            case 'subjects':
                url = `${process.env.REACT_APP_BASE_URL}/AssignSubjectsToClass`;
                body = { subjectIds: selectedItems, classId: classID };
                break;
            case 'teachers':
                // Enhanced validation and logging
                if (selectedItems.length !== 1) {
                    setMessage('Please select exactly one teacher');
                    setShowPopup(true);
                    setAssignLoading(false);
                    return;
                }
                
                if (!selectedSubject || !selectedSubject._id) {
                    setMessage('Invalid subject selection. Please try again.');
                    setShowPopup(true);
                    setAssignLoading(false);
                    return;
                }
                
                url = `${process.env.REACT_APP_BASE_URL}/AssignTeacher`;
                body = { 
                    teacherId: selectedItems[0],
                    subjectId: selectedSubject._id, 
                    classId: classID 
                };
                
                console.log('Teacher Assignment Body:', body);
                console.log('URL:', url);
                break;
        }

        console.log('Making request to:', url);
        console.log('Request body:', JSON.stringify(body, null, 2));

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        // Get response text first to see what the server is actually returning
        const responseText = await response.text();
        console.log('Raw response:', responseText);

        // Check if response is ok before parsing JSON
        if (!response.ok) {
            let errorMessage = `HTTP error! status: ${response.status}`;
            
            try {
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.message || errorData.error || errorMessage;
                console.log('Parsed error:', errorData);
            } catch (parseError) {
                console.log('Could not parse error response as JSON:', parseError);
                errorMessage = `${errorMessage} - Response: ${responseText}`;
            }
            
            throw new Error(errorMessage);
        }

        // Try to parse as JSON
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            console.log('Could not parse success response as JSON:', parseError);
            result = { message: 'Assignment completed successfully' };
        }
        
        console.log('Parsed result:', result);
        
        setMessage(`${assignDialogType} assigned successfully!`);
        setShowPopup(true);
        setAssignDialogOpen(false);
        setSelectedSubject(null);
        setStep(1);
        
        // Refresh data
        if (assignDialogType === 'subjects') {
            dispatch(getSubjectList(classID, "ClassSubjects"));
        } else if (assignDialogType === 'teachers') {
            // Refresh subject list to show updated teacher assignments
            dispatch(getSubjectList(classID, "ClassSubjects"));
        }

    } catch (error) {
        console.error('=== ASSIGNMENT ERROR ===');
        console.error('Full error:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        setMessage(`Error assigning ${assignDialogType}: ${error.message}`);
        setShowPopup(true);
    }
    setAssignLoading(false);
};

const renderItemList = () => {
    if (assignLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (availableItems.length === 0) {
        return (
            <Alert severity="info" sx={{ m: 2 }}>
                No {assignDialogType} available
            </Alert>
        );
    }

    // Step 1: Select subject for teacher assignment
    if (assignDialogType === 'teachers' && step === 1) {
        return (
            <List>
                {availableItems.map((subject) => (
                    <ListItemButton 
                        key={subject._id}
                        onClick={() => {
                            setSelectedSubject(subject);
                            setStep(2);
                            fetchAvailableItems('teachers');
                        }}
                    >
                        <ListItemText 
                            primary={subject.subName} 
                            secondary={`Code: ${subject.subCode} | Current Teacher: ${subject.teacher?.name || 'None'}`} 
                        />
                    </ListItemButton>
                ))}
            </List>
        );
    }

    // Step 2: Select teacher (only one can be selected)
    if (assignDialogType === 'teachers' && step === 2) {
        return (
            <div>
                <Alert severity="info" sx={{ mb: 2 }}>
                    Assigning teacher to: <strong>{selectedSubject.subName}</strong>
                    <Button 
                        size="small" 
                        onClick={() => setStep(1)}
                        sx={{ ml: 2 }}
                    >
                        Change Subject
                    </Button>
                </Alert>
                <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {availableItems.map((teacher) => (
                        <ListItem key={teacher._id} disablePadding>
                            <ListItemButton onClick={() => {
                                setSelectedItems([teacher._id]); // Only one teacher
                            }}>
                                <Checkbox
                                    checked={selectedItems.includes(teacher._id)}
                                    tabIndex={-1}
                                    disableRipple
                                />
                                <ListItemText
                                    primary={teacher.name}
                                    secondary={
                                        <div>
                                            <div>{teacher.email}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'gray' }}>
                                                Current Assignment: {
                                                    teacher.teachSubject?.subName || 'None'
                                                } | Class: {
                                                    teacher.teachSclass?.sclassName || 'None'
                                                }
                                            </div>
                                        </div>
                                    }
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </div>
        );
    }

    // For subjects assignment (multiple selection allowed)
    return (
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {availableItems.map((item) => (
                <ListItem key={item._id} disablePadding>
                    <ListItemButton onClick={() => handleItemToggle(item._id)}>
                        <Checkbox
                            checked={selectedItems.includes(item._id)}
                            tabIndex={-1}
                            disableRipple
                        />
                        <ListItemText
                            primary={item.subName || item.name}
                            secondary={item.subCode || item.email || 'No additional info'}
                        />
                    </ListItemButton>
                </ListItem>
            ))}
        </List>
    );
};


    const numberOfSubjects = subjectsList.length;
    const numberOfStudents = sclassStudents.length;
    const studentData = sclassStudents.length > 0 ? sclassStudents[0] : null;

    return (
        <>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <CircularProgress size={60} />
                    <Typography sx={{ ml: 4, fontFamily: 'Roboto, Arial, sans-serif' }}>
                        Loading class details...
                    </Typography>
                </Box>
            ) : (
                <>
                    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, fontFamily: 'Roboto, Arial, sans-serif' }}>

                         <Box sx={{ mb: 2 }}>
                            <Button
                                startIcon={<ArrowBackIcon />}
                                onClick={handleBack}
                                variant="outlined"
                                sx={{ mb: 2 }}
                            >
                                Back to Classes
                            </Button>
                        </Box>
                        <Typography variant="h4" align="center" gutterBottom sx={{ 
                            mb: 4, 
                            fontFamily: 'Roboto, Arial, sans-serif',
                            fontWeight: 600,
                            color: '#2c3e50'
                        }}>
                            Class Overview
                        </Typography>
                        
                        {/* Main Stats Cards */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} md={4}>
                                <StatsCard elevation={2}>
                                    <Typography variant="h6" sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 1,
                                        color: '#34495e',
                                        fontWeight: 500
                                    }}>
                                        <SchoolIcon sx={{ color: '#3498db' }} />
                                        Class Name
                                    </Typography>
                                    <Typography variant="h4" sx={{ 
                                        color: '#2c3e50',
                                        fontWeight: 600
                                    }}>
                                        {sclassDetails && sclassDetails.sclassName}
                                    </Typography>
                                </StatsCard>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <StatsCard elevation={2}>
                                    <Typography variant="h6" sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 1,
                                        color: '#34495e',
                                        fontWeight: 500
                                    }}>
                                        <BookIcon sx={{ color: '#e74c3c' }} />
                                        Total Subjects
                                    </Typography>
                                    <Typography variant="h4" sx={{ 
                                        color: '#27ae60',
                                        fontWeight: 600
                                    }}>
                                        {numberOfSubjects}
                                    </Typography>
                                </StatsCard>
                            </Grid>
                           
                        </Grid>

                        {/* Student Information Card */}
                        {studentData && (
                            <StyledPaper elevation={2} sx={{ p: 3, mb: 3 }}>
                                <Typography variant="h5" gutterBottom sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 1,
                                    color: '#2c3e50',
                                    fontWeight: 500
                                }}>
                                    <PersonIcon sx={{ color: '#9b59b6' }} />
                                    Student Information
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="body1" sx={{ color: '#34495e' }}>
                                            <strong>Name:</strong> {studentData.name}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="body1" sx={{ color: '#34495e' }}>
                                            <strong>Roll Number:</strong> {studentData.rollNum}
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    <BlueButton
                                        variant="contained"
                                        onClick={() => navigate("/Admin/students/student/" + studentData._id)}
                                        size="small"
                                        startIcon={<VisibilityIcon />}
                                    >
                                        View Details
                                    </BlueButton>
                                    <PurpleButton
                                        variant="contained" 
                                        onClick={() => navigate("/Admin/students/student/attendance/" + studentData._id)}
                                        size="small"
                                        startIcon={<AssignmentIcon />}
                                    >
                                        Attendance
                                    </PurpleButton>
                                    <GreenButton
                                        variant="contained" 
                                        onClick={() => navigate("/Admin/students/student/marks/" + studentData._id)}
                                        size="small"
                                        startIcon={<GradeIcon />}
                                    >
                                        Marks
                                    </GreenButton>
                                    <GreenButton
                                        variant="contained" 
                                        onClick={() => navigate("/Admin/exam-results/" + studentData._id)}
                                        size="small"
                                        startIcon={<GradeIcon />}
                                    >
                                        Exam Results
                                    </GreenButton>
                                </Box>
                            </StyledPaper>
                        )}

                        {/* Subjects Section */}
                        <StyledPaper elevation={2} sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h5" gutterBottom sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1,
                                color: '#2c3e50',
                                fontWeight: 500
                            }}>
                                <BookIcon sx={{ color: '#f39c12' }} />
                                Assigned Subjects ({numberOfSubjects})
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            
                            {response ? (
                                <EmptyState>
                                    <Typography variant="h6" sx={{ color: '#7f8c8d' }}>
                                        No subjects assigned to this class
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#95a5a6' }}>
                                        Assign subjects to get started
                                    </Typography>
                                </EmptyState>
                            ) : (
                                <Grid container spacing={2}>
                                    {subjectsList.map((subject) => (
                                        <Grid item xs={12} md={6} lg={4} key={subject._id}>
                                            <SubjectCard variant="outlined" sx={{ height: '100%' }}>
                                                <CardContent>
                                                    <Typography variant="h6" gutterBottom sx={{ 
                                                        color: '#2980b9',
                                                        fontWeight: 500
                                                    }}>
                                                        {subject.subName}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ 
                                                        mb: 1,
                                                        color: '#7f8c8d'
                                                    }}>
                                                        Code: {subject.subCode}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ 
                                                        mb: 1,
                                                        color: '#7f8c8d'
                                                    }}>
                                                        Sessions: {subject.sessions}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ mb: 2 }}>
                                                        Teacher: {subject.teacher ? (
                                                            <Chip 
                                                                avatar={<Avatar sx={{ 
                                                                    bgcolor: '#8e44ad',
                                                                    width: 24,
                                                                    height: 24 
                                                                }}>
                                                                    {subject.teacher.name.charAt(0)}
                                                                </Avatar>}
                                                                label={subject.teacher.name}
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor: '#ecf0f1',
                                                                    color: '#2c3e50'
                                                                }}
                                                            />
                                                        ) : (
                                                            <Chip 
                                                                label="Not assigned"
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor: '#f1c40f',
                                                                    color: '#fff'
                                                                }}
                                                            />
                                                        )}
                                                    </Typography>
                                                </CardContent>
                                            </SubjectCard>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </StyledPaper>

                        {/* Quick Actions */}
                        <StyledPaper elevation={2} sx={{ p: 3 }}>
                            <Typography variant="h5" gutterBottom sx={{ 
                                color: '#2c3e50',
                                fontWeight: 500
                            }}>
                                Quick Actions
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <PurpleButton
                                    variant="contained"
                                    onClick={() => handleAssignClick('subjects')}
                                    startIcon={<PostAddIcon />}
                                    disabled={!sclassDetails}
                                >
                                    Assign Subjects
                                </PurpleButton>
                                <BlueButton
                                    variant="contained"
                                    onClick={() => handleAssignClick('teachers')}
                                    startIcon={<TeacherIcon />}
                                    disabled={!sclassDetails}
                                >
                                    Assign Teachers
                                </BlueButton>
                            </Box>
                        </StyledPaper>
                    </Container>

                    {/* Assignment Dialog */}
                    <Dialog 
                        open={assignDialogOpen} 
                        onClose={() => setAssignDialogOpen(false)}
                        maxWidth="md"
                        fullWidth
                    >
                        <DialogTitle sx={{ 
                            fontFamily: 'Roboto, Arial, sans-serif',
                            fontWeight: 500,
                            color: '#2c3e50'
                        }}>
                            Assign {assignDialogType.charAt(0).toUpperCase() + assignDialogType.slice(1)} to Class
                        </DialogTitle>
                        <DialogContent>
                            <Typography variant="body2" sx={{ 
                                mb: 2,
                                color: '#7f8c8d'
                            }}>
                                Select {assignDialogType} to assign to {sclassDetails?.sclassName}:
                            </Typography>
                            {renderItemList()}
                            {selectedItems.length > 0 && (
                                <Alert severity="success" sx={{ mt: 2 }}>
                                    {selectedItems.length} {assignDialogType} selected
                                </Alert>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setAssignDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAssignSubmit}
                                variant="contained"
                                disabled={assignLoading || selectedItems.length === 0}
                                startIcon={assignLoading ? <CircularProgress size={20} /> : <AssignmentIcon />}
                                sx={{ backgroundColor: '#3498db' }}
                            >
                                Assign Selected
                            </Button>
                        </DialogActions>
                    </Dialog>
                </>
            )}
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
};

export default ClassDetails;

// Simple Styled Components - just better cards and colors
const StatsCard = styled(Paper)`
    padding: 1.5rem;
    text-align: center;
    height: 120px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: #f7b37bff;
    border-radius: 8px;
    font-family: 'Roboto', Arial, sans-serif;
`;

const StyledPaper = styled(Paper)`
    background: #a8f889ff;
    border-radius: 8px;
    font-family: 'Roboto', Arial, sans-serif;
`;

const SubjectCard = styled(Card)`
    background: #bdebb7ff;
    border-radius: 8px;
    font-family: 'Roboto', Arial, sans-serif;
    border: 1px solid #549e6dff;
    
    &:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
`;

const EmptyState = styled(Box)`
    text-align: center;
    padding: 3rem;
    background-color: #bbd6f1f5;
    border-radius: 8px;
    border: 2px dashed #3b5168ff;
    font-family: 'Roboto', Arial, sans-serif;
`;