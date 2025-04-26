import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AvailableVendors.css';

function HallVendors() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetch(`/available-vendors/${eventId}/hall`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setVendors(data.vendors);
                } else {
                    setError(data.message || "Error fetching vendors");
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Fetch error:", err);
                setError("Error loading vendors");
                setLoading(false);
            });
    }, [eventId]);

    const handleBooking = async (vendorId) => {
        try {
            const response = await axios.post('/book-hall-vendor', {
                eventId,
                hallVendorId: vendorId,
            });

            if (response.data.success) {
                setSuccessMsg("Vendor booked successfully!");
                setTimeout(() => {
                    navigate(`/event-details/${eventId}/vendors`);
                }, 1000);
            } else {
                setError(response.data.message || "Failed to book vendor");
            }
        } catch (err) {
            console.error("Booking error:", err);
            setError(err.response?.data?.message || "Server error");
        }
    };

    if (loading) return <p>Loading vendors...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="available-vendors">
            <h2>Available Hall Vendors</h2>
            {successMsg && <p className="success">{successMsg}</p>}
            {vendors.length === 0 ? (
                <p>No vendors available for this event.</p>
            ) : (
                <ul className="vendor-list">
                    {vendors.map((vendor) => (
                        <li key={vendor.Vendor_ID} className="vendor-card">
                            <h3>{vendor.Vendor_Name}</h3>
                            <p><strong>Location:</strong> {vendor.Location}</p>
                            <p><strong>Contact:</strong> {vendor.Contact_No}</p>
                            <p><strong>Cost:</strong> Rs. {vendor.Cost}</p>
                            <p><strong>Capacity:</strong> {vendor.Capacity}</p>
                            <p><strong>Rating:</strong> {vendor.Rating || "N/A"}/5</p>
                            <button onClick={() => handleBooking(vendor.Vendor_ID)}>
                                Book This Vendor
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default HallVendors;
