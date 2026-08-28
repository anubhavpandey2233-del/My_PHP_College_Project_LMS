
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import api from '../../services/api';

import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

import { useAuth } from '../../context/AuthContext';

import Loading from '../../components/common/Loading';


const CourseDetails = () => {

    const { slug } = useParams();

    const { isAuthenticated } = useAuth();

    const navigate = useNavigate();


    // =====================================
    // COURSE
    // =====================================

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);


    // =====================================
    // ENROLLMENT
    // =====================================

    const [enrolling, setEnrolling] = useState(false);
    const [message, setMessage] = useState('');


    // =====================================
    // REVIEWS
    // =====================================

    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);


    // =====================================
    // FETCH COURSE
    // =====================================

    useEffect(() => {

        const fetchCourse = async () => {

            try {

                setLoading(true);

                const res = await api.get(
                    `/courses/get.php?slug=${encodeURIComponent(slug)}`
                );

                console.log('COURSE DETAILS API:', res.data);

                if (res.data.status) {

                    setCourse(
                        res.data.data?.course ||
                        res.data.data
                    );

                } else {

                    setCourse(null);

                }

            } catch (error) {

                console.error(
                    'Course details error:',
                    error
                );

                setCourse(null);

            } finally {

                setLoading(false);

            }

        };

        if (slug) {
            fetchCourse();
        }

    }, [slug]);


    // =====================================
    // FETCH APPROVED REVIEWS
    // =====================================

    useEffect(() => {

        if (!course?.id) {
            return;
        }

        const fetchReviews = async () => {

            try {

                setReviewsLoading(true);

                const res = await api.get(
                    `/reviews/list-approved.php?course_id=${course.id}`
                );

                console.log(
                    'APPROVED REVIEWS API:',
                    res.data
                );

                if (res.data.status) {

                    const reviewData =
                        Array.isArray(res.data.data)
                            ? res.data.data
                            : res.data.data?.reviews || [];

                    setReviews(reviewData);

                } else {

                    setReviews([]);

                }

            } catch (error) {

                console.error(
                    'Reviews Error:',
                    error
                );

                setReviews([]);

            } finally {

                setReviewsLoading(false);

            }

        };

        fetchReviews();

    }, [course?.id]);


    // =====================================
    // COURSE THUMBNAIL URL
    // =====================================

    const getThumbnailUrl = (thumbnail) => {

        if (!thumbnail) {
            return null;
        }

        const value = String(thumbnail).trim();

        if (!value) {
            return null;
        }


        // Already complete URL

        if (
            value.startsWith('http://') ||
            value.startsWith('https://')
        ) {

            return value;

        }


        // API already returned:
        // /php-lms-project/backend/uploads/courses/file.jpg

        if (
            value.startsWith(
                '/php-lms-project/backend/uploads/courses/'
            )
        ) {

            return `http://localhost${value}`;

        }


        // /uploads/courses/file.jpg

        if (
            value.startsWith('/uploads/courses/')
        ) {

            return `http://localhost/php-lms-project/backend${value}`;

        }


        // uploads/courses/file.jpg

        if (
            value.startsWith('uploads/courses/')
        ) {

            return `http://localhost/php-lms-project/backend/${value}`;

        }


        // Normal filename

        return `http://localhost/php-lms-project/backend/uploads/courses/${value}`;

    };


    // =====================================
    // STUDENT AVATAR URL
    // =====================================

    const getAvatarUrl = (avatar) => {

        if (!avatar) {
            return null;
        }

        const value = String(avatar).trim();

        if (!value) {
            return null;
        }


        if (
            value.startsWith('http://') ||
            value.startsWith('https://')
        ) {

            return value;

        }


        if (
            value.startsWith(
                '/php-lms-project/backend/uploads/avatars/'
            )
        ) {

            return `http://localhost${value}`;

        }


        if (
            value.startsWith('/uploads/avatars/')
        ) {

            return `http://localhost/php-lms-project/backend${value}`;

        }


        if (
            value.startsWith('uploads/avatars/')
        ) {

            return `http://localhost/php-lms-project/backend/${value}`;

        }


        return `http://localhost/php-lms-project/backend/uploads/avatars/${value}`;

    };


    // =====================================
    // COURSE IMAGE ERROR
    // =====================================

    const handleImageError = (e) => {

        e.currentTarget.style.display = 'none';

        const fallback =
            e.currentTarget.parentElement.querySelector(
                '.thumbnail-fallback'
            );

        if (fallback) {

            fallback.style.display = 'flex';

        }

    };


    // =====================================
    // AVATAR ERROR
    // =====================================

    const handleAvatarError = (e) => {

        e.currentTarget.style.display = 'none';

        const fallback =
            e.currentTarget.parentElement.querySelector(
                '.avatar-fallback'
            );

        if (fallback) {

            fallback.style.display = 'flex';

        }

    };


    // =====================================
    // ENROLL
    // =====================================

    const handleEnroll = async () => {

        if (!isAuthenticated) {

            navigate('/login');

            return;

        }

        setEnrolling(true);

        setMessage('');

        try {

            const res = await api.post(
                '/student/enroll.php',
                {
                    course_id: course.id
                }
            );

            if (res.data.status) {

                setMessage(
                    'Successfully enrolled!'
                );

                setTimeout(() => {

                    navigate(
                        `/student/learn/${course.id}`
                    );

                }, 1000);

            } else {

                setMessage(
                    res.data.message ||
                    'Enrollment failed'
                );

            }

        } catch (err) {

            setMessage(
                err.response?.data?.message ||
                'Enrollment failed'
            );

        } finally {

            setEnrolling(false);

        }

    };


    // =====================================
    // BACK BUTTON
    // =====================================

    const handleBack = () => {

        navigate(-1);

    };


    // =====================================
    // RENDER STARS
    // =====================================

    const renderStars = (rating) => {

        const value = Math.max(
            0,
            Math.min(
                5,
                Math.round(Number(rating) || 0)
            )
        );

        return (

            <span
                style={{
                    color: '#ffc107',
                    fontSize: '18px',
                    whiteSpace: 'nowrap'
                }}
            >

                {'★'.repeat(value)}

                {'☆'.repeat(5 - value)}

            </span>

        );

    };


    // =====================================
    // FORMAT DATE
    // =====================================

    const formatReviewDate = (date) => {

        if (!date) {
            return '';
        }

        const formattedDate =
            new Date(date);

        if (
            Number.isNaN(
                formattedDate.getTime()
            )
        ) {

            return date;

        }

        return formattedDate.toLocaleDateString(
            'en-IN',
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }
        );

    };


    // =====================================
    // LOADING
    // =====================================

    if (loading) {

        return (

            <div className="d-flex flex-column min-vh-100">

                <Header />

                <div className="flex-grow-1">

                    <Loading />

                </div>

                <Footer />

            </div>

        );

    }


    // =====================================
    // COURSE NOT FOUND
    // =====================================

    if (!course) {

        return (

            <div className="d-flex flex-column min-vh-100">

                <Header />

                <div className="container my-5 flex-grow-1">

                    <button
                        type="button"
                        className="btn btn-outline-secondary mb-4"
                        onClick={handleBack}
                    >
                        ← Back
                    </button>

                    <div className="alert alert-danger">

                        Course not found.

                    </div>

                </div>

                <Footer />

            </div>

        );

    }


    // =====================================
    // COURSE DATA
    // =====================================

    const thumbnailUrl =
        course.thumbnail_url ||
        getThumbnailUrl(
            course.thumbnail
        );


    const originalPrice =
        Number(course.price || 0);


    const discountAmount =
        Number(course.discount_price || 0);


    const finalPrice =
        discountAmount > 0
            ? Math.max(
                0,
                originalPrice - discountAmount
            )
            : originalPrice;


    // =====================================
    // PAGE
    // =====================================

    return (

        <div className="d-flex flex-column min-vh-100">

            <Header />


            <div className="container my-5 flex-grow-1">


                {/* =====================================
                    BACK BUTTON
                ===================================== */}

                <div className="mb-4">

                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={handleBack}
                    >
                        ← Back
                    </button>

                </div>


                <div className="row">


                    {/* =================================
                        LEFT SIDE
                    ================================= */}

                    <div className="col-lg-8">


                        {/* COURSE IMAGE */}

                        <div
                            className="position-relative bg-light rounded mb-4 overflow-hidden"
                            style={{
                                height: '300px'
                            }}
                        >

                            {thumbnailUrl ? (

                                <img
                                    src={thumbnailUrl}
                                    alt={
                                        course.title ||
                                        'Course'
                                    }
                                    className="w-100 h-100"
                                    style={{
                                        objectFit: 'cover',
                                        display: 'block'
                                    }}
                                    onError={
                                        handleImageError
                                    }
                                />

                            ) : null}


                            <div
                                className="thumbnail-fallback w-100 h-100 bg-secondary align-items-center justify-content-center"
                                style={{
                                    display:
                                        thumbnailUrl
                                            ? 'none'
                                            : 'flex'
                                }}
                            >

                                <h3 className="text-white text-center px-3">

                                    {
                                        course.title ||
                                        'Course'
                                    }

                                </h3>

                            </div>

                        </div>


                        {/* COURSE TITLE */}

                        <h1>
                            {course.title}
                        </h1>


                        <p className="text-muted">

                            By {course.teacher_name || 'Instructor'}

                            {' • '}

                            {course.level || '-'}

                            {' • '}

                            {course.language || '-'}

                        </p>


                        {/* DESCRIPTION */}

                        <div className="mb-4">

                            {course.description
                                ?.split('\n')
                                .map((p, i) => (

                                    <p key={i}>
                                        {p}
                                    </p>

                                ))}

                        </div>


                        {/* REQUIREMENTS */}

                        {course.requirements?.length > 0 && (

                            <>

                                <h4>
                                    Requirements
                                </h4>

                                <ul>

                                    {course.requirements.map(
                                        (requirement) => (

                                            <li
                                                key={
                                                    requirement.id
                                                }
                                            >

                                                {
                                                    requirement.requirement
                                                }

                                            </li>

                                        )
                                    )}

                                </ul>

                            </>

                        )}


                        {/* OUTCOMES */}

                        {course.outcomes?.length > 0 && (

                            <>

                                <h4>
                                    What you'll learn
                                </h4>

                                <ul>

                                    {course.outcomes.map(
                                        (outcome) => (

                                            <li
                                                key={
                                                    outcome.id
                                                }
                                            >

                                                {
                                                    outcome.outcome
                                                }

                                            </li>

                                        )
                                    )}

                                </ul>

                            </>

                        )}


                        {/* =================================
                            STUDENT REVIEWS
                        ================================= */}

                        <div className="mt-5">


                            <div className="d-flex justify-content-between align-items-center mb-4">

                                <div>

                                    <h4 className="mb-1">
                                        Student Reviews
                                    </h4>

                                    <p className="text-muted mb-0">
                                        Reviews from students who took this course
                                    </p>

                                </div>


                                {!reviewsLoading && (

                                    <span className="badge bg-primary">

                                        {reviews.length}

                                    </span>

                                )}

                            </div>


                            {/* REVIEWS LOADING */}

                            {reviewsLoading ? (

                                <div className="text-center py-4">

                                    <div
                                        className="spinner-border text-primary"
                                        role="status"
                                    />

                                    <div className="text-muted mt-2">
                                        Loading reviews...
                                    </div>

                                </div>

                            ) : reviews.length === 0 ? (

                                <div className="card border-0 bg-light">

                                    <div className="card-body text-center py-5">

                                        <i
                                            className="bi bi-star fs-1 text-muted d-block mb-3"
                                        />

                                        <h5>
                                            No reviews yet
                                        </h5>

                                        <p className="text-muted mb-0">
                                            Be the first student to review this course.
                                        </p>

                                    </div>

                                </div>

                            ) : (

                                <div className="d-flex flex-column gap-3">

                                    {reviews.map(
                                        (review, index) => {

                                            const avatarUrl =
                                                getAvatarUrl(
                                                    review.student_avatar ||
                                                    review.avatar
                                                );

                                            return (

                                                <div
                                                    className="card border-0 shadow-sm"
                                                    key={
                                                        review.id ||
                                                        index
                                                    }
                                                >

                                                    <div className="card-body p-4">


                                                        {/* STUDENT INFO */}

                                                        <div className="d-flex justify-content-between align-items-start mb-3">

                                                            <div className="d-flex align-items-center gap-3">


                                                                {/* AVATAR */}

                                                                <div
                                                                    className="avatar-wrapper"
                                                                    style={{
                                                                        width: '45px',
                                                                        height: '45px',
                                                                        minWidth: '45px'
                                                                    }}
                                                                >

                                                                    {avatarUrl ? (

                                                                        <img
                                                                            src={avatarUrl}
                                                                            alt={
                                                                                review.student_name ||
                                                                                'Student'
                                                                            }
                                                                            className="rounded-circle"
                                                                            style={{
                                                                                width: '45px',
                                                                                height: '45px',
                                                                                objectFit: 'cover',
                                                                                display: 'block',
                                                                                border: '2px solid #e9ecef'
                                                                            }}
                                                                            onError={
                                                                                handleAvatarError
                                                                            }
                                                                        />

                                                                    ) : (

                                                                        <div
                                                                            className="avatar-fallback rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                                                            style={{
                                                                                width: '45px',
                                                                                height: '45px'
                                                                            }}
                                                                        >

                                                                            <i className="bi bi-person-fill" />

                                                                        </div>

                                                                    )}

                                                                </div>


                                                                {/* STUDENT NAME + DATE */}

                                                                <div>

                                                                    <div className="fw-semibold">

                                                                        {
                                                                            review.student_name ||
                                                                            'Student'
                                                                        }

                                                                    </div>

                                                                    <small className="text-muted">

                                                                        {
                                                                            formatReviewDate(
                                                                                review.created_at
                                                                            )
                                                                        }

                                                                    </small>

                                                                </div>

                                                            </div>


                                                            {/* RATING */}

                                                            <div>

                                                                {renderStars(
                                                                    review.rating
                                                                )}

                                                            </div>

                                                        </div>


                                                        {/* REVIEW TEXT */}

                                                        <p className="mb-0">

                                                            {
                                                                review.review_text ||
                                                                'No review message'
                                                            }

                                                        </p>

                                                    </div>

                                                </div>

                                            );

                                        }
                                    )}

                                </div>

                            )}

                        </div>


                    </div>


                    {/* =================================
                        RIGHT SIDE
                    ================================= */}

                    <div className="col-lg-4">


                        <div
                            className="card shadow sticky-top"
                            style={{
                                top: '20px'
                            }}
                        >

                            <div className="card-body">


                                {/* PRICE */}

                                <div className="mb-3">

                                    {discountAmount > 0 ? (

                                        <>

                                            <h3 className="text-primary mb-1">

                                                ₹{finalPrice.toLocaleString('en-IN')}

                                            </h3>


                                            <div>

                                                <span className="text-muted text-decoration-line-through me-2">

                                                    ₹{originalPrice.toLocaleString('en-IN')}

                                                </span>


                                                <span className="text-success fw-bold">

                                                    Save ₹{discountAmount.toLocaleString('en-IN')}

                                                </span>

                                            </div>

                                        </>

                                    ) : (

                                        <h3 className="text-primary">

                                            ₹{originalPrice.toLocaleString('en-IN')}

                                        </h3>

                                    )}

                                </div>


                                {/* COURSE INFO */}

                                <p>

                                    <strong>
                                        Duration:
                                    </strong>

                                    {' '}

                                    {course.duration_hours || 0}

                                    {' '}
                                    hours

                                </p>


                                <p>

                                    <strong>
                                        Category:
                                    </strong>

                                    {' '}

                                    {course.category_name || '-'}

                                </p>


                                <p>

                                    <strong>
                                        Students:
                                    </strong>

                                    {' '}

                                    {course.total_students || 0}

                                </p>


                                {/* MESSAGE */}

                                {message && (

                                    <div className="alert alert-info py-2">

                                        {message}

                                    </div>

                                )}


                                {/* ENROLL */}

                                <button
                                    type="button"
                                    className="btn btn-primary w-100 mt-2"
                                    onClick={handleEnroll}
                                    disabled={enrolling}
                                >

                                    {enrolling
                                        ? 'Enrolling...'
                                        : 'Enroll Now'}

                                </button>


                            </div>

                        </div>


                    </div>

                </div>

            </div>


            <Footer />

        </div>

    );

};


export default CourseDetails;

