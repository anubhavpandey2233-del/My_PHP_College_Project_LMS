
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

  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const notificationRef = useRef(null);


  // ==========================================
  // CHECK TEACHER
  // ==========================================

  const isTeacher =
    isAuthenticated &&
    user?.role === 'teacher';


  // ==========================================
  // FETCH NOTIFICATIONS
  // ==========================================

  const fetchNotifications = async () => {

    if (!isTeacher) {
      return [];
    }

    try {

      const res = await api.get(
        '/notifications/list.php'
      );

      if (res.data.status) {

        const notificationData =
          res.data.data?.notifications || [];

        const count =
          Number(
            res.data.data?.unread_count || 0
          );

        setNotifications(notificationData);
        setUnreadCount(count);

        return notificationData;

      }

      return [];

    } catch (error) {

      console.error(
        'Notification Error:',
        error
      );

      return [];

    }

  };


  // ==========================================
  // MARK NOTIFICATION AS READ
  // ==========================================

  const markAsRead = async (notificationId) => {

    try {

      const res = await api.post(
        '/notifications/mark-read.php',
        {
          notification_id: notificationId
        }
      );

      return res.data.status;

    } catch (error) {

      console.error(
        'Mark Notification Read Error:',
        error
      );

      return false;

    }

  };


  // ==========================================
  // OPEN NOTIFICATIONS
  // ==========================================

  const handleNotificationClick = async () => {

    // Open / close dropdown
    setShowNotifications((prev) => !prev);


    // If already open, just close it
    if (showNotifications) {
      return;
    }


    // Fetch latest notifications
    const latestNotifications =
      await fetchNotifications();


    // Get unread notifications
    const unreadNotifications =
      latestNotifications.filter(
        (notification) =>
          Number(notification.is_read) === 0
      );


    // ==========================================
    // MARK ALL UNREAD NOTIFICATIONS AS READ
    // ==========================================

    if (unreadNotifications.length > 0) {

      await Promise.all(
        unreadNotifications.map(
          (notification) =>
            markAsRead(notification.id)
        )
      );


      // Update notifications locally
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          is_read: 1
        }))
      );


      // Remove badge immediately
      setUnreadCount(0);

    }

  };


  // ==========================================
  // FETCH WHEN TEACHER LOGIN
  // ==========================================

  useEffect(() => {

    if (isTeacher) {

      fetchNotifications();

    } else {

      setNotifications([]);
      setUnreadCount(0);
      setShowNotifications(false);

    }

  }, [isTeacher]);


  // ==========================================
  // AUTO REFRESH
  // ==========================================

  useEffect(() => {

    if (!isTeacher) {
      return;
    }

    const interval = setInterval(() => {

      fetchNotifications();

    }, 30000);

    return () => {

      clearInterval(interval);

    };

  }, [isTeacher]);


  // ==========================================
  // CLOSE DROPDOWN OUTSIDE
  // ==========================================

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


  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = async () => {

    await logout();

    navigate('/login');

  };


  // ==========================================
  // FORMAT NOTIFICATION TIME
  // ==========================================

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


  // ==========================================
  // RENDER
  // ==========================================

  return (

    <nav className="navbar navbar-expand-lg shadow-sm lms-header">

      <div className="container">


        {/* ==========================================
            LOGO
        ========================================== */}

        <Link
          className="navbar-brand fw-bold"
          to="/"
        >
          PHP LMS
        </Link>


        {/* ==========================================
            RIGHT SIDE
        ========================================== */}

        <div
          className="d-flex align-items-center"
          style={{
            gap: '10px'
          }}
        >


          {/* ==========================================
              AUTHENTICATED USER
          ========================================== */}

          {isAuthenticated ? (

            <>


              {/* ==========================================
                  HELLO USER
              ========================================== */}

              <span
                className="text-white d-none d-md-inline"
                style={{
                  fontSize: '15px',
                  whiteSpace: 'nowrap'
                }}
              >
                Hello, {user?.name}
              </span>


              {/* ==========================================
                  CONTACT US
              ========================================== */}

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


              {/* ==========================================
                  TEACHER NOTIFICATIONS
              ========================================== */}

              {isTeacher && (

                <div
                  className="position-relative"
                  ref={notificationRef}
                >


                  {/* ==========================================
                      NOTIFICATION BUTTON
                  ========================================== */}

                  <button
                    type="button"
                    className="btn btn-outline-light d-flex align-items-center justify-content-center position-relative"
                    onClick={handleNotificationClick}
                    title="Notifications"
                    style={{
                      width: '40px',
                      height: '40px',
                      padding: '0',
                      borderRadius: '50%'
                    }}
                  >

                    <MdNotifications size={22} />


                    {/* ==========================================
                        UNREAD BADGE
                    ========================================== */}

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


                  {/* ==========================================
                      NOTIFICATION DROPDOWN
                  ========================================== */}

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


                      {/* ==========================================
                          DROPDOWN HEADER
                      ========================================== */}

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


                        {/* New count */}

                        {unreadCount > 0 && (

                          <span className="badge bg-danger">

                            {unreadCount} new

                          </span>

                        )}

                      </div>


                      {/* ==========================================
                          NOTIFICATION LIST
                      ========================================== */}

                      <div
                        style={{
                          maxHeight: '400px',
                          overflowY: 'auto'
                        }}
                      >

                        {notifications.length === 0 ? (

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
                                  style={{
                                    cursor: 'default'
                                  }}
                                >

                                  <div
                                    className="d-flex"
                                    style={{
                                      gap: '10px'
                                    }}
                                  >


                                    {/* Notification Icon */}

                                    <MdNotifications
                                      size={21}
                                      className="text-primary mt-1 flex-shrink-0"
                                    />


                                    {/* Notification Content */}

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


                                    {/* Unread Dot */}

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


              {/* ==========================================
                  THEME TOGGLE
              ========================================== */}

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


              {/* ==========================================
                  LOGOUT
              ========================================== */}

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

            /* ==========================================
               GUEST USER
            ========================================== */

            <>


              {/* Login */}

              <Link
                to="/login"
                className="btn btn-outline-light btn-sm"
              >
                Login
              </Link>


              {/* Register */}

              <Link
                to="/register"
                className="btn btn-light btn-sm"
              >
                Register
              </Link>


              {/* Theme Toggle */}

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

