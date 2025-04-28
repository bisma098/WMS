import React from 'react';
import './Footer.css';

function Footer() {
    const user = JSON.parse(localStorage.getItem('user'));

    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section brand">
                    <h3>WedSync</h3>
                    <p>Making your special day seamless & memorable</p>
                </div>

                <div className="footer-section contact">
                    <h4>Contact Us</h4>
                    <p>Email: support@wedsync.com</p>
                    <p>Phone: +92 315 5849121</p>
                    <p>       +92 317 4572359</p>
                </div>

                <div className="footer-section links">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="/weddings">My Weddings</a></li>
                        <li><a href="/payments">Payments</a></li>
                        <li><a href={`/profile/${user?.UserName}`}>Profile</a></li>

                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; 2025 WedSync. All rights reserved.</p>
            </div>
        </footer>
    );
}

export default Footer;
