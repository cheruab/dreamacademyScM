import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import { 
    Container, 
    Paper, 
    Table, 
    TableBody, 
    TableHead, 
    Typography, 
    Divider,
    Grid,
    Card,
    CardContent,
    Box,
    Chip,
    CircularProgress,
    Alert,
    TableRow,
    TableCell
} from '@mui/material';
import CustomBarChart from '../../components/CustomBarChart';

import BookIcon from '@mui/icons-material/Book';
import GradeIcon from '@mui/icons-material/Grade';
import QuizIcon from '@mui/icons-material/Quiz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ClassIcon from '@mui/icons-material/Class';
import DescriptionIcon from '@mui/icons-material/Description';
import { StyledTableCell, StyledTableRow } from '../../components/styles';
import axios from 'axios';

const StudentSubjectss = ({ studentId, child }) => {
    const dispatch = useDispatch();

    const { userDetails, loading } = useSelector((state) => state.user);

    const [subjectMarks, setSubjectMarks] = useState([]);
    const [enrolledSubjects, setEnrolledSubjects] = useState([]);
    const [examResults, setExamResults] = useState([]);
    const [subjectsLoading, setSubjectsLoading] = useState(true);
    const [examResultsLoading, setExamResultsLoading] = useState(true);
    const [subjectsError, setSubjectsError] = useState('');

    // Fetch student details (for marks)
    useEffect(() => {
        if (studentId) {
            dispatch(getUserDetails(studentId, "Student"));
        }
    }, [dispatch, studentId]);

    // When userDetails changes, update marks
    useEffect(() => {
        if (userDetails) {
            setSubjectMarks(userDetails.examResult || []);
        }
    }, [userDetails]);

    // Fetch enrolled subjects by student's class ID
    useEffect(() => {
        const fetchSubjectsByClass = async () => {
            if (!child || !child.sclassName) {
                console.log("No class information available for child:", child);
                setSubjectsError("No class information available");
                setSubjectsLoading(false);
                return;
            }

            try {
                setSubjectsLoading(true);
                setSubjectsError('');
                
                // Get class ID
                let classId;
                
                if (Array.isArray(child.sclassName)) {
                    const classObj = child.sclassName[0];
                    if (classObj && typeof classObj === 'object') {
                        classId = classObj._id || classObj.id;
                    } else if (typeof classObj === 'string') {
                        classId = classObj;
                    }
                } else if (typeof child.sclassName === 'string') {
                    classId = child.sclassName;
                } else if (child.sclassName && typeof child.sclassName === 'object') {
                    classId = child.sclassName._id || child.sclassName.id;
                }
                
                console.log("Extracted classId:", classId);
                
                if (!classId) {
                    setSubjectsError("Class ID not found");
                    setSubjectsLoading(false);
                    return;
                }
                
                const classSubjectsResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}/ClassSubjects/${classId}`);
                console.log("ClassSubjects response:", classSubjectsResponse.data);
                
                if (classSubjectsResponse.data && classSubjectsResponse.data.message) {
                    setEnrolledSubjects([]);
                    setSubjectsError(classSubjectsResponse.data.message);
                } else if (Array.isArray(classSubjectsResponse.data)) {
                    console.log("Subjects found:", classSubjectsResponse.data.length);
                    setEnrolledSubjects(classSubjectsResponse.data);
                } else {
                    setEnrolledSubjects([]);
                    setSubjectsError("Unexpected response format");
                }
            } catch (err) {
                console.error("Failed to fetch subjects by class:", err);
                
                if (err.response?.status === 404) {
                    setSubjectsError("No subjects found for this class");
                } else if (err.response?.data?.message) {
                    setSubjectsError(err.response.data.message);
                } else {
                    setSubjectsError("Failed to fetch subjects. Please try again later.");
                }
                setEnrolledSubjects([]);
            } finally {
                setSubjectsLoading(false);
            }
        };
        
        fetchSubjectsByClass();
    }, [child]);

    // Fetch child's exam results
    useEffect(() => {
        const fetchExamResults = async () => {
            if (!child || !child._id) {
                setExamResultsLoading(false);
                return;
            }

            try {
                setExamResultsLoading(true);
                console.log("Fetching exam results for student:", child._id);
                
                const examResultsResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}/student/${child._id}/exam-results`);
                console.log("Exam results response:", examResultsResponse.data);
                
                if (examResultsResponse.data.success && examResultsResponse.data.examResults) {
                    setExamResults(examResultsResponse.data.examResults);
                } else {
                    setExamResults([]);
                }
            } catch (err) {
                console.error("Failed to fetch exam results:", err);
                setExamResults([]);
            } finally {
                setExamResultsLoading(false);
            }
        };

        fetchExamResults();
    }, [child]);

    const renderSubjectsSection = () => (
        <Container maxWidth="md" sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <BookIcon sx={{ fontSize: 30, color: '#1976d2', mr: 2 }} />
                <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    color: '#1976d2',
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
                }}>
                    📚 {child?.name}'s Subjects
                </Typography>
            </Box>

            {subjectsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>Loading subjects...</Typography>
                </Box>
            ) : subjectsError ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                    {subjectsError}
                </Alert>
            ) : enrolledSubjects.length === 0 ? (
                <Card sx={{ textAlign: 'center', py: 4 }}>
                    <CardContent>
                        <BookIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                            No subjects found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Subjects will appear here once assigned to the class
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                <Grid container spacing={3}>
                    {enrolledSubjects.map((subject, index) => (
                        <Grid item xs={12} sm={6} md={4} key={subject._id || index}>
                            <Card sx={{ 
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                border: '1px solid rgba(0, 0, 0, 0.08)',
                                borderRadius: 3,
                                overflow: 'hidden',
                                position: 'relative',
                                '&:hover': {
                                    transform: 'translateY(-8px) scale(1.02)',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                                    borderColor: '#1976d2',
                                },
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '4px',
                                    background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
                                }
                            }}>
                                <CardContent sx={{ 
                                    flexGrow: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    p: 3,
                                    pt: 4
                                }}>
                                    {/* Header Section */}
                                    <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'flex-start', 
                                        mb: 2,
                                        gap: 1.5
                                    }}>
                                        <Box sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            bgcolor: 'rgba(25, 118, 210, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            minWidth: 48,
                                            height: 48
                                        }}>
                                            <BookIcon sx={{ 
                                                color: '#1976d2', 
                                                fontSize: 24 
                                            }} />
                                        </Box>
                                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                            <Typography variant="h6" sx={{ 
                                                fontWeight: 600,
                                                fontSize: '1.1rem',
                                                lineHeight: 1.3,
                                                color: '#1a202c',
                                                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                                                mb: 0.5,
                                                wordBreak: 'break-word'
                                            }}>
                                                {subject.subName || subject.name || 'Subject'}
                                            </Typography>
                                            
                                            {subject.subCode && (
                                                <Chip 
                                                    label={subject.subCode}
                                                    size="small" 
                                                    sx={{ 
                                                        height: 24,
                                                        fontSize: '0.75rem',
                                                        fontWeight: 500,
                                                        bgcolor: '#e3f2fd',
                                                        color: '#1565c0',
                                                        '& .MuiChip-label': {
                                                            px: 1
                                                        }
                                                    }} 
                                                />
                                            )}
                                        </Box>
                                    </Box>
                                    
                                    {/* Sessions Info */}
                                    {subject.sessions && (
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            mb: 2,
                                            p: 1.5,
                                            borderRadius: 1.5,
                                            bgcolor: 'rgba(76, 175, 80, 0.08)',
                                            border: '1px solid rgba(76, 175, 80, 0.2)'
                                        }}>
                                            <ClassIcon sx={{ 
                                                color: '#388e3c', 
                                                fontSize: 18,
                                                mr: 1 
                                            }} />
                                            <Typography variant="body2" sx={{
                                                color: '#2e7d32',
                                                fontWeight: 500,
                                                fontSize: '0.875rem',
                                                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
                                            }}>
                                                {subject.sessions} Total Sessions
                                            </Typography>
                                        </Box>
                                    )}
                                    
                                    {/* Description Section */}
                                    {subject.description && (
                                        <Box sx={{ 
                                            flexGrow: 1,
                                            display: 'flex',
                                            flexDirection: 'column'
                                        }}>
                                            <Box sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center',
                                                mb: 1.5 
                                            }}>
                                                <DescriptionIcon sx={{ 
                                                    color: '#6b7280', 
                                                    fontSize: 18,
                                                    mr: 1 
                                                }} />
                                                <Typography variant="subtitle2" sx={{
                                                    color: '#4b5563',
                                                    fontWeight: 600,
                                                    fontSize: '0.875rem',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
                                                }}>
                                                    Description
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" sx={{
                                                color: '#374151',
                                                lineHeight: 1.6,
                                                fontSize: '0.9rem',
                                                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                                                fontWeight: 400,
                                                textAlign: 'justify',
                                                hyphens: 'auto',
                                                wordBreak: 'break-word',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 4,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                position: 'relative',
                                                '&::after': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    right: 0,
                                                    width: '30%',
                                                    height: '1.4em',
                                                    background: 'linear-gradient(to right, transparent, #ffffff 70%)'
                                                }
                                            }}>
                                                {subject.description}
                                            </Typography>
                                        </Box>
                                    )}
                                    
                                    {/* Empty state for cards without description */}
                                    {!subject.description && (
                                        <Box sx={{ 
                                            flexGrow: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            py: 2,
                                            borderRadius: 1.5,
                                            bgcolor: 'rgba(0, 0, 0, 0.02)',
                                            border: '1px dashed rgba(0, 0, 0, 0.1)'
                                        }}>
                                            <Typography variant="body2" sx={{
                                                color: '#9ca3af',
                                                fontStyle: 'italic',
                                                fontSize: '0.85rem',
                                                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
                                            }}>
                                                No description available
                                            </Typography>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
            
            <Divider sx={{ mt: 4 }} />
        </Container>
    );

    const renderExamResultsSection = () => (
        <Container maxWidth="md" sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <QuizIcon sx={{ fontSize: 30, color: '#9c27b0', mr: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                    🎯 {child?.name}'s Exam Results
                </Typography>
            </Box>

            {examResultsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>Loading exam results...</Typography>
                </Box>
            ) : examResults.length === 0 ? (
                <Card sx={{ textAlign: 'center', py: 4 }}>
                    <CardContent>
                        <QuizIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                            No exam results available
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Exam results will appear here once your child completes exams
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                <Grid container spacing={3}>
                    {examResults.map((result, index) => (
                        <Grid item xs={12} sm={6} md={4} key={result._id || index}>
                            <Card sx={{ 
                                height: '100%',
                                transition: 'all 0.3s ease',
                                borderLeft: `4px solid ${result.percentage >= 60 ? '#4caf50' : '#f44336'}`,
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                                }
                            }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            {result.examId?.title || 'Exam'}
                                        </Typography>
                                        <Chip
                                            icon={result.percentage >= 60 ? <CheckCircleIcon /> : <GradeIcon />}
                                            label={result.percentage >= 60 ? 'Passed' : 'Failed'}
                                            color={result.percentage >= 60 ? 'success' : 'error'}
                                            size="small"
                                        />
                                    </Box>
                                    
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="h4" sx={{ 
                                            color: result.percentage >= 60 ? '#4caf50' : '#f44336',
                                            fontWeight: 'bold',
                                            textAlign: 'center'
                                        }}>
                                            {result.percentage}%
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                                            {result.score}/{result.totalQuestions} Questions Correct
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                        <Chip 
                                            label={`${result.totalQuestions} Questions`}
                                            size="small"
                                            variant="outlined"
                                            color="primary"
                                        />
                                        {result.timeSpent && (
                                            <Chip 
                                                icon={<AccessTimeIcon />}
                                                label={`${Math.round(result.timeSpent / 60)}min`}
                                                size="small"
                                                variant="outlined"
                                                color="info"
                                            />
                                        )}
                                    </Box>
                                    
                                    {result.submittedAt && (
                                        <Typography variant="caption" color="text.secondary">
                                            Completed: {new Date(result.submittedAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </Typography>
                                    )}
                                    
                                    {result.examId?.subject && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            Subject: {result.examId.subject.subName || result.examId.subject}
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );

    const renderTableSection = () => (
        <Container maxWidth="md" sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <GradeIcon sx={{ fontSize: 30, color: '#ff9800', mr: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                    📊 Subject Marks (Traditional)
                </Typography>
            </Box> 
            
            {subjectMarks.length === 0 ? (
                <Card sx={{ textAlign: 'center', py: 4 }}>
                    <CardContent>
                        <GradeIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                            No marks available yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Traditional marks will appear here once published
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <Table>
                        <TableHead>
                            <StyledTableRow>
                                <StyledTableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                    Subject
                                </StyledTableCell>
                                <StyledTableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                    Marks Obtained
                                </StyledTableCell>
                            </StyledTableRow>
                        </TableHead>
                        <TableBody>
                            {subjectMarks.map((result, index) => {
                                if (!result.subName || result.marksObtained === undefined) {
                                    return null;
                                }
                                return (
                                    <StyledTableRow key={index}>
                                        <StyledTableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <BookIcon sx={{ mr: 1, color: '#1976d2' }} />
                                                {result.subName?.subName || result.subName?.name || "Unknown Subject"}
                                            </Box>
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <Chip 
                                                label={result.marksObtained}
                                                color={result.marksObtained >= 60 ? 'success' : result.marksObtained >= 40 ? 'warning' : 'error'}
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                        </StyledTableCell>
                                    </StyledTableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Paper>
            )}
        </Container>
    );

    const renderChartSection = () => (
        <Container maxWidth="md" sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <GradeIcon sx={{ fontSize: 30, color: '#9c27b0', mr: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                    📈 Marks Chart (Traditional)
                </Typography>
            </Box>
            
            {subjectMarks.length === 0 ? (
                <Card sx={{ textAlign: 'center', py: 4 }}>
                    <CardContent>
                        <GradeIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                            No data to display chart
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Chart will appear here once traditional marks are available
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                    <CustomBarChart chartData={subjectMarks} dataKey="marksObtained" />
                </Paper>
            )}
        </Container>
    );

    return (
        <>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>Loading student data...</Typography>
                </Box>
            ) : (
                <div>
                    {/* Render all sections in a single scrollable page */}
                    {renderSubjectsSection()}
                    {renderExamResultsSection()}
                    {subjectMarks && subjectMarks.length > 0 && (
                        <>
                            {renderTableSection()}
                            {renderChartSection()}
                        </>
                    )}
                </div>
            )}
        </>
    );
};

export default StudentSubjectss;