import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

export const UnitProgressTimeline = ({ units = [] }) => {
  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-brand-text-primary uppercase tracking-wider">
          Learning Progress (Connected Units)
        </h4>
        <span className="text-[11px] text-brand-text-secondary">
          Click unit to inspect
        </span>
      </div>

      {/* Horizontal / Responsive Connected Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5">
        {units.map((u, idx) => {
          const isDone = u.status === 'COMPLETED';
          const isCurrent = u.status === 'CURRENT' || u.status === 'IN_PROGRESS';

          return (
            <Link
              key={u.id || idx}
              to={`/student/units/${u.id}`}
              className={`p-2.5 sm:p-3 rounded-2xl border text-center transition-all hover:scale-[1.02] flex flex-col justify-between h-[116px] min-w-0 overflow-hidden shadow-2xs group ${
                isDone
                  ? 'bg-emerald-50/50 border-emerald-200/90 text-brand-text-primary hover:border-emerald-300'
                  : isCurrent
                  ? 'bg-brand-yellow-light/70 border-amber-300 ring-2 ring-brand-yellow/60 text-brand-text-primary shadow-xs'
                  : 'bg-[#FBFBFA] border-brand-border text-brand-text-secondary hover:bg-white hover:border-brand-border/80'
              }`}
            >
              {/* Unit Number & Status Icon Header */}
              <div className="flex items-center justify-between w-full text-[10px] font-bold text-brand-text-secondary pb-1 border-b border-black/[0.04]">
                <span className="font-mono text-[10px] text-brand-text-secondary tracking-tight">
                  Unit 0{u.unitNumber}
                </span>
                <span className="flex items-center justify-center w-4 h-4 rounded-full">
                  {isDone ? (
                    <Check className="w-3.5 h-3.5 text-brand-success stroke-[2.5]" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-brand-yellow ring-2 ring-brand-yellow/40" />
                  ) : (
                    <span className="w-2 h-2 rounded-full border border-brand-border bg-white" />
                  )}
                </span>
              </div>

              {/* Centered Title with 2-line clamp & boundary protection */}
              <div className="my-auto py-1 px-0.5 w-full flex items-center justify-center min-h-0">
                <span 
                  className="text-xs font-bold text-brand-text-primary line-clamp-2 leading-tight break-words text-center group-hover:text-brand-blue transition-colors"
                  title={u.shortTitle || u.title}
                >
                  {u.shortTitle || u.title}
                </span>
              </div>

              {/* Status Footer */}
              <div className="w-full pt-1 border-t border-black/[0.04]">
                <span
                  className={`text-[9.5px] font-bold uppercase tracking-wider block text-center truncate ${
                    isDone
                      ? 'text-brand-success'
                      : isCurrent
                      ? 'text-[#946F00]'
                      : 'text-brand-text-secondary'
                  }`}
                >
                  {isDone ? 'Completed' : isCurrent ? 'Current' : 'Upcoming'}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default UnitProgressTimeline;
