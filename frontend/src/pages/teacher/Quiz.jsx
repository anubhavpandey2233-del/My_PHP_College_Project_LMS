import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loading from '../../components/common/Loading';
import api from '../../services/api';

const Quiz = () => {
  const { id: courseId, chapterId } = useParams();

  // =========================================
  // QUIZ STATES
  // =========================================

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showQuizForm, setShowQuizForm] = useState(false);
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState(null);

  // =========================================
  // SELECTED QUIZ
  // =========================================

  const [selectedQuizId, setSelectedQuizId] = useState(null);

  // =========================================
  // QUESTION STATES
  // =========================================

  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);

  // =========================================
  // DEFAULT QUIZ FORM
  // =========================================

  const getDefaultQuizForm = () => ({
    title: '',
    description: '',
    time_limit: '',
    passing_percentage: 50,
    max_attempts: 1,
    status: 'draft'
  });

  const [formData, setFormData] = useState(
    getDefaultQuizForm()
  );

  // =========================================
  // DEFAULT OPTIONS
  // =========================================

  const getDefaultOptions = (type = 'mcq') => {
    if (type === 'true_false') {
      return [
        {
          option_text: 'True',
          is_correct: false
        },
        {
          option_text: 'False',
          is_correct: false
        }
      ];
    }

    return [
      {
        option_text: '',
        is_correct: false
      },
      {
        option_text: '',
        is_correct: false
      },
      {
        option_text: '',
        is_correct: false
      },
      {
        option_text: '',
        is_correct: false
      }
    ];
  };

  // =========================================
  // DEFAULT QUESTION FORM
  // =========================================

  const getDefaultQuestionForm = () => ({
    question: '',
    question_type: 'mcq',
    marks: 1,
    sort_order: questions.length,
    options: getDefaultOptions('mcq')
  });

  const [questionForm, setQuestionForm] = useState(
    getDefaultQuestionForm()
  );

  // =========================================
  // FETCH QUIZZES
  // =========================================

  const fetchQuizzes = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/quizzes/list.php?course_id=${courseId}`
      );

      if (response.data.status) {
        const allQuizzes = response.data.data || [];

        const chapterQuizzes = allQuizzes.filter(
          (quiz) =>
            Number(quiz.course_id) === Number(courseId) &&
            Number(quiz.chapter_id) === Number(chapterId)
        );

        setQuizzes(chapterQuizzes);
      } else {
        setQuizzes([]);
      }
    } catch (error) {
      console.error('Fetch quizzes error:', error);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [courseId, chapterId]);

  // =========================================
  // QUIZ INPUT
  // =========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // =========================================
  // RESET QUIZ FORM
  // =========================================

  const resetQuizForm = () => {
    setEditingQuizId(null);
    setFormData(getDefaultQuizForm());
  };

  // =========================================
  // CREATE / UPDATE QUIZ
  // =========================================

  const handleSaveQuiz = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Quiz title is required');
      return;
    }

    if (
      Number(formData.passing_percentage) < 1 ||
      Number(formData.passing_percentage) > 100
    ) {
      alert('Passing percentage must be between 1 and 100');
      return;
    }

    if (Number(formData.max_attempts) < 1) {
      alert('Maximum attempts must be at least 1');
      return;
    }

    try {
      setSavingQuiz(true);

      const requestData = {
        id: editingQuizId
          ? Number(editingQuizId)
          : null,

        course_id: Number(courseId),

        chapter_id: Number(chapterId),

        lesson_id: null,

        title: formData.title.trim(),

        description: formData.description.trim(),

        time_limit: formData.time_limit
          ? Number(formData.time_limit)
          : null,

        passing_percentage: Number(
          formData.passing_percentage
        ),

        max_attempts: Number(
          formData.max_attempts
        ),

        status: formData.status
      };

      const url = editingQuizId
        ? '/quizzes/update.php'
        : '/quizzes/create.php';

      const response = await api.post(
        url,
        requestData
      );

      if (response.data.status) {
        alert(
          editingQuizId
            ? 'Quiz updated successfully!'
            : 'Quiz created successfully!'
        );

        setShowQuizForm(false);

        resetQuizForm();

        await fetchQuizzes();
      } else {
        alert(
          response.data.message ||
            'Failed to save quiz'
        );
      }
    } catch (error) {
      console.error('Save quiz error:', error);

      alert(
        error.response?.data?.message ||
          'Failed to save quiz'
      );
    } finally {
      setSavingQuiz(false);
    }
  };

  // =========================================
  // EDIT QUIZ
  // =========================================

  const handleEditQuiz = (quiz) => {
    setEditingQuizId(Number(quiz.id));

    setFormData({
      title: quiz.title || '',

      description: quiz.description || '',

      time_limit:
        quiz.time_limit !== null &&
        quiz.time_limit !== undefined
          ? quiz.time_limit
          : '',

      passing_percentage:
        quiz.passing_percentage !== null &&
        quiz.passing_percentage !== undefined
          ? quiz.passing_percentage
          : 50,

      max_attempts:
        quiz.max_attempts !== null &&
        quiz.max_attempts !== undefined
          ? quiz.max_attempts
          : 1,

      status: quiz.status || 'draft'
    });

    setShowQuizForm(true);

    setShowQuestionForm(false);
    setEditingQuestionId(null);
  };

  // =========================================
  // DELETE QUIZ
  // =========================================

  const handleDeleteQuiz = async (quizId) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this quiz?\n\nAll questions and options of this quiz will also be deleted.'
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await api.post(
        '/quizzes/delete.php',
        {
          id: Number(quizId)
        }
      );

      if (response.data.status) {
        alert('Quiz deleted successfully!');

        if (
          Number(selectedQuizId) ===
          Number(quizId)
        ) {
          setSelectedQuizId(null);
          setQuestions([]);
          setShowQuestionForm(false);
          setEditingQuestionId(null);
        }

        await fetchQuizzes();
      } else {
        alert(
          response.data.message ||
            'Failed to delete quiz'
        );
      }
    } catch (error) {
      console.error('Delete quiz error:', error);

      alert(
        error.response?.data?.message ||
          'Failed to delete quiz'
      );
    }
  };

  // =========================================
  // FETCH QUESTIONS
  // =========================================

  const fetchQuestions = async (quizId) => {
    try {
      setLoadingQuestions(true);

      const response = await api.get(
        `/quizzes/questions/list.php?quiz_id=${quizId}`
      );

      if (response.data.status) {
        setQuestions(
          response.data.data || []
        );
      } else {
        setQuestions([]);
      }
    } catch (error) {
      console.error(
        'Fetch questions error:',
        error
      );

      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // =========================================
  // SELECT QUIZ
  // =========================================

  const handleSelectQuiz = async (quizId) => {
    setSelectedQuizId(Number(quizId));

    setShowQuestionForm(false);

    setEditingQuestionId(null);

    await fetchQuestions(quizId);
  };

  // =========================================
  // QUESTION INPUT
  // =========================================

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;

    if (name === 'question_type') {
      setQuestionForm((prev) => ({
        ...prev,
        question_type: value,
        options: getDefaultOptions(value)
      }));

      return;
    }

    setQuestionForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // =========================================
  // OPTION INPUT
  // =========================================

  const handleOptionChange = (
    index,
    value
  ) => {
    setQuestionForm((prev) => {
      const updatedOptions = [
        ...prev.options
      ];

      updatedOptions[index] = {
        ...updatedOptions[index],
        option_text: value
      };

      return {
        ...prev,
        options: updatedOptions
      };
    });
  };

  // =========================================
  // CORRECT OPTION
  // =========================================

  const handleCorrectOption = (index) => {
    setQuestionForm((prev) => {
      if (
        prev.question_type === 'multiple'
      ) {
        return {
          ...prev,

          options: prev.options.map(
            (option, optionIndex) => ({
              ...option,

              is_correct:
                optionIndex === index
                  ? !option.is_correct
                  : option.is_correct
            })
          )
        };
      }

      return {
        ...prev,

        options: prev.options.map(
          (option, optionIndex) => ({
            ...option,

            is_correct:
              optionIndex === index
          })
        )
      };
    });
  };

  // =========================================
  // ADD OPTION
  // =========================================

  const addOption = () => {
    if (
      questionForm.question_type ===
      'true_false'
    ) {
      alert(
        'True / False question only has True and False options.'
      );

      return;
    }

    setQuestionForm((prev) => ({
      ...prev,

      options: [
        ...prev.options,

        {
          option_text: '',
          is_correct: false
        }
      ]
    }));
  };

  // =========================================
  // REMOVE OPTION
  // =========================================

  const removeOption = (index) => {
    if (
      questionForm.question_type ===
      'true_false'
    ) {
      return;
    }

    if (questionForm.options.length <= 2) {
      alert(
        'At least 2 options are required.'
      );

      return;
    }

    setQuestionForm((prev) => ({
      ...prev,

      options: prev.options.filter(
        (_, optionIndex) =>
          optionIndex !== index
      )
    }));
  };

  // =========================================
  // RESET QUESTION FORM
  // =========================================

  const resetQuestionForm = () => {
    setEditingQuestionId(null);

    setQuestionForm({
      question: '',
      question_type: 'mcq',
      marks: 1,
      sort_order: questions.length,
      options: getDefaultOptions('mcq')
    });
  };

  // =========================================
  // EDIT QUESTION
  // =========================================

  const handleEditQuestion = (question) => {
    setEditingQuestionId(
      Number(question.id)
    );

    let options = question.options || [];

    if (
      question.question_type ===
      'true_false'
    ) {
      const trueOption =
        question.options?.find(
          (option) =>
            option.option_text === 'True'
        );

      const falseOption =
        question.options?.find(
          (option) =>
            option.option_text === 'False'
        );

      options = [
        {
          id: trueOption?.id,
          option_text: 'True',
          is_correct:
            Number(
              trueOption?.is_correct
            ) === 1
        },

        {
          id: falseOption?.id,
          option_text: 'False',
          is_correct:
            Number(
              falseOption?.is_correct
            ) === 1
        }
      ];
    }

    setQuestionForm({
      question:
        question.question || '',

      question_type:
        question.question_type ||
        'mcq',

      marks:
        question.marks !== undefined
          ? question.marks
          : 1,

      sort_order:
        question.sort_order !== undefined
          ? question.sort_order
          : 0,

      options: options.map(
        (option) => ({
          id: option.id,

          option_text:
            option.option_text || '',

          is_correct:
            Number(option.is_correct) === 1
        })
      )
    });

    setShowQuestionForm(true);
  };

  // =========================================
  // CREATE / UPDATE QUESTION
  // =========================================

  const handleSaveQuestion = async (e) => {
    e.preventDefault();

    if (!selectedQuizId) {
      alert(
        'Please select a quiz first.'
      );

      return;
    }

    if (!questionForm.question.trim()) {
      alert('Question is required.');

      return;
    }

    const emptyOption =
      questionForm.options.some(
        (option) =>
          !option.option_text.trim()
      );

    if (emptyOption) {
      alert(
        'Please fill all options.'
      );

      return;
    }

    const correctOptions =
      questionForm.options.filter(
        (option) =>
          option.is_correct
      );

    if (correctOptions.length === 0) {
      alert(
        'Please select the correct answer.'
      );

      return;
    }

    if (
      questionForm.question_type !==
        'multiple' &&
      correctOptions.length > 1
    ) {
      alert(
        'Please select only one correct answer.'
      );

      return;
    }

    try {
      setSavingQuestion(true);

      const requestData = {
        id: editingQuestionId
          ? Number(editingQuestionId)
          : null,

        quiz_id: Number(
          selectedQuizId
        ),

        question:
          questionForm.question.trim(),

        question_type:
          questionForm.question_type,

        marks: Number(
          questionForm.marks
        ),

        sort_order: Number(
          questionForm.sort_order
        ),

        options:
          questionForm.options.map(
            (option) => ({
              id: option.id
                ? Number(option.id)
                : null,

              option_text:
                option.option_text.trim(),

              is_correct:
                option.is_correct
                  ? 1
                  : 0
            })
          )
      };

      const url = editingQuestionId
        ? '/quizzes/questions/update.php'
        : '/quizzes/questions/create.php';

      const response = await api.post(
        url,
        requestData
      );

      if (response.data.status) {
        alert(
          editingQuestionId
            ? 'Question updated successfully!'
            : 'Question added successfully!'
        );

        setShowQuestionForm(false);

        resetQuestionForm();

        await fetchQuestions(
          selectedQuizId
        );

        await fetchQuizzes();
      } else {
        alert(
          response.data.message ||
            'Failed to save question.'
        );
      }
    } catch (error) {
      console.error(
        'Save question error:',
        error
      );

      alert(
        error.response?.data?.message ||
          'Failed to save question.'
      );
    } finally {
      setSavingQuestion(false);
    }
  };

  // =========================================
  // DELETE QUESTION
  // =========================================

  const handleDeleteQuestion = async (
    questionId
  ) => {
    const confirmDelete =
      window.confirm(
        'Delete this question and all its options?'
      );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await api.post(
        '/quizzes/questions/delete.php',
        {
          id: Number(questionId)
        }
      );

      if (response.data.status) {
        alert(
          'Question deleted successfully!'
        );

        await fetchQuestions(
          selectedQuizId
        );

        await fetchQuizzes();
      } else {
        alert(
          response.data.message ||
            'Failed to delete question.'
        );
      }
    } catch (error) {
      console.error(
        'Delete question error:',
        error
      );

      alert(
        error.response?.data?.message ||
          'Failed to delete question.'
      );
    }
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    );
  }

  // =========================================
  // PAGE
  // =========================================

  return (
    <DashboardLayout>

      {/* HEADER */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2>Quiz Management</h2>

          <p className="text-muted mb-0">
            Create and manage quizzes for this chapter.
          </p>
        </div>

        <Link
          to={`/teacher/courses/${courseId}/content`}
          className="btn btn-outline-secondary"
        >
          ← Back to Course Content
        </Link>

      </div>


      {/* CREATE QUIZ BUTTON */}

      {!showQuizForm && (
        <div className="mb-4">

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              resetQuizForm();
              setShowQuizForm(true);
            }}
          >
            + Create Quiz
          </button>

        </div>
      )}


      {/* QUIZ FORM */}

      {showQuizForm && (
        <div className="card shadow-sm mb-4">

          <div className="card-header">

            <h5 className="mb-0">
              {editingQuizId
                ? 'Update Quiz'
                : 'Create New Quiz'}
            </h5>

          </div>

          <div className="card-body">

            <form onSubmit={handleSaveQuiz}>

              {/* TITLE */}

              <div className="mb-3">

                <label className="form-label">
                  Quiz Title
                </label>

                <input
                  type="text"
                  name="title"
                  className="form-control"
                  placeholder="Enter quiz title"
                  value={formData.title}
                  onChange={handleChange}
                />

              </div>


              {/* DESCRIPTION */}

              <div className="mb-3">

                <label className="form-label">
                  Description
                </label>

                <textarea
                  name="description"
                  className="form-control"
                  rows="3"
                  placeholder="Enter quiz description"
                  value={formData.description}
                  onChange={handleChange}
                />

              </div>


              {/* TIME LIMIT */}

              <div className="mb-3">

                <label className="form-label">
                  Time Limit (minutes)
                </label>

                <input
                  type="number"
                  name="time_limit"
                  className="form-control"
                  placeholder="Example: 30"
                  min="1"
                  value={formData.time_limit}
                  onChange={handleChange}
                />

              </div>


              {/* PASSING */}

              <div className="mb-3">

                <label className="form-label">
                  Passing Percentage
                </label>

                <input
                  type="number"
                  name="passing_percentage"
                  className="form-control"
                  min="1"
                  max="100"
                  value={
                    formData.passing_percentage
                  }
                  onChange={handleChange}
                />

              </div>


              {/* ATTEMPTS */}

              <div className="mb-3">

                <label className="form-label">
                  Maximum Attempts
                </label>

                <input
                  type="number"
                  name="max_attempts"
                  className="form-control"
                  min="1"
                  value={
                    formData.max_attempts
                  }
                  onChange={handleChange}
                />

              </div>


              {/* STATUS */}

              <div className="mb-4">

                <label className="form-label">
                  Status
                </label>

                <select
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleChange}
                >

                  <option value="draft">
                    Draft
                  </option>

                  <option value="published">
                    Published
                  </option>

                </select>

              </div>


              {/* SAVE */}

              <button
                type="submit"
                className="btn btn-success me-2"
                disabled={savingQuiz}
              >
                {savingQuiz
                  ? 'Saving...'
                  : editingQuizId
                  ? 'Update Quiz'
                  : 'Create Quiz'}
              </button>


              {/* CANCEL */}

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowQuizForm(false);
                  resetQuizForm();
                }}
                disabled={savingQuiz}
              >
                Cancel
              </button>

            </form>

          </div>

        </div>
      )}


      {/* QUIZ LIST */}

      {quizzes.length === 0 ? (

        <div className="card shadow-sm">

          <div className="card-body text-center py-5">

            <i className="bi bi-patch-question fs-1 text-primary"></i>

            <h4 className="mt-3">
              No Quiz Created
            </h4>

            <p className="text-muted mb-0">
              Create your first quiz for this chapter.
            </p>

          </div>

        </div>

      ) : (

        <div>

          <h4 className="mb-3">
            Chapter Quizzes
          </h4>


          {quizzes.map(
            (quiz, index) => (

              <div
                className="card shadow-sm mb-4"
                key={quiz.id}
              >

                <div className="card-body">

                  {/* QUIZ HEADER */}

                  <div className="d-flex justify-content-between align-items-start">

                    <div>

                      <h5 className="mb-2">
                        {index + 1}. {quiz.title}
                      </h5>

                      <p className="text-muted mb-3">
                        {quiz.description ||
                          'No description available.'}
                      </p>

                    </div>


                    <span
                      className={`badge ${
                        quiz.status ===
                        'published'
                          ? 'bg-success'
                          : 'bg-secondary'
                      }`}
                    >
                      {quiz.status || 'draft'}
                    </span>

                  </div>


                  {/* QUIZ INFO */}

                  <div className="d-flex gap-2 flex-wrap mb-3">

                    <span className="badge bg-primary">
                      Quiz ID: {quiz.id}
                    </span>

                    <span className="badge bg-info">
                      Passing:{' '}
                      {quiz.passing_percentage}%
                    </span>

                    <span className="badge bg-dark">
                      Attempts:{' '}
                      {quiz.max_attempts}
                    </span>

                    {quiz.time_limit && (
                      <span className="badge bg-warning text-dark">
                        Time:{' '}
                        {quiz.time_limit} min
                      </span>
                    )}

                    <span className="badge bg-success">
                      Total Marks:{' '}
                      {quiz.total_marks || 0}
                    </span>

                  </div>


                  {/* QUIZ BUTTONS */}

                  <div className="d-flex gap-2 flex-wrap">

                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={() =>
                        handleSelectQuiz(
                          quiz.id
                        )
                      }
                    >
                      {selectedQuizId ===
                      Number(quiz.id)
                        ? 'Selected Quiz'
                        : 'Manage Questions'}
                    </button>


                    <button
                      type="button"
                      className="btn btn-outline-warning btn-sm"
                      onClick={() =>
                        handleEditQuiz(quiz)
                      }
                    >
                      Edit Quiz
                    </button>


                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() =>
                        handleDeleteQuiz(
                          quiz.id
                        )
                      }
                    >
                      Delete Quiz
                    </button>

                  </div>


                  {/* QUESTIONS */}

                  {selectedQuizId ===
                    Number(quiz.id) && (

                    <div className="border rounded p-3 mt-4">

                      <div className="d-flex justify-content-between align-items-center mb-3">

                        <div>

                          <h5 className="mb-1">
                            Questions
                          </h5>

                          <small className="text-muted">
                            Add, edit and manage questions.
                          </small>

                        </div>


                        {!showQuestionForm && (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              resetQuestionForm();
                              setShowQuestionForm(
                                true
                              );
                            }}
                          >
                            + Add Question
                          </button>
                        )}

                      </div>


                      {/* QUESTION FORM */}

                      {showQuestionForm && (

                        <div className="card bg-light mb-4">

                          <div className="card-body">

                            <form
                              onSubmit={
                                handleSaveQuestion
                              }
                            >

                              <div className="mb-3">

                                <label className="form-label">
                                  Question
                                </label>

                                <textarea
                                  name="question"
                                  className="form-control"
                                  rows="3"
                                  placeholder="Enter your question"
                                  value={
                                    questionForm.question
                                  }
                                  onChange={
                                    handleQuestionChange
                                  }
                                />

                              </div>


                              <div className="row">

                                <div className="col-md-6 mb-3">

                                  <label className="form-label">
                                    Question Type
                                  </label>

                                  <select
                                    name="question_type"
                                    className="form-select"
                                    value={
                                      questionForm.question_type
                                    }
                                    onChange={
                                      handleQuestionChange
                                    }
                                  >

                                    <option value="mcq">
                                      MCQ
                                    </option>

                                    <option value="true_false">
                                      True / False
                                    </option>

                                    <option value="multiple">
                                      Multiple Correct
                                    </option>

                                  </select>

                                </div>


                                <div className="col-md-6 mb-3">

                                  <label className="form-label">
                                    Marks
                                  </label>

                                  <input
                                    type="number"
                                    name="marks"
                                    className="form-control"
                                    min="0.5"
                                    step="0.5"
                                    value={
                                      questionForm.marks
                                    }
                                    onChange={
                                      handleQuestionChange
                                    }
                                  />

                                </div>

                              </div>


                              {/* OPTIONS */}

                              <div className="mb-3">

                                <label className="form-label">
                                  Options
                                </label>

                                {questionForm.options.map(
                                  (
                                    option,
                                    index
                                  ) => (

                                    <div
                                      className="input-group mb-2"
                                      key={
                                        option.id ||
                                        `new-${index}`
                                      }
                                    >

                                      <div className="input-group-text">

                                        <input
                                          type={
                                            questionForm.question_type ===
                                            'multiple'
                                              ? 'checkbox'
                                              : 'radio'
                                          }
                                          name={
                                            questionForm.question_type ===
                                            'multiple'
                                              ? `correct_${selectedQuizId}`
                                              : `correct_${selectedQuizId}`
                                          }
                                          checked={
                                            option.is_correct
                                          }
                                          onChange={() =>
                                            handleCorrectOption(
                                              index
                                            )
                                          }
                                        />

                                      </div>


                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder={`Option ${
                                          index + 1
                                        }`}
                                        value={
                                          option.option_text
                                        }
                                        onChange={(e) =>
                                          handleOptionChange(
                                            index,
                                            e.target.value
                                          )
                                        }
                                        readOnly={
                                          questionForm.question_type ===
                                          'true_false'
                                        }
                                      />


                                      {questionForm.options.length >
                                        2 &&
                                        questionForm.question_type !==
                                          'true_false' && (

                                          <button
                                            type="button"
                                            className="btn btn-outline-danger"
                                            onClick={() =>
                                              removeOption(
                                                index
                                              )
                                            }
                                          >
                                            ×
                                          </button>

                                        )}

                                    </div>

                                  )
                                )}

                              </div>


                              {/* ADD OPTION */}

                              {questionForm.question_type !==
                                'true_false' && (

                                <button
                                  type="button"
                                  className="btn btn-outline-primary btn-sm mb-3"
                                  onClick={
                                    addOption
                                  }
                                >
                                  + Add Option
                                </button>

                              )}


                              <div>

                                <button
                                  type="submit"
                                  className="btn btn-success me-2"
                                  disabled={
                                    savingQuestion
                                  }
                                >
                                  {savingQuestion
                                    ? 'Saving...'
                                    : editingQuestionId
                                    ? 'Update Question'
                                    : 'Save Question'}
                                </button>


                                <button
                                  type="button"
                                  className="btn btn-secondary"
                                  onClick={() => {
                                    setShowQuestionForm(
                                      false
                                    );
                                    resetQuestionForm();
                                  }}
                                  disabled={
                                    savingQuestion
                                  }
                                >
                                  Cancel
                                </button>

                              </div>

                            </form>

                          </div>

                        </div>

                      )}


                      {/* QUESTIONS LIST */}

                      {loadingQuestions ? (

                        <div className="text-center py-3">
                          <Loading />
                        </div>

                      ) : questions.length === 0 ? (

                        <div className="alert alert-info">
                          No questions added yet.
                        </div>

                      ) : (

                        <div>

                          {questions.map(
                            (
                              question,
                              questionIndex
                            ) => (

                              <div
                                className="card mb-3"
                                key={
                                  question.id
                                }
                              >

                                <div className="card-body">

                                  <div className="d-flex justify-content-between align-items-start">

                                    <div>

                                      <h6 className="mb-2">
                                        Q
                                        {questionIndex +
                                          1}
                                        .{' '}
                                        {
                                          question.question
                                        }
                                      </h6>

                                      <div className="mb-3">

                                        <span className="badge bg-secondary me-2">
                                          {
                                            question.question_type
                                          }
                                        </span>

                                        <span className="badge bg-primary">
                                          {
                                            question.marks
                                          }{' '}
                                          marks
                                        </span>

                                      </div>

                                    </div>


                                    <div className="d-flex gap-2">

                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() =>
                                          handleEditQuestion(
                                            question
                                          )
                                        }
                                      >
                                        Edit
                                      </button>


                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() =>
                                          handleDeleteQuestion(
                                            question.id
                                          )
                                        }
                                      >
                                        Delete
                                      </button>

                                    </div>

                                  </div>


                                  {/* OPTIONS */}

                                  <div>

                                    {question.options?.map(
                                      (
                                        option,
                                        optionIndex
                                      ) => (

                                        <div
                                          key={
                                            option.id ||
                                            optionIndex
                                          }
                                          className={`border rounded p-2 mb-2 ${
                                            Number(
                                              option.is_correct
                                            ) === 1
                                              ? 'border-success bg-success-subtle'
                                              : ''
                                          }`}
                                        >

                                          <strong>
                                            {String.fromCharCode(
                                              65 +
                                                optionIndex
                                            )}
                                            .
                                          </strong>{' '}

                                          {
                                            option.option_text
                                          }


                                          {Number(
                                            option.is_correct
                                          ) === 1 && (

                                            <span className="badge bg-success ms-2">
                                              Correct Answer
                                            </span>

                                          )}

                                        </div>

                                      )
                                    )}

                                  </div>

                                </div>

                              </div>

                            )
                          )}

                        </div>

                      )}

                    </div>

                  )}

                </div>

              </div>

            )
          )}

        </div>

      )}

    </DashboardLayout>
  );
};

export default Quiz;