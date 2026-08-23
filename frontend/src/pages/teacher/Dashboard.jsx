import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/teacher/dashboard.php')
      .then(res => { if (res.data.status) setStats(res.data.data); })
      .catch(() => setStats({ total_courses: 0, published_courses: 0, draft_courses: 0, total_students: 0, total_lessons: 0 }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h2 className="mb-1">Teacher Dashboard</h2>
      <p className="text-muted mb-4">Welcome back, {user?.name}</p>

      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <div className="card text-center shadow-sm border-0 bg-primary text-white">
            <div className="card-body py-4">
              <h2>{stats?.total_courses || 0}</h2>
              <p className="mb-0">Total Courses</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center shadow-sm border-0 bg-success text-white">
            <div className="card-body py-4">
              <h2>{stats?.published_courses || 0}</h2>
              <p className="mb-0">Published</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center shadow-sm border-0 bg-warning text-dark">
            <div className="card-body py-4">
              <h2>{stats?.draft_courses || 0}</h2>
              <p className="mb-0">Drafts</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center shadow-sm border-0 bg-info text-white">
            <div className="card-body py-4">
              <h2>{stats?.total_students || 0}</h2>
              <p className="mb-0">Students</p>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex gap-3 flex-wrap">
        <Link to="/teacher/courses/create" className="btn btn-primary">+ Create Course</Link>
        <Link to="/teacher/courses" className="btn btn-outline-primary">Manage Courses</Link>
        <Link to="/teacher/students" className="btn btn-outline-secondary">My Students</Link>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
