
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError('');
        setLoading(true);

        try {

            const result = await login(
                email.trim(),
                password
            );

            if (result?.success) {

                const role = String(
                    result.user?.role || ''
                ).toLowerCase();

                if (role === 'admin') {
                    navigate('/admin/dashboard');
                    return;
                }

                if (role === 'teacher') {
                    navigate('/teacher/dashboard');
                    return;
                }

                if (role === 'student') {
                    navigate('/student/dashboard');
                    return;
                }

                setError('Invalid user role');
                return;
            }

            setError(
                result?.message ||
                'Invalid email or password'
            );

        } catch (err) {

            console.error(
                'Login error:',
                err
            );

            setError(
                err.response?.data?.message ||
                'Something went wrong while logging in'
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="d-flex flex-column min-vh-100">

            <Header />

            <div className="container my-5 flex-grow-1">

                <div className="row justify-content-center">

                    <div className="col-md-5">

                        <div className="card shadow border-0">

                            <div className="card-body p-4">

                                <h3 className="text-center mb-4">
                                    Login
                                </h3>

                                {error && (

                                    <div className="alert alert-danger">

                                        <i className="bi bi-exclamation-triangle me-2"></i>

                                        {error}

                                    </div>

                                )}

                                <form onSubmit={handleSubmit}>

                                    <div className="mb-3">

                                        <label className="form-label">
                                            Email
                                        </label>

                                        <input
                                            type="email"
                                            className="form-control"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            placeholder="Enter your email"
                                            autoComplete="email"
                                            required
                                        />

                                    </div>

                                    <div className="mb-3">

                                        <label className="form-label">
                                            Password
                                        </label>

                                        <input
                                            type="password"
                                            className="form-control"
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                            placeholder="Enter your password"
                                            autoComplete="current-password"
                                            required
                                        />

                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100"
                                        disabled={loading}
                                    >

                                        {loading ? (

                                            <>
                                                <span
                                                    className="spinner-border spinner-border-sm me-2"
                                                    role="status"
                                                ></span>

                                                Logging in...
                                            </>

                                        ) : (

                                            'Login'

                                        )}

                                    </button>

                                </form>

                                <p className="text-center mt-3 mb-0">

                                    Don't have an account?{' '}

                                    <Link to="/register">
                                        Register
                                    </Link>

                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

            <Footer />

        </div>

    );

};

export default Login;

