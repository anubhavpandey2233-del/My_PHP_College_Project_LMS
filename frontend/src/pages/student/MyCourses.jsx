import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loading from '../../components/common/Loading';

const MyCourses = () => {
const [courses, setCourses] = useState([]);
const [filter, setFilter] = useState('all');
const [loading, setLoading] = useState(true);

useEffect(() => {
setLoading(true);

api.get(`/student/my-courses.php?status=${filter}`)
  .then(res => {
    console.log('MY COURSES API:', res.data);

    if (res.data.status) {
      setCourses(res.data.data || []);
    } else {
      setCourses([]);
    }
  })
  .catch(error => {
    console.error('My Courses Error:', error);
    setCourses([]);
  })
  .finally(() => {
    setLoading(false);
  });

}, [filter]);

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

if (value.startsWith('/php-lms-project/backend/uploads/courses/')) {
  return `http://localhost${value}`;
}

return `http://localhost/php-lms-project/backend/uploads/courses/${value}`;

};

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

return (
<DashboardLayout>

  <h2 className="mb-4">
    My Courses
  </h2>

  <div className="btn-group mb-4">

    <button
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

  {loading ? (

    <Loading />

  ) : (

    <div className="row g-4">

      {courses.map(c => {

        const thumbnailUrl =
          getThumbnailUrl(c.thumbnail);

        return (

          <div
            className="col-md-4"
            key={c.id}
          >

            <div className="card h-100 shadow-sm overflow-hidden">

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
                    alt={c.title || 'Course'}
                    className="w-100 h-100"
                    style={{
                      objectFit: 'cover',
                      display: 'block'
                    }}
                    onError={(e) =>
                      handleImageError(e, c)
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
                      {c.title || 'Course'}
                    </div>

                    <small className="text-white-50">
                      Course Thumbnail
                    </small>

                  </div>

                </div>

              </div>

              <div className="card-body">

                <h5 className="card-title">
                  {c.title}
                </h5>

                <p className="text-muted small">
                  By {c.teacher_name}
                </p>

                <div
                  className="progress mb-2"
                  style={{ height: '10px' }}
                >

                  <div
                    className="progress-bar bg-success"
                    style={{
                      width: `${Number(c.progress) || 0}%`
                    }}
                  ></div>

                </div>

                <small>
                  {c.completed_lessons || 0}
                  {' / '}
                  {c.total_lessons || 0}
                  {' lessons • '}
                  {Number(c.progress) || 0}%
                </small>

                <div className="mt-3">

                  <Link
                    to={`/student/learn/${c.course_id}`}
                    className="btn btn-sm btn-primary"
                  >
                    {Number(c.progress) >= 100
                      ? 'Review'
                      : 'Continue'}
                  </Link>

                </div>

              </div>

            </div>

          </div>

        );
      })}

      {courses.length === 0 && (

        <div className="col-12">

          <p className="text-muted">
            No courses found.
          </p>

        </div>

      )}

    </div>

  )}

</DashboardLayout>

);
};

export default MyCourses;