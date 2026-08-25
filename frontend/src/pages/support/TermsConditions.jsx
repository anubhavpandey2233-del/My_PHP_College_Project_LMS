
import React from 'react';
import { useNavigate } from 'react-router-dom';

import {
  FaArrowLeft,
  FaFileContract,
  FaUserCheck,
  FaGraduationCap,
  FaChalkboardTeacher,
  FaLock,
  FaExclamationTriangle,
  FaEnvelope
} from 'react-icons/fa';

import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

const TermsConditions = () => {

  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column min-vh-100">

      {/* ================= HEADER ================= */}

      <Header />


      {/* ================= MAIN CONTENT ================= */}

      <main className="terms-page flex-grow-1">

        <div className="container py-5">

          {/* Back Button */}

          <button
            type="button"
            className="terms-back-btn"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>


          {/* ================= HERO ================= */}

          <div className="terms-hero text-center">

            <div className="terms-hero-icon">
              <FaFileContract />
            </div>

            <h1>Terms & Conditions</h1>

            <p>
              Please read these terms carefully before using PHP LMS.
            </p>

            <small>
              Last updated: {new Date().toLocaleDateString()}
            </small>

          </div>


          {/* ================= INTRODUCTION ================= */}

          <div className="terms-card">

            <h3>
              <FaFileContract />
              Introduction
            </h3>

            <p>
              Welcome to PHP LMS. These Terms & Conditions explain
              the rules and guidelines for using our Learning
              Management System.
            </p>

            <p>
              By accessing or using PHP LMS, you agree to follow
              these Terms & Conditions. If you do not agree with
              these terms, please do not use the platform.
            </p>

          </div>


          {/* ================= ACCOUNT ================= */}

          <div className="terms-card">

            <h3>
              <FaUserCheck />
              User Accounts
            </h3>

            <p>
              Users are responsible for providing accurate
              information when creating an account.
            </p>

            <ul>
              <li>
                Keep your account information accurate and updated.
              </li>

              <li>
                Keep your login credentials private and secure.
              </li>

              <li>
                Do not share your account or password with other
                users.
              </li>

              <li>
                Notify the administrator if you believe your account
                has been accessed without permission.
              </li>
            </ul>

          </div>


          {/* ================= STUDENT ================= */}

          <div className="terms-card">

            <h3>
              <FaGraduationCap />
              Student Responsibilities
            </h3>

            <p>
              Students are expected to use PHP LMS responsibly and
              for educational purposes.
            </p>

            <ul>
              <li>
                Use the platform for legitimate learning activities.
              </li>

              <li>
                Do not misuse course materials or other users'
                information.
              </li>

              <li>
                Do not attempt to access restricted areas of the
                platform.
              </li>

              <li>
                Respect teachers, administrators and other students.
              </li>
            </ul>

          </div>


          {/* ================= TEACHER ================= */}

          <div className="terms-card">

            <h3>
              <FaChalkboardTeacher />
              Teacher Responsibilities
            </h3>

            <p>
              Teachers are responsible for providing appropriate
              educational content through the LMS.
            </p>

            <ul>
              <li>
                Provide accurate and useful course information.
              </li>

              <li>
                Upload content that is appropriate for educational
                use.
              </li>

              <li>
                Respect student privacy and account information.
              </li>

              <li>
                Do not misuse administrative or platform
                privileges.
              </li>
            </ul>

          </div>


          {/* ================= COURSE CONTENT ================= */}

          <div className="terms-card">

            <h3>
              <FaGraduationCap />
              Course Content
            </h3>

            <p>
              Course materials available on PHP LMS may include
              lessons, documents, videos, quizzes and other
              educational resources.
            </p>

            <p>
              Users should not copy, distribute, modify or
              reproduce protected course content without proper
              permission.
            </p>

          </div>


          {/* ================= ACCEPTABLE USE ================= */}

          <div className="terms-card">

            <h3>
              <FaLock />
              Acceptable Use
            </h3>

            <p>
              Users must not use PHP LMS for activities that may
              harm the platform, its users or its services.
            </p>

            <ul>
              <li>
                Do not attempt unauthorized access to the system.
              </li>

              <li>
                Do not upload malicious files or harmful software.
              </li>

              <li>
                Do not interfere with the normal operation of the
                LMS.
              </li>

              <li>
                Do not use the platform for illegal activities.
              </li>
            </ul>

          </div>


          {/* ================= SECURITY ================= */}

          <div className="terms-card">

            <h3>
              <FaLock />
              Account Security
            </h3>

            <p>
              Users are responsible for maintaining the security of
              their account credentials.
            </p>

            <p>
              PHP LMS administrators may take appropriate action
              when suspicious activity, unauthorized access or
              misuse of an account is detected.
            </p>

          </div>


          {/* ================= SUSPENSION ================= */}

          <div className="terms-card">

            <h3>
              <FaExclamationTriangle />
              Account Suspension
            </h3>

            <p>
              An account may be restricted, suspended or disabled
              if a user violates these Terms & Conditions or
              misuses the LMS.
            </p>

            <p>
              The administrator may review the situation and take
              appropriate action based on the circumstances.
            </p>

          </div>


          {/* ================= AVAILABILITY ================= */}

          <div className="terms-card">

            <h3>
              <FaFileContract />
              Service Availability
            </h3>

            <p>
              We aim to keep PHP LMS available and functional.
              However, temporary interruptions may occur because
              of maintenance, technical problems or other
              unforeseen circumstances.
            </p>

          </div>


          {/* ================= CHANGES ================= */}

          <div className="terms-card">

            <h3>
              <FaFileContract />
              Changes to These Terms
            </h3>

            <p>
              These Terms & Conditions may be updated from time to
              time to reflect changes in the LMS, its features or
              applicable requirements.
            </p>

            <p>
              Updated terms will be made available on this page.
            </p>

          </div>


          {/* ================= CONTACT ================= */}

          <div className="terms-contact">

            <div className="terms-contact-icon">
              <FaEnvelope />
            </div>

            <div>

              <h4>
                Questions About These Terms?
              </h4>

              <p>
                If you have any questions regarding these Terms &
                Conditions, please contact the LMS support team.
              </p>

              <strong>
                support@phplms.com
              </strong>

            </div>

          </div>


          {/* ================= BOTTOM BACK ================= */}

          <div className="text-center mt-4">

            <button
              type="button"
              className="terms-back-btn"
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

export default TermsConditions;

