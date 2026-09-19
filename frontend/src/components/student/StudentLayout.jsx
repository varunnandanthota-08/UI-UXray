import React from 'react';
import { Outlet } from 'react-router-dom';
import StudentNavbar from './StudentNavbar';
import StudentSidebar from './StudentSidebar';
import StudentMobileNav from './StudentMobileNav';

export const StudentLayout = () => {
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
