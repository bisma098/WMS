import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post('/login', {
                username,
                password
            });

            if (response.data.success) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                navigate('/weddings');
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
                    <h2 className="signin-title">Login</h2>
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
                            Don’t have an account? <a href="/signup">Sign up</a>
                        </p>

                    </form>
                </div>
            </div>

            <div className="login-right">
                {/* Background image will appear here via CSS */}
            </div>
        </div>
    );
}

export default Login;
