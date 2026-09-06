import { useEffect, useState } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loading from '../../components/common/Loading';
import {
    FaCertificate,
    FaUserGraduate
} from 'react-icons/fa';
import './Enrollments.scss';

const Enrollments = () => {

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchStudents = () => {

        setLoading(true);
        setError('');

        api
            .get('/teacher/teacher_students.php')
            .then((res) => {

                console.log(
                    'TEACHER STUDENTS API:',
                    res.data
                );

                if (res.data.status) {

                    setStudents(
                        Array.isArray(res.data.data)
                            ? res.data.data
                            : []
                    );

                } else {

                    setStudents([]);

                    setError(
                        res.data.message ||
                        'Unable to load students.'
                    );

                }

            })
            .catch((err) => {

                console.error(
                    'Teacher Students Error:',
                    err
                );

                setStudents([]);

                setError(
                    err.response?.data?.message ||
                    err.message ||
                    'Unable to load students.'
                );

            })
            .finally(() => {

                setLoading(false);

            });

    };

    useEffect(() => {

        fetchStudents();

    }, []);

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

    const getProgress = (value) => {

        return Math.min(
            Math.max(
                Number(value || 0),
                0
            ),
            100
        );

    };

    const getStatusBadge = (status) => {

        const currentStatus = String(
            status || ''
        ).toLowerCase();

        if (
            currentStatus === 'completed' ||
            currentStatus === 'complete'
        ) {

            return 'bg-success';

        }

        if (currentStatus === 'dropped') {

            return 'bg-danger';

        }

        return 'bg-primary';

    };

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

    return (

        <DashboardLayout>

            <div className="teacher-enrollments-page">

                <div className="teacher-enrollments-header d-flex justify-content-between align-items-center mb-4">

                    <div>

                        <h2 className="mb-1">
                            Enrollments
                        </h2>

                        <p className="text-muted mb-0">
                            View students enrolled in your courses
                        </p>

                    </div>

                    <span className="badge bg-primary fs-6 teacher-enrollments-total">

                        {students.length} Students

                    </span>

                </div>

                {error && (

                    <div className="alert alert-danger teacher-enrollments-error">

                        {error}

                    </div>

                )}

                <div className="card shadow-sm border-0 teacher-enrollments-card">

                    <div className="card-body p-4">

                        <div className="teacher-enrollments-card-header d-flex justify-content-between align-items-center mb-4">

                            <h5 className="mb-0">
                                Student Enrollment List
                            </h5>

                            <button
                                type="button"
                                className="btn btn-sm btn-outline-primary teacher-enrollments-refresh"
                                onClick={fetchStudents}
                                disabled={loading}
                            >

                                <i className="bi bi-arrow-clockwise me-1"></i>

                                Refresh

                            </button>

                        </div>

                        {loading ? (

                            <Loading />

                        ) : students.length === 0 && !error ? (

                            <div className="text-center py-5 text-muted teacher-enrollments-empty">

                                <FaUserGraduate
                                    size={50}
                                    className="d-block mx-auto mb-3"
                                />

                                <h5>
                                    No Students Enrolled
                                </h5>

                                <p className="mb-0">
                                    Students enrolled in your courses
                                    will appear here.
                                </p>

                            </div>

                        ) : (

                            <div className="table-responsive teacher-enrollments-table-wrapper">

                                <table className="table align-middle teacher-enrollments-table">

                                    <thead>

                                        <tr>

                                            <th>#</th>
                                            <th>Student</th>
                                            <th>Course</th>
                                            <th>Price</th>
                                            <th>Progress</th>
                                            <th>Status</th>
                                            <th>Enrolled At</th>
                                            <th>Certificate</th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {students.map(
                                            (item, index) => {

                                                const progress =
                                                    getProgress(
                                                        item.progress
                                                    );

                                                const status =
                                                    String(
                                                        item.status || ''
                                                    ).toLowerCase();

                                                const isCompleted =
                                                    progress >= 100 ||
                                                    status === 'completed' ||
                                                    status === 'complete';

                                                const certificate =
                                                    item.certificate ||
                                                    null;

                                                const hasCertificate =
                                                    isCompleted &&
                                                    certificate &&
                                                    (
                                                        certificate.certificate_file ||
                                                        certificate.certificate_url
                                                    );

                                                return (

                                                    <tr
                                                        key={
                                                            item.enrollment_id ||
                                                            index
                                                        }
                                                    >

                                                        <td data-label="#">

                                                            {index + 1}

                                                        </td>

                                                        <td data-label="Student">

                                                            <div className="d-flex align-items-center gap-2 teacher-enrollment-student">

                                                                {item.student?.avatar ? (

                                                                    <img
                                                                        src={
                                                                            item.student.avatar
                                                                        }
                                                                        alt={
                                                                            item.student?.name ||
                                                                            'Student'
                                                                        }
                                                                        className="rounded-circle teacher-enrollment-avatar"
                                                                    />

                                                                ) : (

                                                                    <div className="rounded-circle d-flex align-items-center justify-content-center teacher-enrollment-avatar-placeholder">

                                                                        <FaUserGraduate />

                                                                    </div>

                                                                )}

                                                                <div className="teacher-enrollment-student-info">

                                                                    <div className="fw-semibold teacher-enrollment-student-name">

                                                                        {
                                                                            item.student?.name ||
                                                                            '-'
                                                                        }

                                                                    </div>

                                                                    <small className="text-muted teacher-enrollment-student-email">

                                                                        {
                                                                            item.student?.email ||
                                                                            '-'
                                                                        }

                                                                    </small>

                                                                </div>

                                                            </div>

                                                        </td>

                                                        <td data-label="Course">

                                                            <div className="fw-semibold teacher-enrollment-course">

                                                                {
                                                                    item.course?.name ||
                                                                    '-'
                                                                }

                                                            </div>

                                                        </td>

                                                        <td data-label="Price">

                                                            ₹
                                                            {Number(
                                                                item.course?.price ||
                                                                0
                                                            ).toFixed(2)}

                                                        </td>

                                                        <td
                                                            data-label="Progress"
                                                            className="teacher-enrollment-progress-cell"
                                                        >

                                                            <div className="d-flex justify-content-between mb-1">

                                                                <small className="text-muted">
                                                                    Progress
                                                                </small>

                                                                <small className="fw-semibold">
                                                                    {progress.toFixed(2)}%
                                                                </small>

                                                            </div>

                                                            <div className="progress teacher-enrollment-progress">

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

                                                            <span className="teacher-enrollment-status">

                                                                <span
                                                                    className={`badge ${getStatusBadge(
                                                                        item.status
                                                                    )}`}
                                                                >

                                                                    {
                                                                        item.status ||
                                                                        'In Progress'
                                                                    }

                                                                </span>

                                                            </span>

                                                        </td>

                                                        <td data-label="Enrolled At">

                                                            <span className="text-muted teacher-enrollment-date">

                                                                {
                                                                    formatDate(
                                                                        item.enrolled_at
                                                                    )
                                                                }

                                                            </span>

                                                        </td>

                                                        <td data-label="Certificate">

                                                            <div className="teacher-enrollment-certificate">

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