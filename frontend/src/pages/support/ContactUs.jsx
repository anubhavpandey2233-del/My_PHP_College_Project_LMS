
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  FaArrowLeft,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaUser,
  FaCommentAlt
} from 'react-icons/fa';

import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import api from '../../services/api';

const ContactUs = () => {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setSaving(true);
    setError('');

    try {

      const response = await api.post(
        '/contact/submit.php',
        formData
      );

      if (response.data.status) {

        alert(
          'Thank you! Your message has been submitted successfully.'
        );

        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });

      } else {

        setError(
          response.data.message ||
          'Failed to submit your message'
        );

      }

    } catch (err) {

      console.error(
        'Contact Submit Error:',
        err
      );

      setError(
        err.response?.data?.message ||
        'Failed to submit your message'
      );

    } finally {

      setSaving(false);

    }

  };

  return (
    <div className="d-flex flex-column min-vh-100">

      <Header />

      <main className="contact-page flex-grow-1">

        <div className="container py-5">

          <button
            type="button"
            className="contact-back-btn"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>

          <div className="contact-hero text-center">

            <div className="contact-hero-icon">
              <FaEnvelope />
            </div>

            <h1>Contact Us</h1>

            <p>
              Have a question or need help? We are here to help you.
            </p>

          </div>

          <div className="row g-4">

            <div className="col-lg-5">

              <div className="contact-info-card">

                <h3>Get in Touch</h3>

                <p className="contact-info-intro">
                  If you have any questions, feedback or issues
                  with PHP LMS, feel free to contact our support team.
                </p>

                <a
                  href="mailto:support@phplms.com"
                  className="contact-info-item"
                >
                  <div className="contact-info-icon">
                    <FaEnvelope />
                  </div>

                  <div>
                    <span>Email</span>
                    <strong>support@phplms.com</strong>
                  </div>
                </a>

                <a
                  href="tel:+919876543210"
                  className="contact-info-item"
                >
                  <div className="contact-info-icon">
                    <FaPhone />
                  </div>

                  <div>
                    <span>Phone</span>
                    <strong>+91 98765 43210</strong>
                  </div>
                </a>

                <div className="contact-info-item">

                  <div className="contact-info-icon">
                    <FaMapMarkerAlt />
                  </div>

                  <div>
                    <span>Location</span>
                    <strong>Gujarat, India</strong>
                  </div>

                </div>

                <div className="contact-support-note">

                  <FaCommentAlt />

                  <div>
                    <strong>Need quick help?</strong>

                    <p>
                      Visit our Help Center to find answers
                      to common questions.
                    </p>
                  </div>

                </div>

              </div>

            </div>

            <div className="col-lg-7">

              <div className="contact-form-card">

                <div className="contact-form-heading">

                  <div className="contact-form-icon">
                    <FaPaperPlane />
                  </div>

                  <div>
                    <h3>Send Us a Message</h3>

                    <p>
                      Fill out the form and we'll get back to you.
                    </p>
                  </div>

                </div>

                {error && (
                  <div className="alert alert-danger">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>

                  <div className="mb-3">

                    <label className="contact-label">
                      <FaUser />
                      Your Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      className="form-control contact-input"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />

                  </div>

                  <div className="mb-3">

                    <label className="contact-label">
                      <FaEnvelope />
                      Email Address
                    </label>

                    <input
                      type="email"
                      name="email"
                      className="form-control contact-input"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />

                  </div>

                  <div className="mb-3">

                    <label className="contact-label">
                      <FaCommentAlt />
                      Subject
                    </label>

                    <input
                      type="text"
                      name="subject"
                      className="form-control contact-input"
                      placeholder="What can we help you with?"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />

                  </div>

                  <div className="mb-4">

                    <label className="contact-label">
                      <FaCommentAlt />
                      Message
                    </label>

                    <textarea
                      name="message"
                      rows="5"
                      className="form-control contact-input"
                      placeholder="Write your message here..."
                      value={formData.message}
                      onChange={handleChange}
                      required
                    ></textarea>

                  </div>

                  <button
                    type="submit"
                    className="contact-submit-btn"
                    disabled={saving}
                  >

                    {saving ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane />
                        Send Message
                      </>
                    )}

                  </button>

                </form>

              </div>

            </div>

          </div>

        </div>

      </main>

      <Footer />

    </div>
  );
};

export default ContactUs;

