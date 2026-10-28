import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useFacilitatorAuth } from '../../context/FacilitatorAuthContext';
import FacilitatorNavbar from './FacilitatorNavbar';
import FacilitatorSidebar from './FacilitatorSidebar';
import FacilitatorMobileNav from './FacilitatorMobileNav';

export const FacilitatorLayout = () => {
  const { facilitator, isAuthenticated, loading } = useFacilitatorAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-yellow flex items-center justify-center font-black text-brand-text-primary text-lg shadow-sm animate-pulse">
            B
          </div>
          <span className="text-xs font-semibold text-brand-text-secondary">Loading facilitator session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !facilitator) {
    return <Navigate to="/login?role=facilitator" replace />;
  }

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
