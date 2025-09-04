import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Container, Typography, Card, CardContent, Divider, Chip, Grid } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import BadgeIcon from '@mui/icons-material/Badge';
import SchoolIcon from '@mui/icons-material/School';

// Import the parent actions
import { getAllParents } from '../../../redux/studentsRelated/parentHandle';

const ViewStudents = () => {
    const navigate = useNavigate()
    const params = useParams()
    const dispatch = useDispatch()
    
    // Use the parent state
    const { parentsList, loading, error } = useSelector((state) => state.parent);
    const { currentUser } = useSelector(state => state.user)
    
    const parentID = params.id

    const [parentData, setParentData] = useState({
        name: '',
        rollNum: '',
        sclassName: '',
        child: null,
        students: []
    });

    const handleBack = () => {
        navigate(-1);
    };

    useEffect(() => {
        // Fetch all parents and then find the specific one
        dispatch(getAllParents(currentUser._id, "parent"));
    }, [currentUser._id, dispatch])

    useEffect(() => {
        if (parentsList && parentsList.length > 0) {
            const foundParent = parentsList.find(parent => parent._id === parentID);
            if (foundParent) {
                setParentData({
                    name: foundParent.name || '',
                    rollNum: foundParent.rollNum || '',
                    sclassName: foundParent.sclassName?.sclassName || 'Not assigned',
                    child: foundParent.child || null,
                    students: foundParent.students || []
                });
            }
        }
    }, [parentsList, parentID]);

    if (error) {
        console.log(error)
        return (
            <Container sx={{ mt: 4 }}>
                <Typography color="error">Error loading parent details: {error}</Typography>
            </Container>
        )
    }

    return (
        <>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <Container sx={{ mt: 4, mb: 4 }}>
                    <Box sx={{ mb: 2 }}>
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={handleBack}
                            variant="outlined"
                            sx={{ mb: 2 }}
                        >
                            Back to Parents
                        </Button>
                    </Box>
                    
                    <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4 }}>
                        Parent Details
                    </Typography>

                    <Card elevation={3} sx={{ maxWidth: 800, margin: '0 auto', p: 3 }}>
                        <CardContent>
                            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                <PersonIcon color="primary" />
                                Parent Information
                            </Typography>
                            <Divider sx={{ mb: 3 }} />

                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="h6" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <PersonIcon />
                                            Full Name
                                        </Typography>
                                        <Typography variant="body1" sx={{ ml: 3 }}>
                                            {parentData.name || 'N/A'}
                                        </Typography>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="h6" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <BadgeIcon />
                                            Roll Number
                                        </Typography>
                                        <Typography variant="body1" sx={{ ml: 3 }}>
                                            {parentData.rollNum || 'N/A'}
                                        </Typography>
                                    </Box>
                                </Grid>

                                <Grid item xs={12}>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="h6" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <SchoolIcon />
                                            Class
                                        </Typography>
                                        <Typography variant="body1" sx={{ ml: 3 }}>
                                            {parentData.sclassName}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>

                            {/* Display single child if exists */}
                            {parentData.child && (
                                <Box sx={{ mt: 4 }}>
                                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                        <FamilyRestroomIcon color="primary" />
                                        Assigned Child
                                    </Typography>
                                    <Divider sx={{ mb: 3 }} />
                                    <Card variant="outlined" sx={{ p: 2 }}>
                                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                            {parentData.child.name || 'N/A'}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                            <Chip 
                                                label={`Roll: ${parentData.child.rollNum || 'N/A'}`} 
                                                size="small" 
                                                variant="outlined" 
                                            />
                                            <Chip 
                                                label={`Class: ${parentData.sclassName || 'N/A'}`} 
                                                size="small" 
                                                variant="outlined" 
                                            />
                                        </Box>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => navigate(`/Admin/students/student/${parentData.child._id}`)}
                                        >
                                            View Student Details
                                        </Button>
                                    </Card>
                                </Box>
                            )}

                            {/* Display multiple students if exists */}
                            {parentData.students && parentData.students.length > 0 && (
                                <Box sx={{ mt: 4 }}>
                                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                        <FamilyRestroomIcon color="primary" />
                                        Students ({parentData.students.length})
                                    </Typography>
                                    <Divider sx={{ mb: 3 }} />
                                    <Grid container spacing={2}>
                                        {parentData.students.map((student, index) => (
                                            <Grid item xs={12} sm={6} key={index}>
                                                <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                                                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                                        {student.name}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                                                        <Chip 
                                                            label={`Roll: ${student.rollNum}`} 
                                                            size="small" 
                                                            variant="outlined" 
                                                        />
                                                        <Chip 
                                                            label={`Class: ${student.sclassName?.sclassName || 'N/A'}`} 
                                                            size="small" 
                                                            variant="outlined" 
                                                        />
                                                    </Box>
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        onClick={() => navigate(`/Admin/students/student/${student._id}`)}
                                                    >
                                                        View Student Details
                                                    </Button>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            )}

                            {!parentData.child && (!parentData.students || parentData.students.length === 0) && (
                                <Box sx={{ textAlign: 'center', py: 3 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        No students assigned to this parent
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Container>
            )}
        </>
    )
}

export default ViewStudents