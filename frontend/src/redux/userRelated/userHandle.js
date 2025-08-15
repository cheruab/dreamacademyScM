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
} from './userSlice';

const REACT_APP_BASE_URL = "http://localhost:5000";

export const loginUser = (fields, role) => async (dispatch) => {
    dispatch(authRequest());

    try {
        const result = await axios.post(`${REACT_APP_BASE_URL}/${role}Login`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });

        // Check for role property for non-Parent users
        if (role === 'Parent') {
            // Expect login response like: { success: true, message, parent: {...} }
            if (result.data.success && result.data.parent) {
                dispatch(authSuccess(result.data.parent));

                // Save parentId correctly from nested parent object
                localStorage.setItem('parentId', result.data.parent._id);
            } else {
                dispatch(authFailed(result.data.message || 'Login failed'));
            }
        } else {
            // Non-parent users: expects result.data.role at top-level
            if (result.data.role) {
                dispatch(authSuccess(result.data));
                // Clear parentId to avoid stale data if switching roles
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
        const result = await axios.post(`${REACT_APP_BASE_URL}/${role}Reg`, fields, {
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
    localStorage.removeItem('parentId');  // Clear parentId on logout
    dispatch(authLogout());
};

export const getUserDetails = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${REACT_APP_BASE_URL}/${address}/${id}`);
        if (result.data) {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}
export const getComplains = (userId) => async (dispatch) => {
  try {
    dispatch({ type: 'USER_COMPLAINS_REQUEST' });

    const { data } = await axios.get(`http://localhost:5000/complains/user/${userId}`);

    dispatch({
      type: 'USER_COMPLAINS_SUCCESS',
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: 'USER_COMPLAINS_FAIL',
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message,
    });
  }
};

export const deleteUser = (id, address) => async (dispatch) => {
    dispatch(getRequest());
    dispatch(getFailed("Sorry the delete function has been disabled for now."));
}

export const updateUser = (fields, id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.put(`${REACT_APP_BASE_URL}/${address}/${id}`, fields, {
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
        const result = await axios.put(`${REACT_APP_BASE_URL}/TeacherSubject`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });
        dispatch(doneSuccess(result.data));
    } catch (error) {
        dispatch(getError(error));
    }
};


export const addStuff = (fields, address) => async (dispatch) => {
    dispatch(authRequest());

    try {
        const result = await axios.post(`${REACT_APP_BASE_URL}/${address}Create`, fields, {
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
