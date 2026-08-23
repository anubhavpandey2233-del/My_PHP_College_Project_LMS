
import { useEffect, useState } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loading from '../../components/common/Loading';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [search, setSearch] = useState('');
    const [role, setRole] = useState('');
    const [status, setStatus] = useState('');

    const [selectedUser, setSelectedUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editRole, setEditRole] = useState('');
    const [editStatus, setEditStatus] = useState('');

    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    // ==========================================
    // Fetch Users
    // ==========================================
    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError('');

            const res = await api.get('/admin/users.php');

            if (res.data.status) {
                setUsers(res.data.data || []);
            } else {
                setUsers([]);
                setError(res.data.message || 'Unable to load users');
            }
        } catch (err) {
            console.error('Users error:', err);

            setUsers([]);

            setError(
                err.response?.data?.message ||
                'Something went wrong while loading users'
            );
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // Search + Filters
    // ==========================================
    const filteredUsers = users.filter((item) => {
        const searchText = search.toLowerCase().trim();

        const matchesSearch =
            !searchText ||
            item.name?.toLowerCase().includes(searchText) ||
            item.email?.toLowerCase().includes(searchText);

        const matchesRole =
            !role || item.role === role;

        const matchesStatus =
            !status || item.status === status;

        return matchesSearch && matchesRole && matchesStatus;
    });

    // ==========================================
    // Role Badge
    // ==========================================
    const getRoleBadge = (userRole) => {
        if (userRole === 'admin') {
            return (
                <span className="badge bg-danger">
                    Admin
                </span>
            );
        }

        if (userRole === 'teacher') {
            return (
                <span className="badge bg-primary">
                    Teacher
                </span>
            );
        }

        return (
            <span className="badge bg-success">
                Student
            </span>
        );
    };

    // ==========================================
    // Status Badge
    // ==========================================
    const getStatusBadge = (userStatus) => {
        if (userStatus === 'active') {
            return (
                <span className="badge bg-success">
                    Active
                </span>
            );
        }

        if (userStatus === 'inactive') {
            return (
                <span className="badge bg-secondary">
                    Inactive
                </span>
            );
        }

        return (
            <span className="badge bg-danger">
                Banned
            </span>
        );
    };

    // ==========================================
    // Open Edit Modal
    // ==========================================
    const openEditModal = (item) => {
        setSelectedUser(item);

        setEditName(item.name || '');
        setEditEmail(item.email || '');
        setEditRole(item.role || '');
        setEditStatus(item.status || 'active');

        setShowEditModal(true);
    };

    // ==========================================
    // Close Edit Modal
    // ==========================================
    const closeEditModal = () => {
        if (actionLoading) return;

        setShowEditModal(false);
        setSelectedUser(null);
    };

    // ==========================================
    // Update User
    // NOTE:
    // This endpoint must be a separate API for
    // name/email/role update.
    // ==========================================
    const handleUpdateUser = async (e) => {
        e.preventDefault();

        if (!selectedUser) return;

        try {
            setActionLoading(true);

            const res = await api.post('/admin/update-user-status.php', {
                user_id: selectedUser.id,
                name: editName,
                email: editEmail,
                role: editRole,
                status: editStatus
            });

            if (res.data.status) {
                alert('User updated successfully');

                setShowEditModal(false);
                setSelectedUser(null);

                await fetchUsers();
            } else {
                alert(
                    res.data.message ||
                    'Unable to update user'
                );
            }
        } catch (err) {
            console.error('Update user error:', err);

            alert(
                err.response?.data?.message ||
                'Something went wrong while updating user'
            );
        } finally {
            setActionLoading(false);
        }
    };

    // ==========================================
    // CHANGE USER STATUS
    // ==========================================
    const handleStatusChange = async (item, newStatus) => {
        if (item.role === 'admin') {
            alert('Admin status cannot be changed from here.');
            return;
        }

        const confirmChange = window.confirm(
            `Are you sure you want to change ${item.name}'s status to ${newStatus}?`
        );

        if (!confirmChange) return;

        try {
            setActionLoading(true);

            const res = await api.post('/admin/change-status.php', {
                user_id: item.id,
                status: newStatus
            });

            if (res.data.status) {
                alert('User status updated successfully');
                await fetchUsers();
            } else {
                alert(res.data.message || 'Unable to change status');
            }

        } catch (err) {
            console.error('Status change error:', err);

            alert(
                err.response?.data?.message ||
                'Something went wrong while changing status'
            );
        } finally {
            setActionLoading(false);
        }
    };
    // ==========================================
    // DELETE USER
    // ==========================================
    const handleDelete = async (item) => {

        if (item.role === 'admin') {
            alert('Admin user cannot be deleted.');
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete ${item.name}?\n\nThis action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            setActionLoading(true);

            const res = await api.post(
                '/admin/delete-user.php',
                {
                    user_id: item.id
                }
            );

            if (res.data.status) {
                alert('User deleted successfully');

                await fetchUsers();
            } else {
                alert(
                    res.data.message ||
                    'Unable to delete user'
                );
            }

        } catch (err) {
            console.error(
                'Delete user error:',
                err
            );

            alert(
                err.response?.data?.message ||
                'Something went wrong while deleting user'
            );
        } finally {
            setActionLoading(false);
        }
    };

    // ==========================================
    // RESET PASSWORD
    // ==========================================
    const handleResetPassword = async (item) => {

        if (item.role === 'admin') {
            alert(
                'Admin password reset is not available from this button.'
            );
            return;
        }

        const confirmed = window.confirm(
            `Reset password for ${item.name}?`
        );

        if (!confirmed) return;

        try {
            setActionLoading(true);

            const res = await api.post(
                '/admin/reset-password.php',
                {
                    id: item.id
                }
            );

            if (res.data.status) {
                alert(
                    res.data.message ||
                    'Password reset successfully'
                );
            } else {
                alert(
                    res.data.message ||
                    'Unable to reset password'
                );
            }

        } catch (err) {
            console.error(
                'Reset password error:',
                err
            );

            alert(
                err.response?.data?.message ||
                'Something went wrong while resetting password'
            );
        } finally {
            setActionLoading(false);
        }
    };

    // ==========================================
    // Clear Filters
    // ==========================================
    const clearFilters = () => {
        setSearch('');
        setRole('');
        setStatus('');
    };

    return (
        <DashboardLayout>

            {/* ===============================
          Header
      =============================== */}
            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>
                    <h2 className="mb-1">
                        Manage Users
                    </h2>

                    <p className="text-muted mb-0">
                        View and manage all users registered in the LMS
                    </p>
                </div>

                <span className="badge bg-primary fs-6">
                    Total: {filteredUsers.length}
                </span>

            </div>


            {/* ===============================
          Loading / Error
      =============================== */}
            {loading ? (

                <Loading />

            ) : error ? (

                <div className="alert alert-danger">
                    {error}
                </div>

            ) : (

                <>

                    {/* ===============================
              Filters
          =============================== */}
                    <div className="card shadow-sm border-0 mb-4">

                        <div className="card-body">

                            <div className="row g-3">

                                {/* Search */}
                                <div className="col-md-5">

                                    <label className="form-label">
                                        Search
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search by name or email..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                    />

                                </div>


                                {/* Role */}
                                <div className="col-md-3">

                                    <label className="form-label">
                                        Role
                                    </label>

                                    <select
                                        className="form-select"
                                        value={role}
                                        onChange={(e) =>
                                            setRole(e.target.value)
                                        }
                                    >

                                        <option value="">
                                            All Roles
                                        </option>

                                        <option value="admin">
                                            Admin
                                        </option>

                                        <option value="teacher">
                                            Teacher
                                        </option>

                                        <option value="student">
                                            Student
                                        </option>

                                    </select>

                                </div>


                                {/* Status */}
                                <div className="col-md-3">

                                    <label className="form-label">
                                        Status
                                    </label>

                                    <select
                                        className="form-select"
                                        value={status}
                                        onChange={(e) =>
                                            setStatus(e.target.value)
                                        }
                                    >

                                        <option value="">
                                            All Status
                                        </option>

                                        <option value="active">
                                            Active
                                        </option>

                                        <option value="inactive">
                                            Inactive
                                        </option>

                                        <option value="banned">
                                            Banned
                                        </option>

                                    </select>

                                </div>


                                {/* Clear */}
                                <div className="col-md-1 d-flex align-items-end">

                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary w-100"
                                        onClick={clearFilters}
                                        title="Clear filters"
                                    >
                                        ✕
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* ===============================
              Users Table
          =============================== */}
                    <div className="card shadow-sm border-0">

                        <div className="card-body">

                            {filteredUsers.length === 0 ? (

                                <div className="alert alert-info mb-0">
                                    No users found.
                                </div>

                            ) : (

                                <div className="table-responsive">

                                    <table className="table table-hover align-middle mb-0">

                                        <thead className="table-light">

                                            <tr>
                                                <th>#</th>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Status</th>
                                                <th>Joined</th>
                                                <th>Actions</th>
                                            </tr>

                                        </thead>


                                        <tbody>

                                            {filteredUsers.map(
                                                (item, index) => (

                                                    <tr key={item.id}>

                                                        <td>
                                                            {index + 1}
                                                        </td>


                                                        <td>
                                                            <strong>
                                                                {item.name}
                                                            </strong>
                                                        </td>


                                                        <td>
                                                            {item.email}
                                                        </td>


                                                        <td>
                                                            {getRoleBadge(item.role)}
                                                        </td>


                                                        <td>
                                                            {getStatusBadge(item.status)}
                                                        </td>


                                                        <td>
                                                            {item.created_at
                                                                ? new Date(
                                                                    item.created_at
                                                                ).toLocaleDateString()
                                                                : '-'}
                                                        </td>


                                                        <td>

                                                            <div className="d-flex gap-1 flex-wrap">

                                                                {/* ===============================
                                    Edit
                                =============================== */}
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={() =>
                                                                        openEditModal(item)
                                                                    }
                                                                    disabled={actionLoading}
                                                                >
                                                                    Edit
                                                                </button>


                                                                {/* ===============================
                                    Activate / Deactivate
                                =============================== */}
                                                                {item.role !== 'admin' && (

                                                                    item.status === 'active' ? (

                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-sm btn-outline-warning"
                                                                            onClick={() =>
                                                                                handleStatusChange(
                                                                                    item,
                                                                                    'inactive'
                                                                                )
                                                                            }
                                                                            disabled={actionLoading}
                                                                        >
                                                                            Deactivate
                                                                        </button>

                                                                    ) : (

                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-sm btn-outline-success"
                                                                            onClick={() =>
                                                                                handleStatusChange(
                                                                                    item,
                                                                                    'active'
                                                                                )
                                                                            }
                                                                            disabled={actionLoading}
                                                                        >
                                                                            Activate
                                                                        </button>

                                                                    )

                                                                )}


                                                                {/* ===============================
                                    Reset Password
                                =============================== */}
                                                                {item.role !== 'admin' && (

                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-secondary"
                                                                        onClick={() =>
                                                                            handleResetPassword(item)
                                                                        }
                                                                        disabled={actionLoading}
                                                                    >
                                                                        Reset Password
                                                                    </button>

                                                                )}


                                                                {/* ===============================
                                    Delete
                                =============================== */}
                                                                {item.role !== 'admin' && (

                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-danger"
                                                                        onClick={() =>
                                                                            handleDelete(item)
                                                                        }
                                                                        disabled={actionLoading}
                                                                    >
                                                                        Delete
                                                                    </button>

                                                                )}

                                                            </div>

                                                        </td>

                                                    </tr>

                                                )
                                            )}

                                        </tbody>

                                    </table>

                                </div>

                            )}

                        </div>

                    </div>

                </>

            )}


            {/* ===============================
          Edit User Modal
      =============================== */}
            {showEditModal && selectedUser && (

                <div
                    className="modal d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor: 'rgba(0,0,0,0.5)'
                    }}
                >

                    <div className="modal-dialog">

                        <div className="modal-content">

                            <div className="modal-header">

                                <h5 className="modal-title">
                                    Edit User
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeEditModal}
                                    disabled={actionLoading}
                                ></button>

                            </div>


                            <form onSubmit={handleUpdateUser}>

                                <div className="modal-body">

                                    {/* Name */}
                                    <div className="mb-3">

                                        <label className="form-label">
                                            Name
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editName}
                                            onChange={(e) =>
                                                setEditName(e.target.value)
                                            }
                                            required
                                        />

                                    </div>


                                    {/* Email */}
                                    <div className="mb-3">

                                        <label className="form-label">
                                            Email
                                        </label>

                                        <input
                                            type="email"
                                            className="form-control"
                                            value={editEmail}
                                            onChange={(e) =>
                                                setEditEmail(e.target.value)
                                            }
                                            required
                                        />

                                    </div>


                                    {/* Role */}
                                    <div className="mb-3">

                                        <label className="form-label">
                                            Role
                                        </label>

                                        <select
                                            className="form-select"
                                            value={editRole}
                                            onChange={(e) =>
                                                setEditRole(e.target.value)
                                            }
                                            disabled={
                                                selectedUser.role === 'admin'
                                            }
                                        >

                                            <option value="student">
                                                Student
                                            </option>

                                            <option value="teacher">
                                                Teacher
                                            </option>

                                            <option value="admin">
                                                Admin
                                            </option>

                                        </select>

                                    </div>


                                    {/* Status */}
                                    <div className="mb-3">

                                        <label className="form-label">
                                            Status
                                        </label>

                                        <select
                                            className="form-select"
                                            value={editStatus}
                                            onChange={(e) =>
                                                setEditStatus(e.target.value)
                                            }
                                            disabled={
                                                selectedUser.role === 'admin'
                                            }
                                        >

                                            <option value="active">
                                                Active
                                            </option>

                                            <option value="inactive">
                                                Inactive
                                            </option>

                                            <option value="banned">
                                                Banned
                                            </option>

                                        </select>

                                    </div>

                                </div>


                                <div className="modal-footer">

                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={closeEditModal}
                                        disabled={actionLoading}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={actionLoading}
                                    >
                                        {actionLoading
                                            ? 'Saving...'
                                            : 'Save Changes'}
                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                </div>

            )}

        </DashboardLayout>
    );
};

export default AdminUsers;

