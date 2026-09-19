import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFacilitatorAuth } from '../../context/FacilitatorAuthContext';
import { 
  HelpCircle, 
  LogOut, 
  ChevronDown, 
  Settings, 
  LayoutDashboard,
  BarChart3,
  Bell,
  ArrowUpRight
} from 'lucide-react';

export const FacilitatorNavbar = () => {
  const { facilitator, logout } = useFacilitatorAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login?role=facilitator');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-brand-border h-16 shrink-0">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 h-full flex items-center justify-between">
        {/* Left: Barabari Branding & Facilitator Badge */}
        <div className="flex items-center gap-4 md:gap-6">
          <Link to="/facilitator/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-brand-yellow flex items-center justify-center font-bold text-brand-text-primary text-lg shadow-sm group-hover:scale-105 transition-transform">
              B
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-brand-blue leading-none">
                Barabari LMS
              </span>
              <span className="text-[11px] font-medium text-brand-text-secondary mt-0.5">
                Facilitator Portal
              </span>
            </div>
          </Link>

          {/* Active Cohort Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-brand-yellow-light/70 rounded-full border border-amber-200/80 text-xs text-[#946F00] font-semibold">
            <span className="w-2 h-2 rounded-full bg-brand-yellow" />
            <span>Cohort 4 • UI/UX Product Design</span>
          </div>
        </div>

        {/* Right: Actions, Notifications & Facilitator Identity */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Switch to Student Portal View */}
          <Link
            to="/student/dashboard"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-blue hover:text-brand-blue-dark hover:bg-brand-blue-light/60 rounded-xl transition-colors border border-brand-blue/20"
            title="Preview student-facing experience"
          >
            <span>Student View</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          {/* Help / Facilitator Guide Link */}
          <a
            href="https://barabaricollective.in"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-brand-text-secondary hover:text-brand-text-primary hover:bg-[#F7F7F4] rounded-lg transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-brand-text-secondary" />
            <span>Facilitator Guide</span>
          </a>

          {/* Notifications Indicator */}
          <div className="relative">
            <button
              className="p-2 rounded-xl text-brand-text-secondary hover:text-brand-text-primary hover:bg-[#F7F7F4] transition-colors relative"
              title="Studio Notifications"
              aria-label="Studio Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-warning rounded-full ring-2 ring-white" />
            </button>
          </div>

          {/* Separator */}
          <div className="h-6 w-px bg-brand-border hidden sm:block" />

          {/* Facilitator Identity Dropdown */}
          {facilitator ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 p-1 pl-2.5 rounded-full hover:bg-[#F7F7F4] border border-transparent hover:border-brand-border transition-all focus:outline-none"
                aria-expanded={dropdownOpen}
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-brand-text-primary leading-tight">
                    {facilitator.name}
                  </p>
                  <p className="text-[10px] text-brand-text-secondary font-medium">
                    {facilitator.role || 'Lead Facilitator'}
                  </p>
                </div>
                <img
                  src={facilitator.avatar}
                  alt={facilitator.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-yellow"
                />
                <ChevronDown className={`w-3.5 h-3.5 text-brand-text-secondary transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-card border border-brand-border py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-brand-border">
                      <p className="text-xs font-semibold text-brand-text-primary">
                        {facilitator.name}
                      </p>
                      <p className="text-[11px] text-brand-text-secondary truncate mt-0.5">
                        {facilitator.email}
                      </p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 bg-brand-yellow-light text-[#946F00] text-[10px] font-bold rounded-full uppercase tracking-wider">
                        {facilitator.facilitatorId || 'FAC-2026-001'}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/facilitator/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-brand-text-secondary hover:text-brand-text-primary hover:bg-[#F7F7F4]"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Mentor Dashboard</span>
                      </Link>
                      <Link
                        to="/facilitator/analytics"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-brand-text-secondary hover:text-brand-text-primary hover:bg-[#F7F7F4]"
                      >
                        <BarChart3 className="w-4 h-4" />
                        <span>Analytics & Insights</span>
                      </Link>
                      <Link
                        to="/facilitator/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-brand-text-secondary hover:text-brand-text-primary hover:bg-[#F7F7F4]"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Profile & Studio Settings</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-brand-border">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-brand-error hover:bg-brand-error-bg transition-colors font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/login?role=facilitator"
              className="text-xs font-semibold px-4 py-2 bg-brand-yellow text-brand-text-primary rounded-xl hover:bg-brand-yellow-hover transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default FacilitatorNavbar;
