import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Payments.css";
//hi
function Payments() {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [filter, setFilter] = useState("all");
    const [loadingPaymentId, setLoadingPaymentId] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(null); // For modal
    const userId = JSON.parse(localStorage.getItem("user"))?.UserID;

    useEffect(() => {
        if (!userId) return;

        const endpoint =
            filter === "due"
                ? `/due-payments/${userId}`
                : `/user-payments/${userId}`;

        axios
            .get(endpoint)
            .then((res) => {
                if (res.data.success) {
                    setPayments(res.data.payments);
                } else {
                    setPayments([]);
                }
            })
            .catch((err) => {
                console.error("Error fetching payments:", err);
                setPayments([]);
            });
    }, [filter, userId]);

    const handlePayNow = (payment) => {
        setSelectedPayment(payment); // open modal
    };

    const confirmPayment = async () => {
        try {
            if (!selectedPayment || !userId) return;

            setLoadingPaymentId(selectedPayment.payment_id);

            const res = await axios.put("/update-payment", {
                paymentId: selectedPayment.payment_id,
                userId,
            });

            if (res.data.success) {
                setPayments((prev) =>
                    prev.map((p) =>
                        p.payment_id === selectedPayment.payment_id
                            ? { ...p, Payment_Status: "Paid" }
                            : p
                    )
                );
                setSelectedPayment(null); // close modal
            } else {
                alert(res.data.message || "Payment failed to update");
            }
        } catch (err) {
            console.error("Payment update failed:", err);
            alert("Error processing payment. Please try again.");
        } finally {
            setLoadingPaymentId(null);
        }
    };

    return (
        <div className="payments-container">
            <div className="payments-header">
                <select
                    className="payments-dropdown"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="all">All Payments</option>
                    <option value="due">Due Payments</option>
                </select>
            </div>

            <div className="payments-list">
                {payments.length === 0 ? (
                    <p>No payments to show.</p>
                ) : (
                    <table className="payments-table">
                        <thead>
                            <tr>
                                <th>Vendor</th>
                                <th>Cost</th>
                                <th>Status</th>
                                <th>Due Date</th>
                                <th>Event Type</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((p) => (
                                <tr key={p.payment_id}>
                                    <td>{p.Vendor_Type}</td>
                                    <td>{p.Cost}</td>
                                    <td>{p.Payment_Status}</td>
                                    <td>{new Date(p.Due_Date).toLocaleDateString()}</td>
                                    <td>{p.Event_Type || "-"}</td>
                                    <td>
                                        {p.Payment_Status !== "Paid" ? (
                                            <button
                                                className="pay-now-btn"
                                                onClick={() => handlePayNow(p)}
                                            >
                                                Pay Now
                                            </button>
                                        ) : (
                                            "-"
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal for payment confirmation */}
            {selectedPayment && (
                <div className="modal-backdrop">
                    <div className="payment-modal">
                        <h3>Payment Details</h3>
                        <p><strong>Vendor:</strong> {selectedPayment.Vendor_Type}</p>
                        <p><strong>Cost:</strong> Rs.{selectedPayment.Cost}</p>
                        <p><strong>Due Date:</strong> {new Date(selectedPayment.Due_Date).toLocaleDateString()}</p>
                        <p><strong>Event:</strong> {selectedPayment.Event_Type || "-"}</p>

                        <div className="modal-actions">
                            <button
                                className="pay-btn"
                                onClick={confirmPayment}
                                disabled={loadingPaymentId === selectedPayment.payment_id}
                            >
                                {loadingPaymentId === selectedPayment.payment_id
                                    ? "Processing..."
                                    : "Confirm Pay"}
                            </button>
                            <button className="cancel-btn" onClick={() => setSelectedPayment(null)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Payments;
