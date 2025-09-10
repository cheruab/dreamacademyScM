import { Box, Typography, List, ListItem, ListItemText, Avatar } from '@mui/material';

const StudentProfiles = ({ childData }) => {
    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Avatar sx={{ width: 100, height: 100, mr: 3 }} />
                <Box>
                    <Typography variant="h4">{childData?.name}</Typography>
                    <Typography variant="subtitle1">Roll Number: {childData?.rollNum}</Typography>
                    <Typography variant="subtitle1">Class: {childData?.sclassName.sclassName}</Typography>
                    <Typography variant="subtitle1">School: {childData?.school?.schoolName}</Typography>
                </Box>
            </Box>
            
        </Box>
    );
};

export default StudentProfiles;