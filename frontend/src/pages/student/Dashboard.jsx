import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/dashboard.php')
      .then(res => { if (res.data.status) setStats(res.data.data); })
      .catch(() => setStats({ total_enrolled: 0, in_progress: 0, completed: 0, average_progress: 0, recent_courses: [] }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h2 className="mb-1">Student Dashboard</h2>
      <p className="text-muted mb-4">Welcome back, {user?.name}</p>

      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm bg-primary text-white text-center">
            <div className="card-body py-4">
              <h2>{stats?.total_enrolled || 0}</h2>
              <p className="mb-0">Enrolled Courses</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm bg-warning text-dark text-center">
            <div className="card-body py-4">
              <h2>{stats?.in_progress || 0}</h2>
              <p className="mb-0">In Progress</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm bg-success text-white text-center">
            <div className="card-body py-4">
              <h2>{stats?.completed || 0}</h2>
              <p className="mb-0">Completed</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm bg-info text-white text-center">
            <div className="card-body py-4">
              <h2>{stats?.average_progress || 0}%</h2>
              <p className="mb-0">Avg Progress</p>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex gap-3 flex-wrap mb-4">
        <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
        <Link to="/student/my-courses" className="btn btn-outline-primary">My Courses</Link>
        <Link to="/student/certificates" className="btn btn-outline-success">Certificates</Link>
      </div>

      <h4 className="mb-3">Continue Learning</h4>
      <div className="row g-3">
        {stats?.recent_courses?.length > 0 ? stats.recent_courses.map(c => (
          <div className="col-md-4" key={c.id}>
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h6>{c.title}</h6>
                <div className="progress mb-2" style={{ height: '8px' }}>
                  <div className="progress-bar" style={{ width: `${c.progress}%` }}></div>
                </div>
                <small className="text-muted">{c.progress}% complete</small>
                <div className="mt-2">
                  <Link to={`/student/learn/${c.course_id}`} className="btn btn-sm btn-primary">Continue</Link>
                </div>
              </div>
            </div>
          </div>
        )) : <p className="text-muted">No courses yet. Start by browsing courses.</p>}
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
