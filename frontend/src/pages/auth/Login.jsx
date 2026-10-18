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
            const result = await login(email.trim(), password);

            if (result?.success) {
                const role = String(result.user?.role || '').toLowerCase();

                if (role === 'admin') return navigate('/admin/dashboard');
                if (role === 'teacher') return navigate('/teacher/dashboard');
                if (role === 'student') return navigate('/student/dashboard');

                setError('Invalid user role');
            } else {
                setError(result?.message || 'Invalid email or password');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Something went wrong while logging in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex flex-column min-vh-100">
            <Header />
            <main className="container flex-grow-1 d-flex align-items-center justify-content-center py-4">
                <div className="w-100" style={{ maxWidth: '400px' }}>
                    <div className="card shadow-sm border-0 rounded-4">
                        <div className="card-body p-4">
                            <h3 className="text-center mb-1">Welcome Back!</h3>
                            <p className="text-center text-muted small mb-4">Login to your LMS-Online account</p>

                            {error && (
                                <div className="alert alert-danger py-2 small">
                                    <i className="bi bi-exclamation-triangle me-2"></i>{error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        autoComplete="email"
                                        required
                                    />
                                </div>

                                <div className="mb-2">
                                    <label className="form-label">Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        required
                                    />
                                </div>

                                <div className="text-end mb-3">
                                    <Link to="/forgot-password" className="small text-decoration-none">
                                        Forgot Password?
                                    </Link>
                                </div>

                                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Logging in...
                                        </>
                                    ) : 'Login'}
                                </button>
                            </form>

                            <p className="text-center small mt-3 mb-0">
                                Don't have an account? <Link to="/register">Register</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Login;