import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Reusing same CSS

function ManagerLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post('/manager-login', {
                username,
                password
            });

            if (response.data.success) {
                localStorage.setItem('manager', JSON.stringify(response.data.user));
                navigate('/manager-dashboard'); // Redirect to manager dashboard or wherever you want
            } else {
                setError(response.data.message || 'Login failed');
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
                    <h2 className="signin-title">Manager Login</h2>
                    {error && <p className="error-message">{error}</p>}
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

                        <button type="submit">Sign In</button>

                        <p className="signup-link">
                            Need an account? <a href="/manager-signup">Sign up as Manager</a>
                        </p>
                    </form>
                </div>
            </div>

            <div className="login-right"></div>
        </div>
    );
}

export default ManagerLogin;
