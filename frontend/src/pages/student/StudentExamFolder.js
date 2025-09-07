import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Breadcrumbs,
  Link
} from '@mui/material';
import { useSelector } from 'react-redux';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DescriptionIcon from '@mui/icons-material/Description';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';

const StudentExamFolder = () => {
  // Data organized as: Grade -> Subject -> Year -> [files]
  const [examDataByGrade, setExamDataByGrade] = useState({});
  const [loading, setLoading] = useState(true);

  // Navigation state
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);

  // Files for the final level (Year)
  const [examFiles, setExamFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);

  // File viewer
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState(false);

  const { currentUser } = useSelector(state => state.user);

  useEffect(() => {
    if (currentUser?._id) {
      fetchPastExams();
    }
  }, [currentUser]);

  const fetchPastExams = async () => {
    try {
      setLoading(true);
      
      // Updated API call to use the new endpoint that returns Grade-organized data
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/student-pastexams/${currentUser._id}`
      );
      
      console.log('Received exam data:', response.data); // DEBUG
      
      // Data is already organized as Grade → Subject → Year → [files] from the backend
      setExamDataByGrade(response.data || {});
      
    } catch (error) {
      console.error('Error fetching past exams:', error);
      setExamDataByGrade({});
    } finally {
      setLoading(false);
    }
  };

  const loadFilesFor = async (grade, subject, year) => {
    setFilesLoading(true);
    try {
      const files = examDataByGrade?.[grade]?.[subject]?.[year] || [];
      setExamFiles(files);
      console.log(`Files for ${grade}/${subject}/${year}:`, files); // DEBUG
    } finally {
      setFilesLoading(false);
    }
  };

  const getFileUrl = (fileUrl) => {
    const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';
    const clean = fileUrl?.startsWith('/') ? fileUrl.slice(1) : fileUrl;
    return `${baseUrl}/${clean}`;
  };

  const handleViewFile = (examFile) => {
    setSelectedFile(examFile);
    setViewDialogOpen(true);
    setFileError(false);
  };

  const handleDownload = (fileUrl, filename) => {
    const fullUrl = getFileUrl(fileUrl);
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCloseDialog = () => {
    setViewDialogOpen(false);
    setSelectedFile(null);
    setFileError(false);
  };

  // Click handlers for each level
  const handleGradeClick = (grade) => {
    setSelectedGrade(grade);
    setSelectedSubject(null);
    setSelectedYear(null);
    setExamFiles([]);
    console.log('Selected grade:', grade); // DEBUG
  };

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
    setSelectedYear(null);
    setExamFiles([]);
    console.log('Selected subject:', subject); // DEBUG
  };

  const handleYearClick = async (year) => {
    setSelectedYear(year);
    console.log('Selected year:', year); // DEBUG
    await loadFilesFor(selectedGrade, selectedSubject, year);
  };

  // Breadcrumb navigation
  const handleBreadcrumbClick = (level) => {
    if (level === 'grades') {
      setSelectedGrade(null);
      setSelectedSubject(null);
      setSelectedYear(null);
      setExamFiles([]);
    } else if (level === 'subjects') {
      setSelectedSubject(null);
      setSelectedYear(null);
      setExamFiles([]);
    } else if (level === 'years') {
      setSelectedYear(null);
      setExamFiles([]);
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileExtension = (filename = '') => filename.split('.').pop()?.toLowerCase();

  const renderFileViewer = (examFile) => {
    if (!examFile) return null;

    const fileUrl = getFileUrl(examFile.fileUrl);
    const extension = getFileExtension(examFile.originalName);
    const mimeType = examFile.mimeType || '';

    // Images
    if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      return (
        <Box sx={{ textAlign: 'center', maxHeight: '70vh', overflow: 'auto', p: 2 }}>
          <img
            src={fileUrl}
            alt={examFile.originalName}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            onError={() => setFileError(true)}
          />
        </Box>
      );
    }

    // PDFs
    if (mimeType === 'application/pdf' || extension === 'pdf') {
      return (
        <Box sx={{ width: '100%', height: '70vh', p: 1 }}>
          <iframe
            src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            title={examFile.originalName}
            onError={() => setFileError(true)}
          />
        </Box>
      );
    }

    // Other types
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" gutterBottom>
          Preview not available for this file type
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          File: {examFile.originalName}
        </Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={() => handleDownload(examFile.fileUrl, examFile.originalName)}
        >
          Download File
        </Button>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading exam folders...
        </Typography>
      </Box>
    );
  }

  // Get sorted grades (Grade 1, Grade 2, etc.)
  const grades = Object.keys(examDataByGrade).sort((a, b) => {
    // Extract numbers from grade names for proper sorting
    const numA = parseInt(a.replace(/\D/g, '')) || 0;
    const numB = parseInt(b.replace(/\D/g, '')) || 0;
    return numA - numB;
  });

  console.log('Available grades:', grades); // DEBUG

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <FolderIcon sx={{ mr: 2, color: 'primary.main' }} />
        Exam Folder
      </Typography>

      {/* Breadcrumbs: Grades → Subject → Year */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
          <Link
            component="button"
            variant="body1"
            onClick={() => handleBreadcrumbClick('grades')}
            sx={{
              textDecoration: 'none',
              color: selectedGrade ? 'primary.main' : 'text.primary',
              fontWeight: selectedGrade ? 'normal' : 'bold'
            }}
          >
            Grade Folders
          </Link>

          {selectedGrade && (
            <Link
              component="button"
              variant="body1"
              onClick={() => handleBreadcrumbClick('subjects')}
              sx={{
                textDecoration: 'none',
                color: selectedSubject ? 'primary.main' : 'text.primary',
                fontWeight: selectedSubject ? 'normal' : 'bold'
              }}
            >
              {selectedGrade}
            </Link>
          )}

          {selectedSubject && (
            <Link
              component="button"
              variant="body1"
              onClick={() => handleBreadcrumbClick('years')}
              sx={{
                textDecoration: 'none',
                color: selectedYear ? 'primary.main' : 'text.primary',
                fontWeight: selectedYear ? 'normal' : 'bold'
              }}
            >
              {selectedSubject}
            </Link>
          )}

          {selectedYear && (
            <Typography color="text.primary" sx={{ fontWeight: 'bold' }}>
              {selectedYear}
            </Typography>
          )}
        </Breadcrumbs>
      </Box>

      {/* No data */}
      {grades.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <SchoolIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No past exam papers available yet.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Check back later for uploaded exam materials organized by grade.
          </Typography>
        </Box>
      ) : !selectedGrade ? (
        // GRADE VIEW - This is the primary view now
        <Box>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <FolderIcon sx={{ mr: 2, color: 'primary.main' }} />
            Select Grade Level
          </Typography>
          <Grid container spacing={3}>
            {grades.map((grade) => {
              const subjectCount = Object.keys(examDataByGrade[grade]).length;
              
              return (
                <Grid item xs={12} sm={6} md={4} key={grade}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                      border: '2px solid transparent',
                      '&:hover': { 
                        transform: 'translateY(-4px)', 
                        boxShadow: 6,
                        borderColor: 'primary.main'
                      }
                    }}
                    onClick={() => handleGradeClick(grade)}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <SchoolIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {grade}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {subjectCount} subject{subjectCount !== 1 ? 's' : ''} available
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Chip 
                          label={`${subjectCount} folders`} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      ) : !selectedSubject ? (
        // SUBJECT VIEW for selected grade
        <Box>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <FolderOpenIcon sx={{ mr: 2, color: 'secondary.main' }} />
            {selectedGrade} - Select Subject
          </Typography>

          <Grid container spacing={3}>
            {Object.keys(examDataByGrade[selectedGrade]).map((subject) => {
              const yearCount = Object.keys(examDataByGrade[selectedGrade][subject]).length;
              const years = Object.keys(examDataByGrade[selectedGrade][subject]);
              
              return (
                <Grid item xs={12} sm={6} md={4} key={subject}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                      border: '2px solid transparent',
                      '&:hover': { 
                        transform: 'translateY(-4px)', 
                        boxShadow: 6,
                        borderColor: 'secondary.main'
                      }
                    }}
                    onClick={() => handleSubjectClick(subject)}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <FolderOpenIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {subject}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {yearCount} year{yearCount !== 1 ? 's' : ''} available
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        {years.slice(0, 3).map((year) => (
                          <Chip key={year} label={year} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                        ))}
                        {years.length > 3 && (
                          <Chip
                            label={`+${years.length - 3} more`}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
})
        }
          </Grid>
        </Box>
      ) : !selectedYear ? (
        // YEAR VIEW for selected grade + subject
        <Box>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <FolderOpenIcon sx={{ mr: 2, color: 'success.main' }} />
            {selectedGrade} / {selectedSubject} - Select Year
          </Typography>
          <Grid container spacing={2}>
            {Object.keys(examDataByGrade[selectedGrade][selectedSubject])
              .sort((a, b) => Number(b) - Number(a))
              .map((year) => (
                <Grid item xs={12} sm={6} md={3} key={year}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }
                    }}
                    onClick={() => handleYearClick(year)}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <CalendarTodayIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                      <Typography variant="h6">{year}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {examDataByGrade[selectedGrade][selectedSubject][year].length} exam
                        {examDataByGrade[selectedGrade][selectedSubject][year].length !== 1 ? 's' : ''}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Box>
      ) : (
        // FILES VIEW for selected grade + subject + year
        <Box>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <DescriptionIcon sx={{ mr: 2, color: 'success.main' }} />
            {selectedGrade} / {selectedSubject} - {selectedYear}
          </Typography>

          {filesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : examFiles.length === 0 ? (
            <Alert severity="info">
              No exam files found for {selectedSubject} in {selectedYear}.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {examFiles.map((examFile) => (
                <Grid item xs={12} md={6} lg={4} key={examFile._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AssignmentIcon sx={{ mr: 1, color: 'success.main' }} />
                        <Typography variant="h6" component="div" sx={{ fontSize: '1rem' }}>
                          {examFile.originalName}
                        </Typography>
                      </Box>

                      {examFile.examType && (
                        <Chip label={examFile.examType} color="success" size="small" sx={{ mb: 2 }} />
                      )}

                      {examFile.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {examFile.description}
                        </Typography>
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CalendarTodayIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          Uploaded: {formatDate(examFile.uploadedAt)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          {examFile.uploadedBy ? `By: ${examFile.uploadedBy}` : ''}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleViewFile(examFile)}
                          >
                            View
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleDownload(examFile.fileUrl, examFile.originalName)}
                          >
                            Download
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* File Viewer Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { height: '90vh' } }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {selectedFile?.originalName}
            </Typography>
            <Button
              onClick={handleCloseDialog}
              size="small"
              sx={{ minWidth: 'auto', p: 1 }}
            >
              <CloseIcon />
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 2 }}>
          {fileError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              Unable to load file. The file may not exist or there may be a server error.
              <br />
              <strong>File path:</strong> {selectedFile ? getFileUrl(selectedFile.fileUrl) : 'N/A'}
            </Alert>
          ) : (
            renderFileViewer(selectedFile)
          )}
        </DialogContent>

        <DialogActions>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => selectedFile && handleDownload(selectedFile.fileUrl, selectedFile.originalName)}
          >
            Download
          </Button>
          <Button variant="outlined" onClick={handleCloseDialog}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentExamFolder;