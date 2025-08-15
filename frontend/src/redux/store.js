import { configureStore } from '@reduxjs/toolkit';
import { userReducer } from './userRelated/userSlice';
import { studentReducer } from './studentRelated/studentSlice';
import { parentReducer } from './studentsRelated/parentSlice';
import { noticeReducer } from './noticeRelated/noticeSlice';
import { sclassReducer } from './sclassRelated/sclassSlice';
import { teacherReducer } from './teacherRelated/teacherSlice';
import { complainReducer } from './complainRelated/complainSlice';


const store = configureStore({
    reducer: {
        user: userReducer,
        student: studentReducer,
        parent: parentReducer,
        teacher: teacherReducer,
        notice: noticeReducer,
        complain: complainReducer,
        sclass: sclassReducer
    },
});

export default store;
