import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CoverPage.css';
import Footer from './Footer2';
const CoverPage = () => {
    const navigate = useNavigate();

    return (
        <div className="cover-page">
            {/* Header */}
            <header className="cover-header">
                <div className="title">Wedsync</div>
                <div className="nav-buttons">
                    <button onClick={() => navigate('/login')}>Login</button>
                    <button onClick={() => navigate('/signup')}>Sign Up</button>
                </div>
            </header>

            {/* Hero */}
            <section className="hero-section">
                <div className="hero-content">
                    <img src="/assets/logo.png" alt="WedSync Logo" className="logo" />
                    <h1>Plan Your Dream Wedding Effortlessly</h1>
                    <p>All-in-one wedding planning made simple with personalized tools, vendors, and love.</p>
                </div>
            </section>

            {/* Services */}
            <section className="services-section">
                <h2>Your wedding is about you — so are we</h2>
                <div className="services-cards">
                    <div className="card">
                        <h3>Personalized Vendor List</h3>
                        <p>No irrelevant results — only the vendors that match your style and budget.</p>
                    </div>
                    <div className="card">
                        <h3>Complete Planning Tools</h3>
                        <p>Budget, guests, vendors, tasks — all in one simple, beautiful place.</p>
                    </div>
                    <div className="card">
                        <h3>Transparent Pricing</h3>
                        <p>No hidden fees, just honest vendor pricing to plan with confidence.</p>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default CoverPage;
