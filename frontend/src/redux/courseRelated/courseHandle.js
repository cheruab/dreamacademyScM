import axios from 'axios';
import { requestStart, requestSuccess, requestFail, detailSuccess } from './courseSlice';

const BASE_URL = "http://localhost:5000";

export const getStudentCourses = (studentId) => async (dispatch) => {
    dispatch(requestStart());
    try {
        const { data } = await axios.get(`${BASE_URL}/courses/student/${studentId}`);
        dispatch(requestSuccess(data));
    } catch (error) {
        dispatch(requestFail(error.response?.data.message || error.message));
    }
};

export const getCourseDetail = (courseId) => async (dispatch) => {
    dispatch(requestStart());
    try {
        const { data } = await axios.get(`${BASE_URL}/courses/${courseId}`);
        dispatch(detailSuccess(data));
    } catch (error) {
        dispatch(requestFail(error.response?.data.message || error.message));
    }
};
