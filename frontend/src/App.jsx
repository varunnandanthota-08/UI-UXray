import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FacilitatorAuthProvider } from './context/FacilitatorAuthContext';

// Common Auth Pages
import CommonLogin from './pages/auth/Login';
import CommonSignup from './pages/auth/Signup';

// Student Layout & Pages
import StudentLayout from './components/student/StudentLayout';
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

// Facilitator Layout & Pages
import FacilitatorLayout from './components/facilitator/FacilitatorLayout';
import FacilitatorDashboard from './pages/facilitator/FacilitatorDashboard';
import FacilitatorAssignments from './pages/facilitator/FacilitatorAssignments';
import FacilitatorRubrics from './pages/facilitator/FacilitatorRubrics';
import FacilitatorSubmissions from './pages/facilitator/FacilitatorSubmissions';
import FacilitatorEvaluations from './pages/facilitator/FacilitatorEvaluations';
import FacilitatorReEvaluation from './pages/facilitator/FacilitatorReEvaluation';
import FacilitatorBatchEvaluation from './pages/facilitator/FacilitatorBatchEvaluation';
import FacilitatorAnalytics from './pages/facilitator/FacilitatorAnalytics';
import FacilitatorSettings from './pages/facilitator/FacilitatorSettings';

function App() {
  return (
    <AuthProvider>
      <FacilitatorAuthProvider>
        <BrowserRouter>
          <Routes>
            {/* ============================================================ */}
            {/* COMMON AUTHENTICATION (STUDENT & FACILITATOR)                */}
            {/* ============================================================ */}
            <Route path="/login" element={<CommonLogin />} />
            <Route path="/signup" element={<CommonSignup />} />

            {/* PRESERVE LEGACY LOGIN ROUTES WITH REDIRECTION               */}
            <Route path="/student/login" element={<Navigate to="/login?role=student" replace />} />
            <Route path="/facilitator/login" element={<Navigate to="/login?role=facilitator" replace />} />

            {/* ============================================================ */}
            {/* STUDENT ROUTE SPACE                                          */}
            {/* ============================================================ */}
            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<Navigate to="/student/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
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

              {/* Student 404 safety */}
              <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
            </Route>

            {/* ============================================================ */}
            {/* FACILITATOR ROUTE SPACE                                      */}
            {/* ============================================================ */}
            <Route path="/facilitator" element={<FacilitatorLayout />}>
              <Route index element={<Navigate to="/facilitator/dashboard" replace />} />
              <Route path="dashboard" element={<FacilitatorDashboard />} />
              <Route path="assignments" element={<FacilitatorAssignments />} />
              <Route path="submissions" element={<FacilitatorSubmissions />} />
              <Route path="rubrics" element={<FacilitatorRubrics />} />
              <Route path="evaluations" element={<FacilitatorEvaluations />} />
              <Route path="evaluations/re-evaluation/:submissionId" element={<FacilitatorReEvaluation />} />
              <Route path="batch-evaluation" element={<FacilitatorBatchEvaluation />} />
              <Route path="analytics" element={<FacilitatorAnalytics />} />
              <Route path="settings" element={<FacilitatorSettings />} />

              {/* Facilitator 404 safety */}
              <Route path="*" element={<Navigate to="/facilitator/dashboard" replace />} />
            </Route>

            {/* Root / Default fallback */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </FacilitatorAuthProvider>
    </AuthProvider>
  );
}

export default App;
