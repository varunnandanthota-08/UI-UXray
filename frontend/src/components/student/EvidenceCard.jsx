import React from 'react';
import { ExternalLink, Check, AlertTriangle, FileCode } from 'lucide-react';

export const EvidenceCard = ({
  criterionTitle,
  score,
  maxScore,
  evidence,
  onViewSubmission
}) => {
  if (!evidence || !evidence.available) {
    return (
      <div className="p-4 bg-brand-surface rounded-2xl border border-dashed border-brand-border text-xs text-brand-text-secondary flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-brand-text-secondary" />
          <span>{criterionTitle}</span>
        </div>
        <span className="italic">Evidence unavailable.</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-soft space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-brand-text-primary">
            {criterionTitle}
          </h4>
          <div className="flex items-center gap-3 text-xs text-brand-text-secondary mt-1">
            <span>Source: <strong className="text-brand-text-primary font-medium">{evidence.source || 'Figma Frame'}</strong></span>
            <span>•</span>
            <span>Component: <strong className="text-brand-text-primary font-medium">{evidence.component || 'General Element'}</strong></span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-sm font-extrabold text-brand-blue">
            {score}
          </span>
          <span className="text-xs text-brand-text-secondary font-medium">
            {' '}/ {maxScore}
          </span>
        </div>
      </div>

      {/* Observations */}
      <div className="space-y-1.5 pt-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-brand-text-secondary">
          Observed Evidence:
        </p>
        <div className="space-y-1.5">
          {evidence.observations?.map((obs, i) => {
            const isWarning = obs.startsWith('⚠') || obs.toLowerCase().includes('lacks') || obs.toLowerCase().includes('differs');
            return (
              <div
                key={i}
                className={`text-xs px-3 py-2 rounded-xl border flex items-start gap-2 ${
                  isWarning
                    ? 'bg-brand-warning-bg/40 border-amber-200/60 text-brand-text-primary'
                    : 'bg-[#F9FAF9] border-emerald-100 text-brand-text-primary'
                }`}
              >
                {isWarning ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-brand-warning shrink-0 mt-0.5" />
                ) : (
                  <Check className="w-3.5 h-3.5 text-brand-success shrink-0 mt-0.5" />
                )}
                <span>{obs.replace(/^[✓⚠]\s*/, '')}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={onViewSubmission}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-blue hover:text-brand-blue-dark py-1 px-2.5 rounded-lg hover:bg-brand-blue-light transition-colors"
        >
          <span>View Submission Frame</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default EvidenceCard;
