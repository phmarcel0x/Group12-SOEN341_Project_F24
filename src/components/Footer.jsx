/* Global layout to ensure footer sticks at the bottom */
html, body {
  height: 100%;
  margin: 0;
  display: flex;
  flex-direction: column;
}

.container {
  flex: 1; /* Ensures that the content fills remaining space */
}

/* Footer container */
.fcontainer {
  width: 100%;
  max-width: 1140px; /* Default max-width for .container */
  padding-right: 15px;
  padding-left: 15px;
  margin-right: auto;
  margin-left: auto;
  background-color: #26272b;
}

/* Responsive Container Breakpoints */
@media (min-width: 576px) {
  .fcontainer {
    max-width: 540px;
  }
}
@media (min-width: 768px) {
  .fcontainer {
    max-width: 720px;
  }
}
@media (min-width: 992px) {
  .fcontainer {
    max-width: 960px;
  }
}
@media (min-width: 1200px) {
  .fcontainer {
    max-width: 1140px;
  }
}
@media (min-width: 1400px) {
  .fcontainer {
    max-width: 1320px;
  }
}

/* Footer styling */
.site-footer {
  background-color: #26272b;
  padding: 45px 0 20px;
  font-size: 15px;
  line-height: 24px;
  color: #b1b0b0;
  position: relative;
  bottom: 0;
  width: 100%;
}

.site-footer hr {
  border-top-color: #bbb;
  opacity: 0.5;
}

.site-footer hr.small {
  margin: 20px 0;
}

/* Consolidated h6 styles */
.site-footer h6 {
  color: #fff;
  font-size: 16px;
  text-transform: uppercase;
  margin-top: 5px;
  letter-spacing: 2px;
  background-color: #26272b; /* Merged styles from line 158 */
}

.site-footer a {
  color: #fffefe;
}

.site-footer a:hover {
  color: #3366cc;
  text-decoration: none;
}

.footer-links {
  padding-left: 0;
  list-style: none;
}

.footer-links li {
  display: block;
}

.footer-links a {
  color: #b1b0b0;
}

.footer-links a:active,
.footer-links a:focus,
.footer-links a:hover {
  color: #3366cc;
  text-decoration: none;
}

.footer-links.inline li {
  display: inline-block;
}

.site-footer .social-icons {
  text-align: right;
}

.site-footer .social-icons a {
  width: 40px;
  height: 40px;
  line-height: 40px;
  margin-left: 6px;
  margin-right: 0;
  border-radius: 100%;
  background-color: #26272b; /* Link no color change */
}

.copyright-text {
  margin: 0;
  background-color: #26272b;
}

@media (max-width: 991px) {
  .site-footer [class^=col-] {
    margin-bottom: 30px;
  }
}

@media (max-width: 767px) {
  .site-footer {
    padding-bottom: 0;
  }

  .site-footer .copyright-text, .site-footer {
    text-align: center;
  }
}

/* General row and column styling for the footer */
.row {
  background-color: #26272b;
}

.col-sm-12.col-md-6,
.col-xs-6.col-md-3,
.col-md-8.col-sm-6.col-xs-12 {
  background-color: #26272b;
}

.text-justify {
  background-color: #26272b;
}

.li-1, .li-2, .li-3, .li-4, .li-5 {
  background-color: #26272b;
}
