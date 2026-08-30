import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import RoleProtectedRoute from './components/common/RoleProtectedRoute';


// =====================================
// HOME
// =====================================

import Home from './pages/home/Home';


// =====================================
// AUTH
// =====================================

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';


// =====================================
// LAYOUT
// =====================================

import DashboardLayout from './layouts/DashboardLayout';


// =====================================
// ADMIN
// =====================================

import AdminDashboard from './pages/admin/Dashboard';
import AdminChangePassword from './pages/admin/ChangePassword';
import AdminCourses from './pages/admin/AdminCourses';
import Subcategories from './pages/admin/Subcategories';
import AdminEnrollments from './pages/admin/Enrollments';
import AdminUsers from './pages/admin/AdminUsers';
import Categories from './pages/admin/Categories';
import Profile from './pages/admin/Profile';
import StudentReviews from './pages/admin/Reviews/StudentReviews';
import ContactMessages from './pages/admin/ContactMessages';
import AdminInstructorApplications from './pages/admin/AdminInstructorApplications';


// =====================================
// TEACHER
// =====================================

import TeacherDashboard from './pages/teacher/Dashboard';
import ChangePassword from './pages/teacher/ChangePassword';
import TeacherCourses from './pages/teacher/Courses';
import CourseForm from './pages/teacher/CourseForm';
import ManageContent from './pages/teacher/ManageContent';
import TeacherProfile from './pages/teacher/Profile';
import TeacherEnrollments from './pages/teacher/Enrollments';


// =====================================
// TEACHER QUIZ
// =====================================

import Quiz from './pages/teacher/Quiz';
import QuizResults from './pages/teacher/QuizResults';
import QuizResultDetails from './pages/teacher/QuizResultDetails';


// =====================================
// STUDENT
// =====================================

import StudentDashboard from './pages/student/Dashboard';
import StudentChangePassword from './pages/student/ChangePassword';
import MyCourses from './pages/student/MyCourses';
import LearningPage from './pages/student/LearningPage';
import StudentProfile from './pages/student/Profile';
import StudentQuiz from './pages/student/StudentQuiz';
import Reviews from './pages/student/Reviews';


// =====================================
// COURSES
// =====================================

import CourseList from './pages/courses/CourseList';
import CourseDetails from './pages/courses/CourseDetails';


// =====================================
// BECOME INSTRUCTOR
// =====================================

import BecomeInstructor from './pages/BecomeInstructor/BecomeInstructor';
import InstructorApplication from './pages/BecomeInstructor/InstructorApplication';


// =====================================
// SUPPORT
// =====================================

import HelpCenter from './pages/support/HelpCenter';
import PrivacyPolicy from './pages/support/PrivacyPolicy';
import TermsConditions from './pages/support/TermsConditions';
import ContactUs from './pages/support/ContactUs';


