
import React, { useEffect, useState } from 'react';

import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import Footer from '../../components/common/Footer';

import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

import {
    FaGraduationCap,
    FaEnvelope,
    FaCertificate,
    FaUserGraduate
} from 'react-icons/fa';


const Enrollments = () => {

    const { token } = useAuth();

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');


    // =====================================
    // Fetch Teacher Students
    // =====================================

    useEffect(() => {

        const fetchStudents = async () => {

            if (!token) {
                setLoading(false);
                setError('Authentication token not found.');
                return;
            }

            try {

                setLoading(true);
                setError('');

                const response = await api.get(
                    '/teacher/teacher_students.php',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!response.data.status) {

                    throw new Error(
                        response.data.message ||
                        'Failed to fetch students.'
                    );

                }

                setStudents(
                    Array.isArray(response.data.data)
                        ? response.data.data
                        : []
                );

            } catch (err) {

                console.error(
                    'Teacher Students Error:',
                    err
                );

                setError(
                    err.response?.data?.message ||
                    err.message ||
                    'Unable to load students.'
                );

            } finally {

                setLoading(false);

            }

        };

        fetchStudents();

    }, [token]);


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
    // Progress
    // =====================================

    const getProgress = (value) => {

        const progress = Number(value || 0);

        return Math.min(
            Math.max(progress, 0),
            100
        );

    };


    // =====================================
    // Status Badge
    // =====================================

    const getStatusBadge = (status) => {

        const currentStatus = String(
            status || ''
        ).toLowerCase();

        if (
            currentStatus === 'completed' ||
            currentStatus === 'complete'
        ) {

            return (
                <span className="badge bg-success">
                    Completed
                </span>
            );

        }

        if (currentStatus === 'dropped') {

            return (
                <span className="badge bg-danger">
                    Dropped
                </span>
            );

        }

        return (
            <span className="badge bg-warning text-dark">
                In Progress
            </span>
        );

    };


    // =====================================
    // View Certificate
    // =====================================

    const viewCertificate = (certificate) => {

        if (!certificate) {

            alert(
                'Certificate has not been generated yet.'
            );

            return;
        }


        // Get URL directly from API

        let certificateUrl =
            certificate.certificate_url;


        // If API does not provide URL,
        // create it from certificate filename

        if (
            !certificateUrl &&
            certificate.certificate_file
        ) {

            certificateUrl =
                `http://localhost/php-lms-project/backend/uploads/certificates/${certificate.certificate_file}`;

        }


        if (!certificateUrl) {

            alert(
                'Certificate PDF is not available.'
            );

            return;
        }


        // Open certificate PDF

        window.open(
            certificateUrl,
            '_blank',
            'noopener,noreferrer'
        );

    };


    // =====================================
    // Render
    // =====================================

    return (

        <>

            <Header />


            <div className="d-flex">

                <Sidebar />


                <div className="flex-grow-1">

                    <div className="container-fluid py-4">


                        {/* =================================
                            PAGE HEADER
                        ================================= */}

                        <div className="d-flex justify-content-between align-items-center mb-4">

                            <div>

                                <h2 className="fw-bold mb-1">
                                    Enrollments
                                </h2>

                                <p className="text-muted mb-0">
                                    View students enrolled in your courses.
                                </p>

                            </div>


                            <div className="d-flex align-items-center gap-2 bg-primary text-white px-3 py-2 rounded">

                                <FaUserGraduate />

                                <strong>
                                    {students.length}
                                </strong>

                                <span>
                                    Students
                                </span>

                            </div>

                        </div>


                        {/* =================================
                            ERROR
                        ================================= */}

                        {error && (

                            <div className="alert alert-danger">
                                {error}
                            </div>

                        )}


                        {/* =================================
                            LOADING
                        ================================= */}

                        {loading ? (

                            <div className="text-center py-5">

                                <div
                                    className="spinner-border text-primary"
                                    role="status"
                                >

                                    <span className="visually-hidden">
                                        Loading...
                                    </span>

                                </div>


                                <p className="text-muted mt-3">
                                    Loading students...
                                </p>

                            </div>

                        ) : students.length === 0 && !error ? (

                            /* =================================
                               EMPTY STATE
                            ================================= */

                            <div className="card border-0 shadow-sm">

                                <div className="card-body text-center py-5">

                                    <FaGraduationCap
                                        size={50}
                                        className="text-muted mb-3"
                                    />

                                    <h5 className="fw-semibold">
                                        No Students Enrolled
                                    </h5>

                                    <p className="text-muted mb-0">
                                        Students enrolled in your courses
                                        will appear here.
                                    </p>

                                </div>

                            </div>

                        ) : (

                            /* =================================
                               STUDENTS TABLE
                            ================================= */

                            <div className="card border-0 shadow-sm">

                                <div className="card-body p-0">

                                    <div className="table-responsive">

                                        <table className="table table-hover align-middle mb-0">


                                            {/* =================================
                                                TABLE HEADER
                                            ================================= */}

                                            <thead className="table-light">

                                                <tr>

                                                    <th className="px-3">
                                                        Student
                                                    </th>

                                                    <th>
                                                        Email
                                                    </th>

                                                    <th>
                                                        Course
                                                    </th>

                                                    <th>
                                                        Price
                                                    </th>

                                                    <th>
                                                        Enrolled On
                                                    </th>

                                                    <th>
                                                        Progress
                                                    </th>

                                                    <th>
                                                        Status
                                                    </th>

                                                    <th>
                                                        Certificate
                                                    </th>

                                                </tr>

                                            </thead>


                                            {/* =================================
                                                TABLE BODY
                                            ================================= */}

                                            <tbody>

                                                {students.map((item) => {

                                                    const progress =
                                                        getProgress(
                                                            item.progress
                                                        );


                                                    const status =
                                                        String(
                                                            item.status || ''
                                                        ).toLowerCase();


                                                    // =================================
                                                    // Completed
                                                    // =================================

                                                    const isCompleted =
                                                        progress >= 100 ||
                                                        status === 'completed' ||
                                                        status === 'complete';


                                                    // =================================
                                                    // Certificate
                                                    // =================================

                                                    const certificate =
                                                        item.certificate || null;


                                                    return (

                                                        <tr
                                                            key={
                                                                item.enrollment_id
                                                            }
                                                        >


                                                            {/* ======================
                                                                STUDENT
                                                            ====================== */}

                                                            <td className="px-3">

                                                                <div className="d-flex align-items-center gap-2">

                                                                    {item.student?.avatar ? (

                                                                        <img
                                                                            src={
                                                                                item.student.avatar
                                                                            }
                                                                            alt={
                                                                                item.student?.name ||
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

                                                                            <FaUserGraduate
                                                                                className="text-secondary"
                                                                            />

                                                                        </div>

                                                                    )}


                                                                    <div>

                                                                        <div className="fw-semibold">

                                                                            {
                                                                                item.student?.name ||
                                                                                '-'
                                                                            }

                                                                        </div>


                                                                        <small className="text-muted">

                                                                            ID:{' '}

                                                                            {
                                                                                item.student?.id ||
                                                                                '-'
                                                                            }

                                                                        </small>

                                                                    </div>

                                                                </div>

                                                            </td>


                                                            {/* ======================
                                                                EMAIL
                                                            ====================== */}

                                                            <td>

                                                                <div className="small">

                                                                    <FaEnvelope className="me-1" />

                                                                    {
                                                                        item.student?.email ||
                                                                        '-'
                                                                    }

                                                                </div>

                                                            </td>


                                                            {/* ======================
                                                                COURSE
                                                            ====================== */}

                                                            <td>

                                                                <div className="fw-semibold">

                                                                    {
                                                                        item.course?.name ||
                                                                        '-'
                                                                    }

                                                                </div>

                                                            </td>


                                                            {/* ======================
                                                                PRICE
                                                            ====================== */}

                                                            <td>

                                                                ₹
                                                                {Number(
                                                                    item.course?.price || 0
                                                                ).toFixed(2)}

                                                            </td>


                                                            {/* ======================
                                                                ENROLLED DATE
                                                            ====================== */}

                                                            <td>

                                                                {
                                                                    formatDate(
                                                                        item.enrolled_at
                                                                    )
                                                                }

                                                            </td>


                                                            {/* ======================
                                                                PROGRESS
                                                            ====================== */}

                                                            <td
                                                                style={{
                                                                    minWidth: '160px'
                                                                }}
                                                            >

                                                                <div className="d-flex align-items-center gap-2">

                                                                    <div
                                                                        className="progress flex-grow-1"
                                                                        style={{
                                                                            height: '7px'
                                                                        }}
                                                                    >

                                                                        <div
                                                                            className="progress-bar bg-primary"
                                                                            role="progressbar"
                                                                            style={{
                                                                                width: `${progress}%`
                                                                            }}
                                                                        />

                                                                    </div>


                                                                    <small className="fw-semibold">

                                                                        {progress.toFixed(0)}%

                                                                    </small>

                                                                </div>

                                                            </td>


                                                            {/* ======================
                                                                STATUS
                                                            ====================== */}

                                                            <td>

                                                                {getStatusBadge(
                                                                    item.status
                                                                )}

                                                            </td>


                                                            {/* ======================
                                                                CERTIFICATE
                                                            ====================== */}

                                                            <td>

                                                                {isCompleted ? (

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
                                                                        onClick={() => {

                                                                            alert(
                                                                                'Certificate is not available because the student has not completed the course yet.'
                                                                            );

                                                                        }}
                                                                    >

                                                                        <FaCertificate className="me-1" />

                                                                        Not Available

                                                                    </button>

                                                                )}

                                                            </td>


                                                        </tr>

                                                    );

                                                })}

                                            </tbody>

                                        </table>

                                    </div>

                                </div>

                            </div>

                        )}

                    </div>

                </div>

            </div>


            <Footer />

        </>

    );

};


export default Enrollments;

