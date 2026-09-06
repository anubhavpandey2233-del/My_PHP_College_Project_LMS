import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loading from '../../components/common/Loading';
import { useAuth } from '../../context/AuthContext';
import './TeacherCourses.scss';

const TeacherCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    api.get('/teacher/my-courses.php')
      .then(res => {
        if (res.data.status) {
          setCourses(res.data.data.courses || []);
        }
      })
      .catch(() => {
        setCourses([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return;

    try {
      await api.post('/courses/delete.php', { id });

      setCourses(prevCourses =>
        prevCourses.filter(course => course.id !== id)
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <DashboardLayout>
      <div className="teacher-courses-page">
        <div className="d-flex justify-content-between align-items-center mb-4 teacher-courses-header">
          <h2>My Courses</h2>

          <Link
            to="/teacher/courses/create"
            className="btn btn-primary rounded-pill px-4"
          >
            + Create Course
          </Link>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <div className="row g-4 teacher-courses-grid">
            {courses.map(course => {
              const price = Number(course.price || 0);
              const discount = Number(course.discount_price || 0);
              const finalPrice = price - discount;

              return (
                <div
                  className="col-12 col-md-6 col-xl-4"
                  key={course.id}
                >
                  <div className="card h-100 shadow-sm border-0 teacher-course-card">
                    <div className="teacher-course-image">
                      {course.thumbnail ? (
                        <img
                          src={`http://localhost/php-lms-project/backend/uploads/courses/${course.thumbnail}`}
                          alt={course.title}
                        />
                      ) : (
                        <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                          No Thumbnail
                        </div>
                      )}
                    </div>

                    <div className="card-body p-4">
                      <span
                        className={`badge rounded-pill mb-3 ${
                          course.status === 'published'
                            ? 'bg-success'
                            : 'bg-secondary'
                        }`}
                      >
                        {course.status}
                      </span>

                      <h5 className="card-title fw-semibold">
                        {course.title}
                      </h5>

                      <p className="text-muted small mb-2">
                        {course.category_name} • {course.level}
                      </p>

                      <div className="mb-3">
                        {discount > 0 && discount < price ? (
                          <>
                            <div>
                              <span className="fw-bold fs-5 text-danger">
                                ₹{finalPrice.toFixed(2)}
                              </span>

                              <span
                                className="text-muted ms-2"
                                style={{
                                  textDecoration: 'line-through'
                                }}
                              >
                                ₹{price.toFixed(2)}
                              </span>
                            </div>

                            <small className="text-success fw-semibold">
                              ₹{discount.toFixed(2)} OFF
                            </small>
                          </>
                        ) : (
                          <span className="fw-bold fs-5">
                            ₹{price.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <div className="d-flex gap-2 flex-wrap teacher-course-actions">
                        <Link
                          to={`/teacher/courses/${course.id}/content`}
                          className="btn btn-sm btn-outline-primary rounded-pill px-3"
                        >
                          Manage Content
                        </Link>

                        <Link
                          to={`/teacher/courses/edit/${course.id}`}
                          className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                        >
                          Edit
                        </Link>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger rounded-pill px-3"
                          onClick={() => handleDelete(course.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {courses.length === 0 && (
              <div className="col-12">
                <p className="text-muted">
                  No courses yet. Create your first course!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherCourses;