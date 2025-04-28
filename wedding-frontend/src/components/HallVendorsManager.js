import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ManagerVendorsTable.css';

function HallVendorsManager() {
    const [vendors, setVendors] = useState([]);
    const [newVendor, setNewVendor] = useState({
        location_id: '',
        name: '',
        contact_no: '',
        cost: '',
        capacity: '',
        rating: ''
    });

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            const res = await axios.get('/hall-vendors');
            setVendors(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (vendorId) => {
        if (!window.confirm('Are you sure you want to delete this vendor?')) return;
        try {
            await axios.delete(`/delete-hall-vendor/${vendorId}`);
            fetchVendors();
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddVendor = async () => {
        try {
            await axios.post('/add-hall-vendor', newVendor);
            setNewVendor({
                location_id: '',
                name: '',
                contact_no: '',
                cost: '',
                capacity: '',
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
            <h2>Hall Vendors</h2>
            <table>
                <thead>
                    <tr>
                        <th>Location ID</th>
                        <th>Name</th>
                        <th>Contact No</th>
                        <th>Cost</th>
                        <th>Capacity</th>
                        <th>Rating</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {vendors.map((vendor) => (
                        <tr key={vendor.Vendor_ID}>
                            <td>{vendor.Location_ID}</td>
                            <td>{vendor.Name}</td>
                            <td>{vendor.Contact_No}</td>
                            <td>{vendor.Cost}</td>
                            <td>{vendor.Capacity}</td>
                            <td>{vendor.Rating}</td>
                            <td>
                                <button onClick={() => handleDelete(vendor.Vendor_ID)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h3>Add New Hall Vendor</h3>
            <div className="add-vendor-form">
                <input name="location_id" placeholder="Location ID" value={newVendor.location_id} onChange={handleInputChange} />
                <input name="name" placeholder="Name" value={newVendor.name} onChange={handleInputChange} />
                <input name="contact_no" placeholder="Contact No" value={newVendor.contact_no} onChange={handleInputChange} />
                <input name="cost" placeholder="Cost" value={newVendor.cost} onChange={handleInputChange} />
                <input name="capacity" placeholder="Capacity" value={newVendor.capacity} onChange={handleInputChange} />
                <input name="rating" placeholder="Rating (1-5)" value={newVendor.rating} onChange={handleInputChange} />
                <button onClick={handleAddVendor}>Add Vendor</button>
            </div>
        </div>
    );
}

export default HallVendorsManager;
