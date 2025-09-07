import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Paper,
    Box,
    IconButton,
    Tooltip,
    Chip,
    Typography,
    Button,
    ButtonGroup,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Card,
    CardContent,
    Grid,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    Delete as DeleteIcon,
    PostAdd,
    PersonAddAlt1Outlined,
    Visibility as VisibilityIcon,
    Edit as EditIcon,
    Assignment as AssignmentIcon,
    EventAvailable as AttendanceIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Class as ClassIcon,
    School as SchoolIcon,
    Person as PersonIcon,
    AssignmentInd as AssignIcon,
    Warning as WarningIcon
} from '@mui/icons-material';
import { getAllStudents } from '../../../redux/studentRelated/studentHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import TableTemplate from '../../../components/TableTemplate';
import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import styled from 'styled-components';
import Popup from '../../../components/Popup';

const EmptyButtonHaver = () => null;

const ShowStudents = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { studentsList, loading, error, response } = useSelector((state) => state.student);
    const { currentUser } = useSelector(state => state.user);

    const [searchTerm, setSearchTerm] = useState('');
    const [classFilter, setClassFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [filteredStudents, setFilteredStudents] = useState([]);
    
    // Delete confirmation dialog states
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getAllStudents(currentUser._id));
        }
    }, [currentUser._id, dispatch]);

    useEffect(() => {
        if (studentsList && studentsList.length > 0) {
            filterStudents();
        }
    }, [studentsList, searchTerm, classFilter, statusFilter]);

    const filterStudents = () => {
        if (!studentsList) return;
        
        let filtered = studentsList.filter(student => {
            const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                student.rollNum?.toString().includes(searchTerm);
            const matchesClass = !classFilter || 
                                (classFilter === 'unassigned' && !student.sclassName) ||
                                (classFilter === 'assigned' && student.sclassName) ||
                                (student.sclassName?.sclassName === classFilter);
            const matchesStatus = !statusFilter || 
                                (statusFilter === 'active' && student.isActive !== false) ||
                                (statusFilter === 'inactive' && student.isActive === false);
            
            return matchesSearch && matchesClass && matchesStatus;
        });
        
        setFilteredStudents(filtered);
    };

    const initiateDelete = (student) => {
        setStudentToDelete(student);
        setDeleteConfirmText('');
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (deleteConfirmText.toLowerCase() === 'delete' && studentToDelete) {
            dispatch(deleteUser(studentToDelete.id, "Student"));
            setMessage(`Student "${studentToDelete.name}" has been deleted successfully.`);
            setShowPopup(true);
        }
        
        setDeleteDialogOpen(false);
        setStudentToDelete(null);
        setDeleteConfirmText('');
    };

    const cancelDelete = () => {
        setDeleteDialogOpen(false);
        setStudentToDelete(null);
        setDeleteConfirmText('');
    };

    // Get unique classes for filter, including unassigned option
    const getUniqueClasses = () => {
        if (!studentsList) return [];
        const classes = studentsList
            .map(student => student.sclassName?.sclassName)
            .filter(Boolean);
        return [...new Set(classes)];
    };

    // Enhanced student table columns
    const studentColumns = [
        { id: 'avatar', label: '', minWidth: 70 },
        { id: 'rollNum', label: 'Roll No', minWidth: 100 },
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'class', label: 'Class Status', minWidth: 150 },
        { id: 'subjects', label: 'Subjects', minWidth: 100 },
        { id: 'attendance', label: 'Attendance', minWidth: 120 },
        { id: 'performance', label: 'Performance', minWidth: 120 },
        { id: 'actions', label: 'Actions', minWidth: 250 },
    ];

    const studentRows = filteredStudents?.map((student) => {
        const attendanceRate = student.attendance?.length > 0 
            ? Math.round((student.attendance.filter(a => a.status === 'Present').length / student.attendance.length) * 100)
            : 0;
        
        const averageScore = student.examResult?.length > 0
            ? Math.round(student.examResult.reduce((sum, result) => sum + result.marksObtained, 0) / student.examResult.length)
            : 0;

        return {
            avatar: (
                <StyledAvatar 
                    sx={{ 
                        bgcolor: student.sclassName ? 'primary.main' : 'grey.500', 
                        width: 40, 
                        height: 40,
                        fontSize: '1rem'
                    }}
                >
                    {student.name?.charAt(0)?.toUpperCase()}
                </StyledAvatar>
            ),
            rollNum: student.rollNum,
            name: (
                <Box>
                    <Typography variant="body1" fontWeight="600">
                        {student.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        ID: {student._id?.slice(-6)}
                    </Typography>
                </Box>
            ),
            class: student.sclassName ? (
                <StyledChip 
                    icon={<ClassIcon />}
                    label={student.sclassName.sclassName} 
                    color="primary" 
                    variant="outlined"
                    size="small"
                />
            ) : (
                <StyledChip 
                    label="Unassigned" 
                    color="warning" 
                    variant="outlined"
                    size="small"
                    icon={<AssignIcon />}
                />
            ),
            subjects: (
                <StyledChip 
                    icon={<AssignmentIcon />}
                    label={`${student.examResult?.length || 0} subjects`}
                    color="info"
                    variant="outlined"
                    size="small"
                />
            ),
            attendance: (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StyledChip
                        icon={<AttendanceIcon />}
                        label={`${attendanceRate}%`}
                        color={attendanceRate >= 75 ? 'success' : attendanceRate >= 50 ? 'warning' : 'error'}
                        size="small"
                    />
                </Box>
            ),
            performance: (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StyledChip
                        label={averageScore > 0 ? `${averageScore}%` : 'No data'}
                        color={averageScore >= 80 ? 'success' : averageScore >= 60 ? 'warning' : averageScore > 0 ? 'error' : 'default'}
                        size="small"
                    />
                </Box>
            ),
            actions: (
                <ActionButtonGroup variant="outlined" size="small" orientation="horizontal">
                    <Tooltip title="View Complete Profile">
                        <Button
                            color="primary"
                            startIcon={<VisibilityIcon />}
                            onClick={() => navigate(`/Admin/students/student/${student._id}`)}
                            sx={{ minWidth: 'auto', px: 1 }}
                        >
                            View
                        </Button>
                    </Tooltip>
                    {student.sclassName ? (
                        <>
                            <Tooltip title="Update Attendance">
                                <Button
                                    color="info"
                                    startIcon={<AttendanceIcon />}
                                    onClick={() => navigate(`/Admin/students/student/attendance/${student._id}`)}
                                    sx={{ minWidth: 'auto', px: 1 }}
                                >
                                    Attendance
                                </Button>
                            </Tooltip>
                            <Tooltip title="Update Marks">
                                <Button
                                    color="success"
                                    startIcon={<AssignmentIcon />}
                                    onClick={() => navigate(`/Admin/students/student/marks/${student._id}`)}
                                    sx={{ minWidth: 'auto', px: 1 }}
                                >
                                    Marks
                                </Button>
                            </Tooltip>
                        </>
                    ) : (
                        <Tooltip title="Create Class for Student">
                            <Button
                                color="secondary"
                                startIcon={<AssignIcon />}
                                onClick={() => navigate('/Admin/addclass')}
                                sx={{ minWidth: 'auto', px: 1 }}
                            >
                                Assign to Class
                            </Button>
                        </Tooltip>
                    )}
                    <Tooltip title="Delete Student">
                        <Button
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => initiateDelete({ id: student._id, name: student.name })}
                            sx={{ minWidth: 'auto', px: 1 }}
                        >
                            Delete
                        </Button>
                    </Tooltip>
                </ActionButtonGroup>
            ),
            id: student._id,
        };
    }) || [];

    const actions = [
        {
            icon: <PersonAddAlt1Outlined color="primary" />, 
            name: 'Add New Student', 
            action: () => navigate("/Admin/addstudents")
        },
        {
            icon: <PostAdd color="success" />, 
            name: 'Add Students via CSV', 
            action: () => navigate("/Admin/addstudents")
        },
    ];

    // Calculate statistics
    const totalStudents = filteredStudents?.length || 0;
    const assignedStudents = filteredStudents?.filter(s => s.sclassName)?.length || 0;
    const unassignedStudents = totalStudents - assignedStudents;

    return (
        <Container>
            {/* Header Section */}
            <HeaderSection>
                <Box>
                    <MainTitle variant="h4" gutterBottom>
                        <SchoolIcon sx={{ fontSize: '2.5rem', mr: 2 }} />
                        Students Management
                    </MainTitle>
                    <SubTitle variant="h6">
                        Manage student profiles, class assignments, attendance, and academic performance
                    </SubTitle>
                </Box>
                <ActionButton
                    variant="contained"
                    startIcon={<PersonAddAlt1Outlined />}
                    onClick={() => navigate("/Admin/addstudents")}
                    size="large"
                >
                    Add New Student
                </ActionButton>
            </HeaderSection>

            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard elevation={6}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <PersonIcon sx={{ fontSize: 48, mb: 2, color: '#e91e63' }} />
                            <StatsNumber variant="h3" sx={{ color: '#e91e63' }}>
                                {totalStudents}
                            </StatsNumber>
                            <StatsLabel>
                                Total Students
                            </StatsLabel>
                        </CardContent>
                    </StatsCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard elevation={6}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <ClassIcon sx={{ fontSize: 48, mb: 2, color: '#4caf50' }} />
                            <StatsNumber variant="h3" sx={{ color: '#4caf50' }}>
                                {assignedStudents}
                            </StatsNumber>
                            <StatsLabel>
                                Assigned to Classes
                            </StatsLabel>
                        </CardContent>
                    </StatsCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard elevation={6}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <AssignIcon sx={{ fontSize: 48, mb: 2, color: '#ff9800' }} />
                            <StatsNumber variant="h3" sx={{ color: '#ff9800' }}>
                                {unassignedStudents}
                            </StatsNumber>
                            <StatsLabel>
                                Unassigned Students
                            </StatsLabel>
                        </CardContent>
                    </StatsCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard elevation={6}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <ActionButton
                                variant="contained"
                                startIcon={<PostAdd />}
                                onClick={() => navigate('/Admin/addclass')}
                                sx={{ mt: 2 }}
                                disabled={unassignedStudents === 0}
                            >
                                Create New Class
                            </ActionButton>
                            <Typography variant="body2" sx={{ mt: 1, color: '#64748b' }}>
                                {unassignedStudents > 0 ? 'Ready to create classes' : 'All students assigned'}
                            </Typography>
                        </CardContent>
                    </StatsCard>
                </Grid>
            </Grid>

            {/* Show alert for unassigned students */}
            {unassignedStudents > 0 && (
                <StyledAlert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body1" gutterBottom>
                        You have {unassignedStudents} unassigned student{unassignedStudents > 1 ? 's' : ''}
                    </Typography>
                    <Typography variant="body2">
                        Students without classes cannot access subjects or take exams. Create classes to assign them.
                    </Typography>
                </StyledAlert>
            )}

            {/* Filters */}
            <FiltersPaper elevation={4}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <StyledTextField
                            fullWidth
                            label="Search by name or roll no"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Filter by Class</InputLabel>
                            <Select
                                value={classFilter}
                                label="Filter by Class"
                                onChange={(e) => setClassFilter(e.target.value)}
                            >
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="unassigned">Unassigned</MenuItem>
                                <MenuItem value="assigned">Assigned</MenuItem>
                                {getUniqueClasses().map(cls => (
                                    <MenuItem key={cls} value={cls}>{cls}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Filter by Status</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Filter by Status"
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <ActionButton
                            variant="outlined"
                            startIcon={<FilterIcon />}
                            onClick={filterStudents}
                            fullWidth
                        >
                            Apply
                        </ActionButton>
                    </Grid>
                </Grid>
            </FiltersPaper>

            {/* Student Table */}
            {error && (
                <StyledAlert severity="error" sx={{ mb: 2 }}>
                    {error}
                </StyledAlert>
            )}
            
            <TableContainer>
                <TableTemplate
                    columns={studentColumns}
                    rows={studentRows}
                    loading={loading}
                    buttonHaver={EmptyButtonHaver} 
                />
            </TableContainer>

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
                        Are you sure you want to delete the student "{studentToDelete?.name}"?
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
                        Delete Student
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Floating Speed Dial */}
            <SpeedDialTemplate actions={actions} />
            
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

export default ShowStudents;

// Enhanced Styled Components with Subtle Professional Colors
const Container = styled(Box)`
    padding: 2rem;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    min-height: 100vh;
    font-family: 'Inter', 'Segoe UI', 'Roboto', sans-serif;
`;

const HeaderSection = styled(Box)`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 3rem;
    padding: 2rem;
    background: white;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
`;

const MainTitle = styled(Typography)`
    color: #1e293b;
    font-weight: 700;
    font-size: 2.5rem;
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
`;

const SubTitle = styled(Typography)`
    color: #64748b;
    font-weight: 400;
    font-size: 1.1rem;
`;

const ActionButton = styled(Button)`
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    font-weight: 600;
    padding: 1rem 2rem;
    border-radius: 12px;
    text-transform: none;
    font-size: 1rem;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    
    &:hover {
        background: linear-gradient(135deg, #2563eb, #1e40af);
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
    }
`;

const StatsCard = styled(Card)`
    background: white;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }
`;

const StatsNumber = styled(Typography)`
    font-weight: 700;
    margin-bottom: 0.5rem;
`;

const StatsLabel = styled(Typography)`
    color: #64748b;
    font-weight: 500;
    font-size: 0.9rem;
`;

const StyledAlert = styled(Alert)`
    background: white;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
`;

const FiltersPaper = styled(Paper)`
    padding: 2rem;
    margin-bottom: 2rem;
    background: white;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
`;

const StyledTextField = styled(TextField)`
    .MuiOutlinedInput-root {
        border-radius: 8px;
        background: white;
    }
`;



const StyledAvatar = styled(Avatar)`
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    font-weight: 600;
`;

const StyledChip = styled(Chip)`
    font-weight: 500;
    border-radius: 8px;
`;

const ActionButtonGroup = styled(ButtonGroup)`
    .MuiButton-root {
        border-radius: 6px;
        text-transform: none;
        font-weight: 500;
    }
`;