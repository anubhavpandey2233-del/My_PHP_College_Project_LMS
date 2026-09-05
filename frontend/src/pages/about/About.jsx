import React from 'react';
import { Link } from 'react-router-dom';
import {
    FaBookOpen,
    FaGraduationCap,
    FaChalkboardTeacher,
    FaLaptopCode,
    FaUsers,
    FaArrowRight
} from 'react-icons/fa';

import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

import './About.scss';

function About() {
    return (
        <>
            <Header />

            <main className="about-page">

                {/* Hero Section */}
                <section className="about-hero">
                    <div className="about-container">
                        <div className="about-hero-content">
                            <span className="about-badge">
                                Learn. Grow. Succeed.
                            </span>

                            <h1>
                                Empowering Learning,
                                <span> Building Futures</span>
                            </h1>

                            <p>
                                Our Learning Management System helps students
                                learn new skills, explore courses and build
                                a better future through flexible online learning.
                            </p>

                            <Link to="/courses" className="about-hero-button">
                                Explore Courses
                                <FaArrowRight />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section className="about-intro">
                    <div className="about-container about-intro-grid">

                        <div className="about-intro-content">
                            <span className="about-section-label">
                                About Our LMS
                            </span>

                            <h2>
                                Learning Made Simple and Accessible
                            </h2>

                            <p>
                                Our LMS is designed to provide students with
                                an easy and engaging way to learn online.
                                Students can discover courses, learn at their
                                own pace and track their learning progress
                                from one place.
                            </p>

                            <p>
                                Teachers can create and manage courses,
                                chapters, lessons and learning resources,
                                making it easier to share knowledge with
                                students.
                            </p>
                        </div>

                        <div className="about-intro-cards">
                            <div className="about-info-card">
                                <FaBookOpen />
                                <h3>Quality Courses</h3>
                                <p>
                                    Learn from structured and engaging courses.
                                </p>
                            </div>

                            <div className="about-info-card">
                                <FaLaptopCode />
                                <h3>Online Learning</h3>
                                <p>
                                    Learn anytime and from anywhere.
                                </p>
                            </div>
                        </div>

                    </div>
                </section>

                {/* Mission Section */}
                <section className="about-mission">
                    <div className="about-container about-mission-grid">

                        <div className="about-mission-card">
                            <FaGraduationCap />
                            <h3>Our Mission</h3>
                            <p>
                                Our mission is to make quality education
                                accessible, simple and convenient for every
                                learner.
                            </p>
                        </div>

                        <div className="about-mission-card">
                            <FaUsers />
                            <h3>Our Vision</h3>
                            <p>
                                We aim to create a learning environment where
                                students can develop skills and confidently
                                achieve their career goals.
                            </p>
                        </div>

                    </div>
                </section>

                {/* Why Choose Us */}
                <section className="about-features">
                    <div className="about-container">

                        <div className="about-section-heading">
                            <span className="about-section-label">
                                Why Choose Us
                            </span>

                            <h2>
                                Everything You Need to Learn Better
                            </h2>

                            <p>
                                A simple and powerful learning experience
                                designed for students and teachers.
                            </p>
                        </div>

                        <div className="about-feature-grid">

                            <div className="about-feature-card">
                                <div className="about-feature-icon">
                                    <FaBookOpen />
                                </div>

                                <h3>Wide Range of Courses</h3>

                                <p>
                                    Explore courses from different categories
                                    and discover new skills.
                                </p>
                            </div>

                            <div className="about-feature-card">
                                <div className="about-feature-icon">
                                    <FaChalkboardTeacher />
                                </div>

                                <h3>Expert Teachers</h3>

                                <p>
                                    Learn through well-structured courses
                                    created by teachers.
                                </p>
                            </div>

                            <div className="about-feature-card">
                                <div className="about-feature-icon">
                                    <FaLaptopCode />
                                </div>

                                <h3>Learn Anywhere</h3>

                                <p>
                                    Access your courses online and learn
                                    according to your own schedule.
                                </p>
                            </div>

                            <div className="about-feature-card">
                                <div className="about-feature-icon">
                                    <FaGraduationCap />
                                </div>

                                <h3>Track Your Progress</h3>

                                <p>
                                    Keep track of your learning journey and
                                    continue improving your skills.
                                </p>
                            </div>

                        </div>

                    </div>
                </section>

                {/* Stats */}
                <section className="about-stats">
                    <div className="about-container">

                        <div className="about-stats-grid">

                            <div className="about-stat">
                                <FaBookOpen />
                                <strong>100+</strong>
                                <span>Courses</span>
                            </div>

                            <div className="about-stat">
                                <FaUsers />
                                <strong>500+</strong>
                                <span>Students</span>
                            </div>

                            <div className="about-stat">
                                <FaChalkboardTeacher />
                                <strong>50+</strong>
                                <span>Teachers</span>
                            </div>

                            <div className="about-stat">
                                <FaGraduationCap />
                                <strong>20+</strong>
                                <span>Categories</span>
                            </div>

                        </div>

                    </div>
                </section>

                {/* CTA */}
                <section className="about-cta">
                    <div className="about-container">

                        <div className="about-cta-content">
                            <h2>
                                Ready to Start Learning?
                            </h2>

                            <p>
                                Explore our courses and take the next step
                                towards your learning goals.
                            </p>

                            <Link to="/courses" className="about-cta-button">
                                Start Learning
                                <FaArrowRight />
                            </Link>
                        </div>

                    </div>
                </section>

            </main>

            <Footer />
        </>
    );
}

export default About;