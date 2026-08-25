
import React, { useState } from 'react';

import {
    FaSearch,
    FaUserCircle,
    FaBook,
    FaGraduationCap,
    FaChalkboardTeacher,
    FaLock,
    FaEnvelope,
    FaArrowLeft,
    FaChevronDown,
    FaQuestionCircle
} from 'react-icons/fa';

import { useNavigate } from 'react-router-dom';

import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

const HelpCenter = () => {

    const navigate = useNavigate();

    const [search, setSearch] = useState('');
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [openFaq, setOpenFaq] = useState(null);

    const helpTopics = [

        {
            id: 'account',

            icon: <FaUserCircle />,

            title: 'Account & Profile',

            description:
                'Manage your account, profile information and password.',

            faqs: [

                {
                    question: 'How can I update my profile?',

                    answer:
                        'Open your profile page from the sidebar and update your required information.'
                },

                {
                    question: 'How can I change my password?',

                    answer:
                        'Go to Change Password from your panel and enter your current and new password.'
                },

                {
                    question: 'How can I update my profile picture?',

                    answer:
                        'Open your Profile page and upload a new profile picture from the profile section.'
                }

            ]
        },


        {
            id: 'courses',

            icon: <FaBook />,

            title: 'Courses',

            description:
                'Find courses, explore content and manage your courses.',

            faqs: [

                {
                    question: 'How can I find a course?',

                    answer:
                        'Go to the Courses section to browse and explore available courses.'
                },

                {
                    question: 'How can I view course details?',

                    answer:
                        'Click on any course to open its details, description and other information.'
                },

                {
                    question: 'How can teachers manage courses?',

                    answer:
                        'Teachers can create, edit and manage their courses from the Teacher Panel.'
                }

            ]
        },


        {
            id: 'learning',

            icon: <FaGraduationCap />,

            title: 'Learning',

            description:
                'Get help with lessons, enrolled courses and learning.',

            faqs: [

                {
                    question: 'Where can I find my courses?',

                    answer:
                        'Students can find their enrolled courses inside the My Courses section.'
                },

                {
                    question: 'How can I start learning?',

                    answer:
                        'Open My Courses and select a course to start learning its lessons.'
                },

                {
                    question: 'Can I continue a course later?',

                    answer:
                        'Yes. You can return to your enrolled course and continue learning from where you stopped.'
                }

            ]
        },


        {
            id: 'teacher',

            icon: <FaChalkboardTeacher />,

            title: 'Teacher Panel',

            description:
                'Learn how teachers can create and manage course content.',

            faqs: [

                {
                    question: 'How can I create a course?',

                    answer:
                        'Open My Courses from the Teacher Panel and select Create Course.'
                },

                {
                    question: 'How can I edit a course?',

                    answer:
                        'Open your course and use the Edit option to update its information.'
                },

                {
                    question: 'How can I manage course content?',

                    answer:
                        'Use the course content section to manage chapters, lessons and learning materials.'
                }

            ]
        },


        {
            id: 'security',

            icon: <FaLock />,

            title: 'Security',

            description:
                'Keep your LMS account safe and secure.',

            faqs: [

                {
                    question: 'How can I keep my account secure?',

                    answer:
                        'Use a strong password and never share your login credentials with anyone.'
                },

                {
                    question: 'What should I do if I forget my password?',

                    answer:
                        'Use the available password recovery option or contact the LMS administrator for assistance.'
                },

                {
                    question: 'Should I log out on shared computers?',

                    answer:
                        'Yes. Always log out after using your account on a shared or public computer.'
                }

            ]
        },


        {
            id: 'contact',

            icon: <FaEnvelope />,

            title: 'Contact Support',

            description:
                'Need more help? Find out how to contact support.',

            faqs: [

                {
                    question: 'How can I contact support?',

                    answer:
                        'You can contact the LMS support team using the contact information provided in the footer.'
                },

                {
                    question: 'What information should I provide?',

                    answer:
                        'Describe your problem clearly and include relevant details such as your account role and the page where the problem occurred.'
                },

                {
                    question: 'How quickly will I get a response?',

                    answer:
                        'Support response time may vary depending on the issue and availability of the support team.'
                }

            ]
        }

    ];


    const filteredTopics = helpTopics.filter((topic) => {

        const value = search.toLowerCase().trim();

        return (
            topic.title.toLowerCase().includes(value) ||
            topic.description.toLowerCase().includes(value)
        );

    });


    const currentTopic = helpTopics.find(
        (topic) => topic.id === selectedTopic
    );


    const handleTopicClick = (id) => {

        setSelectedTopic(id);

        setOpenFaq(null);

        setSearch('');

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

    };


    const handleBack = () => {

        setSelectedTopic(null);

        setOpenFaq(null);

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

    };


    return (

        <div className="d-flex flex-column min-vh-100">

            {/* =================================
                HEADER
            ================================= */}

            <Header />


            
            <main className="help-center-page flex-grow-1">

                <div className="container py-5">


                    <button
                        type="button"
                        className="help-back-btn"
                        onClick={() => navigate(-1)}
                    >

                        <FaArrowLeft />

                        <span>
                            Back
                        </span>

                    </button>


                    {currentTopic ? (

                        <>

                            {/* Back to Help Center */}

                            <button
                                type="button"
                                className="help-back-btn"
                                onClick={handleBack}
                            >

                                <FaArrowLeft />

                                <span>
                                    Back to Help Center
                                </span>

                            </button>


                            {/* Topic Header */}

                            <div className="help-topic-hero">

                                <div className="help-topic-icon">

                                    {currentTopic.icon}

                                </div>


                                <div>

                                    <h1>
                                        {currentTopic.title}
                                    </h1>

                                    <p>
                                        {currentTopic.description}
                                    </p>

                                </div>

                            </div>


                            {/* FAQ */}

                            <div className="help-faq-list">

                                {currentTopic.faqs.map(
                                    (faq, index) => {

                                        const isOpen =
                                            openFaq === index;

                                        return (

                                            <div
                                                className={`help-faq ${
                                                    isOpen
                                                        ? 'open'
                                                        : ''
                                                }`}
                                                key={index}
                                            >

                                                <button
                                                    type="button"
                                                    className="help-faq-question"
                                                    onClick={() =>
                                                        setOpenFaq(
                                                            isOpen
                                                                ? null
                                                                : index
                                                        )
                                                    }
                                                >

                                                    <span>
                                                        {faq.question}
                                                    </span>


                                                    <FaChevronDown
                                                        className={
                                                            isOpen
                                                                ? 'rotate'
                                                                : ''
                                                        }
                                                    />

                                                </button>


                                                {isOpen && (

                                                    <div className="help-faq-answer">

                                                        {faq.answer}

                                                    </div>

                                                )}

                                            </div>

                                        );

                                    }
                                )}

                            </div>

                        </>

                    ) : (


                        <>

                            {/* Hero */}

                            <div className="help-hero">

                                <div className="help-hero-icon">

                                    <FaQuestionCircle />

                                </div>


                                <h1>
                                    How can we help you?
                                </h1>


                                <p>
                                    Find answers, guides and helpful
                                    information about PHP LMS.
                                </p>


                                {/* Search */}

                                <div className="help-search">

                                    <FaSearch />

                                    <input
                                        type="text"
                                        placeholder="Search for help..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                    />

                                </div>

                            </div>


                            {/* Section Heading */}

                            <div className="help-section-heading">

                                <div>

                                    <span>
                                        HELP CENTER
                                    </span>

                                    <h2>
                                        What do you need help with?
                                    </h2>

                                </div>


                                <p>
                                    Choose a topic to find quick answers.
                                </p>

                            </div>


                            {/* Help Cards */}

                            <div className="row g-4">

                                {filteredTopics.length > 0 ? (

                                    filteredTopics.map((topic) => (

                                        <div
                                            className="col-md-6 col-lg-4"
                                            key={topic.id}
                                        >

                                            <button
                                                type="button"
                                                className="help-topic-card"
                                                onClick={() =>
                                                    handleTopicClick(
                                                        topic.id
                                                    )
                                                }
                                            >

                                                <div className="help-card-icon">

                                                    {topic.icon}

                                                </div>


                                                <div className="help-card-content">

                                                    <h5>
                                                        {topic.title}
                                                    </h5>


                                                    <p>
                                                        {topic.description}
                                                    </p>


                                                    <span>

                                                        View Help

                                                        <span className="help-arrow">
                                                            →
                                                        </span>

                                                    </span>

                                                </div>

                                            </button>

                                        </div>

                                    ))

                                ) : (

                                    <div className="col-12">

                                        <div className="help-no-result">

                                            <FaSearch />

                                            <h4>
                                                No help topics found
                                            </h4>

                                            <p>
                                                Try searching with a
                                                different keyword.
                                            </p>

                                        </div>

                                    </div>

                                )}

                            </div>


                            {/* Support Box */}

                            <div className="help-support-box">

                                <div className="help-support-icon">

                                    <FaEnvelope />

                                </div>


                                <div>

                                    <h4>
                                        Still need help?
                                    </h4>

                                    <p>
                                        Can't find what you're looking
                                        for? Contact our support team
                                        for assistance.
                                    </p>

                                </div>

                            </div>

                        </>

                    )}

                </div>

            </main>



            <Footer />

        </div>

    );

};


export default HelpCenter;

