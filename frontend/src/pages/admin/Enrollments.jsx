import { useEffect, useState } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loading from '../../components/common/Loading';

const Enrollments = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    // =====================================
    // Fetch Enrollments
    // =====================================

    const fetchEnrollments = () => {
        setLoading(true);

        api
            .get('/enrollments/admin-list.php')
            .then((res) => {
                console.log('ENROLLMENTS API:', res.data);

                if (res.data.status) {
                    setEnrollments(res.data.data || []);
                } else {
                    setEnrollments([]);
                }
            })
            .catch((error) => {
                console.error('Enrollments Error:', error);
                setEnrollments([]);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchEnrollments();
    }, []);

    // =====================================
    // Status Badge
    // =====================================

    const getStatusBadge = (status) => {
        if (status === 'completed') {
            return 'bg-success';
        }

        if (status === 'dropped') {
            return 'bg-danger';
        }

        return 'bg-primary';
    };

    // =====================================
    // Format Date
    // =====================================

    const formatDate = (date) => {
        if (!date) {
            return '-';
        }

        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // =====================================
    // Render
    // =====================================

    return (
        <DashboardLayout>

            {/* =================================
                Page Header
            ================================= */}

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>
                    <h2 className="mb-1">
                        Enrollments
                    </h2>

                    <p className="text-muted mb-0">
                        Manage student course enrollments
                    </p>
                </div>

                <span className="badge bg-primary fs-6">
                    {enrollments.length} Enrollments
                </span>

            </div>


            {/* =================================
                Enrollment List
            ================================= */}

            <div className="card shadow-sm border-0">

                <div className="card-body p-4">

                    <div className="d-flex justify-content-between align-items-center mb-4">

                        <h5 className="mb-0">
                            Enrollment List
                        </h5>

                        <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={fetchEnrollments}
                            disabled={loading}
                        >
                            <i className="bi bi-arrow-clockwise me-1"></i>
                            Refresh
                        </button>

                    </div>


                    {loading ? (

                        <Loading />

                    ) : enrollments.length === 0 ? (

                        <div className="text-center py-5 text-muted">

                            <i className="bi bi-people fs-1 d-block mb-3"></i>

                            No enrollments found.

                        </div>

                    ) : (

                        <div className="table-responsive">

                            <table className="table align-middle">

                                <thead>

                                    <tr>

                                        <th>#</th>

                                        <th>Student</th>

                                        <th>Course</th>

                                        <th>Progress</th>

                                        <th>Status</th>

                                        <th>Enrolled At</th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {enrollments.map(
                                        (enrollment, index) => (

                                            <tr key={enrollment.id}>

                                                {/* Number */}

                                                <td>
                                                    {index + 1}
                                                </td>


                                                {/* Student */}

                                                <td>

                                                    <div className="fw-semibold">
                                                        {enrollment.student_name}
                                                    </div>

                                                    <small className="text-muted">
                                                        {enrollment.student_email}
                                                    </small>

                                                </td>


                                                {/* Course */}

                                                <td>

                                                    <div className="fw-semibold">
                                                        {enrollment.course_title}
                                                    </div>

                                                </td>


                                                {/* Progress */}

                                                <td style={{ minWidth: '150px' }}>

                                                    <div className="d-flex justify-content-between mb-1">

                                                        <small className="text-muted">
                                                            Progress
                                                        </small>

                                                        <small className="fw-semibold">
                                                            {Number(
                                                                enrollment.progress
                                                            ).toFixed(2)}%
                                                        </small>

                                                    </div>

                                                    <div
                                                        className="progress"
                                                        style={{
                                                            height: '7px'
                                                        }}
                                                    >

                                                        <div
                                                            className={`progress-bar ${
                                                                enrollment.status ===
                                                                'completed'
                                                                    ? 'bg-success'
                                                                    : ''
                                                            }`}
                                                            role="progressbar"
                                                            style={{
                                                                width: `${Math.min(
                                                                    Number(
                                                                        enrollment.progress
                                                                    ),
                                                                    100
                                                                )}%`
                                                            }}
                                                        ></div>

                                                    </div>

                                                </td>


                                                {/* Status */}

                                                <td>

                                                    <span
                                                        className={`badge ${getStatusBadge(
                                                            enrollment.status
                                                        )}`}
                                                    >
                                                        {enrollment.status}
                                                    </span>

                                                </td>


                                                {/* Enrolled Date */}

                                                <td>

                                                    <span className="text-muted">
                                                        {formatDate(
                                                            enrollment.enrolled_at
                                                        )}
                                                    </span>

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

export default Enrollments;