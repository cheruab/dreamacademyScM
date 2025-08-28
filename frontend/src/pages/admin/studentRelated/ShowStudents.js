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
    Alert
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
    AssignmentInd as AssignIcon
} from '@mui/icons-material';
import { getAllStudents } from '../../../redux/studentRelated/studentHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import TableTemplate from '../../../components/TableTemplate';
import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';

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

    const deleteHandler = (deleteID, address) => {
        console.log(deleteID);
        console.log(address);
        dispatch(deleteUser(deleteID, address));
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
        { id: 'class', label: 'Class Status', minWidth: 150 }, // Updated column name
        { id: 'subjects', label: 'Subjects', minWidth: 100 },
        { id: 'attendance', label: 'Attendance', minWidth: 120 },
        { id: 'performance', label: 'Performance', minWidth: 120 },
        { id: 'actions', label: 'Actions', minWidth: 250 }, // Increased width for new action
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
                <Avatar 
                    sx={{ 
                        bgcolor: student.sclassName ? 'primary.main' : 'grey.500', 
                        width: 40, 
                        height: 40,
                        fontSize: '1rem'
                    }}
                >
                    {student.name?.charAt(0)?.toUpperCase()}
                </Avatar>
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
                <Chip 
                    icon={<ClassIcon />}
                    label={student.sclassName.sclassName} 
                    color="primary" 
                    variant="outlined"
                    size="small"
                />
            ) : (
                <Chip 
                    label="Unassigned" 
                    color="warning" 
                    variant="outlined"
                    size="small"
                    icon={<AssignIcon />}
                />
            ),
            subjects: (
                <Chip 
                    icon={<AssignmentIcon />}
                    label={`${student.examResult?.length || 0} subjects`}
                    color="info"
                    variant="outlined"
                    size="small"
                />
            ),
            attendance: (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                        icon={<AttendanceIcon />}
                        label={`${attendanceRate}%`}
                        color={attendanceRate >= 75 ? 'success' : attendanceRate >= 50 ? 'warning' : 'error'}
                        size="small"
                    />
                </Box>
            ),
            performance: (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                        label={averageScore > 0 ? `${averageScore}%` : 'No data'}
                        color={averageScore >= 80 ? 'success' : averageScore >= 60 ? 'warning' : averageScore > 0 ? 'error' : 'default'}
                        size="small"
                    />
                </Box>
            ),
            actions: (
                <ButtonGroup variant="outlined" size="small" orientation="horizontal">
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
                            onClick={() => deleteHandler(student._id, "Student")}
                            sx={{ minWidth: 'auto', px: 1 }}
                        >
                            Delete
                        </Button>
                    </Tooltip>
                </ButtonGroup>
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
        <Box sx={{ p: 3 }}>
            {/* Header Section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                <Box>
                    <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <SchoolIcon color="primary" sx={{ fontSize: '2rem' }} />
                        Students Management
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage student profiles, class assignments, attendance, and academic performance
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<PersonAddAlt1Outlined />}
                    onClick={() => navigate("/Admin/addstudents")}
                    size="large"
                >
                    Add New Student
                </Button>
            </Box>

            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <PersonIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                            <Typography variant="h4" color="primary">
                                {totalStudents}
                            </Typography>
                            <Typography color="textSecondary">
                                Total Students
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <ClassIcon color="success" sx={{ fontSize: 48, mb: 2 }} />
                            <Typography variant="h4" color="success.main">
                                {assignedStudents}
                            </Typography>
                            <Typography color="textSecondary">
                                Assigned to Classes
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <AssignIcon color="warning" sx={{ fontSize: 48, mb: 2 }} />
                            <Typography variant="h4" color="warning.main">
                                {unassignedStudents}
                            </Typography>
                            <Typography color="textSecondary">
                                Unassigned Students
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Button
                                variant="contained"
                                color="secondary"
                                startIcon={<PostAdd />}
                                onClick={() => navigate('/Admin/addclass')}
                                sx={{ mt: 2 }}
                                disabled={unassignedStudents === 0}
                            >
                                Create New Class
                            </Button>
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                {unassignedStudents > 0 ? 'Ready to create classes' : 'All students assigned'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Show alert for unassigned students */}
            {unassignedStudents > 0 && (
                <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body1" gutterBottom>
                        You have {unassignedStudents} unassigned student{unassignedStudents > 1 ? 's' : ''}
                    </Typography>
                    <Typography variant="body2">
                        Students without classes cannot access subjects or take exams. Create classes to assign them.
                    </Typography>
                </Alert>
            )}

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 4 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
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
                                <MenuItem value="unassigned">🟡 Unassigned</MenuItem>
                                <MenuItem value="assigned">🟢 Assigned</MenuItem>
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
                        <Button
                            variant="outlined"
                            color="secondary"
                            startIcon={<FilterIcon />}
                            onClick={filterStudents}
                            fullWidth
                        >
                            Apply
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Student Table */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            <TableTemplate
                columns={studentColumns}
                rows={studentRows}
                loading={loading}
                buttonHaver={EmptyButtonHaver} 
            />

            {/* Floating Speed Dial */}
            <SpeedDialTemplate actions={actions} />
        </Box>
    );
};

export default ShowStudents;