
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';

const ChangePassword = () => {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }

    try {
      setLoading(true);

      const res = await api.post('/change-password.php', {
        current_password: currentPassword,
        new_password: newPassword
      });

      if (res.data.status) {
        setSuccess(
          res.data.message || 'Password changed successfully'
        );

        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');

        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1500);
      } else {
        setError(
          res.data.message || 'Unable to change password'
        );
      }

    } catch (err) {
      console.error('Change password error:', err);

      setError(
        err.response?.data?.message ||
        'Something went wrong while changing password'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>

      <div className="container py-4">

        <div className="row justify-content-center">

          <div className="col-md-6">

            <div className="card shadow-sm border-0">

              <div className="card-body p-4">

                <h3 className="mb-2">
                  Change Password
                </h3>

                <p className="text-muted mb-4">
                  Update your admin account password
                </p>

                {error && (
                  <div className="alert alert-danger">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="alert alert-success">
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmit}>

                  <div className="mb-3">

                    <label className="form-label">
                      Current Password
                    </label>

                    <input
                      type="password"
                      className="form-control"
                      value={currentPassword}
                      onChange={(e) =>
                        setCurrentPassword(e.target.value)
                      }
                      required
                    />

                  </div>

                  <div className="mb-3">

                    <label className="form-label">
                      New Password
                    </label>

                    <input
                      type="password"
                      className="form-control"
                      value={newPassword}
                      onChange={(e) =>
                        setNewPassword(e.target.value)
                      }
                      minLength={6}
                      required
                    />

                    <small className="text-muted">
                      Password must be at least 6 characters.
                    </small>

                  </div>

                  <div className="mb-4">

                    <label className="form-label">
                      Confirm New Password
                    </label>

                    <input
                      type="password"
                      className="form-control"
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(e.target.value)
                      }
                      minLength={6}
                      required
                    />

                  </div>

                  <div className="d-flex gap-2">

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() =>
                        navigate('/admin/dashboard')
                      }
                      disabled={loading}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading
                        ? 'Changing...'
                        : 'Change Password'}
                    </button>

                  </div>

                </form>

              </div>

            </div>

          </div>

        </div>

      </div>

    </DashboardLayout>
  );
};

export default ChangePassword;

