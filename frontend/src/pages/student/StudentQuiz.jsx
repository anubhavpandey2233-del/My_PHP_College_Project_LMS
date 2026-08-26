import React, {
    useCallback,
    useEffect,
    useState
} from 'react';

import {
    useNavigate,
    useParams,
    Link
} from 'react-router-dom';

import DashboardLayout from '../../layouts/DashboardLayout';
import Loading from '../../components/common/Loading';
import api from '../../services/api';

const StudentQuiz = () => {

    const { quizId } = useParams();
    const navigate = useNavigate();

    // ==========================================
    // STATE
    // ==========================================

    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);

    const [answers, setAnswers] = useState({});

    const [attemptId, setAttemptId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [timeLeft, setTimeLeft] = useState(null);

    const [result, setResult] = useState(null);

    const [errorMessage, setErrorMessage] = useState('');


    // ==========================================
    // START QUIZ ATTEMPT
    // ==========================================


    const startAttempt = async (quizData) => {
        try {
            console.log('STARTING QUIZ:', quizId);

            const response = await api.post(
                '/student/start-quiz.php',
                {
                    quiz_id: Number(quizId)
                }
            );

            console.log(
                'START QUIZ RESPONSE:',
                response.data
            );

            if (!response.data?.status) {
                throw new Error(
                    response.data?.message ||
                    'Unable to start quiz.'
                );
            }

            const data = response.data?.data || {};

            // ==========================================
            // GET ATTEMPT ID
            // Supports both response formats
            // ==========================================

            const id =
                data.attempt?.id ??
                data.attempt_id ??
                data.attempt?.attempt_id ??
                null;

            console.log(
                'FINAL ATTEMPT ID:',
                id
            );

            if (!id) {
                throw new Error(
                    'Attempt ID not received from server.'
                );
            }

            // ==========================================
            // SET ATTEMPT ID
            // ==========================================

            setAttemptId(Number(id));

            // ==========================================
            // TIMER
            // ==========================================

            const timeLimit = Number(
                quizData?.time_limit || 0
            );

            if (timeLimit > 0) {
                setTimeLeft(timeLimit * 60);
            } else {
                setTimeLeft(null);
            }

            return Number(id);

        } catch (error) {

            console.error(
                'START QUIZ ERROR:',
                error
            );

            console.error(
                'START QUIZ RESPONSE:',
                error.response?.data
            );

            setAttemptId(null);

            alert(
                error.response?.data?.message ||
                error.message ||
                'Unable to start quiz.'
            );

            return null;
        }
    };




    // ==========================================
    // FETCH QUIZ
    // ==========================================

    const fetchQuiz = useCallback(async () => {

        try {

            setLoading(true);

            setErrorMessage('');

            setQuiz(null);
            setQuestions([]);
            setAnswers({});
            setAttemptId(null);
            setResult(null);
            setTimeLeft(null);


            console.log(
                'FETCH QUIZ ID:',
                quizId
            );


            // ==================================
            // IMPORTANT
            // Actual file is quiz.php
            // ==================================

            const response = await api.get(
                `/student/quiz.php?quiz_id=${quizId}`
            );


            console.log(
                'QUIZ RESPONSE:',
                response.data
            );


            if (!response.data.status) {

                throw new Error(
                    response.data.message ||
                    'Quiz could not be loaded.'
                );
            }


            const quizData =
                response.data.data?.quiz;

            const questionData =
                response.data.data?.questions || [];


            if (!quizData) {

                throw new Error(
                    'Quiz data not received.'
                );
            }


            setQuiz(quizData);

            setQuestions(questionData);


            // ==================================
            // START ATTEMPT
            // ==================================

            await startAttempt(
                quizData
            );

        } catch (error) {

            console.error(
                'FETCH QUIZ ERROR:',
                error
            );

            console.error(
                'FETCH QUIZ RESPONSE:',
                error.response?.data
            );


            const message =
                error.response?.data?.message ||
                error.message ||
                'Quiz could not be loaded.';

            setErrorMessage(message);

            setQuiz(null);
            setQuestions([]);

        } finally {

            setLoading(false);
        }

    }, [quizId]);


    // ==========================================
    // LOAD QUIZ
    // ==========================================

    useEffect(() => {

        if (quizId) {

            fetchQuiz();
        }

    }, [quizId, fetchQuiz]);


    // ==========================================
    // FORMAT TIME
    // ==========================================

    const formatTime = (seconds) => {

        if (
            seconds === null ||
            seconds === undefined
        ) {

            return '--:--';
        }


        const minutes =
            Math.floor(seconds / 60);

        const remainingSeconds =
            seconds % 60;


        return (
            `${String(minutes).padStart(2, '0')}:` +
            `${String(remainingSeconds).padStart(2, '0')}`
        );
    };


    // ==========================================
    // SUBMIT QUIZ
    // ==========================================

    const submitQuiz = useCallback(async () => {

        if (!attemptId) {

            alert(
                'Quiz attempt has not started yet.'
            );

            return;
        }


        if (submitting) {

            return;
        }


        try {

            setSubmitting(true);


            console.log(
                'SUBMIT ATTEMPT ID:',
                attemptId
            );

            console.log(
                'SUBMIT ANSWERS:',
                answers
            );


            // ==================================
            // Actual file is submit-quiz.php
            // ==================================

            const response = await api.post(
                '/student/submit-quiz.php',
                {
                    attempt_id: Number(attemptId),
                    answers: answers
                }
            );


            console.log(
                'SUBMIT QUIZ RESPONSE:',
                response.data
            );


            if (!response.data.status) {

                alert(
                    response.data.message ||
                    'Quiz submission failed.'
                );

                return;
            }


            // ==================================
            // RESULT
            // ==================================

            const resultData =
                response.data.data || {};


            setResult(
                resultData
            );


            // Stop timer
            setTimeLeft(null);

        } catch (error) {

            console.error(
                'SUBMIT QUIZ ERROR:',
                error
            );

            console.error(
                'SUBMIT QUIZ RESPONSE:',
                error.response?.data
            );


            alert(
                error.response?.data?.message ||
                error.message ||
                'Quiz submission failed.'
            );

        } finally {

            setSubmitting(false);
        }

    }, [
        attemptId,
        answers,
        submitting
    ]);


    // ==========================================
    // TIMER
    // ==========================================

    useEffect(() => {

        if (
            timeLeft === null ||
            submitting ||
            result
        ) {

            return;
        }


        if (timeLeft <= 0) {

            submitQuiz();

            return;
        }


        const timer =
            setInterval(() => {

                setTimeLeft(
                    previous => {

                        if (
                            previous === null
                        ) {

                            return null;
                        }


                        if (
                            previous <= 1
                        ) {

                            return 0;
                        }


                        return previous - 1;
                    }
                );

            }, 1000);


        return () => {

            clearInterval(timer);
        };

    }, [
        timeLeft,
        submitting,
        result,
        submitQuiz
    ]);


    // ==========================================
    // HANDLE ANSWER
    // ==========================================

    const handleAnswer = (
        questionId,
        optionId,
        questionType
    ) => {

        setAnswers(previous => {

            const updated = {
                ...previous
            };


            // ==================================
            // MULTIPLE ANSWER
            // ==================================

            if (
                questionType === 'multiple'
            ) {

                const current =
                    updated[questionId] || [];


                if (
                    current.includes(optionId)
                ) {

                    updated[questionId] =
                        current.filter(
                            id =>
                                id !== optionId
                        );

                } else {

                    updated[questionId] = [
                        ...current,
                        optionId
                    ];
                }


            }

            // ==================================
            // SINGLE / TRUE FALSE
            // ==================================

            else {

                updated[questionId] =
                    optionId;
            }


            return updated;
        });
    };


    // ==========================================
    // TRY AGAIN
    // ==========================================

    const handleTryAgain = () => {

        setQuiz(null);
        setQuestions([]);
        setAnswers({});
        setAttemptId(null);
        setResult(null);
        setTimeLeft(null);
        setErrorMessage('');

        fetchQuiz();
    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (
            <DashboardLayout>

                <Loading />

            </DashboardLayout>
        );
    }


    // ==========================================
    // QUIZ NOT FOUND / ERROR
    // ==========================================

    if (!quiz) {

        return (
            <DashboardLayout>

                <div className="container-fluid">

                    <div className="alert alert-danger">

                        <h5>
                            Quiz could not be loaded
                        </h5>

                        <p className="mb-0">
                            {errorMessage ||
                                'Quiz not found.'}
                        </p>

                    </div>


                    <Link
                        to="/student/my-courses"
                        className="btn btn-secondary"
                    >
                        ← Back to My Courses
                    </Link>

                </div>

            </DashboardLayout>
        );
    }


    // ==========================================
    // RESULT SCREEN
    // ==========================================

    if (result) {

        return (
            <DashboardLayout>

                <div className="container-fluid">

                    <div className="card shadow-sm">

                        <div className="card-body text-center p-5">

                            <h2 className="mb-3">
                                🎉 Quiz Completed!
                            </h2>


                            <p className="text-muted">
                                Your quiz has been submitted successfully.
                            </p>


                            {/* SCORE */}

                            <div className="row justify-content-center mt-4">

                                <div className="col-md-3 mb-3">

                                    <div className="card bg-light h-100">

                                        <div className="card-body">

                                            <h6>
                                                Score
                                            </h6>

                                            <h3>
                                                {result.score ?? 0}
                                            </h3>

                                        </div>

                                    </div>

                                </div>


                                {/* PERCENTAGE */}

                                <div className="col-md-3 mb-3">

                                    <div className="card bg-light h-100">

                                        <div className="card-body">

                                            <h6>
                                                Percentage
                                            </h6>

                                            <h3>
                                                {result.percentage ?? 0}%
                                            </h3>

                                        </div>

                                    </div>

                                </div>


                                {/* TIME */}

                                <div className="col-md-3 mb-3">

                                    <div className="card bg-light h-100">

                                        <div className="card-body">

                                            <h6>
                                                Time Taken
                                            </h6>

                                            <h3>
                                                {result.time_taken ?? 0}
                                                {' '}
                                                sec
                                            </h3>

                                        </div>

                                    </div>

                                </div>

                            </div>


                            {/* PASS / FAIL */}

                            <div className="mt-4">

                                {Number(
                                    result.is_passed
                                ) === 1 ? (

                                    <div className="alert alert-success">

                                        <h5 className="mb-1">
                                            ✅ Congratulations!
                                        </h5>

                                        <p className="mb-0">
                                            You passed this quiz.
                                        </p>

                                    </div>

                                ) : (

                                    <div className="alert alert-danger">

                                        <h5 className="mb-1">
                                            ❌ Quiz Not Passed
                                        </h5>

                                        <p className="mb-0">
                                            You did not achieve the required passing percentage.
                                        </p>

                                    </div>
                                )}

                            </div>


                            {/* BUTTONS */}

                            <div className="d-flex justify-content-center gap-2 mt-4">

                                <Link
                                    to="/student/my-courses"
                                    className="btn btn-secondary"
                                >
                                    Back to My Courses
                                </Link>


                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleTryAgain}
                                >
                                    🔄 Try Again
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            </DashboardLayout>
        );
    }


    // ==========================================
    // QUIZ UI
    // ==========================================

    return (
        <DashboardLayout>

            <div className="container-fluid">


                {/* ==================================
                    HEADER
                ================================== */}

                <div className="d-flex justify-content-between align-items-center mb-4">

                    <div>

                        <h2>
                            {quiz.title}
                        </h2>

                        <p className="text-muted mb-0">

                            {quiz.description ||
                                'Attempt this quiz.'}

                        </p>

                    </div>


                    <Link
                        to="/student/my-courses"
                        className="btn btn-outline-secondary"
                    >
                        ← Back
                    </Link>

                </div>


                {/* ==================================
                    QUIZ INFORMATION
                ================================== */}

                <div className="card shadow-sm mb-4">

                    <div className="card-body">

                        <div className="d-flex gap-2 flex-wrap">

                            <span className="badge bg-primary">

                                Passing:
                                {' '}
                                {quiz.passing_percentage}%

                            </span>


                            <span className="badge bg-dark">

                                Max Attempts:
                                {' '}
                                {quiz.max_attempts}

                            </span>


                            <span className="badge bg-success">

                                Total Marks:
                                {' '}
                                {quiz.total_marks || 0}

                            </span>


                            {timeLeft !== null && (

                                <span
                                    className={
                                        `badge ${timeLeft <= 60
                                            ? 'bg-danger'
                                            : 'bg-warning text-dark'
                                        }`
                                    }
                                >

                                    ⏱ Time Left:
                                    {' '}
                                    {formatTime(
                                        timeLeft
                                    )}

                                </span>

                            )}

                        </div>

                    </div>

                </div>


                {/* ==================================
                    QUESTIONS
                ================================== */}

                <div className="card shadow-sm">

                    <div className="card-body">

                        <h4 className="mb-4">
                            Questions
                        </h4>


                        {questions.length === 0 ? (

                            <div className="alert alert-info">

                                No questions available for this quiz.

                            </div>

                        ) : (

                            questions.map(
                                (
                                    question,
                                    index
                                ) => {

                                    const isMultiple =
                                        question.question_type ===
                                        'multiple';


                                    return (

                                        <div
                                            className="border rounded p-3 mb-4"
                                            key={question.id}
                                        >

                                            {/* QUESTION */}

                                            <h5 className="mb-3">

                                                Q{index + 1}.
                                                {' '}
                                                {question.question}

                                            </h5>


                                            {/* OPTIONS */}

                                            <div>

                                                {(
                                                    question.options ||
                                                    []
                                                ).map(
                                                    (
                                                        option,
                                                        optionIndex
                                                    ) => {

                                                        const selected =
                                                            isMultiple

                                                                ? (
                                                                    answers[
                                                                    question.id
                                                                    ] || []
                                                                ).includes(
                                                                    Number(
                                                                        option.id
                                                                    )
                                                                )

                                                                : Number(
                                                                    answers[
                                                                    question.id
                                                                    ]
                                                                ) ===
                                                                Number(
                                                                    option.id
                                                                );


                                                        return (

                                                            <div
                                                                className="form-check mb-3"
                                                                key={
                                                                    option.id
                                                                }
                                                            >

                                                                <input
                                                                    className="form-check-input"
                                                                    type={
                                                                        isMultiple
                                                                            ? 'checkbox'
                                                                            : 'radio'
                                                                    }
                                                                    name={
                                                                        `question_${question.id}`
                                                                    }
                                                                    id={
                                                                        `option_${option.id}`
                                                                    }
                                                                    checked={
                                                                        selected
                                                                    }
                                                                    onChange={() =>
                                                                        handleAnswer(
                                                                            question.id,
                                                                            Number(
                                                                                option.id
                                                                            ),
                                                                            question.question_type
                                                                        )
                                                                    }
                                                                />


                                                                <label
                                                                    className="form-check-label"
                                                                    htmlFor={
                                                                        `option_${option.id}`
                                                                    }
                                                                    style={{
                                                                        cursor:
                                                                            'pointer'
                                                                    }}
                                                                >

                                                                    <strong>

                                                                        {
                                                                            String.fromCharCode(
                                                                                65 +
                                                                                optionIndex
                                                                            )
                                                                        }
                                                                        .

                                                                    </strong>

                                                                    {' '}

                                                                    {
                                                                        option.option_text
                                                                    }

                                                                </label>

                                                            </div>

                                                        );
                                                    }
                                                )}

                                            </div>


                                            {/* MARKS */}

                                            <small className="text-muted">
                                                Last Attempt Marks: {question.last_attempt_marks} / {question.marks}
                                            </small>

                                        </div>
                                    );
                                }
                            )
                        )}


                        {/* ==================================
                            SUBMIT
                        ================================== */}

                        {questions.length > 0 && (

                            <div className="text-center mt-4">

                                <button
                                    type="button"
                                    className="btn btn-success btn-lg px-5"
                                    disabled={
                                        submitting ||
                                        !attemptId
                                    }
                                    onClick={
                                        submitQuiz
                                    }
                                >

                                    {submitting
                                        ? 'Submitting...'
                                        : 'Submit Quiz'}

                                </button>

                            </div>

                        )}

                    </div>

                </div>

            </div>

        </DashboardLayout>
    );
};

export default StudentQuiz;