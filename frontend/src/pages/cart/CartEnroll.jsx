import React, {
    useEffect,
    useState
} from 'react';

import {
    Link,
    useNavigate
} from 'react-router-dom';

import {
    MdArrowBack,
    MdSchool
} from 'react-icons/md';

import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

import api from '../../services/api';

import './CartEnroll.scss';

function CartEnroll() {

    const navigate = useNavigate();

    const [cartItems, setCartItems] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [enrolling, setEnrolling] =
        useState(false);


    // ==========================================
    // FETCH CART
    // ==========================================

    useEffect(() => {

        fetchCart();

    }, []);


    const fetchCart = async () => {

        try {

            setLoading(true);

            const response =
                await api.get(
                    '/cart/list.php'
                );

            if (response.data?.status) {

                setCartItems(
                    Array.isArray(
                        response.data.data
                    )
                        ? response.data.data
                        : []
                );

            } else {

                setCartItems([]);

            }

        } catch (error) {

            console.error(
                'Fetch Cart Error:',
                error
            );

            setCartItems([]);

        } finally {

            setLoading(false);

        }
    };


    // ==========================================
    // GET COURSE PRICE
    // ==========================================

    const getPrice = (course) => {

        const originalPrice =
            Number(course.price) || 0;

        const discountAmount =
            Number(course.discount_price) || 0;

        const hasDiscount =
            discountAmount > 0 &&
            discountAmount < originalPrice;

        return hasDiscount
            ? originalPrice - discountAmount
            : originalPrice;
    };


    // ==========================================
    // GET IMAGE URL
    // ==========================================

    const getImageUrl = (image) => {

        if (!image) {

            return '/images/course-placeholder.jpg';

        }

        const imagePath =
            String(image).trim();

        if (
            imagePath.startsWith('http://') ||
            imagePath.startsWith('https://')
        ) {

            return imagePath;

        }

        if (
            imagePath.startsWith(
                '/php-lms-project/'
            )
        ) {

            return `http://localhost${imagePath}`;

        }

        if (
            imagePath.startsWith(
                'php-lms-project/'
            )
        ) {

            return `http://localhost/${imagePath}`;

        }

        if (
            imagePath.startsWith(
                '/uploads/'
            )
        ) {

            return `http://localhost/php-lms-project/backend${imagePath}`;

        }

        if (
            imagePath.startsWith(
                'uploads/'
            )
        ) {

            return `http://localhost/php-lms-project/backend/${imagePath}`;

        }

        return `http://localhost/php-lms-project/backend/uploads/courses/${imagePath}`;

    };


    // ==========================================
    // ENROLL ALL COURSES
    // ==========================================

    const handleEnrollAll = async () => {

        if (
            cartItems.length === 0 ||
            enrolling
        ) {

            return;

        }

        const courseIds =
            cartItems
                .map(
                    (course) =>
                        Number(course.course_id)
                )
                .filter(
                    (courseId) =>
                        courseId > 0
                );

        if (courseIds.length === 0) {

            alert(
                'No valid courses found'
            );

            return;

        }

        try {

            setEnrolling(true);

            const response =
                await api.post(
                    '/student/enroll-all.php',
                    {
                        course_ids:
                            courseIds
                    }
                );

            if (response.data?.status) {

                const data =
                    response.data?.data || {};

                const enrolledCount =
                    Number(
                        data.enrolled_count
                    ) || 0;

                const alreadyEnrolledCount =
                    Number(
                        data.already_enrolled_count
                    ) || 0;

                const skippedCount =
                    Number(
                        data.skipped_count
                    ) || 0;

                let message =
                    'Enrollment completed successfully.';

                if (
                    enrolledCount > 0
                ) {

                    message +=
                        `\n${enrolledCount} course${enrolledCount > 1 ? 's' : ''} enrolled.`;

                }

                if (
                    alreadyEnrolledCount > 0
                ) {

                    message +=
                        `\n${alreadyEnrolledCount} course${alreadyEnrolledCount > 1 ? 's were' : ' was'} already enrolled.`;

                }

                if (
                    skippedCount > 0
                ) {

                    message +=
                        `\n${skippedCount} course${skippedCount > 1 ? 's were' : ' was'} skipped.`;

                }

                alert(message);

                navigate(
                    '/student/my-courses'
                );

            } else {

                alert(
                    response.data?.message ||
                    'Enrollment failed'
                );

            }

        } catch (error) {

            console.error(
                'Enroll All Error:',
                error
            );

            alert(
                error.response?.data?.message ||
                'Unable to enroll in courses'
            );

        } finally {

            setEnrolling(false);

        }
    };


    // ==========================================
    // TOTAL AMOUNT
    // ==========================================

    const totalAmount =
        cartItems.reduce(
            (
                total,
                course
            ) => {

                return (
                    total +
                    getPrice(course)
                );

            },
            0
        );


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (
            <>

                <Header />

                <main className="cart-enroll-page">

                    <div className="cart-enroll-container">

                        <div className="cart-enroll-loading">

                            Loading courses...

                        </div>

                    </div>

                </main>

                <Footer />

            </>
        );

    }


    return (
        <>

            <Header />

            <main className="cart-enroll-page">

                <div className="cart-enroll-container">


                    {/* ==========================================
                        HEADER
                    ========================================== */}

                    <div className="cart-enroll-header">

                        <div>

                            <h1>
                                Enroll in Courses
                            </h1>

                            <p>
                                Review your courses
                                before enrolling.
                            </p>

                        </div>

                        <button
                            type="button"
                            className="cart-enroll-back-btn"
                            onClick={() =>
                                navigate('/cart')
                            }
                        >

                            <MdArrowBack
                                size={20}
                            />

                            Back to Cart

                        </button>

                    </div>


                    {/* ==========================================
                        EMPTY CART
                    ========================================== */}

                    {cartItems.length === 0 ? (

                        <div className="cart-enroll-empty">

                            <MdSchool
                                size={55}
                            />

                            <h2>
                                No courses in your cart
                            </h2>

                            <p>
                                Add some courses to
                                your cart first.
                            </p>

                            <Link
                                to="/courses"
                                className="cart-enroll-shopping-btn"
                            >
                                Browse Courses
                            </Link>

                        </div>

                    ) : (

                        <>

                            {/* ==========================================
                                COURSE LIST
                            ========================================== */}

                            <div className="cart-enroll-list">

                                {cartItems.map(
                                    (course) => {

                                        const price =
                                            getPrice(
                                                course
                                            );

                                        const originalPrice =
                                            Number(
                                                course.price
                                            ) || 0;

                                        const discountAmount =
                                            Number(
                                                course.discount_price
                                            ) || 0;

                                        const hasDiscount =
                                            discountAmount >
                                                0 &&
                                            discountAmount <
                                                originalPrice;

                                        return (

                                            <div
                                                className="cart-enroll-card"
                                                key={
                                                    course.course_id
                                                }
                                            >

                                                <div className="cart-enroll-image-wrapper">

                                                    <img
                                                        src={
                                                            getImageUrl(
                                                                course.thumbnail ||
                                                                course.image
                                                            )
                                                        }
                                                        alt={
                                                            course.title ||
                                                            'Course'
                                                        }
                                                        className="cart-enroll-image"
                                                        onError={(
                                                            event
                                                        ) => {

                                                            if (
                                                                event
                                                                    .currentTarget
                                                                    .dataset
                                                                    .fallback
                                                            ) {

                                                                return;

                                                            }

                                                            event
                                                                .currentTarget
                                                                .dataset
                                                                .fallback =
                                                                'true';

                                                            event
                                                                .currentTarget
                                                                .src =
                                                                '/images/course-placeholder.jpg';

                                                        }}
                                                    />

                                                </div>


                                                <div className="cart-enroll-info">

                                                    <h2>
                                                        {
                                                            course.title ||
                                                            'Untitled Course'
                                                        }
                                                    </h2>

                                                    {course.teacher && (

                                                        <p>
                                                            Teacher:{' '}
                                                            {
                                                                course.teacher
                                                            }
                                                        </p>

                                                    )}

                                                    {course.level && (

                                                        <span>
                                                            {
                                                                course.level
                                                            }
                                                        </span>

                                                    )}

                                                </div>


                                                <div className="cart-enroll-price">

                                                    <strong>
                                                        ₹
                                                        {price.toLocaleString(
                                                            'en-IN',
                                                            {
                                                                minimumFractionDigits:
                                                                    2,
                                                                maximumFractionDigits:
                                                                    2
                                                            }
                                                        )}
                                                    </strong>

                                                    {hasDiscount && (

                                                        <del>
                                                            ₹
                                                            {originalPrice.toLocaleString(
                                                                'en-IN',
                                                                {
                                                                    minimumFractionDigits:
                                                                        2,
                                                                    maximumFractionDigits:
                                                                        2
                                                                }
                                                            )}
                                                        </del>

                                                    )}

                                                </div>

                                            </div>

                                        );

                                    }
                                )}

                            </div>


                            {/* ==========================================
                                SUMMARY
                            ========================================== */}

                            <div className="cart-enroll-summary">

                                <div className="cart-enroll-summary-row">

                                    <span>
                                        Total Courses
                                    </span>

                                    <strong>
                                        {cartItems.length}
                                    </strong>

                                </div>


                                <div className="cart-enroll-summary-row">

                                    <span>
                                        Total Amount
                                    </span>

                                    <strong>
                                        ₹
                                        {totalAmount.toLocaleString(
                                            'en-IN',
                                            {
                                                minimumFractionDigits:
                                                    2,
                                                maximumFractionDigits:
                                                    2
                                            }
                                        )}
                                    </strong>

                                </div>


                                <button
                                    type="button"
                                    className="cart-enroll-all-btn"
                                    onClick={
                                        handleEnrollAll
                                    }
                                    disabled={
                                        enrolling
                                    }
                                >

                                    <MdSchool
                                        size={22}
                                    />

                                    {enrolling
                                        ? 'Enrolling Courses...'
                                        : 'Enroll All Courses'}

                                </button>

                            </div>

                        </>

                    )}

                </div>

            </main>

            <Footer />

        </>
    );
}

export default CartEnroll;