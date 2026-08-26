
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loading from '../../components/common/Loading';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // ===============================
  // FETCH MY COURSES
  // ===============================

  useEffect(() => {
    setLoading(true);

    api
      .get(`/student/my-courses.php?status=${filter}`)
      .then((res) => {
        console.log('MY COURSES API:', res.data);

        if (res.data.status) {
          setCourses(
            Array.isArray(res.data.data)
              ? res.data.data
              : []
          );
        } else {
          setCourses([]);
        }
      })
      .catch((error) => {
        console.error('My Courses Error:', error);
        setCourses([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filter]);

  // ===============================
  // THUMBNAIL URL
  // ===============================

  const getThumbnailUrl = (thumbnail) => {
    if (!thumbnail) {
      return null;
    }

    const value = String(thumbnail).trim();

    if (!value) {
      return null;
    }

    // Already complete URL
    if (
      value.startsWith('http://') ||
      value.startsWith('https://')
    ) {
      return value;
    }

    // /uploads/courses/file.jpg
    if (value.startsWith('/uploads/courses/')) {
      return `http://localhost/php-lms-project/backend${value}`;
    }

    // uploads/courses/file.jpg
    if (value.startsWith('uploads/courses/')) {
      return `http://localhost/php-lms-project/backend/${value}`;
    }

    // /php-lms-project/backend/uploads/courses/file.jpg
    if (
      value.startsWith(
        '/php-lms-project/backend/uploads/courses/'
      )
    ) {
      return `http://localhost${value}`;
    }

    // Only filename
    return `http://localhost/php-lms-project/backend/uploads/courses/${value}`;
  };

  // ===============================
  // IMAGE ERROR
  // ===============================

  const handleImageError = (e, course) => {
    console.error(
      'My Course Thumbnail Load Failed:',
      course.thumbnail
    );

    e.currentTarget.style.display = 'none';

    const fallback =
      e.currentTarget.parentElement.querySelector(
        '.thumbnail-fallback'
      );

    if (fallback) {
      fallback.style.display = 'flex';
    }
  };

  // ===============================
  // RENDER
  // ===============================

  return (
    <DashboardLayout>

      {/* ===============================
          PAGE TITLE
      =============================== */}

      <h2 className="mb-4">
        My Courses
      </h2>


      {/* ===============================
          COURSE FILTER
      =============================== */}

      <div className="btn-group mb-4">

        {/* ALL */}

        <button
          type="button"
          className={`btn ${filter === 'all'
              ? 'btn-primary'
              : 'btn-outline-primary'
            }`}
          onClick={() => setFilter('all')}
        >
          All
        </button>


        {/* IN PROGRESS */}

        <button
          type="button"
          className={`btn ${filter === 'active'
              ? 'btn-primary'
              : 'btn-outline-primary'
            }`}
          onClick={() => setFilter('active')}
        >
          In Progress
        </button>


        {/* COMPLETED */}

        <button
          type="button"
          className={`btn ${filter === 'completed'
              ? 'btn-primary'
              : 'btn-outline-primary'
            }`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>

      </div>


      {/* ===============================
          LOADING
      =============================== */}

      {loading ? (

        <Loading />

      ) : (

        <div className="row g-4">

          {courses.map((course) => {

            // ===============================
            // COURSE DATA
            // ===============================

            const thumbnailUrl =
              getThumbnailUrl(course.thumbnail);

            const progress =
              Number(course.progress) || 0;

            const isCompleted =
              progress >= 100;

            const courseId =
              course.course_id || course.id;


            return (

              <div
                className="col-md-4"
                key={
                  course.enrollment_id ||
                  courseId
                }
              >

                <div className="card h-100 shadow-sm overflow-hidden">


                  {/* ===============================
                      COURSE THUMBNAIL
                  =============================== */}

                  <div
                    className="position-relative bg-light"
                    style={{
                      height: '200px',
                      overflow: 'hidden'
                    }}
                  >

                    {thumbnailUrl && (

                      <img
                        src={thumbnailUrl}
                        alt={
                          course.title ||
                          'Course'
                        }
                        className="w-100 h-100"
                        style={{
                          objectFit: 'cover',
                          display: 'block'
                        }}
                        onError={(e) =>
                          handleImageError(
                            e,
                            course
                          )
                        }
                      />

                    )}


                    {/* Thumbnail fallback */}

                    <div
                      className="thumbnail-fallback w-100 h-100 bg-secondary align-items-center justify-content-center"
                      style={{
                        display: thumbnailUrl
                          ? 'none'
                          : 'flex'
                      }}
                    >

                      <div className="text-center px-3">

                        <div className="text-white fw-bold">
                          {course.title ||
                            'Course'}
                        </div>

                        <small className="text-white-50">
                          Course Thumbnail
                        </small>

                      </div>

                    </div>

                  </div>


                  {/* ===============================
                      COURSE DETAILS
                  =============================== */}

                  <div className="card-body">

                    {/* COURSE TITLE */}

                    <h5 className="card-title">
                      {course.title ||
                        'Untitled Course'}
                    </h5>


                    {/* TEACHER */}

                    <p className="text-muted small mb-3">
                      By{' '}
                      {course.teacher_name || '-'}
                    </p>


                    {/* ===============================
                        PROGRESS BAR
                    =============================== */}

                    <div
                      className="progress mb-2"
                      style={{
                        height: '10px'
                      }}
                    >

                      <div
                        className="progress-bar bg-success"
                        role="progressbar"
                        style={{
                          width: `${Math.min(
                            progress,
                            100
                          )}%`
                        }}
                        aria-valuenow={progress}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      />

                    </div>


                    {/* ===============================
                        PROGRESS TEXT
                    =============================== */}

                    <small className="text-muted">

                      {course.completed_lessons || 0}
                      {' / '}
                      {course.total_lessons || 0}
                      {' lessons • '}
                      {progress}%

                    </small>


                    {/* ===============================
                        ACTION BUTTONS
                    =============================== */}

                    <div className="mt-3 d-flex gap-2 flex-wrap">

                      {/* ===============================
                          IN PROGRESS
                      =============================== */}

                      {!isCompleted && (

                        <Link
                          to={`/student/learn/${courseId}`}
                          className="btn btn-sm btn-primary"
                        >
                          Continue
                        </Link>

                      )}


                      {/* ===============================
                          COMPLETED
                      =============================== */}

                      {isCompleted && (

                        <Link
                          to={`/student/learn/${courseId}`}
                          className="btn btn-sm btn-success"
                        >
                          Course Completed
                        </Link>

                      )}


                      {/* ===============================
                          REVIEWS
                      =============================== */}

                      <Link
                        to={`/student/reviews/${courseId}`}
                        className="btn btn-sm btn-primary"
                      >
                        Reviews
                      </Link>
                    </div>

                  </div>

                </div>

              </div>

            );
          })}


          {/* ===============================
              NO COURSES
          =============================== */}

          {courses.length === 0 && (

            <div className="col-12">

              <div className="card border-0 shadow-sm">

                <div className="card-body text-center py-5">

                  <h5 className="mb-2">
                    No Courses Found
                  </h5>

                  <p className="text-muted mb-0">
                    No published courses found.
                  </p>

                </div>

              </div>

            </div>

          )}

        </div>

      )}

    </DashboardLayout>
  );
};

export default MyCourses;

