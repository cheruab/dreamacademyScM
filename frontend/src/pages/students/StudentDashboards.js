import { useState, useEffect } from 'react';
import {
    CssBaseline,
    Button,
    Box,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    CircularProgress,
    Card,
    CardContent,
    Grid,
    Avatar,
    Chip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import StudentSideBars from './StudentSideBars';
import { Navigate, Route, Routes } from 'react-router-dom';
import StudentHomePages from './StudentHomePages';
import StudentProfiles from './StudentProfiles';
import StudentSubjectss from './StudentSubjectss';
import StudentComplains from './StudentComplains';
import Logout from '../Logout';
import AccountMenu from '../../components/AccountMenu';
import { AppBar, Drawer } from '../../components/styles';
import axios from 'axios';
import ViewStdAttendances from './ViewStdAttendances';



const StudentDashboards = () => {
    const [open, setOpen] = useState(true);
    const [childData, setChildData] = useState(null);
    const [parentData, setParentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Results state
    const [results, setResults] = useState([]);
    const [resultsLoading, setResultsLoading] = useState(false);

    const toggleDrawer = () => {
        setOpen(!open);
    };

    // Fetch parent and child data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const parentId = localStorage.getItem('parentId');
                console.log("Retrieved parentId from localStorage:", parentId);

                if (!parentId) {
                    setError('Parent ID not found in local storage');
                    setLoading(false);
                    return;
                }

                // Fetch parent details first
                const parentResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}/Parent/${parentId}`);
                console.log("Parent data:", parentResponse.data);
                setParentData(parentResponse.data);

                // Then fetch child data
                const childResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}/parents/${parentId}/children`);
                console.log("Child data:", childResponse.data);
                setChildData(childResponse.data);
                
                setError('');
            } catch (err) {
                setError('Failed to fetch data');
                console.error('Error details:', err.response?.data || err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Fetch results
    useEffect(() => {
        const fetchResults = async () => {
            const parentId = localStorage.getItem('parentId');
            if (!parentId) return;

            try {
                setResultsLoading(true);
                const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/parent/results/${parentId}`);
                console.log("Results from backend:", res.data);
                setResults(res.data);
            } catch (err) {
                console.error("Error fetching results:", err);
            } finally {
                setResultsLoading(false);
            }
        };

        fetchResults();
    }, []);

    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column'
            }}>
                <CircularProgress size={50} />
                <Typography sx={{ mt: 2 }}>Loading dashboard...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column'
            }}>
                <Typography color="error" variant="h6">
                    {error}
                </Typography>
                <Typography>
                    Please try again later or contact support
                </Typography>
            </Box>
        );
    }

    if (!childData) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column'
            }}>
                <SchoolIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6">
                    No child assigned to your account
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Please contact the school administration
                </Typography>
            </Box>
        );
    }

    return (
        <>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppBar open={open} position='absolute'>
                    <Toolbar sx={{ pr: '24px' }}>
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="open drawer"
                            onClick={toggleDrawer}
                            sx={{
                                marginRight: '36px',
                                ...(open && { display: 'none' }),
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography
                            component="h1"
                            variant="h6"
                            color="inherit"
                            noWrap
                            sx={{ flexGrow: 1 }}
                        >
                            {parentData?.name ? `${parentData.name}'s` : 'Parent'} Dashboard
                        </Typography>
                        <AccountMenu />
                    </Toolbar>
                </AppBar>
                <Drawer variant="permanent" open={open} sx={open ? styles.drawerStyled : styles.hideDrawer}>
                    <Toolbar sx={styles.toolBarStyled}>
                        <IconButton onClick={toggleDrawer}>
                            <ChevronLeftIcon />
                        </IconButton>
                    </Toolbar>
                    <Divider />
                    <List component="nav">
                        <StudentSideBars />
                    </List>
                </Drawer>
                <Box component="main" sx={styles.boxStyled}>
                    <Toolbar />

                    {/* Welcome Section */}
                    <Box sx={{ mb: 3 }}>
                        <Card sx={{ 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                            color: 'white',
                            borderRadius: 3,
                            p: 1
                        }}>
                            <CardContent>
                                <Grid container alignItems="center" spacing={3}>
                                    <Grid item>
                                        <Avatar sx={{ 
                                            bgcolor: 'rgba(255,255,255,0.2)', 
                                            width: 70, 
                                            height: 70 
                                        }}>
                                            <PersonIcon sx={{ fontSize: 40 }} />
                                        </Avatar>
                                    </Grid>
                                    <Grid item xs>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                                            Welcome back, {parentData?.name || 'Dear Parent'}! 👋
                                        </Typography>
                                        <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                                            Here's everything about your child <strong>{childData.name}</strong>
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                            <Chip 
                                                icon={<SchoolIcon />} 
                                                label={childData.school?.schoolName || 'School'} 
                                                sx={{ 
                                                    bgcolor: 'rgba(255,255,255,0.2)', 
                                                    color: 'white',
                                                    fontWeight: 'bold'
                                                }} 
                                            />
                                            <Chip 
                                                icon={<ClassIcon />} 
                                                label={childData.sclassName?.sclassName || 'Class'} 
                                                sx={{ 
                                                    bgcolor: 'rgba(255,255,255,0.2)', 
                                                    color: 'white',
                                                    fontWeight: 'bold'
                                                }} 
                                            />
                                            <Chip 
                                                label={`Roll No: ${childData.rollNum}`} 
                                                sx={{ 
                                                    bgcolor: 'rgba(255,255,255,0.2)', 
                                                    color: 'white',
                                                    fontWeight: 'bold'
                                                }} 
                                            />
                                        </Box>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Box>

                    {/* Results Section */}
                    <Box sx={{ mb: 3 }}>
                        <Card sx={{
                            borderRadius: 3,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                        📊 Uploaded Results
                                    </Typography>
                                    {resultsLoading && <CircularProgress size={20} sx={{ ml: 2 }} />}
                                </Box>

                                {resultsLoading ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <CircularProgress size={24} />
                                        <Typography>Loading results...</Typography>
                                    </Box>
                                ) : results.length === 0 ? (
                                    <Box sx={{ 
                                        textAlign: 'center', 
                                        py: 4,
                                        color: 'text.secondary'
                                    }}>
                                        <Typography variant="h6">📄 No results uploaded yet</Typography>
                                        <Typography>Results will appear here once uploaded by the school</Typography>
                                    </Box>
                                ) : (
                                    <Grid container spacing={2}>
                                        {results.map((result, index) => (
                                            <Grid item xs={12} sm={6} md={4} key={result._id}>
                                                <Card sx={{
                                                    borderRadius: 2,
                                                    transition: 'all 0.3s ease',
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                                                    }
                                                }}>
                                                    <CardContent sx={{ p: 2 }}>
                                                        <Button
                                                            fullWidth
                                                            variant="contained"
                                                            href={`${process.env.REACT_APP_BASE_URL}${result.fileUrl}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            sx={{
                                                                borderRadius: 2,
                                                                py: 2,
                                                                textTransform: 'none',
                                                                fontSize: '0.95rem',
                                                                background: 'linear-gradient(45deg, #4caf50 30%, #81c784 90%)',
                                                                '&:hover': {
                                                                    background: 'linear-gradient(45deg, #388e3c 30%, #66bb6a 90%)',
                                                                }
                                                            }}
                                                        >
                                                            <Box sx={{ textAlign: 'left', width: '100%' }}>
                                                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                                    📄 {result.originalName || `Result ${index + 1}`}
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                                                    {new Date(result.uploadedAt).toLocaleDateString('en-US', {
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        day: 'numeric'
                                                                    })}
                                                                </Typography>
                                                            </Box>
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                )}
                            </CardContent>
                        </Card>
                    </Box>

                    <Routes>
                        <Route path="/" element={<StudentHomePages child={childData} parent={parentData} />} />
                        <Route path='*' element={<Navigate to="/" />} />
                        <Route path="/Parent/dashboard" element={<StudentHomePages child={childData} parent={parentData} />} />
                        <Route path="/Parent/child-profile" element={<StudentProfiles child={childData} />} />
                        <Route path="/Parent/child-subjects" element={<StudentSubjectss studentId={childData._id} child={childData} />} />
                        <Route path="/Parent/child-attendance" element={<ViewStdAttendances childData={childData} />} />
                        <Route path="/Parent/complain" element={<StudentComplains child={childData} />} />
                        <Route path="/logout" element={<Logout />} />
                    </Routes>
                </Box>
            </Box>
        </>
    );
}

export default StudentDashboards;

const styles = {
    boxStyled: {
        backgroundColor: (theme) =>
            theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
        flexGrow: 1,
        height: '100vh',
        overflow: 'auto',
    },
    toolBarStyled: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        px: [1],
    },
    drawerStyled: {
        display: "flex"
    },
    hideDrawer: {
        display: 'flex',
        '@media (max-width: 600px)': {
            display: 'none',
        },
    },
};
