import React from 'react';
import { Navigate } from 'react-router-dom';
import { useFacilitatorAuth } from '../../context/FacilitatorAuthContext';

/**
 * Route guard component for facilitator routes.
 * Redirects unauthenticated users to the facilitator login page.
 */
export const FacilitatorRoute = ({ children }) => {
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

  return children;
};

export default FacilitatorRoute;

