import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Grid,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    Chip
} from '@mui/material';
import { Save as SaveIcon, Preview as PreviewIcon, Clear as ClearIcon } from '@mui/icons-material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ExamForm = () => {
    const { id: subjectId, examId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useSelector(state => state.user);

    const isEditMode = Boolean(examId);

    // Simplified exam data - no time windows, only flexible scheduling
    const [examData, setExamData] = useState({
        title: '',
        description: '',
        timeLimit: 3600, // 60 minutes default (in seconds)
        passingMarks: 60, // percentage
        questions: []
    });

    const [subjectData, setSubjectData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
    const [aikenText, setAikenText] = useState('');
    const [parseError, setParseError] = useState('');

    const REACT_APP_BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

    useEffect(() => {
        if (subjectId) fetchSubjectDetails();
        if (isEditMode && examId) fetchExamData();
    }, [subjectId, examId, isEditMode]);

    const fetchSubjectDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${REACT_APP_BASE_URL}/Subject/${subjectId}`);
            const data = await response.json();
            
            if (data && data.subName) {
                setSubjectData(data);
            } else {
                setError('Failed to load subject details');
            }
        } catch (err) {
            console.error('Error fetching subject:', err);
            setError('Failed to load subject details');
        } finally {
            setLoading(false);
        }
    };

       const handleBack = () => {
        navigate(-1); // Go back to previous page
    };

    const fetchExamData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${REACT_APP_BASE_URL}/exams/${examId}`);
            const data = await response.json();
            
            if (data.success && data.exam) {
                const exam = data.exam;
                setExamData({
                    title: exam.title || '',
                    description: exam.description || '',
                    timeLimit: exam.timeLimit || 3600,
                    passingMarks: exam.passingMarks || 60,
                    questions: Array.isArray(exam.questions) ? exam.questions : []
                });
                
                // Convert questions back to AIKEN format for editing
                if (exam.questions && exam.questions.length > 0) {
                    const aikenFormat = convertQuestionsToAiken(exam.questions);
                    setAikenText(aikenFormat);
                }
            } else {
                setError('Failed to load exam data');
            }
        } catch (err) {
            console.error('Error fetching exam:', err);
            setError('Failed to load exam');
        } finally {
            setLoading(false);
        }
    };

    const convertQuestionsToAiken = (questions) => {
        return questions.map(q => {
            let text = `${q.question}\n`;
            q.options.forEach((option, index) => {
                text += `${String.fromCharCode(65 + index)}. ${option}\n`;
            });
            text += `ANSWER: ${q.correctAnswer}\n\n`;
            return text;
        }).join('');
    };

    const handleInputChange = (field, value) => {
        setExamData(prev => ({ ...prev, [field]: value }));
        setError(''); // Clear errors on input change
    };

    // Enhanced AIKEN Parser
    const parseAikenFormat = (text) => {
        try {
            setParseError('');
            setError('');
            
            if (!text.trim()) {
                throw new Error('Please enter questions in AIKEN format');
            }

            const lines = text.trim().split('\n').map(l => l.trim()).filter(l => l);
            const questions = [];
            let current = null;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                // Check if this is an option line (A., B., C., etc.)
                if (line.match(/^[A-E]\.\s/)) {
                    if (current) {
                        const optionText = line.substring(3).trim();
                        if (optionText) {
                            current.options.push(optionText);
                        }
                    }
                }
                // Check if this is an answer line
                else if (line.toUpperCase().startsWith('ANSWER:')) {
                    if (current) {
                        const answerPart = line.substring(7).trim().toUpperCase();
                        if (['A', 'B', 'C', 'D', 'E'].includes(answerPart)) {
                            current.correctAnswer = answerPart;
                        }
                        // Push completed question
                        if (current.question && current.options.length >= 2) {
                            questions.push({ ...current });
                        }
                        current = null;
                    }
                }
                // This should be a question line
                else {
                    // If we have a current question, save it first
                    if (current && current.question && current.options.length >= 2) {
                        questions.push({ ...current });
                    }
                    // Start new question
                    current = {
                        question: line,
                        options: [],
                        correctAnswer: 'A',
                        marks: 1,
                        explanation: '',
                        difficulty: 'Medium',
                        category: 'General'
                    };
                }
            }

            // Handle last question if exists
            if (current && current.question && current.options.length >= 2) {
                questions.push({ ...current });
            }

            if (questions.length === 0) {
                throw new Error('No valid questions found. Please check your AIKEN format.');
            }

            // Validate questions
            const validQuestions = questions.filter(q => {
                return q.question.trim() && 
                       q.options.length >= 2 && 
                       ['A', 'B', 'C', 'D', 'E'].includes(q.correctAnswer) &&
                       q.options[q.correctAnswer.charCodeAt(0) - 65]; // Ensure answer option exists
            });

            if (validQuestions.length === 0) {
                throw new Error('No valid questions with proper answers found.');
            }

            setExamData(prev => ({ 
                ...prev, 
                questions: validQuestions 
            }));
            
            setSuccess(`✅ Successfully parsed ${validQuestions.length} questions!`);
            
            if (validQuestions.length !== questions.length) {
                setParseError(`Note: ${questions.length - validQuestions.length} questions were skipped due to formatting issues.`);
            }

        } catch (err) {
            setParseError(`Parse error: ${err.message}`);
            console.error('AIKEN Parse Error:', err);
        }
    };

    const validate = () => {
        if (!examData.title.trim()) {
            return 'Exam title is required';
        }
        if (examData.questions.length === 0) {
            return 'No questions found. Please paste questions in AIKEN format and click "Parse Questions".';
        }
        if (!subjectData) {
            return 'Subject data not loaded. Please refresh the page.';
        }
        return null;
    };

    const handleSave = async () => {
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            // Calculate total marks from questions
            const totalMarks = examData.questions.reduce((sum, q) => sum + (parseInt(q.marks) || 1), 0);
            
            // Prepare payload - NO date fields, NO scheduleType
            const payload = {
                subjectId: subjectId,
                title: examData.title.trim(),
                description: examData.description?.trim() || '',
                questions: examData.questions.map(q => ({
                    question: q.question.trim(),
                    options: q.options.filter(opt => opt?.trim()).map(opt => opt.trim()),
                    correctAnswer: q.correctAnswer,
                    marks: parseInt(q.marks) || 1,
                    difficulty: q.difficulty || 'Medium',
                    category: q.category || 'General',
                    explanation: q.explanation?.trim() || ''
                })),
                timeLimit: parseInt(examData.timeLimit) || 3600,
                passingMarks: parseInt(examData.passingMarks) || 60,
                totalMarks: totalMarks,
                schoolId: subjectData.school?._id || currentUser._id,
                classId: subjectData.sclassName?._id || null,
                teacherId: currentUser._id
            };

            console.log('💾 Saving exam with payload:', {
                ...payload,
                questions: `${payload.questions.length} questions`
            });

            const url = isEditMode 
                ? `${REACT_APP_BASE_URL}/exams/${examId}` 
                : `${REACT_APP_BASE_URL}/exams/add`;
            
            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            
            if (response.ok && result.success) {
                setSuccess(isEditMode ? '✅ Exam updated successfully!' : '✅ Exam created successfully!');
                setTimeout(() => {
                    navigate(`/Admin/exams/${subjectId}`);
                }, 1500);
            } else {
                throw new Error(result.error || result.message || 'Failed to save exam');
            }

        } catch (err) {
            console.error('Save error:', err);
            setError(`Failed to save exam: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    };

    const clearAll = () => {
        setAikenText('');
        setExamData(prev => ({ ...prev, questions: [] }));
        setParseError('');
        setSuccess('');
        setError('');
    };

    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: 400 
            }}>
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Loading...
                    </Typography>
                </Box>
            </Box>
        );
    }

    return (
        
        <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
            <Box sx={{ mb: 2 }}>
                                        <Button
                                            startIcon={<ArrowBackIcon />}
                                            onClick={handleBack}
                                            variant="outlined"
                                            sx={{ mb: 2 }}
                                        >
                                            Back to Subjects
                                        </Button>
                                    </Box>
            <Typography variant="h4" gutterBottom>
                {isEditMode ? '✏️ Edit Exam' : '➕ Create New Exam'}
            </Typography>
            
            {subjectData && (
                <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.light', color: 'white', borderRadius: 2 }}>
                    <Typography variant="h6">
                        📚 Subject: {subjectData.subName}
                    </Typography>
                    {subjectData.subCode && (
                        <Typography variant="body2">
                            Code: {subjectData.subCode}
                        </Typography>
                    )}
                </Box>
            )}

            {error && (
                <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            
            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}

            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    ⚙️ Exam Settings
                </Typography>
                
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Exam Title *"
                            value={examData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            required
                            placeholder="e.g., Midterm Mathematics Exam"
                        />
                    </Grid>
                    
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Description (Optional)"
                            value={examData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Brief description of the exam content and instructions..."
                        />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Time Limit (minutes)"
                            value={Math.floor(examData.timeLimit / 60)}
                            onChange={(e) => handleInputChange('timeLimit', Math.max(1, parseInt(e.target.value) || 60) * 60)}
                            inputProps={{ min: 1, max: 300 }}
                            helperText={`Current: ${formatTime(examData.timeLimit)}`}
                        />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Passing Score (%)"
                            value={examData.passingMarks}
                            onChange={(e) => handleInputChange('passingMarks', Math.max(0, Math.min(100, parseInt(e.target.value) || 60)))}
                            inputProps={{ min: 0, max: 100 }}
                            helperText="Minimum percentage to pass"
                        />
                    </Grid>
                </Grid>
            </Paper>

            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    📝 AIKEN Format Questions
                </Typography>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>AIKEN Format Rules:</Typography>
                    <Typography variant="body2" component="div">
                        • One question per line<br/>
                        • Options: A. Option1, B. Option2, C. Option3, D. Option4<br/>
                        • Answer line: ANSWER: A (or B, C, D, E)<br/>
                        • Leave blank line between questions
                    </Typography>
                </Alert>
                
                <TextField
                    fullWidth
                    multiline
                    rows={15}
                    placeholder={`What is the capital of France?
A. London
B. Berlin
C. Paris
D. Madrid
ANSWER: C

What is 2 + 2?
A. 3
B. 4
C. 5
D. 6
ANSWER: B`}
                    value={aikenText}
                    onChange={(e) => setAikenText(e.target.value)}
                    sx={{ 
                        fontFamily: 'monospace', 
                        fontSize: '14px',
                        mb: 2,
                        '& .MuiInputBase-root': {
                            backgroundColor: 'grey.50'
                        }
                    }}
                />
                
                {parseError && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        {parseError}
                    </Alert>
                )}
                
                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                    <Button
                        variant="contained"
                        onClick={() => parseAikenFormat(aikenText)}
                        disabled={!aikenText.trim()}
                        sx={{ minWidth: 150 }}
                    >
                        📥 Parse Questions
                    </Button>
                    
                    <Button
                        variant="outlined"
                        startIcon={<ClearIcon />}
                        onClick={clearAll}
                        disabled={!aikenText.trim() && examData.questions.length === 0}
                    >
                        Clear All
                    </Button>
                </Box>

                {examData.questions.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                        <Chip 
                            label={`✅ ${examData.questions.length} questions parsed successfully`}
                            color="success"
                            variant="outlined"
                            sx={{ mb: 2 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                            Total Marks: {examData.questions.reduce((sum, q) => sum + (parseInt(q.marks) || 1), 0)}
                        </Typography>
                    </Box>
                )}
            </Paper>

            <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                justifyContent: 'flex-end',
                flexWrap: 'wrap',
                mt: 3
            }}>
                <Button
                    variant="outlined"
                    onClick={() => navigate(`/Admin/exams/${subjectId}`)}
                    disabled={saving}
                >
                    Cancel
                </Button>
                
                {examData.questions.length > 0 && (
                    <Button
                        variant="outlined"
                        startIcon={<PreviewIcon />}
                        onClick={() => setPreviewDialogOpen(true)}
                        disabled={saving}
                    >
                        Preview Questions
                    </Button>
                )}
                
                <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    onClick={handleSave}
                    disabled={saving || examData.questions.length === 0}
                    size="large"
                >
                    {saving ? 'Saving...' : (isEditMode ? 'Update Exam' : 'Create Exam')}
                </Button>
            </Box>

            {/* Preview Dialog */}
            <Dialog 
                open={previewDialogOpen} 
                onClose={() => setPreviewDialogOpen(false)} 
                maxWidth="md" 
                fullWidth
                PaperProps={{ sx: { maxHeight: '80vh' } }}
            >
                <DialogTitle>
                    📋 Exam Preview: {examData.title}
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                            ⏱️ Duration: {formatTime(examData.timeLimit)} • 
                            📊 {examData.questions.length} questions • 
                            🎯 Passing: {examData.passingMarks}% • 
                            📝 Total Marks: {examData.questions.reduce((sum, q) => sum + (parseInt(q.marks) || 1), 0)}
                        </Typography>
                        {examData.description && (
                            <Typography sx={{ mt: 1 }}>
                                {examData.description}
                            </Typography>
                        )}
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    {examData.questions.map((question, index) => (
                        <Box key={index} sx={{ mb: 4 }}>
                            <Typography variant="h6" gutterBottom>
                                Question {index + 1}. {question.question}
                            </Typography>
                            <Box sx={{ pl: 2 }}>
                                {question.options.map((option, optionIndex) => {
                                    const optionLetter = String.fromCharCode(65 + optionIndex);
                                    const isCorrect = question.correctAnswer === optionLetter;
                                    return (
                                        <Typography
                                            key={optionIndex}
                                            component="div"
                                            sx={{
                                                py: 0.5,
                                                fontWeight: isCorrect ? 'bold' : 'normal',
                                                color: isCorrect ? 'success.main' : 'inherit',
                                                backgroundColor: isCorrect ? 'success.light' : 'transparent',
                                                px: isCorrect ? 1 : 0,
                                                borderRadius: isCorrect ? 1 : 0,
                                                display: 'inline-block',
                                                minWidth: '100%'
                                            }}
                                        >
                                            {optionLetter}. {option}
                                            {isCorrect && ' ✓'}
                                        </Typography>
                                    );
                                })}
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                                Marks: {question.marks || 1} | Answer: {question.correctAnswer}
                            </Typography>
                        </Box>
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPreviewDialogOpen(false)} variant="outlined">
                        Close Preview
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ExamForm;