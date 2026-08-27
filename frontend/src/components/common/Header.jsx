
import {
    useEffect,
    useRef,
    useState
} from 'react';

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

import {
    MdDarkMode,
    MdLightMode,
    MdEmail,
    MdNotifications
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

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    const [loadingNotifications, setLoadingNotifications] = useState(false);

    const notificationRef = useRef(null);

    const isTeacher =
        isAuthenticated &&
        user?.role === 'teacher';

    const isAdmin =
        isAuthenticated &&
        user?.role === 'admin';

    const hasNotificationAccess =
        isTeacher || isAdmin;

    const fetchNotifications = async () => {

        if (!hasNotificationAccess) {
            return [];
        }

        try {

            setLoadingNotifications(true);

            const response = await api.get(
                '/notifications/list.php'
            );

            if (response.data.status) {

                const notificationData =
                    response.data.data?.notifications || [];

                const count =
                    Number(
                        response.data.data?.unread_count || 0
                    );

                setNotifications(notificationData);
                setUnreadCount(count);

                return notificationData;
            }

            setNotifications([]);
            setUnreadCount(0);

            return [];

        } catch (error) {

            console.error(
                'Notification Error:',
                error
            );

            return [];

        } finally {

            setLoadingNotifications(false);

        }
    };

    const markAsRead = async (notificationId) => {

        try {

            const response = await api.post(
                '/notifications/mark-read.php',
                {
                    notification_id: notificationId
                }
            );

            if (response.data.status) {

                setNotifications((prev) =>
                    prev.map((notification) =>
                        Number(notification.id) ===
                        Number(notificationId)
                            ? {
                                ...notification,
                                is_read: 1
                            }
                            : notification
                    )
                );

                setUnreadCount((prev) =>
                    Math.max(0, prev - 1)
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

    const handleNotificationClick = async () => {

        const willOpen =
            !showNotifications;

        setShowNotifications(willOpen);

        if (willOpen) {
            await fetchNotifications();
        }
    };

    const handleSingleNotificationClick = async (
        notification
    ) => {

        if (
            Number(notification.is_read) === 0
        ) {

            await markAsRead(
                notification.id
            );
        }

        setShowNotifications(false);

        if (notification.link) {

            navigate(notification.link);

            return;
        }

        if (
            notification.type === 'contact_message' ||
            notification.type === 'contact'
        ) {

            navigate('/admin/contact-messages');

            return;
        }
    };

    useEffect(() => {

        if (hasNotificationAccess) {

            fetchNotifications();

        } else {

            setNotifications([]);
            setUnreadCount(0);
            setShowNotifications(false);

        }

    }, [hasNotificationAccess]);

    useEffect(() => {

        if (!hasNotificationAccess) {
            return;
        }

        const interval =
            setInterval(() => {

                fetchNotifications();

            }, 30000);

        return () => {
            clearInterval(interval);
        };

    }, [hasNotificationAccess]);

    useEffect(() => {

        const handleClickOutside = (event) => {

            if (
                notificationRef.current &&
                !notificationRef.current.contains(
                    event.target
                )
            ) {

                setShowNotifications(false);
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

    const handleLogout = async () => {

        await logout();

        navigate('/login');
    };

    const formatNotificationTime = (date) => {

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

    return (

        <nav
            className="navbar navbar-expand-lg shadow-sm lms-header"
        >

            <div className="container">

                <Link
                    className="navbar-brand fw-bold"
                    to="/"
                >
                    PHP LMS
                </Link>

                <div
                    className="d-flex align-items-center"
                    style={{
                        gap: '10px'
                    }}
                >

                    {isAuthenticated ? (

                        <>

                            <span
                                className="text-white d-none d-md-inline"
                                style={{
                                    fontSize: '15px',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                Hello, {user?.name}
                            </span>

                            <Link
                                to="/contact-us"
                                className="btn btn-outline-light btn-sm d-flex align-items-center"
                                style={{
                                    gap: '5px',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                <MdEmail size={17} />

                                <span>
                                    Contact Us
                                </span>
                            </Link>

                            {hasNotificationAccess && (

                                <div
                                    className="position-relative"
                                    ref={notificationRef}
                                >

                                    <button
                                        type="button"
                                        className="btn btn-outline-light d-flex align-items-center justify-content-center position-relative"
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
                                                className="position-absolute badge rounded-pill bg-danger"
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

                                    {showNotifications && (

                                        <div
                                            className="position-absolute end-0 mt-2 bg-white shadow-lg rounded-3 border"
                                            style={{
                                                width: '360px',
                                                maxWidth: '90vw',
                                                zIndex: 1050,
                                                overflow: 'hidden'
                                            }}
                                        >

                                            <div
                                                className="d-flex justify-content-between align-items-center px-3 py-3 border-bottom"
                                            >

                                                <div
                                                    className="d-flex align-items-center"
                                                    style={{
                                                        gap: '8px'
                                                    }}
                                                >

                                                    <MdNotifications
                                                        size={21}
                                                        className="text-primary"
                                                    />

                                                    <strong>
                                                        Notifications
                                                    </strong>

                                                </div>

                                                {unreadCount > 0 && (

                                                    <span className="badge bg-danger">
                                                        {unreadCount} new
                                                    </span>

                                                )}

                                            </div>

                                            <div
                                                style={{
                                                    maxHeight: '400px',
                                                    overflowY: 'auto'
                                                }}
                                            >

                                                {loadingNotifications ? (

                                                    <div
                                                        className="text-center text-muted py-5"
                                                    >
                                                        Loading notifications...
                                                    </div>

                                                ) : notifications.length === 0 ? (

                                                    <div
                                                        className="text-center text-muted py-5"
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
                                                                    className={`px-3 py-3 border-bottom ${
                                                                        isUnread
                                                                            ? 'bg-light'
                                                                            : ''
                                                                    }`}
                                                                    onClick={() =>
                                                                        handleSingleNotificationClick(
                                                                            notification
                                                                        )
                                                                    }
                                                                    style={{
                                                                        cursor:
                                                                            notification.link ||
                                                                            notification.type === 'contact_message' ||
                                                                            notification.type === 'contact'
                                                                                ? 'pointer'
                                                                                : 'default'
                                                                    }}
                                                                >

                                                                    <div
                                                                        className="d-flex"
                                                                        style={{
                                                                            gap: '10px'
                                                                        }}
                                                                    >

                                                                        <MdNotifications
                                                                            size={21}
                                                                            className="text-primary mt-1 flex-shrink-0"
                                                                        />

                                                                        <div
                                                                            className="flex-grow-1"
                                                                        >

                                                                            <div
                                                                                className="fw-semibold"
                                                                            >
                                                                                {
                                                                                    notification.title
                                                                                }
                                                                            </div>

                                                                            <div
                                                                                className="small text-muted mt-1"
                                                                            >
                                                                                {
                                                                                    notification.message
                                                                                }
                                                                            </div>

                                                                            {notification.created_at && (

                                                                                <div
                                                                                    className="small text-secondary mt-1"
                                                                                >
                                                                                    {formatNotificationTime(
                                                                                        notification.created_at
                                                                                    )}
                                                                                </div>

                                                                            )}

                                                                        </div>

                                                                        {isUnread && (

                                                                            <span
                                                                                className="rounded-circle bg-primary flex-shrink-0"
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

                                    <MdDarkMode size={21} />

                                ) : (

                                    <MdLightMode size={21} />

                                )}

                            </button>

                            <button
                                type="button"
                                className="btn btn-outline-light btn-sm"
                                onClick={handleLogout}
                                style={{
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                Logout
                            </button>

                        </>

                    ) : (

                        <>

                            <Link
                                to="/login"
                                className="btn btn-outline-light btn-sm"
                            >
                                Login
                            </Link>

                            <Link
                                to="/register"
                                className="btn btn-light btn-sm"
                            >
                                Register
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

                                    <MdDarkMode size={21} />

                                ) : (

                                    <MdLightMode size={21} />

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

