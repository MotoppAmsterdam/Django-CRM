import React, { useState, useEffect, useRef } from 'react';
import { SetPasswordUrl, SERVER, ValidateTokenUrl } from '../../services/ApiUrls';
import imgLogo from '../../assets/images/auth/img_logo.png'
import { useNavigate, useLocation } from 'react-router-dom'; // Import useNavigate

const SetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [strength, setStrength] = useState('');
    const [feedback, setFeedback] = useState('');
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false); // Modal visibility state
    const [isTokenValid, setIsTokenValid] = useState<null | boolean>(null); // Explicitly define type
    const navigate = useNavigate(); // Initialize navigate
    const hasRun = useRef(false);  // Ref to track if the effect has already run
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const activation_key = queryParams.get('token');

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
            setFeedback('Use uppercase letters, numbers, and symbols for a stronger password.');
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
            const response = await fetch(`${SERVER}${SetPasswordUrl}/${activation_key}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });
            if (response.ok) {
                setShowModal(true); // Show success modal
            } else {
                setError('Failed to set password. Try again.');
            }
        } catch (error) {
            setError('An error occurred.');
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setTimeout(() => navigate('/')); // Redirect to login 
    };

    // Validate token on component mount
    useEffect(() => {
        if (hasRun.current) return;  // Skip effect if it's already run
        const validateToken = async () => {
            try {
                const response = await fetch(`${SERVER}${ValidateTokenUrl}/${activation_key}/`);
                const data = await response.json();
                if (response.ok && !data.error) {
                    setIsTokenValid(true);
                } else {
                    setIsTokenValid(false);
                    setError(data.message || 'Invalid or expired token.');
                }
            } catch (error) {
                setIsTokenValid(false);
                setError('An error occurred while validating the token.');
            }
        };

        validateToken();
        hasRun.current = true;  // Mark effect as run
    }, [activation_key]);

    // Render logic
    if (isTokenValid === null) {
        return <p>Loading...</p>; // Show a loading state while token validation is in progress
    }

    if (isTokenValid === false) {
        return (
            <div className="error-container">
                <h2>Error</h2>
                <p>{error}</p>
                <button onClick={() => navigate('/')}>Back to Login</button>
            </div>
        );
    }

    return (
        <div className="set-password-container">
            <div className="imgLogo">
                <img src={imgLogo} alt='register_logo' className='register-logo' />
                <h2>Create a password</h2>
            </div>


            <form onSubmit={handleSubmit}>
                <input
                    className="passfield"
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="New password"
                    required
                />
                <p>{feedback}</p>

                <input
                    className="passfield"
                    type="password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    placeholder="Confirm new password"
                    required
                />

                {error && <p className="error">{error}</p>}

                <div>
                    <ul>
                        <li>At least 8 characters</li>
                        <li>No more than 128 characters</li>
                        <li>At least one uppercase and one lowercase letter</li>
                        <li>Latin or Cyrillic letters only</li>
                        <li>At least one numeral</li>
                        <li>No spaces</li>
                        <li>Valid characters: ~ ! ? @ # $ % ^ & * _ - + ( ) [ ] { }  &lt; </li>
                    </ul>
                </div>
                <button type="submit">Subbmit</button>
            </form>
            <p>Password Strength: <strong>{strength}</strong></p>
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Thank you!</h2>
                        <p>Your password is saved, now you can login to your account!</p>
                        <button onClick={closeModal}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SetPassword;