import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./EventDetails.css";

const EventDetails = () => {
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [rating, setRating] = useState(0); // for user input
    const [rated, setRated] = useState(false);

    const fetchEventDetails = async () => {
        try {
            const res = await axios.get(`/events-details/${eventId}`);
            const eventData = res.data.events[0];
            setEvent(eventData);

            // Rating is considered set only if not null and > 0
            const ratingValue = eventData?.Rating;
            setRated(ratingValue !== null && ratingValue !== undefined && ratingValue > 0);

            setMessage("");
        } catch (err) {
            console.error("Error fetching event details:", err);
            setMessage("Failed to fetch event details.");
        } finally {
            setLoading(false);
        }
    };

    const handleRatingSubmit = async () => {
        try {
            const res = await axios.post("/rate-event", {
                eventId,
                rating: parseInt(rating),
            });

            if (res.data.success) {
                alert(res.data.message);
                setRated(true);
                fetchEventDetails();
            } else {
                alert(res.data.message);
            }
        } catch (err) {
            console.error("Error rating event:", err);
            alert("Failed to submit rating.");
        }
    };

    useEffect(() => {
        fetchEventDetails();
    }, [eventId]);

    if (loading) return <div className="event-loading">Loading event details...</div>;
    if (!event) return <div className="event-error">{message}</div>;

    return (
        <div className="event-details-container">
            <h2>Event Details</h2>
            <div className="event-card">
                <div className="event-row"><span className="label">Groom:</span> <span>{event.Groom_Name}</span></div>
                <div className="event-row"><span className="label">Bride:</span> <span>{event.Bride_Name}</span></div>
                <div className="event-row"><span className="label">Type:</span> <span>{event.Type}</span></div>
                <div className="event-row"><span className="label">Date & Time:</span> <span>{new Date(event["Date and Time"]).toLocaleString()}</span></div>
                <div className="event-row"><span className="label">Venue:</span> <span>{event.Venue}</span></div>
                <div className="event-row"><span className="label">Guest Limit:</span> <span>{event.No_Of_Guests}</span></div>
                <div className="event-row"><span className="label">Status:</span> <span>{event.Status}</span></div>
                <div className="event-row"><span className="label">Rating:</span> <span>{event.Rating || "Not Rated"}</span></div>
            </div>

            {/* Show rating option only if event is completed and not rated */}
            {event.Status === "Completed" && !rated && (
                <div className="rate-event-form">
                    <h3>Rate This Event</h3>
                    <select className="rating-dropdown" value={rating} onChange={(e) => setRating(e.target.value)}>
                        <option value={0}>Select Rating</option>
                        <option value={1}>★☆☆☆☆</option>
                        <option value={2}>★★☆☆☆</option>
                        <option value={3}>★★★☆☆</option>
                        <option value={4}>★★★★☆</option>
                        <option value={5}>★★★★★</option>
                    </select>
                    <button className="rate-btn" onClick={handleRatingSubmit}>Submit</button>
                </div>

            )}
        </div>
    );
};

export default EventDetails;
