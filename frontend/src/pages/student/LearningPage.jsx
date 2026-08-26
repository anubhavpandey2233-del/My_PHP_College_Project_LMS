
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loading from '../../components/common/Loading';

const LearningPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // ==============================
  // FETCH LEARNING DATA
  // ==============================

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        `/student/learning.php?course_id=${courseId}`
      );

      console.log('LEARNING RESPONSE:', res.data);

      if (res.data.status) {
        const learningData = res.data.data;

        console.log('COURSE:', learningData.course);
        console.log('CHAPTERS:', learningData.chapters);
        console.log('ENROLLMENT:', learningData.enrollment);

        setData(learningData);

        setProgress(
          Number(learningData.enrollment?.progress || 0)
        );

        // ==============================
        // FIND LAST LESSON
        // ==============================

        const lastId =
          learningData.enrollment?.last_lesson_id;

        let foundLesson = null;

        for (const chapter of learningData.chapters || []) {
          for (const lesson of chapter.lessons || []) {
            if (
              lastId &&
              Number(lesson.id) === Number(lastId)
            ) {
              foundLesson = lesson;
              break;
            }

            if (!foundLesson) {
              foundLesson = lesson;
            }
          }

          if (
            foundLesson &&
            lastId &&
            Number(foundLesson.id) === Number(lastId)
          ) {
            break;
          }
        }

        if (foundLesson) {
          setCurrentLesson(foundLesson);
        }
      } else {
        setData(null);
      }
    } catch (error) {
      console.error(
        'Learning data error:',
        error
      );

      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);

  // ==============================
  // START QUIZ
  // ==============================

  const startQuiz = (quizId) => {
    navigate(`/student/quiz/${quizId}`);
  };

  // ==============================
  // YOUTUBE URL
  // ==============================

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;

    try {
      const cleanUrl = url.trim();

      if (!cleanUrl) return null;

      // Already embed URL
      if (cleanUrl.includes('youtube.com/embed/')) {
        return cleanUrl;
      }

      // youtu.be
      if (cleanUrl.includes('youtu.be/')) {
        const videoId = cleanUrl
          .split('youtu.be/')[1]
          .split('?')[0]
          .split('&')[0];

        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }

      // youtube.com/watch?v=
      if (cleanUrl.includes('youtube.com/watch')) {
        const urlObject = new URL(cleanUrl);

        const videoId =
          urlObject.searchParams.get('v');

        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }

      // youtube.com/shorts/
      if (cleanUrl.includes('youtube.com/shorts/')) {
        const videoId = cleanUrl
          .split('youtube.com/shorts/')[1]
          .split('?')[0]
          .split('&')[0];

        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }

      return cleanUrl;
    } catch (error) {
      console.error(
        'Invalid video URL:',
        url
      );

      return null;
    }
  };

  // ==============================
  // MARK LESSON COMPLETE
  // ==============================

  const markComplete = async () => {
    if (!currentLesson) return;

    try {
      const res = await api.post(
        '/student/mark-complete.php',
        {
          lesson_id: currentLesson.id
        }
      );

      console.log(
        'MARK COMPLETE RESPONSE:',
        res.data
      );

      if (res.data.status) {
        setProgress(
          Number(res.data.data.progress || 0)
        );

        await fetchData();
      }
    } catch (error) {
      console.error(
        'MARK COMPLETE ERROR:',
        error
      );

      alert(
        error.response?.data?.message ||
        'Error while completing lesson'
      );
    }
  };

  // ==============================
  // GENERATE CERTIFICATE
  // ==============================

  const generateCertificate = async () => {
    try {
      const res = await api.post(
        '/certificates/generate.php',
        {
          course_id: Number(courseId)
        }
      );

      console.log(
        'CERTIFICATE RESPONSE:',
        res.data
      );

      if (res.data.status) {
        const certificateUrl =
          res.data.data?.certificate_url;

        if (!certificateUrl) {
          alert(
            'Certificate generate ho gaya, lekin PDF URL nahi mila.'
          );
          return;
        }

        window.open(
          certificateUrl,
          '_blank'
        );
      } else {
        alert(
          res.data.message ||
          'Certificate generate nahi ho saka.'
        );
      }
    } catch (error) {
      console.error(
        'CERTIFICATE ERROR:',
        error
      );

      alert(
        error.response?.data?.message ||
        'Certificate generate nahi ho saka.'
      );
    }
  };

  // ==============================
  // LOADING
  // ==============================

  if (loading) {
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    );
  }

  // ==============================
  // NO DATA
  // ==============================

  if (!data) {
    return (
      <DashboardLayout>
        <div className="alert alert-danger">
          Course not found or not enrolled
        </div>
      </DashboardLayout>
    );
  }

  // ==============================
  // UI
  // ==============================

  return (
    <DashboardLayout>

      <div className="row">

        {/* =====================================
            LEFT SIDE
        ===================================== */}

        <div className="col-lg-4 mb-4">

          <div className="card shadow-sm">

            {/* COURSE HEADER */}

            <div className="card-header bg-primary text-white">

              <h5 className="mb-0">
                {data.course?.title}
              </h5>

              <div
                className="progress mt-2"
                style={{ height: '8px' }}
              >
                <div
                  className="progress-bar bg-warning"
                  style={{
                    width: `${progress}%`
                  }}
                ></div>
              </div>

              <small>
                {progress}% Complete
              </small>

            </div>

            {/* COURSE CONTENT */}

            <div
              className="card-body p-0"
              style={{
                maxHeight: '70vh',
                overflowY: 'auto'
              }}
            >

              {(data.chapters || []).map(
                (chapter) => (

                  <div
                    key={chapter.id}
                    className="border-bottom"
                  >

                    {/* CHAPTER TITLE */}

                    <div className="p-3 fw-bold bg-light">
                      {chapter.title}
                    </div>

                    {/* LESSONS */}

                    <ul className="list-group list-group-flush">

                      {(chapter.lessons || []).map(
                        (lesson) => (

                          <li
                            key={lesson.id}
                            className={`
                              list-group-item
                              list-group-item-action
                              d-flex
                              justify-content-between
                              align-items-center
                              ${
                                Number(currentLesson?.id) ===
                                Number(lesson.id)
                                  ? 'active'
                                  : ''
                              }
                            `}
                            style={{
                              cursor: 'pointer'
                            }}
                            onClick={() =>
                              setCurrentLesson(lesson)
                            }
                          >

                            <span>

                              {lesson.is_completed
                                ? '✓ '
                                : ''}

                              {lesson.title}

                              {lesson.is_preview && (
                                <span className="badge bg-success ms-2">
                                  Free
                                </span>
                              )}

                            </span>

                          </li>

                        )
                      )}

                    </ul>

                    {/* =====================================
                        QUIZZES
                    ===================================== */}

                    {(chapter.quizzes || []).length > 0 && (

                      <div className="p-3 border-top bg-light">

                        <h6 className="fw-bold mb-3">
                          📝 Chapter Quiz
                        </h6>

                        {(chapter.quizzes || []).map(
                          (quiz) => (

                            <div
                              key={quiz.id}
                              className="card mb-2 shadow-sm"
                            >

                              <div className="card-body">

                                <h6 className="fw-bold">
                                  {quiz.title}
                                </h6>

                                {quiz.description && (
                                  <p className="small text-muted mb-2">
                                    {quiz.description}
                                  </p>
                                )}

                                <div className="d-flex gap-2 flex-wrap mb-3">

                                  <span className="badge bg-success">
                                    {quiz.total_marks || 0} Marks
                                  </span>

                                  <span className="badge bg-info">
                                    Passing: {quiz.passing_percentage || 0}%
                                  </span>

                                  {quiz.time_limit && (
                                    <span className="badge bg-warning text-dark">
                                      ⏱ {quiz.time_limit} min
                                    </span>
                                  )}

                                </div>

                                <button
                                  type="button"
                                  className="btn btn-primary btn-sm w-100"
                                  onClick={() =>
                                    startQuiz(quiz.id)
                                  }
                                >
                                  📝 Start Quiz
                                </button>

                              </div>

                            </div>

                          )
                        )}

                      </div>

                    )}

                  </div>

                )
              )}

            </div>

          </div>

        </div>

        {/* =====================================
            RIGHT SIDE
        ===================================== */}

        <div className="col-lg-8">

          {currentLesson ? (

            <div className="card shadow-sm">

              <div className="card-body">

                <h4 className="mb-3">
                  {currentLesson.title}
                </h4>

                {/* VIDEO */}

                {currentLesson.video_url ? (

                  <div className="ratio ratio-16x9 mb-3">

                    <iframe
                      src={getYouTubeEmbedUrl(
                        currentLesson.video_url
                      )}
                      title={
                        currentLesson.title
                      }
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      style={{
                        border: 0
                      }}
                    ></iframe>

                  </div>

                ) : (

                  <div className="alert alert-secondary">
                    No video available for this lesson
                  </div>

                )}

                {/* CONTENT */}

                <div className="mb-3">

                  {currentLesson.content
                    ?.split('\n')
                    .map(
                      (paragraph, index) => (

                        <p key={index}>
                          {paragraph}
                        </p>

                      )
                    )}

                </div>

                {/* COMPLETE BUTTON */}

                <div className="d-flex gap-2">

                  {!currentLesson.is_completed && (

                    <button
                      className="btn btn-success"
                      onClick={markComplete}
                    >
                      Mark as Complete
                    </button>

                  )}

                  {currentLesson.is_completed && (

                    <span className="badge bg-success p-2">
                      Completed ✓
                    </span>

                  )}

                </div>

                {/* COURSE COMPLETED */}

                {Number(progress) >= 100 && (

                  <div className="alert alert-success mt-4">

                    <h5>
                      🎉 Course Completed!
                    </h5>

                    <p>
                      Congratulations! You have
                      successfully completed this course.
                    </p>

                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={generateCertificate}
                    >
                      🏆 View / Download Certificate
                    </button>

                  </div>

                )}

              </div>

            </div>

          ) : (

            <div className="alert alert-info">
              Select a lesson to start learning
            </div>

          )}

        </div>

      </div>

    </DashboardLayout>
  );
};

export default LearningPage;

