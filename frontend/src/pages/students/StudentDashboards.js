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
    CircularProgress
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // NEW: State for results
    const [results, setResults] = useState([]);
    const [resultsLoading, setResultsLoading] = useState(false);

    const toggleDrawer = () => {
        setOpen(!open);
    };

    useEffect(() => {
        const fetchChildData = async () => {
            try {
                setLoading(true);
                const parentId = localStorage.getItem('parentId');
                console.log("Retrieved parentId from localStorage:", parentId);

                if (!parentId) {
                    setError('Parent ID not found in local storage');
                    setLoading(false);
                    return;
                }

                const response = await axios.get(`http://localhost:5000/Parents/${parentId}/children`);
                setChildData(response.data);
                setError('');
            } catch (err) {
                setError('Failed to fetch child data');
                console.error('Error details:', err.response?.data || err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchChildData();
    }, []);

    useEffect(() => {
        const fetchResults = async () => {
            const parentId = localStorage.getItem('parentId');
            if (!parentId) return;

            try {
                setResultsLoading(true);
                const res = await axios.get(`http://localhost:5000/api/parent/results/${parentId}`);
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
                height: '100vh'
            }}>
                <CircularProgress />
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
                height: '100vh'
            }}>
                <Typography variant="h6">
                    No child assigned to your account
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
                            {childData.name}'s Dashboard
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

                    {/* NEW: Results Section */}
<Box sx={{ mb: 3, p: 3, background: "#e3f2fd", borderRadius: "12px" }}>
  <Typography variant="h6" gutterBottom>Uploaded Results</Typography>

  {resultsLoading ? (
    <CircularProgress size={24} />
  ) : results.length === 0 ? (
    <Typography>No results uploaded yet.</Typography>
  ) : (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
      {results.map(result => (
        <Button
          key={result._id}
          variant="contained"
          href={`http://localhost:5000${result.fileUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            justifyContent: "space-between",
            borderRadius: "10px",
            padding: "12px 20px",
            textTransform: "none",
            fontWeight: "bold",
            fontSize: "0.95rem",
            backgroundColor: "#4caf50", // green background
            color: "#fff",
            "&:hover": {
              backgroundColor: "#388e3c",
              boxShadow: "0px 4px 12px rgba(0,0,0,0.2)"
            }
          }}
        >
          <span>📄 Click here to see the exam result: {result.originalName || "View Result"}</span>
          <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>
            {new Date(result.uploadedAt).toLocaleDateString()} {new Date(result.uploadedAt).toLocaleTimeString()}
          </span>
        </Button>
      ))}
    </Box>
  )}
</Box>



                    <Routes>
                        <Route path="/" element={<StudentHomePages child={childData} />} />
                        <Route path='*' element={<Navigate to="/" />} />
                        <Route path="/Parent/dashboard" element={<StudentHomePages child={childData} />} />
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
