import React from 'react';
import './Footer.css';

function Footer() {

    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section brand">
                    <h3>WedSync</h3>
                    <p>Making your special day seamless & memorable</p>
                </div>

                <div className="footer-section links">
                    <h4>Contact Us</h4>
                    <p>Email: support@wedsync.com</p>
                    <p>Phone: +92 315 5849121</p>
                    <p>       +92 317 4572359</p>
                </div>

            </div>

            <div className="footer-bottom">
                <p>&copy; 2025 WedSync. All rights reserved.</p>
            </div>
        </footer>
    );
}

export default Footer;
