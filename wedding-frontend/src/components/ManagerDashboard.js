import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Vendors.css'; // using your same CSS

function ManagerVendors() {
    const navigate = useNavigate();

    const vendorCategories = [
        { name: 'Catering Vendors', path: 'catering' },
        { name: 'Decor Vendors', path: 'decor' },
        { name: 'Hall Vendors', path: 'hall' },
        { name: 'DJ Vendors', path: 'dj' },
        { name: 'Photography Vendors', path: 'photography' }
    ];

    const handleCardClick = (path) => {
        navigate(`/manager-dashboard/${path}`);
    };

    return (
        <div className="vendors-page">
            <h2>Vendors</h2>
            <div className="vendors-grid">
                {vendorCategories.map((vendor, index) => (
                    <div key={index} className="vendor-card empty" onClick={() => handleCardClick(vendor.path)} style={{ cursor: 'pointer' }}>
                        <h3>{vendor.name}</h3>
                        <button>View {vendor.name}</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ManagerVendors;
