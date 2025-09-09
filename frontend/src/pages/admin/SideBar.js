import * as React from 'react';
import {
  Divider,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Box,
  Typography,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

import HomeIcon from "@mui/icons-material/Home";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import ReportIcon from '@mui/icons-material/Report';
import AssignmentIcon from '@mui/icons-material/Assignment';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';

// Define theme colors
const sidebarTheme = {
  background: '#1E293B',
  text: '#E2E8F0',
  textHover: '#F8FAFC',
  primary: '#3B82F6',
  primaryLight: '#60A5FA',
  divider: '#334155',
  subheaderBg: '#334155',
  subheaderText: '#94A3B8',
};

const SideBar = () => {
  const location = useLocation();

  // Helper to check active route
  const isActive = (path) => {
    if (path === "/") return location.pathname === "/" || location.pathname === "/Admin/dashboard";
    return location.pathname.startsWith(path);
  };

  return (
    <Box
      sx={{
        width: 280,
        height: '100vh',
        backgroundColor: sidebarTheme.background,
        color: sidebarTheme.text,
        display: 'flex',
        flexDirection: 'column',
        py: 2,
        px: 1.5,
        overflowY: 'auto',
        '&::-webkit-scrollbar': { display: 'none' }, // Hide scrollbar
      }}
    >
      {/* Logo / Branding (Optional) */}
      <Box sx={{ mb: 3, px: 2 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: sidebarTheme.primary,
            letterSpacing: '0.5px',
          }}
        >
          EduAdmin
        </Typography>
      </Box>

      {/* Main Navigation */}
      <Box sx={{ flexGrow: 1 }}>
        {[
          { to: "/", icon: <HomeIcon />, label: "Home" },
          { to: "/Admin/classes", icon: <ClassOutlinedIcon />, label: "Classes" },
          { to: "/Admin/subjects", icon: <AssignmentIcon />, label: "Subjects" },
          { to: "/Admin/teachers", icon: <SupervisorAccountOutlinedIcon />, label: "Teachers" },
          { to: "/Admin/students", icon: <PersonOutlineIcon />, label: "Students" },
          { to: "/Admin/parents", icon: <FamilyRestroomIcon />, label: "Parents" },
          { to: "/Admin/uploadresult", icon: <UploadFileIcon />, label: "File Uploads" },
          { to: "/Admin/notices", icon: <AnnouncementOutlinedIcon />, label: "Notices" },
          { to: "/Admin/complains", icon: <ReportIcon />, label: "Complains" },
        ].map((item, index) => (
          <ListItemButton
            key={index}
            component={Link}
            to={item.to}
            sx={{
              borderRadius: '8px',
              mb: 0.75,
              pl: 2.5,
              py: 1.2,
              color: isActive(item.to) ? sidebarTheme.primary : sidebarTheme.text,
              backgroundColor: isActive(item.to) ? `${sidebarTheme.primary}10` : 'transparent',
              '&:hover': {
                backgroundColor: `${sidebarTheme.primary}15`,
                color: sidebarTheme.textHover,
                transform: 'translateX(4px)',
                transition: 'all 0.2s ease',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: 'inherit',
              }}
            >
              {React.cloneElement(item.icon, {
                sx: {
                  fontSize: 22,
                },
              })}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontWeight: isActive(item.to) ? 600 : 500,
                fontSize: '15px',
              }}
            />
          </ListItemButton>
        ))}
      </Box>

      {/* Divider */}
      <Divider sx={{ my: 2, borderColor: sidebarTheme.divider }} />

      {/* User Section */}
      <Box>
        <ListSubheader
          component="div"
          sx={{
            backgroundColor: sidebarTheme.subheaderBg,
            color: sidebarTheme.subheaderText,
            fontSize: '12px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            pl: 2.5,
            py: 1,
            borderRadius: '6px',
            mb: 1,
          }}
        >
          User
        </ListSubheader>

        {[
          { to: "/Admin/profile", icon: <AccountCircleOutlinedIcon />, label: "Profile" },
          { to: "/logout", icon: <ExitToAppIcon />, label: "Logout" },
        ].map((item, index) => (
          <ListItemButton
            key={index}
            component={Link}
            to={item.to}
            sx={{
              borderRadius: '8px',
              mb: 0.75,
              pl: 2.5,
              py: 1.2,
              color: isActive(item.to) ? sidebarTheme.primary : sidebarTheme.text,
              backgroundColor: isActive(item.to) ? `${sidebarTheme.primary}10` : 'transparent',
              '&:hover': {
                backgroundColor: `${sidebarTheme.primary}15`,
                color: sidebarTheme.textHover,
                transform: 'translateX(4px)',
                transition: 'all 0.2s ease',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: 'inherit',
              }}
            >
              {React.cloneElement(item.icon, {
                sx: {
                  fontSize: 22,
                },
              })}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontWeight: isActive(item.to) ? 600 : 500,
                fontSize: '15px',
              }}
            />
          </ListItemButton>
        ))}
      </Box>
    </Box>
  );
};

export default SideBar;