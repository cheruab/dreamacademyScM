import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCourseDetail } from '../../redux/courseRelated/courseHandle';
import { useParams } from 'react-router-dom';
import { Typography, Card, CardContent, Button, Grid } from '@mui/material';

const StudentCourseDetails = () => {
    const dispatch = useDispatch();
    const { courseDetail, loading } = useSelector(state => state.course);
    const { courseID } = useParams();

    useEffect(() => {
        dispatch(getCourseDetail(courseID));
    }, [dispatch, courseID]);

    if (loading) return <div>Loading...</div>;

    return (
        <Grid container spacing={2}>
            {courseDetail && (
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h4">{courseDetail.title}</Typography>
                            <Typography variant="body1" gutterBottom>{courseDetail.description}</Typography>
                            {courseDetail.teacher && (
                                <Typography variant="body2" gutterBottom>
                                    Teacher: {courseDetail.teacher.name}
                                </Typography>
                            )}
                            <Typography variant="h6">Videos:</Typography>
                            {courseDetail.videos.map((link, i) => (
                                <Button
                                    key={i}
                                    href={link}
                                    target="_blank"
                                    rel="noopener"
                                    variant="outlined"
                                    sx={{ m: 0.5 }}
                                >
                                    Video {i + 1}
                                </Button>
                            ))}
                        </CardContent>
                    </Card>
                </Grid>
            )}
        </Grid>
    );
};

export default StudentCourseDetails;
