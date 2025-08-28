import React, { useState, useEffect } from 'react';

const LessonPlanDashboard = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [lessonPlans, setLessonPlans] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        subject: '',
        term: '',
        status: '',
        search: ''
    });
    const [selectedPlan, setSelectedPlan] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setCurrentUser(JSON.parse(userData));
        }
    }, []);

    useEffect(() => {
        if (currentUser) {
            fetchLessonPlans();
            fetchSubjects();
        }
    }, [currentUser, filters]);

    const fetchLessonPlans = async () => {
        if (!currentUser) return;

        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            
            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });

            const url = `${process.env.REACT_APP_BASE_URL || 'http://localhost:5000'}/lesson-plans/school/${currentUser._id}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            
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

    const fetchSubjects = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL || 'http://localhost:5000'}/AllSubjects/${currentUser._id}`);
            const data = await response.json();
            setSubjects(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const clearFilters = () => {
        setFilters({
            subject: '',
            term: '',
            status: '',
            search: ''
        });
    };

    const deleteLessonPlan = async (planId) => {
        if (!window.confirm('Are you sure you want to delete this lesson plan?')) {
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL || 'http://localhost:5000'}/lesson-plans/${planId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                setLessonPlans(prev => prev.filter(plan => plan._id !== planId));
                if (selectedPlan && selectedPlan._id === planId) {
                    setSelectedPlan(null);
                }
            } else {
                alert('Failed to delete lesson plan: ' + data.message);
            }
        } catch (error) {
            console.error('Error deleting lesson plan:', error);
            alert('Error deleting lesson plan');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}min`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Published': return '#4caf50';
            case 'Draft': return '#ff9800';
            default: return '#2196f3';
        }
    };

    const styles = {
        container: { padding: '20px', background: '#f5f5f5', minHeight: '100vh' },
        header: { background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px' },
        headerTitle: { fontSize: '2.5rem', color: '#1976d2', margin: '0 0 10px 0', fontWeight: '700' },
        headerSubtitle: { color: '#666', fontSize: '1.1rem', margin: '0 0 20px 0' },
        headerActions: { display: 'flex', gap: '15px', alignItems: 'center' },
        primaryButton: { background: '#1976d2', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s ease' },
        secondaryButton: { background: '#f5f5f5', color: '#333', border: '1px solid #ddd', padding: '10px 20px', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.3s ease' },
        dangerButton: { background: '#f44336', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.3s ease' },
        filtersContainer: { background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px' },
        filtersTitle: { fontSize: '1.3rem', color: '#333', marginBottom: '20px', fontWeight: '600' },
        filtersGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', alignItems: 'end' },
        filterGroup: { display: 'flex', flexDirection: 'column' },
        filterLabel: { fontSize: '0.9rem', color: '#555', marginBottom: '5px', fontWeight: '500' },
        filterInput: { padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.3s ease' },
        lessonPlansGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' },
        lessonPlanCard: { background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', transition: 'transform 0.3s ease, box-shadow 0.3s ease', cursor: 'pointer', border: '1px solid #e0e0e0' },
        cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' },
        cardTitle: { fontSize: '1.3rem', color: '#333', fontWeight: '600', margin: '0 0 5px 0', lineHeight: '1.3' },
        statusBadge: { padding: '4px 12px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: '600', color: 'white' },
        cardMeta: { display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginBottom: '15px' },
        metaItem: { fontSize: '0.85rem' },
        metaLabel: { color: '#666', fontWeight: '500' },
        metaValue: { color: '#333', fontWeight: '600' },
        cardDescription: { color: '#666', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '15px' },
        cardActions: { display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '15px', borderTop: '1px solid #f0f0f0' },
        actionButton: { background: 'transparent', border: '1px solid #ddd', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.3s ease' },
        loading: { textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
        error: { background: '#ffebee', color: '#c62828', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ffcdd2' },
        noResults: { textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
        noResultsTitle: { fontSize: '1.5rem', color: '#666', marginBottom: '10px' },
        noResultsText: { color: '#999', marginBottom: '20px' }
    };

    if (!currentUser) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>
                    <p>Please log in to view lesson plans.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.headerTitle}>Lesson Plans Management</h1>
                <p style={styles.headerSubtitle}>Create and manage lesson plans for your subjects</p>
                <div style={styles.headerActions}>
                    <button
                        style={styles.primaryButton}
                        onClick={() => window.location.href = '/Admin/lesson-planform'}
                        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                        + Create New Lesson Plan
                    </button>
                    <button style={styles.secondaryButton} onClick={() => window.location.reload()}>
                        Refresh
                    </button>
                </div>
            </div>

            <div style={styles.filtersContainer}>
                <h3 style={styles.filtersTitle}>Filter Lesson Plans</h3>
                <div style={styles.filtersGrid}>
                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Search</label>
                        <input
                            type="text"
                            placeholder="Search by title or content..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            style={styles.filterInput}
                        />
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Subject</label>
                        <select
                            value={filters.subject}
                            onChange={(e) => handleFilterChange('subject', e.target.value)}
                            style={styles.filterInput}
                        >
                            <option value="">All Subjects</option>
                            {subjects.map(subject => (
                                <option key={subject._id} value={subject._id}>
                                    {subject.subName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Term</label>
                        <select
                            value={filters.term}
                            onChange={(e) => handleFilterChange('term', e.target.value)}
                            style={styles.filterInput}
                        >
                            <option value="">All Terms</option>
                            <option value="First Term">First Term</option>
                            <option value="Second Term">Second Term</option>
                            <option value="Third Term">Third Term</option>
                        </select>
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            style={styles.filterInput}
                        >
                            <option value="">All Status</option>
                            <option value="Published">Published</option>
                            <option value="Draft">Draft</option>
                        </select>
                    </div>

                    <div style={styles.filterGroup}>
                        <button style={styles.secondaryButton} onClick={clearFilters}>
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div style={styles.error}>
                    {error}
                </div>
            )}

            {loading ? (
                <div style={styles.loading}>
                    <p>Loading lesson plans...</p>
                </div>
            ) : lessonPlans.length === 0 ? (
                <div style={styles.noResults}>
                    <h3 style={styles.noResultsTitle}>No lesson plans found</h3>
                    <p style={styles.noResultsText}>
                        {Object.values(filters).some(f => f) 
                            ? 'No lesson plans match your current filters. Try adjusting your search criteria.'
                            : 'You haven\'t created any lesson plans yet. Get started by creating your first lesson plan.'
                        }
                    </p>
                    <button
                        style={styles.primaryButton}
                        onClick={() => window.location.href = '/Admin/lesson-planform'}
                    >
                        Create Your First Lesson Plan
                    </button>
                </div>
            ) : (
                <div style={styles.lessonPlansGrid}>
                    {lessonPlans.map((plan) => (
                        <div
                            key={plan._id}
                            style={styles.lessonPlanCard}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                            }}
                            onClick={() => setSelectedPlan(plan)}
                        >
                            <div style={styles.cardHeader}>
                                <div>
                                    <h3 style={styles.cardTitle}>{plan.title}</h3>
                                    <div style={styles.cardMeta}>
                                        <div style={styles.metaItem}>
                                            <span style={styles.metaLabel}>Subject: </span>
                                            <span style={styles.metaValue}>{plan.subject?.subName}</span>
                                        </div>
                                        <div style={styles.metaItem}>
                                            <span style={styles.metaLabel}>Duration: </span>
                                            <span style={styles.metaValue}>{formatDuration(plan.duration)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    style={{
                                        ...styles.statusBadge,
                                        backgroundColor: getStatusColor(plan.status)
                                    }}
                                >
                                    {plan.status}
                                </div>
                            </div>

                            <div style={styles.cardDescription}>
                                <div style={styles.metaItem}>
                                    <span style={styles.metaLabel}>Date: </span>
                                    <span style={styles.metaValue}>{formatDate(plan.lessonDate)}</span>
                                </div>
                                <div style={styles.metaItem}>
                                    <span style={styles.metaLabel}>Term: </span>
                                    <span style={styles.metaValue}>{plan.term} - Week {plan.week}</span>
                                </div>
                                {plan.objectives && plan.objectives.length > 0 && (
                                    <p style={{marginTop: '10px', fontSize: '0.85rem', color: '#666'}}>
                                        <strong>Objectives:</strong> {plan.objectives[0].substring(0, 100)}{plan.objectives[0].length > 100 ? '...' : ''}
                                    </p>
                                )}
                            </div>

                            <div style={styles.cardActions}>
                                <button
                                    style={styles.actionButton}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedPlan(plan);
                                    }}
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                                >
                                    View Details
                                </button>
                                <button
                                    style={styles.actionButton}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.location.href = `/Admin/lesson-planform?subjectId=${plan.subject._id}&editId=${plan._id}`;
                                    }}
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                                >
                                    Edit
                                </button>
                                <button
                                    style={{...styles.actionButton, ...styles.dangerButton}}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteLessonPlan(plan._id);
                                    }}
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#d32f2f'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = '#f44336'}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedPlan && (
                <div style={{
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
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '12px',
                        maxWidth: '800px',
                        width: '100%',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                            <h2 style={{color: '#1976d2', margin: 0}}>Lesson Plan Details</h2>
                            <button
                                onClick={() => setSelectedPlan(null)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#666'
                                }}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div>
                            <h3 style={{color: '#333', marginBottom: '15px'}}>{selectedPlan.title}</h3>
                            
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px'}}>
                                <div>
                                    <p><strong>Subject:</strong> {selectedPlan.subject?.subName}</p>
                                    <p><strong>Duration:</strong> {formatDuration(selectedPlan.duration)}</p>
                                </div>
                                <div>
                                    <p><strong>Date:</strong> {formatDate(selectedPlan.lessonDate)}</p>
                                    <p><strong>Term:</strong> {selectedPlan.term} - Week {selectedPlan.week}</p>
                                </div>
                            </div>

                            {selectedPlan.objectives && selectedPlan.objectives.length > 0 && (
                                <div style={{marginBottom: '20px'}}>
                                    <h4 style={{color: '#1976d2'}}>Learning Objectives:</h4>
                                    <ul>
                                        {selectedPlan.objectives.map((obj, index) => (
                                            <li key={index} style={{marginBottom: '5px'}}>{obj}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div style={{textAlign: 'center', marginTop: '30px'}}>
                                <button
                                    style={styles.primaryButton}
                                    onClick={() => {
                                        setSelectedPlan(null);
                                        window.location.href = `/lesson-plan/?planId=${selectedPlan._id}`;
                                    }}
                                >
                                    View Full Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LessonPlanDashboard;