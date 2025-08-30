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
// Replace the handleAssignSubmit function in your ClassDetails.js with this:

const handleAssignSubmit = async () => {
    if (selectedItems.length === 0) {
        setMessage('Please select at least one item');
        setShowPopup(true);
        return;
    }

    setAssignLoading(true);
    try {
        let url = '';
        let body = {};
        
        switch (assignDialogType) {
            case 'subjects':
                url = `${process.env.REACT_APP_BASE_URL}/AssignSubjectsToClass`;
                body = { subjectIds: selectedItems, classId: classID };
                break;
            case 'teachers':
                // Use the new /AssignTeacher endpoint
                url = `${process.env.REACT_APP_BASE_URL}/AssignTeacher`;
                body = { 
                    teacherId: selectedItems[0], // Only one teacher can be selected
                    subjectId: selectedSubject._id, 
                    classId: classID 
                };
                break;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        // Check if response is ok before parsing JSON
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        setMessage(`${assignDialogType} assigned successfully!`);
        setShowPopup(true);
        setAssignDialogOpen(false);
        setSelectedSubject(null);
        setStep(1);
        
        // Refresh data
        if (assignDialogType === 'subjects') {
            dispatch(getSubjectList(classID, "ClassSubjects"));
        } else if (assignDialogType === 'teachers') {
            // Optionally refresh subject list to show updated teacher assignments
            dispatch(getSubjectList(classID, "ClassSubjects"));
        }

    } catch (error) {
        console.error('Assignment error:', error);
        setMessage(`Error assigning ${assignDialogType}: ${error.message}`);
        setShowPopup(true);
    }
    setAssignLoading(false);
};

// Also update the teacher assignment to only allow single selection
// Replace the renderItemList function's teacher selection part with this:

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
                    <Typography sx={{ ml: 2 }}>Loading class details...</Typography>
                </Box>
            ) : (
                <>
                    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                        <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4 }}>
                            Class Overview
                        </Typography>
                        
                        {/* Main Stats Cards */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} md={4}>
                                <StatsCard elevation={3}>
                                    <Typography variant="h6" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <SchoolIcon />
                                        Class Name
                                    </Typography>
                                    <Typography variant="h4">
                                        {sclassDetails && sclassDetails.sclassName}
                                    </Typography>
                                </StatsCard>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <StatsCard elevation={3}>
                                    <Typography variant="h6" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <BookIcon />
                                        Total Subjects
                                    </Typography>
                                    <Typography variant="h4" color="success.main">
                                        {numberOfSubjects}
                                    </Typography>
                                </StatsCard>
                            </Grid>
                           
                        </Grid>

                        {/* Student Information Card */}
                        {studentData && (
                            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PersonIcon color="primary" />
                                    Student Information
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="body1"><strong>Name:</strong> {studentData.name}</Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="body1"><strong>Roll Number:</strong> {studentData.rollNum}</Typography>
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
                            </Paper>
                        )}

                        {/* Subjects Section */}
                        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <BookIcon color="secondary" />
                                Assigned Subjects ({numberOfSubjects})
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            
                            {response ? (
                                <EmptyState>
                                    <Typography variant="h6" color="text.secondary">
                                        No subjects assigned to this class
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Assign subjects to get started
                                    </Typography>
                                </EmptyState>
                            ) : (
                                <Grid container spacing={2}>
                                    {subjectsList.map((subject) => (
                                        <Grid item xs={12} md={6} lg={4} key={subject._id}>
                                            <Card variant="outlined" sx={{ height: '100%' }}>
                                                <CardContent>
                                                    <Typography variant="h6" color="primary" gutterBottom>
                                                        {subject.subName}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                        Code: {subject.subCode}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                        Sessions: {subject.sessions}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                        <BlueButton
                                                            variant="outlined"
                                                            onClick={() => navigate(`/Admin/class/subject/${classID}/${subject._id}`)}
                                                            size="small"
                                                            startIcon={<VisibilityIcon />}
                                                        >
                                                            View
                                                        </BlueButton>
                                                        <GreenButton
                                                            variant="outlined"
                                                            onClick={() => navigate(`/Admin/addexam/${subject._id}`)}
                                                            size="small"
                                                            startIcon={<PostAddIcon />}
                                                        >
                                                            Add Exam
                                                        </GreenButton>
                                                        <PurpleButton
                                                            variant="outlined"
                                                            onClick={() => navigate(`/Admin/exams/${subject._id}`)}
                                                            size="small"
                                                            startIcon={<QuizIcon />}
                                                        >
                                                            Exams
                                                        </PurpleButton>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Paper>

                        {/* Quick Actions */}
                        <Paper elevation={3} sx={{ p: 3 }}>
                            <Typography variant="h5" gutterBottom>
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
                        </Paper>
                    </Container>

                    {/* Assignment Dialog */}
                    <Dialog 
                        open={assignDialogOpen} 
                        onClose={() => setAssignDialogOpen(false)}
                        maxWidth="md"
                        fullWidth
                    >
                        <DialogTitle>
                            Assign {assignDialogType.charAt(0).toUpperCase() + assignDialogType.slice(1)} to Class
                        </DialogTitle>
                        <DialogContent>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
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

// Styled Components
const StatsCard = styled(Paper)`
    padding: 1.5rem;
    text-align: center;
    height: 120px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
`;

const EmptyState = styled(Box)`
    text-align: center;
    padding: 3rem;
    background-color: #f9f9f9;
    border-radius: 8px;
    border: 2px dashed #ddd;
`;
