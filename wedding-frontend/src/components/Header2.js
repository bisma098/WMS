import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header2.css';

function Header2() {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const base = `/weddings`;

    return (
        <div className="header2-container">
            <div
                className={`header2-link ${location.pathname === base ? 'active' : ''}`}
                onClick={() => navigate(base)}
            >
                Weddings
            </div>

            <div
                className={`header2-link ${isActive('/tasks') ? 'active' : ''}`}
                onClick={() => navigate('/tasks')}
            >
                Tasks
            </div>
            <div
                className={`header2-link ${isActive('/payments') ? 'active' : ''}`}
                onClick={() => navigate('/payments')}
            >
                Payments
            </div>
        </div>
    );
}

export default Header2;
