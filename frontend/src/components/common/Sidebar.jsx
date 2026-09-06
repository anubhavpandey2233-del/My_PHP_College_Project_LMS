import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaBars, FaTimes } from 'react-icons/fa';
import './Sidebar.scss';

const Sidebar = () => {

  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path) =>
    location.pathname.startsWith(path) ? 'active' : '';

  const avatarUrl = user?.avatar
    ? `http://localhost/php-lms-project/backend/uploads/avatars/${user.avatar}`
    : null;

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className="sidebar-mobile-toggle"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
      >
        <FaBars />
      </button>

      {isOpen && (
        <div
          className="sidebar-mobile-overlay"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <aside
        className={`sidebar-wrapper ${isOpen ? 'sidebar-open' : ''}`}
      >

        <button
          type="button"
          className="sidebar-mobile-close"
          onClick={() => setIsOpen(false)}
          aria-label="Close menu"
        >
          <i className="bi bi-x-lg"></i>
        </button>

        <div className="sidebar-inner">

          <h6 className="text-uppercase text-white-50 mb-3">
            {user?.role} Panel
          </h6>

          <nav className="nav flex-column gap-1">

            {user?.role === 'admin' && (
              <>
                <Link
                  className={`sidebar-link ${isActive('/admin/dashboard')}`}
                  to="/admin/dashboard"
                  onClick={handleLinkClick}
                >
                  <i className="bi bi-speedometer2 me-2"></i>
                  Dashboard
                </Link>

                <Link
                  className={`sidebar-link ${isActive('/admin/categories')}`}
                  to="/admin/categories"
                  onClick={handleLinkClick}
                >
                  <i className="bi bi-tags me-2"></i>
                  Categories
                </Link>

                <Link
                  className={`sidebar-link ${isActive('/admin/subcategories')}`}
                  to="/admin/subcategories"
                  onClick={handleLinkClick}
                >
                  <i className="bi bi-diagram-3 me-2"></i>
                  Subcategories
                </Link>

                <Link
                  className={`sidebar-link ${isActive('/admin/courses')}`}
                  to="/admin/courses"
                  onClick={handleLinkClick}
                >
                  <i className="bi bi-book me-2"></i>
                  Courses
                </Link>

                <Link
                  className={`sidebar-link ${isActive('/admin/users')}`}
                  to="/admin/users"
                  onClick={handleLinkClick}
                >
                  <i className="bi bi-people me-2"></i>
                  Users
                </Link>

                <Link
                  className={`sidebar-link ${isActive('/admin/enrollments')}`}
                  to="/admin/enrollments"
                  onClick={handleLinkClick}
                >
                  <i className="bi bi-person-check me-2"></i>
                  Enrollments
                </Link>

                <Link
                  className={`sidebar-link ${isActive('/admin/reviews')}`}
                  to="/admin/reviews"
                  onClick={handleLinkClick}
                >
                  <i className="bi bi-star me-2"></i>
                  Reviews
                </Link>

                <Link
                  className={`sidebar-link ${isActive('/admin/change-password')}`}
                  to="/admin/change-password"
                  onClick={handleLinkClick}
                >
                  <i className="bi bi-key me-2"></i>
                  Change Password
                </Link>
              </>
            )}

            {user?.role === 'teacher' && (
              <>
                <Link
                  className={`sidebar-link ${isActive('/teacher/dashboard')}`}
                  to="/teacher/dashboard"
                  onClick={handleLinkClick}
                >
                  <i className="bi bi-speedometer2 me-2"></i>
                  Dashboard
                </Link>

                <Link
                  className={`sidebar-link ${isActive('/teacher/courses')}`}
                  to="/teacher/courses"
                  onClick={handleLinkClick}
                >
                  <i className="bi bi-book me-2"></i>
                  My Courses
                </Link>

                <Link
                  className={`sidebar-link ${isActive('/teacher/courses/create')}`}
                  to="/teacher/courses/create"
                  onClick={handleLinkClick}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Create Course
                </Link>

                <Link
                  className={`sidebar-link ${isActive('/teacher/enrollments')}`}
                  to="/teacher/enrollments"
                  onClick={handleLinkClick}
                >
                  <i className="bi bi-person-check me-2"></i>
                  Enrollments
                </Link>

                <Link
                  className={`sidebar-link ${isActive('/teacher/quiz-results')}`}
                  to="/teacher/quiz-results"
                  onClick={handleLinkClick}
                >
                  <i className="bi bi-bar-chart-line me-2"></i>
                  Quiz Results
                </Link>

                <Link
                  className={`sidebar-link ${isActive('/teacher/change-password')}`}
                  to="/teacher/change-password"
                  onClick={handleLinkClick}
                >
                  <i className="bi bi-key me-2"></i>
                  Change Password
                </Link>
              </>
            )}

            {user?.role === 'student' && (
              <>
                <Link
                  className={`sidebar-link ${isActive('/student/dashboard')}`}
                  to="/student/dashboard"
                  onClick={handleLinkClick}
                >
                  <i className="bi bi-speedometer2 me-2"></i>
                  Dashboard
                </Link>

                <Link
                  className={`sidebar-link ${isActive('/student/my-courses')}`}
                  to="/student/my-courses"
                  onClick={handleLinkClick}
                >
                  <i className="bi bi-book me-2"></i>
                  My Courses
                </Link>

                <Link
                  className={`sidebar-link ${isActive('/courses')}`}
                  to="/courses"
                  onClick={handleLinkClick}
                >
                  <i className="bi bi-search me-2"></i>
                  Browse Courses
                </Link>

                <Link
                  className={`sidebar-link ${isActive('/student/change-password')}`}
                  to="/student/change-password"
                  onClick={handleLinkClick}
                >
                  <i className="bi bi-key me-2"></i>
                  Change Password
                </Link>
              </>
            )}

          </nav>

          <div className="mt-4 pt-3 border-top border-secondary">

            <Link
              to={`/${user?.role}/profile`}
              className="text-decoration-none text-white d-flex align-items-center gap-3"
              onClick={handleLinkClick}
            >

              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="rounded-circle sidebar-avatar"
                />
              ) : (
                <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center sidebar-avatar">
                  <i className="bi bi-person-fill fs-5"></i>
                </div>
              )}

              <div className="overflow-hidden">

                <div className="fw-semibold text-truncate">
                  {user?.name || 'User'}
                </div>

                <small className="text-white-50">
                  View Profile
                </small>

              </div>

            </Link>

          </div>

        </div>

      </aside>
    </>
  );
};

export default Sidebar;