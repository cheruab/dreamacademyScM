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

const UploadResult = ({ onUploadSuccess }) => {
  // Parent upload states 
  const [parentId, setParentId] = useState('');
  const [parentFile, setParentFile] = useState(null);
  const [parentUploading, setParentUploading] = useState(false);
  const [parentMessage, setParentMessage] = useState('');
  const [parentDescription, setParentDescription] = useState('');

  // Student upload states
  const [studentId, setStudentId] = useState('');
  const [studentFile, setStudentFile] = useState(null);
  const [studentUploading, setStudentUploading] = useState(false);
  const [studentMessage, setStudentMessage] = useState('');
  const [studentDescription, setStudentDescription] = useState('');
  const [uploadType, setUploadType] = useState('worksheet'); // 'worksheet' or 'assignment'

  const dispatch = useDispatch();
  const { parentsList, loading: parentsLoading } = useSelector(state => state.parent);
  const { studentsList, loading: studentsLoading } = useSelector(state => state.student);

  useEffect(() => {
    const adminId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");
    if (adminId && role) {
      dispatch(getAllParents(adminId, role));
      dispatch(getAllStudents(adminId)); // Fetch students for worksheet/assignment uploads
    }
  }, [dispatch]);

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

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
        Upload Management
      </Typography>
      
      <Grid container spacing={4}>
        {/* Parent Upload Section */}
        <Grid item xs={12} md={6}>
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
        <Grid item xs={12} md={6}>
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
                  placeholder="e.g., Math worksheet Chapter 5, Science assignment on photosynthesis..."
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
      </Grid>
    </Box>
  );
};

export default UploadResult;