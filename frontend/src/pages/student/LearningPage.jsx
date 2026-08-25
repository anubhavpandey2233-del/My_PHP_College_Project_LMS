
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loading from '../../components/common/Loading';

const LearningPage = () => {
  const { courseId } = useParams();

  const [data, setData] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const fetchData = async () => {
    try {
      const res = await api.get(
        `/student/learning.php?course_id=${courseId}`
      );

      if (res.data.status) {
        console.log('FULL LEARNING DATA:', res.data.data);
        console.log('CHAPTERS:', res.data.data.chapters);
        console.log('ENROLLMENT:', res.data.data.enrollment);

        setData(res.data.data);
        setProgress(res.data.data.enrollment?.progress || 0);

        const lastId =
          res.data.data.enrollment?.last_lesson_id;

        let found = null;

        for (const ch of res.data.data.chapters || []) {
          for (const lesson of ch.lessons || []) {
            if (lastId && lesson.id == lastId) {
              found = lesson;
              break;
            }

            if (!found) {
              found = lesson;
            }
          }

          if (found && lastId && found.id == lastId) {
            break;
          }
        }

        if (found) {
          setCurrentLesson(found);
        }
      }
    } catch (err) {
      console.error('Learning data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);

  // ==============================
  // YouTube URL
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

      // youtu.be/VIDEO_ID
      if (cleanUrl.includes('youtu.be/')) {
        const videoId = cleanUrl
          .split('youtu.be/')[1]
          .split('?')[0]
          .split('&')[0];

        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }

      // youtube.com/watch?v=VIDEO_ID
      if (cleanUrl.includes('youtube.com/watch')) {
        const urlObject = new URL(cleanUrl);
        const videoId = urlObject.searchParams.get('v');

        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }

      // youtube.com/shorts/VIDEO_ID
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
      console.error('Invalid video URL:', url);
      return null;
    }
  };

  // ==============================
  // Mark Lesson Complete
  // ==============================

  const markComplete = async () => {
    if (!currentLesson) return;

    try {
      console.log(
        'MARK COMPLETE LESSON ID:',
        currentLesson.id
      );

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
        setProgress(res.data.data.progress);

        await fetchData();
      }
    } catch (err) {
      console.error(
        'MARK COMPLETE ERROR:',
        err
      );

      console.error(
        'ERROR RESPONSE:',
        err.response?.data
      );

      alert(
        err.response?.data?.message ||
        'Error'
      );
    }
  };

  // ==============================
  // Generate Certificate
  // ==============================

  const generateCertificate = async () => {
    try {
      console.log(
        'Generating certificate for course:',
        courseId
      );

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

        console.log(
          'CERTIFICATE URL:',
          certificateUrl
        );

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
    } catch (err) {
      console.error(
        'CERTIFICATE ERROR:',
        err
      );

      console.error(
        'CERTIFICATE ERROR RESPONSE:',
        err.response?.data
      );

      alert(
        err.response?.data?.message ||
        'Certificate generate nahi ho saka.'
      );
    }
  };

  // ==============================
  // Loading
  // ==============================

  if (loading) {
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    );
  }

  // ==============================
  // No Data
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

        {/* ================= LEFT SIDE ================= */}

        <div className="col-lg-4 mb-4">

          <div className="card shadow-sm">

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

                    <div className="p-3 fw-bold bg-light">
                      {chapter.title}
                    </div>

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
                                currentLesson?.id === lesson.id
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
                                <span className="badge bg-success ms-1">
                                  Free
                                </span>
                              )}

                            </span>

                          </li>

                        )
                      )}

                    </ul>

                  </div>

                )
              )}

            </div>

          </div>

        </div>

        {/* ================= RIGHT SIDE ================= */}

        <div className="col-lg-8">

          {currentLesson ? (

            <div className="card shadow-sm">

              <div className="card-body">

                <h4>
                  {currentLesson.title}
                </h4>

                {/* ================= VIDEO ================= */}

                {currentLesson.video_url ? (

                  <div className="ratio ratio-16x9 mb-3">

                    <iframe
                      src={getYouTubeEmbedUrl(
                        currentLesson.video_url
                      )}
                      title={currentLesson.title}
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

                {/* ================= CONTENT ================= */}

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

                {/* ================= COMPLETE BUTTON ================= */}

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

                {/* ================= COURSE COMPLETED ================= */}

                {Number(progress) >= 100 && (

                  <div className="alert alert-success mt-4">

                    <h5>
                      🎉 Course Completed!
                    </h5>

                    <p>
                      Congratulations! You have
                      successfully completed this course.
                    </p>

                    {/* CERTIFICATE BUTTON */}

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

