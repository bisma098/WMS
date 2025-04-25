import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Vendors.css'; // Style this however you like

function Vendors() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [vendors, setVendors] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch(`/event-vendors/${eventId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setVendors(data.vendors);
                } else {
                    setError(data.message || "Error loading vendors");
                }
                setLoading(false);
            })
            .catch(err => {
                setError("Something went wrong");
                setLoading(false);
            });
    }, [eventId]);

    const renderVendor = (category, vendor) => {
        if (!vendor) {
            return (
                <div className="vendor-card empty">
                    <h3>{category}</h3>
                    <p>No vendor booked for this category.</p>
                    <button onClick={() => navigate(`/event-details/${eventId}/vendors/book/${category.toLowerCase()}`)}>
                        Book Vendor
                    </button>
                </div>
            );
        }

        return (
            <div className="vendor-card booked">
                <h3>{category}</h3>
                <p><strong>Name:</strong> {vendor.Name}</p>
                {vendor.Location && <p><strong>Location:</strong> {vendor.Location}</p>}
                {vendor.Contact_No && <p><strong>Contact:</strong> {vendor.Contact_No}</p>}
                {vendor.Email && <p><strong>Email:</strong> {vendor.Email}</p>}
                {vendor.Instagram && <p><strong>Instagram:</strong> @{vendor.Instagram}</p>}
                {vendor.Capacity && <p><strong>Capacity:</strong> {vendor.Capacity}</p>}
                <p><strong>Cost:</strong> Rs. {vendor.Cost}</p>
                <p><strong>Rating:</strong> {vendor.Rating || "N/A"}/5</p>
            </div>
        );
    };

    if (loading) return <p>Loading vendors...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="vendors-page">
            <h2>Your Event Vendors</h2>
            <div className="vendors-grid">
                {renderVendor('Catering', vendors.catering)}
                {renderVendor('Decor', vendors.decor)}
                {renderVendor('Photography', vendors.photography)}
                {renderVendor('Hall', vendors.hall)}
                {renderVendor('DJ', vendors.dj)}
            </div>
        </div>
    );
}

export default Vendors;
