import { useEffect, useState } from 'react';
import { 
    Box, 
    Typography, 
    Card, 
    CardContent, 
    Grid, 
    Chip, 
    Button,
    Avatar,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCardIcon from '@mui/icons-material/AddCard';
import PersonIcon from '@mui/icons-material/Person';
import BookIcon from '@mui/icons-material/Book';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WarningIcon from '@mui/icons-material/Warning';
import SchoolIcon from '@mui/icons-material/School';
import GroupIcon from '@mui/icons-material/Group';
import SubjectIcon from '@mui/icons-material/Subject';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import { GreenButton, RedButton, BlueButton } from '../../../components/buttonStyles';
import styled from 'styled-components';
import Popup from '../../../components/Popup';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Modern professional theme matching StudentSubjects
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
      light: '#60a5fa',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7c3aed',
      light: '#a78bfa',
      dark: '#5b21b6',
      contrastText: '#ffffff',
    },
    success: {
      main: '#059669',
      light: '#34d399',
      dark: '#047857',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#d97706',
      light: '#fbbf24',
      dark: '#92400e',
      contrastText: '#ffffff',
    },
    error: {
      main: '#dc2626',
      light: '#f87171',
      dark: '#991b1b',
      contrastText: '#ffffff',
    },
    info: {
      main: '#0891b2',
      light: '#22d3ee',
      dark: '#0e7490',
      contrastText: '#ffffff',
    },
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '2rem',
      letterSpacing: '-0.02em',
      color: '#0f172a',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
      letterSpacing: '-0.01em',
      color: '#1e293b',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
      color: '#334155',
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
      color: '#475569',
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#64748b',
    },
    body2: {
      fontSize: '0.8rem',
      lineHeight: 1.5,
      color: '#64748b',
    },
    button: {
      fontWeight: 500,
      fontSize: '0.875rem',
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          '&:hover': {
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontSize: '0.75rem',
          fontWeight: 500,
          height: 28,
        },
      },
    },
  },
});

