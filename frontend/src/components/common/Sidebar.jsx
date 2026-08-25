
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {

  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) =>
    location.pathname.startsWith(path) ? 'active' : '';


  // =====================================
  // Avatar URL
  // =====================================

  const avatarUrl = user?.avatar
    ? `http://localhost/php-lms-project/backend/uploads/avatars/${user.avatar}`
    : null;


  return (

    <div
      className="bg-dark text-white"
      style={{
        width: '250px',
        minHeight: 'calc(100vh - 56px)'
      }}
    >

      <div className="p-3">


        {/* =====================================
            PANEL TITLE
        ===================================== */}

        <h6 className="text-uppercase text-white-50 mb-3">
          {user?.role} Panel
        </h6>


        <nav className="nav flex-column gap-1">


          {/* =====================================
              ADMIN SIDEBAR
          ===================================== */}

          {user?.role === 'admin' && (

            <>

              <Link
                className={`sidebar-link ${isActive(
                  '/admin/dashboard'
                )}`}
                to="/admin/dashboard"
              >
                <i className="bi bi-speedometer2 me-2"></i>
                Dashboard
              </Link>


              <Link
                className={`sidebar-link ${isActive(
                  '/admin/categories'
                )}`}
                to="/admin/categories"
              >
                <i className="bi bi-tags me-2"></i>
                Categories
              </Link>


              <Link
                className={`sidebar-link ${isActive(
                  '/admin/subcategories'
                )}`}
                to="/admin/subcategories"
              >
                <i className="bi bi-diagram-3 me-2"></i>
                Subcategories
              </Link>


              <Link
                className={`sidebar-link ${isActive(
                  '/admin/courses'
                )}`}
                to="/admin/courses"
              >
                <i className="bi bi-book me-2"></i>
                Courses
              </Link>


              <Link
                className={`sidebar-link ${isActive(
                  '/admin/users'
                )}`}
                to="/admin/users"
              >
                <i className="bi bi-people me-2"></i>
                Users
              </Link>


              <Link
                className={`sidebar-link ${isActive(
                  '/admin/enrollments'
                )}`}
                to="/admin/enrollments"
              >
                <i className="bi bi-person-check me-2"></i>
                Enrollments
              </Link>


              <Link
                className={`sidebar-link ${isActive(
                  '/admin/reviews'
                )}`}
                to="/admin/reviews"
              >
                <i className="bi bi-star me-2"></i>
                Reviews
              </Link>


              <Link
                className={`sidebar-link ${isActive(
                  '/admin/change-password'
                )}`}
                to="/admin/change-password"
              >
                <i className="bi bi-key me-2"></i>
                Change Password
              </Link>

            </>

          )}


          {/* =====================================
              TEACHER SIDEBAR
          ===================================== */}

          {user?.role === 'teacher' && (

            <>

              <Link
                className={`sidebar-link ${isActive(
                  '/teacher/dashboard'
                )}`}
                to="/teacher/dashboard"
              >
                <i className="bi bi-speedometer2 me-2"></i>
                Dashboard
              </Link>


              <Link
                className={`sidebar-link ${isActive(
                  '/teacher/courses'
                )}`}
                to="/teacher/courses"
              >
                <i className="bi bi-book me-2"></i>
                My Courses
              </Link>


              <Link
                className={`sidebar-link ${isActive(
                  '/teacher/courses/create'
                )}`}
                to="/teacher/courses/create"
              >
                <i className="bi bi-plus-circle me-2"></i>
                Create Course
              </Link>


              {/* =====================================
                  TEACHER ENROLLMENTS
              ===================================== */}

              <Link
                className={`sidebar-link ${isActive(
                  '/teacher/enrollments'
                )}`}
                to="/teacher/enrollments"
              >
                <i className="bi bi-person-check me-2"></i>
                Enrollments
              </Link>


              <Link
                className={`sidebar-link ${isActive(
                  '/teacher/change-password'
                )}`}
                to="/teacher/change-password"
              >
                <i className="bi bi-key me-2"></i>
                Change Password
              </Link>

            </>

          )}


          {/* =====================================
              STUDENT SIDEBAR
          ===================================== */}

          {user?.role === 'student' && (

            <>

              <Link
                className={`sidebar-link ${isActive(
                  '/student/dashboard'
                )}`}
                to="/student/dashboard"
              >
                <i className="bi bi-speedometer2 me-2"></i>
                Dashboard
              </Link>


              <Link
                className={`sidebar-link ${isActive(
                  '/student/my-courses'
                )}`}
                to="/student/my-courses"
              >
                <i className="bi bi-book me-2"></i>
                My Courses
              </Link>


              <Link
                className={`sidebar-link ${isActive(
                  '/courses'
                )}`}
                to="/courses"
              >
                <i className="bi bi-search me-2"></i>
                Browse Courses
              </Link>


              <Link
                className={`sidebar-link ${isActive(
                  '/student/change-password'
                )}`}
                to="/student/change-password"
              >
                <i className="bi bi-key me-2"></i>
                Change Password
              </Link>

            </>

          )}

        </nav>


        {/* =====================================
            PROFILE
        ===================================== */}

        <div className="mt-4 pt-3 border-top border-secondary">

          <Link
            to={`/${user?.role}/profile`}
            className="text-decoration-none text-white d-flex align-items-center gap-3"
          >

            {/* Avatar */}

            {avatarUrl ? (

              <img
                src={avatarUrl}
                alt="Profile"
                className="rounded-circle"
                style={{
                  width: '42px',
                  height: '42px',
                  minWidth: '42px',
                  objectFit: 'cover',
                  border: '2px solid #fff'
                }}
              />

            ) : (

              <div
                className="rounded-circle bg-primary d-flex align-items-center justify-content-center"
                style={{
                  width: '42px',
                  height: '42px',
                  minWidth: '42px'
                }}
              >

                <i className="bi bi-person-fill fs-5"></i>

              </div>

            )}


            {/* User Info */}

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

    </div>

  );

};


export default Sidebar;

