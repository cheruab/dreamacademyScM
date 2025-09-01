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
  Alert
} from '@mui/material';
import { useSelector } from 'react-redux';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WorkIcon from '@mui/icons-material/Work';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';

const StudentWorksheetsView = () => {
  const [worksheets, setWorksheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState(false);
  
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
      setWorksheets(response.data);
    } catch (error) {
      console.error('Error fetching worksheets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getFileUrl = (fileUrl) => {
    // This is the key fix for your "Cannot GET" error
    const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';
    
    // Remove leading slash if it exists to avoid double slashes
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

    // For other file types (Word docs, etc.), show download option
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

  const filteredWorksheets = worksheets.filter(worksheet => {
    if (tabValue === 0) return true; // All
    if (tabValue === 1) return worksheet.uploadType === 'worksheet'; // Worksheets only
    if (tabValue === 2) return worksheet.uploadType === 'assignment'; 
    if (tabValue === 3) return worksheet.uploadType === 'Student Exam results'; // Assignments only
    return true;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        My Worksheets & Assignments
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="All" />
          <Tab label="Worksheets" />
          <Tab label="Assignments" />
        </Tabs>
      </Box>

      {filteredWorksheets.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No {tabValue === 1 ? 'worksheets' : tabValue === 2 ? 'assignments' : 'files'} available yet.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredWorksheets.map((worksheet) => (
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