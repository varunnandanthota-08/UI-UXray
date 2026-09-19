import React from 'react';
import { Outlet } from 'react-router-dom';
import StudentNavbar from './StudentNavbar';
import StudentSidebar from './StudentSidebar';
import StudentMobileNav from './StudentMobileNav';

export const StudentLayout = () => {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans">
      {/* Top Navbar */}
      <StudentNavbar />

      <div className="flex-1 flex w-full max-w-7xl mx-auto">
        {/* Desktop Sidebar */}
        <StudentSidebar />

        {/* Main Content Area matching Facilitator content rhythm */}
        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-12 min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile Navigation */}
      <StudentMobileNav />
    </div>
  );
};

export default StudentLayout;
