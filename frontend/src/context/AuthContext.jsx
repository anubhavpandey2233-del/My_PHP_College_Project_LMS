
import {
    createContext,
    useContext,
    useEffect,
    useState
} from 'react';

import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);

    const [token, setToken] = useState(
        localStorage.getItem('token') || null
    );

    const [loading, setLoading] = useState(true);


    // =====================================
    // Clear Authentication
    // =====================================

    const clearAuth = () => {

        localStorage.removeItem('token');
        localStorage.removeItem('user');

        setToken(null);
        setUser(null);
    };


    // =====================================
    // Get Complete User From API
    // =====================================

    const fetchCurrentUser = async (storedToken) => {

        const res = await api.get('/auth/me.php');

        if (!res.data.status) {
            throw new Error(
                res.data.message || 'Authentication failed'
            );
        }

        const loggedInUser =
            res.data.data.user;

        // Update React state
        setUser(loggedInUser);
        setToken(storedToken);

        // Update localStorage
        localStorage.setItem(
            'user',
            JSON.stringify(loggedInUser)
        );

        return loggedInUser;
    };


    // =====================================
    // Check Login On Refresh
    // =====================================

    useEffect(() => {

        const initAuth = async () => {

            const storedToken =
                localStorage.getItem('token');


            // No token
            if (!storedToken) {

                setLoading(false);
                return;
            }


            try {

                await fetchCurrentUser(
                    storedToken
                );

            } catch (error) {

                console.error(
                    'Authentication Error:',
                    error
                );

                clearAuth();

            } finally {

                setLoading(false);

            }
        };


        initAuth();

    }, []);


    // =====================================
    // Login
    // =====================================

    const login = async (
        email,
        password
    ) => {

        try {

            const res = await api.post(
                '/auth/login.php',
                {
                    email,
                    password
                }
            );


            if (!res.data.status) {

                return {
                    success: false,
                    message:
                        res.data.message ||
                        'Login failed'
                };
            }


            const loginData =
                res.data.data;

            const newToken =
                loginData.token;


            // Save token first
            localStorage.setItem(
                'token',
                newToken
            );

            setToken(newToken);


            // =====================================
            // IMPORTANT
            // Fetch complete user profile
            // =====================================

            const loggedInUser =
                await fetchCurrentUser(
                    newToken
                );


            return {
                success: true,
                user: loggedInUser
            };


        } catch (error) {

            console.error(
                'Login Error:',
                error
            );

            clearAuth();


            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    error.message ||
                    'Something went wrong'
            };
        }
    };


    // =====================================
    // Register
    // =====================================

    const register = async (
        name,
        email,
        password,
        role = 'student'
    ) => {

        try {

            const res = await api.post(
                '/auth/register.php',
                {
                    name,
                    email,
                    password,
                    role
                }
            );

            return res.data;

        } catch (error) {

            console.error(
                'Register Error:',
                error
            );

            return {
                status: false,
                message:
                    error.response?.data?.message ||
                    'Registration failed'
            };
        }
    };


    // =====================================
    // Logout
    // =====================================

    const logout = async () => {

        try {

            await api.post(
                '/auth/logout.php'
            );

        } catch (error) {

            console.warn(
                'Logout API Error:',
                error
            );

        } finally {

            clearAuth();

        }
    };


    // =====================================
    // Context
    // =====================================

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                token,
                loading,
                login,
                register,
                logout,
                isAuthenticated: !!user
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};


// =====================================
// Custom Hook
// =====================================

export const useAuth = () =>
    useContext(AuthContext);

