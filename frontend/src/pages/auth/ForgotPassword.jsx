
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import api from '../../services/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setResetToken('');
        setLoading(true);

        try {
            const response = await api.post('/auth/forgot-password.php', { email });
            const result = response.data;

            if (result.status === false || result.success === false) {
                throw new Error(result.message || 'Unable to create reset request.');
            }

            const token = result.data?.token || result.token;

            if (!token) {
                throw new Error(result.message || 'Reset token was not returned by the backend.');
            }

            setResetToken(token);
            setMessage('Demo reset token generated successfully.');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Something went wrong. Please try again.');
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
                            <div className="text-center mb-4">
                                <i className="bi bi-lock-fill fs-1 text-primary"></i>
                                <h3 className="mt-2 mb-1">Forgot Password?</h3>
                                <p className="text-muted small mb-0">
                                    Enter your registered email address to reset your password.
                                </p>
                            </div>

                            {message && <div className="alert alert-success py-2 small">{message}</div>}
                            {error && <div className="alert alert-danger py-2 small">{error}</div>}

                            {resetToken ? (
                                <div>
                                    <label className="form-label">Demo Reset Token</label>
                                    <textarea className="form-control mb-3" value={resetToken} readOnly rows={3} />
                                    <Link to={`/reset-password?token=${encodeURIComponent(resetToken)}`} className="btn btn-primary w-100">
                                        Continue to Reset Password
                                    </Link>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">Email Address</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your registered email"
                                            autoComplete="email"
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                                        {loading ? 'Please wait...' : 'Reset Password'}
                                    </button>
                                </form>
                            )}

                            <p className="text-center small mt-3 mb-0">
                                Remember your password? <Link to="/login">Login</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ForgotPassword;
