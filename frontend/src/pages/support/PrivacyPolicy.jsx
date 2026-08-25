
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaShieldAlt,
  FaUserShield,
  FaDatabase,
  FaLock,
  FaCookieBite,
  FaUserCheck,
  FaEnvelope
} from 'react-icons/fa';

import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

const PrivacyPolicy = () => {

  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column min-vh-100">

      {/* ================= HEADER ================= */}

      <Header />


      {/* ================= MAIN CONTENT ================= */}

      <main className="privacy-page flex-grow-1">

        <div className="container py-5">

          {/* Back Button */}

          <button
            type="button"
            className="privacy-back-btn"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>


          {/* ================= HERO ================= */}

          <div className="privacy-hero text-center">

            <div className="privacy-hero-icon">
              <FaShieldAlt />
            </div>

            <h1>Privacy Policy</h1>

            <p>
              Your privacy and security are important to us.
            </p>

            <small>
              Last updated: {new Date().toLocaleDateString()}
            </small>

          </div>


          {/* ================= INTRODUCTION ================= */}

          <div className="privacy-card">

            <h3>
              <FaUserShield />
              Introduction
            </h3>

            <p>
              Welcome to PHP LMS. This Privacy Policy explains how
              we collect, use, protect and manage information when
              you use our Learning Management System.
            </p>

            <p>
              By using PHP LMS, you agree to the practices described
              in this Privacy Policy.
            </p>

          </div>


          {/* ================= INFORMATION ================= */}

          <div className="privacy-card">

            <h3>
              <FaDatabase />
              Information We Collect
            </h3>

            <p>
              When you create or use an account, we may collect
              information such as:
            </p>

            <ul>
              <li>Name</li>
              <li>Email address</li>
              <li>Account role such as Student or Teacher</li>
              <li>Profile information</li>
              <li>Course and learning activity</li>
            </ul>

          </div>


          {/* ================= USE ================= */}

          <div className="privacy-card">

            <h3>
              <FaUserCheck />
              How We Use Your Information
            </h3>

            <p>
              The information collected through PHP LMS may be used
              to:
            </p>

            <ul>
              <li>Create and manage your account</li>
              <li>Provide access to courses and learning content</li>
              <li>Manage student and teacher activities</li>
              <li>Improve LMS functionality and user experience</li>
              <li>Provide technical and customer support</li>
              <li>Maintain platform security</li>
            </ul>

          </div>


          {/* ================= SECURITY ================= */}

          <div className="privacy-card">

            <h3>
              <FaLock />
              Data Security
            </h3>

            <p>
              We take reasonable measures to protect your
              information from unauthorized access, alteration,
              disclosure or destruction.
            </p>

            <p>
              However, no online system can be guaranteed to be
              completely secure. Users should also protect their
              login credentials and avoid sharing passwords with
              others.
            </p>

          </div>


          {/* ================= COOKIES ================= */}

          <div className="privacy-card">

            <h3>
              <FaCookieBite />
              Cookies and Local Storage
            </h3>

            <p>
              PHP LMS may use browser storage technologies such as
              local storage to maintain login sessions, preferences
              and application settings.
            </p>

            <p>
              These technologies help provide a smoother and more
              personalized experience while using the LMS.
            </p>

          </div>


          {/* ================= USER RIGHTS ================= */}

          <div className="privacy-card">

            <h3>
              <FaUserCheck />
              Your Rights
            </h3>

            <p>
              Depending on the functionality available in the LMS,
              you may be able to update or manage your personal
              information through your profile.
            </p>

            <p>
              If you need assistance with your account information,
              you can contact the LMS support team.
            </p>

          </div>


          {/* ================= THIRD PARTY ================= */}

          <div className="privacy-card">

            <h3>
              <FaShieldAlt />
              Third-Party Services
            </h3>

            <p>
              PHP LMS may use third-party libraries, services or
              integrations to provide certain features.
            </p>

            <p>
              Third-party services may have their own privacy
              policies and terms. We recommend reviewing their
              policies when using such services.
            </p>

          </div>


          {/* ================= CHILDREN ================= */}

          <div className="privacy-card">

            <h3>
              <FaUserShield />
              Children's Privacy
            </h3>

            <p>
              PHP LMS is designed as an educational platform.
              Users should provide accurate information and use the
              platform according to the rules and requirements of
              their educational institution.
            </p>

          </div>


          {/* ================= CHANGES ================= */}

          <div className="privacy-card">

            <h3>
              <FaShieldAlt />
              Changes to This Privacy Policy
            </h3>

            <p>
              We may update this Privacy Policy from time to time
              when the LMS features, services or requirements
              change.
            </p>

            <p>
              Any updated version will be made available on this
              page.
            </p>

          </div>


          {/* ================= CONTACT ================= */}

          <div className="privacy-contact">

            <div className="privacy-contact-icon">
              <FaEnvelope />
            </div>

            <div>

              <h4>
                Questions About Privacy?
              </h4>

              <p>
                If you have any questions about this Privacy Policy
                or your information, please contact the LMS support
                team.
              </p>

              <strong>
                support@phplms.com
              </strong>

            </div>

          </div>


          {/* Bottom Back */}

          <div className="text-center mt-4">

            <button
              type="button"
              className="privacy-back-btn"
              onClick={() => navigate(-1)}
            >
              <FaArrowLeft />
              <span>Back</span>
            </button>

          </div>

        </div>

      </main>


      {/* ================= FOOTER ================= */}

      <Footer />

    </div>
  );
};

export default PrivacyPolicy;

