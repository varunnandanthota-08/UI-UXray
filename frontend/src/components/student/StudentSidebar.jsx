import React, { useState, useEffect } from 'react';
import studentApi, { resolveAssignmentAction } from '../../api/studentApi';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileEdit, 
  SendHorizontal, 
  HelpCircle,
  Sparkles,
  User
} from 'lucide-react';

export const StudentSidebar = () => {
  const [submissions, setSubmissions] = useState([]);
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    studentApi.getStudentSubmissions().then((res) => {
      setSubmissions(res.data || []);
    }).catch(() => {});
    studentApi.getDraft('asg-4').then((res) => {
      setDraft(res?.data || null);
    }).catch(() => {});
  }, []);

  const action = resolveAssignmentAction({
    assignmentId: 'asg-4',
    submissions,
    draft
  });

  const sidebarButtonLabel = action.isEvaluated
    ? 'View Evaluation →'
    : action.isSubmitted
    ? 'View Submission →'
    : action.hasDraft
    ? 'Continue Work →'
    : 'Submit Work →';

  const navItems = [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'My Courses', path: '/student/courses', icon: BookOpen },
    { label: 'Current Assignment', path: '/student/assignments/asg-4', icon: FileEdit },
    { label: 'My Submissions', path: '/student/submissions', icon: SendHorizontal },
    { label: 'Profile', path: '/student/profile', icon: User },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-brand-border shrink-0 h-full overflow-y-auto p-4 justify-between">
      <div className="space-y-6">
        {/* Navigation Section */}
        <div className="space-y-1">
          <p className="px-3.5 text-[11px] font-bold uppercase tracking-wider text-brand-text-secondary mb-2.5">
            LEARNING JOURNEY
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

        {/* Current Active Assignment Card (Matches Facilitator compact card language) */}
        <div className="p-4 bg-white rounded-2xl border border-brand-border shadow-soft">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-blue uppercase tracking-wider mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-yellow" />
            <span>ACTIVE SPRINT</span>
          </div>
          <h4 className="text-xs font-bold text-brand-text-primary leading-snug">
            One Clickable Prototype with Motion
          </h4>
          <p className="text-[11px] text-brand-text-secondary mt-1">
            Due: 22 Sep 2026 • 20 Marks
          </p>
          <NavLink
            to={action.link}
            className="mt-3.5 w-full flex items-center justify-center text-xs font-semibold py-2 px-3 bg-brand-yellow text-brand-text-primary hover:bg-brand-yellow-hover rounded-xl shadow-sm transition-all"
          >
            {sidebarButtonLabel}
          </NavLink>
        </div>
      </div>

      {/* Facilitator Support Card */}
      <div className="pt-4 border-t border-brand-border">
        <div className="p-3 bg-[#F7F7F4] rounded-xl flex items-start gap-2.5 border border-brand-border/60">
          <HelpCircle className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
          <div className="text-[11px] leading-tight">
            <p className="font-semibold text-brand-text-primary">Need rubric clarity?</p>
            <p className="text-brand-text-secondary mt-0.5">
              Contact your lead mentor Rohan during studio hours.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default StudentSidebar;
