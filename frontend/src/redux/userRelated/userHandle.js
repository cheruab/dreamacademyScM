import axios from 'axios';
import {
    authRequest,
    stuffAdded,
    authSuccess,
    authFailed,
    authError,
    authLogout,
    doneSuccess,
    getDeleteSuccess,
    getRequest,
    getFailed,
    getError,
    complainsRequest, 
    complainsSuccess, 
    complainsFail 
} from './userSlice';



export const loginUser = (fields, role) => async (dispatch) => {
    dispatch(authRequest());

    try {
        const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/${role}Login`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });

        if (role === 'Parent') {
            if (result.data.success && result.data.parent) {
                dispatch(authSuccess(result.data.parent));
                localStorage.setItem('parentId', result.data.parent._id);
            } else {
                dispatch(authFailed(result.data.message || 'Login failed'));
            }
        } else {
            if (result.data.role) {
                dispatch(authSuccess(result.data));
                localStorage.removeItem('parentId');
            } else {
                dispatch(authFailed(result.data.message));
            }
        }
    } catch (error) {
        dispatch(authError(error));
    }
};

export const registerUser = (fields, role) => async (dispatch) => {
    dispatch(authRequest());

    try {
        const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/${role}Reg`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });
        if (result.data.schoolName) {
            dispatch(authSuccess(result.data));
        }
        else if (result.data.school) {
            dispatch(stuffAdded());
        }
        else {
            dispatch(authFailed(result.data.message));
        }
    } catch (error) {
        dispatch(authError(error));
    }
};

export const logoutUser = () => (dispatch) => {
    localStorage.removeItem('parentId');  
    dispatch(authLogout());
};

export const getUserDetails = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`);
        if (result.data) {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

// In your userHandle.js or wherever getComplains is defined
// In your userHandle.js or wherever getComplains is defined
// In your userHandle.js
export const getComplains = (userId) => async (dispatch) => {
  try {
    dispatch(complainsRequest()); // Use complainsRequest instead of USER_COMPLAINS_REQUEST

    const { data } = await axios.get(`${process.env.REACT_APP_BASE_URL}/ComplainsByUser/${userId}`);
    console.log('API response:', data);

    dispatch(complainsSuccess(data)); // Use complainsSuccess instead of USER_COMPLAINS_SUCCESS
  } catch (error) {
    console.error('Error fetching complaints:', error);
    dispatch(complainsFail(error.response?.data?.message || error.message)); // Use complainsFail
  }
};
export const updateUser = (fields, id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.put(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });
        if (result.data.schoolName) {
            dispatch(authSuccess(result.data));
        }
        else {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const updateTeacherSubject = (fields) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.put(`${process.env.REACT_APP_BASE_URL}/TeacherSubject`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });
        dispatch(doneSuccess(result.data));
    } catch (error) {
        dispatch(getError(error));
    }
};

// ✅ Add exam
// ✅ Add exam - Fixed version
export const addExam = (fields) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const res = await axios.post(`${process.env.REACT_APP_BASE_URL}/exams/add`, fields, {
            headers: { "Content-Type": "application/json" },
        });
        
        console.log("Add exam response:", res.data);
        
        if (res.data.success) {
            dispatch(doneSuccess({ 
                status: 'examAdded', 
                message: res.data.message,
                exam: res.data.exam 
            }));
        } else {
            dispatch(getFailed(res.data.error));
        }
    } catch (err) {
        console.log("Add exam error:", err.response?.data);
        dispatch(getError(err.response?.data?.error || err.message));
    }
};

// Get exams by subject - Fixed version
// Get exams by subject - With debug logs
export const getExams = (subjectId) => async (dispatch) => {
    console.log("getExams called with subjectId:", subjectId); // Debug log
    dispatch(getRequest());
    try {
        const url = `${process.env.REACT_APP_BASE_URL}/exams/subject/${subjectId}`;

        console.log("Making request to:", url); // Debug log
        
        const res = await axios.get(url);
        
        console.log("Get exams response:", res.data); // Debug log
        console.log("Response status:", res.status); // Debug log
        
        if (res.data.success) {
            console.log("Success! Dispatching exams:", res.data.exams); // Debug log
            dispatch(doneSuccess({ 
                status: 'examsFetched', 
                exams: res.data.exams,
                count: res.data.count 
            }));
        } else {
            console.log("API returned success: false"); // Debug log
            dispatch(getFailed(res.data.error));
        }
    } catch (err) {
        console.log("Get exams error:", err.response?.data); // Debug log
        console.log("Full error:", err); // Debug log
        dispatch(getError(err.response?.data?.error || err.message));
    }
};

export const addStuff = (fields, address) => async (dispatch) => {
    dispatch(authRequest());

    try {
        const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/${address}Create`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });

        if (result.data.message) {
            dispatch(authFailed(result.data.message));
        } else {
            dispatch(stuffAdded(result.data));
        }
    } catch (error) {
        dispatch(authError(error));
    }
};
// Add these new actions to your existing userHandle.js file


// Get student's exam results
// Add/Update these functions in your userHandle.js

