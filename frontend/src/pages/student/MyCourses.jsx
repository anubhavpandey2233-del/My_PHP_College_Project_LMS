

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
  // Fetch My Courses
  // ===============================

  useEffect(() => {
    setLoading(true);

    api
      .get(`/student/my-courses.php?status=${filter}`)
      .then((res) => {
        console.log('MY COURSES API:', res.data);

        if (res.data.status) {
          setCourses(res.data.data || []);
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
  // Thumbnail URL
  // ===============================

  const getThumbnailUrl = (thumbnail) => {
    if (!thumbnail) {
      return null;
    }

    const value = String(thumbnail).trim();

    if (!value) {
      return null;
    }

    if (
      value.startsWith('http://') ||
      value.startsWith('https://')
    ) {
      return value;
    }

    if (value.startsWith('/uploads/courses/')) {
      return `http://localhost/php-lms-project/backend${value}`;
    }

    if (value.startsWith('uploads/courses/')) {
      return `http://localhost/php-lms-project/backend/${value}`;
    }

    if (
      value.startsWith(
        '/php-lms-project/backend/uploads/courses/'
      )
    ) {
      return `http://localhost${value}`;
    }

    return `http://localhost/php-lms-project/backend/uploads/courses/${value}`;
  };

  // ===============================
  // Image Error
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
  // Render
  // ===============================

  return (
    <DashboardLayout>

      <h2 className="mb-4">
        My Courses
      </h2>

      {/* ===============================
          Course Filter
      =============================== */}

      <div className="btn-group mb-4">

        <button
          type="button"
          className={`btn ${
            filter === 'all'
              ? 'btn-primary'
              : 'btn-outline-primary'
          }`}
          onClick={() => setFilter('all')}
        >
          All
        </button>

        <button
          type="button"
          className={`btn ${
            filter === 'active'
              ? 'btn-primary'
              : 'btn-outline-primary'
          }`}
          onClick={() => setFilter('active')}
        >
          In Progress
        </button>

        <button
          type="button"
          className={`btn ${
            filter === 'completed'
              ? 'btn-primary'
              : 'btn-outline-primary'
          }`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>

      </div>

      {/* ===============================
          Loading
      =============================== */}

      {loading ? (

        <Loading />

      ) : (

        <div className="row g-4">

          {courses.map((course) => {

            const thumbnailUrl =
              getThumbnailUrl(course.thumbnail);

            return (

              <div
                className="col-md-4"
                key={course.enrollment_id || course.id}
              >

                <div className="card h-100 shadow-sm overflow-hidden">

                  {/* ===============================
                      Thumbnail
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
                        alt={course.title || 'Course'}
                        className="w-100 h-100"
                        style={{
                          objectFit: 'cover',
                          display: 'block'
                        }}
                        onError={(e) =>
                          handleImageError(e, course)
                        }
                      />

                    )}

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
                          {course.title || 'Course'}
                        </div>

                        <small className="text-white-50">
                          Course Thumbnail
                        </small>

                      </div>

                    </div>

                  </div>

                  {/* ===============================
                      Course Details
                  =============================== */}

                  <div className="card-body">

                    <h5 className="card-title">
                      {course.title}
                    </h5>

                    <p className="text-muted small">
                      By {course.teacher_name || '-'}
                    </p>

                    {/* Progress */}

                    <div
                      className="progress mb-2"
                      style={{
                        height: '10px'
                      }}
                    >

                      <div
                        className="progress-bar bg-success"
                        style={{
                          width: `${Number(course.progress) || 0}%`
                        }}
                      ></div>

                    </div>

                    <small>
                      {course.completed_lessons || 0}
                      {' / '}
                      {course.total_lessons || 0}
                      {' lessons • '}
                      {Number(course.progress) || 0}%
                    </small>

                    {/* Continue / Review */}

                    <div className="mt-3">

                      <Link
                        to={`/student/learn/${course.course_id}`}
                        className="btn btn-sm btn-primary"
                      >
                        {Number(course.progress) >= 100
                          ? 'Review'
                          : 'Continue'}
                      </Link>

                    </div>

                  </div>

                </div>

              </div>

            );
          })}

          {/* ===============================
              No Courses
          =============================== */}

          {courses.length === 0 && (

            <div className="col-12">

              <p className="text-muted">
                No published courses found.
              </p>

            </div>

          )}

        </div>

      )}

    </DashboardLayout>
  );
};

export default MyCourses;

