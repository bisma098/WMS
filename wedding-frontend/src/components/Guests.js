import { useEffect, useState } from "react";
import axios from "axios";
import "./Guests.css";
import { useParams } from "react-router-dom";

const Guests = () => {
    const { eventId } = useParams();
    const [guests, setGuests] = useState([]);
    const [familyName, setFamilyName] = useState("");
    const [newGuests, setNewGuests] = useState(1);
    const [loading, setLoading] = useState(true);
    const [totalGuests, setTotalGuests] = useState(0);
    const [maxGuestsAllowed, setMaxGuestsAllowed] = useState(0);
    const [message, setMessage] = useState("");
    const [eventStatus, setEventStatus] = useState("");

    const fetchGuests = async () => {
        try {
            const res = await axios.get(`/wedding-guests/${eventId}`);
            setGuests(res.data.guests);
            setTotalGuests(res.data.totalGuests);
            setMaxGuestsAllowed(res.data.maxGuestsAllowed);
            setMessage(res.data.message);
        } catch (err) {
            console.error("Error fetching guests:", err);
            setMessage("Failed to fetch guest list.");
        }
    };

    const fetchEventStatus = async () => {
        try {
            const res = await axios.get(`/wedding-events/${eventId}`);
            setEventStatus(res.data.status); // assuming backend returns { status: "upcoming" | "completed" }
        } catch (err) {
            console.error("Error fetching event status:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGuests();
        fetchEventStatus();
    }, [eventId]);

    const handleAddGuest = async () => {
        if (eventStatus === "completed") {
            alert("Cannot add guests to a completed event.");
            return;
        }

        if (totalGuests + parseInt(newGuests) > maxGuestsAllowed) {
            alert(`Cannot add ${newGuests} guests. Event limit is ${maxGuestsAllowed}.`);
            return;
        }

        try {
            const res = await axios.post("/add-guest", {
                eventId,
                familyName,
                newGuests: parseInt(newGuests),
            });
            alert(res.data.message);
            setFamilyName("");
            setNewGuests(1);
            fetchGuests();
        } catch (err) {
            console.error("Error adding guest:", err);
            alert(err.response?.data?.message || "Failed to add guest");
        }
    };

    const handleDelete = async (guestId) => {
        try {
            const res = await axios.delete(`/delete-guests/${guestId}`);
            alert(res.data.message);
            fetchGuests();
        } catch (err) {
            console.error("Error deleting guest:", err);
            alert(err.response?.data?.message || "Failed to delete guest");
        }
    };

    if (loading) return <div>Loading guest list...</div>;

    return (
        <div className="guests-container">
            <h2>Guest List for Event</h2>
            <p>
                Total Guests: {totalGuests} / {maxGuestsAllowed}
            </p>
            <table className="guests-table">
                <thead>
                    <tr>
                        <th>Family Name</th>
                        <th>Guests Count</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {guests.map((guest) => (
                        <tr key={guest.Guest_ID}>
                            <td>{guest.Family_Name}</td>
                            <td>{guest.No_Of_Guests_From_This_Family}</td>
                            <td>
                                <button
                                    className="delete-btn"
                                    onClick={() => handleDelete(guest.Guest_ID)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {eventStatus !== "completed" ? (
                <div className="add-guest-form">
                    <h3>Add New Guests</h3>
                    <input
                        type="text"
                        placeholder="Family Name"
                        value={familyName}
                        onChange={(e) => setFamilyName(e.target.value)}
                        required
                    />
                    <input
                        type="number"
                        min={1}
                        value={newGuests}
                        onChange={(e) => setNewGuests(e.target.value)}
                        required
                    />
                    <button onClick={handleAddGuest}>Add Guest</button>
                </div>
            ) : (
                <p style={{ color: "#a05c5c", fontWeight: "500", marginTop: "20px" }}>
                    This event is completed. You cannot add more guests.
                </p>
            )}
        </div>
    );
};

export default Guests;
