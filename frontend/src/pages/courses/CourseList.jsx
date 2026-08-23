import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import Loading from '../../components/common/Loading';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', category_id: '', level: '', page: 1 });

  useEffect(() => {
    api.get('/categories/list.php').then(res => {
      if (res.data.status) setCategories(res.data.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams(filters).toString();
    api.get(`/courses/list.php?${params}`)
      .then(res => {
        if (res.data.status) setCourses(res.data.data.courses || []);
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <div className="container my-5 flex-grow-1">
        <h2 className="mb-4">All Courses</h2>

        <div className="row mb-4 g-3">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search courses..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            />
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={filters.category_id}
              onChange={(e) => setFilters({ ...filters, category_id: e.target.value, page: 1 })}
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={filters.level}
              onChange={(e) => setFilters({ ...filters, level: e.target.value, page: 1 })}
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {loading ? <Loading /> : (
          <div className="row g-4">
            {courses.map(course => (
              <div className="col-md-4" key={course.id}>
                <div className="card h-100 shadow-sm course-card">
                  <div className="bg-secondary d-flex align-items-center justify-content-center" style={{ height: '160px' }}>
                    <span className="text-white">{course.title?.substring(0, 20)}...</span>
                  </div>
                  <div className="card-body d-flex flex-column">
                    <span className="badge bg-primary mb-2 align-self-start">{course.level}</span>
                    <h5 className="card-title">{course.title}</h5>
                    <p className="card-text text-muted small flex-grow-1">
                      {course.short_description?.substring(0, 80)}...
                    </p>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <div>
                        {course.discount_price ? (
                          <>
                            <span className="text-danger fw-bold">₹{course.discount_price}</span>
                            <small className="text-muted text-decoration-line-through ms-2">₹{course.price}</small>
                          </>
                        ) : (
                          <span className="fw-bold">₹{course.price}</span>
                        )}
                      </div>
                      <Link to={`/courses/${course.slug}`} className="btn btn-sm btn-outline-primary">View</Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {courses.length === 0 && <p className="text-muted">No courses found.</p>}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CourseList;
