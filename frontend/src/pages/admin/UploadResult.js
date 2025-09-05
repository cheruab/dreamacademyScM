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
import { getAllStudents } from '../../redux/studentRelated/studentHandle'; // Assuming this exists
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

  // Student upload states (worksheets/assignments)
  const [studentId, setStudentId] = useState('');
  const [studentFile, setStudentFile] = useState(null);
  const [studentUploading, setStudentUploading] = useState(false);
  const [studentMessage, setStudentMessage] = useState('');
  const [studentDescription, setStudentDescription] = useState('');
  const [uploadType, setUploadType] = useState('worksheet'); // 'worksheet' or 'assignment'

  // Past exam upload states
  const [pastExamStudentId, setPastExamStudentId] = useState('');
  const [pastExamFile, setPastExamFile] = useState(null);
  const [pastExamUploading, setPastExamUploading] = useState(false);
  const [pastExamMessage, setPastExamMessage] = useState('');
  const [pastExamSubject, setPastExamSubject] = useState('');
  const [pastExamYear, setPastExamYear] = useState('');
  const [pastExamType, setPastExamType] = useState('');
  const [pastExamDescription, setPastExamDescription] = useState('');

  // New state for fetching actual subjects
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  const dispatch = useDispatch();
  const { parentsList, loading: parentsLoading } = useSelector(state => state.parent);
  const { studentsList, loading: studentsLoading } = useSelector(state => state.student);
  const { currentUser } = useSelector(state => state.user);

  const examTypes = [
    'Mid-term Exam', 'Final Exam', 'Quiz', 'Unit Test', 'Practice Test',
    'Mock Exam', 'Sample Paper', 'Previous Year Paper'
  ];

  // Generate years (current year and 10 years back)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => (currentYear - i).toString());

  useEffect(() => {
    const adminId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");
    if (adminId && role) {
      dispatch(getAllParents(adminId, role));
      dispatch(getAllStudents(adminId)); // Fetch students for worksheet/assignment uploads
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
      // Try the same endpoint that ClassDetails.js uses for fetching subjects
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/AllSubjects/${currentUser._id}`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        // Extract unique subject names from the response
        const uniqueSubjects = [...new Set(data.map(subject => subject.subName))].sort();
        setAvailableSubjects(uniqueSubjects);
      } else {
        console.log('No subjects found or invalid response:', data);
        setAvailableSubjects([]);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      // Fallback: if the API doesn't exist, use some common subjects as backup
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
    if (!parentId || !parentFile) {
      setParentMessage('Please select a parent and a file.');
      return;
    }

    const formData = new FormData();
    formData.append('resultFile', parentFile);
    formData.append('parentId', parentId);
    formData.append('description', parentDescription);

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
    if (!studentId || !studentFile || !uploadType) {
      setStudentMessage('Please select a student, file, and upload type.');
      return;
    }

    const formData = new FormData();
    formData.append('worksheetFile', studentFile);
    formData.append('studentId', studentId);
    formData.append('uploadType', uploadType);
    formData.append('description', studentDescription);

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
    if (!pastExamStudentId || !pastExamFile || !pastExamSubject || !pastExamYear || !pastExamType) {
      setPastExamMessage('Please fill in all required fields and select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('pastExamFile', pastExamFile);
    formData.append('studentId', pastExamStudentId);
    formData.append('subject', pastExamSubject);
    formData.append('year', pastExamYear);
    formData.append('examType', pastExamType);
    formData.append('description', pastExamDescription);

    setPastExamUploading(true);
    setPastExamMessage('');

    try {
      await axios.post(`${process.env.REACT_APP_BASE_URL}/upload-pastexam`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setPastExamMessage('Past exam uploaded successfully!');
      setPastExamFile(null);
      setPastExamStudentId('');
      setPastExamSubject('');
      setPastExamYear('');
      setPastExamType('');
      setPastExamDescription('');

      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error(error);
      setPastExamMessage('Error uploading past exam.');
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

                <TextField
                  fullWidth
                  margin="normal"
                  label="Description (Optional)"
                  value={parentDescription}
                  onChange={e => setParentDescription(e.target.value)}
                  multiline
                  rows={2}
                  placeholder="e.g., Mid-term exam results, Final grades..."
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
                  placeholder="e.g., Math worksheet Chapter 5, Science assignment..."
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

        {/* Past Exams Upload Section - FIXED */}
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
                Upload past exam papers organized by subject and year
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

                {/* FIXED: Use actual subjects from database instead of hardcoded list */}
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