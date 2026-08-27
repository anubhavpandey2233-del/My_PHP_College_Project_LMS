
import {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';

import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');

      return storedUser
        ? JSON.parse(storedUser)
        : null;

    } catch (error) {
      console.error('Stored user error:', error);
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem('token') || null
  );

  const [loading, setLoading] = useState(true);


  const saveAuth = (newToken, newUser) => {

    localStorage.setItem(
      'token',
      newToken
    );

    localStorage.setItem(
      'user',
      JSON.stringify(newUser)
    );

    setToken(newToken);
    setUser(newUser);
  };


  const clearAuth = () => {

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setToken(null);
    setUser(null);
  };


  const fetchCurrentUser = async (storedToken) => {

    const res = await api.get(
      '/auth/me.php'
    );

    if (!res.data.status) {
      throw new Error(
        res.data.message ||
        'Authentication failed'
      );
    }

    const currentUser =
      res.data.data?.user;

    if (!currentUser) {
      throw new Error(
        'User data not found'
      );
    }

    saveAuth(
      storedToken,
      currentUser
    );

    return currentUser;
  };


  useEffect(() => {

    const initAuth = async () => {

      const storedToken =
        localStorage.getItem('token');

      const storedUser =
        localStorage.getItem('user');


      if (!storedToken) {

        setLoading(false);
        return;

      }


      if (storedUser) {

        try {

          const parsedUser =
            JSON.parse(storedUser);

          setUser(parsedUser);
          setToken(storedToken);

        } catch (error) {

          localStorage.removeItem('user');

        }

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
        loginData?.token;


      const loggedInUser =
        loginData?.user;


      if (!newToken || !loggedInUser) {

        return {
          success: false,
          message:
            'Invalid login response'
        };

      }


      saveAuth(
        newToken,
        loggedInUser
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
          'Something went wrong while logging in'
      };

    }

  };


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


export const useAuth = () =>
  useContext(AuthContext);

