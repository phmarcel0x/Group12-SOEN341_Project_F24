// Footer.jsx

import React from 'react';
import './footer.css';

const Footer = () => {
  return (
    <div>
      <footer className="site-footer">
        <div className="fcontainer">
          <div className="row">
            <div className="col-sm-12 col-md-6">
              <h6>About</h6>
              <p className="text-justify">
                Peer assessment helps build a collaborative learning community by providing constructive feedback and insights. Your feedback remains anonymous, ensuring a fair and unbiased evaluation process. We prioritize your data's confidentiality and security.
              </p>
            </div>

            <div className="col-xs-6 col-md-3">
              <h6>Resources</h6>
              <ul className="footer-links">
                <li className="li-1">
                  <a href="/user-guide">User-Guide</a>
                </li>
                <li className="li-2">
                  <a href="/faq">FAQ</a>
                </li>
              </ul>
            </div>

            <div className="col-xs-6 col-md-3">
              <h6>Quick Links</h6>
              <ul className="footer-links">
                <li className="li-3">
                  <a href="/about-us">About Us</a>
                </li>
                <li className="li-4">
                  <a href="/contact-us">Contact Us</a>
                </li>
                <li className="li-5">
                  <a href="/privacy-policy">Privacy Policy</a>
                </li>
              </ul>
            </div>
          </div>
          <hr />
        </div>
        <div className="fcontainer">
          <div className="row">
            <div className="col-md-8 col-sm-6 col-xs-12">
              <p className="copyright-text">
                Copyright &copy; 2024 All Rights Reserved by <a href="/team-godlike"> Team GodLike</a>.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
