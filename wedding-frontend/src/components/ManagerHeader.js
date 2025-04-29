import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import { FaUserCircle } from 'react-icons/fa';

function ManagerHeader() {
    const navigate = useNavigate();
    const manager = JSON.parse(localStorage.getItem('manager'));
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => setDropdownOpen(prev => !prev);

    const goToProfile = () => {
        navigate(`/manager-profile/${manager?.UserName}`);
        setDropdownOpen(false);
    };

    const logout = () => {
        localStorage.removeItem("manager");
        navigate("/");
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="header-container">
            <div className="header-left" onClick={() => navigate('/manager-dashboard')} style={{ cursor: 'pointer' }}>
                <img src="/assets/logo.png" alt="WedSync Logo" className="header-logo" />
                <h1 className="brand-name">WedSync</h1>
            </div>

            <div className="header-right" ref={dropdownRef}>
                <div onClick={toggleDropdown} className="user-toggle">
                    <FaUserCircle className="account-icon" />
                    <span className="username">{manager?.UserName || 'Manager'}</span>
                </div>

                {dropdownOpen && (
                    <div className="dropdown-menu">
                        <div className="dropdown-item" onClick={goToProfile}>My Profile</div>
                        <div className="dropdown-item" onClick={logout}>Logout</div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ManagerHeader;
