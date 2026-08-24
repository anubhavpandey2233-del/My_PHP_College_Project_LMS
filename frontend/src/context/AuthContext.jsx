
import { createContext, useContext, useEffect, useState } from 'react';
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
    // Check Login On Refresh
    // =====================================

    useEffect(() => {

        const initAuth = async () => {

            const storedToken = localStorage.getItem('token');

            // No token found
            if (!storedToken) {

                setLoading(false);
                return;
            }


            try {

                const res = await api.get('/auth/me.php');


                if (res.data.status) {

                    const loggedInUser =
                        res.data.data.user;


                    setUser(loggedInUser);

                    setToken(storedToken);


                    // Keep user data updated
                    localStorage.setItem(
                        'user',
                        JSON.stringify(loggedInUser)
                    );


                } else {

                    clearAuth();

                }


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

    const login = async (email, password) => {

        try {

            const res = await api.post(
                '/auth/login.php',
                {
                    email,
                    password
                }
            );


            if (res.data.status) {

                const { token, user } =
                    res.data.data;


                localStorage.setItem(
                    'token',
                    token
                );


                localStorage.setItem(
                    'user',
                    JSON.stringify(user)
                );


                setToken(token);

                setUser(user);


                return {
                    success: true,
                    user: user
                };

            }


            return {
                success: false,
                message:
                    res.data.message ||
                    'Login failed'
            };


        } catch (error) {

            console.error(
                'Login Error:',
                error
            );


            return {
                success: false,
                message:
                    error.response?.data?.message ||
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

            console.error(
                'Logout API Error:',
                error
            );

        } finally {

            // Clear local authentication
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

