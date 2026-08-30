import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { useAuth } from '../../context/AuthContext';

const BecomeInstructor = () => {
    const {
        user,
        isAuthenticated
    } = useAuth();

    const navigate = useNavigate();

    const role = user?.role?.toLowerCase();

    const handleGetStarted = () => {
        if (!isAuthenticated) {
            navigate('/login', {
                state: {
                    from: '/become-instructor'
                }
            });
            return;
        }

        if (role === 'teacher') {
            navigate('/teacher');
            return;
        }

        if (role === 'admin') {
            navigate('/admin');
            return;
        }

        if (role === 'student') {
            navigate('/become-instructor/apply');
            return;
        }

        navigate('/login');
    };

    return (
        <div className="d-flex flex-column min-vh-100">

            <Header />

            <main className="flex-grow-1">

                <section className="py-5 bg-light">
                    <div className="container py-5">

                        <div className="row align-items-center">

                            <div className="col-lg-7">

                                <span className="badge bg-primary mb-3">
                                    Become an Instructor
                                </span>

                                <h1 className="display-5 fw-bold mb-3">
                                    Share Your Knowledge.
                                    <br />
                                    Inspire Students.
                                </h1>

                                <p className="lead text-muted mb-4">
                                    Turn your knowledge and experience into
                                    valuable online courses and help students
                                    learn new skills.
                                </p>

                                <Link
                                    to="/become-instructor/apply"
                                    className="btn btn-primary px-4 py-2"
                                >
                                    Get Started
                                </Link>

                            </div>

                            <div className="col-lg-5 mt-4 mt-lg-0">

                                <div className="card border-0 shadow-sm">
                                    <div className="card-body p-4">

                                        <h4 className="fw-bold mb-4">
                                            Why Become an Instructor?
                                        </h4>

                                        <div className="mb-3">
                                            <h6 className="fw-bold mb-1">
                                                🎓 Teach Your Skills
                                            </h6>

                                            <p className="text-muted mb-0">
                                                Share your knowledge with
                                                students from different
                                                backgrounds.
                                            </p>
                                        </div>

                                        <div className="mb-3">
                                            <h6 className="fw-bold mb-1">
                                                🌎 Reach More Students
                                            </h6>

                                            <p className="text-muted mb-0">
                                                Create courses and reach
                                                learners online.
                                            </p>
                                        </div>

                                        <div>
                                            <h6 className="fw-bold mb-1">
                                                🚀 Grow Your Career
                                            </h6>

                                            <p className="text-muted mb-0">
                                                Build your teaching profile
                                                and professional experience.
                                            </p>
                                        </div>

                                    </div>
                                </div>

                            </div>

                        </div>

                    </div>
                </section>

                <section className="py-5">

                    <div className="container py-4">

                        <div className="text-center mb-5">

                            <h2 className="fw-bold">
                                How It Works
                            </h2>

                            <p className="text-muted">
                                Start your journey as an instructor
                                in a few simple steps.
                            </p>

                        </div>

                        <div className="row g-4">

                            <div className="col-md-4">

                                <div className="card h-100 border-0 shadow-sm">
                                    <div className="card-body p-4 text-center">

                                        <div className="fs-1 mb-3">
                                            📝
                                        </div>

                                        <h5 className="fw-bold">
                                            Apply
                                        </h5>

                                        <p className="text-muted mb-0">
                                            Submit your instructor
                                            application with your details.
                                        </p>

                                    </div>
                                </div>

                            </div>

                            <div className="col-md-4">

                                <div className="card h-100 border-0 shadow-sm">
                                    <div className="card-body p-4 text-center">

                                        <div className="fs-1 mb-3">
                                            🔍
                                        </div>

                                        <h5 className="fw-bold">
                                            Get Reviewed
                                        </h5>

                                        <p className="text-muted mb-0">
                                            Your application will be reviewed
                                            by our administration team.
                                        </p>

                                    </div>
                                </div>

                            </div>

                            <div className="col-md-4">

                                <div className="card h-100 border-0 shadow-sm">
                                    <div className="card-body p-4 text-center">

                                        <div className="fs-1 mb-3">
                                            👨‍🏫
                                        </div>

                                        <h5 className="fw-bold">
                                            Start Teaching
                                        </h5>

                                        <p className="text-muted mb-0">
                                            Once approved, create courses
                                            and start teaching students.
                                        </p>

                                    </div>
                                </div>

                            </div>

                        </div>

                    </div>

                </section>

                <section className="py-5 bg-primary text-white">

                    <div className="container text-center py-4">

                        <h2 className="fw-bold mb-3">
                            Ready to Share Your Knowledge?
                        </h2>

                        <p className="mb-4">
                            Start your instructor journey with PHP LMS.
                        </p>

                        <button
                            type="button"
                            onClick={handleGetStarted}
                            className="btn btn-light px-4 py-2"
                        >
                            Become an Instructor
                        </button>

                    </div>

                </section>

            </main>

            <Footer />

        </div>
    );
};

export default BecomeInstructor;