// Get student's exam results - Fixed version
export const getStudentExamResults = (studentId) => async (dispatch) => {
    console.log("getStudentExamResults called with studentId:", studentId);
    dispatch(getRequest());
    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/student/${studentId}/exam-results`);
        
        console.log("Student exam results response:", result.data);
        
        if (result.data.success) {
            dispatch(doneSuccess({ 
                status: 'examResultsFetched', 
                examResults: result.data.examResults,
                count: result.data.count
            }));
        } else {
            dispatch(getFailed(result.data.error || 'Failed to fetch exam results'));
        }
    } catch (err) {
        console.error("Error fetching student exam results:", err);
        dispatch(getError(err.response?.data?.error || err.message));
    }
};

// Get class subjects with better error handling
export const getClassSubjects = (classId) => async (dispatch) => {
    console.log("getClassSubjects called with classId:", classId);
    dispatch(getRequest());
    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/ClassSubjects/${classId}`);
        
        console.log("Class subjects response:", result.data);
        
        if (result.data && result.data.message) {
            // API returned a message (like "No subjects found")
            dispatch(doneSuccess({ 
                status: 'subjectsFetched', 
                subjects: [],
                message: result.data.message
            }));
        } else if (Array.isArray(result.data)) {
            dispatch(doneSuccess({ 
                status: 'subjectsFetched', 
                subjects: result.data,
                count: result.data.length
            }));
        } else {
            dispatch(getFailed('Unexpected response format'));
        }
    } catch (err) {
        console.error("Error fetching class subjects:", err);
        if (err.response?.status === 404) {
            dispatch(doneSuccess({ 
                status: 'subjectsFetched', 
                subjects: [],
                message: 'No subjects found for this class'
            }));
        } else {
            dispatch(getError(err.response?.data?.message || err.message));
        }
    }
};
// Get exam by ID
// Fixed getExamById Redux action
// Fixed getExamById Redux action
// Fixed getExamById Redux action - using existing reducers
export const getExamById = (examId) => async (dispatch) => {
    dispatch(getRequest()); // Use your existing getRequest action
    
    try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/exam/${examId}`);
        const data = response.data;
        
        console.log('API Response in Redux:', data);

        if (data.success) {
            // Use your existing doneSuccess reducer
            dispatch(doneSuccess({ 
                status: 'examFetched',
                exam: data, // The exam data
                message: data.message
            }));
        } else {
            throw new Error(data.error || 'Failed to fetch exam');
        }
    } catch (error) {
        console.error('Redux Error fetching exam:', error);
        dispatch(getError(error.message || 'Failed to fetch exam'));
    }
};
// Fixed submitExamResult Redux action
export const submitExamResult = (submissionData) => async (dispatch) => {
    dispatch({ type: 'LOADING', payload: true });
    
    try {
        console.log('Submitting exam result via Redux:', submissionData);
        
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/exam/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add authorization header if needed
                // 'Authorization': `Bearer ${getState().user.token}`
            },
            body: JSON.stringify(submissionData)
        });

        const data = await response.json();
        console.log('Submission response:', data);

        if (response.ok && data.success) {
            dispatch({
                type: 'EXAM_SUBMITTED',
                payload: {
                    status: 'examSubmitted',
                    result: data.examResult || data,
                    message: data.message || 'Exam submitted successfully'
                }
            });
        } else {
            throw new Error(data.error || 'Failed to submit exam');
        }
    } catch (error) {
        console.error('Redux Error submitting exam:', error);
        dispatch({
            type: 'ERROR',
            payload: {
                status: 'error',
                error: error.message || 'Failed to submit exam'
            }
        });
    } finally {
        dispatch({ type: 'LOADING', payload: false });
    }
};

// Check if student has completed exam
export const checkExamCompletion = (studentId, examId) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/student/${studentId}/exam/${examId}/status`);
        
        if (result.data.success) {
            dispatch(doneSuccess({ 
                status: 'examStatusFetched', 
                examStatus: result.data.examStatus 
            }));
        } else {
            dispatch(getFailed(result.data.error));
        }
    } catch (err) {
        dispatch(getError(err.response?.data?.error || err.message));
    }
};
// Add these functions to your userHandle.js file

// Get specific exam result by resultId or examId + studentId
export const getExamResult = (examId, studentId) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/exam-result/${examId}/${studentId}`);
        
        if (result.data.success) {
            dispatch(doneSuccess({ 
                status: 'examResultFetched', 
                examResult: result.data.examResult 
            }));
        } else {
            dispatch(getFailed(result.data.error || 'Failed to fetch exam result'));
        }
    } catch (err) {
        dispatch(getError(err.response?.data?.error || err.message));
    }
};

// Alternative: Get exam result by result ID
export const getExamResultById = (resultId) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/exam-result/${resultId}`);
        
        if (result.data.success) {
            dispatch(doneSuccess({ 
                status: 'examResultFetched', 
                examResult: result.data.examResult,
                exam: result.data.exam // Include exam details if available
            }));
        } else {
            dispatch(getFailed(result.data.error || 'Failed to fetch exam result'));
        }
    } catch (err) {
        dispatch(getError(err.response?.data?.error || err.message));
    }
};

// Get exam with questions (detailed exam info)
export const getExamWithQuestions = (examId) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/exam/${examId}/details`);
        
        if (result.data.success) {
            dispatch(doneSuccess({ 
                status: 'examDetailsFetched', 
                exam: result.data.exam 
            }));
        } else {
            dispatch(getFailed(result.data.error || 'Failed to fetch exam details'));
        }
    } catch (err) {
        dispatch(getError(err.response?.data?.error || err.message));
    }
};
export const deleteUser = (id, address) => async (dispatch) => {
     dispatch(getRequest());

     try {
         const result = await axios.delete(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`);
         if (result.data.message) {
             dispatch(getFailed(result.data.message));
         } else {
             dispatch(getDeleteSuccess());
         }
     } catch (error) {
         dispatch(getError(error));
     }
 };
