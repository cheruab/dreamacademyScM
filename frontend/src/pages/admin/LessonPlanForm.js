import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const LessonPlanForm = ({ subjectId: propSubjectId, onClose, onSuccess }) => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const urlSubjectId = searchParams.get('subjectId');
    const editId = searchParams.get('editId');

    const finalSubjectId = propSubjectId || urlSubjectId;

    const [currentUser, setCurrentUser] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState(finalSubjectId || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('info');
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        duration: 60,
        lessonDate: new Date().toISOString().split('T')[0],
        week: 1,
        term: 'First Term',
        objectives: [''],
        introduction: '',
        mainContent: '',
        keyPoints: [''],
        conclusion: '',
        assessment: {
            type: 'Formative',
            description: ''
        },
        homework: {
            assigned: false,
            description: ''
        },
        notes: ''
    });

    const styles = {
        container: { padding: '20px', maxWidth: '800px', margin: '0 auto', backgroundColor: '#f5f5f5', minHeight: '100vh' },
        header: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px', textAlign: 'center' },
        headerTitle: { fontSize: '1.8rem', color: '#1976d2', margin: '0 0 10px 0', fontWeight: '600' },
        form: { backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
        section: { marginBottom: '25px' },
        sectionTitle: { fontSize: '1.2rem', color: '#333', marginBottom: '15px', fontWeight: '600', borderLeft: '4px solid #1976d2', paddingLeft: '12px' },
        formGroup: { marginBottom: '15px' },
        label: { display: 'block', fontSize: '0.9rem', color: '#555', marginBottom: '5px', fontWeight: '500' },
        input: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' },
        textarea: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', resize: 'vertical', minHeight: '80px', boxSizing: 'border-box' },
        select: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', backgroundColor: 'white', boxSizing: 'border-box' },
        formRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' },
        arrayItem: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
        arrayInput: { flex: 1, padding: '8px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem', outline: 'none' },
        addButton: { backgroundColor: '#1976d2', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '500' },
        removeButton: { backgroundColor: '#f44336', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' },
        checkboxContainer: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 0' },
        checkbox: { width: '18px', height: '18px' },
        message: { padding: '12px 15px', borderRadius: '6px', marginBottom: '20px', fontWeight: '500', textAlign: 'center' },
        messageSuccess: { backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' },
        messageError: { backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' },
        actions: { display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee' },
        buttonPrimary: { backgroundColor: '#1976d2', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', fontSize: '0.95rem', cursor: 'pointer', fontWeight: '600', minWidth: '120px' },
        buttonSecondary: { backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', fontSize: '0.95rem', cursor: 'pointer', fontWeight: '600', minWidth: '120px' },
        buttonOutline: { backgroundColor: 'transparent', color: '#6c757d', border: '1px solid #6c757d', padding: '12px 24px', borderRadius: '6px', fontSize: '0.95rem', cursor: 'pointer', fontWeight: '600', minWidth: '120px' }
    };

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            setCurrentUser(JSON.parse(user));
        }
    }, []);

    useEffect(() => {
        if (currentUser) {
            fetchSubjects();
            if (editId) {
                setIsEditing(true);
                fetchLessonPlan(editId);
            }
        }
    }, [currentUser, editId]);

    const fetchSubjects = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL || 'http://localhost:5000'}/AllSubjects/${currentUser._id}`);
            const data = await response.json();
            setSubjects(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching subjects:', error);
            setMessage('Failed to load subjects');
            setMessageType('error');
        }
    };

    const fetchLessonPlan = async (planId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL || 'http://localhost:5000'}/lesson-plans/${planId}`);
            const data = await response.json();
            
            if (data.success && data.lessonPlan) {
                const plan = data.lessonPlan;
                setFormData({
                    title: plan.title,
                    duration: plan.duration,
                    lessonDate: new Date(plan.lessonDate).toISOString().split('T')[0],
                    week: plan.week,
                    term: plan.term,
                    objectives: plan.objectives || [''],
                    introduction: plan.introduction?.description || '',
                    mainContent: plan.mainContent?.description || '',
                    keyPoints: plan.mainContent?.keyPoints || [''],
                    conclusion: plan.conclusion?.description || '',
                    assessment: {
                        type: plan.assessment?.type || 'Formative',
                        description: plan.assessment?.description || ''
                    },
                    homework: {
                        assigned: plan.homework?.assigned || false,
                        description: plan.homework?.description || ''
                    },
                    notes: plan.notes || ''
                });
                setSelectedSubjectId(plan.subject._id);
            }
        } catch (error) {
            console.error('Error fetching lesson plan:', error);
            setMessage('Failed to load lesson plan');
            setMessageType('error');
        }
    };

    const handleInputChange = (field, value, index = null) => {
        if (Array.isArray(formData[field]) && index !== null) {
            setFormData(prev => ({
                ...prev,
                [field]: prev[field].map((item, i) => i === index ? value : item)
            }));
        } else if (field.includes('.')) {
            const [section, subField] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [subField]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const addArrayItem = (field) => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], '']
        }));
    };

    const removeArrayItem = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e, status = 'Published') => {
        e.preventDefault();

        if (!currentUser || !selectedSubjectId) {
            setMessage('Please select a subject');
            setMessageType('error');
            return;
        }

        if (!formData.title.trim()) {
            setMessage('Please enter a lesson title');
            setMessageType('error');
            return;
        }

        try {
            setLoading(true);

            const submitData = {
                title: formData.title,
                subject: selectedSubjectId,
                school: currentUser._id,
                duration: formData.duration,
                lessonDate: formData.lessonDate,
                week: formData.week,
                term: formData.term,
                objectives: formData.objectives.filter(obj => obj.trim()),
                introduction: {
                    description: formData.introduction,
                    duration: Math.round(formData.duration * 0.2),
                    activities: []
                },
                mainContent: {
                    description: formData.mainContent,
                    duration: Math.round(formData.duration * 0.65),
                    keyPoints: formData.keyPoints.filter(p => p.trim()),
                    activities: [],
                    teachingMethods: ['Lecture', 'Discussion']
                },
                conclusion: {
                    description: formData.conclusion,
                    duration: Math.round(formData.duration * 0.15)
                },
                assessment: formData.assessment,
                homework: formData.homework,
                notes: formData.notes,
                status,
                createdBy: currentUser._id
            };

            const url = `${process.env.REACT_APP_BASE_URL || 'http://localhost:5000'}/lesson-plans`;
            const method = isEditing && editId ? 'PUT' : 'POST';
            const finalUrl = isEditing && editId ? `${url}/${editId}` : url;

            const response = await fetch(finalUrl, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData)
            });

            const result = await response.json();

            if (result.success) {
                setMessage(`Lesson plan ${isEditing ? 'updated' : 'created'} ${status.toLowerCase()} successfully!`);
                setMessageType('success');
                setTimeout(() => {
                    if (onSuccess) onSuccess();
                    if (onClose) onClose();
                    else window.location.href = '/Admin/lesson-plans/';
                }, 1500);
            } else {
                setMessage(result.message || `Failed to ${isEditing ? 'update' : 'create'} lesson plan`);
                setMessageType('error');
            }
        } catch (error) {
            console.error('Error submitting lesson plan:', error);
            setMessage('Network error. Please try again.');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser) {
        return (
            <div style={styles.container}>
                <div style={styles.header}>
                    <p>Please log in to create lesson plans.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.headerTitle}>{isEditing ? 'Edit' : 'Create'} Lesson Plan</h1>
            </div>

            {message && (
                <div style={{
                    ...styles.message,
                    ...(messageType === 'success' ? styles.messageSuccess : styles.messageError)
                }}>
                    {message}
                </div>
            )}

            <form onSubmit={(e) => handleSubmit(e, 'Published')} style={styles.form}>
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Basic Information</h3>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Subject *</label>
                        <select
                            value={selectedSubjectId}
                            onChange={(e) => setSelectedSubjectId(e.target.value)}
                            style={styles.select}
                            required
                        >
                            <option value="">Select a subject</option>
                            {subjects.map(subject => (
                                <option key={subject._id} value={subject._id}>
                                    {subject.subName} ({subject.subCode})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Lesson Title *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            placeholder="Enter lesson title"
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Duration (minutes) *</label>
                            <input
                                type="number"
                                value={formData.duration}
                                onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                                min="15"
                                max="300"
                                style={styles.input}
                                required
                            />
                        </div>
                        
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Lesson Date *</label>
                            <input
                                type="date"
                                value={formData.lessonDate}
                                onChange={(e) => handleInputChange('lessonDate', e.target.value)}
                                style={styles.input}
                                required
                            />
                        </div>
                    </div>

                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Term</label>
                            <select
                                value={formData.term}
                                onChange={(e) => handleInputChange('term', e.target.value)}
                                style={styles.select}
                            >
                                <option value="First Term">First Term</option>
                                <option value="Second Term">Second Term</option>
                                <option value="Third Term">Third Term</option>
                            </select>
                        </div>
                        
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Week</label>
                            <input
                                type="number"
                                value={formData.week}
                                onChange={(e) => handleInputChange('week', parseInt(e.target.value))}
                                min="1"
                                max="20"
                                style={styles.input}
                            />
                        </div>
                    </div>
                </div>

                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Learning Objectives</h3>
                    {formData.objectives.map((objective, index) => (
                        <div key={index} style={styles.arrayItem}>
                            <input
                                type="text"
                                value={objective}
                                onChange={(e) => handleInputChange('objectives', e.target.value, index)}
                                placeholder={`Objective ${index + 1}`}
                                style={styles.arrayInput}
                            />
                            {formData.objectives.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeArrayItem('objectives', index)}
                                    style={styles.removeButton}
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => addArrayItem('objectives')}
                        style={styles.addButton}
                    >
                        Add Objective
                    </button>
                </div>

                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Lesson Content</h3>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Introduction</label>
                        <textarea
                            value={formData.introduction}
                            onChange={(e) => handleInputChange('introduction', e.target.value)}
                            placeholder="How will you introduce the lesson?"
                            style={styles.textarea}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Main Content</label>
                        <textarea
                            value={formData.mainContent}
                            onChange={(e) => handleInputChange('mainContent', e.target.value)}
                            placeholder="What are the main topics you'll cover?"
                            style={styles.textarea}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Key Points</label>
                        {formData.keyPoints.map((point, index) => (
                            <div key={index} style={styles.arrayItem}>
                                <input
                                    type="text"
                                    value={point}
                                    onChange={(e) => handleInputChange('keyPoints', e.target.value, index)}
                                    placeholder={`Key point ${index + 1}`}
                                    style={styles.arrayInput}
                                />
                                {formData.keyPoints.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeArrayItem('keyPoints', index)}
                                        style={styles.removeButton}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addArrayItem('keyPoints')}
                            style={styles.addButton}
                        >
                            Add Key Point
                        </button>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Conclusion</label>
                        <textarea
                            value={formData.conclusion}
                            onChange={(e) => handleInputChange('conclusion', e.target.value)}
                            placeholder="How will you wrap up the lesson?"
                            style={styles.textarea}
                        />
                    </div>
                </div>

                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Assessment & Homework</h3>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Assessment Type</label>
                        <select
                            value={formData.assessment.type}
                            onChange={(e) => handleInputChange('assessment.type', e.target.value)}
                            style={styles.select}
                        >
                            <option value="Formative">Formative</option>
                            <option value="Summative">Summative</option>
                            <option value="Both">Both</option>
                        </select>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Assessment Description</label>
                        <textarea
                            value={formData.assessment.description}
                            onChange={(e) => handleInputChange('assessment.description', e.target.value)}
                            placeholder="How will you assess student learning?"
                            style={styles.textarea}
                        />
                    </div>

                    <div style={styles.checkboxContainer}>
                        <input
                            type="checkbox"
                            checked={formData.homework.assigned}
                            onChange={(e) => handleInputChange('homework.assigned', e.target.checked)}
                            style={styles.checkbox}
                        />
                        <label style={styles.label}>Assign Homework</label>
                    </div>

                    {formData.homework.assigned && (
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Homework Description</label>
                            <textarea
                                value={formData.homework.description}
                                onChange={(e) => handleInputChange('homework.description', e.target.value)}
                                placeholder="Describe the homework assignment"
                                style={styles.textarea}
                            />
                        </div>
                    )}
                </div>

                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Additional Notes</h3>
                    <div style={styles.formGroup}>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            placeholder="Any additional notes or reminders"
                            style={styles.textarea}
                        />
                    </div>
                </div>

                <div style={styles.actions}>
                    {onClose && (
                        <button type="button" onClick={onClose} style={styles.buttonOutline}>
                            Cancel
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={(e) => handleSubmit(e, 'Draft')}
                        style={styles.buttonSecondary}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save as Draft'}
                    </button>
                    <button type="submit" style={styles.buttonPrimary} disabled={loading}>
                        {loading ? 'Publishing...' : 'Publish Lesson Plan'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LessonPlanForm;