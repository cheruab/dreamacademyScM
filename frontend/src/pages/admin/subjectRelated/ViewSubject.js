import React, { useEffect, useState } from 'react'
import { getClassStudents, getSubjectDetails } from '../../../redux/sclassRelated/sclassHandle';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
    Box, 
    Container, 
    Typography, 
    Paper, 
    Grid, 
    Card, 
    CardContent, 
    Divider, 
    Avatar,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    ListItemSecondaryAction,
    Chip,
    Badge,
    IconButton,
    Tooltip
} from '@mui/material';
import { BlueButton, GreenButton, PurpleButton } from '../../../components/buttonStyles';

import SubjectIcon from '@mui/icons-material/Subject';
import ClassIcon from '@mui/icons-material/Class';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import NumbersIcon from '@mui/icons-material/Numbers';
import TimelineIcon from '@mui/icons-material/Timeline';
import GroupIcon from '@mui/icons-material/Group';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';

const ViewSubject = () => {
  const navigate = useNavigate()
  const params = useParams()
  const dispatch = useDispatch();
  const { subloading, subjectDetails, sclassStudents, getresponse, error } = useSelector((state) => state.sclass);

  const { classID, subjectID } = params

  useEffect(() => {
    dispatch(getSubjectDetails(subjectID, "Subject"));
    dispatch(getClassStudents(classID));
  }, [dispatch, subjectID, classID]);

  if (error) {
    console.log(error)
  }

  const SubjectDetailsCard = () => {
    const numberOfStudents = sclassStudents.length;

    return (
      <Card elevation={3} sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white', 
          p: 3,
          textAlign: 'center'
        }}>
          <Avatar sx={{ 
            width: 80, 
            height: 80, 
            bgcolor: 'rgba(255,255,255,0.2)', 
            mx: 'auto', 
            mb: 2,
            fontSize: '2rem'
          }}>
            <SubjectIcon sx={{ fontSize: '2rem' }} />
          </Avatar>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {subjectDetails && subjectDetails.subName}
          </Typography>
          <Chip 
            label={subjectDetails && subjectDetails.subCode} 
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1rem'
            }} 
          />
        </Box>

        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#e3f2fd', color: '#1976d2', mr: 2 }}>
                  <NumbersIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="primary">
                    Subject Code
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {subjectDetails && subjectDetails.subCode}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#f3e5f5', color: '#7b1fa2', mr: 2 }}>
                  <TimelineIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="primary">
                    Total Sessions
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {subjectDetails && subjectDetails.sessions} Sessions
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#e8f5e8', color: '#2e7d32', mr: 2 }}>
                  <ClassIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="primary">
                    Class Name
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {subjectDetails && subjectDetails.sclassName && subjectDetails.sclassName.sclassName}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#fff3e0', color: '#f57c00', mr: 2 }}>
                  <GroupIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="primary">
                    Total Students
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {numberOfStudents} Students
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {subjectDetails && subjectDetails.description && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" color="primary" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {subjectDetails.description}
                </Typography>
              </Grid>
            )}

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#e1f5fe', color: '#0277bd', mr: 2 }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="primary">
                      Subject Teacher
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {subjectDetails && subjectDetails.teacher 
                        ? subjectDetails.teacher.name 
                        : "No teacher assigned"
                      }
                    </Typography>
                  </Box>
                </Box>
                {!(subjectDetails && subjectDetails.teacher) && (
                  <GreenButton 
                    variant="contained"
                    startIcon={<PersonIcon />}
                    onClick={() => navigate("/Admin/teachers/addteacher/" + subjectDetails._id)}
                    sx={{ borderRadius: 2 }}
                  >
                    Add Subject Teacher
                  </GreenButton>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  }

  const StudentsSection = () => {
    return (
      <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ 
          background: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)', 
          color: 'white', 
          p: 3 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white', 
                mr: 2,
                width: 50,
                height: 50
              }}>
                <GroupIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  Class Students
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {sclassStudents.length} students enrolled in this subject
                </Typography>
              </Box>
            </Box>
            <Badge badgeContent={sclassStudents.length} color="secondary" sx={{ mr: 2 }}>
              <SchoolIcon sx={{ fontSize: '2rem' }} />
            </Badge>
          </Box>
        </Box>

        <CardContent sx={{ p: 0 }}>
          {getresponse ? (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Avatar sx={{ 
                width: 100, 
                height: 100, 
                bgcolor: '#f5f5f5', 
                mx: 'auto', 
                mb: 2 
              }}>
                <GroupIcon sx={{ fontSize: '3rem', color: '#999' }} />
              </Avatar>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Students Found
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                This class doesn't have any students yet. Add students to get started.
              </Typography>
              <GreenButton
                variant="contained"
                startIcon={<GroupIcon />}
                onClick={() => navigate("/Admin/class/addstudents/" + classID)}
                sx={{ borderRadius: 2, px: 3, py: 1 }}
              >
                Add Students to Class
              </GreenButton>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {sclassStudents.map((student, index) => (
                <React.Fragment key={student._id}>
                  <ListItem sx={{ py: 2, px: 3, '&:hover': { bgcolor: '#f5f5f5' } }}>
                    <ListItemAvatar>
                      <Avatar sx={{ 
                        bgcolor: index % 2 === 0 ? '#e3f2fd' : '#f3e5f5',
                        color: index % 2 === 0 ? '#1976d2' : '#7b1fa2'
                      }}>
                        {student.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="h6" color="primary">
                          {student.name}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Chip 
                            label={`Roll: ${student.rollNum}`} 
                            size="small" 
                            color="primary"
                            variant="outlined"
                          />
                          <Chip 
                            label="Active" 
                            size="small" 
                            color="success"
                            icon={<CheckCircleIcon />}
                          />
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Student Profile">
                          <IconButton 
                            color="primary"
                            onClick={() => navigate("/Admin/students/student/" + student._id)}
                            sx={{ 
                              bgcolor: '#e3f2fd',
                              '&:hover': { bgcolor: '#bbdefb' }
                            }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Take Attendance">
                          <IconButton
                            color="secondary"
                            onClick={() => navigate(`/Admin/subject/student/attendance/${student._id}/${subjectID}`)}
                            sx={{ 
                              bgcolor: '#f3e5f5',
                              '&:hover': { bgcolor: '#e1bee7' }
                            }}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Assign Marks">
                          <IconButton
                            color="success"
                            onClick={() => navigate(`/Admin/subject/student/marks/${student._id}/${subjectID}`)}
                            sx={{ 
                              bgcolor: '#e8f5e8',
                              '&:hover': { bgcolor: '#c8e6c9' }
                            }}
                          >
                            <AssignmentIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < sclassStudents.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {subloading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '50vh' 
        }}>
          <Typography variant="h6" color="text.secondary">
            Loading subject details...
          </Typography>
        </Box>
      ) : (
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography 
              variant="h3" 
              fontWeight="bold" 
              color="primary" 
              gutterBottom
              sx={{ 
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Subject Overview
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Complete details and student information for this subject
            </Typography>
          </Box>

          <SubjectDetailsCard />
          
          <Box sx={{ mt: 4 }}>
            <StudentsSection />
          </Box>
        </Container>
      )}
    </>
  )
}

export default ViewSubject