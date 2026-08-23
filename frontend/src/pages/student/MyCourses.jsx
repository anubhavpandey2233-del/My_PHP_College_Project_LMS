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
      .then(res => { if (res.data.status) setCourses(res.data.data); })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <DashboardLayout>
      <h2 className="mb-4">My Courses</h2>

      <div className="btn-group mb-4">
        <button className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setFilter('all')}>All</button>
        <button className={`btn ${filter === 'active' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setFilter('active')}>In Progress</button>
        <button className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setFilter('completed')}>Completed</button>
      </div>

      {loading ? <Loading /> : (
        <div className="row g-4">
          {courses.map(c => (
            <div className="col-md-4" key={c.id}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{c.title}</h5>
                  <p className="text-muted small">By {c.teacher_name}</p>
                  <div className="progress mb-2" style={{ height: '10px' }}>
                    <div className="progress-bar bg-success" style={{ width: `${c.progress}%` }}></div>
                  </div>
                  <small>{c.completed_lessons || 0} / {c.total_lessons || 0} lessons • {c.progress}%</small>
                  <div className="mt-3">
                    <Link to={`/student/learn/${c.course_id}`} className="btn btn-sm btn-primary">
                      {c.progress >= 100 ? 'Review' : 'Continue'}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {courses.length === 0 && <p className="text-muted">No courses found.</p>}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyCourses;
