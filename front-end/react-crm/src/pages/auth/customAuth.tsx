import React, { useState } from 'react';
import { Grid, Typography, Stack, TextField, Button } from '@mui/material';
import { fetchData } from '../../components/FetchData';
import { LoginUrl } from '../../services/ApiUrls';
import { useNavigate } from 'react-router-dom';

const CustomAuth: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const res = await fetchData(
                LoginUrl,
                'POST',
                JSON.stringify({ email, password }),
                { 'Content-Type': 'application/json' }
            );

            console.log('Login Response:', res); // Log for debugging

            if (res.access) {
                localStorage.setItem('Token', `Bearer ${res.access}`);
                navigate('/app');
            } else {
                console.error('Login failed:', res);
                alert('Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An unexpected error occurred during login. Please try again later.');
        }
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
            }}
            style={{ width: '100%' }}
        >
            <Grid container item sx={{ mt: 4, width: '100%' }} direction="column" alignItems="center">
                <Typography variant="body2" sx={{ mb: 1 }}>
                    You can login with your email and password.
                </Typography>
                <Stack spacing={2} sx={{ width: '100%' }}>
                    <TextField
                        label="Email"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        fullWidth
                        sx={{ mt: 2, backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#0f569c' }}}
                    >
                        Login
                    </Button>
                </Stack>
            </Grid>
        </form>
    );
};

export default CustomAuth;
