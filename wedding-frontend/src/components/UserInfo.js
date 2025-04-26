import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UserInfo.css';

function UserInfo() {
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        phoneNo: '',
        alternatePhone: '',
        email: '',
        address: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const [username, setUsername] = useState('');


    useEffect(() => {
        const storedUsername = localStorage.getItem('tempUsername');
        if (storedUsername) {
            setUsername(storedUsername);
        } else {
            navigate('/signup');
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
            const response = await axios.post('/user-details', {
                username,
                ...form
            });

            console.log("User response:", response.data);

            if (response.data.success && response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                localStorage.removeItem('tempUsername');
                navigate('/weddings');
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
                <h2>Complete Your Profile</h2>
                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}
                <form onSubmit={handleSubmit}>
                    <input name="firstName" placeholder="First Name" onChange={handleChange} required />
                    <input name="lastName" placeholder="Last Name" onChange={handleChange} required />
                    <input name="phoneNo" placeholder="Phone Number" onChange={handleChange} required />
                    <input name="alternatePhone" placeholder="Alternate Phone(optional)" onChange={handleChange} />
                    <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
                    <textarea name="address" placeholder="Address" onChange={handleChange} rows={3} required />
                    <button type="submit">Submit</button>
                </form>
            </div>
        </div>
    );
}

export default UserInfo;
