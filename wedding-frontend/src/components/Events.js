import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import './Events.css';
import { useNavigate } from 'react-router-dom';


function Events() {
    const { weddingId } = useParams();
    const [events, setEvents] = useState([]);
    const [weddingTitle, setWeddingTitle] = useState("");
    const [filter, setFilter] = useState("all");
    const navigate = useNavigate();

    const [showForm, setShowForm] = useState(false);
    const [dateTime, setDateTime] = useState('');
    const [city, setCity] = useState('');
    const [type, setType] = useState('');
    const [guests, setGuests] = useState('');
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    useEffect(() => {
        fetch(`/wedding-title/${weddingId}`)
            .then(res => res.json())
            .then(data => setWeddingTitle(data.title))
            .catch(err => console.error("Error fetching wedding title:", err));
    }, [weddingId]);

    const fetchEvents = () => {
        const url = filter === "all"
            ? `/events/${weddingId}`
            : `/upcoming-events/${weddingId}`;

        fetch(url)
            .then(res => res.json())
            .then(data => setEvents(data.events || []))
            .catch(err => console.error("Error fetching events:", err));
    };

    useEffect(() => {
        fetchEvents();
    }, [filter, weddingId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        try {
            const res = await axios.post("/book-event", {
                weddingID: weddingId,
                dateTime,
                city,
                noOfGuests: guests,
                type
            });

            if (res.data.success) {
                setFormSuccess("Event booked successfully!");
                setShowForm(false);
                setDateTime('');
                setCity('');
                setGuests('');
                setType('');
                fetchEvents();
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Error booking event";
            setFormError(msg);
        }
    };

    const handleEventClick = (Event_ID) => {
        navigate(`/event-details/${Event_ID}`);
    };

    return (
        <div className="events-container">
            <div className="events-header">
                <h2>{weddingTitle} – Wedding Events</h2>
                <select
                    className="events-dropdown"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="all">All Events</option>
                    <option value="upcoming">Upcoming Events</option>
                </select>
            </div>

            {events.length === 0 ? (
                <p>No {filter === "upcoming" ? "upcoming " : ""}events found for this wedding.</p>
            ) : (
                <ul className="events-list">
                    {events.map(event => (
                        <li key={event.Event_ID}>
                            <button
                                className="event-btn"
                                onClick={() => handleEventClick(event.Event_ID)}
                            >
                                <strong>{event.Type}</strong> – {new Date(event["Date and Time"]).toLocaleString()}
                                {filter === "all" && (
                                    <>
                                        <br />
                                        Status: {event.Status}, Rating: {event.Rating || "N/A"}
                                    </>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <hr className="divider" />

            <button className="add-btn" onClick={() => setShowForm(!showForm)}>
                {showForm ? "Cancel" : "Book New Event"}
            </button>

            {showForm && (
                <form className="event-form" onSubmit={handleSubmit}>
                    {formError && <p className="error">{formError}</p>}
                    {formSuccess && <p className="success">{formSuccess}</p>}
                    <input
                        type="date"
                        value={dateTime.split('T')[0]}
                        onChange={(e) => setDateTime(e.target.value + "T13:00")}
                        required
                    />

                    <select
                        value={dateTime.split('T')[1] || ""}
                        onChange={(e) => {
                            const date = dateTime.split('T')[0];
                            setDateTime(date + "T" + e.target.value);
                        }}
                        required
                    >
                        <option value="">Select Time</option>
                        <option value="13:00">1 PM</option>
                        <option value="19:00">7 PM</option>
                    </select>

                    <select value={city} onChange={(e) => setCity(e.target.value)} required>
                        <option value="">Select City</option>
                        <option value="Lahore">Lahore</option>
                        <option value="Islamabad">Islamabad</option>
                        <option value="Karachi">Karachi</option>
                        <option value="Peshawar">Peshawar</option>
                        <option value="Multan">Multan</option>
                        <option value="Faisalabad">Faisalabad</option>
                    </select>

                    <input
                        type="number"
                        placeholder="Number of Guests"
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        required
                    />
                    <select value={type} onChange={(e) => setType(e.target.value)} required>
                        <option value="">Select Event Type</option>
                        <option value="Mehndi">Mehndi</option>
                        <option value="Barat">Barat</option>
                        <option value="Walima">Walima</option>
                        <option value="Nikkah">Nikkah</option>
                        <option value="Engagement">Engagement</option>
                        <option value="Mayun">Mayun</option>
                        <option value="Others">Others</option>
                    </select>
                    <button type="submit">Add Event</button>
                </form>
            )}
        </div>
    );
}

export default Events;
