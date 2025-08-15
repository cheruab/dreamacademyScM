import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Button, TextField, Typography, CircularProgress, MenuItem } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { getAllParents } from '../../redux/studentsRelated/parentHandle'; // adjust path as needed

const UploadResult = ({ onUploadSuccess }) => {
  const [parentId, setParentId] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const dispatch = useDispatch();
  const { parentsList, loading } = useSelector(state => state.parent); // adjust state path

  useEffect(() => {
    // Assuming admin's id and role come from Redux auth state
    const adminId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");
    if (adminId && role) {
      dispatch(getAllParents(adminId, role));
    }
  }, [dispatch]);

  const handleFileChange = e => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!parentId || !file) {
      setMessage('Please select a parent and a file.');
      return;
    }

    const formData = new FormData();
    formData.append('resultFile', file);
    formData.append('parentId', parentId);

    setUploading(true);
    setMessage('');

    try {
      await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage('File uploaded successfully!');
      setFile(null);
      setParentId('');

      // Notify parent dashboard to refresh results
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error(error);
      setMessage('Error uploading file.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ p: 2, maxWidth: 400 }}>
      <Typography variant="h6" gutterBottom>Upload Result File</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          select
          label="Select Parent"
          value={parentId}
          onChange={e => setParentId(e.target.value)}
          fullWidth
          margin="normal"
          required
        >
          {loading ? (
            <MenuItem disabled>Loading parents...</MenuItem>
          ) : (
            parentsList?.map(parent => (
              <MenuItem key={parent._id} value={parent._id}>
                {parent.name} ({parent.email})
              </MenuItem>   
            ))
          )}
        </TextField>

        <input
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.jpg,.png"
          style={{ margin: '10px 0' }}
          required
        />
        <Button type="submit" variant="contained" disabled={uploading}>
          {uploading ? <CircularProgress size={24} /> : 'Upload'}
        </Button>
      </form>
      {message && <Typography sx={{ mt: 2 }}>{message}</Typography>}
    </Box>
  );
};

export default UploadResult;
