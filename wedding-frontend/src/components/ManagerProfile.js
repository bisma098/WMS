import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import './Profile.css';

const ManagerProfile = () => {
    const { username } = useParams();
    const [manager, setManager] = useState(null);
    const [formData, setFormData] = useState({
        First_Name: '',
        Last_Name: '',
        Phone_No: '',
        Alternate_Phone_no: '',
        Email: ''
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
                        First_Name: data.First_Name || '',
                        Last_Name: data.Last_Name || '',
                        Phone_No: data.Phone_No || '',
                        Alternate_Phone_no: data.Alternate_Phone_no || '',
                        Email: data.Email || ''
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

    if (!manager) return <div className="profile-container"><div className="profile-box">Loading...</div></div>;

    return (
        <div className="profile-container">
            <div className="profile-box">
                <h2 className="profile-title">Manager Profile</h2>
                {["First_Name", "Last_Name", "Phone_No", "Alternate_Phone_no", "Email"].map(field => (
                    <div className="profile-field" key={field}>
                        <label className="profile-label">{field.replace(/_/g, " ")}</label>
                        <input
                            type="text"
                            name={field}
                            value={formData[field] || ""}
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
