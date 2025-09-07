import * as React from 'react'; 
import { 
    Divider, 
    ListItemButton, 
    ListItemIcon, 
    ListItemText, 
    Collapse,
    List
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

import HomeIcon from '@mui/icons-material/Home';
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AssignmentIcon from '@mui/icons-material/Assignment';
import QuizIcon from '@mui/icons-material/Quiz';
import GradeIcon from '@mui/icons-material/Grade';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useSelector } from 'react-redux';

const TeacherSideBar = () => {
    const { currentUser } = useSelector((state) => state.user);
    const sclassName = currentUser?.teachSclass;
    const teachSubject = currentUser?.teachSubject;
    
    const location = useLocation();
    const [openStudents, setOpenStudents] = React.useState(false);
    const [openAssessments, setOpenAssessments] = React.useState(false);

    const handleStudentsClick = () => {
        setOpenStudents(!openStudents);
    };

    const handleAssessmentsClick = () => {
        setOpenAssessments(!openAssessments);
    };

    return (
        <>
            <React.Fragment>
                {/* Home */}
                <ListItemButton component={Link} to="/">
                    <ListItemIcon>
                        <HomeIcon color={location.pathname === "/" || location.pathname === "/Teacher/dashboard" ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Home" />
                </ListItemButton>
                

                {/* Student Management */}
                <ListItemButton onClick={handleStudentsClick}>
                    <ListItemIcon>
                        <PersonOutlineIcon color={location.pathname.includes("/Teacher/class/student/") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="My Students" />
                    {openStudents ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                
                <Collapse in={openStudents} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItemButton 
                            sx={{ pl: 4 }} 
                            component={Link} 
                            to="/Teacher/students/list"
                        >
                            <ListItemIcon>
                                <PersonOutlineIcon 
                                    fontSize="small"
                                    color={location.pathname === "/Teacher/students/list" ? 'primary' : 'inherit'} 
                                />
                            </ListItemIcon>
                            <ListItemText primary="All Students" />
                        </ListItemButton>
                        
                        <ListItemButton 
                            sx={{ pl: 4 }} 
                            component={Link} 
                            to="/Teacher/students/attendance"
                        >
                            <ListItemIcon>
                                <CalendarTodayIcon 
                                    fontSize="small"
                                    color={location.pathname === "/Teacher/students/attendance" ? 'primary' : 'inherit'} 
                                />
                            </ListItemIcon>
                            <ListItemText primary="Manage Attendance" />
                        </ListItemButton>
                        
                        <ListItemButton 
                            sx={{ pl: 4 }} 
                            component={Link} 
                            to="/Teacher/students/grades"
                        >
                            <ListItemIcon>
                                <GradeIcon 
                                    fontSize="small"
                                    color={location.pathname === "/Teacher/students/grades" ? 'primary' : 'inherit'} 
                                />
                            </ListItemIcon>
                            <ListItemText primary="Manage Grades" />
                        </ListItemButton>
                    </List>
                </Collapse>

                {/* Assessments */}
                <ListItemButton onClick={handleAssessmentsClick}>
                    <ListItemIcon>
                        <AssignmentIcon color={location.pathname.includes("/Teacher/assessments") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Assessments" />
                    {openAssessments ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>

                <Collapse in={openAssessments} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>

                        <ListItemButton 
                            sx={{ pl: 4 }} 
                            component={Link} 
                            to="/Teacher/assessments/exams"
                        >
                            <ListItemIcon>
                                <AssignmentIcon 
                                    fontSize="small"
                                    color={location.pathname === "/Teacher/assessments/exams" ? 'primary' : 'inherit'} 
                                />
                            </ListItemIcon>
                            <ListItemText primary="Exams" />
                        </ListItemButton>
                    </List>
                </Collapse>

                <Divider />

                {/* Profile */}
                <ListItemButton component={Link} to="/Teacher/profile">
                    <ListItemIcon>
                        <AccountCircleOutlinedIcon color={location.pathname === "/Teacher/profile" ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="My Profile" />
                </ListItemButton>

                {/* Logout */}
                <ListItemButton component={Link} to="/logout">
                    <ListItemIcon>
                        <ExitToAppIcon />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItemButton>
            </React.Fragment>
        </>
    );
};

export default TeacherSideBar;
