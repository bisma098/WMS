import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Reusing same CSS

function ManagerSignup() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [secretCode, setSecretCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await axios.post('/manager-signup', {
                username,
                password,
                secretCode
            });

            if (response.data.success) {
                setSuccess('Manager registered successfully! You can now log in.');
                setTimeout(() => {
                    navigate('/manager-login');
                }, 2000); // Redirect after short delay
            } else {
                setError(response.data.message || 'Signup failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error connecting to server');
        }
    };

    return (
        <div className="login-container">
            <div className="login-left">
                <div className="login-box">
                    <h1 className="logo">WedSync</h1>
                    <h2 className="signin-title">Manager Sign Up</h2>
                    {error && <p className="error-message">{error}</p>}
                    {success && <p className="success-message">{success}</p>}
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />

                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <label htmlFor="secretCode">Secret Code</label>
                        <input
                            type="text"
                            id="secretCode"
                            value={secretCode}
                            onChange={(e) => setSecretCode(e.target.value)}
                            required
                        />

                        <button type="submit">Sign Up</button>

                        <p className="signup-link">
                            Already have an account? <a href="/manager-login">Login as Manager</a>
                        </p>
                    </form>
                </div>
            </div>

            <div className="login-right"></div>
        </div>
    );
}

export default ManagerSignup;
