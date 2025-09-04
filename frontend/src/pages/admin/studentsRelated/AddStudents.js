import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../../redux/userRelated/userHandle';
import { getClassStudents } from '../../../redux/sclassRelated/sclassHandle';
import Popup from '../../../components/Popup';
import { underControl } from '../../../redux/userRelated/userSlice';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { CircularProgress, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 

const AddStudents = ({ situation }) => {

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const params = useParams()
    
    const userState = useSelector(state => state.user);
    const { status, currentUser, response, error } = userState;
    const { sclassesList } = useSelector((state) => state.sclass);
    const { studentsList } = useSelector((state) => state.student);
    const [name, setName] = useState('');
    const [rollNum, setRollNum] = useState('');
    const [password, setPassword] = useState('');
    const [className, setClassName] = useState('');
    const [sclassName, setSclassName] = useState('');
    const [childId, setChildId] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    
    const adminID = currentUser._id;
    const role = "Parent"; 
         
    useEffect(() => {
        if (situation === "Class") {
            setSclassName(params.id);
            dispatch(getClassStudents(params.id));
        }
    }, [params.id, situation, dispatch]);

    useEffect(() => {
        if (sclassName && situation === "Parent") {
            dispatch(getClassStudents(sclassName));
        }
    }, [sclassName, situation, dispatch]);

    useEffect(() => {
        dispatch(getAllSclasses(adminID, "Sclass"));
    }, [adminID, dispatch]);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false)

    const changeHandler = (event) => {
        if (event.target.value === 'Select Class') {
            setClassName('Select Class');
            setSclassName('');
            setChildId('');
        } else {
            const selectedClass = sclassesList.find(
                (classItem) => classItem.sclassName === event.target.value
            ); 
            setClassName(selectedClass.sclassName);
            setSclassName(selectedClass._id);
        }
    }

    const handleChildChange = (event) => {
        setChildId(event.target.value);
    }

    const fields = { 
        name,
        rollNum, 
        password, 
        sclassName, 
        adminID, 
        role,
        child: childId,
        phone,
        address
    }

     const handleBack = () => {
        navigate(-1); // Go back to previous page
    };

    const submitHandler = (event) => {
        event.preventDefault()
        if (sclassName === "") {
            setMessage("Please select a classname")
            setShowPopup(true)
        }
        else if (role === "Parent" && !childId) {
            setMessage("Please select a student to assign as your child")
            setShowPopup(true)
        }
        else if (!phone || !address) {
            setMessage("Please provide phone number and address")
            setShowPopup(true)
        }
        else {
            setLoader(true)
            dispatch(registerUser(fields, role))
        }
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
        <Button
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
                variant="outlined"
                sx={{ mb: 2 }}
            >
                Back
            </Button>
            <div className="register">
                <form className="registerForm" onSubmit={submitHandler}>
                    <span className="registerTitle">Add Parent</span>
                    <label>Name</label>
                    <input className="registerInput" type="text" placeholder="Enter parent's name..."
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        autoComplete="name" required />

                    <label>Phone Number</label>
                    <input className="registerInput" type="text" placeholder="Enter phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required />

                    <label>Address</label>
                    <input className="registerInput" type="text" placeholder="Enter address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required />

                    {
                        situation === "Parent" &&
                        <>
                            <label>Class</label>
                            <select
                                className="registerInput"
                                value={className}
                                onChange={changeHandler} 
                                required>
                                <option value='Select Class'>Select Class</option>
                                {sclassesList.map((classItem, index) => (
                                    <option key={index} value={classItem.sclassName}>
                                        {classItem.sclassName}
                                    </option>
                                ))}
                            </select>

                            {sclassName && (
                                <>
                                    <label>Assign to Student</label>
                                    <select
                                        className="registerInput"
                                        value={childId}
                                        onChange={handleChildChange}
                                        required>
                                        <option value=''>Select Student</option>
                                        {studentsList && studentsList.map((student) => (
                                            <option key={student._id} value={student._id}>
                                                {student.name} (Roll: {student.rollNum})
                                            </option>
                                        ))}
                                    </select>
                                </>
                            )}
                        </>
                    }

                    <label>Roll Number</label>
                    <input className="registerInput" type="number" placeholder="Enter parent's Roll Number..."
                        value={rollNum}
                        onChange={(event) => setRollNum(event.target.value)}
                        required />

                    <label>Password</label>
                    <input className="registerInput" type="password" placeholder="Enter parent's password..."
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="new-password" required />

                    <button className="registerButton" type="submit" disabled={loader}>
                        {loader ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Add'
                        )}
                    </button>
                </form>
            </div>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    )
}

export default AddStudents