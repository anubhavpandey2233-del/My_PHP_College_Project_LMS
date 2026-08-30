import {
    useEffect,
    useState
} from 'react';

import {
    MdCheckCircle,
    MdCancel,
    MdRefresh,
    MdPerson,
    MdEmail,
    MdArrowBack
} from 'react-icons/md';

import { useNavigate } from 'react-router-dom';

import api from '../../services/api';


const AdminInstructorApplications = () => {

    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);

    const [loading, setLoading] = useState(true);

    const [actionLoading, setActionLoading] = useState(null);


    // ==========================================
    // FETCH APPLICATIONS
    // ==========================================

    const fetchApplications = async () => {

        try {

            setLoading(true);

            const response = await api.get(
                '/instructor/list.php'
            );

            if (response.data?.status) {

                setApplications(
                    response.data?.data?.applications || []
                );

            } else {

                setApplications([]);

            }

        } catch (error) {

            console.error(
                'Instructor Applications Error:',
                error
            );

            setApplications([]);

        } finally {

            setLoading(false);

        }

    };


    // ==========================================
    // APPROVE / REJECT
    // ==========================================

    const updateApplicationStatus = async (
        applicationId,
        status
    ) => {

        try {

            setActionLoading(applicationId);

            const response = await api.post(
                '/instructor/update-status.php',
                {
                    application_id: applicationId,
                    status: status
                }
            );

            if (response.data?.status) {

                setApplications((prev) =>
                    prev.map(
                        (application) =>
                            Number(application.id) ===
                            Number(applicationId)
                                ? {
                                    ...application,
                                    status: status
                                }
                                : application
                    )
                );

            }

        } catch (error) {

            console.error(
                'Update Application Error:',
                error
            );

        } finally {

            setActionLoading(null);

        }

    };


    // ==========================================
    // LOAD
    // ==========================================

    useEffect(() => {

        fetchApplications();

    }, []);


    // ==========================================
    // STATUS CLASS
    // ==========================================

    const getStatusClass = (status) => {

        if (status === 'approved') {
            return 'bg-success';
        }

        if (status === 'rejected') {
            return 'bg-danger';
        }

        return 'bg-warning text-dark';

    };


    return (

        <div className="container py-4">

            {/* ==================================
                HEADER
            ================================== */}

            <div
                className="
                    d-flex
                    justify-content-between
                    align-items-center
                    mb-4
                "
            >

                <div>

                    <h3 className="mb-1">
                        Instructor Applications
                    </h3>

                    <p className="text-muted mb-0">
                        Manage instructor applications
                    </p>

                </div>


                <div className="d-flex gap-2">

                    {/* BACK BUTTON */}

                    <button
                        type="button"
                        className="
                            btn
                            btn-outline-secondary
                            d-flex
                            align-items-center
                            gap-2
                        "
                        onClick={() => navigate(-1)}
                    >

                        <MdArrowBack size={20} />

                        Back

                    </button>


                    {/* REFRESH BUTTON */}

                    <button
                        type="button"
                        className="
                            btn
                            btn-outline-primary
                            d-flex
                            align-items-center
                            gap-2
                        "
                        onClick={fetchApplications}
                        disabled={loading}
                    >

                        <MdRefresh size={20} />

                        Refresh

                    </button>

                </div>

            </div>


            {/* ==================================
                LOADING
            ================================== */}

            {loading ? (

                <div className="text-center py-5">

                    <div
                        className="spinner-border text-primary"
                        role="status"
                    />

                    <div className="text-muted mt-3">
                        Loading applications...
                    </div>

                </div>

            ) : applications.length === 0 ? (

                <div
                    className="
                        card
                        border-0
                        shadow-sm
                    "
                >

                    <div
                        className="
                            card-body
                            text-center
                            py-5
                        "
                    >

                        <MdPerson
                            size={50}
                            className="text-muted mb-3"
                        />

                        <h5>
                            No Instructor Applications
                        </h5>

                        <p className="text-muted mb-0">
                            There are no instructor applications yet.
                        </p>

                    </div>

                </div>

            ) : (

                <div className="row g-4">

                    {applications.map(
                        (application) => {

                            const isPending =
                                application.status === 'pending';

                            const isProcessing =
                                Number(actionLoading) ===
                                Number(application.id);


                            return (

                                <div
                                    className="col-12"
                                    key={application.id}
                                >

                                    <div
                                        className="
                                            card
                                            border-0
                                            shadow-sm
                                        "
                                    >

                                        <div className="card-body">

                                            {/* TOP */}

                                            <div
                                                className="
                                                    d-flex
                                                    justify-content-between
                                                    align-items-start
                                                    gap-3
                                                    mb-3
                                                "
                                            >

                                                <div>

                                                    <h5 className="mb-1">
                                                        {application.name}
                                                    </h5>

                                                    <div
                                                        className="
                                                            text-muted
                                                            small
                                                        "
                                                    >

                                                        <MdEmail
                                                            size={16}
                                                            className="me-1"
                                                        />

                                                        {application.email}

                                                    </div>

                                                </div>


                                                <span
                                                    className={`
                                                        badge
                                                        ${getStatusClass(
                                                            application.status
                                                        )}
                                                    `}
                                                >
                                                    {String(
                                                        application.status
                                                    ).toUpperCase()}
                                                </span>

                                            </div>


                                            {/* DETAILS */}

                                            <div className="row g-3">

                                                <div className="col-md-4">

                                                    <strong>
                                                        Qualification
                                                    </strong>

                                                    <div className="text-muted mt-1">
                                                        {application.qualification || '-'}
                                                    </div>

                                                </div>


                                                <div className="col-md-4">

                                                    <strong>
                                                        Experience
                                                    </strong>

                                                    <div className="text-muted mt-1">
                                                        {application.experience || '-'}
                                                    </div>

                                                </div>


                                                <div className="col-md-4">

                                                    <strong>
                                                        Expertise
                                                    </strong>

                                                    <div className="text-muted mt-1">
                                                        {application.expertise || '-'}
                                                    </div>

                                                </div>


                                                <div className="col-12">

                                                    <strong>
                                                        Why do you want to become an instructor?
                                                    </strong>

                                                    <div className="text-muted mt-1">
                                                        {application.reason || '-'}
                                                    </div>

                                                </div>


                                                <div className="col-12">

                                                    <strong>
                                                        About Yourself
                                                    </strong>

                                                    <div className="text-muted mt-1">
                                                        {application.bio || '-'}
                                                    </div>

                                                </div>

                                            </div>


                                            {/* ACTIONS */}

                                            {isPending && (

                                                <div
                                                    className="
                                                        d-flex
                                                        gap-2
                                                        mt-4
                                                        pt-3
                                                        border-top
                                                    "
                                                >

                                                    <button
                                                        type="button"
                                                        className="
                                                            btn
                                                            btn-success
                                                            d-flex
                                                            align-items-center
                                                            gap-2
                                                        "
                                                        disabled={isProcessing}
                                                        onClick={() =>
                                                            updateApplicationStatus(
                                                                application.id,
                                                                'approved'
                                                            )
                                                        }
                                                    >

                                                        <MdCheckCircle
                                                            size={19}
                                                        />

                                                        {isProcessing
                                                            ? 'Processing...'
                                                            : 'Approve'}

                                                    </button>


                                                    <button
                                                        type="button"
                                                        className="
                                                            btn
                                                            btn-danger
                                                            d-flex
                                                            align-items-center
                                                            gap-2
                                                        "
                                                        disabled={isProcessing}
                                                        onClick={() =>
                                                            updateApplicationStatus(
                                                                application.id,
                                                                'rejected'
                                                            )
                                                        }
                                                    >

                                                        <MdCancel
                                                            size={19}
                                                        />

                                                        Reject

                                                    </button>

                                                </div>

                                            )}

                                        </div>

                                    </div>

                                </div>

                            );

                        }
                    )}

                </div>

            )}

        </div>

    );

};


export default AdminInstructorApplications;