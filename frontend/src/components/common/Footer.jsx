
import { Link } from 'react-router-dom';
import {
  MdSchool,
  MdEmail,
  MdPhone,
  MdLocationOn
} from 'react-icons/md';

import {
  FaInstagram,
  FaTelegramPlane,
  FaFacebookF,
  FaYoutube,
  FaLinkedinIn,
  FaGithub
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="lms-footer">
      <div className="container">

        <div className="footer-main">

          {/* =========================
              BRAND SECTION
          ========================= */}
          <div className="footer-brand">

            <div className="footer-logo">
              <MdSchool size={30} />
            </div>

            <h4>PHP LMS</h4>

            <span>Learn • Grow • Succeed</span>

            <p>
              A simple and powerful Learning Management System
              designed to make online learning easier and better.
            </p>

            {/* Social Media */}
            <div className="footer-socials">

              <a
                href="https://www.instagram.com/assc_surat/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>

              <a
                href="https://t.me/assc_surat"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
              >
                <FaTelegramPlane />
              </a>

              <a
                href="#"
                aria-label="Facebook"
              >
                <FaFacebookF />
              </a>

              <a
                href="https://www.youtube.com/@atmanandsaraswatiscienceco40"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <FaYoutube />
              </a>

              <a
                href="#"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn />
              </a>

              <a
                href="#"
                aria-label="GitHub"
              >
                <FaGithub />
              </a>

            </div>
          </div>


          {/* =========================
              QUICK LINKS
          ========================= */}
          <div className="footer-section">

            <h6>Quick Links</h6>

            <Link to="/courses">
              <span>•</span>
              Courses
            </Link>

            <Link to="/login">
              <span>•</span>
              Login
            </Link>

            <Link to="/register">
              <span>•</span>
              Register
            </Link>

            <Link to="/">
              <span>•</span>
              Home
            </Link>

          </div>


          {/* =========================
              SUPPORT
          ========================= */}
          <div className="footer-section">

            <h6>Support</h6>

            <Link to="/help">
              <span>•</span>
              Help Center
            </Link>

            <Link to="/privacy-policy">
              <span>•</span> Privacy Policy
            </Link>

            <Link to="/terms-conditions">
              <span>•</span> Terms & Conditions
            </Link>

            <Link to="/contact-us">
              <span>•</span> Contact Us
            </Link>
          </div>


          {/* =========================
              CONTACT US
          ========================= */}
          <div className="footer-section">

            <h6>Contact Us</h6>

            <div className="footer-contact">

              <span>•</span>

              <MdEmail />

              <span>
                support@phplms.com
              </span>

            </div>

            <div className="footer-contact">

              <span>•</span>

              <MdPhone />

              <span>
                +91 98765 43210
              </span>

            </div>

            <div className="footer-contact">

              <span>•</span>

              <MdLocationOn />

              <span>
                Gujarat, India
              </span>

            </div>

          </div>

        </div>


        {/* =========================
            FOOTER BOTTOM
        ========================= */}
        <div className="footer-bottom">

          <p>
            Designed & Developed by <strong>Palak</strong>
          </p>

          <p>
            © {new Date().getFullYear()} PHP LMS Project.
            All rights reserved.
          </p>

        </div>

      </div>
    </footer>
  );
};

export default Footer;

