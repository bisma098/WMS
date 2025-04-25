import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import './Profile.css';

const Profile = () => {
    const { username } = useParams();
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        First_Name: '',
        Last_Name: '',
        Phone_No: '',
        Alternate_Phone_no: '',
        Email: '',
        Address: ''
    });
    const [readOnly, setReadOnly] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(`/view-user-details/${username}`);
                if (res.data && res.data.user) {
                    const userData = res.data.user;
                    setUser(userData);
                    setFormData({
                        First_Name: userData.First_Name || '',
                        Last_Name: userData.Last_Name || '',
                        Phone_No: userData.Phone_No || '',
                        Alternate_Phone_no: userData.Alternate_Phone_no || '',
                        Email: userData.Email || '',
                        Address: userData.Address || ''
                    });
                }
            } catch (err) {
                console.error("Error fetching user:", err);
            }
        };
        fetchUser();
    }, [username]);

    const handleChange = (e) => {
        if (!readOnly) {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleUpdateClick = async () => {
        if (readOnly) {
            // Enable edit mode
            setReadOnly(false);
        } else {
            try {
                const res = await axios.post("/user-details", {
                    username,
                    firstName: formData.First_Name,
                    lastName: formData.Last_Name,
                    phoneNo: formData.Phone_No,
                    alternatePhone: formData.Alternate_Phone_no,
                    email: formData.Email,
                    address: formData.Address
                });

                alert(res.data.message || "Update successful");
                setReadOnly(true); // Back to view mode
            } catch (err) {
                console.error("Update error:", err);
                alert("Update failed!");
            }
        }
    };

    if (!user) return <div className="profile-container"><div className="profile-box">Loading...</div></div>;

    return (
        <div className="profile-container">
            <div className="profile-box">
                <h2 className="profile-title">User Profile</h2>
                {["First_Name", "Last_Name", "Phone_No", "Alternate_Phone_no", "Email", "Address"].map(field => (
                    <div className="profile-field" key={field}>
                        <label className="profile-label">
                            {field.replace(/_/g, " ")}
                        </label>
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

export default Profile;
