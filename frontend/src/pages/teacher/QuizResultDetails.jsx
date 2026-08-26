
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Loading from '../../components/common/Loading';
import api from '../../services/api';

const QuizResultDetails = () => {

    const { quizId, studentId } = useParams();

    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');


    // ==========================================
    // FETCH RESULT DETAILS
    // ==========================================

    useEffect(() => {

        const fetchResultDetails = async () => {

            if (!quizId || !studentId) {

                setError(
                    'Quiz ID and Student ID are required'
                );

                setLoading(false);

                return;
            }

            try {

                setLoading(true);
                setError('');

                const response = await api.get(
                    '/teacher/quiz/result-details.php',
                    {
                        params: {
                            quiz_id: quizId,
                            student_id: studentId
                        }
                    }
                );

                if (!response.data?.status) {

                    throw new Error(
                        response.data?.message ||
                        'Failed to fetch result details'
                    );

                }

                setData(
                    response.data?.data || null
                );

            } catch (err) {

                console.error(
                    'Fetch result details error:',
                    err
                );

                setError(
                    err.response?.data?.message ||
                    err.message ||
                    'Something went wrong'
                );

            } finally {

                setLoading(false);

            }

        };

        fetchResultDetails();

    }, [quizId, studentId]);


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return <Loading />;
    }


    // ==========================================
    // ERROR
    // ==========================================

    if (error) {

        return (

            <div>

                <div className="d-flex justify-content-between align-items-center mb-4">

                    <h2 className="mb-0">
                        Quiz Result Details
                    </h2>

                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => navigate(-1)}
                    >
                        ← Back
                    </button>

                </div>

                <div className="alert alert-danger">
                    {error}
                </div>

            </div>

        );

    }


    // ==========================================
    // NO DATA
    // ==========================================

    if (!data) {

        return (

            <div>

                <div className="d-flex justify-content-between align-items-center mb-4">

                    <h2>
                        Quiz Result Details
                    </h2>

                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => navigate(-1)}
                    >
                        ← Back
                    </button>

                </div>

                <div className="alert alert-info">
                    No result details available.
                </div>

            </div>

        );

    }


    const quiz = data.quiz || {};
    const student = data.student || {};
    const result = data.result || {};

    const questions = Array.isArray(data.questions)
        ? data.questions
        : [];


    return (

        <div>

            {/* ==========================================
                HEADER
            ========================================== */}

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h2 className="mb-1">
                        Quiz Result Details
                    </h2>

                    <p className="text-muted mb-0">
                        {quiz.title || 'Quiz'}
                    </p>

                </div>

                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>

            </div>


            {/* ==========================================
                STUDENT INFORMATION
            ========================================== */}

            <div className="card shadow-sm border-0 mb-4">

                <div className="card-header bg-white py-3">

                    <h5 className="mb-0">
                        Student Information
                    </h5>

                </div>

                <div className="card-body">

                    <div className="row g-4">

                        <div className="col-md-4">

                            <small className="text-muted d-block mb-1">
                                Student
                            </small>

                            <div className="fw-semibold">
                                {student.name || 'N/A'}
                            </div>

                        </div>


                        <div className="col-md-4">

                            <small className="text-muted d-block mb-1">
                                Email
                            </small>

                            <div className="fw-semibold">
                                {student.email || 'N/A'}
                            </div>

                        </div>


                        <div className="col-md-4">

                            <small className="text-muted d-block mb-1">
                                Student ID
                            </small>

                            <div className="fw-semibold">
                                {student.id || studentId}
                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* ==========================================
                RESULT SUMMARY
            ========================================== */}

            <div className="row g-3 mb-4">

                <div className="col-md-3">

                    <div className="card shadow-sm border-0 h-100">

                        <div className="card-body">

                            <small className="text-muted">
                                Score
                            </small>

                            <h3 className="mt-2 mb-0">
                                {result.score ?? 0}
                                {' / '}
                                {quiz.total_marks ?? 0}
                            </h3>

                        </div>

                    </div>

                </div>


                <div className="col-md-3">

                    <div className="card shadow-sm border-0 h-100">

                        <div className="card-body">

                            <small className="text-muted">
                                Percentage
                            </small>

                            <h3 className="mt-2 mb-0">
                                {result.percentage ?? 0}%
                            </h3>

                        </div>

                    </div>

                </div>


                <div className="col-md-3">

                    <div className="card shadow-sm border-0 h-100">

                        <div className="card-body">

                            <small className="text-muted">
                                Result
                            </small>

                            <div className="mt-2">

                                {Number(result.is_passed) === 1 ? (

                                    <span className="badge bg-success fs-6">
                                        Passed
                                    </span>

                                ) : (

                                    <span className="badge bg-danger fs-6">
                                        Failed
                                    </span>

                                )}

                            </div>

                        </div>

                    </div>

                </div>


                <div className="col-md-3">

                    <div className="card shadow-sm border-0 h-100">

                        <div className="card-body">

                            <small className="text-muted">
                                Time Taken
                            </small>

                            <h3 className="mt-2 mb-0">

                                {result.time_taken ?? 0}

                                <small className="fs-6 text-muted ms-1">
                                    sec
                                </small>

                            </h3>

                        </div>

                    </div>

                </div>

            </div>


            {/* ==========================================
                QUESTIONS
            ========================================== */}

            <div className="card shadow-sm border-0">

                <div className="card-header bg-white py-3">

                    <h5 className="mb-1">
                        Question Details
                    </h5>

                    <small className="text-muted">
                        Student answers and correct answers
                    </small>

                </div>


                <div className="card-body">

                    {questions.length > 0 ? (

                        questions.map(
                            (question, index) => {

                                const isCorrect =
                                    Number(
                                        question.is_correct
                                    ) === 1;

                                return (

                                    <div
                                        key={
                                            question.id ||
                                            question.question_id ||
                                            index
                                        }
                                        className={`border rounded p-3 mb-3 ${
                                            isCorrect
                                                ? 'border-success'
                                                : 'border-danger'
                                        }`}
                                    >

                                        <div className="fw-semibold mb-3">

                                            {index + 1}.{' '}

                                            {question.question || 'N/A'}

                                        </div>


                                        <div className="row g-3">

                                            <div className="col-md-6">

                                                <small className="text-muted d-block mb-1">
                                                    Student Answer
                                                </small>

                                                <div className="border rounded p-2 bg-light">

                                                    {
                                                        question.student_answer ||
                                                        'Not Answered'
                                                    }

                                                </div>

                                            </div>


                                            <div className="col-md-6">

                                                <small className="text-muted d-block mb-1">
                                                    Correct Answer
                                                </small>

                                                <div className="border rounded p-2 bg-light">

                                                    {
                                                        question.correct_answer ||
                                                        '—'
                                                    }

                                                </div>

                                            </div>

                                        </div>


                                        <div className="mt-3">

                                            {isCorrect ? (

                                                <span className="badge bg-success">
                                                    Correct
                                                </span>

                                            ) : (

                                                <span className="badge bg-danger">
                                                    Wrong
                                                </span>

                                            )}

                                        </div>

                                    </div>

                                );

                            }

                        )

                    ) : (

                        <div className="text-center text-muted py-5">
                            No question details available.
                        </div>

                    )}

                </div>

            </div>

        </div>

    );

};


export default QuizResultDetails;

