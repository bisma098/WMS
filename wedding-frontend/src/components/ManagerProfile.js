import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import './Profile.css';

const ManagerProfile = () => {
    const { username } = useParams();
    const [manager, setManager] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phoneNo: '',
        alternatePhone: '',
        email: ''
    });
    const [readOnly, setReadOnly] = useState(true);

    useEffect(() => {
        const fetchManager = async () => {
            try {
                const res = await axios.get(`/view-manager-details/${username}`);
                if (res.data?.manager) {
                    const data = res.data.manager;
                    setManager(data);
                    setFormData({
                        firstName: data.First_Name || '',
                        lastName: data.Last_Name || '',
                        phoneNo: data.Phone_No || '',
                        alternatePhone: data.Alternate_Phone_no || '',
                        email: data.Email || ''
                    });
                }
            } catch (err) {
                console.error("Error fetching manager:", err);
            }
        };
        fetchManager();
    }, [username]);

    const handleChange = (e) => {
        if (!readOnly) {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleUpdateClick = async () => {
        if (readOnly) {
            setReadOnly(false);
        } else {
            try {
                const res = await axios.post("/manager-details", {
                    username,
                    ...formData
                });
                alert(res.data.message || "Update successful");
                setReadOnly(true);
            } catch (err) {
                console.error("Update error:", err);
                alert("Update failed!");
            }
        }
    };

    if (!manager) return (
        <div className="profile-container">
            <div className="profile-box">Loading...</div>
        </div>
    );

    const fields = [
        { name: "firstName", label: "First Name" },
        { name: "lastName", label: "Last Name" },
        { name: "phoneNo", label: "Phone No" },
        { name: "alternatePhone", label: "Alternate Phone No" },
        { name: "email", label: "Email" }
    ];

    return (
        <div className="profile-container">
            <div className="profile-box">
                <h2 className="profile-title">Manager Profile</h2>
                {fields.map(({ name, label }) => (
                    <div className="profile-field" key={name}>
                        <label className="profile-label">{label}</label>
                        <input
                            type="text"
                            name={name}
                            value={formData[name] || ""}
                            onChange={handleChange}
                            readOnly={readOnly}
                            className={`profile-input ${readOnly ? "readonly" : ""}`}
                        />
                    </div>
                ))}
                <button onClick={handleUpdateClick} className="profile-button">
                    {readOnly ? "Edit Info" : "Save Changes"}
                </button>
            </div>
        </div>
    );
};

export default ManagerProfile;
