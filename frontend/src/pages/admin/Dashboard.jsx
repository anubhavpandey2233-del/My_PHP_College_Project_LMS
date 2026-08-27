
import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';

const AdminDashboard = () => {

  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);


  // =====================================
  // FETCH DASHBOARD STATS
  // =====================================

  useEffect(() => {

    const fetchDashboardStats = async () => {

      try {

        setLoading(true);

        const res = await api.get(
          '/admin/dashboard.php'
        );

        if (res.data.status) {

          setStats(res.data.data);

        } else {

          setStats({});

        }

      } catch (error) {

        console.error(
          'Admin Dashboard Error:',
          error
        );

        setStats({});

      } finally {

        setLoading(false);

      }

    };

    fetchDashboardStats();

  }, []);


  // =====================================
  // LOADING
  // =====================================

  if (loading) {

    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    );

  }


  // =====================================
  // PAGE
  // =====================================

  return (

    <DashboardLayout>

      {/* PAGE HEADER */}

      <h2 className="mb-1">
        Admin Dashboard
      </h2>

      <p className="text-muted mb-4">
        Welcome, {user?.name}
      </p>


      {/* =====================================
          STAT CARDS
      ===================================== */}

      <div className="row g-4">


        {/* TOTAL USERS */}

        <div className="col-md-3">

          <div className="card text-center shadow-sm border-0 bg-primary text-white">

            <div className="card-body py-4">

              <h2>
                {stats?.total_users || 0}
              </h2>

              <p className="mb-0">
                Total Users
              </p>

            </div>

          </div>

        </div>


        {/* TOTAL COURSES */}

        <div className="col-md-3">

          <div className="card text-center shadow-sm border-0 bg-success text-white">

            <div className="card-body py-4">

              <h2>
                {stats?.total_courses || 0}
              </h2>

              <p className="mb-0">
                Total Courses
              </p>

            </div>

          </div>

        </div>


        {/* TOTAL ENROLLMENTS */}

        <div className="col-md-3">

          <div className="card text-center shadow-sm border-0 bg-info text-white">

            <div className="card-body py-4">

              <h2>
                {stats?.total_enrollments || 0}
              </h2>

              <p className="mb-0">
                Enrollments
              </p>

            </div>

          </div>

        </div>


        {/* APPROVED REVIEWS */}

        <div className="col-md-3">

          <div className="card text-center shadow-sm border-0 bg-warning text-dark">

            <div className="card-body py-4">

              <h2>
                {stats?.approved_reviews || 0}
              </h2>

              <p className="mb-0">
                 Reviews
              </p>

            </div>

          </div>

        </div>


      </div>

    </DashboardLayout>

  );

};


export default AdminDashboard;

