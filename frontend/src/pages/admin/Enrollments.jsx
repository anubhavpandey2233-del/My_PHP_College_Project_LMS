
import { useEffect, useState } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loading from '../../components/common/Loading';
import {
    FaCertificate,
} from 'react-icons/fa';


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


        // ---------------------------------
        // Get Certificate URL / File
        // ---------------------------------

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


        // ---------------------------------
        // Complete URL
        // ---------------------------------

        if (
            certificateUrl.startsWith('http://') ||
            certificateUrl.startsWith('https://')
        ) {

            finalUrl = certificateUrl;

        } else {

            // ---------------------------------
            // Certificate filename
            // ---------------------------------

            finalUrl =
                `http://localhost/php-lms-project/backend/uploads/certificates/${certificateUrl}`;

        }


        // ---------------------------------
        // Open Certificate PDF
        // ---------------------------------

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

            {/* =====================================
                PAGE HEADER
            ===================================== */}

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


            {/* =====================================
                ENROLLMENT CARD
            ===================================== */}

            <div className="card shadow-sm border-0">

                <div className="card-body p-4">


                    {/* =====================================
                        CARD HEADER
                    ===================================== */}

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


                    {/* =====================================
                        LOADING
                    ===================================== */}

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


                                {/* =====================================
                                    TABLE HEADER
                                ===================================== */}

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
                                            Progress
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Enrolled At
                                        </th>

                                        <th>
                                            Certificate
                                        </th>

                                    </tr>

                                </thead>


                                {/* =====================================
                                    TABLE BODY
                                ===================================== */}

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


                                                    {/* ======================
                                                        NUMBER
                                                    ====================== */}

                                                    <td>

                                                        {index + 1}

                                                    </td>


                                                    {/* ======================
                                                        STUDENT
                                                    ====================== */}

                                                    <td>

                                                        <div className="d-flex align-items-center gap-2">


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
                                                                    className="rounded-circle"
                                                                    style={{
                                                                        objectFit: 'cover'
                                                                    }}
                                                                />

                                                            ) : (

                                                                <div
                                                                    className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                                                                    style={{
                                                                        width: '42px',
                                                                        height: '42px'
                                                                    }}
                                                                >

                                                                    <i className="bi bi-person text-secondary"></i>

                                                                </div>

                                                            )}


                                                            <div>

                                                                <div className="fw-semibold">

                                                                    {
                                                                        enrollment.student_name ||
                                                                        '-'
                                                                    }

                                                                </div>


                                                                <small className="text-muted">

                                                                    {
                                                                        enrollment.student_email ||
                                                                        '-'
                                                                    }

                                                                </small>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    {/* ======================
                                                        COURSE
                                                    ====================== */}

                                                    <td>

                                                        <div className="fw-semibold">

                                                            {
                                                                enrollment.course_title ||
                                                                '-'
                                                            }

                                                        </div>

                                                    </td>


                                                    {/* ======================
                                                        PROGRESS
                                                    ====================== */}

                                                    <td
                                                        style={{
                                                            minWidth: '150px'
                                                        }}
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
                                                            className="progress"
                                                            style={{
                                                                height: '7px'
                                                            }}
                                                        >

                                                            <div
                                                                className={`progress-bar ${progress >= 100
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


                                                    {/* ======================
                                                        STATUS
                                                    ====================== */}

                                                    <td>

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

                                                    </td>


                                                    {/* ======================
                                                        ENROLLED DATE
                                                    ====================== */}

                                                    <td>

                                                        <span className="text-muted">

                                                            {
                                                                formatDate(
                                                                    enrollment.enrolled_at
                                                                )
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* ======================
                                                        CERTIFICATE
                                                    ====================== */}

                                                    <td>

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

        </DashboardLayout>

    );

};


export default Enrollments;

