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
        
        
        toggleDarkMode: (state) => {
            state.darkMode = !state.darkMode;
        },

        // In userSlice.js, update the authError reducer:
authError: (state, action) => {
    state.status = 'error';
    // Extract only the serializable parts of the error
    if (action.payload && action.payload.isAxiosError) {
        // For Axios errors, extract only the serializable information
        state.error = {
            message: action.payload.message,
            code: action.payload.code,
            status: action.payload.response?.status,
            statusText: action.payload.response?.statusText,
            data: action.payload.response?.data
        };
    } else {
        // For regular errors, just store the message
        state.error = {
            message: action.payload?.message || String(action.payload)
        };
    }
},

// Also update getError reducer:
getError: (state, action) => {
    state.loading = false;
    if (action.payload && action.payload.isAxiosError) {
        state.error = {
            message: action.payload.message,
            code: action.payload.code,
            status: action.payload.response?.status,
            statusText: action.payload.response?.statusText,
            data: action.payload.response?.data
        };
    } else {
        state.error = {
            message: action.payload?.message || String(action.payload)
        };
    }
    state.status = 'error';
},

        // ==========================
        // Complaints reducers - FIXED
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