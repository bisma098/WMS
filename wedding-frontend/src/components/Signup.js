import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Reusing the same CSS as login

function Signup() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await axios.post('/signup', {
                username,
                password
            });

            if (response.data.success) {
                localStorage.setItem('tempUsername', username); // Save the username
                navigate('/user-info'); // Redirect to User Info page
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
                    <h2 className="signin-title">Sign Up</h2>
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

                        <button type="submit">Sign Up</button>

                        <p className="signup-link">
                            Already have an account? <a href="/login">Login</a>
                        </p>
                    </form>
                </div>
            </div>

            <div className="login-right">
                {/* Background image handled via CSS */}
            </div>
        </div>
    );
}

export default Signup;
