import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import { getAllTeachers } from '../../../redux/teacherRelated/teacherHandle';
import {
    Paper, Table, TableBody, TableContainer,
    TableHead, TablePagination, Button, Box, IconButton,
    Chip, Stack, Typography, Collapse
} from '@mui/material';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';
import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const ShowTeachers = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [expandedRows, setExpandedRows] = useState(new Set());

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { teachersList, loading, error, response } = useSelector((state) => state.teacher);
    const { currentUser } = useSelector((state) => state.user);

    useEffect(() => {
        dispatch(getAllTeachers(currentUser._id));
    }, [currentUser._id, dispatch]);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    if (loading) {
        return <div>Loading...</div>;
    } else if (response) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <GreenButton variant="contained" 
                onClick={() => navigate(`/Admin/addteacher/${currentUser._id}`)}>
                    Add Teacher
                </GreenButton>
            </Box>
        );
    } else if (error) {
        console.log(error);
    }

    const deleteHandler = (deleteID, address) => {
        console.log(deleteID);
        console.log(address);
        setMessage("Sorry the delete function has been disabled for now.")
        setShowPopup(true)
    };

    const toggleRowExpansion = (teacherId) => {
        const newExpandedRows = new Set(expandedRows);
        if (newExpandedRows.has(teacherId)) {
            newExpandedRows.delete(teacherId);
        } else {
            newExpandedRows.add(teacherId);
        }
        setExpandedRows(newExpandedRows);
    };

    // Helper function to format assignments for display
    const formatAssignments = (teacher) => {
        if (!teacher.assignments || teacher.assignments.length === 0) {
            return {
                summary: 'Not Assigned',
                details: [],
                hasMultiple: false
            };
        }

        // Group assignments by class
        const groupedByClass = teacher.assignments.reduce((acc, assignment) => {
            const className = assignment.class?.sclassName || 'Unknown Class';
            if (!acc[className]) {
                acc[className] = [];
            }
            acc[className].push(assignment.subject?.subName || 'Unknown Subject');
            return acc;
        }, {});

        const details = Object.entries(groupedByClass).map(([className, subjects]) => ({
            class: className,
            subjects: subjects
        }));

        // Create summary
        let summary;
        if (details.length === 1 && details[0].subjects.length === 1) {
            summary = `${details[0].subjects[0]} - ${details[0].class}`;
        } else if (details.length === 1) {
            summary = `${details[0].subjects.length} subjects - ${details[0].class}`;
        } else {
            summary = `${teacher.assignments.length} assignments in ${details.length} classes`;
        }

        return {
            summary,
            details,
            hasMultiple: teacher.assignments.length > 1
        };
    };

    const columns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'assignments', label: 'Assignments', minWidth: 300 },
        { id: 'email', label: 'Email', minWidth: 200 },
    ];

    const rows = teachersList.map((teacher) => {
        const assignmentData = formatAssignments(teacher);
        
        return {
            name: teacher.name,
            email: teacher.email,
            assignments: assignmentData,
            id: teacher._id,
            teacherData: teacher
        };
    });

    const actions = [
        {
            icon: <PersonAddAlt1Icon color="primary" />, name: 'Add New Teacher',
            action: () => navigate(`/Admin/teachers/addteacher/${currentUser._id}`)
        },
        {
            icon: <PersonRemoveIcon color="error" />, name: 'Delete All Teachers',
            action: () => deleteHandler(currentUser._id, "Teachers")
        },
    ];

    const AssignmentCell = ({ assignment, teacherId }) => {
        const isExpanded = expandedRows.has(teacherId);
        
        return (
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">
                        {assignment.summary}
                    </Typography>
                    {assignment.hasMultiple && (
                        <IconButton 
                            size="small" 
                            onClick={() => toggleRowExpansion(teacherId)}
                        >
                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                    )}
                </Box>
                
                <Collapse in={isExpanded && assignment.hasMultiple}>
                    <Box sx={{ mt: 1 }}>
                        {assignment.details.map((classAssignment, index) => (
                            <Box key={index} sx={{ mb: 1 }}>
                                <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold' }}>
                                    {classAssignment.class}:
                                </Typography>
                                <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                                    {classAssignment.subjects.map((subject, subIndex) => (
                                        <Chip 
                                            key={subIndex}
                                            label={subject} 
                                            size="small" 
                                            variant="outlined"
                                            color="secondary"
                                        />
                                    ))}
                                </Stack>
                            </Box>
                        ))}
                    </Box>
                </Collapse>
            </Box>
        );
    };

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer>
                <Table stickyHeader aria-label="sticky table">
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
                            <StyledTableCell align="center">
                                Actions
                            </StyledTableCell>
                        </StyledTableRow>
                    </TableHead>
                    <TableBody>
                        {rows
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row) => {
                                return (
                                    <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                                        <StyledTableCell>
                                            {row.name}
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <AssignmentCell 
                                                assignment={row.assignments} 
                                                teacherId={row.id}
                                            />
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            {row.email}
                                        </StyledTableCell>
                                        <StyledTableCell align="center">
                                            <IconButton onClick={() => deleteHandler(row.id, "Teacher")}>
                                                <PersonRemoveIcon color="error" />
                                            </IconButton>
                                            <BlueButton variant="contained"
                                                onClick={() => navigate("/Admin/teachers/teacher/" + row.id)}>
                                                View
                                            </BlueButton>
                                        </StyledTableCell>
                                    </StyledTableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25, 100]}
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

            <SpeedDialTemplate actions={actions} />
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Paper>
    );
};

export default ShowTeachers