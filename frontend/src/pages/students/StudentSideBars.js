import * as React from 'react';
import { Divider, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

// Updated icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SchoolIcon from '@mui/icons-material/School';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

const StudentSideBars = () => {
    const location = useLocation();
    return (
        <div style={{ 
            backgroundColor: '#1a1f2e', 
            minHeight: '100vh', 
            color: '#e2e8f0',
            borderRight: '1px solid #334155'
        }}>
            <React.Fragment>
                <ListItemButton 
                    component={Link} 
                    to="/Parent/dashboard"
                    sx={{ 
                        color: '#e2e8f0',
                        '&:hover': { backgroundColor: '#334155' }
                    }}
                >
                    <ListItemIcon>
                        <DashboardIcon sx={{ color: location.pathname === ("/" || "/Parent/dashboard") ? '#60a5fa' : '#94a3b8' }} />
                    </ListItemIcon>
                    <ListItemText primary="Dashboard" sx={{ color: '#e2e8f0' }} />
                </ListItemButton>
                <ListItemButton 
                    component={Link} 
                    to="/Parent/child-subjects"
                    sx={{ 
                        color: '#e2e8f0',
                        '&:hover': { backgroundColor: '#334155' }
                    }}
                >
                    <ListItemIcon>
                        <SchoolIcon sx={{ color: location.pathname.startsWith("/Parent/child-subjects") ? '#60a5fa' : '#94a3b8' }} />
                    </ListItemIcon>
                    <ListItemText primary="Child's Subjects" sx={{ color: '#e2e8f0' }} />
                </ListItemButton>
                <ListItemButton 
                    component={Link} 
                    to="/Parent/child-attendance"
                    sx={{ 
                        color: '#e2e8f0',
                        '&:hover': { backgroundColor: '#334155' }
                    }}
                >
                    <ListItemIcon>
                        <EventAvailableIcon sx={{ color: location.pathname.startsWith("/Parent/child-attendance") ? '#60a5fa' : '#94a3b8' }} />
                    </ListItemIcon>
                    <ListItemText primary="Child's Attendance" sx={{ color: '#e2e8f0' }} />
                </ListItemButton>
                <ListItemButton 
                    component={Link} 
                    to="/Parent/results"
                    sx={{ 
                        color: '#e2e8f0',
                        '&:hover': { backgroundColor: '#334155' }
                    }}
                >
                    <ListItemIcon>
                        <AssessmentIcon sx={{ color: location.pathname.startsWith("/Parent/results") ? '#60a5fa' : '#94a3b8' }} />
                    </ListItemIcon>
                    <ListItemText primary="School Exam results" sx={{ color: '#e2e8f0' }} />
                </ListItemButton> 
                <ListItemButton 
                    component={Link} 
                    to="/Parent/packages"
                    sx={{ 
                        color: '#e2e8f0',
                        '&:hover': { backgroundColor: '#334155' }
                    }}
                >
                    <ListItemIcon>
                        <LocalOfferIcon sx={{ color: location.pathname.startsWith("/Parent/packages") ? '#60a5fa' : '#94a3b8' }} />
                    </ListItemIcon>
                    <ListItemText primary="Our Packages" sx={{ color: '#e2e8f0' }} />
                </ListItemButton>
                <ListItemButton 
                    component={Link} 
                    to="/Parent/complain"
                    sx={{ 
                        color: '#e2e8f0',
                        '&:hover': { backgroundColor: '#334155' }
                    }}
                >
                    <ListItemIcon>
                        <ReportProblemIcon sx={{ color: location.pathname.startsWith("/Parent/complain") ? '#60a5fa' : '#94a3b8' }} />
                    </ListItemIcon>
                    <ListItemText primary="Complaints" sx={{ color: '#e2e8f0' }} />
                </ListItemButton>
            </React.Fragment>
            <Divider sx={{ my: 1, backgroundColor: '#475569' }} />
            <React.Fragment>
                <ListSubheader 
                    component="div" 
                    inset
                    sx={{ 
                        backgroundColor: 'transparent',
                        color: '#94a3b8'
                    }}
                >
                    User
                </ListSubheader>
                <ListItemButton 
                    component={Link} 
                    to="/Parent/child-profile"
                    sx={{ 
                        color: '#e2e8f0',
                        '&:hover': { backgroundColor: '#334155' }
                    }}
                >
                    <ListItemIcon>
                        <AccountCircleIcon sx={{ color: location.pathname.startsWith("/Parent/child-profile") ? '#60a5fa' : '#94a3b8' }} />
                    </ListItemIcon>
                    <ListItemText primary="Child's Profile" sx={{ color: '#e2e8f0' }} />
                </ListItemButton>
                <ListItemButton 
                    component={Link} 
                    to="/logout"
                    sx={{ 
                        color: '#e2e8f0',
                        '&:hover': { backgroundColor: '#334155' }
                    }}
                >
                    <ListItemIcon>
                        <LogoutIcon sx={{ color: location.pathname.startsWith("/logout") ? '#60a5fa' : '#94a3b8' }} />
                    </ListItemIcon>
                    <ListItemText primary="Logout" sx={{ color: '#e2e8f0' }} />
                </ListItemButton>
            </React.Fragment>
        </div>
    )
}

export default StudentSideBars;