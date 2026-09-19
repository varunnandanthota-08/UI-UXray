import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Inbox, 
  BookOpen, 
  Award, 
  Sparkles, 
  BarChart3,
  Settings,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

export const FacilitatorSidebar = () => {
  const navItems = [
    { label: 'Dashboard', path: '/facilitator/dashboard', icon: LayoutDashboard },
    { label: 'Assignments', path: '/facilitator/assignments', icon: FileText },
    { label: 'Submissions', path: '/facilitator/submissions', icon: Inbox },
    { label: 'Rubrics', path: '/facilitator/rubrics', icon: BookOpen },
    { label: 'Evaluations', path: '/facilitator/evaluations', icon: Award },
    { label: 'Batch Evaluation', path: '/facilitator/batch-evaluation', icon: Sparkles },
    { label: 'Analytics', path: '/facilitator/analytics', icon: BarChart3 },
    { label: 'Profile / Settings', path: '/facilitator/settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-brand-border shrink-0 h-full overflow-y-auto p-4 justify-between">
      <div className="space-y-6">
        {/* Navigation Section */}
        <div className="space-y-1">
          <p className="px-3.5 text-[11px] font-bold uppercase tracking-wider text-brand-text-secondary mb-2.5">
            FACILITATOR WORKSPACE
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-blue text-white shadow-sm font-semibold'
                      : 'text-brand-text-secondary hover:text-brand-text-primary hover:bg-[#F7F7F4]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Quick Review Queue Card */}
        <div className="p-4 bg-white rounded-2xl border border-brand-border shadow-soft">
          <div className="flex items-center justify-between gap-1 text-[10px] font-bold text-brand-blue uppercase tracking-wider mb-1.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-warning animate-pulse" />
              REVIEW QUEUE
            </span>
            <span className="text-[11px] font-black text-[#946F00] bg-brand-yellow-light px-2 py-0.5 rounded-full">
              8 Pending
            </span>
          </div>
          <h4 className="text-xs font-bold text-brand-text-primary leading-snug">
            Sprint 04: Clickable Prototype
          </h4>
          <p className="text-[11px] text-brand-text-secondary mt-1">
            Cutoff in 2 days • 18 submissions received
          </p>
          <NavLink
            to="/facilitator/submissions"
            className="mt-3.5 w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 bg-brand-yellow text-brand-text-primary hover:bg-brand-yellow-hover rounded-xl shadow-sm transition-all"
          >
            <span>Review Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>
      </div>

      {/* Facilitator Studio Guide at Bottom */}
      <div className="pt-4 border-t border-brand-border">
        <div className="p-3 bg-[#F7F7F4] rounded-xl flex items-start gap-2.5 border border-brand-border/60">
          <HelpCircle className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
          <div className="text-[11px] leading-tight">
            <p className="font-semibold text-brand-text-primary">Studio Assessment Rigor</p>
            <p className="text-brand-text-secondary mt-0.5">
              Grade based on clear rubric criteria. AI assists drafting but mentors finalize scoring.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default FacilitatorSidebar;
