import React from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getAllParents } from '../../../redux/studentsRelated/parentHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';

import {
    Paper, 
    Box, 
    Button,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { GreenButton } from '../../../components/buttonStyles';
import TableTemplate from '../../../components/TableTemplate';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import Popup from '../../../components/Popup';

const ShowStudentss = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { parentsList, loading, error, response } = useSelector((state) => state.parent);
    const { currentUser } = useSelector(state => state.user)

    useEffect(() => {
        dispatch(getAllParents(currentUser._id, "parent"));
    }, [currentUser._id, dispatch]);

    if (error) {
        console.log(error);
    }

    const [showPopup, setShowPopup] = React.useState(false);
    const [message, setMessage] = React.useState("");
    
    // Delete confirmation dialog states
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [parentToDelete, setParentToDelete] = React.useState(null);
    const [deleteConfirmText, setDeleteConfirmText] = React.useState('');

    const initiateDelete = (parent) => {
        setParentToDelete(parent);
        setDeleteConfirmText('');
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (deleteConfirmText.toLowerCase() === 'delete' && parentToDelete) {
            dispatch(deleteUser(parentToDelete.id, "Parent"));
            setMessage(`Parent "${parentToDelete.name}" has been deleted successfully.`);
            setShowPopup(true);
        }
        
        setDeleteDialogOpen(false);
        setParentToDelete(null);
        setDeleteConfirmText('');
    };

    const cancelDelete = () => {
        setDeleteDialogOpen(false);
        setParentToDelete(null);
        setDeleteConfirmText('');
    };

    const parentColumns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'rollNum', label: 'Roll Number', minWidth: 100 },
        { id: 'sclassName', label: 'Class', minWidth: 170 },
        { id: 'child', label: 'Child', minWidth: 170 },
    ]

    // Extract the actual parents array from the response object
    const actualParentsList = parentsList?.data || parentsList || [];

    const parentRows = actualParentsList.length > 0 && actualParentsList.map((parent) => {
        return {
            name: parent.name,
            rollNum: parent.rollNum,
            sclassName: parent.sclassName?.sclassName || "Not assigned",
            child: parent.child?.name || "Not assigned",
            id: parent._id,
        };
    })

    const ParentButtonHaver = ({ row }) => {
        return (
            <>
                <Button 
                    variant="contained" 
                    color="error"
                    onClick={() => initiateDelete(row)}
                    sx={{ minWidth: '80px' }}
                >
                    Delete
                </Button>
            </>
        );
    };

    return (
        <>
            {loading ?
                <div>Loading...</div>
                :
                <>
                    {response ?
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <GreenButton variant="contained" onClick={() => navigate("/Admin/addparents")}>
                                Add Parents
                            </GreenButton>
                        </Box>
                        :
                        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                            {/* Header with Add Parent Button */}
                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6">Parents</Typography>
                                <GreenButton 
                                    variant="contained" 
                                    startIcon={<PersonAddAlt1Icon />}
                                    onClick={() => navigate("/Admin/addparents")}
                                >
                                    Add New Parent
                                </GreenButton>
                            </Box>

                            {Array.isArray(actualParentsList) && actualParentsList.length > 0 &&
                                <TableTemplate buttonHaver={ParentButtonHaver} columns={parentColumns} rows={parentRows} />
                            }
                        </Paper>
                    }
                </>
            }

            {/* Delete Confirmation Dialog */}
            <Dialog 
                open={deleteDialogOpen} 
                onClose={cancelDelete}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningIcon color="error" />
                    Confirm Delete
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Are you sure you want to delete the parent "{parentToDelete?.name}"?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        This action cannot be undone. All related data will be permanently removed.
                    </Typography>
                    <TextField
                        fullWidth
                        label="Type 'delete' to confirm"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="delete"
                        variant="outlined"
                        helperText="Type 'delete' (case insensitive) to confirm deletion"
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={cancelDelete} color="primary">
                        Cancel
                    </Button>
                    <Button 
                        onClick={confirmDelete} 
                        color="error"
                        variant="contained"
                        disabled={deleteConfirmText.toLowerCase() !== 'delete'}
                    >
                        Delete Parent
                    </Button>
                </DialogActions>
            </Dialog>

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
};

export default ShowStudentss;