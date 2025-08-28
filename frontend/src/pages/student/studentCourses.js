import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getStudentCourses } from '../../redux/courseRelated/courseHandle';
import { Typography, Card, CardContent, CardActions, Button, Grid } from '@mui/material';

const StudentCourses = () => {
    const dispatch = useDispatch();
    const { coursesList, loading } = useSelector(state => state.course);
    const { currentUser } = useSelector(state => state.user);

    useEffect(() => {
        if(currentUser?._id){
            dispatch(getStudentCourses(currentUser._id));
        }
    }, [dispatch, currentUser]);

    if(loading) return <div>Loading...</div>;

    return (
        <Grid container spacing={2}>
            {coursesList && coursesList.length > 0 ? coursesList.map(course => (
                <Grid item xs={12} md={6} key={course._id}>
                    <Card>
                        <CardContent>
                            <Typography variant="h5">{course.title}</Typography>
                            <Typography variant="body1">{course.description}</Typography>
                        </CardContent>
                        <CardActions>
                            {course.videos.map((link, i) => (
                                <Button key={i} href={link} target="_blank" rel="noopener">
                                    Watch Video {i+1}
                                </Button>
                            ))}
                        </CardActions>
                    </Card>
                </Grid>
            )) : (
                <Typography variant="h6">You are not enrolled in any course yet.</Typography>
            )}
        </Grid>
    );
};

export default StudentCourses;
