import React from 'react';
import { Grid, Typography, Stack, TextField, Button } from '@mui/material';

interface CustomAuthProps {
    email: string;
    setEmail: (value: string) => void;
    password: string;
    setPassword: (value: string) => void;
    handleLogin: () => void;
}

const CustomAuth: React.FC<CustomAuthProps> = ({ email, setEmail, password, setPassword, handleLogin }) => {
    return (
        <Grid container item sx={{ mt: 4, width: '100%' }} direction="column" alignItems="center">
            <Typography variant="body2" sx={{ mb: 1 }}>
                Or you can login with your email and password.
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
                    fullWidth
                    onClick={handleLogin}
                    sx={{ mt: 2, backgroundColor: '#3e4b68', '&:hover': { backgroundColor: '#2d3748' }}}
                >
                    Login
                </Button>
            </Stack>
        </Grid>
    );
};

export default CustomAuth;