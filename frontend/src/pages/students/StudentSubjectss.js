import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import { 
    BottomNavigation, 
    BottomNavigationAction, 
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

import InsertChartIcon from '@mui/icons-material/InsertChart';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import TableChartIcon from '@mui/icons-material/TableChart';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import BookIcon from '@mui/icons-material/Book';
import GradeIcon from '@mui/icons-material/Grade';
import QuizIcon from '@mui/icons-material/Quiz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { StyledTableCell, StyledTableRow } from '../../components/styles';
import axios from 'axios';

const StudentSubjectss = ({ studentId, child }) => {
    const dispatch = useDispatch();

    const { userDetails, loading } = useSelector((state) => state.user);

    const [subjectMarks, setSubjectMarks] = useState([]);
    const [enrolledSubjects, setEnrolledSubjects] = useState([]);
    const [examResults, setExamResults] = useState([]); // New state for exam results
    const [selectedSection, setSelectedSection] = useState('subjects');
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
                
                // Get class ID - handle different possible structures including arrays
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
                
                // Fetch exam results for the student
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

    const handleSectionChange = (event, newSection) => {
        setSelectedSection(newSection);
    };

    const renderSubjectsSection = () => (
        <Container maxWidth="md" sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <BookIcon sx={{ fontSize: 30, color: '#1976d2', mr: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
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
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                                }
                            }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <BookIcon sx={{ color: '#4caf50', mr: 1 }} />
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            {subject.subName || subject.name || 'Subject'}
                                        </Typography>
                                    </Box>
                                    
                                    {subject.subCode && (
                                        <Chip 
                                            label={`Code: ${subject.subCode}`} 
                                            size="small" 
                                            sx={{ mb: 1, bgcolor: '#e3f2fd' }} 
                                        />
                                    )}
                                    
                                    {subject.sessions && (
                                        <Typography variant="body2" color="text.secondary">
                                            📅 {subject.sessions} sessions
                                        </Typography>
                                    )}
                                    
                                    {subject.description && (
                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                            {subject.description}
                                        </Typography>
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
        <Container maxWidth="md">
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
        <Container maxWidth="md">
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <InsertChartIcon sx={{ fontSize: 30, color: '#9c27b0', mr: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                    📈 Marks Chart (Traditional)
                </Typography>
            </Box>
            
            {subjectMarks.length === 0 ? (
                <Card sx={{ textAlign: 'center', py: 4 }}>
                    <CardContent>
                        <InsertChartIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
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
                    {/* Always render subjects first */}
                    {selectedSection === 'subjects' && renderSubjectsSection()}

                    {/* Show exam results section */}
                    {selectedSection === 'examResults' && renderExamResultsSection()}

                    {/* Then render traditional marks sections if present */}
                    {subjectMarks && subjectMarks.length > 0 && (
                        <>
                            {selectedSection === 'table' && renderTableSection()}
                            {selectedSection === 'chart' && renderChartSection()}
                        </>
                    )}

                    {/* Bottom Navigation */}
                    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
                        <BottomNavigation value={selectedSection} onChange={handleSectionChange} showLabels>
                            <BottomNavigationAction
                                label="Subjects"
                                value="subjects"
                                icon={<BookIcon />}
                            />
                            <BottomNavigationAction
                                label="Exam Results"
                                value="examResults"
                                icon={<QuizIcon />}
                            />
                            {subjectMarks && subjectMarks.length > 0 && (
                                <>
                                    <BottomNavigationAction
                                        label="Traditional Marks"
                                        value="table"
                                        icon={selectedSection === 'table' ? <TableChartIcon /> : <TableChartOutlinedIcon />}
                                    />
                                    <BottomNavigationAction
                                        label="Marks Chart"
                                        value="chart"
                                        icon={selectedSection === 'chart' ? <InsertChartIcon /> : <InsertChartOutlinedIcon />}
                                    />
                                </>
                            )}
                        </BottomNavigation>
                    </Paper>
                </div>
            )}
        </>
    );
};

export default StudentSubjectss;
