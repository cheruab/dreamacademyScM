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
    Paper
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCardIcon from '@mui/icons-material/AddCard';
import PersonIcon from '@mui/icons-material/Person';
import BookIcon from '@mui/icons-material/Book';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
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

  const [showPopup, setShowPopup] = useState(false);
  const [message] = useState("Delete is currently disabled.");

  const deleteHandler = () => {
    setShowPopup(true);
  };

  const ClassCard = ({ classData }) => (
    <Card 
      elevation={3} 
      sx={{ 
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6
        },
        border: '1px solid #e0e0e0',
        borderRadius: 2
      }}
    >
      <CardContent>
        {/* Class Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
            {classData.sclassName}
          </Typography>
          <Chip 
            label={classData.assignedStudent ? 'Assigned' : 'Unassigned'} 
            color={classData.assignedStudent ? 'success' : 'warning'}
            size="small"
          />
        </Box>

        {/* Student Information */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <PersonIcon fontSize="small" />
            Student
          </Typography>
          {classData.assignedStudent ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                {classData.assignedStudent.name?.charAt(0).toUpperCase() || 'S'}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight="500">
                  {classData.assignedStudent.name || 'Unknown Student'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
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

        {/* Class ID for debugging (remove in production) */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Class ID: {classData._id?.slice(-6)} | Students in DB: {classData.studentCount}
          </Typography>
        </Box>

        {/* Subjects Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <BookIcon fontSize="small" />
            Subjects ({classData.subjectCount})
          </Typography>
          {classData.subjects.length > 0 ? (
            <Box sx={{ ml: 2 }}>
              {classData.subjects.slice(0, 3).map((subject, index) => (
                <Chip 
                  key={index}
                  label={subject.subCode || subject.subName}
                  size="small" 
                  variant="outlined"
                  sx={{ mr: 0.5, mb: 0.5 }}
                />
              ))}
              {classData.subjects.length > 3 && (
                <Chip 
                  label={`+${classData.subjects.length - 3} more`}
                  size="small" 
                  variant="outlined"
                  color="primary"
                  sx={{ mr: 0.5, mb: 0.5 }}
                />
              )}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2, fontStyle: 'italic' }}>
              No subjects assigned
            </Typography>
          )}
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <BlueButton
            variant="contained"
            onClick={() => navigate(`/Admin/classes/class/${classData._id}`)}
            startIcon={<VisibilityIcon />}
            size="small"
            fullWidth
          >
            View Details
          </BlueButton>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading || loadingDetails) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div>Loading classes...</div>
      </Box>
    );
  }

  return (
    <>
      <Container>
        <HeaderSection>
          <Typography variant="h4" gutterBottom>
            Student Classes Management
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Each class is designed for one student with personalized subjects and assignments.
          </Typography>
        </HeaderSection>

        <ActionBar>
          <GreenButton
            variant="contained"
            startIcon={<AddCardIcon />}
            onClick={() => navigate("/Admin/addclass")}
            size="large"
          >
            Create New Student Class
          </GreenButton>
        </ActionBar>

        {getresponse ? (
          <EmptyState>
            <Typography variant="h5" gutterBottom>
              No classes created yet
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Create your first student class to get started with personalized learning management.
            </Typography>
            <GreenButton 
              onClick={() => navigate("/Admin/addclass")}
              variant="contained"
              size="large"
              startIcon={<AddCardIcon />}
            >
              Create First Class
            </GreenButton>
          </EmptyState>
        ) : (
          <>
            {/* Summary Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <StatCard elevation={2}>
                  <Typography variant="h4" color="primary">{classesWithDetails.length}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Classes</Typography>
                </StatCard>
              </Grid>
              <Grid item xs={12} md={4}>
                <StatCard elevation={2}>
                  <Typography variant="h4" color="success.main">
                    {classesWithDetails.filter(c => c.assignedStudent).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Classes with Students</Typography>
                </StatCard>
              </Grid>
              <Grid item xs={12} md={4}>
                <StatCard elevation={2}>
                  <Typography variant="h4" color="info.main">
                    {classesWithDetails.reduce((sum, c) => sum + c.subjectCount, 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Total Subjects Assigned</Typography>
                </StatCard>
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
        
        <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
      </Container>
    </>
  );
};

export default ShowClasses;

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
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  flex-wrap: wrap;
  justify-content: flex-start;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const EmptyState = styled(Paper)`
  text-align: center;
  padding: 4rem 2rem;
  background-color: #ffffff;
  border-radius: 12px;
  border: 2px dashed #ddd;
  margin: 2rem 0;
`;

const StatCard = styled(Paper)`
  padding: 1.5rem;
  text-align: center;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 12px;
`;
