import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CoverPage.css';
import Footer from './Footer2';

const CoverPage = () => {
    const navigate = useNavigate();

    return (
        <div className="cover-page">
            <header className="cover-header">
                <div className="title">Wedsync</div>
                <div className="nav-buttons">
                    {/* User buttons */}
                    <button onClick={() => navigate('/login')}>User Login</button>
                    <button onClick={() => navigate('/signup')}>User SignUp</button>

                    {/* Manager buttons */}
                    <button onClick={() => navigate('/manager-login')}>Manager Login</button>
                    <button onClick={() => navigate('/manager-signup')}>Manager SignUp</button>
                </div>
            </header>

            <section className="hero-section">
                <div className="hero-content">
                    <img src="/assets/logo.png" alt="WedSync Logo" className="logo" />
                    <h1>Plan Your Dream Wedding Effortlessly</h1>
                    <p>All-in-one wedding planning made simple with personalized tools, vendors, and love.</p>
                </div>
            </section>

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

            <section className="cover-2-section">
                <div className="cover-2-text">
                    <h2>Plan your Event to Perfection</h2>
                    <p>Get customized design and management services for your event at an affordable cost. Reach out now to elevate your event’s charm.</p>
                </div>
                <div className="cover-2-image">
                    <img src="/assets/bg-5.jpg" alt="Event Planning" />
                </div>
            </section>

            <section className="all-in-one-section">
                <div className="all-in-one-content">
                    <div className="image-side">
                        <img src="/assets/bg-4.jpg" alt="Event Management" />
                    </div>
                    <div className="text-side">
                        <h2>All-in-One Solution for Your Events</h2>
                        <p>
                            WedSync boasts a vast list of event management services for every client, regardless of the event’s scale and nature.
                        </p>
                        <div className="features-grid">
                            <div className="feature-item"> Decorations</div>
                            <div className="feature-item"> Catering Service</div>
                            <div className="feature-item"> DJ and Music</div>
                            <div className="feature-item"> Photography</div>
                            <div className="feature-item"> Dream Venues</div>
                            <div className="feature-item"> Task Tracking</div>
                            <div className="feature-item"> Guest List Management</div>
                            <div className="feature-item"> Payments Tracking</div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default CoverPage;
