import React, {
    useEffect,
    useState
} from 'react';

import {
    FaHeart,
    FaRegHeart,
    FaArrowLeft
} from 'react-icons/fa';

import {
    Link,
    useNavigate
} from 'react-router-dom';

import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';;

import api from '../../services/api';

import './Wishlist.css';

function Wishlist() {
    const navigate = useNavigate();

    const [wishlistItems, setWishlistItems] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const fetchWishlist = async () => {
        try {
            const response = await api.get(
                '/wishlist/list.php'
            );

            if (response.data?.status) {
                setWishlistItems(
                    response.data?.data || []
                );
            } else {
                setWishlistItems([]);
            }
        } catch (error) {
            console.error(
                'Wishlist Error:',
                error
            );

            setWishlistItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const handleRemove = async (courseId) => {
        try {
            const response = await api.post(
                '/wishlist/remove.php',
                {
                    course_id: Number(courseId)
                }
            );

            if (response.data?.status) {
                setWishlistItems((prev) =>
                    prev.filter(
                        (item) =>
                            Number(item.course_id) !==
                            Number(courseId)
                    )
                );
            }
        } catch (error) {
            console.error(
                'Remove Wishlist Error:',
                error
            );
        }
    };

    const getPrice = (course) => {
        const price =
            Number(course.price) || 0;

        const discountPrice =
            Number(course.discount_price) || 0;

        if (
            discountPrice > 0 &&
            discountPrice < price
        ) {
            return price - discountPrice;
        }

        return price;
    };

    const getImage = (course) => {
        if (!course.image) {
            return '/images/course-placeholder.jpg';
        }

        const imagePath = String(course.image).trim();

        if (
            imagePath.startsWith('http://') ||
            imagePath.startsWith('https://')
        ) {
            return imagePath;
        }

        if (imagePath.startsWith('/php-lms-project/')) {
            return `http://localhost${imagePath}`;
        }

        if (imagePath.startsWith('php-lms-project/')) {
            return `http://localhost/${imagePath}`;
        }

        if (imagePath.startsWith('/uploads/')) {
            return `http://localhost/php-lms-project/backend${imagePath}`;
        }

        if (imagePath.startsWith('uploads/')) {
            return `http://localhost/php-lms-project/backend/${imagePath}`;
        }

        return `http://localhost/php-lms-project/backend/uploads/courses/${imagePath}`;
    };

    return (
        <>
            <Header />

            <main className="wishlist-page">
                <div className="wishlist-container">

                    <div className="wishlist-top">
                        <button
                            type="button"
                            className="wishlist-back-btn"
                            onClick={() => navigate(-1)}
                        >
                            <FaArrowLeft />
                            Back
                        </button>
                    </div>

                    <div className="wishlist-header">
                        <div>
                            <h1>My Wishlist</h1>

                            <p>
                                Courses you have saved
                                for later.
                            </p>
                        </div>

                        {!loading &&
                            wishlistItems.length > 0 && (
                                <span className="wishlist-count">
                                    {
                                        wishlistItems.length
                                    }{' '}
                                    {wishlistItems.length ===
                                        1
                                        ? 'Course'
                                        : 'Courses'}
                                </span>
                            )}
                    </div>

                    {loading ? (
                        <div className="wishlist-message">
                            Loading wishlist...
                        </div>
                    ) : wishlistItems.length ===
                        0 ? (
                        <div className="wishlist-empty">
                            <div className="wishlist-empty-icon">
                                <FaRegHeart />
                            </div>

                            <h2>
                                Your wishlist is
                                empty
                            </h2>

                            <p>
                                Save courses you
                                want to learn
                                later.
                            </p>

                            <Link
                                to="/courses"
                                className="wishlist-browse-btn"
                            >
                                Browse Courses
                            </Link>
                        </div>
                    ) : (
                        <div className="wishlist-grid">
                            {wishlistItems.map(
                                (course) => {
                                    const finalPrice =
                                        getPrice(
                                            course
                                        );

                                    const originalPrice =
                                        Number(
                                            course.price
                                        ) || 0;

                                    return (
                                        <div
                                            className="wishlist-card"
                                            key={
                                                course.course_id
                                            }
                                        >
                                            <div className="wishlist-image">
                                                <img
                                                    src={getImage(
                                                        course
                                                    )}
                                                    alt={
                                                        course.title
                                                    }
                                                    onError={(
                                                        e
                                                    ) => {
                                                        e.currentTarget.src =
                                                            '/images/course-placeholder.jpg';
                                                    }}
                                                />
                                            </div>

                                            <div className="wishlist-content">
                                                <h3>
                                                    {
                                                        course.title
                                                    }
                                                </h3>

                                                {course.teacher && (
                                                    <p className="wishlist-teacher">
                                                        {
                                                            course.teacher
                                                        }
                                                    </p>
                                                )}

                                                <div className="wishlist-price">
                                                    <strong>
                                                        ₹
                                                        {
                                                            finalPrice
                                                        }
                                                    </strong>

                                                    {originalPrice >
                                                        finalPrice && (
                                                            <span>
                                                                ₹
                                                                {
                                                                    originalPrice
                                                                }
                                                            </span>
                                                        )}
                                                </div>

                                                <div className="wishlist-actions">
                                                    <Link
                                                        to={`/courses/${course.slug}`}
                                                        className="wishlist-view-btn"
                                                    >
                                                        View Course
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        className="wishlist-remove-btn"
                                                        title="Remove from Wishlist"
                                                        onClick={() =>
                                                            handleRemove(
                                                                course.course_id
                                                            )
                                                        }
                                                    >
                                                        <FaHeart />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </>
    );
}

export default Wishlist;