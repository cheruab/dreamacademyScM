import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Paper, Table, TableBody, TableContainer,
    TableHead, TablePagination, Button, Box, IconButton,
    Chip, Stack, Typography, Collapse, Avatar, Alert,
    Grid, Card, CardContent
} from '@mui/material';
import { StyledTableCell, StyledTableRow } from '../../components/styles';
import { BlueButton } from '../../components/buttonStyles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import SubjectIcon from '@mui/icons-material/Subject';
import BookIcon from '@mui/icons-material/Book';
import ClassIcon from '@mui/icons-material/Class';
import { getAllStudents } from '../../redux/studentRelated/studentHandle';

const TeacherStudentsList = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [teacherData, setTeacherData] = useState(null);
    const [myStudents, setMyStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);

    useEffect(() => {
        fetchTeacherDataAndStudents();
    }, [currentUser]);

    const fetchTeacherDataAndStudents = async () => {
        try {
            setLoading(true);
            setError(null);

            // First, get the current teacher's detailed information
            const teacherResponse = await fetch(`${process.env.REACT_APP_BASE_URL}/Teacher/${currentUser._id}`);
            const teacherData = await teacherResponse.json();

            if (teacherData.message) {
                setError("Teacher data not found");
                return;
            }

            console.log("Raw teacher data:", teacherData);

            // If assignments exist but subjects are not populated, we need to manually populate them
            if (teacherData.assignments && teacherData.assignments.length > 0) {
                for (let assignment of teacherData.assignments) {
                    // Check if subject is just an ID
                    if (assignment.subject && typeof assignment.subject === 'string') {
                        try {
                            const subjectResponse = await fetch(`${process.env.REACT_APP_BASE_URL}/Subject/${assignment.subject}`);
                            const subjectData = await subjectResponse.json();
                            if (subjectData && !subjectData.message) {
                                assignment.subject = subjectData;
                            }
                        } catch (error) {
                            console.error('Error fetching subject:', error);
                        }
                    }

                    // Check if class is just an ID
                    if (assignment.class && typeof assignment.class === 'string') {
                        try {
                            const classResponse = await fetch(`${process.env.REACT_APP_BASE_URL}/Sclass/${assignment.class}`);
                            const classData = await classResponse.json();
                            if (classData && !classData.message) {
                                assignment.class = classData;
                            }
                        } catch (error) {
                            console.error('Error fetching class:', error);
                        }
                    }
                }
            }

            console.log("Enhanced teacher data:", teacherData);
            setTeacherData(teacherData);

            // If teacher has assignments, get students from those classes
            if (teacherData.assignments && teacherData.assignments.length > 0) {
                // Get all students from the school
                dispatch(getAllStudents(currentUser.school._id));
                
                // We'll filter students in the useEffect below after studentsList is populated
            } else if (teacherData.teachSclass) {
                // Fallback to single class assignment
                dispatch(getAllStudents(currentUser.school._id));
            } else {
                setMyStudents([]);
                setError("You are not assigned to any classes yet");
            }

        } catch (err) {
            console.error('Error fetching teacher data:', err);
            setError("Error loading teacher information");
        } finally {
            setLoading(false);
        }
    };

    // Listen for studentsList changes and filter for teacher's students
    const { studentsList } = useSelector((state) => state.student);

    useEffect(() => {
        if (studentsList && teacherData && studentsList.length > 0) {
            filterMyStudents();
        }
    }, [studentsList, teacherData]);

    const filterMyStudents = () => {
        if (!studentsList || !teacherData) return;

        let filteredStudents = [];

        if (teacherData.assignments && teacherData.assignments.length > 0) {
            // Use assignments array - more accurate
            const myClassIds = teacherData.assignments.map(assignment => 
                assignment.class._id || assignment.class
            );

            filteredStudents = studentsList.filter(student => {
                if (!student.sclassName) return false;
                
                const studentClassId = student.sclassName._id || student.sclassName;
                return myClassIds.includes(studentClassId);
            });
        } else if (teacherData.teachSclass) {
            // Fallback to single class
            const teacherClassId = teacherData.teachSclass._id || teacherData.teachSclass;
            
            filteredStudents = studentsList.filter(student => {
                if (!student.sclassName) return false;
                
                const studentClassId = student.sclassName._id || student.sclassName;
                return studentClassId === teacherClassId;
            });
        }

        console.log("Filtered students:", filteredStudents.length);
        setMyStudents(filteredStudents);
    };

    // Helper function to format teacher's assignments for display
    const formatTeacherAssignments = () => {
        if (!teacherData) return { summary: 'Loading...', details: [], hasMultiple: false };

        if (teacherData.assignments && teacherData.assignments.length > 0) {
            // Group assignments by class
            const groupedByClass = teacherData.assignments.reduce((acc, assignment) => {
                const className = assignment.class?.sclassName || 'Unknown Class';
                const classId = assignment.class?._id || assignment.class;
                
                if (!acc[className]) {
                    acc[className] = { classId, subjects: [] };
                }
                acc[className].subjects.push(assignment.subject?.subName || 'Unknown Subject');
                return acc;
            }, {});

            const details = Object.entries(groupedByClass).map(([className, data]) => ({
                class: className,
                classId: data.classId,
                subjects: data.subjects
            }));

            // Create summary
            let summary;
            if (details.length === 1 && details[0].subjects.length === 1) {
                summary = `${details[0].subjects[0]} - ${details[0].class}`;
            } else if (details.length === 1) {
                summary = `${details[0].subjects.length} subjects - ${details[0].class}`;
            } else {
                summary = `${teacherData.assignments.length} subjects in ${details.length} classes`;
            }

            return {
                summary,
                details,
                hasMultiple: teacherData.assignments.length > 1
            };
        } else if (teacherData.teachSubject || teacherData.teachSclass) {
            // Fallback to single assignment
            const subjectName = teacherData.teachSubject?.subName || 'Unknown Subject';
            const className = teacherData.teachSclass?.sclassName || 'Unknown Class';
            
            return {
                summary: `${subjectName} - ${className}`,
                details: [{
                    class: className,
                    classId: teacherData.teachSclass?._id,
                    subjects: [subjectName]
                }],
                hasMultiple: false
            };
        }

        return {
            summary: 'No assignments found',
            details: [],
            hasMultiple: false
        };
    };

    // Helper function to get subjects teacher teaches to this student
    const getMySubjectsForStudent = (student) => {
        if (!teacherData || !student.sclassName) return [];

        const studentClassId = student.sclassName._id || student.sclassName;

        if (teacherData.assignments && teacherData.assignments.length > 0) {
            return teacherData.assignments
                .filter(assignment => {
                    const assignmentClassId = assignment.class._id || assignment.class;
                    return assignmentClassId === studentClassId;
                })
                .map(assignment => assignment.subject?.subName || 'Unknown Subject');
        } else if (teacherData.teachSclass && teacherData.teachSubject) {
            const teacherClassId = teacherData.teachSclass._id || teacherData.teachSclass;
            if (teacherClassId === studentClassId) {
                return [teacherData.teachSubject.subName];
            }
        }

        return [];
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Typography variant="h6">Loading your classes and students...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Typography variant="body1" color="textSecondary">
                    Contact your administrator to get assigned to classes and subjects.
                </Typography>
            </Box>
        );
    }

    const assignmentData = formatTeacherAssignments();

    const columns = [
        { id: 'student', label: 'Student', minWidth: 200 },
        { id: 'class', label: 'Class', minWidth: 150 },
        { id: 'mySubjects', label: 'My Subjects', minWidth: 250 },
        { id: 'rollnum', label: 'Roll Number', minWidth: 120 },
    ];

    const rows = myStudents.map((student) => {
        const mySubjects = getMySubjectsForStudent(student);
        
        return {
            student: {
                name: student.name,
                email: student.email
            },
            class: student.sclassName?.sclassName || 'No Class',
            mySubjects: mySubjects,
            rollnum: student.rollNum || 'N/A',
            id: student._id,
            studentData: student
        };
    });

    const AssignmentOverviewCard = () => (
        <Card elevation={3} sx={{ mb: 3 }}>
            <CardContent>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <SubjectIcon color="primary" />
                    My Teaching 
                </Typography>
                
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                            <strong>Summary:</strong> {assignmentData.summary}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="body1">
                            <strong>Total Students:</strong> {myStudents.length}
                        </Typography>
                    </Grid>
                </Grid>

                {assignmentData.hasMultiple && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            My Classes and Subjects:
                        </Typography>
                        {assignmentData.details.map((classAssignment, index) => (
                            <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                                <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                                    {classAssignment.class}:
                                </Typography>
                                <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                                    {classAssignment.subjects.map((subject, subIndex) => (
                                        <Chip 
                                            key={subIndex}
                                            label={subject} 
                                            size="small" 
                                            color="secondary"
                                            variant="outlined"
                                        />
                                    ))}
                                </Stack>
                            </Box>
                        ))}
                    </Box>
                )}
            </CardContent>
        </Card>
    );

    const SubjectsCell = ({ subjects }) => {
        if (subjects.length === 0) {
            return (
                <Typography variant="body2" color="textSecondary">
                    No subjects assigned
                </Typography>
            );
        }

        return (
            <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                {subjects.map((subject, index) => (
                    <Chip 
                        key={index}
                        label={subject} 
                        size="small" 
                        color="primary"
                        variant="filled"
                    />
                ))}
            </Stack>
        );
    };

    return (
        <Box sx={{ p: 2 }}>
            {/* Assignment Overview */}
            <AssignmentOverviewCard />

            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                {/* Header */}
                <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SchoolIcon color="primary" />
                        My Students ({rows.length})
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Students in classes where you teach
                    </Typography>
                </Box>

                <TableContainer>
                    <Table stickyHeader aria-label="students table">
                        <TableHead>
                            <StyledTableRow>
                                {columns.map((column) => (
                                    <StyledTableCell
                                        key={column.id}
                                        align={column.align}
                                        style={{ minWidth: column.minWidth }}
                                    >
                                        {column.label}
                                    </StyledTableCell>
                                ))}
                            
                            </StyledTableRow>
                        </TableHead>
                        <TableBody>
                            {rows
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row) => {
                                    return (
                                        <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                                            <StyledTableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                                        <PersonIcon fontSize="small" />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="medium">
                                                            {row.student.name}
                                                        </Typography>
                                                        <Typography variant="caption" color="textSecondary">
                                                            {row.student.email}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                <Chip 
                                                    icon={<ClassIcon />}
                                                    label={row.class} 
                                                    color="secondary" 
                                                    variant="outlined"
                                                    size="small"
                                                />
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                <SubjectsCell 
                                                    subjects={row.mySubjects} 
                                                />
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {row.rollnum}
                                                </Typography>
                                            </StyledTableCell>
                                          
                                        </StyledTableRow>
                                    );
                                })}
                        </TableBody>
                    </Table>
                </TableContainer>

                {rows.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <SchoolIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="textSecondary" gutterBottom>
                            No Students Found
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            There are no students enrolled in the classes you teach.
                        </Typography>
                    </Box>
                ) : (
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        component="div"
                        count={rows.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(event, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(event) => {
                            setRowsPerPage(parseInt(event.target.value, 10));
                            setPage(0);
                        }}
                    />
                )}
            </Paper>
        </Box>
    );
};

export default TeacherStudentsList;