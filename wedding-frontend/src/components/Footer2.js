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

                <div className="footer-section links">
                    <h4>Contact Us</h4>
                    <p>Email: support@wedsync.com</p>
                    <p>Phone: +92 315 5849121</p>
                    <p>       +92 317 4572359</p>
                </div>

            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} WedSync. All rights reserved.</p>
            </div>
        </footer>
    );
}

export default Footer;
