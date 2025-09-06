import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Paper, 
  Box, 
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Chip,
  Card,
  CardContent,
  Grid,
  IconButton,
  Collapse,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Reply as ReplyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Send as SendIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { getAllComplains } from '../../../redux/complainRelated/complainHandle';

const SeeComplainss = () => {
  const dispatch = useDispatch();
  const { complainsList, loading, error, response } = useSelector((state) => state.complain);
  const { currentUser } = useSelector(state => state.user);

  // State for reply functionality
  const [openReplyDialog, setOpenReplyDialog] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [expandedCards, setExpandedCards] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [replySuccess, setReplySuccess] = useState('');

  useEffect(() => {
    if (currentUser?.school?._id) {
      dispatch(getAllComplains(currentUser.school._id));
    }
  }, [dispatch, currentUser]);

  const handleReplyClick = (complaint) => {
    setSelectedComplaint(complaint);
    setReplyText(complaint.response || '');
    setOpenReplyDialog(true);
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;
    
    setSubmitting(true);
    try {
      const response = await fetch(`/api/complaints/${selectedComplaint._id}/reply`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          response: replyText,
          status: 'Responded',
          responseDate: new Date()
        })
      });

      if (response.ok) {
        setReplySuccess('Reply sent successfully!');
        setOpenReplyDialog(false);
        setReplyText('');
        // Refresh complaints list
        dispatch(getAllComplains(currentUser.school._id));
        
        // Clear success message after 3 seconds
        setTimeout(() => setReplySuccess(''), 3000);
      } else {
        throw new Error('Failed to send reply');
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

  const toggleExpanded = (id) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'error';
      case 'High': return 'warning';
      case 'Medium': return 'info';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading complaints...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading complaints: {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
          📋 School Complaints Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review and respond to complaints from parents, students, and teachers
        </Typography>
      </Box>

      {/* Success Message */}
      {replySuccess && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setReplySuccess('')}>
          {replySuccess}
        </Alert>
      )}

      {/* Complaints List */}
      {response || !complainsList || complainsList.length === 0 ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '300px',
          textAlign: 'center'
        }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            📝 No Complaints Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No complaints have been submitted yet.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {complainsList.map((complaint) => (
            <Grid item xs={12} key={complaint._id}>
              <Card sx={{ 
                borderRadius: 3, 
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                border: complaint.priority === 'Critical' ? '2px solid #f44336' : 'none'
              }}>
                <CardContent sx={{ p: 3 }}>
                  {/* Header Row */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
                        👤 {complaint.user?.name || 'Anonymous'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        📅 {formatDate(complaint.date)} • 📂 {complaint.category || 'General'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label={complaint.priority || 'Medium'}
                        size="small"
                        color={getPriorityColor(complaint.priority)}
                        variant="outlined"
                      />
                      <Chip 
                        label={complaint.status || 'Submitted'}
                        size="small"
                        color={getStatusColor(complaint.status)}
                      />
                    </Box>
                  </Box>

                  {/* Complaint Text */}
                  <Paper sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 2, mb: 2 }}>
                    <Typography variant="body1">
                      {expandedCards[complaint._id] || complaint.complaint.length <= 200 
                        ? complaint.complaint 
                        : `${complaint.complaint.substring(0, 200)}...`}
                    </Typography>
                    
                    {complaint.complaint.length > 200 && (
                      <Button 
                        size="small" 
                        onClick={() => toggleExpanded(complaint._id)}
                        endIcon={expandedCards[complaint._id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        sx={{ mt: 1 }}
                      >
                        {expandedCards[complaint._id] ? 'Show Less' : 'Show More'}
                      </Button>
                    )}
                  </Paper>

                  {/* Existing Reply (if any) */}
                  {complaint.response && (
                    <Collapse in={true}>
                      <Paper sx={{ 
                        p: 2, 
                        backgroundColor: '#e3f2fd', 
                        borderRadius: 2, 
                        mb: 2,
                        border: '1px solid #2196f3'
                      }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
                          💬 Admin Response:
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {complaint.response}
                        </Typography>
                        {complaint.responseDate && (
                          <Typography variant="caption" color="text.secondary">
                            Responded on: {formatDate(complaint.responseDate)}
                          </Typography>
                        )}
                      </Paper>
                    </Collapse>
                  )}

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button
                      variant={complaint.response ? "outlined" : "contained"}
                      color="primary"
                      startIcon={<ReplyIcon />}
                      onClick={() => handleReplyClick(complaint)}
                      size="small"
                    >
                      {complaint.response ? 'Update Reply' : 'Reply'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

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
            <>
              <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Original Complaint from {selectedComplaint.user?.name}:
                </Typography>
                <Typography variant="body2">
                  {selectedComplaint.complaint}
                </Typography>
              </Paper>
              
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
            </>
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

export default SeeComplainss;