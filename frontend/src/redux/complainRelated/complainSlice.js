import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    complainsList: [],
    loading: false,
    error: null,
    response: null,
    // New state for reply functionality
    replyLoading: false,
    replySuccess: null,
    replyError: null,
};

const complainSlice = createSlice({
    name: 'complain',
    initialState,
    reducers: {
        // Existing reducers - keeping exactly as they are
        getRequest: (state) => {
            state.loading = true;
        },
        getSuccess: (state, action) => {
            state.complainsList = action.payload;
            state.loading = false;
            state.error = null;
            state.response = null;
        },
        getFailed: (state, action) => {
            state.response = action.payload;
            state.loading = false;
            state.error = null;
        },
        getError: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        
        // NEW: Reply functionality reducers
        replyRequest: (state) => {
            state.replyLoading = true;
            state.replyError = null;
            state.replySuccess = null;
        },
        replySuccess: (state, action) => {
            state.replyLoading = false;
            state.replySuccess = action.payload.message;
            state.replyError = null;
            
            // Update the specific complaint in the list if it exists
            if (action.payload.complaint) {
                const index = state.complainsList.findIndex(
                    complaint => complaint._id === action.payload.complaint._id
                );
                if (index !== -1) {
                    state.complainsList[index] = action.payload.complaint;
                }
            }
        },
        replyFailed: (state, action) => {
            state.replyLoading = false;
            state.replyError = action.payload;
            state.replySuccess = null;
        },
        
        // NEW: Clear reply states (useful for cleanup)
        clearReplyState: (state) => {
            state.replyLoading = false;
            state.replyError = null;
            state.replySuccess = null;
        },
        
        // NEW: Update single complaint (useful after reply without full refresh)
        updateComplaint: (state, action) => {
            const index = state.complainsList.findIndex(
                complaint => complaint._id === action.payload._id
            );
            if (index !== -1) {
                state.complainsList[index] = action.payload;
            }
        },
        
        // NEW: Clear all state (useful for logout or component cleanup)
        clearComplaintState: (state) => {
            state.complainsList = [];
            state.loading = false;
            state.error = null;
            state.response = null;
            state.replyLoading = false;
            state.replySuccess = null;
            state.replyError = null;
        }
    },
});

export const {
    // Existing actions - keeping exactly as they are
    getRequest,
    getSuccess,
    getFailed,
    getError,
    
    // New actions for reply functionality
    replyRequest,
    replySuccess,
    replyFailed,
    clearReplyState,
    updateComplaint,
    clearComplaintState
} = complainSlice.actions;

export const complainReducer = complainSlice.reducer;