import React from "react";
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Divider, 
  Box,
  Avatar,
  Chip,
  Paper
} from "@mui/material";
import StudentSubjectss from "./StudentSubjectss";
import ViewStdAttendances from "./ViewStdAttendances";
import StudentComplains from "./StudentComplains";
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import BookIcon from '@mui/icons-material/Book';
import EventIcon from '@mui/icons-material/Event';
import FeedbackIcon from '@mui/icons-material/Feedback';

const StudentHomePages = ({ child, parent }) => {


  const getAttendanceStats = () => {
    if (!child?.attendance || child.attendance.length === 0) {
      return { total: 0, present: 0, absent: 0, percentage: 0 };
    }

    const total = child.attendance.length;
    const present = child.attendance.filter(record => record.status === 'Present').length;
    const absent = total - present;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, percentage };
  };

  const getMarksStats = () => {
    if (!child?.examResult || child.examResult.length === 0) {
      return { subjects: 0, totalMarks: 0, averageMarks: 0 };
    }

    const subjects = child.examResult.length;
    const totalMarks = child.examResult.reduce((sum, result) => sum + (result.marksObtained || 0), 0);
    const averageMarks = subjects > 0 ? Math.round(totalMarks / subjects) : 0;

    return { subjects, totalMarks, averageMarks };
  };

  const attendanceStats = getAttendanceStats();
  const marksStats = getMarksStats();

  return (
    <div
      style={{
        padding: "20px 15px",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >


      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ 
            borderRadius: 3, 
            background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
            color: 'white',
            height: '100%'
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <EventIcon sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {attendanceStats.percentage}%
              </Typography>
              <Typography variant="body1">
                Attendance Rate
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {attendanceStats.present} present / {attendanceStats.total} total
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ 
            borderRadius: 3,
            background: 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)',
            color: 'white',
            height: '100%'
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <BookIcon sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {marksStats.averageMarks}
              </Typography>
              <Typography variant="body1">
                Average Marks
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Across {marksStats.subjects} subjects
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ 
            borderRadius: 3,
            background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
            color: 'white',
            height: '100%'
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <FeedbackIcon sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                Active
              </Typography>
              <Typography variant="body1">
                Academic Status
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Enrolled & Learning
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Sections */}
      <Grid container spacing={4} direction="column">
        {/* Subjects Section */}
        <Grid item xs={12}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              backgroundColor: "#ffffff",
              width: { xs: "100%", sm: "95%", md: "85%" },
              margin: "0 auto",
              overflow: 'hidden'
            }}
          >
            <Box sx={{
              background: 'linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)',
              color: 'white',
              p: 2
            }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: "bold", display: 'flex', alignItems: 'center' }}
              >
                📚 Academic Subjects
              </Typography>
            </Box>
            <CardContent>
              <StudentSubjectss studentId={child._id} child={child} />
            </CardContent>
          </Card>
        </Grid>

        {/* Attendance Section */}
        <Grid item xs={12}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              backgroundColor: "#ffffff",
              width: { xs: "100%", sm: "95%", md: "85%" },
              margin: "0 auto",
              overflow: 'hidden'
            }}
          >
            <Box sx={{
              background: 'linear-gradient(90deg, #4caf50 0%, #81c784 100%)',
              color: 'white',
              p: 2
            }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: "bold", display: 'flex', alignItems: 'center' }}
              >
                📊 Attendance Overview
              </Typography>
            </Box>
            <CardContent>
              <ViewStdAttendances childData={child} />
            </CardContent>
          </Card>
        </Grid>

        {/* Complaints Section */}
        <Grid item xs={12}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              backgroundColor: "#ffffff",
              width: { xs: "100%", sm: "95%", md: "85%" },
              margin: "0 auto",
              overflow: 'hidden'
            }}
          >
            <Box sx={{
              background: 'linear-gradient(90deg, #f44336 0%, #ef5350 100%)',
              color: 'white',
              p: 2
            }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: "bold", display: 'flex', alignItems: 'center' }}
              >
                💬 Communication Center
              </Typography>
            </Box>
            <CardContent>
              <StudentComplains child={child} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Footer Spacing */}
      <Box sx={{ height: 100 }} />
    </div>
  );
};
export default StudentHomePages;