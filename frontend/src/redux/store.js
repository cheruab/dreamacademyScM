import { configureStore } from '@reduxjs/toolkit';
import { userReducer } from './userRelated/userSlice';
import { studentReducer } from './studentRelated/studentSlice';
import { parentReducer } from './studentsRelated/parentSlice';
import { noticeReducer } from './noticeRelated/noticeSlice';
import { sclassReducer } from './sclassRelated/sclassSlice';
import { teacherReducer } from './teacherRelated/teacherSlice';
import { complainReducer } from './complainRelated/complainSlice';
import { courseReducer } from './courseRelated/courseSlice';


const store = configureStore({
    reducer: {
        user: userReducer,
        student: studentReducer,
        parent: parentReducer,
        teacher: teacherReducer,
        notice: noticeReducer,
        complain: complainReducer,
        course: courseReducer,
        sclass: sclassReducer
    },
});

export default store;
