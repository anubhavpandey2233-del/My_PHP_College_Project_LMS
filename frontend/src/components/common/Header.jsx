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

import {
    MdDarkMode,
    MdLightMode,
    MdEmail,
    MdNotifications,
    MdHome,
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


    // ==========================================
    // ROLE
    // ==========================================

    const userRole =
        String(user?.role || '').toLowerCase().trim();

    const isAdmin =
        isAuthenticated &&
        userRole === 'admin';

    const isTeacher =
        isAuthenticated &&
        userRole === 'teacher';

    const isStudent =
        isAuthenticated &&
        userRole === 'student';


    // ==========================================
    // HOME PAGE
    // ==========================================

    const isHomePage =
        location.pathname === '/';


    // ==========================================
    // SHOW HOME BUTTON
    // ==========================================

    const showHomeButton =
        isAuthenticated &&
        !isHomePage;


    // ==========================================
    // ACCOUNT PATH
    // ==========================================

    const accountPath =
        isAdmin
            ? '/admin/dashboard'
            : isTeacher
                ? '/teacher/dashboard'
                : isStudent
                    ? '/student/dashboard'
                    : '/';


    // ==========================================
    // NOTIFICATIONS
    // ==========================================

    const [notifications, setNotifications] =
        useState([]);

    const [unreadCount, setUnreadCount] =
        useState(0);

    const [showNotifications, setShowNotifications] =
        useState(false);

    const [loadingNotifications, setLoadingNotifications] =
        useState(false);

    const notificationRef =
        useRef(null);


    // ==========================================
    // FETCH ADMIN NOTIFICATIONS
    // ==========================================

    const fetchNotifications = async () => {

        if (!isAdmin) {

            setNotifications([]);
            setUnreadCount(0);

            return;
        }

        try {

            setLoadingNotifications(true);

            const response = await api.get(
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


    // ==========================================
    // MARK NOTIFICATION AS READ
    // ==========================================

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


    // ==========================================
    // NOTIFICATION BUTTON
    // ==========================================

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


    // ==========================================
    // SINGLE NOTIFICATION
    // ==========================================

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


    // ==========================================
    // ADMIN NOTIFICATIONS ON LOGIN
    // ==========================================

    useEffect(() => {

        if (isAdmin) {

            fetchNotifications();

        } else {

            setNotifications([]);
            setUnreadCount(0);
            setShowNotifications(false);

        }

    }, [isAdmin]);


    // ==========================================
    // AUTO REFRESH NOTIFICATIONS
    // ==========================================

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


    // ==========================================
    // CLICK OUTSIDE NOTIFICATION
    // ==========================================

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


    // ==========================================
    // LOGOUT
    // ==========================================

    const handleLogout = async () => {

        await logout();

        navigate(
            '/',
            {
                replace: true
            }
        );

    };


    // ==========================================
    // NOTIFICATION DATE
    // ==========================================

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


    // ==========================================
    // HOME NAVIGATION
    // ==========================================

    const handleHomeClick = () => {

        setShowNotifications(false);

        navigate('/');

    };


    return (

        <nav
            className="
                navbar
                navbar-expand-lg
                shadow-sm
                lms-header
            "
        >

            <div className="container">


                {/* ==================================
                    LOGO
                ================================== */}

                <Link
                    className="
                        navbar-brand
                        fw-bold
                    "
                    to="/"
                    onClick={() =>
                        setShowNotifications(false)
                    }
                >
                    PHP LMS
                </Link>


                <div
                    className="
                        d-flex
                        align-items-center
                    "
                    style={{
                        gap: '10px'
                    }}
                >


                    {/* ==================================
                        LOGGED IN USER
                    ================================== */}

                    {isAuthenticated ? (

                        <>


                            {/* ==============================
                                HELLO USER
                            ============================== */}

                            <span
                                className="
                                    text-white
                                    d-none
                                    d-md-inline
                                "
                                style={{
                                    fontSize: '15px',
                                    whiteSpace: 'nowrap'
                                }}
                            >

                                Hello, {user?.name}

                            </span>


                            {/* ==============================
                                HOME ICON
                            ============================== */}

                            {showHomeButton && (

                                <button
                                    type="button"
                                    className="
                                        btn
                                        btn-outline-light
                                        d-flex
                                        align-items-center
                                        justify-content-center
                                    "
                                    onClick={
                                        handleHomeClick
                                    }
                                    title="Home"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        padding: '0',
                                        borderRadius: '50%'
                                    }}
                                >

                                    <MdHome
                                        size={22}
                                    />

                                </button>

                            )}


                            {/* ==============================
                                MY ACCOUNT
                            ============================== */}

                            <Link
                                to={accountPath}
                                className="
                                    btn
                                    btn-outline-light
                                    btn-sm
                                    d-flex
                                    align-items-center
                                "
                                onClick={() =>
                                    setShowNotifications(false)
                                }
                                style={{
                                    gap: '5px',
                                    whiteSpace: 'nowrap'
                                }}
                            >

                                <MdAccountCircle
                                    size={18}
                                />

                                <span>
                                    My Account
                                </span>

                            </Link>


                            {/* ==============================
                                CONTACT US
                            ============================== */}

                            <Link
                                to="/contact-us"
                                className="
                                    btn
                                    btn-outline-light
                                    btn-sm
                                    d-flex
                                    align-items-center
                                "
                                onClick={() =>
                                    setShowNotifications(false)
                                }
                                style={{
                                    gap: '5px',
                                    whiteSpace: 'nowrap'
                                }}
                            >

                                <MdEmail
                                    size={17}
                                />

                                <span>
                                    Contact Us
                                </span>

                            </Link>


                            {/* ==============================
                                ADMIN NOTIFICATIONS
                            ============================== */}

                            {isAdmin && (

                                <div
                                    className="
                                        position-relative
                                    "
                                    ref={
                                        notificationRef
                                    }
                                >

                                    <button
                                        type="button"
                                        className="
                                            btn
                                            btn-outline-light
                                            d-flex
                                            align-items-center
                                            justify-content-center
                                            position-relative
                                        "
                                        onClick={
                                            handleNotificationClick
                                        }
                                        title="Notifications"
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            padding: '0',
                                            borderRadius: '50%'
                                        }}
                                    >

                                        <MdNotifications
                                            size={22}
                                        />


                                        {unreadCount > 0 && (

                                            <span
                                                className="
                                                    position-absolute
                                                    badge
                                                    rounded-pill
                                                    bg-danger
                                                "
                                                style={{
                                                    fontSize: '9px',
                                                    minWidth: '18px',
                                                    height: '18px',
                                                    padding: '2px 4px',
                                                    top: '-5px',
                                                    right: '-5px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >

                                                {unreadCount > 99
                                                    ? '99+'
                                                    : unreadCount}

                                            </span>

                                        )}

                                    </button>


                                    {/* ==========================
                                        NOTIFICATION DROPDOWN
                                    ========================== */}

                                    {showNotifications && (

                                        <div
                                            className="
                                                position-absolute
                                                end-0
                                                mt-2
                                                bg-white
                                                shadow-lg
                                                rounded-3
                                                border
                                            "
                                            style={{
                                                width: '360px',
                                                maxWidth: '90vw',
                                                zIndex: 1050,
                                                overflow: 'hidden'
                                            }}
                                        >


                                            {/* HEADER */}

                                            <div
                                                className="
                                                    d-flex
                                                    justify-content-between
                                                    align-items-center
                                                    px-3
                                                    py-3
                                                    border-bottom
                                                "
                                            >

                                                <div
                                                    className="
                                                        d-flex
                                                        align-items-center
                                                    "
                                                    style={{
                                                        gap: '8px'
                                                    }}
                                                >

                                                    <MdNotifications
                                                        size={21}
                                                        className="
                                                            text-primary
                                                        "
                                                    />

                                                    <strong>
                                                        Notifications
                                                    </strong>

                                                </div>


                                                {unreadCount > 0 && (

                                                    <span
                                                        className="
                                                            badge
                                                            bg-danger
                                                        "
                                                    >
                                                        {unreadCount} new
                                                    </span>

                                                )}

                                            </div>


                                            {/* NOTIFICATIONS */}

                                            <div
                                                style={{
                                                    maxHeight: '400px',
                                                    overflowY: 'auto'
                                                }}
                                            >

                                                {loadingNotifications ? (

                                                    <div
                                                        className="
                                                            text-center
                                                            text-muted
                                                            py-5
                                                        "
                                                    >
                                                        Loading notifications...
                                                    </div>

                                                ) : notifications.length === 0 ? (

                                                    <div
                                                        className="
                                                            text-center
                                                            text-muted
                                                            py-5
                                                        "
                                                    >

                                                        <MdNotifications
                                                            size={35}
                                                            className="mb-2"
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
                                                                    className={`
                                                                        px-3
                                                                        py-3
                                                                        border-bottom
                                                                        ${
                                                                            isUnread
                                                                                ? 'bg-light'
                                                                                : ''
                                                                        }
                                                                    `}
                                                                    onClick={() =>
                                                                        handleSingleNotificationClick(
                                                                            notification
                                                                        )
                                                                    }
                                                                    style={{
                                                                        cursor: 'pointer'
                                                                    }}
                                                                >

                                                                    <div
                                                                        className="
                                                                            d-flex
                                                                        "
                                                                        style={{
                                                                            gap: '10px'
                                                                        }}
                                                                    >

                                                                        <MdNotifications
                                                                            size={21}
                                                                            className="
                                                                                text-primary
                                                                                mt-1
                                                                                flex-shrink-0
                                                                            "
                                                                        />


                                                                        <div
                                                                            className="
                                                                                flex-grow-1
                                                                            "
                                                                        >

                                                                            <div
                                                                                className="
                                                                                    fw-semibold
                                                                                "
                                                                            >
                                                                                {
                                                                                    notification.title
                                                                                }
                                                                            </div>


                                                                            <div
                                                                                className="
                                                                                    small
                                                                                    text-muted
                                                                                    mt-1
                                                                                "
                                                                            >
                                                                                {
                                                                                    notification.message
                                                                                }
                                                                            </div>


                                                                            {notification.created_at && (

                                                                                <div
                                                                                    className="
                                                                                        small
                                                                                        text-secondary
                                                                                        mt-1
                                                                                    "
                                                                                >

                                                                                    {formatNotificationTime(
                                                                                        notification.created_at
                                                                                    )}

                                                                                </div>

                                                                            )}

                                                                        </div>


                                                                        {isUnread && (

                                                                            <span
                                                                                className="
                                                                                    rounded-circle
                                                                                    bg-primary
                                                                                    flex-shrink-0
                                                                                "
                                                                                style={{
                                                                                    width: '8px',
                                                                                    height: '8px',
                                                                                    marginTop: '7px'
                                                                                }}
                                                                            />

                                                                        )}

                                                                    </div>

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


                            {/* ==============================
                                THEME
                            ============================== */}

                            <button
                                type="button"
                                className="theme-toggle"
                                onClick={toggleTheme}
                                title={
                                    theme === 'light'
                                        ? 'Dark Mode'
                                        : 'Light Mode'
                                }
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    padding: '0',
                                    flexShrink: 0
                                }}
                            >

                                {theme === 'light' ? (

                                    <MdDarkMode
                                        size={21}
                                    />

                                ) : (

                                    <MdLightMode
                                        size={21}
                                    />

                                )}

                            </button>


                            {/* ==============================
                                LOGOUT
                            ============================== */}

                            <button
                                type="button"
                                className="
                                    btn
                                    btn-outline-light
                                    btn-sm
                                "
                                onClick={
                                    handleLogout
                                }
                                style={{
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                Logout
                            </button>

                        </>

                    ) : (

                        /* ==================================
                           LOGGED OUT
                        ================================== */

                        <>

                            <Link
                                to="/contact-us"
                                className="
                                    btn
                                    btn-outline-light
                                    btn-sm
                                    d-flex
                                    align-items-center
                                "
                                style={{
                                    gap: '5px',
                                    whiteSpace: 'nowrap'
                                }}
                            >

                                <MdEmail
                                    size={17}
                                />

                                <span>
                                    Contact Us
                                </span>

                            </Link>


                            <Link
                                to="/login"
                                className="
                                    btn
                                    btn-outline-light
                                    btn-sm
                                "
                            >
                                Login
                            </Link>


                            <button
                                type="button"
                                className="theme-toggle"
                                onClick={toggleTheme}
                                title={
                                    theme === 'light'
                                        ? 'Dark Mode'
                                        : 'Light Mode'
                                }
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    padding: '0'
                                }}
                            >

                                {theme === 'light' ? (

                                    <MdDarkMode
                                        size={21}
                                    />

                                ) : (

                                    <MdLightMode
                                        size={21}
                                    />

                                )}

                            </button>

                        </>

                    )}

                </div>

            </div>

        </nav>

    );

};


export default Header;