import { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Chip,
    Button,
    Card,
    CardContent,
    CardActions,
    Tabs,
    Tab,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getAllSubjects } from '../../../redux/sclassRelated/sclassHandle';
import { BlueButton, GreenButton, PurpleButton, RedButton } from '../../../components/buttonStyles';
import PostAddIcon from '@mui/icons-material/PostAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import QuizIcon from '@mui/icons-material/Quiz';
import BookIcon from '@mui/icons-material/Book';
import SchoolIcon from '@mui/icons-material/School';
import WarningIcon from '@mui/icons-material/Warning';
import styled from 'styled-components';
import Popup from '../../../components/Popup';

const ShowSubjects = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const { currentUser } = useSelector(state => state.user);
    const [allSubjects, setAllSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState('');
    
    // Delete confirmation dialog states
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [subjectToDelete, setSubjectToDelete] = useState(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    useEffect(() => {
        fetchAllSubjects();
    }, [currentUser._id]);

    const fetchAllSubjects = async () => {
        try {
            setLoading(true);
            
            // Fetch all subjects
            const allResponse = await fetch(`${process.env.REACT_APP_BASE_URL}/AllSubjects/${currentUser._id}`)
            const allData = await allResponse.json();
            
            if (Array.isArray(allData)) {
                setAllSubjects(allData);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
            setMessage('Failed to load subjects');
            setShowPopup(true);
        } finally {
            setLoading(false);
        }
    };

    const initiateDelete = (subject) => {
        setSubjectToDelete(subject);
        setDeleteConfirmText('');
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (deleteConfirmText.toLowerCase() === 'delete') {
            try {
                const response = await fetch(`${process.env.REACT_APP_BASE_URL}/Subject/${subjectToDelete._id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${currentUser.token}` // Assuming you have a token
                    }
                });

                if (response.ok) {
                    // Remove the deleted subject from the state
                    setAllSubjects(prevSubjects => 
                        prevSubjects.filter(subject => subject._id !== subjectToDelete._id)
                    );
                    setMessage(`Subject "${subjectToDelete.subName}" has been deleted successfully.`);
                    setShowPopup(true);
                } else {
                    setMessage('Failed to delete subject. Please try again.');
                    setShowPopup(true);
                }
            } catch (error) {
                console.error('Error deleting subject:', error);
                setMessage('An error occurred while deleting the subject.');
                setShowPopup(true);
            }
        }
        
        setDeleteDialogOpen(false);
        setSubjectToDelete(null);
        setDeleteConfirmText('');
    };

    const cancelDelete = () => {
        setDeleteDialogOpen(false);
        setSubjectToDelete(null);
        setDeleteConfirmText('');
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Filter subjects based on active tab
    const getFilteredSubjects = () => {
        if (tabValue === 0) return allSubjects; // All subjects
        if (tabValue === 1) return allSubjects.filter(subject => subject.sclassName); // Assigned
        if (tabValue === 2) return allSubjects.filter(subject => !subject.sclassName); // Unassigned
        return allSubjects;
    };

    const SubjectCard = ({ subject }) => (
        <StyledCard elevation={3}>
            <CardHeader>
                <Chip 
                    label={subject.subCode} 
                    color="secondary" 
                    size="small"
                    sx={{ fontWeight: 600 }}
                />
            </CardHeader>
            
            <CardContent>
                <SubjectTitle variant="h5" gutterBottom>
                    {subject.subName}
                </SubjectTitle>
                
                {/* Subject Status */}
                <StatusChipContainer>
                    {subject.sclassName ? (
                        <Chip 
                            icon={<SchoolIcon />}
                            label="Assigned to Class"
                            variant="outlined"
                            color="success"
                            size="small"
                        />
                    ) : (
                        <Chip 
                            label="Unassigned"
                            color="warning"
                            variant="outlined"
                            size="small"
                        />
                    )}
                </StatusChipContainer>
                
                {/* Subject Details */}
                <SubjectDetails>
                    <DetailItem>
                        <BookIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                        Sessions: {subject.sessions}
                    </DetailItem>
                    
                    {subject.description && (
                        <DetailItem sx={{ mt: 1 }}>
                            {subject.description}
                        </DetailItem>
                    )}
                    
                    {subject.videoLink && (
                        <DetailItem sx={{ mt: 1, color: 'info.main' }}>
                            🎥 Video resource available
                        </DetailItem>
                    )}
                </SubjectDetails>
                
                {/* Active/Inactive Status */}
                <Box sx={{ mt: 2 }}>
                    <Chip 
                        label={subject.isActive !== false ? "Active" : "Inactive"}
                        color={subject.isActive !== false ? "success" : "default"}
                        variant="filled"
                        size="small"
                    />
                </Box>
            </CardContent>
            
            <CardActions sx={{ p: 2, pt: 0 }}>
                <ActionButtonGroup>
                    <BlueButton
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/Admin/subjects/subject/0/${subject._id}`)}
                    >
                        Details
                    </BlueButton>
                    
                    <GreenButton
                        size="small"
                        startIcon={<PostAddIcon />}
                        onClick={() => navigate(`/Admin/addexam/${subject._id}`)}
                    >
                        Create Exam
                    </GreenButton>
                    
                    <PurpleButton
                        size="small"
                        startIcon={<QuizIcon />}
                        onClick={() => navigate(`/Admin/exams/${subject._id}`)}
                    >
                        View Exams
                    </PurpleButton>
                    
                    <GreenButton
                        size="small"
                        startIcon={<PostAddIcon />}
                        onClick={() => navigate(`/Admin/lesson-plans/`)}
                    >
                        Lesson Plan
                    </GreenButton>
                    
                    <RedButton
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => initiateDelete(subject)}
                    >
                        Delete
                    </RedButton>
                </ActionButtonGroup>
            </CardActions>
        </StyledCard>
    );

    const renderSubjectGrid = (subjects) => (
        <Grid container spacing={3}>
            {subjects.length > 0 ? (
                subjects.map((subject) => (
                    <Grid item xs={12} md={6} lg={4} key={subject._id}>
                        <SubjectCard subject={subject} />
                    </Grid>
                ))
            ) : (
                <Grid item xs={12}>
                    <EmptyState>
                        <BookIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                            {tabValue === 0 ? 'No subjects found' : 
                             tabValue === 1 ? 'No assigned subjects' : 'No unassigned subjects'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            {tabValue === 0 ? 'Create your first subject to get started' :
                             tabValue === 1 ? 'All subjects are currently unassigned' : 
                             'All subjects have been assigned to classes'}
                        </Typography>
                        {tabValue !== 1 && (
                            <Button
                                variant="contained"
                                startIcon={<PostAddIcon />}
                                onClick={() => navigate('/Admin/addsubject')}
                                sx={{ mt: 2 }}
                            >
                                Create New Subject
                            </Button>
                        )}
                    </EmptyState>
                </Grid>
            )}
        </Grid>
    );

    if (loading) {
        return (
            <LoadingContainer>
                <Typography variant="h6">Loading subjects...</Typography>
            </LoadingContainer>
        );
    }

    const assignedSubjects = allSubjects.filter(subject => subject.sclassName);
    const unassignedSubjects = allSubjects.filter(subject => !subject.sclassName);

    return (
        <Container>
            <HeaderSection>
                <MainTitle variant="h4" gutterBottom>
                    Subject Management
                </MainTitle>
                <SubTitle variant="h6" gutterBottom>
                    Manage all subjects in your school system
                </SubTitle>
                
                <ActionBar>
                    <GreenButton
                        variant="contained"
                        startIcon={<PostAddIcon />}
                        onClick={() => navigate('/Admin/addsubject')}
                        size="large"
                    >
                        Create New Subject
                    </GreenButton>
                </ActionBar>
            </HeaderSection>

            <StyledPaper elevation={3}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <StyledTabs value={tabValue} onChange={handleTabChange}>
                        <Tab 
                            label={`All Subjects (${allSubjects.length})`}
                            icon={<BookIcon />}
                            iconPosition="start"
                        />
                        <Tab 
                            label={`Assigned (${assignedSubjects.length})`}
                            icon={<SchoolIcon />}
                            iconPosition="start"
                        />
                        <Tab 
                            label={`Unassigned (${unassignedSubjects.length})`}
                            icon={<PostAddIcon />}
                            iconPosition="start"
                        />
                    </StyledTabs>
                </Box>

                {tabValue === 0 && (
                    <TabPanel>
                        <StyledAlert severity="info" sx={{ mb: 3 }}>
                            <Typography variant="body2">
                                Showing all {allSubjects.length} subjects in your school. Each subject can be assigned to classes and used to create exams.
                            </Typography>
                        </StyledAlert>
                        {renderSubjectGrid(allSubjects)}
                    </TabPanel>
                )}

                {tabValue === 1 && (
                    <TabPanel>
                        <StyledAlert severity="success" sx={{ mb: 3 }}>
                            <Typography variant="body2">
                                These {assignedSubjects.length} subjects are currently assigned to classes and available for student enrollment.
                            </Typography>
                        </StyledAlert>
                        {renderSubjectGrid(assignedSubjects)}
                    </TabPanel>
                )}

                {tabValue === 2 && (
                    <TabPanel>
                        <StyledAlert severity="warning" sx={{ mb: 3 }}>
                            <Typography variant="body2">
                                These {unassignedSubjects.length} subjects are not assigned to any class yet. You can still create exams for them or assign them to classes.
                            </Typography>
                        </StyledAlert>
                        {renderSubjectGrid(unassignedSubjects)}
                    </TabPanel>
                )}
            </StyledPaper>

            {/* Delete Confirmation Dialog */}
            <Dialog 
                open={deleteDialogOpen} 
                onClose={cancelDelete}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningIcon color="error" />
                    Confirm Delete
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Are you sure you want to delete the subject "{subjectToDelete?.subName}"?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        This action cannot be undone. All related data will be permanently removed.
                    </Typography>
                    <TextField
                        fullWidth
                        label="Type 'delete' to confirm"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="delete"
                        variant="outlined"
                        helperText="Type 'delete' (case insensitive) to confirm deletion"
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={cancelDelete} color="primary">
                        Cancel
                    </Button>
                    <Button 
                        onClick={confirmDelete} 
                        color="error"
                        variant="contained"
                        disabled={deleteConfirmText.toLowerCase() !== 'delete'}
                    >
                        Delete Subject
                    </Button>
                </DialogActions>
            </Dialog>

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

export default ShowSubjects;

// Styled Components with improved styling
const Container = styled(Box)`
    padding: 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    font-family: 'Inter', 'Roboto', sans-serif;
`;

const HeaderSection = styled(Box)`
    margin-bottom: 2rem;
    text-align: center;
`;

const MainTitle = styled(Typography)`
    color: white;
    font-weight: 700;
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
`;

const SubTitle = styled(Typography)`
    color: rgba(255, 255, 255, 0.9);
    font-weight: 400;
    margin-bottom: 1rem;
`;

const ActionBar = styled(Box)`
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
    justify-content: center;
    flex-wrap: wrap;
    
    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const StyledPaper = styled(Paper)`
    padding: 2.5rem;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(10px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
`;

const StyledTabs = styled(Tabs)`
    .MuiTab-root {
        font-weight: 600;
        font-size: 1rem;
        text-transform: none;
    }
`;

const StyledAlert = styled(Alert)`
    border-radius: 12px;
    font-weight: 500;
`;

const TabPanel = styled(Box)`
    padding-top: 1rem;
`;

const StyledCard = styled(Card)`
    height: 100%;
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease-in-out;
    border-radius: 16px;
    background: linear-gradient(135deg, #d0e9d2ff 0%, #c7ecc2ff 100%);
    border: 1px solid rgba(102, 126, 234, 0.1);
    
    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
    }
`;

const CardHeader = styled(Box)`
    padding: 1rem 1rem 0 1rem;
    display: flex;
    justify-content: flex-end;
`;

const SubjectTitle = styled(Typography)`
    font-weight: 700;
    color: #2d3748;
    margin-bottom: 1rem;
    font-size: 1.3rem;
`;

const StatusChipContainer = styled(Box)`
    margin-bottom: 1rem;
`;

const SubjectDetails = styled(Box)`
    margin-bottom: 1rem;
`;

const DetailItem = styled(Typography)`
    color: #4a5568;
    font-size: 0.9rem;
    line-height: 1.5;
    margin-bottom: 0.25rem;
`;

const ActionButtonGroup = styled(Box)`
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-start;
    width: 100%;
`;

const EmptyState = styled(Box)`
    text-align: center;
    padding: 4rem 2rem;
    background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
    border-radius: 16px;
    border: 2px dashed #cbd5e0;
    margin: 2rem 0;
`;

const LoadingContainer = styled(Box)`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 50vh;
    color: white;
`;