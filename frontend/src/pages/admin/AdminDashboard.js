import { useState } from 'react';
import {
    CssBaseline,
    Box,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppBar, Drawer } from '../../components/styles';
import Logout from '../Logout';
import SideBar from './SideBar';
import AdminProfile from './AdminProfile';
import AdminHomePage from './AdminHomePage';
import UploadResult from './UploadResult';
import SingleExamResults from './SingleExamResults';

import AddStudent from './studentRelated/AddStudent';
import SeeComplains from './studentRelated/SeeComplains';
import ShowStudents from './studentRelated/ShowStudents';
import StudentAttendance from './studentRelated/StudentAttendance';
import StudentExamMarks from './studentRelated/StudentExamMarks';
import ComprehensiveStudentView from './studentRelated/ComprehensiveStudentView'; // New comprehensive view

import AddStudents from './studentsRelated/AddStudents';
import ShowStudentss from './studentsRelated/ShowStudentss';
import StudentAttendances from './studentsRelated/StudentAttendances';
import StudentExamMarkss from './studentsRelated/StudentExamMarkss';
import ViewStudents from './studentsRelated/ViewStudents';

import ExamList from './subjectRelated/ExamList';
import AddNotice from './noticeRelated/AddNotice';
import ShowNotices from './noticeRelated/ShowNotices';

import ShowSubjects from './subjectRelated/ShowSubjects';
import SubjectForm from './subjectRelated/SubjectForm';
import ExamForm from './subjectRelated/ExamForm';
import ViewSubject from './subjectRelated/ViewSubject';
import AssignSubjectsToClass from './subjectRelated/AssignSubjectsToClass';

import AddTeacher from './teacherRelated/AddTeacher';
import ChooseClass from './teacherRelated/ChooseClass';
import ChooseSubject from './teacherRelated/ChooseSubject';
import ShowTeachers from './teacherRelated/ShowTeachers';
import TeacherDetails from './teacherRelated/TeacherDetails';

import AddClass from './classRelated/AddClass';
import ClassDetails from './classRelated/ClassDetails';
import ShowClasses from './classRelated/ShowClasses';
import AccountMenu from '../../components/AccountMenu';
import LessonPlanViewer from './LessonPlanViewer';
import LessonPlanForm from './LessonPlanForm';
import LessonPlanDashboard from './lessonPlanDashboard';

