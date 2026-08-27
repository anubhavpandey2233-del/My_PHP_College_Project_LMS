
import { useEffect, useState } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loading from '../../components/common/Loading';

const ContactMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');

    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            setError('');

            const res = await api.get('/admin/contact-messages.php');

            if (res.data?.status) {
                setMessages(res.data.data || []);
            } else {
                setMessages([]);
                setError(
                    res.data?.message ||
                    'Unable to load contact messages'
                );
            }
        } catch (err) {
            console.error('Contact messages error:', err);

            setMessages([]);

            setError(
                err.response?.data?.message ||
                'Something went wrong while loading messages'
            );
        } finally {
            setLoading(false);
        }
    };

    const filteredMessages = messages.filter((item) => {
        const searchText = search.toLowerCase().trim();

        const matchesSearch =
            !searchText ||
            item.name?.toLowerCase().includes(searchText) ||
            item.email?.toLowerCase().includes(searchText) ||
            item.subject?.toLowerCase().includes(searchText) ||
            item.message?.toLowerCase().includes(searchText);

        const matchesStatus =
            !status || item.status === status;

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (messageStatus) => {
        switch (messageStatus) {
            case 'new':
                return (
                    <span className="badge bg-primary">
                        New
                    </span>
                );

            case 'read':
                return (
                    <span className="badge bg-warning text-dark">
                        Read
                    </span>
                );

            case 'replied':
                return (
                    <span className="badge bg-success">
                        Replied
                    </span>
                );

            default:
                return (
                    <span className="badge bg-secondary">
                        {messageStatus || 'Unknown'}
                    </span>
                );
        }
    };

    const openMessage = (item) => {
        setSelectedMessage(item);
        setShowModal(true);
    };

    const closeMessage = () => {
        if (actionLoading) return;

        setShowModal(false);
        setSelectedMessage(null);
    };

    const handleStatusChange = async (item, newStatus) => {
        try {
            setActionLoading(true);

            const res = await api.post(
                '/admin/update-contact-status.php',
                {
                    id: item.id,
                    status: newStatus
                }
            );

            if (!res.data?.status) {
                alert(
                    res.data?.message ||
                    'Unable to update message status'
                );
                return;
            }

            setMessages((prevMessages) =>
                prevMessages.map((message) =>
                    message.id === item.id
                        ? {
                              ...message,
                              status: newStatus
                          }
                        : message
                )
            );

            setSelectedMessage((prev) => {
                if (!prev || prev.id !== item.id) {
                    return prev;
                }

                return {
                    ...prev,
                    status: newStatus
                };
            });

            alert('Message status updated successfully');

        } catch (err) {
            console.error(
                'Contact status error:',
                err
            );

            alert(
                err.response?.data?.message ||
                'Something went wrong while updating status'
            );
        } finally {
            setActionLoading(false);
        }
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('');
    };

    return (
        <DashboardLayout>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1">
                        Contact Messages
                    </h2>

                    <p className="text-muted mb-0">
                        View and manage messages received from users
                    </p>
                </div>

                <span className="badge bg-primary fs-6">
                    Total: {filteredMessages.length}
                </span>
            </div>

            {loading ? (
                <Loading />
            ) : error ? (
                <div className="alert alert-danger">
                    {error}
                </div>
            ) : (
                <>
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-body">

                            <div className="row g-3">

                                <div className="col-md-7">
                                    <label className="form-label">
                                        Search
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search by name, email, subject or message..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="col-md-4">
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

                                        <option value="new">
                                            New
                                        </option>

                                        <option value="read">
                                            Read
                                        </option>

                                        <option value="replied">
                                            Replied
                                        </option>
                                    </select>
                                </div>

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

                    <div className="card shadow-sm border-0">
                        <div className="card-body">

                            {filteredMessages.length === 0 ? (
                                <div className="alert alert-info mb-0">
                                    No contact messages found.
                                </div>
                            ) : (
                                <div className="table-responsive">

                                    <table className="table table-hover align-middle mb-0">

                                        <thead className="table-light">
                                            <tr>
                                                <th>#</th>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Subject</th>
                                                <th>Status</th>
                                                <th>Received</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {filteredMessages.map(
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
                                                            {item.subject}
                                                        </td>

                                                        <td>
                                                            {getStatusBadge(
                                                                item.status
                                                            )}
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

                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={() =>
                                                                        openMessage(
                                                                            item
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        actionLoading
                                                                    }
                                                                >
                                                                    View
                                                                </button>

                                                                {item.status === 'new' && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-warning"
                                                                        onClick={() =>
                                                                            handleStatusChange(
                                                                                item,
                                                                                'read'
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            actionLoading
                                                                        }
                                                                    >
                                                                        Mark Read
                                                                    </button>
                                                                )}

                                                                {item.status !== 'replied' && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-success"
                                                                        onClick={() =>
                                                                            handleStatusChange(
                                                                                item,
                                                                                'replied'
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            actionLoading
                                                                        }
                                                                    >
                                                                        Replied
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

            {showModal && selectedMessage && (
                <div
                    className="modal d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor: 'rgba(0,0,0,0.5)'
                    }}
                >
                    <div className="modal-dialog modal-lg">

                        <div className="modal-content">

                            <div className="modal-header">

                                <div>
                                    <h5 className="modal-title">
                                        {selectedMessage.subject}
                                    </h5>

                                    <small className="text-muted">
                                        From: {selectedMessage.name} (
                                        {selectedMessage.email}
                                        )
                                    </small>
                                </div>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeMessage}
                                    disabled={actionLoading}
                                />
                            </div>

                            <div className="modal-body">

                                <div className="mb-3">
                                    <strong>
                                        Status:
                                    </strong>{' '}

                                    {getStatusBadge(
                                        selectedMessage.status
                                    )}
                                </div>

                                <div className="card bg-light border-0">
                                    <div className="card-body">

                                        <p
                                            className="mb-0"
                                            style={{
                                                whiteSpace: 'pre-wrap'
                                            }}
                                        >
                                            {selectedMessage.message}
                                        </p>

                                    </div>
                                </div>

                            </div>

                            <div className="modal-footer">

                                {selectedMessage.status === 'new' && (
                                    <button
                                        type="button"
                                        className="btn btn-warning"
                                        onClick={() =>
                                            handleStatusChange(
                                                selectedMessage,
                                                'read'
                                            )
                                        }
                                        disabled={actionLoading}
                                    >
                                        Mark as Read
                                    </button>
                                )}

                                {selectedMessage.status !== 'replied' && (
                                    <button
                                        type="button"
                                        className="btn btn-success"
                                        onClick={() =>
                                            handleStatusChange(
                                                selectedMessage,
                                                'replied'
                                            )
                                        }
                                        disabled={actionLoading}
                                    >
                                        Mark as Replied
                                    </button>
                                )}

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={closeMessage}
                                    disabled={actionLoading}
                                >
                                    Close
                                </button>

                            </div>

                        </div>

                    </div>
                </div>
            )}

        </DashboardLayout>
    );
};

export default ContactMessages;

