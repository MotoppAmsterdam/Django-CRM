import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CircularProgress, Typography, Box } from '@mui/material';
import { SERVER, VerifyEmailUrl } from '../../services/ApiUrls';

export default function EmailVerification() {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const hasRun = useRef(false);  // Ref to track if the effect has already run

    useEffect(() => {
        if (hasRun.current) return;  // Skip effect if it's already run
        const verifyEmail = async () => {
            const searchParams = new URLSearchParams(location.search);
            const token = searchParams.get('token');

            if (!token) {
                setError('Activation key is missing.');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${SERVER}${VerifyEmailUrl}/${token}/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (response.ok) {
                    // Store tokens and navigate to the app
                    localStorage.setItem('Token', `Bearer ${data.access_token}`);
                    localStorage.setItem('RefreshToken', data.refresh_token);
                    setSuccessMessage('Email verified successfully. Redirecting to the app...');
                    setTimeout(() => navigate('/app'), 2000);
                } else {
                    // Handle verification error
                    setError(data.detail || 'Verification failed. Please try again.');
                }
            } catch (error) {
                setError('An error occurred. Please check your internet connection and try again.');
            } finally {
                setLoading(false);
            }
        };

        verifyEmail();
        hasRun.current = true;  // Mark effect as run
    }, [location.search, navigate]);

    return (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
            {loading && <CircularProgress />}
            {error && <Typography color="error">{error}</Typography>}
            {successMessage && <Typography color="primary">{successMessage}</Typography>}
        </Box>
    );
}
