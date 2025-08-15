import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import { BottomNavigation, BottomNavigationAction, Container, Paper, Table, TableBody, TableHead, Typography, Divider } from '@mui/material';
import CustomBarChart from '../../components/CustomBarChart';

import InsertChartIcon from '@mui/icons-material/InsertChart';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import TableChartIcon from '@mui/icons-material/TableChart';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import { StyledTableCell, StyledTableRow } from '../../components/styles';
import axios from 'axios';

const StudentSubjects = ({ studentId, child }) => {
    const dispatch = useDispatch();

    const { userDetails, loading } = useSelector((state) => state.user);

    const [subjectMarks, setSubjectMarks] = useState([]);
    const [enrolledSubjects, setEnrolledSubjects] = useState([]);
    const [selectedSection, setSelectedSection] = useState('table');

    // Fetch student details (for marks)
    useEffect(() => {
        if (studentId) {
            dispatch(getUserDetails(studentId, "Student"));
        }
    }, [dispatch, studentId]);

    // When userDetails changes, update marks
    useEffect(() => {
        if (userDetails) {
            setSubjectMarks(userDetails.examResult || []);
        }
    }, [userDetails]);

    // Fetch enrolled subjects by student's class ID
    useEffect(() => {
        const fetchSubjectsByClass = async () => {
            if (child && child.sclassName && child.sclassName._id) {
                try {
                    const response = await axios.get(`http://localhost:5000/ClassSubjects/${child.sclassName._id}`);
                    setEnrolledSubjects(response.data);
                } catch (err) {
                    console.error("Failed to fetch subjects by class:", err);
                    setEnrolledSubjects([]);
                }
            }
        };
        fetchSubjectsByClass();
    }, [child]);

    const handleSectionChange = (event, newSection) => {
        setSelectedSection(newSection);
    };

    const renderSubjectsSection = () => (
        <Container sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Enrolled Subjects
            </Typography>
            {enrolledSubjects.length > 0 ? (
                enrolledSubjects.map((subject, index) => (
                    <Typography key={index} variant="subtitle1" sx={{ mb: 1 }}>
                        {subject.subName || subject.name || subject.subjectName /* adjust based on your subject model */}
                    </Typography>
                ))
            ) : (
                <Typography>No subjects found for this student</Typography>
            )}
            <Divider sx={{ mt: 3 }} />
        </Container>
    );

    const renderTableSection = () => (
  <>
    <Typography variant="h4" gutterBottom>
      Subject Marks
    </Typography>
    <Table>
      <TableHead>
        <StyledTableRow>
          <StyledTableCell>Subject</StyledTableCell>
          <StyledTableCell>Marks</StyledTableCell>
        </StyledTableRow>
      </TableHead>
      <TableBody>
        {subjectMarks.map((result, index) => {
          if (!result.subName || result.marksObtained === undefined) {
            return null;
          }
          return (
            <StyledTableRow key={index}>
              <StyledTableCell>
                {result.subName?.subName || result.subName?.name || "Unknown Subject"}
              </StyledTableCell>
              <StyledTableCell>{result.marksObtained}</StyledTableCell>
            </StyledTableRow>
          );
        })}
      </TableBody>
    </Table>
  </>
);


    const renderChartSection = () => (
        <CustomBarChart chartData={subjectMarks} dataKey="marksObtained" />
    );

    return (
        <>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <div>
                    {/* Always render subjects first */}
                    {renderSubjectsSection()}

                    {/* Then render marks only if present */}
                    {subjectMarks && subjectMarks.length > 0 ? (
                        <>
                            {selectedSection === 'table' && renderTableSection()}
                            {selectedSection === 'chart' && renderChartSection()}

                            <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
                                <BottomNavigation value={selectedSection} onChange={handleSectionChange} showLabels>
                                    <BottomNavigationAction
                                        label="Table"
                                        value="table"
                                        icon={selectedSection === 'table' ? <TableChartIcon /> : <TableChartOutlinedIcon />}
                                    />
                                    <BottomNavigationAction
                                        label="Chart"
                                        value="chart"
                                        icon={selectedSection === 'chart' ? <InsertChartIcon /> : <InsertChartOutlinedIcon />}
                                    />
                                </BottomNavigation>
                            </Paper>
                        </>
                    ) : (
                        <Typography sx={{ mt: 2 }}>No marks found for this student.</Typography>
                    )}
                </div>
            )}
        </>
    );
};

export default StudentSubjects;
