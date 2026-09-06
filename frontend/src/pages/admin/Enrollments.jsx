import { useEffect, useState } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loading from '../../components/common/Loading';
import {
    FaCertificate,
} from 'react-icons/fa';
import './Enrollments.scss';

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

                    setEnrollments(
                        Array.isArray(res.data.data)
                            ? res.data.data
                            : []
                    );

                } else {

                    setEnrollments([]);

                }

            })
            .catch((error) => {

                console.error(
                    'Enrollments Error:',
                    error
                );

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

        const currentStatus = String(
            status || ''
        ).toLowerCase();

        if (currentStatus === 'completed') {

            return 'bg-success';

        }

        if (currentStatus === 'dropped') {

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

        const newDate = new Date(date);

        if (isNaN(newDate.getTime())) {

            return '-';

        }

        return newDate.toLocaleDateString(
            'en-IN',
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }
        );

    };

    // =====================================
    // View Certificate
    // =====================================

    const viewCertificate = (certificate) => {

        if (!certificate) {

            alert(
                'Certificate is not available because the student has not completed the course yet.'
            );

            return;

        }

        const certificateUrl =
            certificate.certificate_url ||
            certificate.certificate_file ||
            null;

        if (!certificateUrl) {

            alert(
                'Certificate file is not available.'
            );

            return;

        }

        let finalUrl;

        if (
            certificateUrl.startsWith('http://') ||
            certificateUrl.startsWith('https://')
        ) {

            finalUrl = certificateUrl;

        } else {

            finalUrl =
                `http://localhost/php-lms-project/backend/uploads/certificates/${certificateUrl}`;

        }

        window.open(
            finalUrl,
            '_blank',
            'noopener,noreferrer'
        );

    };

    // =====================================
    // Render
    // =====================================

    return (

        <DashboardLayout>

            <div className="admin-enrollments-page">

                {/* PAGE HEADER */}

                <div className="admin-enrollments-header d-flex justify-content-between align-items-center mb-4">

                    <div>

                        <h2 className="mb-1">
                            Enrollments
                        </h2>

                        <p className="text-muted mb-0">
                            Manage student course enrollments
                        </p>

                    </div>

                    <span className="badge bg-primary fs-6 admin-enrollments-total">

                        {enrollments.length} Enrollments

                    </span>

                </div>

                {/* ENROLLMENT CARD */}

                <div className="card shadow-sm border-0 admin-enrollments-card">

                    <div className="card-body p-4">

                        {/* CARD HEADER */}

                        <div className="admin-enrollments-card-header d-flex justify-content-between align-items-center mb-4">

                            <h5 className="mb-0">
                                Enrollment List
                            </h5>

                            <button
                                type="button"
                                className="btn btn-sm btn-outline-primary admin-enrollments-refresh"
                                onClick={fetchEnrollments}
                                disabled={loading}
                            >

                                <i className="bi bi-arrow-clockwise me-1"></i>

                                Refresh

                            </button>

                        </div>

                        {/* LOADING */}

                        {loading ? (

                            <Loading />

                        ) : enrollments.length === 0 ? (

                            <div className="text-center py-5 text-muted admin-enrollments-empty">

                                <i className="bi bi-people fs-1 d-block mb-3"></i>

                                No enrollments found.

                            </div>

                        ) : (

                            <div className="table-responsive admin-enrollments-table-wrapper">

                                <table className="table align-middle admin-enrollments-table">

                                    <thead>

                                        <tr>

                                            <th>#</th>

                                            <th>Student</th>

                                            <th>Course</th>

                                            <th>Progress</th>

                                            <th>Status</th>

                                            <th>Enrolled At</th>

                                            <th>Certificate</th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {enrollments.map(
                                            (enrollment, index) => {

                                                const progress = Math.min(
                                                    Math.max(
                                                        Number(
                                                            enrollment.progress || 0
                                                        ),
                                                        0
                                                    ),
                                                    100
                                                );

                                                const certificate =
                                                    enrollment.certificate ||
                                                    null;

                                                const hasCertificate =
                                                    progress >= 100 &&
                                                    certificate &&
                                                    (
                                                        certificate.certificate_file ||
                                                        certificate.certificate_url
                                                    );

                                                return (

                                                    <tr
                                                        key={
                                                            enrollment.id
                                                        }
                                                    >

                                                        <td data-label="#">

                                                            {index + 1}

                                                        </td>

                                                        <td data-label="Student">

                                                            <div className="d-flex align-items-center gap-2 admin-enrollment-student">

                                                                {enrollment.student_avatar ? (

                                                                    <img
                                                                        src={
                                                                            enrollment.student_avatar
                                                                        }
                                                                        alt={
                                                                            enrollment.student_name ||
                                                                            'Student'
                                                                        }
                                                                        width="42"
                                                                        height="42"
                                                                        className="rounded-circle admin-enrollment-avatar"
                                                                    />

                                                                ) : (

                                                                    <div className="rounded-circle bg-light d-flex align-items-center justify-content-center admin-enrollment-avatar-placeholder">

                                                                        <i className="bi bi-person text-secondary"></i>

                                                                    </div>

                                                                )}

                                                                <div className="admin-enrollment-student-info">

                                                                    <div className="fw-semibold admin-enrollment-student-name">

                                                                        {
                                                                            enrollment.student_name ||
                                                                            '-'
                                                                        }

                                                                    </div>

                                                                    <small className="text-muted admin-enrollment-student-email">

                                                                        {
                                                                            enrollment.student_email ||
                                                                            '-'
                                                                        }

                                                                    </small>

                                                                </div>

                                                            </div>

                                                        </td>

                                                        <td data-label="Course">

                                                            <div className="fw-semibold admin-enrollment-course">

                                                                {
                                                                    enrollment.course_title ||
                                                                    '-'
                                                                }

                                                            </div>

                                                        </td>

                                                        <td
                                                            data-label="Progress"
                                                            className="admin-enrollment-progress-cell"
                                                        >

                                                            <div className="d-flex justify-content-between mb-1">

                                                                <small className="text-muted">
                                                                    Progress
                                                                </small>

                                                                <small className="fw-semibold">
                                                                    {progress.toFixed(2)}%
                                                                </small>

                                                            </div>

                                                            <div
                                                                className="progress admin-enrollment-progress"
                                                                style={{
                                                                    height: '7px'
                                                                }}
                                                            >

                                                                <div
                                                                    className={`progress-bar ${
                                                                        progress >= 100
                                                                            ? 'bg-success'
                                                                            : ''
                                                                    }`}
                                                                    role="progressbar"
                                                                    style={{
                                                                        width: `${progress}%`
                                                                    }}
                                                                />

                                                            </div>

                                                        </td>

                                                        <td data-label="Status">

                                                            <span className="admin-enrollment-status">

                                                                <span
                                                                    className={`badge ${getStatusBadge(
                                                                        enrollment.status
                                                                    )}`}
                                                                >

                                                                    {
                                                                        enrollment.status ||
                                                                        'In Progress'
                                                                    }

                                                                </span>

                                                            </span>

                                                        </td>

                                                        <td data-label="Enrolled At">

                                                            <span className="text-muted admin-enrollment-date">

                                                                {
                                                                    formatDate(
                                                                        enrollment.enrolled_at
                                                                    )
                                                                }

                                                            </span>

                                                        </td>

                                                        <td data-label="Certificate">

                                                            <div className="admin-enrollment-certificate">

                                                                {hasCertificate ? (

                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-primary"
                                                                        onClick={() =>
                                                                            viewCertificate(
                                                                                certificate
                                                                            )
                                                                        }
                                                                    >

                                                                        <FaCertificate className="me-1" />

                                                                        View Certificate

                                                                    </button>

                                                                ) : (

                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-secondary"
                                                                        onClick={() =>
                                                                            alert(
                                                                                progress < 100
                                                                                    ? 'Certificate is not available because the student has not completed the course yet.'
                                                                                    : 'Certificate has not been generated yet.'
                                                                            )
                                                                        }
                                                                    >

                                                                        <FaCertificate className="me-1" />

                                                                        Not Available

                                                                    </button>

                                                                )}

                                                            </div>

                                                        </td>

                                                    </tr>

                                                );

                                            }
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>

                </div>

            </div>

        </DashboardLayout>

    );

};

export default Enrollments;