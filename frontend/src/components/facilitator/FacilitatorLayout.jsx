import React from 'react';
import { Outlet } from 'react-router-dom';
import FacilitatorNavbar from './FacilitatorNavbar';
import FacilitatorSidebar from './FacilitatorSidebar';
import FacilitatorMobileNav from './FacilitatorMobileNav';

export const FacilitatorLayout = () => {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans md:h-screen md:overflow-hidden">
      {/* Top Facilitator Navbar */}
      <FacilitatorNavbar />

      <div className="flex-1 flex w-full max-w-7xl mx-auto min-h-0 overflow-hidden">
        {/* Desktop Facilitator Sidebar */}
        <FacilitatorSidebar />

        {/* Main Facilitator Content Area */}
        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-12 min-w-0 md:overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <FacilitatorMobileNav />
    </div>
  );
};

export default FacilitatorLayout;
