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
    MdAccountCircle,
    MdMenu,
    MdClose,
    MdSearch
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

    const [showMobileMenu, setShowMobileMenu] =
        useState(false);

    const [search, setSearch] =
        useState('');

    const desktopNotificationRef =
        useRef(null);

    const mobileNotificationRef =
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

    const handleSearch = () => {

        const value =
            search.trim();

        setShowMobileMenu(false);
        setShowNotifications(false);

        if (!value) {

            navigate('/courses');

            return;
        }

        navigate(
            `/courses?search=${encodeURIComponent(value)}`
        );
    };

    const handleSearchKeyDown = (event) => {

        if (event.key === 'Enter') {

            event.preventDefault();

            handleSearch();
        }
    };

    useEffect(() => {

        const params =
            new URLSearchParams(
                location.search
            );

        const searchValue =
            params.get('search') || '';

        setSearch(searchValue);

    }, [location.search]);

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
            setShowMobileMenu(false);

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

                const desktopElement =
                    desktopNotificationRef.current;

                const mobileElement =
                    mobileNotificationRef.current;

                const clickedInsideDesktop =
                    desktopElement &&
                    desktopElement.contains(
                        event.target
                    );

                const clickedInsideMobile =
                    mobileElement &&
                    mobileElement.contains(
                        event.target
                    );

                if (
                    !clickedInsideDesktop &&
                    !clickedInsideMobile
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

        setShowMobileMenu(false);
        setShowNotifications(false);

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
        setShowMobileMenu(false);

        navigate('/');
    };

    const closeMobileMenu = () => {

        setShowMobileMenu(false);
        setShowNotifications(false);
    };

    return (

        <header className="lms-header">

            <div className="lms-header-main">

                <div className="lms-header-inner">

                    {/* LOGO */}

                    <Link
                        to="/"
                        className="lms-logo"
                        onClick={closeMobileMenu}
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

                        <MdSearch
                            className="lms-search-icon"
                            size={28}
                        />

                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            onKeyDown={
                                handleSearchKeyDown
                            }
                            aria-label="Search courses"
                        />

                    </div>

                    {/* DESKTOP ACTIONS */}

                    <div className="lms-header-actions">

                        {isStudent && (

                            <Link
                                to="/wishlist"
                                className="lms-header-icon lms-wishlist-button"
                                title="Wishlist"
                            >

                                <MdFavorite size={23} />

                                {wishlistCount > 0 && (

                                    <span className="lms-wishlist-badge">

                                        {wishlistCount > 99
                                            ? '99+'
                                            : wishlistCount}

                                    </span>

                                )}

                            </Link>

                        )}

                        {isStudent && (

                            <Link
                                to="/cart"
                                className="lms-header-icon lms-cart-button"
                                title="Cart"
                            >

                                <MdShoppingCart size={23} />

                                {cartCount > 0 && (

                                    <span className="lms-cart-badge">

                                        {cartCount > 99
                                            ? '99+'
                                            : cartCount}

                                    </span>

                                )}

                            </Link>

                        )}

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

                        {showHomeButton && (

                            <button
                                type="button"
                                className="lms-header-icon"
                                onClick={
                                    handleHomeClick
                                }
                                title="Home"
                            >

                                <MdHome size={23} />

                            </button>

                        )}

                        {isAdmin && (

                            <div
                                className="lms-notification-wrapper"
                                ref={
                                    desktopNotificationRef
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

                                <MdDarkMode size={22} />

                            ) : (

                                <MdLightMode size={22} />

                            )}

                        </button>

                        <Link
                            to="/contact-us"
                            className="lms-contact-button"
                            onClick={() =>
                                setShowNotifications(false)
                            }
                        >

                            <MdEmail size={18} />

                            <span>
                                Contact Us
                            </span>

                        </Link>

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

                    {/* MOBILE MENU BUTTON */}

                    <button
                        type="button"
                        className="lms-mobile-menu-button"
                        onClick={() => {

                            setShowMobileMenu(
                                !showMobileMenu
                            );

                            setShowNotifications(
                                false
                            );

                        }}
                        aria-label="Toggle menu"
                    >

                        {showMobileMenu ? (
                            <MdClose size={28} />
                        ) : (
                            <MdMenu size={28} />
                        )}

                    </button>

                </div>

                {/* MOBILE MENU */}

                {showMobileMenu && (

                    <div className="lms-mobile-menu">

                        <div className="lms-mobile-menu-inner">

                            <div className="lms-mobile-menu-title">

                                <span>
                                    Menu
                                </span>

                                <button
                                    type="button"
                                    onClick={
                                        closeMobileMenu
                                    }
                                    aria-label="Close menu"
                                >

                                    <MdClose size={22} />

                                </button>

                            </div>

                            <div className="lms-mobile-menu-list">

                                {isStudent && (

                                    <Link
                                        to="/wishlist"
                                        className="lms-mobile-menu-item"
                                        onClick={
                                            closeMobileMenu
                                        }
                                    >

                                        <span className="lms-mobile-menu-icon wishlist-icon">

                                            <MdFavorite
                                                size={21}
                                            />

                                        </span>

                                        <span className="lms-mobile-menu-text">
                                            Wishlist
                                        </span>

                                        {wishlistCount > 0 && (

                                            <span className="lms-mobile-badge wishlist">

                                                {wishlistCount > 99
                                                    ? '99+'
                                                    : wishlistCount}

                                            </span>

                                        )}

                                    </Link>

                                )}

                                {isStudent && (

                                    <Link
                                        to="/cart"
                                        className="lms-mobile-menu-item"
                                        onClick={
                                            closeMobileMenu
                                        }
                                    >

                                        <span className="lms-mobile-menu-icon cart-icon">

                                            <MdShoppingCart
                                                size={21}
                                            />

                                        </span>

                                        <span className="lms-mobile-menu-text">
                                            Cart
                                        </span>

                                        {cartCount > 0 && (

                                            <span className="lms-mobile-badge cart">

                                                {cartCount > 99
                                                    ? '99+'
                                                    : cartCount}

                                            </span>

                                        )}

                                    </Link>

                                )}

                                {isAuthenticated ? (

                                    <Link
                                        to={accountPath}
                                        className="lms-mobile-menu-item"
                                        onClick={
                                            closeMobileMenu
                                        }
                                    >

                                        <span className="lms-mobile-menu-icon account-icon">

                                            {avatar ? (

                                                <img
                                                    src={avatar}
                                                    alt="Profile"
                                                    className="lms-mobile-avatar"
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
                                                size={22}
                                                style={{
                                                    display: avatar
                                                        ? 'none'
                                                        : 'block'
                                                }}
                                            />

                                        </span>

                                        <span className="lms-mobile-menu-text">

                                            {user?.name ||
                                                'Account'}

                                        </span>

                                    </Link>

                                ) : (

                                    <Link
                                        to="/login"
                                        className="lms-mobile-menu-item"
                                        onClick={
                                            closeMobileMenu
                                        }
                                    >

                                        <span className="lms-mobile-menu-icon account-icon">

                                            <MdAccountCircle
                                                size={22}
                                            />

                                        </span>

                                        <span className="lms-mobile-menu-text">
                                            Login
                                        </span>

                                    </Link>

                                )}

                                {showHomeButton && (

                                    <button
                                        type="button"
                                        className="lms-mobile-menu-item"
                                        onClick={
                                            handleHomeClick
                                        }
                                    >

                                        <span className="lms-mobile-menu-icon home-icon">

                                            <MdHome
                                                size={22}
                                            />

                                        </span>

                                        <span className="lms-mobile-menu-text">
                                            Home
                                        </span>

                                    </button>

                                )}

                                {isAdmin && (

                                    <div
                                        className="lms-mobile-notification-section"
                                        ref={
                                            mobileNotificationRef
                                        }
                                    >

                                        <button
                                            type="button"
                                            className="lms-mobile-menu-item"
                                            onClick={
                                                handleNotificationClick
                                            }
                                        >

                                            <span className="lms-mobile-menu-icon notification-icon">

                                                <MdNotifications
                                                    size={22}
                                                />

                                            </span>

                                            <span className="lms-mobile-menu-text">
                                                Notifications
                                            </span>

                                            {unreadCount > 0 && (

                                                <span className="lms-mobile-badge notification">

                                                    {unreadCount > 99
                                                        ? '99+'
                                                        : unreadCount}

                                                </span>

                                            )}

                                            <span
                                                className={`lms-mobile-notification-arrow ${
                                                    showNotifications
                                                        ? 'open'
                                                        : ''
                                                }`}
                                            >
                                                ›
                                            </span>

                                        </button>

                                        {showNotifications && (

                                            <div className="lms-mobile-notification-dropdown">

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

                                <button
                                    type="button"
                                    className="lms-mobile-menu-item"
                                    onClick={() => {

                                        toggleTheme();
                                        setShowMobileMenu(false);

                                    }}
                                >

                                    <span className="lms-mobile-menu-icon theme-icon">

                                        {theme === 'light' ? (

                                            <MdDarkMode
                                                size={22}
                                            />

                                        ) : (

                                            <MdLightMode
                                                size={22}
                                            />

                                        )}

                                    </span>

                                    <span className="lms-mobile-menu-text">

                                        {theme === 'light'
                                            ? 'Dark Mode'
                                            : 'Light Mode'}

                                    </span>

                                </button>

                                <Link
                                    to="/contact-us"
                                    className="lms-mobile-menu-item"
                                    onClick={
                                        closeMobileMenu
                                    }
                                >

                                    <span className="lms-mobile-menu-icon contact-icon">

                                        <MdEmail
                                            size={22}
                                        />

                                    </span>

                                    <span className="lms-mobile-menu-text">
                                        Contact Us
                                    </span>

                                </Link>

                                {isAuthenticated && (

                                    <button
                                        type="button"
                                        className="lms-mobile-menu-item lms-mobile-logout"
                                        onClick={
                                            handleLogout
                                        }
                                    >

                                        <span className="lms-mobile-menu-icon logout-icon">
                                            ↪
                                        </span>

                                        <span className="lms-mobile-menu-text">
                                            Logout
                                        </span>

                                    </button>

                                )}

                            </div>

                        </div>

                    </div>

                )}

            </div>

        </header>

    );
};

export default Header;