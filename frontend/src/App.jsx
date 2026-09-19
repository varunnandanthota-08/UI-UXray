import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import StudentLayout from './components/student/StudentLayout';

// Student Pages
import Login from './pages/student/Login';
import Dashboard from './pages/student/Dashboard';
import Courses from './pages/student/Courses';
import CourseDetails from './pages/student/CourseDetails';
import UnitDetails from './pages/student/UnitDetails';
import AssignmentDetails from './pages/student/AssignmentDetails';
import SubmitAssignment from './pages/student/SubmitAssignment';
import Submissions from './pages/student/Submissions';
import SubmissionDetails from './pages/student/SubmissionDetails';
import EvaluationDetails from './pages/student/EvaluationDetails';
import ReEvaluation from './pages/student/ReEvaluation';
import Profile from './pages/student/Profile';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Student Auth */}
          <Route path="/student/login" element={<Login />} />

          {/* Student Journey Shell */}
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Profile Route */}
            <Route path="profile" element={<Profile />} />

            {/* Courses & Units */}
            <Route path="courses" element={<Courses />} />
            <Route path="courses/:courseId" element={<CourseDetails />} />
            <Route path="units/:unitId" element={<UnitDetails />} />

            {/* Assignments & Submissions */}
            <Route path="assignments/:assignmentId" element={<AssignmentDetails />} />
            <Route path="assignments/:assignmentId/submit" element={<SubmitAssignment />} />

            {/* Submissions Tracking & Status */}
            <Route path="submissions" element={<Submissions />} />
            <Route path="submissions/:submissionId" element={<SubmissionDetails />} />

            {/* Evaluations & Re-evaluation */}
            <Route path="evaluations/:evaluationId" element={<EvaluationDetails />} />
            <Route path="re-evaluation/:evaluationId" element={<ReEvaluation />} />
          </Route>

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
