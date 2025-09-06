import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Paper, 
  Box, 
  Checkbox,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Stack
} from '@mui/material';
import {
  Reply as ReplyIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { getAllComplains } from '../../../redux/complainRelated/complainHandle';
import TableTemplate from '../../../components/TableTemplate';

const SeeComplains = () => {
  const label = { inputProps: { 'aria-label': 'Checkbox demo' } };
  const dispatch = useDispatch();
  const { complainsList, loading, error, response } = useSelector((state) => state.complain);
  const { currentUser } = useSelector(state => state.user);

  // State for reply functionality
  const [openReplyDialog, setOpenReplyDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replySuccess, setReplySuccess] = useState('');

  useEffect(() => {
    dispatch(getAllComplains(currentUser._id, "Complain"));
  }, [currentUser._id, dispatch]);

  const handleReplyClick = (complaint) => {
    setSelectedComplaint(complaint);
    setReplyText(complaint.response || '');
    setOpenReplyDialog(true);
  };

  const handleViewClick = (complaint) => {
    setSelectedComplaint(complaint);
    setOpenViewDialog(true);
  };

// In your existing SeeComplains.js, replace the handleReplySubmit function with this:

const handleReplySubmit = async () => {
  if (!replyText.trim()) return;
  
  setSubmitting(true);
  try {
    // Fix: Use the correct API endpoint that matches your backend route
    const response = await fetch(`${process.env.REACT_APP_BASE_URL || 'http://localhost:5000'}/ReplyToComplaint/${selectedComplaint._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        response: replyText,
        status: 'Responded',
        responseDate: new Date(),
        adminId: currentUser._id
      })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      setReplySuccess('Reply sent successfully!');
      setOpenReplyDialog(false);
      setReplyText('');
      // Refresh complaints list
      dispatch(getAllComplains(currentUser._id, "Complain"));
      
      // Clear success message after 3 seconds
      setTimeout(() => setReplySuccess(''), 3000);
    } else {
      throw new Error(result.message || 'Failed to send reply');
    }
  } catch (error) {
    console.error('Error sending reply:', error);
    alert('Failed to send reply. Please try again.');
  } finally {
    setSubmitting(false);
  }
};

  const handleCloseReplyDialog = () => {
    setOpenReplyDialog(false);
    setSelectedComplaint(null);
    setReplyText('');
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedComplaint(null);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted': return 'primary';
      case 'In Progress': return 'warning';
      case 'Responded': return 'success';
      case 'Rejected': return 'error';
      default: return 'default';
    }
  };

  if (error) {
    console.log(error);
  }

  const complainColumns = [
    { id: 'user', label: 'User', minWidth: 170 },
    { id: 'complaint', label: 'Complaint', minWidth: 200 },
    { id: 'date', label: 'Date', minWidth: 150 },
    { id: 'status', label: 'Status', minWidth: 120 },
    { id: 'priority', label: 'Priority', minWidth: 100 },
  ];

  const complainRows = complainsList && complainsList.length > 0 && complainsList.map((complain) => {
    const date = new Date(complain.date);
    const dateString = date.toString() !== "Invalid Date" ? date.toISOString().substring(0, 10) : "Invalid Date";
    return {
      user: complain.user?.name || 'Anonymous',
      complaint: complain.complaint.length > 50 
        ? `${complain.complaint.substring(0, 50)}...` 
        : complain.complaint,
      date: dateString,
      status: (
        <Chip 
          label={complain.status || 'Submitted'}
          size="small"
          color={getStatusColor(complain.status)}
          variant="outlined"
        />
      ),
      priority: (
        <Chip 
          label={complain.priority || 'Medium'}
          size="small"
          color={complain.priority === 'Critical' ? 'error' : 
                 complain.priority === 'High' ? 'warning' :
                 complain.priority === 'Low' ? 'success' : 'info'}
          variant="filled"
        />
      ),
      id: complain._id,
      fullComplaint: complain, // Store full complaint data
    };
  });

  const ComplainButtonHaver = ({ row }) => {
    const complaint = complainRows.find(c => c.id === row.id)?.fullComplaint;
    
    return (
      <Stack direction="row" spacing={1}>
        <Tooltip title="View Details">
          <IconButton 
            size="small" 
            color="info"
            onClick={() => handleViewClick(complaint)}
          >
            <ViewIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title={complaint?.response ? "Update Reply" : "Reply"}>
          <IconButton 
            size="small" 
            color="primary"
            onClick={() => handleReplyClick(complaint)}
          >
            <ReplyIcon />
          </IconButton>
        </Tooltip>
        
        <Checkbox {...label} />
      </Stack>
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
          📋 Complaints Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review and respond to complaints from students and parents
        </Typography>
      </Box>

      {/* Success Message */}
      {replySuccess && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setReplySuccess('')}>
          {replySuccess}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading complaints...</Typography>
        </Box>
      ) : (
        <>
          {response ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '200px',
              textAlign: 'center'
            }}>
              <Typography variant="h6" color="text.secondary">
                📝 No Complaints Right Now
              </Typography>
            </Box>
          ) : (
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              {Array.isArray(complainsList) && complainsList.length > 0 && (
                <TableTemplate 
                  buttonHaver={ComplainButtonHaver} 
                  columns={complainColumns} 
                  rows={complainRows} 
                />
              )}
            </Paper>
          )}
        </>
      )}

      {/* View Complaint Dialog */}
      <Dialog 
        open={openViewDialog} 
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1
        }}>
          <Typography variant="h6">
            👁️ Complaint Details
          </Typography>
          <IconButton onClick={handleCloseViewDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          {selectedComplaint && (
            <Stack spacing={3}>
              {/* User Info */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  👤 Submitted by:
                </Typography>
                <Typography variant="body1">
                  {selectedComplaint.user?.name || 'Anonymous'}
                </Typography>
              </Box>

              {/* Date and Category */}
              <Stack direction="row" spacing={3}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    📅 Date:
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(selectedComplaint.date)}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    📂 Category:
                  </Typography>
                  <Typography variant="body2">
                    {selectedComplaint.category || 'General'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    ⚡ Priority:
                  </Typography>
                  <Chip 
                    label={selectedComplaint.priority || 'Medium'}
                    size="small"
                    color={selectedComplaint.priority === 'Critical' ? 'error' : 
                           selectedComplaint.priority === 'High' ? 'warning' :
                           selectedComplaint.priority === 'Low' ? 'success' : 'info'}
                  />
                </Box>
              </Stack>

              {/* Complaint Text */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  📝 Complaint:
                </Typography>
                <Paper sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                  <Typography variant="body1">
                    {selectedComplaint.complaint}
                  </Typography>
                </Paper>
              </Box>

              {/* Existing Reply */}
              {selectedComplaint.response && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#1976d2' }}>
                    💬 Admin Response:
                  </Typography>
                  <Paper sx={{ 
                    p: 2, 
                    backgroundColor: '#e3f2fd', 
                    borderRadius: 2,
                    border: '1px solid #2196f3'
                  }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {selectedComplaint.response}
                    </Typography>
                    {selectedComplaint.responseDate && (
                      <Typography variant="caption" color="text.secondary">
                        Responded on: {formatDate(selectedComplaint.responseDate)}
                      </Typography>
                    )}
                  </Paper>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleCloseViewDialog}>
            Close
          </Button>
          <Button 
            variant="contained" 
            startIcon={<ReplyIcon />}
            onClick={() => {
              handleCloseViewDialog();
              handleReplyClick(selectedComplaint);
            }}
          >
            {selectedComplaint?.response ? 'Update Reply' : 'Reply'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog 
        open={openReplyDialog} 
        onClose={handleCloseReplyDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1
        }}>
          <Typography variant="h6">
            💬 Reply to Complaint
          </Typography>
          <IconButton onClick={handleCloseReplyDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          {selectedComplaint && (
            <Stack spacing={3}>
              {/* Original Complaint Preview */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Original Complaint from {selectedComplaint.user?.name || 'Anonymous'}:
                </Typography>
                <Paper sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                  <Typography variant="body2">
                    {selectedComplaint.complaint}
                  </Typography>
                </Paper>
              </Box>
              
              {/* Reply Text Field */}
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Your Response"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your response to this complaint..."
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Stack>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={handleCloseReplyDialog} 
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleReplySubmit}
            disabled={!replyText.trim() || submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : <SendIcon />}
          >
            {submitting ? 'Sending...' : 'Send Reply'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SeeComplains;