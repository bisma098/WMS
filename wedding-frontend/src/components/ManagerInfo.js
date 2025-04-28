import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UserInfo.css'; // same CSS 

function ManagerInfo() {
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        phoneNo: '',
        alternatePhone: '',
        email: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const [username, setUsername] = useState('');

    useEffect(() => {
        const storedUsername = localStorage.getItem('tempManagerUsername');
        if (storedUsername) {
            setUsername(storedUsername);
        } else {
            navigate('/manager-signup');
        }
    }, [navigate]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await axios.post('/manager-info', {
                username,
                ...form
            });

            console.log("Manager response:", response.data);

            if (response.data.success && response.data.manager) {
                localStorage.setItem('manager', JSON.stringify(response.data.manager));
                localStorage.removeItem('tempManagerUsername');
                navigate('/manager-dashboard');
            } else {
                setError(response.data.message || "Something went wrong");
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        }
    };

    return (
        <div className="userinfo-container">
            <div className="userinfo-box">
                <h2>Complete Manager Profile</h2>
                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}
                <form onSubmit={handleSubmit}>
                    <input
                        name="firstName"
                        placeholder="First Name"
                        value={form.firstName}
                        onChange={handleChange}
                        required
                    />
                    <input
                        name="lastName"
                        placeholder="Last Name"
                        value={form.lastName}
                        onChange={handleChange}
                        required
                    />
                    <input
                        name="phoneNo"
                        placeholder="Phone Number"
                        value={form.phoneNo}
                        onChange={handleChange}
                        required
                    />
                    <input
                        name="alternatePhone"
                        placeholder="Alternate Phone (optional)"
                        value={form.alternatePhone}
                        onChange={handleChange}
                    />
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />

                    <button type="submit">Submit</button>
                </form>
            </div>
        </div>
    );
}

export default ManagerInfo;