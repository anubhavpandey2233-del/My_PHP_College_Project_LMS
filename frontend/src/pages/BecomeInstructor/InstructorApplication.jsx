import { useState } from 'react';

import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';


const InstructorApplication = () => {

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        qualification: '',
        experience: '',
        expertise: '',
        reason: '',
        bio: ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');


    // ==========================================
    // HANDLE CHANGE
    // ==========================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

    };


    // ==========================================
    // SUBMIT APPLICATION
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);
        setMessage('');
        setMessageType('');


        try {

            const token =
                localStorage.getItem('token');


            const response = await fetch(
                'http://localhost/php-lms-project/backend/api/instructor/apply.php',
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json',
                        ...(token
                            ? {
                                'Authorization':
                                    `Bearer ${token}`
                            }
                            : {})
                    },

                    body: JSON.stringify(formData)
                }
            );


            const data =
                await response.json();


            if (!response.ok || !data.status) {

                throw new Error(
                    data.message ||
                    'Something went wrong'
                );

            }


            setMessage(
                'Your instructor application has been submitted successfully. Please wait for admin approval.'
            );

            setMessageType('success');


            setFormData({
                name: '',
                email: '',
                qualification: '',
                experience: '',
                expertise: '',
                reason: '',
                bio: ''
            });


        } catch (error) {

            console.error(
                'Instructor Application Error:',
                error
            );


            setMessage(
                error.message ||
                'Unable to submit your application.'
            );

            setMessageType('danger');


        } finally {

            setLoading(false);

        }

    };


    return (

        <div className="d-flex flex-column min-vh-100">

            <Header />


            <main className="flex-grow-1 bg-light py-5">

                <div className="container">

                    <div className="row justify-content-center">

                        <div className="col-lg-8">

                            <div className="card border-0 shadow-sm">

                                <div className="card-body p-4 p-md-5">


                                    {/* ==================================
                                        HEADER
                                    ================================== */}

                                    <div className="text-center mb-4">

                                        <div className="fs-1 mb-2">
                                            👨‍🏫
                                        </div>

                                        <h2 className="fw-bold">
                                            Become an Instructor
                                        </h2>

                                        <p className="text-muted">
                                            Submit your details to apply as
                                            an instructor.
                                        </p>

                                    </div>


                                    {/* ==================================
                                        MESSAGE
                                    ================================== */}

                                    {message && (

                                        <div
                                            className={
                                                `alert alert-${messageType}`
                                            }
                                        >
                                            {message}
                                        </div>

                                    )}


                                    {/* ==================================
                                        FORM
                                    ================================== */}

                                    <form onSubmit={handleSubmit}>


                                        {/* NAME */}

                                        <div className="mb-3">

                                            <label className="form-label fw-semibold">
                                                Full Name
                                            </label>

                                            <input
                                                type="text"
                                                name="name"
                                                className="form-control"
                                                placeholder="Enter your full name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                            />

                                        </div>


                                        {/* EMAIL */}

                                        <div className="mb-3">

                                            <label className="form-label fw-semibold">
                                                Email Address
                                            </label>

                                            <input
                                                type="email"
                                                name="email"
                                                className="form-control"
                                                placeholder="Enter your email address"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                            />

                                        </div>


                                        {/* QUALIFICATION */}

                                        <div className="mb-3">

                                            <label className="form-label fw-semibold">
                                                Highest Qualification
                                            </label>

                                            <input
                                                type="text"
                                                name="qualification"
                                                className="form-control"
                                                placeholder="e.g. MCA, B.Tech, M.Sc"
                                                value={formData.qualification}
                                                onChange={handleChange}
                                                required
                                            />

                                        </div>


                                        {/* EXPERIENCE */}

                                        <div className="mb-3">

                                            <label className="form-label fw-semibold">
                                                Teaching Experience
                                            </label>

                                            <input
                                                type="text"
                                                name="experience"
                                                className="form-control"
                                                placeholder="e.g. 2 years"
                                                value={formData.experience}
                                                onChange={handleChange}
                                                required
                                            />

                                        </div>


                                        {/* EXPERTISE */}

                                        <div className="mb-3">

                                            <label className="form-label fw-semibold">
                                                Area of Expertise
                                            </label>

                                            <input
                                                type="text"
                                                name="expertise"
                                                className="form-control"
                                                placeholder="e.g. PHP, Laravel, React"
                                                value={formData.expertise}
                                                onChange={handleChange}
                                                required
                                            />

                                        </div>


                                        {/* REASON */}

                                        <div className="mb-3">

                                            <label className="form-label fw-semibold">
                                                Why do you want to become an instructor?
                                            </label>

                                            <textarea
                                                name="reason"
                                                className="form-control"
                                                rows="4"
                                                placeholder="Tell us why you want to teach..."
                                                value={formData.reason}
                                                onChange={handleChange}
                                                required
                                            />

                                        </div>


                                        {/* BIO */}

                                        <div className="mb-4">

                                            <label className="form-label fw-semibold">
                                                About Yourself
                                            </label>

                                            <textarea
                                                name="bio"
                                                className="form-control"
                                                rows="5"
                                                placeholder="Tell us about yourself..."
                                                value={formData.bio}
                                                onChange={handleChange}
                                            />

                                        </div>


                                        {/* SUBMIT */}

                                        <div className="text-center">

                                            <button
                                                type="submit"
                                                className="btn btn-primary px-5 py-2"
                                                disabled={loading}
                                            >

                                                {loading
                                                    ? 'Submitting...'
                                                    : 'Submit Application'}

                                            </button>

                                        </div>

                                    </form>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </main>


            <Footer />

        </div>

    );

};


export default InstructorApplication;