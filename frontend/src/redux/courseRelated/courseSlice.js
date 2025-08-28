import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    coursesList: [],
    courseDetail: null,
    loading: false,
    error: null,
};

const courseSlice = createSlice({
    name: "course",
    initialState,
    reducers: {
        requestStart: (state) => { state.loading = true; state.error = null; },
        requestSuccess: (state, action) => { state.coursesList = action.payload; state.loading = false; },
        detailSuccess: (state, action) => { state.courseDetail = action.payload; state.loading = false; },
        requestFail: (state, action) => { state.error = action.payload; state.loading = false; },
        resetCourses: (state) => { state.coursesList = []; state.courseDetail = null; },
    }
});

export const { requestStart, requestSuccess, requestFail, detailSuccess, resetCourses } = courseSlice.actions;
export const courseReducer = courseSlice.reducer;
