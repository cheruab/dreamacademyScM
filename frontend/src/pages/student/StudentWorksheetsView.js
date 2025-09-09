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
  Tab,
  Tabs,
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
import AssignmentIcon from '@mui/icons-material/Assignment';
import WorkIcon from '@mui/icons-material/Work';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const StudentWorksheetsView = () => {
  const [allWorksheets, setAllWorksheets] = useState([]);
  const [worksheetsBySubject, setWorksheetsBySubject] = useState({});
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState(false);
  
  // Navigation state for folder view
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [currentFiles, setCurrentFiles] = useState([]);
  
  const { currentUser } = useSelector(state => state.user);

  useEffect(() => {
    if (currentUser?._id) {
      fetchWorksheets();
    }
  }, [currentUser]);

  const fetchWorksheets = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/student-worksheets/${currentUser._id}`
      );
      const worksheets = response.data;
      setAllWorksheets(worksheets);
      
      // Organize worksheets by subject
      const organized = {};
      worksheets.forEach(worksheet => {
        const subject = worksheet.subject || 'General';
        if (!organized[subject]) {
          organized[subject] = [];
        }
        organized[subject].push(worksheet);
      });
      
      setWorksheetsBySubject(organized);
    } catch (error) {
      console.error('Error fetching worksheets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Reset folder navigation when changing tabs
    setSelectedSubject(null);
    setCurrentFiles([]);
  };

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
    const subjectWorksheets = worksheetsBySubject[subject] || [];
    
    // Filter by current tab
    const filteredFiles = filterWorksheetsByTab(subjectWorksheets);
    setCurrentFiles(filteredFiles);
  };

  const handleBreadcrumbClick = () => {
    setSelectedSubject(null);
    setCurrentFiles([]);
  };

  const filterWorksheetsByTab = (worksheets) => {
    if (tabValue === 0) return worksheets; // All
    if (tabValue === 1) return worksheets.filter(w => w.uploadType === 'worksheet');
    if (tabValue === 2) return worksheets.filter(w => w.uploadType === 'assignment');
    return worksheets;
  };

  const getFileUrl = (fileUrl) => {
    const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';
    const cleanFileUrl = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
    return `${baseUrl}/${cleanFileUrl}`;
  };

  const handleViewFile = (worksheet) => {
    setSelectedFile(worksheet);
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
    return filename.split('.').pop().toLowerCase();
  };

  const renderFileViewer = (worksheet) => {
    if (!worksheet) return null;

    const fileUrl = getFileUrl(worksheet.fileUrl);
    const extension = getFileExtension(worksheet.originalName);
    const mimeType = worksheet.mimeType || '';

    // Handle images
    if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      return (
        <Box sx={{ textAlign: 'center', maxHeight: '70vh', overflow: 'auto', p: 2 }}>
          <img
            src={fileUrl}
            alt={worksheet.originalName}
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
            title={worksheet.originalName}
            onError={() => setFileError(true)}
          />
        </Box>
      );
    }

    // Handle text files
    if (mimeType.startsWith('text/') || ['txt', 'csv'].includes(extension)) {
      return (
        <Box sx={{ maxHeight: '70vh', overflow: 'auto', p: 2 }}>
          <iframe
            src={fileUrl}
            width="100%"
            height="400px"
            style={{ border: '1px solid #ddd', borderRadius: '8px' }}
            title={worksheet.originalName}
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
          File: {worksheet.originalName}
        </Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={() => handleDownload(worksheet.fileUrl, worksheet.originalName)}
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
          Loading worksheets...
        </Typography>
      </Box>
    );
  }

  const subjects = Object.keys(worksheetsBySubject).sort();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <FolderIcon sx={{ mr: 2, color: 'primary.main' }} />
        My Worksheets & Assignments
      </Typography>

      {/* Tabs for filtering */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="All" />
          <Tab label="Worksheets" />
          <Tab label="Assignments" />
        </Tabs>
      </Box>

      {/* Breadcrumbs */}
      {selectedSubject && (
        <Box sx={{ mb: 3 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link
              component="button"
              variant="body1"
              onClick={handleBreadcrumbClick}
              sx={{
                textDecoration: 'none',
                color: 'primary.main',
                fontWeight: 'normal'
              }}
            >
              Subject Folders
            </Link>
            <Typography color="text.primary" sx={{ fontWeight: 'bold' }}>
              {selectedSubject}
            </Typography>
          </Breadcrumbs>
        </Box>
      )}

      {subjects.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <WorkIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No {tabValue === 1 ? 'worksheets' : tabValue === 2 ? 'assignments' : 'files'} available yet.
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
              const subjectWorksheets = worksheetsBySubject[subject];
              const filteredCount = filterWorksheetsByTab(subjectWorksheets).length;
              
              // Only show subjects that have files matching the current tab filter
              if (filteredCount === 0) return null;

              const worksheetCount = subjectWorksheets.filter(w => w.uploadType === 'worksheet').length;
              const assignmentCount = subjectWorksheets.filter(w => w.uploadType === 'assignment').length;

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
                        {filteredCount} file{filteredCount !== 1 ? 's' : ''} 
                        {tabValue === 0 ? ' total' : tabValue === 1 ? ' worksheet' + (filteredCount !== 1 ? 's' : '') : ' assignment' + (filteredCount !== 1 ? 's' : '')}
                      </Typography>
                      
                      {tabValue === 0 && (
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
                          {worksheetCount > 0 && (
                            <Chip label={`${worksheetCount} Worksheets`} size="small" color="primary" variant="outlined" />
                          )}
                          {assignmentCount > 0 && (
                            <Chip label={`${assignmentCount} Assignments`} size="small" color="secondary" variant="outlined" />
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
        // FILES VIEW for selected subject
        <Box>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <FolderOpenIcon sx={{ mr: 2, color: 'secondary.main' }} />
            {selectedSubject} - {tabValue === 0 ? 'All Files' : tabValue === 1 ? 'Worksheets' : 'Assignments'}
          </Typography>

          {currentFiles.length === 0 ? (
            <Alert severity="info">
              No {tabValue === 1 ? 'worksheets' : tabValue === 2 ? 'assignments' : 'files'} found in {selectedSubject}.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {currentFiles.map((worksheet) => (
                <Grid item xs={12} md={6} lg={4} key={worksheet._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {worksheet.uploadType === 'worksheet' ? (
                          <WorkIcon sx={{ mr: 1, color: 'primary.main' }} />
                        ) : (
                          <AssignmentIcon sx={{ mr: 1, color: 'secondary.main' }} />
                        )}
                        <Typography variant="h6" component="div" sx={{ fontSize: '1rem' }}>
                          {worksheet.originalName}
                        </Typography>
                      </Box>

                      <Chip
                        label={worksheet.uploadType === 'worksheet' ? 'Worksheet' : 'Assignment'}
                        color={worksheet.uploadType === 'worksheet' ? 'primary' : 'secondary'}
                        size="small"
                        sx={{ mb: 2 }}
                      />

                      {worksheet.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {worksheet.description}
                        </Typography>
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CalendarTodayIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          Uploaded: {formatDate(worksheet.uploadedAt)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          By: {worksheet.uploadedBy}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleViewFile(worksheet)}
                          >
                            View
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleDownload(worksheet.fileUrl, worksheet.originalName)}
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
        PaperProps={{
          sx: { height: '90vh' }
        }}
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

export default StudentWorksheetsView;