const ShowClasses = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { sclassesList, loading, getresponse } = useSelector((state) => state.sclass);
  const { currentUser } = useSelector(state => state.user);
  
  const [classesWithDetails, setClassesWithDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState('');

  const adminID = currentUser._id;

  useEffect(() => {
    dispatch(getAllSclasses(adminID, "Sclass"));
  }, [adminID, dispatch]);

  useEffect(() => {
    const fetchClassDetails = async () => {
      if (sclassesList && sclassesList.length > 0) {
        setLoadingDetails(true);
        try {
          const detailedClasses = await Promise.all(
            sclassesList.map(async (sclass) => {
              try {
                let students = [];
                try {
                  const studentsResponse = await fetch(`${process.env.REACT_APP_BASE_URL}/Sclass/Students/${sclass._id}`);
                  if (studentsResponse.ok) {
                    const studentsData = await studentsResponse.json();
                    students = Array.isArray(studentsData) ? studentsData : [];
                  }
                } catch {}

                if (students.length === 0) {
                  try {
                    const allStudentsResponse = await fetch(`${process.env.REACT_APP_BASE_URL}/Students/${adminID}`);
                    if (allStudentsResponse.ok) {
                      const allStudents = await allStudentsResponse.json();
                      students = Array.isArray(allStudents) 
                        ? allStudents.filter(student => 
                            student.sclassName === sclass._id || 
                            student.sclassName?._id === sclass._id
                          )
                        : [];
                    }
                  } catch {}
                }

                let subjects = [];
                try {
                  const subjectsResponse = await fetch(`${process.env.REACT_APP_BASE_URL}/ClassSubjects/${sclass._id}`);
                  if (subjectsResponse.ok) {
                    const subjectsData = await subjectsResponse.json();
                    subjects = Array.isArray(subjectsData) ? subjectsData : [];
                  }
                } catch {}
                
                return {
                  ...sclass,
                  students,
                  subjects,
                  studentCount: students.length,
                  subjectCount: subjects.length,
                  assignedStudent: students.length > 0 ? students[0] : null
                };
              } catch {
                return {
                  ...sclass,
                  students: [],
                  subjects: [],
                  studentCount: 0,
                  subjectCount: 0,
                  assignedStudent: null
                };
              }
            })
          );
          setClassesWithDetails(detailedClasses);
        } catch (error) {
          console.error('Error fetching class details:', error);
        } finally {
          setLoadingDetails(false);
        }
      }
    };

    fetchClassDetails();
  }, [sclassesList, adminID]);

  const initiateDelete = (classData) => {
    setClassToDelete(classData);
    setDeleteConfirmText('');
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteConfirmText.toLowerCase() === 'delete' && classToDelete) {
      dispatch(deleteUser(classToDelete._id, "Sclass"));
      setClassesWithDetails(prev => prev.filter(c => c._id !== classToDelete._id));
      setMessage(`Class "${classToDelete.sclassName}" has been deleted successfully.`);
      setShowPopup(true);
    }
    setDeleteDialogOpen(false);
    setClassToDelete(null);
    setDeleteConfirmText('');
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setClassToDelete(null);
    setDeleteConfirmText('');
  };

  const ClassCard = ({ classData }) => (
    <Card sx={{ 
      height: '100%', 
      borderRadius: 3,
      overflow: 'hidden',
      border: '1px solid',
      borderColor: 'grey.200',
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        borderColor: 'primary.main',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        transform: 'translateY(-4px)'
      }
    }}>
      <Box sx={{ 
        p: 3,
        background: 'linear-gradient(135deg, #22773eff 0%, #12993fff 100%)',
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
            {classData.sclassName}
          </Typography>
          <Chip 
            label={classData.assignedStudent ? 'Assigned' : 'Unassigned'} 
            color={classData.assignedStudent ? 'success' : 'warning'}
            size="small"
            sx={{ 
              color: 'white',
              fontWeight: 600,
              backgroundColor: classData.assignedStudent ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
              border: '1px solid',
              borderColor: classData.assignedStudent ? 'rgba(34, 197, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)'
            }}
          />
        </Box>
      </Box>

      <CardContent sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <PersonIcon fontSize="small" sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle1" color="text.primary" fontWeight="500">
              Student
            </Typography>
          </Box>
          {classData.assignedStudent ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 2 }}>
              <Avatar sx={{ 
                width: 40, 
                height: 40, 
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                fontWeight: 600 
              }}>
                {classData.assignedStudent.name?.charAt(0).toUpperCase() || 'S'}
              </Avatar>
              <Box>
                <Typography variant="body1" fontWeight="600" color="text.primary">
                  {classData.assignedStudent.name || 'Unknown Student'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Roll: {classData.assignedStudent.rollNum || 'N/A'}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2, fontStyle: 'italic' }}>
              No student assigned
            </Typography>
          )}
        </Box>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <BookIcon fontSize="small" sx={{ color: 'info.main' }} />
            <Typography variant="subtitle1" color="text.primary" fontWeight="500">
              Subjects ({classData.subjectCount})
            </Typography>
          </Box>
          {classData.subjects.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, ml: 2 }}>
              {classData.subjects.slice(0, 3).map((subject, i) => (
                <Chip 
                  key={i} 
                  label={subject.subCode || subject.subName} 
                  size="small" 
                  variant="outlined"
                  sx={{ 
                    fontSize: '0.75rem',
                    borderColor: 'info.main',
                    color: 'info.main'
                  }}
                />
              ))}
              {classData.subjects.length > 3 && (
                <Chip 
                  label={`+${classData.subjects.length - 3} more`}
                  size="small" 
                  variant="outlined"
                  sx={{ 
                    fontSize: '0.75rem',
                    borderColor: 'primary.main',
                    color: 'primary.main'
                  }}
                />
              )}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2, fontStyle: 'italic' }}>
              No subjects assigned
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="contained"
            onClick={() => navigate(`/Admin/classes/class/${classData._id}`)}
            startIcon={<VisibilityIcon />}
            size="small"
            sx={{ 
              flex: 1,
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
              }
            }}
          >
            View Details
          </Button>
          <Button
            variant="contained"
            onClick={() => initiateDelete(classData)}
            startIcon={<DeleteIcon />}
            size="small"
            sx={{ 
              flex: 1,
              background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)',
              }
            }}
          >
            Delete
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading || loadingDetails) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '60vh',
          gap: 2
        }}>
          <CircularProgress size={40} thickness={4} />
          <Typography variant="body1" color="text.secondary">Loading classes...</Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        py: 4
      }}>
        <Box sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          {/* Header Section */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h4" sx={{ 
              mb: 2,
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Student Classes Management
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Each class is designed for one student with personalized subjects and assignments.
            </Typography>
          </Box>

          {/* Action Bar */}
          <Paper elevation={0} sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            borderColor: 'grey.200',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <Button
              variant="contained"
              startIcon={<AddCardIcon />}
              onClick={() => navigate("/Admin/addclass")}
              size="large"
              sx={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
                }
              }}
            >
              Create New Student Class
            </Button>
          </Paper>

          {getresponse ? (
            <Paper elevation={0} sx={{ 
              p: 6, 
              textAlign: 'center',
              borderRadius: 3,
              border: '2px dashed',
              borderColor: 'grey.300',
              backgroundColor: 'grey.50'
            }}>
              <SchoolIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No classes created yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create your first student class to get started with personalized learning management.
              </Typography>
              <Button
                onClick={() => navigate("/Admin/addclass")}
                variant="contained"
                size="large"
                startIcon={<AddCardIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
                  }
                }}
              >
                Create First Class
              </Button>
            </Paper>
          ) : (
            <>
              {/* Stats Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                  <Paper elevation={0} sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
                    border: '1px solid',
                    borderColor: 'primary.100'
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      <SchoolIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                      {classesWithDetails.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Classes
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper elevation={0} sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                    border: '1px solid',
                    borderColor: 'success.100'
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      <GroupIcon sx={{ fontSize: 40, color: 'success.main' }} />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main', mb: 1 }}>
                      {classesWithDetails.filter(c => c.assignedStudent).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Classes with Students
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper elevation={0} sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                    border: '1px solid',
                    borderColor: 'secondary.100'
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      <SubjectIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main', mb: 1 }}>
                      {classesWithDetails.reduce((sum, c) => sum + c.subjectCount, 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Subjects Assigned
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Classes Grid */}
              <Grid container spacing={3}>
                {classesWithDetails.map((c) => (
                  <Grid item xs={12} sm={6} md={4} key={c._id}>
                    <ClassCard classData={c} />
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          <Dialog open={deleteDialogOpen} onClose={cancelDelete} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon color="error" />
              Confirm Delete
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Are you sure you want to delete the class "{classToDelete?.sclassName}"?
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
              />
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={cancelDelete} color="primary">Cancel</Button>
              <Button 
                onClick={confirmDelete} 
                color="error"
                variant="contained"
                disabled={deleteConfirmText.toLowerCase() !== 'delete'}
              >
                Delete Class
              </Button>
            </DialogActions>
          </Dialog>

          <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default ShowClasses;