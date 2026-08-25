
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

import {
  MdDarkMode,
  MdLightMode,
  MdEmail
} from 'react-icons/md';

const Header = () => {

  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg shadow-sm lms-header">

      <div className="container">

        {/* =========================
            LOGO
        ========================= */}
        <Link
          className="navbar-brand"
          to="/"
        >
          PHP LMS
        </Link>


        {/* =========================
            RIGHT SIDE
        ========================= */}
        <div className="d-flex align-items-center gap-2">

         


          {/* =========================
              AUTHENTICATED USER
          ========================= */}
          {isAuthenticated ? (

            <>

              <span className="text-white d-none d-md-inline">
                Hello, {user?.name}
              </span>


              {/* Logout */}
              <button
                type="button"
                className="btn btn-outline-light btn-sm"
                onClick={handleLogout}
              >
                Logout
              </button>


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
              >
                {theme === 'light' ? (
                  <MdDarkMode size={21} />
                ) : (
                  <MdLightMode size={21} />
                )}
              </button>

               {/* =========================
              CONTACT US
          ========================= */}
          <Link
            to="/contact-us"
            className="btn btn-outline-light btn-sm d-flex align-items-center gap-1"
          >
            <MdEmail size={17} />
            <span>Contact Us</span>
          </Link>

            </>

          ) : (

            /* =========================
               GUEST USER
            ========================= */
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

