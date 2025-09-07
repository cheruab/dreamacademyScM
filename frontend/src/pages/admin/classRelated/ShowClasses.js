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
    TextField
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCardIcon from '@mui/icons-material/AddCard';
import PersonIcon from '@mui/icons-material/Person';
import BookIcon from '@mui/icons-material/Book';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WarningIcon from '@mui/icons-material/Warning';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import { GreenButton, RedButton, BlueButton } from '../../../components/buttonStyles';
import styled from 'styled-components';
import Popup from '../../../components/Popup';

const ShowClasses = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { sclassesList, loading, getresponse } = useSelector((state) => state.sclass);
  const { currentUser } = useSelector(state => state.user);
  
  // Enhanced state for detailed class information
  const [classesWithDetails, setClassesWithDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // Delete confirmation dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState('');

  const adminID = currentUser._id;

  useEffect(() => {
    dispatch(getAllSclasses(adminID, "Sclass"));
  }, [adminID, dispatch]);

  // Fetch detailed information for each class
  useEffect(() => {
    const fetchClassDetails = async () => {
      if (sclassesList && sclassesList.length > 0) {
        setLoadingDetails(true);
        try {
          const detailedClasses = await Promise.all(
            sclassesList.map(async (sclass) => {
              try {
                // Fetch students for this class - try multiple endpoints
                let students = [];
                
                // First, try the specific class students endpoint
                try {
                  const studentsResponse = await fetch(`${process.env.REACT_APP_BASE_URL}/Sclass/Students/${sclass._id}`);
                  if (studentsResponse.ok) {
                    const studentsData = await studentsResponse.json();
                    students = Array.isArray(studentsData) ? studentsData : [];
                  }
                } catch (error) {
                  console.log('First endpoint failed, trying alternative...');
                }

                // If no students found, try alternative endpoint
                if (students.length === 0) {
                  try {
                    const allStudentsResponse = await fetch(`${process.env.REACT_APP_BASE_URL}/Students/${adminID}`);
                    if (allStudentsResponse.ok) {
                      const allStudents = await allStudentsResponse.json();
                      // Filter students that belong to this class
                      students = Array.isArray(allStudents) 
                        ? allStudents.filter(student => 
                            student.sclassName === sclass._id || 
                            student.sclassName?._id === sclass._id
                          )
                        : [];
                    }
                  } catch (error) {
                    console.log('Alternative endpoint also failed');
                  }
                }

                // Fetch subjects for this class
                let subjects = [];
                try {
                  const subjectsResponse = await fetch(`${process.env.REACT_APP_BASE_URL}/ClassSubjects/${sclass._id}`);
                  if (subjectsResponse.ok) {
                    const subjectsData = await subjectsResponse.json();
                    subjects = Array.isArray(subjectsData) ? subjectsData : [];
                  }
                } catch (error) {
                  console.log('Error fetching subjects for class:', sclass._id);
                }
                
                console.log(`Class ${sclass.sclassName} - Students found:`, students.length, students);
                
                return {
                  ...sclass,
                  students: students,
                  subjects: subjects,
                  studentCount: students.length,
                  subjectCount: subjects.length,
                  assignedStudent: students.length > 0 ? students[0] : null
                };
              } catch (error) {
                console.error(`Error fetching details for class ${sclass._id}:`, error);
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
          
          console.log('All classes with details:', detailedClasses);
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
      // Remove the deleted class from the state immediately
      setClassesWithDetails(prevClasses => 
        prevClasses.filter(classItem => classItem._id !== classToDelete._id)
      );
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
    <StyledCard elevation={4}>
      <CardGradient>
        <CardContent>
          {/* Class Header */}
          <CardHeader>
            <ClassTitle variant="h6" gutterBottom>
              {classData.sclassName}
            </ClassTitle>
            <StatusChip 
              label={classData.assignedStudent ? 'Assigned' : 'Unassigned'} 
              color={classData.assignedStudent ? 'success' : 'warning'}
              size="small"
            />
          </CardHeader>

          {/* Student Information */}
          <InfoSection>
            <InfoLabel>
              <PersonIcon fontSize="small" />
              Student
            </InfoLabel>
            {classData.assignedStudent ? (
              <StudentInfo>
                <StyledAvatar>
                  {classData.assignedStudent.name?.charAt(0).toUpperCase() || 'S'}
                </StyledAvatar>
                <StudentDetails>
                  <StudentName>
                    {classData.assignedStudent.name || 'Unknown Student'}
                  </StudentName>
                  <StudentRoll>
                    Roll: {classData.assignedStudent.rollNum || 'N/A'}
                  </StudentRoll>
                </StudentDetails>
              </StudentInfo>
            ) : (
              <EmptyText>
                No student assigned
              </EmptyText>
            )}
          </InfoSection>

          {/* Class ID for debugging (remove in production) */}
          <DebugInfo>
            Class ID: {classData._id?.slice(-6)} | Students in DB: {classData.studentCount}
          </DebugInfo>

          {/* Subjects Information */}
          <InfoSection>
            <InfoLabel>
              <BookIcon fontSize="small" />
              Subjects ({classData.subjectCount})
            </InfoLabel>
            {classData.subjects.length > 0 ? (
              <SubjectsContainer>
                {classData.subjects.slice(0, 3).map((subject, index) => (
                  <SubjectChip 
                    key={index}
                    label={subject.subCode || subject.subName}
                    size="small" 
                    variant="outlined"
                  />
                ))}
                {classData.subjects.length > 3 && (
                  <SubjectChip 
                    label={`+${classData.subjects.length - 3} more`}
                    size="small" 
                    variant="outlined"
                    color="primary"
                  />
                )}
              </SubjectsContainer>
            ) : (
              <EmptyText>
                No subjects assigned
              </EmptyText>
            )}
          </InfoSection>

          {/* Action Buttons */}
          <ActionButtonsContainer>
            <BlueButton
              variant="contained"
              onClick={() => navigate(`/Admin/classes/class/${classData._id}`)}
              startIcon={<VisibilityIcon />}
              size="small"
            >
              View Details
            </BlueButton>
            <RedButton
              variant="contained"
              onClick={() => initiateDelete(classData)}
              startIcon={<DeleteIcon />}
              size="small"
            >
              Delete
            </RedButton>
          </ActionButtonsContainer>
        </CardContent>
      </CardGradient>
    </StyledCard>
  );

  if (loading || loadingDetails) {
    return (
      <LoadingContainer>
        <Typography variant="h6" color="white">Loading classes...</Typography>
      </LoadingContainer>
    );
  }

  return (
    <>
      <Container>
        <HeaderSection>
          <MainTitle variant="h4" gutterBottom>
            Student Classes Management
          </MainTitle>
          <SubTitle variant="h6" gutterBottom>
            Each class is designed for one student with personalized subjects and assignments.
          </SubTitle>
        </HeaderSection>

        <ActionBarStyled>
          <GreenButton
            variant="contained"
            startIcon={<AddCardIcon />}
            onClick={() => navigate("/Admin/addclass")}
            size="large"
          >
            Create New Student Class
          </GreenButton>
        </ActionBarStyled>

        {getresponse ? (
          <EmptyStateStyled>
            <Typography variant="h5" gutterBottom color="white">
              No classes created yet
            </Typography>
            <Typography variant="body1" gutterBottom sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Create your first student class to get started with personalized learning management.
            </Typography>
            <GreenButton 
              onClick={() => navigate("/Admin/addclass")}
              variant="contained"
              size="large"
              startIcon={<AddCardIcon />}
              sx={{ mt: 2 }}
            >
              Create First Class
            </GreenButton>
          </EmptyStateStyled>
        ) : (
          <>
            {/* Summary Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <StatCardStyled elevation={3}>
                  <StatNumber variant="h4">{classesWithDetails.length}</StatNumber>
                  <StatLabel variant="body2">Total Classes</StatLabel>
                </StatCardStyled>
              </Grid>
              <Grid item xs={12} md={4}>
                <StatCardStyled elevation={3}>
                  <StatNumber variant="h4" sx={{ color: '#10b981' }}>
                    {classesWithDetails.filter(c => c.assignedStudent).length}
                  </StatNumber>
                  <StatLabel variant="body2">Classes with Students</StatLabel>
                </StatCardStyled>
              </Grid>
              <Grid item xs={12} md={4}>
                <StatCardStyled elevation={3}>
                  <StatNumber variant="h4" sx={{ color: '#98b2dbff' }}>
                    {classesWithDetails.reduce((sum, c) => sum + c.subjectCount, 0)}
                  </StatNumber>
                  <StatLabel variant="body2">Total Subjects Assigned</StatLabel>
                </StatCardStyled>
              </Grid>
            </Grid>

            {/* Classes Grid */}
            <Grid container spacing={3}>
              {classesWithDetails.map((classData) => (
                <Grid item xs={12} sm={6} md={4} key={classData._id}>
                  <ClassCard classData={classData} />
                </Grid>
              ))}
            </Grid>
          </>
        )}

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
              Delete Class
            </Button>
          </DialogActions>
        </Dialog>
        
        <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
      </Container>
    </>
  );
};

export default ShowClasses;

// Enhanced Styled Components with better colors and fonts
const Container = styled(Box)`
  padding: 2rem;
  background: linear-gradient(135deg, #7ea586ff 0%, #7ca56fff 50%, #77a17cff 100%);
  min-height: 100vh;
  font-family: 'Inter', 'Segoe UI', 'Roboto', sans-serif;
`;

const HeaderSection = styled(Box)`
  margin-bottom: 2rem;
  text-align: center;
`;

const MainTitle = styled(Typography)`
  color: white;
  font-weight: 700;
  font-size: 2.5rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  margin-bottom: 0.5rem;
`;

const SubTitle = styled(Typography)`
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
  font-size: 1.1rem;
`;

const ActionBarStyled = styled(Box)`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  flex-wrap: wrap;
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const EmptyStateStyled = styled(Paper)`
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin: 2rem 0;
`;

const StatCardStyled = styled(Paper)`
  padding: 2rem 1.5rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.2s ease-in-out;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const StatNumber = styled(Typography)`
  font-weight: 700;
  color: #6366f1;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled(Typography)`
  color: #64748b;
  font-weight: 500;
`;

const StyledCard = styled(Card)`
  height: 100%;
  transition: all 0.3s ease-in-out;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  }
`;

const CardGradient = styled(Box)`
  background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%);
  backdrop-filter: blur(10px);
  height: 100%;
`;

const CardHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
`;

const ClassTitle = styled(Typography)`
  font-weight: 700;
  color: #1e293b;
  font-size: 1.3rem;
`;

const StatusChip = styled(Chip)`
  font-weight: 600;
  font-size: 0.75rem;
`;

const InfoSection = styled(Box)`
  margin-bottom: 1.5rem;
`;

const InfoLabel = styled(Typography)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #475569;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
`;

const StudentInfo = styled(Box)`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: 1.5rem;
`;

const StyledAvatar = styled(Avatar)`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  font-weight: 600;
`;

const StudentDetails = styled(Box)`
  flex: 1;
`;

const StudentName = styled(Typography)`
  font-weight: 600;
  color: #1e293b;
  font-size: 0.95rem;
`;

const StudentRoll = styled(Typography)`
  color: #64748b;
  font-size: 0.8rem;
`;

const EmptyText = styled(Typography)`
  margin-left: 1.5rem;
  font-style: italic;
  color: #94a3b8;
  font-size: 0.9rem;
`;

const DebugInfo = styled(Typography)`
  color: #94a3b8;
  font-size: 0.75rem;
  margin-bottom: 1rem;
`;

const SubjectsContainer = styled(Box)`
  margin-left: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const SubjectChip = styled(Chip)`
  font-size: 0.75rem;
  height: 24px;
`;

const ActionButtonsContainer = styled(Box)`
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
`;

const LoadingContainer = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
`;