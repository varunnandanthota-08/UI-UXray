import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Compass, 
  HelpCircle, 
  LogOut, 
  ChevronDown, 
  Sparkles,
  User
} from 'lucide-react';

export const StudentNavbar = () => {
  const { student, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/student/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-brand-border h-16">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 h-full flex items-center justify-between">
        {/* Brand Identity */}
        <div className="flex items-center gap-4 md:gap-6">
          <Link to="/student/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-brand-yellow flex items-center justify-center font-bold text-brand-text-primary text-lg shadow-sm group-hover:scale-105 transition-transform">
              B
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-brand-blue leading-none">
                Barabari LMS
              </span>
              <span className="text-[11px] font-medium text-brand-text-secondary mt-0.5">
                Barabari Collective
              </span>
            </div>
          </Link>

          {/* Active Cohort pill on desktop */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-brand-blue-light/70 rounded-full border border-brand-blue/15 text-xs text-brand-blue font-medium">
            <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
            <span>Cohort 4 • UI/UX Product Design</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Help / Design Guide Link */}
          <a 
            href="https://barabaricollective.in" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-text-secondary hover:text-brand-text-primary hover:bg-[#F7F7F4] rounded-lg transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-brand-text-secondary" />
            <span>Help / Design Guide</span>
          </a>

          {/* Separator */}
          <div className="h-6 w-px bg-brand-border hidden sm:block" />

          {/* Profile Dropdown */}
          {student ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-full hover:bg-[#F7F7F4] border border-transparent hover:border-brand-border transition-all focus:outline-none"
                aria-expanded={dropdownOpen}
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-brand-text-primary leading-tight">
                    {student.name}
                  </p>
                  <p className="text-[10px] text-brand-text-secondary font-medium">
                    {student.studentId || 'BC-2026-088'}
                  </p>
                </div>
                <img
                  src={student.avatar}
                  alt={student.name}
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
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-card border border-brand-border py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2.5 border-b border-brand-border">
                    <p className="text-xs font-semibold text-brand-text-primary">
                      {student.name}
                    </p>
                    <p className="text-[11px] text-brand-text-secondary truncate mt-0.5">
                      {student.email}
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/student/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-brand-text-secondary hover:text-brand-text-primary hover:bg-[#F7F7F4]"
                    >
                      <Compass className="w-4 h-4" />
                      <span>Student Dashboard</span>
                    </Link>
                    <Link
                      to="/student/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-brand-text-secondary hover:text-brand-text-primary hover:bg-[#F7F7F4]"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile Settings</span>
                    </Link>
                    <Link
                      to="/student/submissions"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-brand-text-secondary hover:text-brand-text-primary hover:bg-[#F7F7F4]"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>My Submissions & Scores</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-brand-border">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-brand-error hover:bg-brand-error-bg transition-colors"
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
            to="/student/login"
            className="text-xs font-semibold px-4 py-2 bg-brand-yellow text-brand-text-primary rounded-xl hover:bg-brand-yellow-hover transition-colors"
          >
            Student Login
          </Link>
        )}
        </div>
      </div>
    </header>
  );
};

export default StudentNavbar;
