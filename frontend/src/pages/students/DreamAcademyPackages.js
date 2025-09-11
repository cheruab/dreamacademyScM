import React from 'react';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaymentIcon from '@mui/icons-material/Payment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

const DreamAcademyPackages = () => {
    const packages = [
        {
            id: 'basic',
            name: 'Basic Package',
            price: '1,500 ETB',
            color: '#1976d2',
            features: [
                'Home tutoring for enrolled subjects',
                'Free comprehensive English course',
                'Online interactive exams',
                'Past years exam papers from top schools',
                '24/7 student support'
            ]
        },
        {
            id: 'premium',
            name: 'Premium Package',
            price: '2,000 ETB',
            color: '#9c27b0',
            features: [
                'All Basic Package benefits',
                'Direct school progress monitoring',
                'Parent-teacher coordination visits',
                'Personalized study plans',
                'Priority academic counseling',
                'Monthly progress reports'
            ]
        }
    ];

    const bankAccounts = [
        {
            name: 'Commercial Bank of Ethiopia',
            accountName: 'Dream Academy',
            accountNumber: '1000123456789',
            swiftCode: 'CBETBIRR'
        },
        {
            name: 'Awash International Bank',
            accountName: 'Dream Academy',
            accountNumber: '01234567890123',
            swiftCode: 'AWINBIRR'
        },
        {
            name: 'Dashen Bank',
            accountName: 'Dream Academy',
            accountNumber: '0987654321098',
            swiftCode: 'DASHBIRR'
        }
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography 
                    variant="h2" 
                    sx={{ 
                        fontWeight: 700,
                        background: 'linear-gradient(45deg, #1976d2, #9c27b0)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                        mb: 2,
                        fontSize: { xs: '2rem', md: '2.5rem' }
                    }}
                >
                    Dream Academy Packages
                </Typography>
            </Box>

            {/* Payment Information */}
            <Paper 
                elevation={3}
                sx={{ 
                    p: 3,
                    mb: 4,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: 2
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PaymentIcon sx={{ mr: 1, fontSize: 30 }} />
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        Payment Information
                    </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                    Use this information to pay your monthly subscription and continue you Child's Learning journey with Dream Academy.
                </Typography>
            </Paper>

                        {/* Bank Information */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'center' }}>
                    <AccountBalanceIcon sx={{ mr: 1, fontSize: 30, color: '#1976d2' }} />
                    <Typography 
                        variant="h5" 
                        sx={{ 
                            color: '#1976d2',
                            fontWeight: 600,
                            textAlign: 'center'
                        }}
                    >
                        Bank Account Details
                    </Typography>
                </Box>
                
                <Grid container spacing={2}>
                    {bankAccounts.map((bank, index) => (
                        <Grid item xs={12} md={4} key={index}>
                            <Paper 
                                elevation={1}
                                sx={{ 
                                    p: 2,
                                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                                    borderLeft: `4px solid #1976d2`,
                                    borderRadius: 1
                                }}
                            >
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        color: '#1976d2',
                                        fontWeight: 700,
                                        mb: 1
                                    }}
                                >
                                    {bank.name}
                                </Typography>
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        color: '#64114fff',
                                        fontWeight: 900,
                                        lineHeight: 1.6
                                    }}
                                >
                                    <strong>Account Name:</strong> {bank.accountName}<br/>
                                    <strong>Account Number:</strong> {bank.accountNumber}<br/>
                                    
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Paper>

            {/* Packages Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {packages.map((pkg, index) => (
                    <Grid item xs={12} md={6} key={pkg.id}>
                        <Card 
                            sx={{
                                height: '100%',
                                borderTop: `4px solid ${pkg.color}`,
                                transition: 'all 0.3s ease',
                                transform: pkg.id === 'premium' ? 'scale(1.02)' : 'scale(1)',
                                '&:hover': {
                                    transform: pkg.id === 'premium' ? 'translateY(-8px) scale(1.02)' : 'translateY(-8px)',
                                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
                                }
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                {/* Package Header */}
                                <Box sx={{ textAlign: 'center', mb: 3 }}>
                                    <Typography 
                                        variant="h4" 
                                        sx={{ 
                                            fontWeight: 700,
                                            color: pkg.color,
                                            mb: 1
                                        }}
                                    >
                                        {pkg.name}
                                    </Typography>
                                    <Typography 
                                        variant="h3" 
                                        sx={{ 
                                            fontWeight: 800,
                                            color: pkg.color,
                                            mb: 0.5
                                        }}
                                    >
                                        {pkg.price}
                                    </Typography>
                                    <Typography 
                                        variant="body1" 
                                        sx={{ 
                                            color: '#666',
                                            fontWeight: 500
                                        }}
                                    >
                                        per month
                                    </Typography>
                                </Box>

                                {/* Features List */}
                                <List sx={{ py: 0 }}>
                                    {pkg.features.map((feature, idx) => (
                                        <ListItem key={idx} sx={{ px: 0, py: 1 }}>
                                            <ListItemIcon sx={{ minWidth: 35 }}>
                                                <CheckCircleIcon 
                                                    sx={{ 
                                                        color: pkg.color,
                                                        fontSize: 20
                                                    }} 
                                                />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary={feature}
                                                primaryTypographyProps={{
                                                    sx: { 
                                                        fontSize: '1rem',
                                                        fontWeight: 500,
                                                        color: '#4a5568'
                                                    }
                                                }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>


        </Container>
    );
};

export default DreamAcademyPackages;