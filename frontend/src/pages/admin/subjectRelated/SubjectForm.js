import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Switch,
    FormControlLabel,
    Alert
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../../redux/userRelated/userHandle';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import { underControl } from '../../../redux/userRelated/userSlice';
import Popup from '../../../components/Popup';
import styled from 'styled-components';

const SubjectForm = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const params = useParams();
    
    const { currentUser, status, response, error } = useSelector(state => state.user);
    const { sclassesList } = useSelector(state => state.sclass);
    
    const [subjects, setSubjects] = useState([
        { subName: '', subCode: '', sessions: '', description: '', videoLink: '' }
    ]);
    const [selectedClass, setSelectedClass] = useState(params.id || '');
    const [assignToClass, setAssignToClass] = useState(!!params.id);
    const [loading, setLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        dispatch(getAllSclasses(currentUser._id, "Sclass"));
    }, [dispatch, currentUser._id]);

    useEffect(() => {
        if (status === 'added') {
            setMessage('Subjects created successfully!');
            setShowPopup(true);
            setTimeout(() => {
                if (assignToClass && selectedClass) {
                    navigate(`/Admin/classes/class/${selectedClass}`);
                } else {
                    navigate('/Admin/subjects');
                }
            }, 2000);
            dispatch(underControl());
            setLoading(false);
        } else if (status === 'failed') {
            setMessage(response || 'Failed to create subjects');
            setShowPopup(true);
            setLoading(false);
        } else if (status === 'error') {
            setMessage('Network error occurred');
            setShowPopup(true);
            setLoading(false);
        }
    }, [status, response, navigate, dispatch, assignToClass, selectedClass]);

    const handleSubjectChange = (index, field, value) => {
        const updatedSubjects = [...subjects];
        updatedSubjects[index][field] = value;
        setSubjects(updatedSubjects);
    };

    const addSubjectField = () => {
        setSubjects([...subjects, { subName: '', subCode: '', sessions: '', description: '', videoLink: '' }]);
    };

    const removeSubjectField = (index) => {
        if (subjects.length > 1) {
            const updatedSubjects = subjects.filter((_, i) => i !== index);
            setSubjects(updatedSubjects);
        }
    };

    const validateForm = () => {
        for (let subject of subjects) {
            if (!subject.subName.trim() || !subject.subCode.trim() || !subject.sessions) {
                return false;
            }
        }
        if (assignToClass && !selectedClass) {
            return false;
        }
        return true;
    };

    const submitHandler = (event) => {
        event.preventDefault();
        
        if (!validateForm()) {
            setMessage('Please fill in all required fields');
            setShowPopup(true);
            return;
        }

        setLoading(true);
        
        const fields = {
            subjects: subjects,
            adminID: currentUser._id,
            sclassName: assignToClass ? selectedClass : null
        };

        dispatch(addStuff(fields, "Subject"));
    };

    return (
        <Container>
            <StyledPaper elevation={3}>
                <Typography variant="h4" gutterBottom align="center" color="primary">
                    {params.id ? 'Add Subjects to Class' : 'Create New Subjects'}
                </Typography>

                <form onSubmit={submitHandler}>
                    {/* Class Assignment Section */}
                    <SectionContainer>
                        <Typography variant="h6" gutterBottom>
                            Class Assignment
                        </Typography>
                        
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={assignToClass}
                                    onChange={(e) => setAssignToClass(e.target.checked)}
                                    color="primary"
                                />
                            }
                            label="Assign to a specific class"
                        />

                        {assignToClass && (
                            <FormControl fullWidth sx={{ mt: 2 }}>
                                <InputLabel>Select Class</InputLabel>
                                <Select
                                    value={selectedClass}
                                    label="Select Class"
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    required={assignToClass}
                                >
                                    {sclassesList && sclassesList.map((sclass) => (
                                        <MenuItem key={sclass._id} value={sclass._id}>
                                            {sclass.sclassName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {!assignToClass && (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                Subjects will be created as unassigned and can be assigned to classes later.
                            </Alert>
                        )}
                    </SectionContainer>

                    {/* Subjects Section */}
                    <SectionContainer>
                        <Typography variant="h6" gutterBottom>
                            Subject Details
                        </Typography>

                        {subjects.map((subject, index) => (
                            <SubjectCard key={index} elevation={2}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Chip 
                                        label={`Subject ${index + 1}`} 
                                        color="primary" 
                                        variant="outlined" 
                                    />
                                    {subjects.length > 1 && (
                                        <Button 
                                            color="error" 
                                            onClick={() => removeSubjectField(index)}
                                            size="small"
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </Box>

                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Subject Name"
                                            value={subject.subName}
                                            onChange={(e) => handleSubjectChange(index, 'subName', e.target.value)}
                                            required
                                            placeholder="e.g., Mathematics"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <TextField
                                            fullWidth
                                            label="Subject Code"
                                            value={subject.subCode}
                                            onChange={(e) => handleSubjectChange(index, 'subCode', e.target.value)}
                                            required
                                            placeholder="e.g., MATH101"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <TextField
                                            fullWidth
                                            label="Total Sessions"
                                            type="number"
                                            value={subject.sessions}
                                            onChange={(e) => handleSubjectChange(index, 'sessions', e.target.value)}
                                            required
                                            placeholder="e.g., 40"
                                            inputProps={{ min: 1 }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Description"
                                            multiline
                                            rows={2}
                                            value={subject.description}
                                            onChange={(e) => handleSubjectChange(index, 'description', e.target.value)}
                                            placeholder="Brief description of the subject"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Video Link (YouTube)"
                                            value={subject.videoLink}
                                            onChange={(e) => handleSubjectChange(index, 'videoLink', e.target.value)}
                                            placeholder="https://youtube.com/watch?v=..."
                                        />
                                    </Grid>
                                </Grid>
                            </SubjectCard>
                        ))}

                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <Button 
                                variant="outlined" 
                                onClick={addSubjectField}
                                color="primary"
                            >
                                Add Another Subject
                            </Button>
                        </Box>
                    </SectionContainer>

                    {/* Action Buttons */}
                    <ActionContainer>
                        <Button 
                            variant="outlined" 
                            onClick={() => navigate(-1)}
                            size="large"
                        >
                            Cancel
                        </Button>
                        <BlueButton
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Subjects'}
                        </BlueButton>
                    </ActionContainer>
                </form>
            </StyledPaper>

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

export default SubjectForm;

// Styled Components
const Container = styled(Box)`
    display: flex;
    justify-content: center;
    padding: 2rem;
    min-height: 100vh;
    background-color: #f5f5f5;
`;

const StyledPaper = styled(Paper)`
    max-width: 800px;
    width: 100%;
    padding: 2rem;
    margin: 1rem;
`;

const SectionContainer = styled(Box)`
    margin: 2rem 0;
    padding: 1rem 0;
    border-bottom: 1px solid #eee;
    
    &:last-child {
        border-bottom: none;
    }
`;

const SubjectCard = styled(Paper)`
    padding: 1.5rem;
    margin: 1rem 0;
    background-color: #fafafa;
`;

const ActionContainer = styled(Box)`
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 2rem;
    
    @media (max-width: 600px) {
        flex-direction: column;
    }
`;