import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    status: 'idle',
    userDetails: [],
    tempDetails: [],
    loading: false,
    currentUser: JSON.parse(localStorage.getItem('user')) || null,
    currentRole: (JSON.parse(localStorage.getItem('user')) || {}).role || null,
    error: null,
    response: null,
    darkMode: true,

    // Complaints
    complains: [],
    loadingComplains: false,
    complainsError: null,

    // Exams
    exams: [],
    examLoading: false,
    examError: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    status: 'idle',
        loading: false,
        currentUser: null,
        response: null,
        error: null,
    reducers: {
        // ==========================
        // Existing reducers
        // ==========================
        authRequest: (state) => {
            state.status = 'loading';
        },
        underControl: (state) => {
            state.status = 'idle';
            state.response = null;
        },
        stuffAdded: (state, action) => {
            state.status = 'added';
            state.response = null;
            state.error = null;
            state.tempDetails = action.payload;
        },
        authSuccess: (state, action) => {
            state.status = 'success';
            state.currentUser = action.payload;
            state.currentRole = action.payload.role;
            localStorage.setItem('user', JSON.stringify(action.payload));
            state.response = null;
            state.error = null;
        },
        authFailed: (state, action) => {
            state.status = 'failed';
            state.response = action.payload;
        },
        authError: (state, action) => {
            state.status = 'error';
            state.error = action.payload;
        },
        authLogout: (state) => {
            localStorage.removeItem('user');
            state.currentUser = null;
            state.status = 'idle';
            state.error = null;
            state.currentRole = null;
        },

       
        getDeleteSuccess: (state) => {
            state.loading = false;
            state.error = null;
            state.response = null;
        },

        getRequest: (state) => {
            state.loading = true;
        },
        
        toggleDarkMode: (state) => {
            state.darkMode = !state.darkMode;
        },

        // ==========================
        // Complaints reducers
        // ==========================
        complainsRequest: (state) => {
            state.loadingComplains = true;
            state.complainsError = null;
        },
        complainsSuccess: (state, action) => {
            state.loadingComplains = false;
            state.complains = action.payload;
            state.complainsError = null;
        },
        complainsFail: (state, action) => {
            state.loadingComplains = false;
            state.complainsError = action.payload;
        },
        getRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        doneSuccess: (state, action) => {
            state.loading = false;
            state.response = action.payload;
            state.error = null;
            state.status = 'success';
        },
        getFailed: (state, action) => {
            state.loading = false;
            state.response = action.payload;
            state.error = action.payload;
            state.status = 'failed';
        },
        getError: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.status = 'error';
        },

        // ==========================
        // Exams reducers
        // ==========================
        examRequest: (state) => {
            state.examLoading = true;
            state.examError = null;
        },
        examAdded: (state, action) => {
            state.examLoading = false;
            state.status = 'examAdded';
            state.response = action.payload;
            state.error = null;
        },
        examsFetched: (state, action) => {
            state.examLoading = false;
            state.status = 'examsFetched';
            state.exams = action.payload;
        },
        examFailed: (state, action) => {
            state.examLoading = false;
            state.status = 'examFailed';
            state.examError = action.payload;
        },
    },
});

export const {
    // Existing
    authRequest,
    underControl,
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
    toggleDarkMode,

    // Complaints
    complainsRequest,
    complainsSuccess,
    complainsFail,

    // Exams
    examRequest,
    examAdded,
    examsFetched,
    examFailed,
} = userSlice.actions;

export const userReducer = userSlice.reducer;
