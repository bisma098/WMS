import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ManagerVendorsTable.css';

function DJVendorsManager() {
    const [vendors, setVendors] = useState([]);
    const [newVendor, setNewVendor] = useState({
        name: '',
        contact_no: '',
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
            const res = await axios.get('/dj-vendors');
            setVendors(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (vendorId) => {
        if (!window.confirm('Are you sure you want to delete this vendor?')) return;
        try {
            await axios.delete(`/delete-dj-vendor/${vendorId}`);
            fetchVendors();
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddVendor = async () => {
        try {
            await axios.post('/add-dj-vendor', newVendor);
            setNewVendor({
                name: '',
                contact_no: '',
                email: '',
                instagram: '',
                cost: '',
                rating: ''
            });
            fetchVendors();
        } catch (err) {
            console.error(err);
        }
    };

    const handleInputChange = (e) => {
        setNewVendor({ ...newVendor, [e.target.name]: e.target.value });
    };

    return (
        <div className="vendors-table-page">
            <h2>DJ Vendors</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Contact No</th>
                        <th>Email</th>
                        <th>Instagram</th>
                        <th>Cost</th>
                        <th>Rating</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {vendors.map((vendor) => (
                        <tr key={vendor.Vendor_ID}>
                            <td>{vendor.Name}</td>
                            <td>{vendor.Contact_No}</td>
                            <td>{vendor.Email}</td>
                            <td>{vendor.Instagram}</td>
                            <td>{vendor.Cost}</td>
                            <td>{vendor.Rating}</td>
                            <td>
                                <button onClick={() => handleDelete(vendor.Vendor_ID)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h3>Add New DJ Vendor</h3>
            <div className="add-vendor-form">
                <input name="name" placeholder="Name" value={newVendor.name} onChange={handleInputChange} />
                <input name="contact_no" placeholder="Contact No" value={newVendor.contact_no} onChange={handleInputChange} />
                <input name="email" placeholder="Email" value={newVendor.email} onChange={handleInputChange} />
                <input name="instagram" placeholder="Instagram" value={newVendor.instagram} onChange={handleInputChange} />
                <input name="cost" placeholder="Cost" value={newVendor.cost} onChange={handleInputChange} />
                <input name="rating" placeholder="Rating (1-5)" value={newVendor.rating} onChange={handleInputChange} />
                <button onClick={handleAddVendor}>Add Vendor</button>
            </div>
        </div>
    );
}

export default DJVendorsManager;