const AdminDashboard = () => {
    const [open, setOpen] = useState(false);
    const toggleDrawer = () => {
        setOpen(!open);
    };

    return (
        <>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppBar open={open} position='absolute'>
                    <Toolbar sx={{ pr: '24px' }}>
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="open drawer"
                            onClick={toggleDrawer}
                            sx={{
                                marginRight: '36px',
                                ...(open && { display: 'none' }),
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography
                            component="h1"
                            variant="h6"
                            color="inherit"
                            noWrap
                            sx={{ flexGrow: 1 }}
                        >
                            Admin Dashboard
                        </Typography>
                        <AccountMenu />
                    </Toolbar>
                </AppBar>
                <Drawer variant="permanent" open={open} sx={open ? styles.drawerStyled : styles.hideDrawer}>
                    <Toolbar sx={styles.toolBarStyled}>
                        <IconButton onClick={toggleDrawer}>
                            <ChevronLeftIcon />
                        </IconButton>
                    </Toolbar>
                    <Divider />
                    <List component="nav">
                        <SideBar />
                    </List>
                </Drawer>
                <Box component="main" sx={styles.boxStyled}>
                    <Toolbar />
                    <Routes>
                        <Route path="/" element={<AdminHomePage />} />
                        <Route path='*' element={<Navigate to="/" />} />
                        <Route path="/Admin/dashboard" element={<AdminHomePage />} />
                        <Route path="/Admin/profile" element={<AdminProfile />} />
                        <Route path="/Admin/complains" element={<SeeComplains />} />
                        <Route path="/Admin/uploadresult" element={<UploadResult />} />

                        {/* Notice Routes */}
                        <Route path="/Admin/addnotice" element={<AddNotice />} />
                        <Route path="/Admin/notices" element={<ShowNotices />} />

                        {/* Subject Routes - Updated for new workflow */}
                        <Route path="/Admin/subjects" element={<ShowSubjects />} />
                        <Route path="/Admin/addsubject" element={<SubjectForm />} />
                        <Route path="/Admin/addsubject/:id" element={<SubjectForm />} />
                        <Route path="/Admin/subjects/subject/:classID/:subjectID" element={<ViewSubject />} />
                        <Route path="/Admin/subjects/assign/:id" element={<AssignSubjectsToClass />} />
                        
                        {/* Legacy subject routes for compatibility */}
                        <Route path="/Admin/subjects/chooseclass" element={<ChooseClass situation="Subject" />} />
                        <Route path="/Admin/class/subject/:classID/:subjectID" element={<ViewSubject />} />
                        <Route path="/Admin/subject/student/attendance/:studentID/:subjectID" element={<StudentAttendance situation="Subject" />} />
                        <Route path="/Admin/subject/student/marks/:studentID/:subjectID" element={<StudentExamMarks situation="Subject" />} />

                        {/* Class Routes - Simplified */}
                        <Route path="/Admin/classes" element={<ShowClasses />} />
                        <Route path="/Admin/addclass" element={<AddClass />} />
                        <Route path="/Admin/classes/class/:id" element={<ClassDetails />} />
                        <Route path="/Admin/class/addstudents/:id" element={<AddStudent situation="Class" />} />
                        <Route path="/Admin/class/addstudentss/:id" element={<AddStudents situation="Class" />} />

                        {/* Student Routes - Updated with Comprehensive View */}
                        <Route path="/Admin/addstudents" element={<AddStudent situation="Student" />} />
                        <Route path="/Admin/students" element={<ShowStudents />} />
                        {/* ✅ NEW: Comprehensive Student View - Single page with all details */}
                        <Route path="/Admin/students/student/:id" element={<ComprehensiveStudentView />} />
                        {/* Keep individual routes for specific actions */}
                        <Route path="/Admin/students/student/attendance/:id" element={<StudentAttendance situation="Student" />} />
                        <Route path="/Admin/students/student/marks/:id" element={<StudentExamMarks situation="Student" />} />
                        <Route path="/Admin/students/edit/:id" element={<AddStudent situation="Edit" />} />

                        {/* Parent Routes */}
                        <Route path="/Admin/addparents" element={<AddStudents situation="Parent" />} />
                        <Route path="/Admin/parents" element={<ShowStudentss />} /> 
                        <Route path="/Admin/parents/parent/:id" element={<ViewStudents />} />
                        <Route path="/Admin/parents/parent/attendance/:id" element={<StudentAttendances situation="Parent" />} />
                        <Route path="/Admin/parents/parent/marks/:id" element={<StudentExamMarkss situation="Parent" />} />

                        {/* Teacher Routes */}
                        <Route path="/Admin/teachers" element={<ShowTeachers />} />
                        <Route path="/Admin/teachers/teacher/:id" element={<TeacherDetails />} />
                        <Route path="/Admin/teachers/chooseclass" element={<ChooseClass situation="Teacher" />} />
                        <Route path="/Admin/teachers/choosesubject/:id" element={<ChooseSubject situation="Norm" />} />
                        <Route path="/Admin/teachers/choosesubject/:classID/:teacherID" element={<ChooseSubject situation="Teacher" />} />
                        <Route path="/Admin/teachers/addteacher/:id" element={<AddTeacher />} />

                        {/* Exam Routes - Enhanced */}
                        <Route path="/Admin/addexam/:id" element={<ExamForm />} />
                        <Route path="/Admin/exams/:subjectId" element={<ExamList />} />          
                        <Route path="/Admin/exam-results/exam/:examId" element={<SingleExamResults />} />

                        <Route path="/Admin/lesson-plans/" element={<LessonPlanDashboard />} />
                        <Route path="/Admin/lesson-planform/" element={<LessonPlanForm />} />
                        <Route path="/lesson-plan/" element={<LessonPlanViewer />} />





                        

                        <Route path="/logout" element={<Logout />} />
                    </Routes>
                </Box>
            </Box>
        </>
    );
}

export default AdminDashboard 

const styles = {
    boxStyled: {
        backgroundColor: (theme) =>
            theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
        flexGrow: 1,
        height: '100vh',
        overflow: 'auto',
    },
    toolBarStyled: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        px: [1],
    },
    drawerStyled: {
        display: "flex"
    },
    hideDrawer: {
        display: 'flex',
        '@media (max-width: 600px)': {
            display: 'none',
        },
    },
}

