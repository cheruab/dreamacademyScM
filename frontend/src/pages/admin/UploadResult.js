import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  CircularProgress, 
  MenuItem, 
  Card, 
  CardContent,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { getAllParents } from '../../redux/studentsRelated/parentHandle';
import { getAllStudents } from '../../redux/studentRelated/studentHandle';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FolderIcon from '@mui/icons-material/Folder';

const UploadResult = ({ onUploadSuccess }) => {
  // Parent upload states 
  const [parentId, setParentId] = useState('');
  const [parentFile, setParentFile] = useState(null);
  const [parentUploading, setParentUploading] = useState(false);
  const [parentMessage, setParentMessage] = useState('');
  const [parentDescription, setParentDescription] = useState('');
  const [parentSubject, setParentSubject] = useState('');
  const [parentSemester, setParentSemester] = useState('');
  const [parentExamType, setParentExamType] = useState('');

  // Student upload states (worksheets/assignments)
  const [studentId, setStudentId] = useState('');
  const [studentFile, setStudentFile] = useState(null);
  const [studentUploading, setStudentUploading] = useState(false);
  const [studentMessage, setStudentMessage] = useState('');
  const [studentDescription, setStudentDescription] = useState('');
  const [uploadType, setUploadType] = useState('worksheet');
  const [studentSubject, setStudentSubject] = useState('');

  // Past exam upload states
  const [pastExamStudentId, setPastExamStudentId] = useState('');
  const [pastExamFile, setPastExamFile] = useState(null);
  const [pastExamUploading, setPastExamUploading] = useState(false);
  const [pastExamMessage, setPastExamMessage] = useState('');
  const [pastExamSubject, setPastExamSubject] = useState('');
  const [pastExamYear, setPastExamYear] = useState('');
  const [pastExamType, setPastExamType] = useState('');
  const [pastExamDescription, setPastExamDescription] = useState('');
  const [pastExamGrade, setPastExamGrade] = useState(''); // REQUIRED field

  // New state for fetching actual subjects
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  const dispatch = useDispatch();
  const { parentsList, loading: parentsLoading } = useSelector(state => state.parent);
  const { studentsList, loading: studentsLoading } = useSelector(state => state.student);
  const { currentUser } = useSelector(state => state.user);

  const examTypes = [
    'Mid-term Exam', 'Final Exam', 'Quiz', 'Unit Test', 'Practice Test',
    'Mock Exam', 'Sample Paper', 'Previous Year Paper', 'Monthly Test',
    'Class Test', 'Annual Exam', 'Pre-board Exam'
  ];

  const semesters = [
    'Semester 1', 'Semester 2', 'Semester 3', 'Semester 4',
    'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8',
    '1st Term', '2nd Term', '3rd Term', 'Annual'
  ];

  // UPDATED: More comprehensive grade options
  const grades = [
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6',
    'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12',
    'Kindergarten', 'Pre-K', 'Nursery'
  ];

  // Generate years (current year and 10 years back)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => (currentYear - i).toString());

  useEffect(() => {
    const adminId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");
    if (adminId && role) {
      dispatch(getAllParents(adminId, role));
      dispatch(getAllStudents(adminId));
    }
  }, [dispatch]);

  // Fetch actual subjects from database
  useEffect(() => {
    fetchAvailableSubjects();
  }, [currentUser]);

  const fetchAvailableSubjects = async () => {
    if (!currentUser?._id) return;
    
    setSubjectsLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/AllSubjects/${currentUser._id}`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const uniqueSubjects = [...new Set(data.map(subject => subject.subName))].sort();
        setAvailableSubjects(uniqueSubjects);
      } else {
        console.log('No subjects found or invalid response:', data);
        setAvailableSubjects([]);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setAvailableSubjects([
        'Mathematics', 'English', 'Science', 'Physics', 'Chemistry', 'Biology',
        'History', 'Geography', 'Computer Science', 'Economics'
      ]);
    } finally {
      setSubjectsLoading(false);
    }
  };

  // Handle parent file upload (exam results)
  const handleParentFileChange = e => {
    setParentFile(e.target.files[0]);
    setParentMessage('');
  };

  const handleParentSubmit = async e => {
    e.preventDefault();
    if (!parentId || !parentFile || !parentSubject || !parentSemester || !parentExamType) {
      setParentMessage('Please fill in all required fields.');
      return;
    }

    const formData = new FormData();
    formData.append('resultFile', parentFile);
    formData.append('parentId', parentId);
    formData.append('description', parentDescription);
    formData.append('subject', parentSubject);
    formData.append('semester', parentSemester);
    formData.append('examType', parentExamType);

    setParentUploading(true);
    setParentMessage('');

    try {
      await axios.post(`${process.env.REACT_APP_BASE_URL}/uploadResult`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setParentMessage('Exam result uploaded successfully!');
      setParentFile(null);
      setParentId('');
      setParentDescription('');
      setParentSubject('');
      setParentSemester('');
      setParentExamType('');

      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error(error);
      setParentMessage('Error uploading exam result.');
    } finally {
      setParentUploading(false);
    }
  };

  // Handle student file upload (worksheets/assignments)
  const handleStudentFileChange = e => {
    setStudentFile(e.target.files[0]);
    setStudentMessage('');
  };

  const handleStudentSubmit = async e => {
    e.preventDefault();
    if (!studentId || !studentFile || !uploadType || !studentSubject) {
      setStudentMessage('Please fill in all required fields.');
      return;
    }

    const formData = new FormData();
    formData.append('worksheetFile', studentFile);
    formData.append('studentId', studentId);
    formData.append('uploadType', uploadType);
    formData.append('description', studentDescription);
    formData.append('subject', studentSubject);

    setStudentUploading(true);
    setStudentMessage('');

    try {
      await axios.post(`${process.env.REACT_APP_BASE_URL}/upload-worksheet`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setStudentMessage(`${uploadType === 'worksheet' ? 'Worksheet' : 'Assignment'} uploaded successfully!`);
      setStudentFile(null);
      setStudentId('');
      setStudentDescription('');
      setUploadType('worksheet');
      setStudentSubject('');

      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error(error);
      setStudentMessage('Error uploading file.');
    } finally {
      setStudentUploading(false);
    }
  };

  // Handle past exam file upload
  const handlePastExamFileChange = e => {
    setPastExamFile(e.target.files[0]);
    setPastExamMessage('');
  };

  const handlePastExamSubmit = async e => {
    e.preventDefault();
    
    // UPDATED: More comprehensive validation including grade
    if (!pastExamStudentId || !pastExamFile || !pastExamSubject || !pastExamYear || !pastExamType || !pastExamGrade) {
      setPastExamMessage('Please fill in all required fields including Grade.');
      return;
    }

    const formData = new FormData();
    formData.append('pastExamFile', pastExamFile);
    formData.append('studentId', pastExamStudentId);
    formData.append('subject', pastExamSubject);
    formData.append('year', pastExamYear);
    formData.append('examType', pastExamType);
    formData.append('description', pastExamDescription);
    formData.append('grade', pastExamGrade); // IMPORTANT: Grade is required

    setPastExamUploading(true);
    setPastExamMessage('');

    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/upload-pastexam`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Past exam upload response:', response.data); // DEBUG

      setPastExamMessage('Past exam uploaded successfully!');
      setPastExamFile(null);
      setPastExamStudentId('');
      setPastExamSubject('');
      setPastExamYear('');
      setPastExamType('');
      setPastExamDescription('');
      setPastExamGrade(''); // Reset grade

      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error('Past exam upload error:', error);
      setPastExamMessage(error.response?.data?.message || 'Error uploading past exam.');
    } finally {
      setPastExamUploading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      
      <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
        Upload Management
      </Typography>
      
      <Grid container spacing={4}>
        {/* Parent Upload Section */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%', boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" color="primary">
                  Upload Exam Results
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Upload exam results for parents to view in their dashboard
              </Typography>

              <form onSubmit={handleParentSubmit}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Select Parent</InputLabel>
                  <Select
                    value={parentId}
                    onChange={e => setParentId(e.target.value)}
                    label="Select Parent"
                  >
                    {parentsLoading ? (
                      <MenuItem disabled>Loading parents...</MenuItem>
                    ) : (
                      parentsList?.map(parent => (
                        <MenuItem key={parent._id} value={parent._id}>
                          {parent.name} ({parent.email})
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Subject</InputLabel>
                  <Select
                    value={parentSubject}
                    onChange={e => setParentSubject(e.target.value)}
                    label="Subject"
                    disabled={subjectsLoading}
                  >
                    {subjectsLoading ? (
                      <MenuItem disabled>Loading subjects...</MenuItem>
                    ) : availableSubjects.length === 0 ? (
                      <MenuItem disabled>No subjects available</MenuItem>
                    ) : (
                      availableSubjects.map(subject => (
                        <MenuItem key={subject} value={subject}>
                          {subject}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Semester</InputLabel>
                  <Select
                    value={parentSemester}
                    onChange={e => setParentSemester(e.target.value)}
                    label="Semester"
                  >
                    {semesters.map(semester => (
                      <MenuItem key={semester} value={semester}>
                        {semester}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Exam Type</InputLabel>
                  <Select
                    value={parentExamType}
                    onChange={e => setParentExamType(e.target.value)}
                    label="Exam Type"
                  >
                    {examTypes.map(type => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  margin="normal"
                  label="Description (Optional)"
                  value={parentDescription}
                  onChange={e => setParentDescription(e.target.value)}
                  multiline
                  rows={2}
                  placeholder="e.g., Chapter 1-5 coverage, Advanced level..."
                />

                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Upload File (PDF, DOC, DOCX, JPG, PNG)
                  </Typography>
                  <input
                    type="file"
                    onChange={handleParentFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    style={{ 
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                    required
                  />
                </Box>

                <Button 
                  type="submit" 
                  variant="contained" 
                  fullWidth
                  disabled={parentUploading}
                  startIcon={<UploadFileIcon />}
                  sx={{ mt: 2 }}
                >
                  {parentUploading ? <CircularProgress size={24} /> : 'Upload Exam Result'}
                </Button>
              </form>

              {parentMessage && (
                <Typography 
                  sx={{ mt: 2 }} 
                  color={parentMessage.includes('successfully') ? 'success.main' : 'error.main'}
                >
                  {parentMessage}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Student Upload Section */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%', boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssignmentIcon sx={{ mr: 1, color: 'secondary.main' }} />
                <Typography variant="h5" color="secondary">
                  Upload Worksheets & Assignments
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Upload worksheets and assignments for students to access
              </Typography>

              <form onSubmit={handleStudentSubmit}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Select Student</InputLabel>
                  <Select
                    value={studentId}
                    onChange={e => setStudentId(e.target.value)}
                    label="Select Student"
                  >
                    {studentsLoading ? (
                      <MenuItem disabled>Loading students...</MenuItem>
                    ) : (
                      studentsList?.map(student => (
                        <MenuItem key={student._id} value={student._id}>
                          {student.name} - {student.rollNum} ({student.sclassName?.sclassName})
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Subject</InputLabel>
                  <Select
                    value={studentSubject}
                    onChange={e => setStudentSubject(e.target.value)}
                    label="Subject"
                    disabled={subjectsLoading}
                  >
                    {subjectsLoading ? (
                      <MenuItem disabled>Loading subjects...</MenuItem>
                    ) : availableSubjects.length === 0 ? (
                      <MenuItem disabled>No subjects available</MenuItem>
                    ) : (
                      availableSubjects.map(subject => (
                        <MenuItem key={subject} value={subject}>
                          {subject}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Upload Type</InputLabel>
                  <Select
                    value={uploadType}
                    onChange={e => setUploadType(e.target.value)}
                    label="Upload Type"
                  >
                    <MenuItem value="worksheet">Worksheet</MenuItem>
                    <MenuItem value="assignment">Assignment</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  margin="normal"
                  label="Description (Optional)"
                  value={studentDescription}
                  onChange={e => setStudentDescription(e.target.value)}
                  multiline
                  rows={2}
                  placeholder="e.g., Chapter 5 exercises, Home assignment..."
                />

                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Upload File (PDF, DOC, DOCX, JPG, PNG)
                  </Typography>
                  <input
                    type="file"
                    onChange={handleStudentFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    style={{ 
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                    required
                  />
                </Box>

                <Button 
                  type="submit" 
                  variant="contained" 
                  color="secondary"
                  fullWidth
                  disabled={studentUploading}
                  startIcon={<UploadFileIcon />}
                  sx={{ mt: 2 }}
                >
                  {studentUploading ? <CircularProgress size={24} /> : `Upload ${uploadType === 'worksheet' ? 'Worksheet' : 'Assignment'}`}
                </Button>
              </form>

              {studentMessage && (
                <Typography 
                  sx={{ mt: 2 }} 
                  color={studentMessage.includes('successfully') ? 'success.main' : 'error.main'}
                >
                  {studentMessage}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Past Exams Upload Section */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%', boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FolderIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h5" color="success.main">
                  Upload Past Exams
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Upload past exam papers organized by grade, subject and year
              </Typography>

              <form onSubmit={handlePastExamSubmit}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Select Student</InputLabel>
                  <Select
                    value={pastExamStudentId}
                    onChange={e => setPastExamStudentId(e.target.value)}
                    label="Select Student"
                  >
                    {studentsLoading ? (
                      <MenuItem disabled>Loading students...</MenuItem>
                    ) : (
                      studentsList?.map(student => (
                        <MenuItem key={student._id} value={student._id}>
                          {student.name} - {student.rollNum} ({student.sclassName?.sclassName})
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>

                {/* UPDATED: Grade field moved to top for emphasis */}
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Grade *</InputLabel>
                  <Select
                    value={pastExamGrade}
                    onChange={e => setPastExamGrade(e.target.value)}
                    label="Grade *"
                    error={!pastExamGrade}
                  >
                    {grades.map(grade => (
                      <MenuItem key={grade} value={grade}>
                        {grade}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Subject</InputLabel>
                  <Select
                    value={pastExamSubject}
                    onChange={e => setPastExamSubject(e.target.value)}
                    label="Subject"
                    disabled={subjectsLoading}
                  >
                    {subjectsLoading ? (
                      <MenuItem disabled>Loading subjects...</MenuItem>
                    ) : availableSubjects.length === 0 ? (
                      <MenuItem disabled>No subjects available</MenuItem>
                    ) : (
                      availableSubjects.map(subject => (
                        <MenuItem key={subject} value={subject}>
                          {subject}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={pastExamYear}
                    onChange={e => setPastExamYear(e.target.value)}
                    label="Year"
                  >
                    {years.map(year => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Exam Type</InputLabel>
                  <Select
                    value={pastExamType}
                    onChange={e => setPastExamType(e.target.value)}
                    label="Exam Type"
                  >
                    {examTypes.map(type => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  margin="normal"
                  label="Description (Optional)"
                  value={pastExamDescription}
                  onChange={e => setPastExamDescription(e.target.value)}
                  multiline
                  rows={2}
                  placeholder="e.g., Chapter 1-5, Advanced level..."
                />

                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Upload File (PDF, DOC, DOCX, JPG, PNG)
                  </Typography>
                  <input
                    type="file"
                    onChange={handlePastExamFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    style={{ 
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                    required
                  />
                </Box>

                <Button 
                  type="submit" 
                  variant="contained" 
                  color="success"
                  fullWidth
                  disabled={pastExamUploading}
                  startIcon={<UploadFileIcon />}
                  sx={{ mt: 2 }}
                >
                  {pastExamUploading ? <CircularProgress size={24} /> : 'Upload Past Exam'}
                </Button>
              </form>

              {pastExamMessage && (
                <Typography 
                  sx={{ mt: 2 }} 
                  color={pastExamMessage.includes('successfully') ? 'success.main' : 'error.main'}
                >
                  {pastExamMessage}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UploadResult;