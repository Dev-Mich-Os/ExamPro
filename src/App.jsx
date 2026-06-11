import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Spinner } from './components/shared';

// Auth
import { LoginPage, RegisterPage } from './pages/auth/AuthPages';

// Instructor
import { InstructorDashboard } from './pages/instructor/InstructorDashboard';
import { CoursesPage } from './pages/instructor/CoursesPage';
import { ExamsPage } from './pages/instructor/ExamsPage';
import { QuestionBankPage } from './pages/instructor/QuestionBankPage';
import { ExamBuilderPage } from './pages/instructor/ExamBuilderPage';
import { ResultsPage } from './pages/instructor/ResultsPage';

// Student
import { StudentDashboard } from './pages/student/StudentDashboard';
import { ExamTakerPage } from './pages/student/ExamTakerPage';
import { ExamResultPage, ResultsHistoryPage } from './pages/student/ResultPages';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <Spinner />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'instructor' ? '/instructor' : '/student'} replace />;
  return children;
};

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><Spinner /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'instructor' ? '/instructor' : '/student'} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Instructor Routes */}
          <Route path="/instructor" element={
            <ProtectedRoute role="instructor"><InstructorDashboard /></ProtectedRoute>
          } />
          <Route path="/instructor/courses" element={
            <ProtectedRoute role="instructor"><CoursesPage /></ProtectedRoute>
          } />
          <Route path="/instructor/exams" element={
            <ProtectedRoute role="instructor"><ExamsPage /></ProtectedRoute>
          } />
          <Route path="/instructor/questions" element={
            <ProtectedRoute role="instructor"><QuestionBankPage /></ProtectedRoute>
          } />
          <Route path="/instructor/exam-builder/:examId" element={
            <ProtectedRoute role="instructor"><ExamBuilderPage /></ProtectedRoute>
          } />
          <Route path="/instructor/results" element={
            <ProtectedRoute role="instructor"><ResultsPage /></ProtectedRoute>
          } />

          {/* Student Routes */}
          <Route path="/student" element={
            <ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>
          } />
          <Route path="/student/exam/:examId" element={
            <ProtectedRoute role="student"><ExamTakerPage /></ProtectedRoute>
          } />
          <Route path="/student/results/:attemptId" element={
            <ProtectedRoute role="student"><ExamResultPage /></ProtectedRoute>
          } />
          <Route path="/student/history" element={
            <ProtectedRoute role="student"><ResultsHistoryPage /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
