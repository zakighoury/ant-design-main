import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './footer.css';

const ParkingFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          <div className="col">
            <h3 className="footer-title">About Us</h3>
            <p className="footer-text">
              We provide convenient and secure parking solutions for your needs. Our mission is to make parking easy and stress-free.
            </p>
          </div>
          <div className="col">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-list">
              <li><a href="/home">Home</a></li>
              <li><a href="/about">About</a></li>
              <li><a href="/services">Services</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </div>
          <div className="col">
            <h3 className="footer-title">Follow Us</h3>
            <div className="social-icons">
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy;{currentYear} Parking Solutions. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default ParkingFooter;
