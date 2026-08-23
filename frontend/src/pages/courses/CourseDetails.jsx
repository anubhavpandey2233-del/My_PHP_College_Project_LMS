import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';

const CourseDetails = () => {
  const { slug } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get(`/courses/get.php?slug=${slug}`)
      .then(res => { if (res.data.status) setCourse(res.data.data); })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setEnrolling(true);
    setMessage('');
    try {
      const res = await api.post('/student/enroll.php', { course_id: course.id });
      if (res.data.status) {
        setMessage('Successfully enrolled!');
        setTimeout(() => navigate(`/student/learn/${course.id}`), 1000);
      } else {
        setMessage(res.data.message);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <div className="d-flex flex-column min-vh-100"><Header /><Loading /><Footer /></div>;
  if (!course) return <div className="d-flex flex-column min-vh-100"><Header /><div className="container my-5">Course not found</div><Footer /></div>;

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <div className="container my-5 flex-grow-1">
        <div className="row">
          <div className="col-lg-8">
            <div className="bg-secondary rounded mb-4 d-flex align-items-center justify-content-center" style={{ height: '300px' }}>
              <h3 className="text-white">{course.title}</h3>
            </div>
            <h1>{course.title}</h1>
            <p className="text-muted">By {course.teacher_name} • {course.level} • {course.language}</p>
            <div className="mb-4">
              {course.description?.split('\n').map((p, i) => <p key={i}>{p}</p>)}
            </div>

            {course.requirements?.length > 0 && (
              <>
                <h4>Requirements</h4>
                <ul>{course.requirements.map(r => <li key={r.id}>{r.requirement}</li>)}</ul>
              </>
            )}

            {course.outcomes?.length > 0 && (
              <>
                <h4>What you'll learn</h4>
                <ul>{course.outcomes.map(o => <li key={o.id}>{o.outcome}</li>)}</ul>
              </>
            )}
          </div>
          <div className="col-lg-4">
            <div className="card shadow sticky-top" style={{ top: '20px' }}>
              <div className="card-body">
                <h3 className="text-primary">
                  {course.discount_price ? (
                    <>₹{course.discount_price} <small className="text-muted text-decoration-line-through">₹{course.price}</small></>
                  ) : `₹${course.price}`}
                </h3>
                <p><strong>Duration:</strong> {course.duration_hours} hours</p>
                <p><strong>Category:</strong> {course.category_name}</p>
                <p><strong>Students:</strong> {course.total_students}</p>
                {message && <div className="alert alert-info py-2">{message}</div>}
                <button className="btn btn-primary w-100 mt-2" onClick={handleEnroll} disabled={enrolling}>
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
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
