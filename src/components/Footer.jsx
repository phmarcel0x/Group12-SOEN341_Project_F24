import './footer.css'
import React from 'react';

const Footer = () => {
  return (
    <div>
      <footer class="site-footer">
        <div class="fcontainer">
          <div class="row">
            <div class="col-sm-12 col-md-6">
              <h6>About</h6>
              <p class="text-justify">Peer assessment helps build a collaborative learning community by providing constructive feedback and insights. Your feedback remains anonymous, ensuring a fair and unbiased evaluation process. We prioritize your data's confidentiality and security.</p>
            </div>

            <div class="col-xs-6 col-md-3">
              <h6>Resources</h6>
              <ul class="footer-links">
                <li class="li-1"><a href="/">User-Guide</a></li>
                <li class="li-2"><a href="/">FAQ</a></li>
              </ul>
            </div>

            <div class="col-xs-6 col-md-3">
              <h6>Quick Links</h6>
              <ul class="footer-links">
                <li class="li-3"><a href="/">About Us</a></li>
                <li class="li-4"><a href="/">Contact Us</a></li>
                <li class="li-5"><a href="/">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <hr />
        </div>
        <div class="fcontainer">
          <div class="row">
            <div class="col-md-8 col-sm-6 col-xs-12">
              <p class="copyright-text">Copyright &copy; 2024 All Rights Reserved by
                <a href="#"> Concordia</a>.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>


  );
};

export default Footer;