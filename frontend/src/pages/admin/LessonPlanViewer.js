import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const LessonPlanViewer = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const planId = searchParams.get('planId');

    const [lessonPlan, setLessonPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (planId) {
            fetchLessonPlan();
        } else {
            setError('No lesson plan ID provided');
            setLoading(false);
        }
    }, [planId]);

    const fetchLessonPlan = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${process.env.REACT_APP_BASE_URL || 'http://localhost:5000'}/lesson-plans/${planId}`);
            const data = await response.json();
            
            if (data.success) {
                setLessonPlan(data.lessonPlan);
            } else {
                setError(data.message || 'Failed to load lesson plan');
            }
        } catch (err) {
            setError('Error loading lesson plan');
            console.error('Error fetching lesson plan:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins} minutes`;
    };

    const styles = {
        container: {
            padding: '20px',
            maxWidth: '900px',
            margin: '0 auto',
            backgroundColor: '#f8f9fa',
            minHeight: '100vh',
            fontFamily: 'Arial, sans-serif'
        },
        loadingContainer: {
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        },
        errorContainer: {
            textAlign: 'center',
            padding: '40px 20px',
            backgroundColor: '#fff5f5',
            border: '1px solid #fed7d7',
            borderRadius: '12px',
            color: '#c53030'
        },
        planContainer: {
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
        },
        header: {
            borderBottom: '3px solid #3182ce',
            paddingBottom: '30px',
            marginBottom: '40px'
        },
        title: {
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#2d3748',
            marginBottom: '20px',
            lineHeight: '1.2'
        },
        metaGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginTop: '20px'
        },
        metaItem: {
            padding: '15px',
            backgroundColor: '#f7fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
        },
        metaLabel: {
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#718096',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '5px'
        },
        metaValue: {
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#2d3748'
        },
        section: {
            marginBottom: '40px'
        },
        sectionTitle: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#3182ce',
            marginBottom: '20px',
            paddingBottom: '10px',
            borderBottom: '2px solid #bee3f8'
        },
        objectivesList: {
            listStyle: 'none',
            padding: '0',
            margin: '0'
        },
        objectiveItem: {
            padding: '12px 0',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
        },
        objectiveBullet: {
            width: '8px',
            height: '8px',
            backgroundColor: '#3182ce',
            borderRadius: '50%',
            marginTop: '8px',
            flexShrink: 0
        },
        objectiveText: {
            color: '#4a5568',
            lineHeight: '1.6',
            fontSize: '1rem'
        },
        contentBox: {
            backgroundColor: '#f7fafc',
            padding: '25px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
        },
        contentTitle: {
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#2d3748',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        durationBadge: {
            backgroundColor: '#3182ce',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '16px',
            fontSize: '0.875rem',
            fontWeight: '500'
        },
        contentText: {
            color: '#4a5568',
            lineHeight: '1.7',
            fontSize: '1rem'
        },
        keyPointsList: {
            listStyle: 'disc',
            paddingLeft: '20px',
            marginTop: '15px'
        },
        keyPointItem: {
            marginBottom: '8px',
            color: '#4a5568',
            lineHeight: '1.6'
        },
        assessmentBox: {
            backgroundColor: '#f0fff4',
            border: '1px solid #9ae6b4',
            borderRadius: '12px',
            padding: '25px'
        },
        assessmentType: {
            display: 'inline-block',
            backgroundColor: '#38a169',
            color: 'white',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '0.875rem',
            fontWeight: '600',
            marginBottom: '15px'
        },
        homeworkBox: {
            backgroundColor: '#fffbeb',
            border: '1px solid #f6e05e',
            borderRadius: '12px',
            padding: '25px'
        },
        homeworkStatus: {
            display: 'inline-block',
            backgroundColor: '#d69e2e',
            color: 'white',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '0.875rem',
            fontWeight: '600',
            marginBottom: '15px'
        },
        notesBox: {
            backgroundColor: '#edf2f7',
            border: '1px solid #cbd5e0',
            borderRadius: '12px',
            padding: '25px',
            fontStyle: 'italic'
        },
        backButton: {
            backgroundColor: '#3182ce',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '30px',
            transition: 'background-color 0.2s'
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingContainer}>
                    <h3>Loading lesson plan...</h3>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <div style={styles.errorContainer}>
                    <h3>Error</h3>
                    <p>{error}</p>
                    <button 
                        onClick={() => window.history.back()}
                        style={styles.backButton}
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!lessonPlan) {
        return (
            <div style={styles.container}>
                <div style={styles.errorContainer}>
                    <h3>Lesson plan not found</h3>
                    <button 
                        onClick={() => window.history.back()}
                        style={styles.backButton}
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <button 
                onClick={() => window.history.back()}
                style={styles.backButton}
                onMouseOver={(e) => e.target.style.backgroundColor = '#2c5282'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#3182ce'}
            >
                ← Back to Dashboard
            </button>

            <div style={styles.planContainer}>
                <div style={styles.header}>
                    <h1 style={styles.title}>{lessonPlan.title}</h1>
                    
                    <div style={styles.metaGrid}>
                        <div style={styles.metaItem}>
                            <div style={styles.metaLabel}>Subject</div>
                            <div style={styles.metaValue}>{lessonPlan.subject?.subName}</div>
                        </div>
                        <div style={styles.metaItem}>
                            <div style={styles.metaLabel}>Date</div>
                            <div style={styles.metaValue}>{formatDate(lessonPlan.lessonDate)}</div>
                        </div>
                        <div style={styles.metaItem}>
                            <div style={styles.metaLabel}>Duration</div>
                            <div style={styles.metaValue}>{formatDuration(lessonPlan.duration)}</div>
                        </div>
                        <div style={styles.metaItem}>
                            <div style={styles.metaLabel}>Term</div>
                            <div style={styles.metaValue}>{lessonPlan.term} - Week {lessonPlan.week}</div>
                        </div>
                    </div>
                </div>

                {/* Learning Objectives */}
                {lessonPlan.objectives && lessonPlan.objectives.length > 0 && (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>Learning Objectives</h2>
                        <ul style={styles.objectivesList}>
                            {lessonPlan.objectives.map((objective, index) => (
                                <li key={index} style={styles.objectiveItem}>
                                    <div style={styles.objectiveBullet}></div>
                                    <div style={styles.objectiveText}>{objective}</div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Lesson Structure */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Lesson Structure</h2>
                    
                    {/* Introduction */}
                    {lessonPlan.introduction?.description && (
                        <div style={styles.contentBox}>
                            <div style={styles.contentTitle}>
                                Introduction
                                <span style={styles.durationBadge}>
                                    {formatDuration(lessonPlan.introduction.duration || 0)}
                                </span>
                            </div>
                            <div style={styles.contentText}>
                                {lessonPlan.introduction.description}
                            </div>
                        </div>
                    )}

                    {/* Main Content */}
                    {lessonPlan.mainContent?.description && (
                        <div style={styles.contentBox}>
                            <div style={styles.contentTitle}>
                                Main Content
                                <span style={styles.durationBadge}>
                                    {formatDuration(lessonPlan.mainContent.duration || 0)}
                                </span>
                            </div>
                            <div style={styles.contentText}>
                                {lessonPlan.mainContent.description}
                            </div>
                            
                            {lessonPlan.mainContent?.keyPoints && lessonPlan.mainContent.keyPoints.length > 0 && (
                                <div>
                                    <h4 style={{...styles.contentTitle, fontSize: '1.1rem', marginTop: '20px', marginBottom: '10px'}}>
                                        Key Points:
                                    </h4>
                                    <ul style={styles.keyPointsList}>
                                        {lessonPlan.mainContent.keyPoints.map((point, index) => (
                                            <li key={index} style={styles.keyPointItem}>{point}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Conclusion */}
                    {lessonPlan.conclusion?.description && (
                        <div style={styles.contentBox}>
                            <div style={styles.contentTitle}>
                                Conclusion
                                <span style={styles.durationBadge}>
                                    {formatDuration(lessonPlan.conclusion.duration || 0)}
                                </span>
                            </div>
                            <div style={styles.contentText}>
                                {lessonPlan.conclusion.description}
                            </div>
                        </div>
                    )}
                </div>

                {/* Assessment */}
                {lessonPlan.assessment && (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>Assessment</h2>
                        <div style={styles.assessmentBox}>
                            <div style={styles.assessmentType}>
                                {lessonPlan.assessment.type}
                            </div>
                            {lessonPlan.assessment.description && (
                                <div style={styles.contentText}>
                                    {lessonPlan.assessment.description}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Homework */}
                {lessonPlan.homework?.assigned && (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>Homework Assignment</h2>
                        <div style={styles.homeworkBox}>
                            <div style={styles.homeworkStatus}>
                                Homework Assigned
                            </div>
                            {lessonPlan.homework.description && (
                                <div style={styles.contentText}>
                                    {lessonPlan.homework.description}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Additional Notes */}
                {lessonPlan.notes && (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>Additional Notes</h2>
                        <div style={styles.notesBox}>
                            <div style={styles.contentText}>
                                {lessonPlan.notes}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LessonPlanViewer;