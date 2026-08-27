
import { useEffect, useState } from 'react';
import api from '../../../services/api';
import DashboardLayout from '../../../layouts/DashboardLayout';
import Loading from '../../../components/common/Loading';

const StudentReviews = () => {

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // =====================================
    // EDIT STATE
    // =====================================

    const [editId, setEditId] = useState(null);

    const [editForm, setEditForm] = useState({
        rating: 5,
        review_text: ''
    });

    const [saving, setSaving] = useState(false);


    // =====================================
    // FETCH REVIEWS
    // =====================================

    const fetchReviews = async () => {

        try {

            setLoading(true);
            setError('');

            const res = await api.get(
                '/reviews/list.php'
            );

            console.log(
                'REVIEWS API:',
                res.data
            );

            if (res.data.status) {

                setReviews(
                    Array.isArray(res.data.data)
                        ? res.data.data
                        : res.data.data?.reviews || []
                );

            } else {

                setReviews([]);

                setError(
                    res.data.message ||
                    'Failed to load reviews'
                );

            }

        } catch (error) {

            console.error(
                'Reviews Error:',
                error
            );

            setReviews([]);

            setError(
                error.response?.data?.message ||
                'Something went wrong while loading reviews'
            );

        } finally {

            setLoading(false);

        }

    };


    // =====================================
    // LOAD REVIEWS
    // =====================================

    useEffect(() => {

        fetchReviews();

    }, []);


    // =====================================
    // RENDER STARS
    // =====================================

    const renderStars = (rating) => {

        const value = Math.max(
            0,
            Math.min(
                5,
                Number(rating) || 0
            )
        );

        return (

            <span
                style={{
                    color: '#ffc107',
                    fontSize: '18px',
                    whiteSpace: 'nowrap'
                }}
            >

                {'★'.repeat(value)}

                {'☆'.repeat(5 - value)}

            </span>

        );

    };


    // =====================================
    // STATUS BADGE
    // =====================================

    const getStatusBadge = (status) => {

        const value =
            String(status || '').toLowerCase();


        if (value === 'approved') {

            return (

                <span className="badge bg-success">
                    Approved
                </span>

            );

        }


        if (value === 'rejected') {

            return (

                <span className="badge bg-danger">
                    Rejected
                </span>

            );

        }


        return (

            <span className="badge bg-warning text-dark">
                Pending
            </span>

        );

    };


    // =====================================
    // DATE
    // =====================================

    const formatDate = (date) => {

        if (!date) {
            return '-';
        }

        const formattedDate =
            new Date(date);

        if (
            Number.isNaN(
                formattedDate.getTime()
            )
        ) {

            return date;

        }

        return formattedDate.toLocaleDateString();

    };


    // =====================================
    // APPROVE REVIEW
    // =====================================

    const handleApprove = async (review) => {

        const confirmApprove = window.confirm(
            `Approve review by ${review.student_name || 'this student'}?`
        );

        if (!confirmApprove) {
            return;
        }


        try {

            const res = await api.post(
                '/reviews/update.php',
                {
                    id: review.id,
                    rating: review.rating,
                    review_text:
                        review.review_text || '',
                    status: 'approved'
                }
            );


            if (res.data.status) {

                alert(
                    'Review approved successfully'
                );

                setReviews((prev) =>
                    prev.map((item) =>
                        Number(item.id) ===
                        Number(review.id)
                            ? {
                                ...item,
                                status: 'approved'
                            }
                            : item
                    )
                );

            } else {

                alert(
                    res.data.message ||
                    'Failed to approve review'
                );

            }

        } catch (error) {

            console.error(
                'Approve Review Error:',
                error
            );

            alert(
                error.response?.data?.message ||
                'Failed to approve review'
            );

        }

    };


    // =====================================
    // START EDIT
    // =====================================

    const handleEdit = (review) => {

        setEditId(review.id);

        setEditForm({
            rating: Number(review.rating) || 5,
            review_text:
                review.review_text ||
                review.message ||
                ''
        });

    };


    // =====================================
    // EDIT FORM CHANGE
    // =====================================

    const handleEditChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setEditForm((prev) => ({
            ...prev,
            [name]: value
        }));

    };


    // =====================================
    // UPDATE REVIEW
    // =====================================

    const handleUpdate = async (review) => {

        if (
            Number(editForm.rating) < 1 ||
            Number(editForm.rating) > 5
        ) {

            alert(
                'Rating must be between 1 and 5'
            );

            return;

        }


        try {

            setSaving(true);


            const res = await api.post(
                '/reviews/update.php',
                {
                    id: review.id,
                    rating: Number(editForm.rating),
                    review_text:
                        editForm.review_text.trim(),
                    status:
                        review.status || 'pending'
                }
            );


            if (res.data.status) {

                alert(
                    'Review updated successfully'
                );


                setReviews((prev) =>
                    prev.map((item) =>
                        Number(item.id) ===
                        Number(review.id)
                            ? {
                                ...item,
                                rating:
                                    Number(editForm.rating),
                                review_text:
                                    editForm.review_text.trim()
                            }
                            : item
                    )
                );


                setEditId(null);

                setEditForm({
                    rating: 5,
                    review_text: ''
                });

            } else {

                alert(
                    res.data.message ||
                    'Failed to update review'
                );

            }

        } catch (error) {

            console.error(
                'Update Review Error:',
                error
            );

            alert(
                error.response?.data?.message ||
                'Failed to update review'
            );

        } finally {

            setSaving(false);

        }

    };


    // =====================================
    // CANCEL EDIT
    // =====================================

    const handleCancelEdit = () => {

        setEditId(null);

        setEditForm({
            rating: 5,
            review_text: ''
        });

    };


    // =====================================
    // DELETE REVIEW
    // =====================================

    const handleDelete = async (review) => {

        const confirmDelete = window.confirm(
            `Are you sure you want to delete this review by ${review.student_name || 'this student'}?`
        );

        if (!confirmDelete) {
            return;
        }


        try {

            const res = await api.post(
                '/reviews/delete.php',
                {
                    id: review.id
                }
            );


            if (res.data.status) {

                alert(
                    'Review deleted successfully'
                );


                setReviews((prev) =>
                    prev.filter(
                        (item) =>
                            Number(item.id) !==
                            Number(review.id)
                    )
                );

            } else {

                alert(
                    res.data.message ||
                    'Failed to delete review'
                );

            }

        } catch (error) {

            console.error(
                'Delete Review Error:',
                error
            );

            alert(
                error.response?.data?.message ||
                'Failed to delete review'
            );

        }

    };


    // =====================================
    // PAGE
    // =====================================

    return (

        <DashboardLayout>

            {/* =================================
                PAGE HEADER
            ================================= */}

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h2 className="mb-1">
                        Reviews
                    </h2>

                    <p className="text-muted mb-0">
                        View and manage student course reviews
                    </p>

                </div>


                <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={fetchReviews}
                    disabled={loading}
                >

                    <i className="bi bi-arrow-clockwise me-2"></i>

                    {loading
                        ? 'Loading...'
                        : 'Refresh'}

                </button>

            </div>


            {/* =================================
                ERROR
            ================================= */}

            {error && (

                <div className="alert alert-danger">

                    <i className="bi bi-exclamation-triangle me-2"></i>

                    {error}

                </div>

            )}


            {/* =================================
                REVIEW CARD
            ================================= */}

            <div className="card shadow-sm border-0">

                <div className="card-body p-4">


                    {/* TOP */}

                    <div className="d-flex justify-content-between align-items-center mb-4">

                        <h5 className="mb-0">
                            Student Reviews
                        </h5>


                        <span className="badge bg-primary">
                            {reviews.length}
                        </span>

                    </div>


                    {/* =================================
                        LOADING
                    ================================= */}

                    {loading ? (

                        <Loading />

                    ) : reviews.length === 0 ? (

                        <div className="text-center py-5 text-muted">

                            <i
                                className="bi bi-star fs-1 d-block mb-3"
                            ></i>

                            <h5>
                                No reviews found
                            </h5>

                            <p className="mb-0">
                                Student reviews will appear here.
                            </p>

                        </div>

                    ) : (

                        <div className="table-responsive">

                            <table className="table table-hover align-middle">

                                <thead>

                                    <tr>

                                        <th>
                                            #
                                        </th>

                                        <th>
                                            Student
                                        </th>

                                        <th>
                                            Course
                                        </th>

                                        <th>
                                            Rating
                                        </th>

                                        <th>
                                            Review
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Date
                                        </th>

                                        <th>
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {reviews.map(
                                        (review, index) => (

                                            <tr
                                                key={
                                                    review.id ||
                                                    index
                                                }
                                            >

                                                {/* # */}

                                                <td>
                                                    {index + 1}
                                                </td>


                                                {/* STUDENT */}

                                                <td>

                                                    <div className="fw-semibold">

                                                        {
                                                            review.student_name ||
                                                            review.name ||
                                                            '-'
                                                        }

                                                    </div>


                                                    {(
                                                        review.student_email ||
                                                        review.email
                                                    ) && (

                                                        <small className="text-muted">

                                                            {
                                                                review.student_email ||
                                                                review.email
                                                            }

                                                        </small>

                                                    )}

                                                </td>


                                                {/* COURSE */}

                                                <td>

                                                    <span className="fw-semibold">

                                                        {
                                                            review.course_title ||
                                                            review.title ||
                                                            '-'
                                                        }

                                                    </span>

                                                </td>


                                                {/* RATING */}

                                                <td>

                                                    {editId === review.id ? (

                                                        <select
                                                            name="rating"
                                                            className="form-select form-select-sm"
                                                            value={
                                                                editForm.rating
                                                            }
                                                            onChange={
                                                                handleEditChange
                                                            }
                                                            style={{
                                                                width: '75px'
                                                            }}
                                                        >

                                                            <option value="1">
                                                                1
                                                            </option>

                                                            <option value="2">
                                                                2
                                                            </option>

                                                            <option value="3">
                                                                3
                                                            </option>

                                                            <option value="4">
                                                                4
                                                            </option>

                                                            <option value="5">
                                                                5
                                                            </option>

                                                        </select>

                                                    ) : (

                                                        <>

                                                            <div>

                                                                {renderStars(
                                                                    review.rating
                                                                )}

                                                            </div>

                                                            <small className="text-muted">

                                                                {
                                                                    review.rating || 0
                                                                }
                                                                /5

                                                            </small>

                                                        </>

                                                    )}

                                                </td>


                                                {/* REVIEW */}

                                                <td
                                                    style={{
                                                        minWidth: '280px',
                                                        maxWidth: '450px'
                                                    }}
                                                >

                                                    {editId === review.id ? (

                                                        <textarea
                                                            name="review_text"
                                                            className="form-control"
                                                            rows="3"
                                                            value={
                                                                editForm.review_text
                                                            }
                                                            onChange={
                                                                handleEditChange
                                                            }
                                                        />

                                                    ) : (

                                                        <div>

                                                            {
                                                                review.review_text ||
                                                                review.message ||
                                                                'No review message'
                                                            }

                                                        </div>

                                                    )}

                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                    {getStatusBadge(
                                                        review.status
                                                    )}

                                                </td>


                                                {/* DATE */}

                                                <td>

                                                    {
                                                        formatDate(
                                                            review.created_at
                                                        )
                                                    }

                                                </td>


                                                {/* ACTIONS */}

                                                <td>

                                                    {editId === review.id ? (

                                                        <div className="d-flex gap-2">

                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-success"
                                                                onClick={() =>
                                                                    handleUpdate(
                                                                        review
                                                                    )
                                                                }
                                                                disabled={saving}
                                                            >

                                                                <i className="bi bi-check-lg me-1"></i>

                                                                {saving
                                                                    ? 'Saving...'
                                                                    : 'Save'}

                                                            </button>


                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-secondary"
                                                                onClick={
                                                                    handleCancelEdit
                                                                }
                                                                disabled={saving}
                                                            >

                                                                Cancel

                                                            </button>

                                                        </div>

                                                    ) : (

                                                        <div className="d-flex gap-2 flex-wrap">

                                                            {/* APPROVE */}

                                                            {String(
                                                                review.status || ''
                                                            ).toLowerCase() !==
                                                                'approved' && (

                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-success"
                                                                    onClick={() =>
                                                                        handleApprove(
                                                                            review
                                                                        )
                                                                    }
                                                                >

                                                                    <i className="bi bi-check-circle me-1"></i>

                                                                    Approve

                                                                </button>

                                                            )}


                                                            {/* EDIT */}

                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-primary"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        review
                                                                    )
                                                                }
                                                            >

                                                                <i className="bi bi-pencil me-1"></i>

                                                                Edit

                                                            </button>


                                                            {/* DELETE */}

                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        review
                                                                    )
                                                                }
                                                            >

                                                                <i className="bi bi-trash me-1"></i>

                                                                Delete

                                                            </button>

                                                        </div>

                                                    )}

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

        </DashboardLayout>

    );

};

export default StudentReviews;

