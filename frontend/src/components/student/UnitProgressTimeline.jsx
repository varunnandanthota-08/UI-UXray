import React from 'react';
import { Link } from 'react-router-dom';

export const UnitProgressTimeline = ({ units = [] }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-brand-text-primary uppercase tracking-wider">
          Learning Progress (Connected Units)
        </h4>
        <span className="text-[11px] text-brand-text-secondary">
          Click unit to inspect
        </span>
      </div>

      {/* Horizontal / Grid Connected Timeline */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {units.map((u, idx) => {
          const isDone = u.status === 'COMPLETED';
          const isCurrent = u.status === 'CURRENT' || u.status === 'IN_PROGRESS';

          return (
            <Link
              key={u.id || idx}
              to={`/student/units/${u.id}`}
              className={`p-3 rounded-2xl border text-center transition-all hover:scale-[1.02] flex flex-col items-center justify-between h-24 ${
                isDone
                  ? 'bg-brand-success-bg/30 border-emerald-200 text-brand-text-primary'
                  : isCurrent
                  ? 'bg-brand-yellow-light/60 border-amber-300 ring-2 ring-brand-yellow text-brand-text-primary'
                  : 'bg-[#F9FAF9] border-brand-border text-brand-text-secondary'
              }`}
            >
              <div className="flex items-center justify-between w-full text-[10px] font-bold text-brand-text-secondary">
                <span>0{u.unitNumber}</span>
                <span>
                  {isDone ? '✓' : isCurrent ? '●' : '○'}
                </span>
              </div>

              <div className="my-auto">
                <span className="text-xs font-bold block truncate max-w-[90px] text-brand-text-primary">
                  {u.shortTitle || u.title}
                </span>
              </div>

              <span
                className={`text-[9px] font-bold uppercase tracking-wider block ${
                  isDone
                    ? 'text-brand-success'
                    : isCurrent
                    ? 'text-[#946F00]'
                    : 'text-brand-text-secondary'
                }`}
              >
                {isDone ? 'Completed' : isCurrent ? 'Current' : 'Upcoming'}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default UnitProgressTimeline;
