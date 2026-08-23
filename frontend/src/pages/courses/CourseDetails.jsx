import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';

const CourseDetails = () => {
const { slug } = useParams();
const { isAuthenticated } = useAuth();
const navigate = useNavigate();

const [course, setCourse] = useState(null);
const [loading, setLoading] = useState(true);
const [enrolling, setEnrolling] = useState(false);
const [message, setMessage] = useState('');

useEffect(() => {
setLoading(true);

api.get(`/courses/get.php?slug=${slug}`)
  .then(res => {
    if (res.data.status) {
      setCourse(res.data.data);
    } else {
      setCourse(null);
    }
  })
  .catch(error => {
    console.error('Course details error:', error);
    setCourse(null);
  })
  .finally(() => {
    setLoading(false);
  });

}, [slug]);

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

const handleImageError = (e) => {
e.currentTarget.style.display = 'none';

const fallback = e.currentTarget.parentElement.querySelector(
  '.thumbnail-fallback'
);

if (fallback) {
  fallback.style.display = 'flex';
}

};

const handleEnroll = async () => {
if (!isAuthenticated) {
navigate('/login');
return;
}

setEnrolling(true);
setMessage('');

try {
  const res = await api.post('/student/enroll.php', {
    course_id: course.id
  });

  if (res.data.status) {
    setMessage('Successfully enrolled!');

    setTimeout(() => {
      navigate(`/student/learn/${course.id}`);
    }, 1000);
  } else {
    setMessage(res.data.message || 'Enrollment failed');
  }
} catch (err) {
  setMessage(
    err.response?.data?.message || 'Enrollment failed'
  );
} finally {
  setEnrolling(false);
}

};

if (loading) {
return (
<div className="d-flex flex-column min-vh-100">
<Header />
<div className="flex-grow-1">
<Loading />
</div>
<Footer />
</div>
);
}

if (!course) {
return (
<div className="d-flex flex-column min-vh-100">
<Header />

    <div className="container my-5 flex-grow-1">
      <div className="alert alert-danger">
        Course not found.
      </div>
    </div>

    <Footer />
  </div>
);

}

const thumbnailUrl = getThumbnailUrl(course.thumbnail);

const originalPrice = Number(course.price || 0);
const discountAmount = Number(course.discount_price || 0);

const finalPrice =
discountAmount > 0
? Math.max(0, originalPrice - discountAmount)
: originalPrice;

return (
<div className="d-flex flex-column min-vh-100">

  <Header />

  <div className="container my-5 flex-grow-1">

    <div className="row">

      <div className="col-lg-8">

        <div
          className="position-relative bg-light rounded mb-4 overflow-hidden"
          style={{
            height: '300px'
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
              onError={handleImageError}
            />
          )}

          <div
            className="thumbnail-fallback w-100 h-100 bg-secondary align-items-center justify-content-center"
            style={{
              display: thumbnailUrl ? 'none' : 'flex'
            }}
          >
            <h3 className="text-white text-center px-3">
              {course.title || 'Course'}
            </h3>
          </div>

        </div>

        <h1>{course.title}</h1>

        <p className="text-muted">
          By {course.teacher_name} • {course.level} • {course.language}
        </p>

        <div className="mb-4">
          {course.description
            ?.split('\n')
            .map((p, i) => (
              <p key={i}>{p}</p>
            ))}
        </div>

        {course.requirements?.length > 0 && (
          <>
            <h4>Requirements</h4>

            <ul>
              {course.requirements.map(requirement => (
                <li key={requirement.id}>
                  {requirement.requirement}
                </li>
              ))}
            </ul>
          </>
        )}

        {course.outcomes?.length > 0 && (
          <>
            <h4>What you'll learn</h4>

            <ul>
              {course.outcomes.map(outcome => (
                <li key={outcome.id}>
                  {outcome.outcome}
                </li>
              ))}
            </ul>
          </>
        )}

      </div>

      <div className="col-lg-4">

        <div
          className="card shadow sticky-top"
          style={{ top: '20px' }}
        >

          <div className="card-body">

            <div className="mb-3">

              {discountAmount > 0 ? (
                <>
                  <h3 className="text-primary mb-1">
                    ₹{finalPrice}
                  </h3>

                  <div>
                    <span className="text-muted text-decoration-line-through me-2">
                      ₹{originalPrice}
                    </span>

                    <span className="text-success fw-bold">
                      Save ₹{discountAmount}
                    </span>
                  </div>
                </>
              ) : (
                <h3 className="text-primary">
                  ₹{originalPrice}
                </h3>
              )}

            </div>

            <p>
              <strong>Duration:</strong>{' '}
              {course.duration_hours} hours
            </p>

            <p>
              <strong>Category:</strong>{' '}
              {course.category_name}
            </p>

            <p>
              <strong>Students:</strong>{' '}
              {course.total_students}
            </p>

            {message && (
              <div className="alert alert-info py-2">
                {message}
              </div>
            )}

            <button
              className="btn btn-primary w-100 mt-2"
              onClick={handleEnroll}
              disabled={enrolling}
            >
              {enrolling
                ? 'Enrolling...'
                : 'Enroll Now'}
            </button>

          </div>

        </div>

      </div>

    </div>

  </div>

  <Footer />

</div>

);
};

export default CourseDetails;