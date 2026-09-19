import React from 'react';
import Badge from '../ui/Badge';
import { Lightbulb } from 'lucide-react';

export const CriterionScore = ({ criterion }) => {
  const percentage = Math.round((criterion.score / criterion.maxScore) * 100);

  const getScoreBadge = () => {
    if (percentage >= 85) return { label: 'Exemplary', variant: 'success' };
    if (percentage >= 70) return { label: 'Proficient', variant: 'blue' };
    if (percentage >= 50) return { label: 'Developing', variant: 'yellow' };
    return { label: 'Needs Re-work', variant: 'error' };
  };

  const badge = getScoreBadge();

  return (
    <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-soft space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-brand-text-primary">
              {criterion.title}
            </h4>
            <Badge variant={badge.variant} size="sm">
              {badge.label}
            </Badge>
          </div>
          <p className="text-xs text-brand-text-secondary mt-1 leading-relaxed">
            {criterion.feedback}
          </p>
        </div>

        <div className="text-right shrink-0">
          <div className="text-base font-extrabold text-brand-blue leading-none">
            {criterion.score}{' '}
            <span className="text-xs font-medium text-brand-text-secondary">
              / {criterion.maxScore}
            </span>
          </div>
          <span className="text-[11px] font-semibold text-brand-text-secondary mt-0.5 block">
            {percentage}%
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-[#EFEFEA] h-2 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            percentage >= 80
              ? 'bg-brand-blue'
              : percentage >= 60
              ? 'bg-brand-yellow'
              : 'bg-brand-warning'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Actionable improvement tip */}
      {criterion.improvementSuggestion && (
        <div className="p-3 bg-brand-yellow-light/50 border border-amber-200/70 rounded-xl flex items-start gap-2.5 text-xs text-brand-text-primary">
          <Lightbulb className="w-4 h-4 text-[#946F00] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#946F00]">Targeted Action: </span>
            <span>{criterion.improvementSuggestion}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CriterionScore;