function App() {

  return (

    <ThemeProvider>

      <AuthProvider>

        <BrowserRouter>

          <Routes>


            {/* =================================
                HOME
            ================================= */}

            <Route
              path="/"
              element={<Home />}
            />


            {/* =================================
                AUTH
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
                ADMIN
            ================================= */}

            <Route
              path="/admin/dashboard"
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <AdminUsers />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/admin/categories"
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <Categories />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/admin/subcategories"
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <Subcategories />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/admin/courses"
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <AdminCourses />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/admin/enrollments"
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <AdminEnrollments />
                </RoleProtectedRoute>
              }
            />


            {/* =================================
                ADMIN REVIEWS
            ================================= */}

            <Route
              path="/admin/reviews"
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <StudentReviews />
                </RoleProtectedRoute>
              }
            />


            {/* =================================
                ADMIN CONTACT MESSAGES
            ================================= */}

            <Route
              path="/admin/contact-messages"
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <ContactMessages />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/admin/contact-messages/:id"
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <ContactMessages />
                </RoleProtectedRoute>
              }
            />


            {/* =================================
                ADMIN INSTRUCTOR APPLICATIONS
            ================================= */}

            <Route
              path="/admin/instructor-applications"
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <AdminInstructorApplications />
                </RoleProtectedRoute>
              }
            />


            {/* =================================
                ADMIN PROFILE
            ================================= */}

            <Route
              path="/admin/profile"
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <Profile />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/admin/change-password"
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <AdminChangePassword />
                </RoleProtectedRoute>
              }
            />


            {/* =================================
                TEACHER
            ================================= */}

            <Route
              path="/teacher/dashboard"
              element={
                <RoleProtectedRoute allowedRoles={['teacher']}>
                  <TeacherDashboard />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/teacher/courses"
              element={
                <RoleProtectedRoute allowedRoles={['teacher']}>
                  <TeacherCourses />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/teacher/courses/create"
              element={
                <RoleProtectedRoute allowedRoles={['teacher']}>
                  <CourseForm />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/teacher/courses/edit/:id"
              element={
                <RoleProtectedRoute allowedRoles={['teacher']}>
                  <CourseForm />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/teacher/courses/:id/content"
              element={
                <RoleProtectedRoute allowedRoles={['teacher']}>
                  <ManageContent />
                </RoleProtectedRoute>
              }
            />


            {/* =================================
                TEACHER QUIZ
            ================================= */}

            <Route
              path="/teacher/courses/:id/chapters/:chapterId/quiz"
              element={
                <RoleProtectedRoute allowedRoles={['teacher']}>
                  <Quiz />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/teacher/quiz-results"
              element={
                <RoleProtectedRoute allowedRoles={['teacher']}>
                  <DashboardLayout>
                    <QuizResults />
                  </DashboardLayout>
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/teacher/quiz-results/:quizId/:studentId"
              element={
                <RoleProtectedRoute allowedRoles={['teacher']}>
                  <DashboardLayout>
                    <QuizResultDetails />
                  </DashboardLayout>
                </RoleProtectedRoute>
              }
            />


            {/* =================================
                TEACHER ENROLLMENTS
            ================================= */}

            <Route
              path="/teacher/enrollments"
              element={
                <RoleProtectedRoute allowedRoles={['teacher']}>
                  <TeacherEnrollments />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/teacher/change-password"
              element={
                <RoleProtectedRoute allowedRoles={['teacher']}>
                  <ChangePassword />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/teacher/profile"
              element={
                <RoleProtectedRoute allowedRoles={['teacher']}>
                  <TeacherProfile />
                </RoleProtectedRoute>
              }
            />


            {/* =================================
                STUDENT
            ================================= */}

            <Route
              path="/student/dashboard"
              element={
                <RoleProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/student/my-courses"
              element={
                <RoleProtectedRoute allowedRoles={['student']}>
                  <MyCourses />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/student/learn/:courseId"
              element={
                <RoleProtectedRoute allowedRoles={['student']}>
                  <LearningPage />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/student/quiz/:quizId"
              element={
                <RoleProtectedRoute allowedRoles={['student']}>
                  <StudentQuiz />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/student/reviews/:courseId"
              element={
                <RoleProtectedRoute allowedRoles={['student']}>
                  <Reviews />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/student/profile"
              element={
                <RoleProtectedRoute allowedRoles={['student']}>
                  <StudentProfile />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/student/change-password"
              element={
                <RoleProtectedRoute allowedRoles={['student']}>
                  <StudentChangePassword />
                </RoleProtectedRoute>
              }
            />


            {/* =================================
                SUPPORT
            ================================= */}

            <Route
              path="/help"
              element={<HelpCenter />}
            />

            <Route
              path="/privacy-policy"
              element={<PrivacyPolicy />}
            />

            <Route
              path="/terms-conditions"
              element={<TermsConditions />}
            />


            {/* =================================
                BECOME INSTRUCTOR
            ================================= */}

            <Route
              path="/become-instructor"
              element={<BecomeInstructor />}
            />

            <Route
              path="/become-instructor/apply"
              element={<InstructorApplication />}
            />


            {/* =================================
                CONTACT
            ================================= */}

            <Route
              path="/contact-us"
              element={<ContactUs />}
            />


            {/* =================================
                404
            ================================= */}

            <Route
              path="*"
              element={
                <Navigate
                  to="/"
                  replace
                />
              }
            />

          </Routes>

        </BrowserRouter>

      </AuthProvider>

    </ThemeProvider>

  );
}


export default App;