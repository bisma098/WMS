import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Weddings.css';
import { useNavigate } from 'react-router-dom';


function Weddings() {
    const [weddings, setWeddings] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [groom, setGroom] = useState('');
    const [bride, setBride] = useState('');
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.UserID) {
            axios
                .get(`/weddings/${user.UserID}`)
                .then((res) => setWeddings(res.data.weddings))
                .catch((err) => console.error('Error fetching weddings:', err));
        }
    }, [user]);

    const handleAddWedding = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/book-wedding', {
                userId: user.UserID,
                groomName: groom,
                brideName: bride,
            });

            if (res.data.success) {
                const refreshed = await axios.get(`/weddings/${user.UserID}`);
                setWeddings(refreshed.data.weddings);

                setShowForm(false);
                setGroom('');
                setBride('');
            }
        } catch (err) {
            console.error('Error booking wedding:', err);
        }
    };

    const handleWeddingClick = (weddingId) => {
        localStorage.setItem("weddingID", JSON.stringify(weddingId));
        navigate(`/wedding/${weddingId}/events`);
    };

    return (
        <div className="weddings-container">
            <h2>Your Weddings</h2>

            {weddings.length === 0 ? (
                <p className="no-weddings">No weddings yet.</p>
            ) : (
                <ul className="wedding-list">
                    {weddings.map((wedding) => (
                        <li key={wedding.Wedding_ID}>
                            <button
                                className="wedding-btn"
                                onClick={() => handleWeddingClick(wedding.Wedding_ID)}
                            >
                                {wedding.Wedding_Title}
                            </button>
                        </li>
                    ))}
                </ul>

            )}

            <hr className="divider" />

            <button className="add-btn" onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Cancel' : 'Add New Wedding'}
            </button>

            {showForm && (
                <form className="wedding-form" onSubmit={handleAddWedding}>
                    <input
                        type="text"
                        placeholder="Groom Name"
                        value={groom}
                        onChange={(e) => setGroom(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Bride Name"
                        value={bride}
                        onChange={(e) => setBride(e.target.value)}
                        required
                    />
                    <button type="submit">Book Wedding</button>
                </form>
            )}
        </div>
    );
}

export default Weddings;
