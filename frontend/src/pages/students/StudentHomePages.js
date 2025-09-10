import React, { useState, useEffect } from "react";
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
import axios from 'axios';

const StudentHomePages = ({ child, parent }) => {
  const [examResults, setExamResults] = useState([]);
  const [examResultsLoading, setExamResultsLoading] = useState(true);

  // Fetch child's exam results for average calculation
  useEffect(() => {
    const fetchExamResults = async () => {
      if (!child || !child._id) {
        setExamResultsLoading(false);
        return;
      }

      try {
        setExamResultsLoading(true);
        console.log("Fetching exam results for average calculation:", child._id);
        
        const examResultsResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}/student/${child._id}/exam-results`);
        console.log("Exam results response for average:", examResultsResponse.data);
        
        if (examResultsResponse.data.success && examResultsResponse.data.examResults) {
          setExamResults(examResultsResponse.data.examResults);
        } else {
          setExamResults([]);
        }
      } catch (err) {
        console.error("Failed to fetch exam results for average:", err);
        setExamResults([]);
      } finally {
        setExamResultsLoading(false);
      }
    };

    fetchExamResults();
  }, [child]);

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
    // Use exam results instead of traditional marks for average calculation
    if (!examResults || examResults.length === 0) {
      return { subjects: 0, totalMarks: 0, averageMarks: 0, examCount: 0 };
    }

    const examCount = examResults.length;
    const totalPercentage = examResults.reduce((sum, result) => sum + (result.percentage || 0), 0);
    const averageMarks = examCount > 0 ? Math.round(totalPercentage / examCount) : 0;
    
    // Get unique subjects from exam results
    const uniqueSubjects = new Set();
    examResults.forEach(result => {
      if (result.examId?.subject) {
        const subjectName = result.examId.subject.subName || result.examId.subject.name || result.examId.subject;
        uniqueSubjects.add(subjectName);
      }
    });

    return { 
      subjects: uniqueSubjects.size, 
      totalMarks: totalPercentage, 
      averageMarks, 
      examCount 
    };
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
                {examResultsLoading ? '...' : `${marksStats.averageMarks}%`}
              </Typography>
              <Typography variant="body1">
                Average Score
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {examResultsLoading 
                  ? 'Loading...' 
                  : marksStats.examCount > 0 
                    ? `Based on ${marksStats.examCount} exam${marksStats.examCount !== 1 ? 's' : ''}`
                    : 'No exams completed'
                }
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
                {examResultsLoading ? '...' : (marksStats.averageMarks >= 60 ? 'Good' : marksStats.averageMarks > 0 ? 'Fair' : 'N/A')}
              </Typography>
              <Typography variant="body1">
                Performance Level
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {examResultsLoading 
                  ? 'Calculating...' 
                  : marksStats.averageMarks >= 60 
                    ? 'Above average performance' 
                    : marksStats.averageMarks > 0 
                      ? 'Room for improvement' 
                      : 'No data available'
                }
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