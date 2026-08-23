import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isActive = (path) => location.pathname.startsWith(path) ? 'active' : '';

  return (
    <div className="bg-dark text-white" style={{ width: '250px', minHeight: 'calc(100vh - 56px)' }}>
      <div className="p-3">
        <h6 className="text-uppercase text-white-50 mb-3">{user?.role} Panel</h6>
        <nav className="nav flex-column gap-1">
          {user?.role === 'admin' && (
            <>
              <Link
                className={`sidebar-link ${isActive('/admin/dashboard')}`}
                to="/admin/dashboard"
              >
                Dashboard
              </Link>

              <Link
                className={`sidebar-link ${isActive('/admin/users')}`}
                to="/admin/users"
              >
                Users
              </Link>
              <Link
                to="/admin/change-password"
                className={`sidebar-link ${isActive('/admin/change-password')}`}
              >
                Change Password
              </Link>
            </>
          )}
          {user?.role === 'teacher' && (
            <>
              <Link
                className={`sidebar-link ${isActive('/teacher/dashboard')}`}
                to="/teacher/dashboard"
              >
                Dashboard
              </Link>

              <Link
                className={`sidebar-link ${isActive('/teacher/courses')}`}
                to="/teacher/courses"
              >
                My Courses
              </Link>

              <Link
                className={`sidebar-link ${isActive('/teacher/courses/create')}`}
                to="/teacher/courses/create"
              >
                Create Course
              </Link>

              <Link
                className={`sidebar-link ${isActive('/teacher/change-password')}`}
                to="/teacher/change-password"
              >
                Change Password
              </Link>
            </>
          )}
          {user?.role === 'student' && (
            <>
              <Link className={`sidebar-link ${isActive('/student/dashboard')}`} to="/student/dashboard">Dashboard</Link>
              <Link className={`sidebar-link ${isActive('/student/my-courses')}`} to="/student/my-courses">My Courses</Link>
              <Link className={`sidebar-link ${isActive('/courses')}`} to="/courses">Browse Courses</Link>
              <Link
                className={`sidebar-link ${isActive('/student/change-password')}`}
                to="/student/change-password"
              >
                Change Password
              </Link>
            </>
          )}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
