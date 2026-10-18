
import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import api from '../../services/api';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token') || '';

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/auth/reset-password.php', {
                token,
                newPassword,
                confirmPassword
            });

            setMessage(response.data.message || 'Password updated successfully.');

            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to reset password.');
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
                                <i className="bi bi-shield-lock-fill fs-1 text-primary"></i>
                                <h3 className="mt-2">Create New Password</h3>
                                <p className="text-muted small">Enter and confirm your new password.</p>
                            </div>

                            {message && <div className="alert alert-success small">{message}</div>}
                            {error && <div className="alert alert-danger small">{error}</div>}

                            {!token ? (
                                <div className="alert alert-warning small">
                                    Reset token is missing. Please start again from <Link to="/forgot-password">Forgot Password</Link>.
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">New Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            autoComplete="new-password"
                                            minLength={8}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Confirm New Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            autoComplete="new-password"
                                            minLength={8}
                                            required
                                        />
                                    </div>

                                    <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                                        {loading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </form>
                            )}

                            <p className="text-center small mt-3 mb-0">
                                <Link to="/login">Back to Login</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ResetPassword;
