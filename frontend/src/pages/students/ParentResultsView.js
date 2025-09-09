// Replace the entire ParentResultsView.js with this updated version

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  CircularProgress,
  Divider,
  Chip,
  Alert,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useSelector } from 'react-redux';
import DownloadIcon from '@mui/icons-material/Download';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DescriptionIcon from '@mui/icons-material/Description';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import SchoolIcon from '@mui/icons-material/School';

const ParentResultsView = () => {
  const [organizedResults, setOrganizedResults] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Navigation state for folder view
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [currentResults, setCurrentResults] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  
  // File viewer
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState(false);

  const { currentUser } = useSelector(state => state.user);

  useEffect(() => {
    if (currentUser?._id) {
      fetchResults();
    }
  }, [currentUser]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/parent-results/${currentUser._id}`
      );
      setOrganizedResults(response.data);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
    setSelectedSemester(null);
    setCurrentResults([]);
    setBreadcrumbs([{ type: 'subject', value: subject }]);
  };

  const handleSemesterClick = (semester) => {
    setSelectedSemester(semester);
    const semesterResults = organizedResults[selectedSubject][semester] || [];
    setCurrentResults(semesterResults);
    setBreadcrumbs([
      { type: 'subject', value: selectedSubject },
      { type: 'semester', value: semester }
    ]);
  };

  const handleBreadcrumbClick = (index) => {
    if (index === 0) {
      // Clicked on "Subject Folders"
      setSelectedSubject(null);
      setSelectedSemester(null);
      setCurrentResults([]);
      setBreadcrumbs([]);
    } else if (index === 1 && breadcrumbs.length > 1) {
      // Clicked on subject breadcrumb
      setSelectedSemester(null);
      setCurrentResults([]);
      setBreadcrumbs([{ type: 'subject', value: selectedSubject }]);
    }
  };

  const getFileUrl = (fileUrl) => {
    const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';
    const cleanFileUrl = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
    return `${baseUrl}/${cleanFileUrl}`;
  };

  const handleViewFile = (result) => {
    setSelectedFile(result);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileExtension = (filename) => {
    return filename?.split('.').pop()?.toLowerCase() || '';
  };

  const renderFileViewer = (result) => {
    if (!result) return null;

    const fileUrl = getFileUrl(result.fileUrl);
    const extension = getFileExtension(result.originalName);
    const mimeType = result.mimeType || '';

    // Handle images
    if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      return (
        <Box sx={{ textAlign: 'center', maxHeight: '70vh', overflow: 'auto', p: 2 }}>
          <img
            src={fileUrl}
            alt={result.originalName}
            style={{ 
              maxWidth: '100%', 
              maxHeight: '100%', 
              objectFit: 'contain',
              border: '1px solid #ddd',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}
            onError={() => setFileError(true)}
          />
        </Box>
      );
    }

    // Handle PDFs
    if (mimeType === 'application/pdf' || extension === 'pdf') {
      return (
        <Box sx={{ width: '100%', height: '70vh', p: 1 }}>
          <iframe
            src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
            width="100%"
            height="100%"
            style={{ border: 'none', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
            title={result.originalName}
            onError={() => setFileError(true)}
          />
        </Box>
      );
    }

    // For other file types, show download option
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" gutterBottom>
          Preview not available for this file type
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          File: {result.originalName}
        </Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={() => handleDownload(result.fileUrl, result.originalName)}
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
          Loading exam results...
        </Typography>
      </Box>
    );
  }

  const subjects = Object.keys(organizedResults).sort();
  const semesters = selectedSubject ? Object.keys(organizedResults[selectedSubject] || {}).sort() : [];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <FolderIcon sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
        <Typography variant="h4" gutterBottom>
          {currentUser?.children?.[0]?.name || 'Child'}'s Exam Results
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link
              component="button"
              variant="body1"
              onClick={() => handleBreadcrumbClick(0)}
              sx={{
                textDecoration: 'none',
                color: 'primary.main',
                fontWeight: 'normal'
              }}
            >
              Subject Folders
            </Link>
            
            {breadcrumbs.map((crumb, index) => (
              <Link
                key={index}
                component="button"
                variant="body1"
                onClick={() => handleBreadcrumbClick(index + 1)}
                sx={{
                  textDecoration: 'none',
                  color: index === breadcrumbs.length - 1 ? 'text.primary' : 'primary.main',
                  fontWeight: index === breadcrumbs.length - 1 ? 'bold' : 'normal'
                }}
              >
                {crumb.value}
              </Link>
            ))}
          </Breadcrumbs>
        </Box>
      )}

      {subjects.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <AssessmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No exam results available yet.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Exam results will appear here once uploaded by the school administration.
          </Typography>
        </Box>
      ) : !selectedSubject ? (
        // SUBJECT FOLDERS VIEW
        <Box>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <FolderIcon sx={{ mr: 2, color: 'primary.main' }} />
            Select Subject
          </Typography>
          <Grid container spacing={3}>
            {subjects.map((subject) => {
              const subjectData = organizedResults[subject];
              const semesterCount = Object.keys(subjectData).length;
              const totalFiles = Object.values(subjectData).reduce((sum, semester) => sum + semester.length, 0);
              
              // Get exam types in this subject
              const allFiles = Object.values(subjectData).flat();
              const examTypes = [...new Set(allFiles.map(r => r.examType).filter(Boolean))];

              return (
                <Grid item xs={12} sm={6} md={4} key={subject}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        transform: 'translateY(-4px)', 
                        boxShadow: 6,
                        borderColor: 'primary.main'
                      },
                      border: '2px solid transparent'
                    }}
                    onClick={() => handleSubjectClick(subject)}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <FolderOpenIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {subject}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {totalFiles} exam result{totalFiles !== 1 ? 's' : ''} across {semesterCount} semester{semesterCount !== 1 ? 's' : ''}
                      </Typography>
                      
                      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {examTypes.length > 0 && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.5 }}>
                            {examTypes.slice(0, 3).map((type) => (
                              <Chip key={type} label={type} size="small" color="primary" variant="outlined" />
                            ))}
                            {examTypes.length > 3 && (
                              <Chip
                                label={`+${examTypes.length - 3}`}
                                size="small"
                                variant="outlined"
                                color="primary"
                              />
                            )}
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      ) : !selectedSemester ? (
        // SEMESTER FOLDERS VIEW
        <Box>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <FolderOpenIcon sx={{ mr: 2, color: 'secondary.main' }} />
            {selectedSubject} - Select Semester
          </Typography>
          <Grid container spacing={3}>
            {semesters.map((semester) => {
              const semesterResults = organizedResults[selectedSubject][semester] || [];
              const resultCount = semesterResults.length;
              
              // Get exam types in this semester
              const examTypes = [...new Set(semesterResults.map(r => r.examType).filter(Boolean))];

              return (
                <Grid item xs={12} sm={6} md={4} key={semester}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        transform: 'translateY(-4px)', 
                        boxShadow: 6,
                        borderColor: 'secondary.main'
                      },
                      border: '2px solid transparent'
                    }}
                    onClick={() => handleSemesterClick(semester)}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <FolderOpenIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {semester}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {resultCount} exam result{resultCount !== 1 ? 's' : ''} available
                      </Typography>
                      
                      {examTypes.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.5 }}>
                          {examTypes.slice(0, 2).map((type) => (
                            <Chip key={type} label={type} size="small" color="secondary" variant="outlined" />
                          ))}
                          {examTypes.length > 2 && (
                            <Chip
                              label={`+${examTypes.length - 2}`}
                              size="small"
                              variant="outlined"
                              color="secondary"
                            />
                          )}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      ) : (
        // RESULTS VIEW for selected subject and semester
        <Box>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <FolderOpenIcon sx={{ mr: 2, color: 'success.main' }} />
            {selectedSubject} - {selectedSemester} - Exam Results
          </Typography>

          {currentResults.length === 0 ? (
            <Alert severity="info">
              No exam results found for {selectedSubject} - {selectedSemester}.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {currentResults.map((result, index) => (
                <Grid item xs={12} md={6} lg={4} key={result._id || index}>
                  <Card sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4
                    }
                  }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" component="div" noWrap>
                          {result.originalName || `Exam Result ${index + 1}`}
                        </Typography>
                      </Box>

                      {/* Exam Type and Semester Chips */}
                      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {result.examType && (
                          <Chip label={result.examType} color="primary" size="small" />
                        )}
                        {result.semester && (
                          <Chip label={result.semester} color="secondary" size="small" />
                        )}
                      </Box>

                      {result.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {result.description}
                        </Typography>
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CalendarTodayIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          Uploaded: {formatDate(result.uploadedAt)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewFile(result)}
                        >
                          View
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<DownloadIcon />}
                          onClick={() => handleDownload(result.fileUrl, result.originalName)}
                        >
                          Download
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Information Box */}
      <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Note:</strong> Exam results are uploaded by school administration and organized by subject and semester. 
          If you have questions about any results, please contact the school office or submit a complaint through the system.
        </Typography>
      </Box>

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

export default ParentResultsView;