import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AvailableVendors.css'; // reuse your CSS

function ManagerCateringVendors() {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [showAddForm, setShowAddForm] = useState(false);
    const [form, setForm] = useState({
        name: '',
        contact_no: '',
        city: '',
        email: '',
        instagram: '',
        cost: '',
        rating: ''
    });

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            const response = await axios.get('/available-catering-vendors'); // Make this API (GET all)
            if (response.data.success) {
                setVendors(response.data.vendors);
            } else {
                setError('Failed to fetch vendors');
            }
        } catch (err) {
            console.error(err);
            setError('Server error');
        }
        setLoading(false);
    };

    const handleDelete = async (vendorId) => {
        if (!window.confirm('Are you sure you want to delete this vendor?')) return;
        try {
            await axios.delete(`/delete-catering-vendor/${vendorId}`);
            setSuccessMsg('Vendor deleted successfully');
            fetchVendors();
        } catch (err) {
            console.error(err);
            setError('Failed to delete vendor');
        }
    };

    const handleUpdate = (vendorId) => {
        // You can create a separate update page if needed
        // For now, just alert vendorId
        alert(`Update Vendor ID: ${vendorId}`);
    };

    const handleAddVendor = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/add-catering-vendor', form);
            setSuccessMsg('Vendor added successfully!');
            setForm({
                name: '',
                contact_no: '',
                city: '',
                email: '',
                instagram: '',
                cost: '',
                rating: ''
            });
            setShowAddForm(false);
            fetchVendors();
        } catch (err) {
            console.error(err);
            setError('Failed to add vendor');
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    if (loading) return <p>Loading vendors...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="available-vendors">
            <h2>Catering Vendors Management</h2>

            {successMsg && <p className="success">{successMsg}</p>}

            <button onClick={() => setShowAddForm(!showAddForm)} style={{ marginBottom: '20px' }}>
                {showAddForm ? 'Cancel' : 'Add New Vendor'}
            </button>

            {showAddForm && (
                <form onSubmit={handleAddVendor} className="vendor-form">
                    <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
                    <input name="contact_no" placeholder="Contact No" value={form.contact_no} onChange={handleChange} required />
                    <input name="city" placeholder="City" value={form.city} onChange={handleChange} required />
                    <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
                    <input name="instagram" placeholder="Instagram" value={form.instagram} onChange={handleChange} />
                    <input name="cost" type="number" placeholder="Cost" value={form.cost} onChange={handleChange} required />
                    <input name="rating" type="number" placeholder="Rating" value={form.rating} onChange={handleChange} />
                    <button type="submit">Add Vendor</button>
                </form>
            )}

            {vendors.length === 0 ? (
                <p>No vendors available.</p>
            ) : (
                <ul className="vendor-list">
                    {vendors.map((vendor) => (
                        <li key={vendor.Vendor_ID} className="vendor-card">
                            <h3>{vendor.Name}</h3>
                            <p><strong>City:</strong> {vendor.City}</p>
                            <p><strong>Contact:</strong> {vendor.Contact_No}</p>
                            <p><strong>Email:</strong> {vendor.Email}</p>
                            <p><strong>Instagram:</strong> {vendor.Instagram}</p>
                            <p><strong>Cost:</strong> Rs. {vendor.Cost}</p>
                            <p><strong>Rating:</strong> {vendor.Rating || "N/A"}/5</p>

                            <button onClick={() => handleUpdate(vendor.Vendor_ID)}>Update</button>
                            <button onClick={() => handleDelete(vendor.Vendor_ID)} style={{ backgroundColor: 'red', marginLeft: '10px' }}>
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ManagerCateringVendors;
