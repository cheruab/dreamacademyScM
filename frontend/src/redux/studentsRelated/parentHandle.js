import axios from 'axios';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    stuffDone
} from './parentSlice';

const REACT_APP_BASE_URL = "http://localhost:5000";

export const getAllParents = (id, role) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${REACT_APP_BASE_URL}/Parents/${id}?role=${role}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            // Handle both response formats:
            // 1. Direct array response
            // 2. { data: [], success: true } format
            const parentsData = result.data.data || result.data;
            dispatch(getSuccess(parentsData));
        }
    } catch (error) {
        console.error("Error fetching parents:", error);
        dispatch(getError(error.response?.data?.message || "Network Error"));
    }
}

export const updateParentFields = (id, fields, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.put(`${REACT_APP_BASE_URL}/${address}/${id}`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(stuffDone());
            // Return the updated parent data
            return result.data;
        }
    } catch (error) {
        console.error("Error updating parent:", error);
        dispatch(getError(error.response?.data?.message || "Network Error"));
        throw error;
    }
}

export const removeParentStuff = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.delete(`${REACT_APP_BASE_URL}/${address}/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(stuffDone());
            return true; // Indicate successful deletion
        }
    } catch (error) {
        console.error("Error removing parent:", error);
        dispatch(getError(error.response?.data?.message || "Network Error"));
        throw error;
    }
}

// Additional parent-specific functions
export const getParentChildren = (parentId) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${REACT_APP_BASE_URL}/Parents/${parentId}/children`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        console.error("Error fetching parent's children:", error);
        dispatch(getError(error.response?.data?.message || "Network Error"));
    }
}