import { Check, Circle, Info } from 'lucide-react';
import Badge from '../ui/Badge';

export const SubmissionChecklist = ({
  requirements = [],
  completedRequirements = [],
  incompleteRequirements = []
}) => {
  const total = requirements.length || (completedRequirements.length + incompleteRequirements.length);
  const completedCount = completedRequirements.length;
  const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const hasIncomplete = incompleteRequirements.length > 0;

  return (
    <div className="bg-white rounded-3xl border border-brand-border p-6 shadow-soft space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-brand-border">
        <div>
          <h4 className="text-sm font-bold text-brand-text-primary tracking-tight">
            Submission Progress & Checklist
          </h4>
          <p className="text-xs text-brand-text-secondary mt-0.5">
            Deliverable completion breakdown.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={percentage === 100 ? 'success' : percentage >= 50 ? 'yellow' : 'neutral'} size="md">
            {completedCount} / {total} Completed ({percentage}%)
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full bg-[#EFEFEA] h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-brand-yellow h-full rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Completed Requirements List */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-success">
          Completed ({completedRequirements.length})
        </span>
        <div className="space-y-1.5">
          {completedRequirements.length > 0 ? (
            completedRequirements.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 bg-brand-success-bg/40 border border-emerald-200/60 rounded-xl text-xs text-brand-text-primary"
              >
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-brand-success text-white flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                  <span className="font-semibold text-brand-text-primary">{item}</span>
                </div>
                <span className="text-[10px] text-brand-success font-bold uppercase">Ready</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-brand-text-secondary italic">No requirements marked complete yet.</p>
          )}
        </div>
      </div>

      {/* Incomplete Requirements List */}
      {hasIncomplete && (
        <div className="space-y-2 pt-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-warning">
            Incomplete ({incompleteRequirements.length})
          </span>
          <div className="space-y-1.5">
            {incompleteRequirements.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 bg-[#FFFDF7] border border-amber-200/70 rounded-xl text-xs text-brand-text-secondary"
              >
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border border-brand-text-secondary text-brand-text-secondary flex items-center justify-center shrink-0">
                    <Circle className="w-2.5 h-2.5" />
                  </span>
                  <span className="font-medium text-brand-text-primary">{item}</span>
                </div>
                <span className="text-[10px] text-brand-warning font-semibold uppercase">Incomplete</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Partial Submission Encouragement Banner */}
      {hasIncomplete ? (
        <div className="p-3.5 bg-brand-yellow-light/50 border border-amber-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-brand-text-primary">
          <Info className="w-4 h-4 text-[#946F00] shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-[#946F00]">Partial Submission Allowed</p>
            <p className="text-brand-text-secondary mt-0.5 leading-relaxed">
              Your submission can be submitted with incomplete items. Incomplete requirements may affect the final evaluation.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3.5 bg-brand-success-bg/60 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-brand-success font-semibold">
          <Check className="w-4 h-4 shrink-0" />
          <span>All assignment requirements completed! Ready for review.</span>
        </div>
      )}
    </div>
  );
};

export default SubmissionChecklist;
