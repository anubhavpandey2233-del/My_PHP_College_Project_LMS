import {
    useEffect,
    useState
} from 'react';

import {
    Link,
    useNavigate
} from 'react-router-dom';

import {
    MdDelete,
    MdShoppingCart,
    MdArrowBack,
    MdRemove,
    MdAdd,
    MdSchool
} from 'react-icons/md';

import {
    useAuth
} from '../../context/AuthContext';

import api from '../../services/api';

import './Cart.scss';

import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

const Cart = () => {

    const {
        isAuthenticated
    } = useAuth();

    const [cart, setCart] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [updatingId, setUpdatingId] =
        useState(null);

    const [removingId, setRemovingId] =
        useState(null);

    const navigate = useNavigate();

    const fetchCart = async () => {

        try {

            setLoading(true);

            const response =
                await api.get(
                    '/cart/list.php'
                );

            if (response.data?.status) {

                setCart(
                    Array.isArray(
                        response.data?.data
                    )
                        ? response.data.data
                        : []
                );

            } else {

                setCart([]);

            }

        } catch (error) {

            console.error(
                'Cart Error:',
                error
            );

            setCart([]);

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {

        if (isAuthenticated) {

            fetchCart();

        } else {

            setCart([]);
            setLoading(false);

        }

    }, [isAuthenticated]);

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

   const getQuantity = (course) => {

    const quantity =
        Number(course.quantity);

    return quantity > 0
        ? quantity
        : 1;
};
    const getImageUrl = (thumbnail) => {

        if (!thumbnail) {
            return '';
        }

        const image =
            String(thumbnail).trim();

        if (
            image.startsWith('http://') ||
            image.startsWith('https://')
        ) {
            return image;
        }

        if (
            image.startsWith('/php-lms-project/')
        ) {
            return `http://localhost${image}`;
        }

        if (
            image.startsWith('php-lms-project/')
        ) {
            return `http://localhost/${image}`;
        }

        if (
            image.startsWith('/uploads/')
        ) {
            return `http://localhost/php-lms-project/backend${image}`;
        }

        if (
            image.startsWith('uploads/')
        ) {
            return `http://localhost/php-lms-project/backend/${image}`;
        }

        return `http://localhost/php-lms-project/backend/uploads/courses/${image}`;
    };

   const updateQuantity = async (
    courseId,
    newQuantity
) => {

    if (newQuantity < 1) {
        return;
    }

    try {

        setUpdatingId(courseId);

        const response =
            await api.post(
                '/cart/update.php',
                {
                    course_id: courseId,
                    quantity: newQuantity
                }
            );

        if (response.data?.status) {

            setCart((prev) =>
                prev.map((item) =>
                    Number(item.course_id) ===
                    Number(courseId)
                        ? {
                            ...item,
                            quantity: newQuantity
                        }
                        : item
                )
            );

        }

    } catch (error) {

        console.error(
            'Update Quantity Error:',
            error
        );

    } finally {

        setUpdatingId(null);

    }
};
    const increaseQuantity = (
    course
) => {

    const quantity =
        getQuantity(course);

    updateQuantity(
        course.course_id,
        quantity + 1
    );

};

const decreaseQuantity = (
    course
) => {

    const quantity =
        getQuantity(course);

    if (quantity <= 1) {
        return;
    }

    updateQuantity(
        course.course_id,
        quantity - 1
    );

};

    const handleRemove = async (
        courseId
    ) => {

        try {

            setRemovingId(courseId);

            const response =
                await api.post(
                    '/cart/remove.php',
                    {
                        course_id:
                            courseId
                    }
                );

            if (response.data?.status) {

                setCart((prev) =>
                    prev.filter(
                        (item) =>
                            Number(
                                item.course_id
                            ) !==
                            Number(courseId)
                    )
                );

            }

        } catch (error) {

            console.error(
                'Remove Cart Error:',
                error
            );

        } finally {

            setRemovingId(null);

        }
    };

    const handleEnrollNow = (
        course
    ) => {

        if (!course.slug) {
            return;
        }

        navigate(
            `/courses/${course.slug}`
        );

    };

    const handleEnrollAll = () => {
    navigate('/cart/enroll');
};

    const totalAmount =
        cart.reduce(
            (total, course) =>
                total +
                (
                    getPrice(course) *
                    getQuantity(course)
                ),
            0
        );

    const totalItems =
        cart.reduce(
            (total, course) =>
                total +
                getQuantity(course),
            0
        );

    if (!isAuthenticated) {

        return (
            <>
                <Header />

                <div className="cart-page">

                    <div className="cart-container">

                        <div className="cart-empty">

                            <MdShoppingCart
                                size={70}
                            />

                            <h2>
                                Please Login
                            </h2>

                            <p>
                                Please login to view
                                your cart.
                            </p>

                            <Link
                                to="/login"
                                className="cart-primary-button"
                            >
                                Login
                            </Link>

                        </div>

                    </div>

                </div>

                <Footer />
            </>
        );

    }

    return (
        <>
            <Header />

            <div className="cart-page">

                <div className="cart-container">

                    <div className="cart-header">

                        <div>

                            <h1>
                                Shopping Cart
                            </h1>

                            <p>
                                {cart.length} course
                                {cart.length !== 1
                                    ? 's'
                                    : ''} in your cart
                            </p>

                        </div>

                        <Link
                            to="/"
                            className="cart-back-button"
                        >
                            <MdArrowBack
                                size={20}
                            />

                            Continue Shopping

                        </Link>

                    </div>

                    {loading ? (

                        <div className="cart-loading">
                            Loading your cart...
                        </div>

                    ) : cart.length === 0 ? (

                        <div className="cart-empty">

                            <MdShoppingCart
                                size={70}
                            />

                            <h2>
                                Your cart is empty
                            </h2>

                            <p>
                                Looks like you haven't
                                added any courses yet.
                            </p>

                            <Link
                                to="/"
                                className="cart-primary-button"
                            >
                                Browse Courses
                            </Link>

                        </div>

                    ) : (

                        <div className="cart-content">

                            <div className="cart-items">

                                {cart.map((course) => {

                                    const currentPrice =
                                        getPrice(course);

                                    const quantity =
                                        getQuantity(course);

                                    const subtotal =
                                        currentPrice *
                                        quantity;

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

                                    const isUpdating =
                                        Number(
                                            updatingId
                                        ) ===
                                        Number(
                                            course.course_id
                                        );

                                    const isRemoving =
                                        Number(
                                            removingId
                                        ) ===
                                        Number(
                                            course.course_id
                                        );

                                    return (

                                        <div
                                            className="cart-item"
                                            key={
                                                course.course_id
                                            }
                                        >

                                            <div className="cart-course-image">

                                                {course.thumbnail ? (

                                                    <img
                                                        src={
                                                            getImageUrl(
                                                                course.thumbnail
                                                            )
                                                        }
                                                        alt={
                                                            course.title ||
                                                            'Course'
                                                        }
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
                                                                '/images/courses/default-course.jpg';

                                                        }}
                                                    />

                                                ) : (

                                                    <div className="cart-image-placeholder">

                                                        <MdShoppingCart
                                                            size={35}
                                                        />

                                                    </div>

                                                )}

                                            </div>

                                            <div className="cart-course-info">

                                                <h3>
                                                    {
                                                        course.title ||
                                                        'Untitled Course'
                                                    }
                                                </h3>

                                                <p className="cart-description">
                                                    {
                                                        course.short_description ||
                                                        ''
                                                    }
                                                </p>

                                                <div className="cart-course-meta">

                                                    {course.level && (
                                                        <span>
                                                            {
                                                                course.level
                                                            }
                                                        </span>
                                                    )}

                                                    {course.language && (
                                                        <span>
                                                            {
                                                                course.language
                                                            }
                                                        </span>
                                                    )}

                                                    {course.duration_hours && (
                                                        <span>
                                                            {
                                                                course.duration_hours
                                                            } hours
                                                        </span>
                                                    )}

                                                </div>

                                            </div>

                                            <div className="cart-quantity">

                                                <span className="cart-quantity-label">
                                                    Quantity
                                                </span>

                                                <div className="cart-quantity-control">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            decreaseQuantity(
                                                                course
                                                            )
                                                        }
                                                        disabled={
                                                            quantity <=
                                                                1 ||
                                                            isUpdating ||
                                                            isRemoving
                                                        }
                                                        title="Decrease quantity"
                                                    >
                                                        <MdRemove
                                                            size={18}
                                                        />
                                                    </button>

                                                    <span>
                                                        {isUpdating
                                                            ? '...'
                                                            : quantity}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            increaseQuantity(
                                                                course
                                                            )
                                                        }
                                                        disabled={
                                                            isUpdating ||
                                                            isRemoving
                                                        }
                                                        title="Increase quantity"
                                                    >
                                                        <MdAdd
                                                            size={18}
                                                        />
                                                    </button>

                                                </div>

                                            </div>

                                            <div className="cart-course-price">

                                                <strong>
                                                    ₹
                                                    {subtotal.toLocaleString(
                                                        'en-IN',
                                                        {
                                                            minimumFractionDigits:
                                                                2,
                                                            maximumFractionDigits:
                                                                2
                                                        }
                                                    )}
                                                </strong>

                                                {quantity >
                                                    1 && (
                                                    <small>
                                                        ₹
                                                        {currentPrice.toLocaleString(
                                                            'en-IN',
                                                            {
                                                                minimumFractionDigits:
                                                                    2,
                                                                maximumFractionDigits:
                                                                    2
                                                            }
                                                        )}
                                                        {' '}×{' '}
                                                        {quantity}
                                                    </small>
                                                )}

                                                {hasDiscount && (

                                                    <del>
                                                        ₹
                                                        {(
                                                            originalPrice *
                                                            quantity
                                                        ).toLocaleString(
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

                                            <div className="cart-item-actions">

                                                <button
                                                    type="button"
                                                    className="cart-enroll-button"
                                                    onClick={() =>
                                                        handleEnrollNow(
                                                            course
                                                        )
                                                    }
                                                    disabled={
                                                        isRemoving ||
                                                        isUpdating
                                                    }
                                                >
                                                    <MdSchool
                                                        size={19}
                                                    />

                                                    Enroll Now
                                                </button>

                                                <button
                                                    type="button"
                                                    className="cart-remove-button"
                                                    onClick={() =>
                                                        handleRemove(
                                                            course.course_id
                                                        )
                                                    }
                                                    disabled={
                                                        isRemoving ||
                                                        isUpdating
                                                    }
                                                    title="Remove from cart"
                                                >

                                                    <MdDelete
                                                        size={20}
                                                    />

                                                    <span>
                                                        {isRemoving
                                                            ? 'Removing...'
                                                            : 'Remove'}
                                                    </span>

                                                </button>

                                            </div>

                                        </div>

                                    );

                                })}

                            </div>

                            <div className="cart-summary">

                                <h2>
                                    Cart Summary
                                </h2>

                                <div className="cart-summary-row">

                                    <span>
                                        Total Courses
                                    </span>

                                    <strong>
                                        {cart.length}
                                    </strong>

                                </div>

                                <div className="cart-summary-row">

                                    <span>
                                        Total Items
                                    </span>

                                    <strong>
                                        {totalItems}
                                    </strong>

                                </div>

                                <div className="cart-summary-row cart-total">

                                    <span>
                                        Total
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
                                    className="cart-checkout-button"
                                    onClick={
                                        handleEnrollAll
                                    }
                                    disabled={
                                        cart.length ===
                                        0
                                    }
                                >
                                    <MdSchool
                                        size={21}
                                    />

                                    Enroll All

                                </button>

                            </div>

                        </div>

                    )}

                    <button
                        type="button"
                        className="cart-back-button mt-4"
                        onClick={() =>
                            navigate(-1)
                        }
                    >
                        <MdArrowBack
                            size={20}
                        />

                        Back

                    </button>

                </div>

            </div>

            <Footer />

        </>
    );

};

export default Cart;