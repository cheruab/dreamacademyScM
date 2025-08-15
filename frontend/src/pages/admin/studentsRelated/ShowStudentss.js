import React from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getAllParents } from '../../../redux/studentsRelated/parentHandle';

import {
    Paper, Box, IconButton
} from '@mui/material';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { BlackButton, BlueButton, GreenButton } from '../../../components/buttonStyles';
import TableTemplate from '../../../components/TableTemplate';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';

const ShowStudentss = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { parentsList, loading, error, response } = useSelector((state) => state.parent);
    const { currentUser } = useSelector(state => state.user)

    useEffect(() => {
        dispatch(getAllParents(currentUser._id, "Parent"));
    }, [currentUser._id, dispatch]);

    if (error) {
        console.log(error);
    }

    const [showPopup, setShowPopup] = React.useState(false);
    const [message, setMessage] = React.useState("");

    const deleteHandler = (deleteID, address) => {
        console.log(deleteID);
        console.log(address);
        setMessage("Sorry the delete function has been disabled for now.")
        setShowPopup(true)
    }

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
                <IconButton onClick={() => deleteHandler(row.id, "Parent")}>
                    <PersonRemoveIcon color="error" />
                </IconButton>
                <BlueButton variant="contained"
                    onClick={() => navigate("/Admin/parents/parent/" + row.id)}>
                    View
                </BlueButton>
            </>
        );
    };

    const actions = [
        {
            icon: <PersonAddAlt1Icon color="primary" />, name: 'Add New Parent',
            action: () => navigate("/Admin/addparents")
        },
        {
            icon: <PersonRemoveIcon color="error" />, name: 'Delete All Parents',
            action: () => deleteHandler(currentUser._id, "Parents")
        },
    ];

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
                            {Array.isArray(actualParentsList) && actualParentsList.length > 0 &&
                                <TableTemplate buttonHaver={ParentButtonHaver} columns={parentColumns} rows={parentRows} />
                            }
                            <SpeedDialTemplate actions={actions} />
                        </Paper>
                    }
                </>
            }
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
};

export default ShowStudentss;