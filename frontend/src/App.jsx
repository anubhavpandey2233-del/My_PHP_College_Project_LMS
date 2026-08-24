
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import RoleProtectedRoute from './components/common/RoleProtectedRoute';


// =====================================
// Auth Pages
// =====================================

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';


// =====================================
// Admin Pages
// =====================================

import AdminDashboard from './pages/admin/Dashboard';
import AdminChangePassword from './pages/admin/ChangePassword';
import AdminCourses from './pages/admin/AdminCourses';
import Subcategories from './pages/admin/Subcategories';
import Enrollments from './pages/admin/Enrollments';
import AdminUsers from './pages/admin/AdminUsers';
import Categories from './pages/admin/Categories';
import Profile from './pages/admin/Profile';


// =====================================
// Teacher Pages
// =====================================

import TeacherDashboard from './pages/teacher/Dashboard';
import ChangePassword from './pages/teacher/ChangePassword';
import TeacherCourses from './pages/teacher/Courses';
import CourseForm from './pages/teacher/CourseForm';
import ManageContent from './pages/teacher/ManageContent';
import TeacherProfile from './pages/teacher/Profile';


// =====================================
// Student Pages
// =====================================

import StudentDashboard from './pages/student/Dashboard';
import StudentChangePassword from './pages/student/ChangePassword';
import MyCourses from './pages/student/MyCourses';
import LearningPage from './pages/student/LearningPage';
import StudentProfile from './pages/student/Profile';


// =====================================
// Public Course Pages
// =====================================

import CourseList from './pages/courses/CourseList';
import CourseDetails from './pages/courses/CourseDetails';


function App() {

  return (

    <AuthProvider>

      <BrowserRouter>

        <Routes>


          {/* =================================
              AUTHENTICATION
          ================================= */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />


          {/* =================================
              PUBLIC COURSES
          ================================= */}

          <Route
            path="/courses"
            element={<CourseList />}
          />

          <Route
            path="/courses/:slug"
            element={<CourseDetails />}
          />


          {/* =================================
              ADMIN ROUTES
          ================================= */}

          <Route
            path="/admin/dashboard"
            element={
              <RoleProtectedRoute
                allowedRoles={['admin']}
              >
                <AdminDashboard />
              </RoleProtectedRoute>
            }
          />


          <Route
            path="/admin/users"
            element={
              <RoleProtectedRoute
                allowedRoles={['admin']}
              >
                <AdminUsers />
              </RoleProtectedRoute>
            }
          />


          <Route
            path="/admin/categories"
            element={
              <RoleProtectedRoute
                allowedRoles={['admin']}
              >
                <Categories />
              </RoleProtectedRoute>
            }
          />


          <Route
            path="/admin/subcategories"
            element={
              <RoleProtectedRoute
                allowedRoles={['admin']}
              >
                <Subcategories />
              </RoleProtectedRoute>
            }
          />


          <Route
            path="/admin/courses"
            element={
              <RoleProtectedRoute
                allowedRoles={['admin']}
              >
                <AdminCourses />
              </RoleProtectedRoute>
            }
          />


          <Route
            path="/admin/enrollments"
            element={
              <RoleProtectedRoute
                allowedRoles={['admin']}
              >
                <Enrollments />
              </RoleProtectedRoute>
            }
          />


          <Route
            path="/admin/profile"
            element={
              <RoleProtectedRoute
                allowedRoles={['admin']}
              >
                <Profile />
              </RoleProtectedRoute>
            }
          />


          <Route
            path="/admin/change-password"
            element={
              <RoleProtectedRoute
                allowedRoles={['admin']}
              >
                <AdminChangePassword />
              </RoleProtectedRoute>
            }
          />


          {/* =================================
              TEACHER ROUTES
          ================================= */}

          <Route
            path="/teacher/dashboard"
            element={
              <RoleProtectedRoute
                allowedRoles={['teacher']}
              >
                <TeacherDashboard />
              </RoleProtectedRoute>
            }
          />


          <Route
            path="/teacher/change-password"
            element={
              <RoleProtectedRoute
                allowedRoles={['teacher']}
              >
                <ChangePassword />
              </RoleProtectedRoute>
            }
          />


          <Route
            path="/teacher/profile"
            element={
              <RoleProtectedRoute
                allowedRoles={['teacher']}
              >
                <TeacherProfile />
              </RoleProtectedRoute>
            }
          />


          <Route
            path="/teacher/courses"
            element={
              <RoleProtectedRoute
                allowedRoles={['teacher']}
              >
                <TeacherCourses />
              </RoleProtectedRoute>
            }
          />


          <Route
            path="/teacher/courses/create"
            element={
              <RoleProtectedRoute
                allowedRoles={['teacher']}
              >
                <CourseForm />
              </RoleProtectedRoute>
            }
          />


          <Route
            path="/teacher/courses/edit/:id"
            element={
              <RoleProtectedRoute
                allowedRoles={['teacher']}
              >
                <CourseForm />
              </RoleProtectedRoute>
            }
          />


          <Route
            path="/teacher/courses/:id/content"
            element={
              <RoleProtectedRoute
                allowedRoles={['teacher']}
              >
                <ManageContent />
              </RoleProtectedRoute>
            }
          />


          {/* =================================
              STUDENT ROUTES
          ================================= */}

          <Route
            path="/student/dashboard"
            element={
              <RoleProtectedRoute
                allowedRoles={['student']}
              >
                <StudentDashboard />
              </RoleProtectedRoute>
            }
          />


          <Route
            path="/student/change-password"
            element={
              <RoleProtectedRoute
                allowedRoles={['student']}
              >
                <StudentChangePassword />
              </RoleProtectedRoute>
            }
          />


          <Route
            path="/student/profile"
            element={
              <RoleProtectedRoute
                allowedRoles={['student']}
              >
                <StudentProfile />
              </RoleProtectedRoute>
            }
          />


          <Route
            path="/student/my-courses"
            element={
              <RoleProtectedRoute
                allowedRoles={['student']}
              >
                <MyCourses />
              </RoleProtectedRoute>
            }
          />


          <Route
            path="/student/learn/:courseId"
            element={
              <RoleProtectedRoute
                allowedRoles={['student']}
              >
                <LearningPage />
              </RoleProtectedRoute>
            }
          />


          {/* =================================
              DEFAULT ROUTES
          ================================= */}

          <Route
            path="/"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />


          <Route
            path="*"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />


        </Routes>

      </BrowserRouter>

    </AuthProvider>

  );
}


export default App;

