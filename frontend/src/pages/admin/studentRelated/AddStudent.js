import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../../redux/userRelated/userHandle';
import Popup from '../../../components/Popup';
import { underControl } from '../../../redux/userRelated/userSlice';
import { CircularProgress,Box,Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const AddStudent = ({ situation }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const params = useParams()

    const userState = useSelector(state => state.user);
    const { status, currentUser, response, error } = userState;

    const [name, setName] = useState('');
    const [rollNum, setRollNum] = useState('');
    const [password, setPassword] = useState('')

    const adminID = currentUser._id
    const role = "Student"
    const attendance = []

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false)

    // Remove the class-related state and useEffect that fetches classes

    const fields = { 
        name, 
        rollNum, 
        password, 
        adminID, 
        role, 
        attendance 
        // Remove sclassName from fields
    }

    const handleBack = () => {
        navigate(-1); // Go back to previous page
    };

    const submitHandler = (event) => {
        event.preventDefault()
        // Remove class validation since it's no longer required
        setLoader(true)
        dispatch(registerUser(fields, role))
    }

    useEffect(() => {
        if (status === 'added') {
            dispatch(underControl())
            navigate(-1)
        }
        else if (status === 'failed') {
            setMessage(response)
            setShowPopup(true)
            setLoader(false)
        }
        else if (status === 'error') {
            setMessage("Network Error")
            setShowPopup(true)
            setLoader(false)
        }
    }, [status, navigate, error, response, dispatch]);

    return (
        <>
         <Box sx={{ mb: 2 }}>
                            <Button
                                startIcon={<ArrowBackIcon />}
                                onClick={handleBack}
                                variant="outlined"
                                sx={{ mb: 2 }}
                            >
                                Back to Students
                            </Button>
                        </Box>
            <div className="register">
                <form className="registerForm" onSubmit={submitHandler}>
                    <span className="registerTitle">Add Student</span>
                    
                    <label>Name</label>
                    <input 
                        className="registerInput" 
                        type="text" 
                        placeholder="Enter student's name..."
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        autoComplete="name" 
                        required 
                    />

                    {/* Remove the class selection dropdown completely */}

                    <label>Roll Number</label>
                    <input 
                        className="registerInput" 
                        type="number" 
                        placeholder="Enter student's Roll Number..."
                        value={rollNum}
                        onChange={(event) => setRollNum(event.target.value)}
                        required 
                    />

                    <label>Password</label>
                    <input 
                        className="registerInput" 
                        type="password" 
                        placeholder="Enter student's password..."
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="new-password" 
                        required 
                    />

                    <button className="registerButton" type="submit" disabled={loader}>
                        {loader ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Add Student'
                        )}
                    </button>
                </form>
            </div>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    )
}

export default AddStudent