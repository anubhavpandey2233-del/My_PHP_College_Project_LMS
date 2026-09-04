import {
    useEffect,
    useRef,
    useState
} from 'react';

import {
    Link,
    useLocation,
    useNavigate
} from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './Header.css';

import {
    MdDarkMode,
    MdLightMode,
    MdEmail,
    MdNotifications,
    MdHome,
    MdShoppingCart,
    MdFavorite,
    MdAccountCircle
} from 'react-icons/md';

import api from '../../services/api';

const Header = () => {

    const {
        user,
        logout,
        isAuthenticated
    } = useAuth();

    const {
        theme,
        toggleTheme
    } = useTheme();

    const navigate = useNavigate();
    const location = useLocation();

    const userRole =
        String(user?.role || '').toLowerCase().trim();

    const isAdmin =
        isAuthenticated && userRole === 'admin';

    const isTeacher =
        isAuthenticated && userRole === 'teacher';

    const isStudent =
        isAuthenticated && userRole === 'student';

    const isHomePage =
        location.pathname === '/';

    const showHomeButton =
        !isHomePage;

    const accountPath =
        isAdmin
            ? '/admin/dashboard'
            : isTeacher
                ? '/teacher/dashboard'
                : isStudent
                    ? '/student/dashboard'
                    : '/';

    const avatar =
        user?.avatar
            ? `http://localhost/php-lms-project/backend/uploads/avatars/${user.avatar}`
            : null;

    const [notifications, setNotifications] =
        useState([]);

    const [unreadCount, setUnreadCount] =
        useState(0);

    const [cartCount, setCartCount] =
        useState(0);

    const [wishlistCount, setWishlistCount] =
        useState(0);

    const [showNotifications, setShowNotifications] =
        useState(false);

    const [loadingNotifications, setLoadingNotifications] =
        useState(false);

    const notificationRef =
        useRef(null);

    const fetchNotifications = async () => {

        if (!isAdmin) {

            setNotifications([]);
            setUnreadCount(0);

            return;
        }

        try {

            setLoadingNotifications(true);

            const response =
                await api.get(
                    '/notifications/list.php'
                );

            if (response.data?.status) {

                const notificationData =
                    response.data?.data?.notifications || [];

                const count =
                    Number(
                        response.data?.data?.unread_count || 0
                    );

                setNotifications(
                    notificationData
                );

                setUnreadCount(
                    count
                );

            } else {

                setNotifications([]);
                setUnreadCount(0);

            }

        } catch (error) {

            console.error(
                'Notification Error:',
                error
            );

            setNotifications([]);
            setUnreadCount(0);

        } finally {

            setLoadingNotifications(false);

        }
    };

    const fetchCartCount = async () => {

        if (!isStudent) {

            setCartCount(0);

            return;
        }

        try {

            const response =
                await api.get(
                    '/cart/count.php'
                );

            if (response.data?.status) {

                const count =
                    Number(
                        response.data?.data?.count || 0
                    );

                setCartCount(count);

            } else {

                setCartCount(0);

            }

        } catch (error) {

            console.error(
                'Cart Count Error:',
                error
            );

            setCartCount(0);

        }
    };

    const fetchWishlistCount = async () => {

        if (!isStudent) {

            setWishlistCount(0);

            return;
        }

        try {

            const response =
                await api.get(
                    '/wishlist/count.php'
                );

            if (response.data?.status) {

                const count =
                    Number(
                        response.data?.data?.count || 0
                    );

                setWishlistCount(count);

            } else {

                setWishlistCount(0);

            }

        } catch (error) {

            console.error(
                'Wishlist Count Error:',
                error
            );

            setWishlistCount(0);

        }
    };

    const markAsRead = async (
        notificationId
    ) => {

        try {

            const response =
                await api.post(
                    '/notifications/mark-read.php',
                    {
                        notification_id:
                            notificationId
                    }
                );

            if (response.data?.status) {

                setNotifications((prev) =>
                    prev.map(
                        (notification) =>
                            Number(
                                notification.id
                            ) ===
                                Number(
                                    notificationId
                                )
                                ? {
                                    ...notification,
                                    is_read: 1
                                }
                                : notification
                    )
                );

                setUnreadCount((prev) =>
                    Math.max(
                        0,
                        prev - 1
                    )
                );

                return true;
            }

            return false;

        } catch (error) {

            console.error(
                'Mark Notification Read Error:',
                error
            );

            return false;
        }
    };

    const handleNotificationClick =
        async () => {

            const willOpen =
                !showNotifications;

            setShowNotifications(
                willOpen
            );

            if (willOpen) {

                await fetchNotifications();

            }
        };

    const handleSingleNotificationClick =
        async (notification) => {

            if (
                Number(
                    notification.is_read
                ) === 0
            ) {

                await markAsRead(
                    notification.id
                );
            }

            setShowNotifications(false);

            if (notification.link) {

                navigate(
                    notification.link
                );

                return;
            }

            if (
                notification.type ===
                'contact_message' ||
                notification.type ===
                'contact'
            ) {

                navigate(
                    '/admin/contact-messages'
                );
            }
        };

    useEffect(() => {

        if (isAdmin) {

            fetchNotifications();

        } else {

            setNotifications([]);
            setUnreadCount(0);
            setShowNotifications(false);

        }

    }, [isAdmin]);

    useEffect(() => {

        if (!isAdmin) {
            return;
        }

        const interval =
            setInterval(
                () => {
                    fetchNotifications();
                },
                30000
            );

        return () => {

            clearInterval(
                interval
            );

        };

    }, [isAdmin]);

    useEffect(() => {

        const handleClickOutside =
            (event) => {

                if (
                    notificationRef.current &&
                    !notificationRef.current.contains(
                        event.target
                    )
                ) {

                    setShowNotifications(
                        false
                    );

                }

            };

        document.addEventListener(
            'mousedown',
            handleClickOutside
        );

        return () => {

            document.removeEventListener(
                'mousedown',
                handleClickOutside
            );

        };

    }, []);

    useEffect(() => {

        if (isStudent) {

            fetchCartCount();

        } else {

            setCartCount(0);

        }

    }, [isStudent]);

    useEffect(() => {

        if (isStudent) {

            fetchWishlistCount();

        } else {

            setWishlistCount(0);

        }

    }, [isStudent]);

    const handleLogout = async () => {

        await logout();

        setCartCount(0);
        setWishlistCount(0);

        navigate(
            '/',
            {
                replace: true
            }
        );

    };

    const formatNotificationTime =
        (date) => {

            if (!date) {
                return '';
            }

            const notificationDate =
                new Date(date);

            if (
                Number.isNaN(
                    notificationDate.getTime()
                )
            ) {

                return date;

            }

            return notificationDate.toLocaleString();

        };

    const handleHomeClick = () => {

        setShowNotifications(false);

        navigate('/');

    };

    return (

        <header className="lms-header">

            <div className="lms-header-main">

                <div className="lms-header-inner">

                    {/* LOGO */}

                    <Link
                        to="/"
                        className="lms-logo"
                        onClick={() =>
                            setShowNotifications(false)
                        }
                    >

                        <span className="lms-logo-icon">
                            🎓
                        </span>

                        <span>
                            LMS
                        </span>

                    </Link>

                    {/* SEARCH */}

                    <div className="lms-search-box">

                        <span className="lms-search-icon">
                            🔍
                        </span>

                        <input
                            type="text"
                            placeholder="Search courses..."
                        />

                    </div>

                    {/* RIGHT SIDE */}

                    <div className="lms-header-actions">

                        {/* WISHLIST */}

                        {isStudent && (

                            <Link
                                to="/wishlist"
                                className="lms-header-icon lms-wishlist-button"
                                title="Wishlist"
                            >

                                <MdFavorite
                                    size={23}
                                />

                                {wishlistCount > 0 && (

                                    <span className="lms-wishlist-badge">

                                        {wishlistCount > 99
                                            ? '99+'
                                            : wishlistCount}

                                    </span>

                                )}

                            </Link>

                        )}

                        {/* CART */}

                        {isStudent && (

                            <Link
                                to="/cart"
                                className="lms-header-icon lms-cart-button"
                                title="Cart"
                            >

                                <MdShoppingCart
                                    size={23}
                                />

                                {cartCount > 0 && (

                                    <span className="lms-cart-badge">

                                        {cartCount > 99
                                            ? '99+'
                                            : cartCount}

                                    </span>

                                )}

                            </Link>

                        )}

                        {/* USER */}

                        {isAuthenticated ? (

                            <Link
                                to={accountPath}
                                className="lms-user-button"
                                onClick={() =>
                                    setShowNotifications(false)
                                }
                            >

                                {avatar ? (

                                    <img
                                        src={avatar}
                                        alt={
                                            user?.name ||
                                            'Profile'
                                        }
                                        className="lms-user-avatar"
                                        onError={(event) => {

                                            event.currentTarget.style.display =
                                                'none';

                                            if (
                                                event.currentTarget
                                                    .nextElementSibling
                                            ) {

                                                event.currentTarget
                                                    .nextElementSibling
                                                    .style.display =
                                                    'block';

                                            }

                                        }}
                                    />

                                ) : null}

                                <MdAccountCircle
                                    size={29}
                                    className="lms-user-avatar-fallback"
                                    style={{
                                        display: avatar
                                            ? 'none'
                                            : 'block'
                                    }}
                                />

                                <span>
                                    {user?.name ||
                                        'Account'}
                                </span>

                            </Link>

                        ) : (

                            <Link
                                to="/login"
                                className="lms-login-button"
                            >
                                Login
                            </Link>

                        )}

                        {/* HOME */}

                        {showHomeButton && (

                            <button
                                type="button"
                                className="lms-header-icon"
                                onClick={
                                    handleHomeClick
                                }
                                title="Home"
                            >

                                <MdHome
                                    size={23}
                                />

                            </button>

                        )}

                        {/* ADMIN NOTIFICATION */}

                        {isAdmin && (

                            <div
                                className="lms-notification-wrapper"
                                ref={
                                    notificationRef
                                }
                            >

                                <button
                                    type="button"
                                    className="lms-header-icon"
                                    onClick={
                                        handleNotificationClick
                                    }
                                    title="Notifications"
                                >

                                    <MdNotifications
                                        size={23}
                                    />

                                    {unreadCount > 0 && (

                                        <span className="lms-notification-badge">

                                            {unreadCount > 99
                                                ? '99+'
                                                : unreadCount}

                                        </span>

                                    )}

                                </button>

                                {showNotifications && (

                                    <div className="lms-notification-dropdown">

                                        <div className="lms-notification-header">

                                            <div>

                                                <MdNotifications
                                                    size={21}
                                                />

                                                <strong>
                                                    Notifications
                                                </strong>

                                            </div>

                                            {unreadCount > 0 && (

                                                <span>
                                                    {unreadCount} new
                                                </span>

                                            )}

                                        </div>

                                        <div className="lms-notification-list">

                                            {loadingNotifications ? (

                                                <div className="lms-notification-empty">
                                                    Loading notifications...
                                                </div>

                                            ) : notifications.length === 0 ? (

                                                <div className="lms-notification-empty">

                                                    <MdNotifications
                                                        size={35}
                                                    />

                                                    <div>
                                                        No notifications
                                                    </div>

                                                </div>

                                            ) : (

                                                notifications.map(
                                                    (notification) => {

                                                        const isUnread =
                                                            Number(
                                                                notification.is_read
                                                            ) === 0;

                                                        return (

                                                            <div
                                                                key={
                                                                    notification.id
                                                                }
                                                                className={`lms-notification-item ${
                                                                    isUnread
                                                                        ? 'unread'
                                                                        : ''
                                                                }`}
                                                                onClick={() =>
                                                                    handleSingleNotificationClick(
                                                                        notification
                                                                    )
                                                                }
                                                            >

                                                                <MdNotifications
                                                                    size={21}
                                                                />

                                                                <div>

                                                                    <strong>
                                                                        {
                                                                            notification.title
                                                                        }
                                                                    </strong>

                                                                    <p>
                                                                        {
                                                                            notification.message
                                                                        }
                                                                    </p>

                                                                    {notification.created_at && (

                                                                        <small>
                                                                            {
                                                                                formatNotificationTime(
                                                                                    notification.created_at
                                                                                )
                                                                            }
                                                                        </small>

                                                                    )}

                                                                </div>

                                                                {isUnread && (

                                                                    <span className="notification-dot" />

                                                                )}

                                                            </div>

                                                        );

                                                    }
                                                )

                                            )}

                                        </div>

                                    </div>

                                )}

                            </div>

                        )}

                        {/* THEME */}

                        <button
                            type="button"
                            className="lms-header-icon theme-toggle"
                            onClick={
                                toggleTheme
                            }
                            title={
                                theme === 'light'
                                    ? 'Dark Mode'
                                    : 'Light Mode'
                            }
                        >

                            {theme === 'light' ? (

                                <MdDarkMode
                                    size={22}
                                />

                            ) : (

                                <MdLightMode
                                    size={22}
                                />

                            )}

                        </button>

                        {/* CONTACT */}

                        <Link
                            to="/contact-us"
                            className="lms-contact-button"
                            onClick={() =>
                                setShowNotifications(false)
                            }
                        >

                            <MdEmail
                                size={18}
                            />

                            <span>
                                Contact Us
                            </span>

                        </Link>

                        {/* LOGOUT */}

                        {isAuthenticated && (

                            <button
                                type="button"
                                className="lms-logout-button"
                                onClick={
                                    handleLogout
                                }
                            >

                                Logout

                            </button>

                        )}

                    </div>

                </div>

            </div>

        </header>

    );

};

export default Header;