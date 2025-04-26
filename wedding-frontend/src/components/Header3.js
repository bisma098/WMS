import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import './Header2.css';

function Header3() {
    const navigate = useNavigate();
    const location = useLocation();
    const { eventId } = useParams();

    const base = `/event-details/${eventId}`;

    return (
        <div className="header2-container">
            <div
                className={`header2-link ${location.pathname === base ? 'active' : ''}`}
                onClick={() => navigate(base)}
            >
                Event-Details
            </div>
            <div
                className={`header2-link ${location.pathname === `${base}/guests` ? 'active' : ''}`}
                onClick={() => navigate(`${base}/guests`)}
            >
                Guests
            </div>
            <div
                className={`header2-link ${location.pathname === `${base}/vendors` ? 'active' : ''}`}
                onClick={() => navigate(`${base}/vendors`)}
            >
                Vendors
            </div>
        </div>
    );
}

export default Header3;
