import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  SendHorizontal, 
  Award, 
  User 
} from 'lucide-react';

export const StudentMobileNav = () => {
  const items = [
    { label: 'Home', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Courses', path: '/student/courses', icon: BookOpen },
    { label: 'Submit', path: '/student/assignments/asg-4/submit', icon: SendHorizontal, highlight: true },
    { label: 'Results', path: '/student/submissions', icon: Award },
    { label: 'Profile', path: '/student/profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-brand-border px-2 py-1.5 flex items-center justify-around">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-medium transition-colors ${
                item.highlight
                  ? 'text-brand-text-primary -mt-3'
                  : isActive
                  ? 'text-brand-blue font-bold'
                  : 'text-brand-text-secondary hover:text-brand-text-primary'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {item.highlight ? (
                  <div className="w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center shadow-md mb-0.5 text-brand-text-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                ) : (
                  <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                )}
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default StudentMobileNav;
