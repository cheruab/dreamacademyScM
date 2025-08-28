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
    Alert
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

    const deleteSubject = async (subjectId) => {
        setMessage("Sorry, the delete function has been disabled for now.");
        setShowPopup(true);
        // TODO: Implement actual delete functionality
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
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" color="primary" gutterBottom>
                        {subject.subName}
                    </Typography>
                    <Chip 
                        label={subject.subCode} 
                        color="secondary" 
                        size="small"
                    />
                </Box>
                
                {/* Subject Status */}
                <Box sx={{ mb: 2 }}>
                    {subject.sclassName ? (
                        <Chip 
                            icon={<SchoolIcon />}
                            label={`Assigned to Class`}
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
                </Box>
                
                {/* Subject Details */}
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <BookIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                        Sessions: {subject.sessions}
                    </Typography>
                    
                    {subject.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {subject.description}
                        </Typography>
                    )}
                    
                    {subject.videoLink && (
                        <Typography variant="body2" color="info.main" sx={{ fontSize: '0.85rem' }}>
                            📹 Video resource available
                        </Typography>
                    )}
                </Box>
                
                {/* Active/Inactive Status */}
                <Box sx={{ mb: 2 }}>
                    <Chip 
                        label={subject.isActive !== false ? "Active" : "Inactive"}
                        color={subject.isActive !== false ? "success" : "default"}
                        variant="filled"
                        size="small"
                    />
                </Box>
            </CardContent>
            
            <CardActions>
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
                        onClick={() => deleteSubject(subject._id)}
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
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <Typography>Loading subjects...</Typography>
            </Box>
        );
    }

    const assignedSubjects = allSubjects.filter(subject => subject.sclassName);
    const unassignedSubjects = allSubjects.filter(subject => !subject.sclassName);

    return (
        <Container>
            <HeaderSection>
                <Typography variant="h4" gutterBottom>
                    Subject Management
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Manage all subjects in your school system
                </Typography>
                
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

            <StyledPaper elevation={2}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={tabValue} onChange={handleTabChange}>
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
                    </Tabs>
                </Box>

                {tabValue === 0 && (
                    <TabPanel>
                        <Alert severity="info" sx={{ mb: 3 }}>
                            <Typography variant="body2">
                                Showing all {allSubjects.length} subjects in your school. Each subject can be assigned to classes and used to create exams.
                            </Typography>
                        </Alert>
                        {renderSubjectGrid(allSubjects)}
                    </TabPanel>
                )}

                {tabValue === 1 && (
                    <TabPanel>
                        <Alert severity="success" sx={{ mb: 3 }}>
                            <Typography variant="body2">
                                These {assignedSubjects.length} subjects are currently assigned to classes and available for student enrollment.
                            </Typography>
                        </Alert>
                        {renderSubjectGrid(assignedSubjects)}
                    </TabPanel>
                )}

                {tabValue === 2 && (
                    <TabPanel>
                        <Alert severity="warning" sx={{ mb: 3 }}>
                            <Typography variant="body2">
                                These {unassignedSubjects.length} subjects are not assigned to any class yet. You can still create exams for them or assign them to classes.
                            </Typography>
                        </Alert>
                        {renderSubjectGrid(unassignedSubjects)}
                    </TabPanel>
                )}
            </StyledPaper>

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

export default ShowSubjects;

// Styled Components
const Container = styled(Box)`
    padding: 2rem;
    background-color: #f5f5f5;
    min-height: 100vh;
`;

const HeaderSection = styled(Box)`
    margin-bottom: 2rem;
`;

const ActionBar = styled(Box)`
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
    flex-wrap: wrap;
    
    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const StyledPaper = styled(Paper)`
    padding: 2rem;
    border-radius: 12px;
`;

const TabPanel = styled(Box)`
    padding-top: 1rem;
`;

const StyledCard = styled(Card)`
    height: 100%;
    display: flex;
    flex-direction: column;
    transition: transform 0.2s ease-in-out;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
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
    background-color: #f9f9f9;
    border-radius: 8px;
    border: 2px dashed #ddd;
    margin: 2rem 0;
`;