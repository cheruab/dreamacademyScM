import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import { getAllTeachers } from '../../../redux/teacherRelated/teacherHandle';
import {
    Paper, Table, TableBody, TableContainer,
    TableHead, TablePagination, Button, Box,
    Chip, Stack, Typography, Dialog, DialogActions,
    DialogContent, DialogContentText, DialogTitle,
    TextField
} from '@mui/material';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';
import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import Popup from '../../../components/Popup';

const ShowTeachers = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { teachersList, loading, error, response } = useSelector((state) => state.teacher);
    const { currentUser } = useSelector((state) => state.user);

    useEffect(() => {
        dispatch(getAllTeachers(currentUser._id));
    }, [currentUser._id, dispatch]);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [teacherToDelete, setTeacherToDelete] = useState(null);
    const [confirmationText, setConfirmationText] = useState("");

    if (loading) {
        return <div>Loading...</div>;
    } else if (response) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <GreenButton variant="contained" 
                onClick={() => navigate(`/Admin/teachers/addteacher/${currentUser._id}`)}>
                    Add Teacher
                </GreenButton>
            </Box>
        );
    } else if (error) {
        console.log(error);
    }

    const deleteHandler = (deleteID) => {
        setTeacherToDelete(deleteID);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (confirmationText.toLowerCase() === 'delete') {
            dispatch(deleteUser(teacherToDelete, "Teacher"));
            setDeleteDialogOpen(false);
            setConfirmationText("");
            setTeacherToDelete(null);
        }
    };

    const cancelDelete = () => {
        setDeleteDialogOpen(false);
        setConfirmationText("");
        setTeacherToDelete(null);
    };

    // Helper function to format assignments for display (simplified - no dropdown)
    const formatAssignments = (teacher) => {
        if (!teacher.assignments || teacher.assignments.length === 0) {
            return {
                summary: 'Not Assigned',
                details: []
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

        return {
            summary: '',
            details
        };
    };

    const columns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'assignments', label: 'Assigned Subjects', minWidth: 300 },
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

    const AssignmentCell = ({ assignment }) => {
        if (assignment.details.length === 0) {
            return (
                <Typography variant="body2" color="textSecondary">
                    Not Assigned
                </Typography>
            );
        }

        return (
            <Box>
                {assignment.details.map((classAssignment, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                        <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold' }}>
                            {classAssignment.class}:
                        </Typography>
                        <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
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
        );
    };

    return (
        <>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                {/* Header with Add Teacher Button */}
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Teachers</Typography>
                    <GreenButton 
                        variant="contained" 
                        startIcon={<PersonAddAlt1Icon />}
                        onClick={() => navigate(`/Admin/teachers/addteacher/${currentUser._id}`)}
                    >
                        Add New Teacher
                    </GreenButton>
                </Box>

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
                                                />
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                {row.email}
                                            </StyledTableCell>
                                            <StyledTableCell align="center">
                                                <Button 
                                                    variant="contained" 
                                                    color="error"
                                                    onClick={() => deleteHandler(row.id)}
                                                >
                                                    Delete
                                                </Button>
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

                <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
            </Paper>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={cancelDelete}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this teacher? This action cannot be undone.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Type 'delete' to confirm"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={confirmationText}
                        onChange={(e) => setConfirmationText(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelDelete} color="primary">
                        Cancel
                    </Button>
                    <Button 
                        onClick={confirmDelete} 
                        color="error" 
                        disabled={confirmationText.toLowerCase() !== 'delete'}
                        variant="contained"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ShowTeachers