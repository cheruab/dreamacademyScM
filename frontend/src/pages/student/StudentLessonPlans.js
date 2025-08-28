import React, { useState, useEffect } from 'react';

const StudentLessonPlans = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [lessonPlans, setLessonPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [filters, setFilters] = useState({
        term: '',
        subject: ''
    });

    useEffect(() => {
        // Get current user from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            setCurrentUser(user);
            fetchLessonPlans(user._id);
        }
    }, []);

    const fetchLessonPlans = async (studentId) => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            
            if (filters.term) queryParams.append('term', filters.term);
            if (filters.subject) queryParams.append('subject', filters.subject);

            const url = `${process.env.REACT_APP_BASE_URL || 'http://localhost:5000'}/lesson-plans/student/${studentId}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success) {
                setLessonPlans(data.lessonPlans || []);
            } else {
                setError(data.message || 'Failed to load lesson plans');
            }
        } catch (err) {
            setError('Error loading lesson plans');
            console.error('Error fetching lesson plans:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser) {
            fetchLessonPlans(currentUser._id);
        }
    }, [filters]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
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

    const getUpcomingPlans = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return lessonPlans.filter(plan => {
            const lessonDate = new Date(plan.lessonDate);
            lessonDate.setHours(0, 0, 0, 0);
            return lessonDate >= today;
        }).sort((a, b) => new Date(a.lessonDate) - new Date(b.lessonDate));
    };

    const getPastPlans = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return lessonPlans.filter(plan => {
            const lessonDate = new Date(plan.lessonDate);
            lessonDate.setHours(0, 0, 0, 0);
            return lessonDate < today;
        }).sort((a, b) => new Date(b.lessonDate) - new Date(a.lessonDate));
    };

    const styles = {
        container: {
            padding: '20px',
            maxWidth: '1200px',
            margin: '0 auto',
            background: '#f5f5f5',
            minHeight: '100vh'
        },
        header: {
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            marginBottom: '20px',
            textAlign: 'center'
        },
        headerTitle: {
            fontSize: '2.5rem',
            color: '#1976d2',
            margin: '0 0 10px 0',
            fontWeight: '700'
        },
        headerSubtitle: {
            color: '#666',
            fontSize: '1.1rem',
            margin: 0
        },
        filtersContainer: {
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            marginBottom: '20px'
        },
        filtersGrid: {
            display: 'flex',
            gap: '15px',
            alignItems: 'center',
            flexWrap: 'wrap'
        },
        filterSelect: {
            padding: '10px 15px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '0.9rem',
            outline: 'none'
        },
        tabContainer: {
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            overflow: 'hidden'
        },
        tabButtons: {
            display: 'flex',
            borderBottom: '1px solid #e0e0e0'
        },
        tabButton: {
            flex: 1,
            padding: '15px 20px',
            background: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            borderBottom: '3px solid transparent'
        },
        activeTab: {
            color: '#1976d2',
            borderBottomColor: '#1976d2',
            background: '#f8f9fa'
        },
        tabContent: {
            padding: '20px'
        },
        lessonGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '20px'
        },
        lessonCard: {
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'pointer',
            border: '1px solid #e0e0e0'
        },
        lessonHeader: {
            marginBottom: '15px'
        },
        lessonTitle: {
            fontSize: '1.3rem',
            color: '#333',
            fontWeight: '600',
            margin: '0 0 8px 0',
            lineHeight: 1.3
        },
        lessonMeta: {
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            marginBottom: '10px'
        },
        metaTag: {
            fontSize: '0.75rem',
            padding: '4px 8px',
            borderRadius: '12px',
            fontWeight: '500'
        },
        subjectTag: {
            backgroundColor: '#e3f2fd',
            color: '#1976d2'
        },
        durationTag: {
            backgroundColor: '#f3e5f5',
            color: '#7b1fa2'
        },
        termTag: {
            backgroundColor: '#e8f5e8',
            color: '#388e3c'
        },
        dateTag: {
            backgroundColor: '#fff3e0',
            color: '#f57c00'
        },
        lessonDate: {
            fontSize: '1rem',
            color: '#333',
            fontWeight: '600',
            marginBottom: '10px'
        },
        lessonObjectives: {
            color: '#666',
            fontSize: '0.9rem',
            lineHeight: 1.5
        },
        objectivesList: {
            margin: '8px 0 0 0',
            paddingLeft: '15px'
        },
        loading: {
            textAlign: 'center',
            padding: '60px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        },
        error: {
            background: '#ffebee',
            color: '#c62828',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #ffcdd2',
            textAlign: 'center'
        },
        noPlans: {
            textAlign: 'center',
            padding: '60px 20px',
            color: '#666'
        },
        modal: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        },
        modalContent: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
        },
        modalHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '15px',
            borderBottom: '1px solid #e0e0e0'
        },
        modalTitle: {
            fontSize: '1.8rem',
            color: '#1976d2',
            margin: 0,
            fontWeight: '600'
        },
        closeButton: {
            background: 'none',
            border: 'none',
            fontSize: '28px',
            cursor: 'pointer',
            color: '#666',
            padding: '0',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        modalSection: {
            marginBottom: '25px'
        },
        sectionTitle: {
            fontSize: '1.2rem',
            color: '#333',
            fontWeight: '600',
            marginBottom: '10px',
            borderLeft: '4px solid #1976d2',
            paddingLeft: '12px'
        },
        metaGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '20px'
        },
        metaItem: {
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
        },
        metaLabel: {
            fontSize: '0.85rem',
            color: '#666',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        },
        metaValue: {
            fontSize: '1rem',
            color: '#333',
            fontWeight: '500'
        }
    };

    const [activeTab, setActiveTab] = useState('upcoming');

    if (!currentUser) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>
                    <p>Please log in to view lesson plans.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>
                    <p>Loading lesson plans...</p>
                </div>
            </div>
        );
    }

    const upcomingPlans = getUpcomingPlans();
    const pastPlans = getPastPlans();

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <h1 style={styles.headerTitle}>My Lesson Plans</h1>
                <p style={styles.headerSubtitle}>View your upcoming and past lesson plans</p>
            </div>

            {/* Filters */}
            <div style={styles.filtersContainer}>
                <div style={styles.filtersGrid}>
                    <select
                        value={filters.term}
                        onChange={(e) => setFilters({...filters, term: e.target.value})}
                        style={styles.filterSelect}
                    >
                        <option value="">All Terms</option>
                        <option value="First Term">First Term</option>
                        <option value="Second Term">Second Term</option>
                        <option value="Third Term">Third Term</option>
                    </select>

                    <select
                        value={filters.subject}
                        onChange={(e) => setFilters({...filters, subject: e.target.value})}
                        style={styles.filterSelect}
                    >
                        <option value="">All Subjects</option>
                        {lessonPlans.map(plan => plan.subject).filter((subject, index, self) =>
                            index === self.findIndex(s => s._id === subject._id)
                        ).map(subject => (
                            <option key={subject._id} value={subject._id}>
                                {subject.subName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div style={styles.error}>
                    {error}
                </div>
            )}

            {/* Main Content */}
            <div style={styles.tabContainer}>
                <div style={styles.tabButtons}>
                    <button
                        style={{
                            ...styles.tabButton,
                            ...(activeTab === 'upcoming' ? styles.activeTab : {})
                        }}
                        onClick={() => setActiveTab('upcoming')}
                    >
                        Upcoming Lessons ({upcomingPlans.length})
                    </button>
                    <button
                        style={{
                            ...styles.tabButton,
                            ...(activeTab === 'past' ? styles.activeTab : {})
                        }}
                        onClick={() => setActiveTab('past')}
                    >
                        Past Lessons ({pastPlans.length})
                    </button>
                </div>

                <div style={styles.tabContent}>
                    {activeTab === 'upcoming' ? (
                        upcomingPlans.length === 0 ? (
                            <div style={styles.noPlans}>
                                <h3>No upcoming lesson plans</h3>
                                <p>Check back later for new lesson plans from your teachers.</p>
                            </div>
                        ) : (
                            <div style={styles.lessonGrid}>
                                {upcomingPlans.map(plan => (
                                    <div
                                        key={plan._id}
                                        style={styles.lessonCard}
                                        onClick={() => setSelectedPlan(plan)}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-5px)';
                                            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                                        }}
                                    >
                                        <div style={styles.lessonHeader}>
                                            <h3 style={styles.lessonTitle}>{plan.title}</h3>
                                            <div style={styles.lessonMeta}>
                                                <span style={{...styles.metaTag, ...styles.subjectTag}}>
                                                    {plan.subject?.subName}
                                                </span>
                                                <span style={{...styles.metaTag, ...styles.durationTag}}>
                                                    {formatDuration(plan.duration)}
                                                </span>
                                                <span style={{...styles.metaTag, ...styles.termTag}}>
                                                    {plan.term}
                                                </span>
                                            </div>
                                            <div style={styles.lessonDate}>
                                                {formatDate(plan.lessonDate)}
                                            </div>
                                        </div>
                                        
                                        {plan.objectives && plan.objectives.length > 0 && (
                                            <div style={styles.lessonObjectives}>
                                                <strong>Learning Objectives:</strong>
                                                <ul style={styles.objectivesList}>
                                                    {plan.objectives.slice(0, 2).map((obj, index) => (
                                                        <li key={index}>{obj}</li>
                                                    ))}
                                                    {plan.objectives.length > 2 && (
                                                        <li>...and {plan.objectives.length - 2} more</li>
                                                    )}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )
                    ) : (
                        pastPlans.length === 0 ? (
                            <div style={styles.noPlans}>
                                <h3>No past lesson plans</h3>
                                <p>Your completed lesson plans will appear here.</p>
                            </div>
                        ) : (
                            <div style={styles.lessonGrid}>
                                {pastPlans.map(plan => (
                                    <div
                                        key={plan._id}
                                        style={{...styles.lessonCard, opacity: 0.8}}
                                        onClick={() => setSelectedPlan(plan)}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-5px)';
                                            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                                        }}
                                    >
                                        <div style={styles.lessonHeader}>
                                            <h3 style={styles.lessonTitle}>{plan.title}</h3>
                                            <div style={styles.lessonMeta}>
                                                <span style={{...styles.metaTag, ...styles.subjectTag}}>
                                                    {plan.subject?.subName}
                                                </span>
                                                <span style={{...styles.metaTag, ...styles.durationTag}}>
                                                    {formatDuration(plan.duration)}
                                                </span>
                                                <span style={{...styles.metaTag, ...styles.termTag}}>
                                                    {plan.term}
                                                </span>
                                            </div>
                                            <div style={styles.lessonDate}>
                                                {formatDate(plan.lessonDate)}
                                            </div>
                                        </div>
                                        
                                        {plan.objectives && plan.objectives.length > 0 && (
                                            <div style={styles.lessonObjectives}>
                                                <strong>What we learned:</strong>
                                                <ul style={styles.objectivesList}>
                                                    {plan.objectives.slice(0, 2).map((obj, index) => (
                                                        <li key={index}>{obj}</li>
                                                    ))}
                                                    {plan.objectives.length > 2 && (
                                                        <li>...and {plan.objectives.length - 2} more</li>
                                                    )}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Modal for selected lesson plan */}
            {selectedPlan && (
                <div style={styles.modal}>
                    <div style={styles.modalContent}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>{selectedPlan.title}</h2>
                            <button
                                onClick={() => setSelectedPlan(null)}
                                style={styles.closeButton}
                            >
                                ×
                            </button>
                        </div>

                        <div style={styles.modalSection}>
                            <div style={styles.metaGrid}>
                                <div style={styles.metaItem}>
                                    <span style={styles.metaLabel}>Subject</span>
                                    <span style={styles.metaValue}>{selectedPlan.subject?.subName}</span>
                                </div>
                                <div style={styles.metaItem}>
                                    <span style={styles.metaLabel}>Teacher</span>
                                    <span style={styles.metaValue}>{selectedPlan.teacher?.name}</span>
                                </div>
                                <div style={styles.metaItem}>
                                    <span style={styles.metaLabel}>Date</span>
                                    <span style={styles.metaValue}>{formatDate(selectedPlan.lessonDate)}</span>
                                </div>
                                <div style={styles.metaItem}>
                                    <span style={styles.metaLabel}>Duration</span>
                                    <span style={styles.metaValue}>{formatDuration(selectedPlan.duration)}</span>
                                </div>
                                <div style={styles.metaItem}>
                                    <span style={styles.metaLabel}>Term</span>
                                    <span style={styles.metaValue}>{selectedPlan.term} - Week {selectedPlan.week}</span>
                                </div>
                            </div>
                        </div>

                        {selectedPlan.objectives && selectedPlan.objectives.length > 0 && (
                            <div style={styles.modalSection}>
                                <h3 style={styles.sectionTitle}>Learning Objectives</h3>
                                <ul>
                                    {selectedPlan.objectives.map((obj, index) => (
                                        <li key={index} style={{marginBottom: '8px'}}>{obj}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {selectedPlan.homework?.assigned && (
                            <div style={styles.modalSection}>
                                <h3 style={styles.sectionTitle}>Homework Assignment</h3>
                                <div style={{
                                    background: '#fff3cd',
                                    border: '1px solid #ffeeba',
                                    borderRadius: '8px',
                                    padding: '15px'
                                }}>
                                    <p>{selectedPlan.homework.description}</p>
                                    {selectedPlan.homework.dueDate && (
                                        <p><strong>Due Date:</strong> {formatDate(selectedPlan.homework.dueDate)}</p>
                                    )}
                                    {selectedPlan.homework.instructions && (
                                        <div>
                                            <strong>Instructions:</strong>
                                            <p>{selectedPlan.homework.instructions}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {selectedPlan.materials && selectedPlan.materials.length > 0 && (
                            <div style={styles.modalSection}>
                                <h3 style={styles.sectionTitle}>Materials & Resources</h3>
                                <div style={{display: 'grid', gap: '10px'}}>
                                    {selectedPlan.materials.map((material, index) => (
                                        <div key={index} style={{
                                            border: '1px solid #e0e0e0',
                                            borderRadius: '8px',
                                            padding: '12px',
                                            background: '#fafafa'
                                        }}>
                                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                                <strong>{material.name}</strong>
                                                <span style={{
                                                    fontSize: '0.8rem',
                                                    padding: '3px 8px',
                                                    background: '#e3f2fd',
                                                    color: '#1976d2',
                                                    borderRadius: '12px'
                                                }}>
                                                    {material.type}
                                                </span>
                                            </div>
                                            {material.description && <p style={{margin: '8px 0'}}>{material.description}</p>}
                                            {material.link && (
                                                <a 
                                                    href={material.link} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    style={{color: '#1976d2', textDecoration: 'none'}}
                                                >
                                                    Access Resource
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentLessonPlans;