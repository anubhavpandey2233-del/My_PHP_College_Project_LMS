
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from './Loading';

const RoleProtectedRoute = ({
    children,
    allowedRoles
}) => {

    const {
        user,
        loading,
        isAuthenticated
    } = useAuth();


    // --------------------------------
    // Auth check abhi complete nahi hua
    // --------------------------------

    if (loading) {
        return <Loading />;
    }


    // --------------------------------
    // User login nahi hai
    // --------------------------------

    if (!isAuthenticated || !user) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }


    // --------------------------------
    // Role check
    // --------------------------------

    if (!allowedRoles.includes(user.role)) {

        if (user.role === 'admin') {

            return (
                <Navigate
                    to="/admin/dashboard"
                    replace
                />
            );

        }

        if (user.role === 'teacher') {

            return (
                <Navigate
                    to="/teacher/dashboard"
                    replace
                />
            );

        }

        return (
            <Navigate
                to="/student/dashboard"
                replace
            />
        );
    }


    // --------------------------------
    // Authorized user
    // --------------------------------

    return children;
};

export default RoleProtectedRoute;

