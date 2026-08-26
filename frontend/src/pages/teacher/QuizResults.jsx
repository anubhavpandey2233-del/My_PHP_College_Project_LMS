
import { useEffect, useState } from 'react';

import Loading from '../../components/common/Loading';
import api from '../../services/api';

const QuizResults = () => {

    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [students, setStudents] = useState([]);

    const [loading, setLoading] = useState(true);
    const [studentsLoading, setStudentsLoading] = useState(false);

    const [error, setError] = useState('');


    // ==========================================
    // LOAD TEACHER QUIZZES
    // ==========================================

    useEffect(() => {

        const fetchQuizzes = async () => {

            try {

                setLoading(true);
                setError('');

                const response = await api.get(
                    '/teacher/quiz/list.php'
                );

                if (!response.data?.status) {

                    throw new Error(
                        response.data?.message ||
                        'Failed to fetch quizzes'
                    );

                }

                const quizData =
                    response.data?.data?.quizzes;

                setQuizzes(
                    Array.isArray(quizData)
                        ? quizData
                        : []
                );

            } catch (err) {

                console.error(
                    'Fetch quizzes error:',
                    err
                );

                setError(
                    err.response?.data?.message ||
                    err.message ||
                    'Failed to load quizzes'
                );

            } finally {

                setLoading(false);

            }

        };

        fetchQuizzes();

    }, []);


    // ==========================================
    // LOAD STUDENT ATTEMPTS
    // ==========================================

    const handleViewResults = async (quiz) => {

        if (!quiz?.id) {

            setError('Quiz ID is required');

            return;
        }

        try {

            setSelectedQuiz(quiz);
            setStudents([]);
            setStudentsLoading(true);
            setError('');

            const response = await api.get(
                '/teacher/quiz/student-attempts.php',
                {
                    params: {
                        quiz_id: quiz.id
                    }
                }
            );

            if (!response.data?.status) {

                throw new Error(
                    response.data?.message ||
                    'Failed to fetch student results'
                );

            }

            const resultData =
                response.data?.data || {};

            setStudents(
                Array.isArray(resultData.students)
                    ? resultData.students
                    : []
            );

        } catch (err) {

            console.error(
                'Fetch student attempts error:',
                err
            );

            setStudents([]);

            setError(
                err.response?.data?.message ||
                err.message ||
                'Failed to load student results'
            );

        } finally {

            setStudentsLoading(false);

        }

    };


    // ==========================================
    // BACK TO QUIZZES
    // ==========================================

    const handleBack = () => {

        setSelectedQuiz(null);
        setStudents([]);
        setError('');

    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return <Loading />;

    }


    // ==========================================
    // QUIZ LIST ERROR
    // ==========================================

    if (error && !selectedQuiz) {

        return (

            <div className="alert alert-danger">
                {error}
            </div>

        );

    }


    // ==========================================
    // PAGE
    // ==========================================

    return (

        <div>

            {/* ==========================================
                HEADER
            ========================================== */}

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h2 className="mb-1">
                        Quiz Results
                    </h2>

                    <p className="text-muted mb-0">
                        View student attempts for your quizzes
                    </p>

                </div>

            </div>


            {/* ==========================================
                QUIZ LIST
            ========================================== */}

            {!selectedQuiz && (

                quizzes.length === 0 ? (

                    <div className="card shadow-sm border-0">

                        <div className="card-body text-center py-5">

                            <h5 className="mb-2">
                                No Quizzes Found
                            </h5>

                            <p className="text-muted mb-0">
                                You have not created any quizzes yet.
                            </p>

                        </div>

                    </div>

                ) : (

                    <div className="row g-4">

                        {quizzes.map((quiz) => (

                            <div
                                className="col-md-6 col-lg-4"
                                key={quiz.id}
                            >

                                <div className="card shadow-sm border-0 h-100">

                                    <div className="card-body d-flex flex-column">

                                        <h5 className="card-title mb-2">
                                            {quiz.title || 'Untitled Quiz'}
                                        </h5>


                                        <p className="text-muted small mb-3">

                                            <strong>
                                                Course:
                                            </strong>{' '}

                                            {quiz.course_title || 'N/A'}

                                        </p>


                                        {quiz.description && (

                                            <p className="text-muted small">
                                                {quiz.description}
                                            </p>

                                        )}


                                        <div className="row g-2 mt-auto mb-3">

                                            <div className="col-6">

                                                <div className="bg-light rounded p-2">

                                                    <small className="text-muted d-block">
                                                        Total Marks
                                                    </small>

                                                    <strong>
                                                        {quiz.total_marks ?? 0}
                                                    </strong>

                                                </div>

                                            </div>


                                            <div className="col-6">

                                                <div className="bg-light rounded p-2">

                                                    <small className="text-muted d-block">
                                                        Passing
                                                    </small>

                                                    <strong>
                                                        {quiz.passing_percentage ?? 0}%
                                                    </strong>

                                                </div>

                                            </div>


                                            <div className="col-6">

                                                <div className="bg-light rounded p-2">

                                                    <small className="text-muted d-block">
                                                        Time
                                                    </small>

                                                    <strong>

                                                        {quiz.time_limit
                                                            ? `${quiz.time_limit} min`
                                                            : 'No limit'
                                                        }

                                                    </strong>

                                                </div>

                                            </div>


                                            <div className="col-6">

                                                <div className="bg-light rounded p-2">

                                                    <small className="text-muted d-block">
                                                        Status
                                                    </small>

                                                    <strong
                                                        className={
                                                            quiz.status === 'published'
                                                                ? 'text-success'
                                                                : 'text-secondary'
                                                        }
                                                    >
                                                        {quiz.status || 'N/A'}
                                                    </strong>

                                                </div>

                                            </div>

                                        </div>


                                        <button
                                            type="button"
                                            className="btn btn-primary w-100"
                                            onClick={() =>
                                                handleViewResults(quiz)
                                            }
                                        >
                                            View Student Results
                                        </button>

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                )

            )}


            {/* ==========================================
                STUDENT RESULTS
            ========================================== */}

            {selectedQuiz && (

                <div>

                    <div className="d-flex justify-content-between align-items-center mb-4">

                        <div>

                            <h4 className="mb-1">
                                {selectedQuiz.title || 'Quiz'}
                            </h4>

                            <p className="text-muted mb-0">
                                Student Results
                            </p>

                        </div>


                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={handleBack}
                        >
                            ← Back to Quizzes
                        </button>

                    </div>


                    {/* ==========================================
                        ERROR
                    ========================================== */}

                    {error && (

                        <div className="alert alert-danger mb-3">
                            {error}
                        </div>

                    )}


                    {/* ==========================================
                        LOADING
                    ========================================== */}

                    {studentsLoading ? (

                        <Loading />

                    ) : (

                        <div className="card shadow-sm border-0">

                            <div className="card-header bg-white py-3">

                                <h5 className="mb-1">
                                    Student Attempts
                                </h5>

                                <small className="text-muted">
                                    Students enrolled in this quiz's course
                                </small>

                            </div>


                            <div className="card-body p-0">

                                <div className="table-responsive">

                                    <table className="table table-hover align-middle mb-0">

                                        <thead className="table-light">

                                            <tr>

                                                <th className="px-3">
                                                    #
                                                </th>

                                                <th>
                                                    Student
                                                </th>

                                                <th>
                                                    Email
                                                </th>

                                                <th>
                                                    Status
                                                </th>

                                                <th>
                                                    Score
                                                </th>

                                                <th>
                                                    Percentage
                                                </th>

                                                <th>
                                                    Result
                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {students.length > 0 ? (

                                                students.map(
                                                    (student, index) => {

                                                        const attempted =
                                                            Number(
                                                                student.has_attempted
                                                            ) === 1;


                                                        return (

                                                            <tr
                                                                key={
                                                                    `${student.student_id}-${student.attempt_id || 'none'}`
                                                                }
                                                            >

                                                                <td className="px-3">
                                                                    {index + 1}
                                                                </td>


                                                                <td>

                                                                    <div className="fw-semibold">
                                                                        {
                                                                            student.student_name ||
                                                                            'N/A'
                                                                        }
                                                                    </div>

                                                                </td>


                                                                <td>

                                                                    <span className="text-muted">
                                                                        {
                                                                            student.student_email ||
                                                                            'N/A'
                                                                        }
                                                                    </span>

                                                                </td>


                                                                <td>

                                                                    {attempted ? (

                                                                        <span className="badge bg-success">
                                                                            Attempted
                                                                        </span>

                                                                    ) : (

                                                                        <span className="badge bg-secondary">
                                                                            Not Attempted
                                                                        </span>

                                                                    )}

                                                                </td>


                                                                <td>

                                                                    {attempted

                                                                        ? `${student.score ?? 0} / ${selectedQuiz.total_marks ?? 0}`

                                                                        : '—'

                                                                    }

                                                                </td>


                                                                <td>

                                                                    {attempted

                                                                        ? `${student.percentage ?? 0}%`

                                                                        : '—'

                                                                    }

                                                                </td>


                                                                <td>

                                                                    {attempted ? (

                                                                        Number(
                                                                            student.is_passed
                                                                        ) === 1 ? (

                                                                            <span className="badge bg-success">
                                                                                Passed
                                                                            </span>

                                                                        ) : (

                                                                            <span className="badge bg-danger">
                                                                                Failed
                                                                            </span>

                                                                        )

                                                                    ) : (

                                                                        <span className="text-muted">
                                                                            —
                                                                        </span>

                                                                    )}

                                                                </td>

                                                            </tr>

                                                        );

                                                    }

                                                )

                                            ) : (

                                                <tr>

                                                    <td
                                                        colSpan="7"
                                                        className="text-center py-5 text-muted"
                                                    >
                                                        No students found.
                                                    </td>

                                                </tr>

                                            )}

                                        </tbody>

                                    </table>

                                </div>

                            </div>

                        </div>

                    )}

                </div>

            )}

        </div>

    );

};

export default QuizResults;

