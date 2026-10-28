import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StudentNavbar from './StudentNavbar';
import StudentSidebar from './StudentSidebar';
import StudentMobileNav from './StudentMobileNav';

export const StudentLayout = () => {
  const { student, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-yellow flex items-center justify-center font-black text-brand-text-primary text-lg shadow-sm animate-pulse">
            B
          </div>
          <span className="text-xs font-semibold text-brand-text-secondary">Loading student session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !student) {
    return <Navigate to="/login?role=student" replace />;
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans md:h-screen md:overflow-hidden">
      {/* Top Navbar */}
      <StudentNavbar />

      <div className="flex-1 flex w-full max-w-7xl mx-auto min-h-0 overflow-hidden">
        {/* Desktop Sidebar */}
        <StudentSidebar />

        {/* Main Content Area matching Facilitator content rhythm */}
        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-12 min-w-0 md:overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Navigation */}
      <StudentMobileNav />
    </div>
  );
};

export default StudentLayout;
