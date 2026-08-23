import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RoleProtectedRoute from './components/common/RoleProtectedRoute';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import AdminDashboard from './pages/admin/Dashboard';
import AdminChangePassword from './pages/admin/ChangePassword';
import TeacherDashboard from './pages/teacher/Dashboard';
import ChangePassword from './pages/teacher/ChangePassword';
import TeacherCourses from './pages/teacher/Courses';
import CourseForm from './pages/teacher/CourseForm';
import ManageContent from './pages/teacher/ManageContent';
import StudentDashboard from './pages/student/Dashboard';
import StudentChangePassword from './pages/student/ChangePassword';
import MyCourses from './pages/student/MyCourses';
import LearningPage from './pages/student/LearningPage';

import CourseList from './pages/courses/CourseList';
import CourseDetails from './pages/courses/CourseDetails';

import AdminUsers from './pages/admin/AdminUsers';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/courses" element={<CourseList />} />
          <Route path="/courses/:slug" element={<CourseDetails />} />

          <Route path="/admin/dashboard" element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </RoleProtectedRoute>
          } />
          <Route
            path="/admin/change-password"
            element={<AdminChangePassword />}
          />
          <Route path="/teacher/dashboard" element={
            <RoleProtectedRoute allowedRoles={['teacher']}>
              <TeacherDashboard />
            </RoleProtectedRoute>
          } />
          <Route
            path="/teacher/change-password"
            element={
              <RoleProtectedRoute allowedRoles={['teacher']}>
                <ChangePassword />
              </RoleProtectedRoute>
            }
          />
          <Route path="/teacher/courses" element={
            <RoleProtectedRoute allowedRoles={['teacher']}>
              <TeacherCourses />
            </RoleProtectedRoute>
          } />
          <Route path="/teacher/courses/create" element={
            <RoleProtectedRoute allowedRoles={['teacher']}>
              <CourseForm />
            </RoleProtectedRoute>
          } />
          <Route path="/teacher/courses/edit/:id" element={
            <RoleProtectedRoute allowedRoles={['teacher']}>
              <CourseForm />
            </RoleProtectedRoute>
          } />
          <Route path="/teacher/courses/:id/content" element={
            <RoleProtectedRoute allowedRoles={['teacher']}>
              <ManageContent />
            </RoleProtectedRoute>
          } />

          <Route path="/student/dashboard" element={
            <RoleProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </RoleProtectedRoute>
          } />
          <Route
            path="/student/change-password"
            element={
              <RoleProtectedRoute allowedRoles={['student']}>
                <StudentChangePassword />
              </RoleProtectedRoute>
            }
          />
          <Route path="/student/my-courses" element={
            <RoleProtectedRoute allowedRoles={['student']}>
              <MyCourses />
            </RoleProtectedRoute>
          } />
          <Route path="/student/learn/:courseId" element={
            <RoleProtectedRoute allowedRoles={['student']}>
              <LearningPage />
            </RoleProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />


          <Route path="/admin/users" element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <AdminUsers />
            </RoleProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
