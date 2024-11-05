import React, { useState } from 'react';
import { SetPasswordUrl, SERVER } from '../../services/ApiUrls';

const SetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [strength, setStrength] = useState('');
    const [feedback, setFeedback] = useState('');
    const [error, setError] = useState('');

    // Function to validate password strength
    const validatePasswordStrength = (password: string) => {
        if (password.length < 8) {
            setStrength('Weak');
            setFeedback('Password must be at least 8 characters.');
        } else if (/[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password) && /[\W_]/.test(password)) {
            setStrength('Strong');
            setFeedback('Strong password.');
        } else {
            setStrength('Moderate');
            setFeedback('Consider adding uppercase letters, numbers, and symbols for a stronger password.');
        }
    };
    
    // Update parameter types for event handlers
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPass = e.target.value;
        setPassword(newPass);
        validatePasswordStrength(newPass);
    };
    
    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords don't match.");
            return;
        }
          
        try {
            const response = await fetch(`${SERVER}/${SetPasswordUrl}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            if (response.ok) {
                alert('Password set successfully!');
            } else {
                setError('Failed to set password. Try again.');
            }
        } catch (error) {
            setError('An error occurred.');
        }
    };

    return (
        <div className="set-password-container">
            <h2>Set Your Password</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    New Password
                    <input
                        type="password"
                        value={password}
                        onChange={handlePasswordChange}
                        required
                    />
                </label>
                <p>{feedback}</p>
                <label>
                    Confirm Password
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        required
                    />
                </label>
                {error && <p className="error">{error}</p>}
                <button type="submit">Save Password</button>
            </form>
            <p>Password Strength: <strong>{strength}</strong></p>
        </div>
    );
};

export default SetPassword;