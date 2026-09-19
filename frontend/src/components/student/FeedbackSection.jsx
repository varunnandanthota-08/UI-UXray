import React from 'react';
import { CheckCircle2, ArrowRight, Info, Wrench, MessageSquare } from 'lucide-react';

export const FeedbackSection = ({ feedbackSections, facilitator }) => {
  if (!feedbackSections) return null;

  return (
    <div className="space-y-6">
      {/* What Went Well */}
      <div className="bg-white rounded-3xl border border-brand-border p-6 md:p-7 shadow-soft">
        <div className="flex items-center gap-2.5 mb-4 text-brand-success font-bold text-xs uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4" />
          <span>What Went Well</span>
        </div>
        <div className="space-y-2.5">
          {feedbackSections.whatWentWell?.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 text-xs md:text-sm text-brand-text-primary leading-relaxed">
              <span className="w-4 h-4 rounded-full bg-brand-success-bg text-brand-success flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                ✓
              </span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* What Needs Improvement + Why It Matters + Suggested Improvement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* What to Improve */}
        <div className="bg-white rounded-3xl border border-brand-border p-6 md:p-7 shadow-soft space-y-4">
          <div className="flex items-center gap-2 text-brand-warning font-bold text-xs uppercase tracking-wider">
            <ArrowRight className="w-4 h-4" />
            <span>What to Improve</span>
          </div>
          <div className="space-y-2.5">
            {feedbackSections.whatNeedsImprovement?.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-brand-text-primary leading-relaxed">
                <span className="text-brand-warning font-bold shrink-0 mt-0.5">→</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Why It Matters */}
        <div className="bg-white rounded-3xl border border-brand-border p-6 md:p-7 shadow-soft space-y-4">
          <div className="flex items-center gap-2 text-brand-blue font-bold text-xs uppercase tracking-wider">
            <Info className="w-4 h-4" />
            <span>Why It Matters</span>
          </div>
          <div className="space-y-2.5">
            {Array.isArray(feedbackSections.whyItMatters) ? (
              feedbackSections.whyItMatters.map((item, idx) => (
                <p key={idx} className="text-xs md:text-sm text-brand-text-secondary leading-relaxed">
                  {item}
                </p>
              ))
            ) : (
              <p className="text-xs md:text-sm text-brand-text-secondary leading-relaxed">
                {feedbackSections.whyItMatters}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Suggested Improvements */}
      {feedbackSections.suggestedImprovements && (
        <div className="bg-white rounded-3xl border border-brand-border p-6 md:p-7 shadow-soft space-y-4">
          <div className="flex items-center gap-2 text-[#946F00] font-bold text-xs uppercase tracking-wider">
            <Wrench className="w-4 h-4" />
            <span>Suggested Improvement Action</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {feedbackSections.suggestedImprovements.map((sugg, idx) => (
              <div key={idx} className="p-3.5 bg-brand-yellow-light/40 border border-amber-200/60 rounded-2xl text-xs text-brand-text-primary leading-relaxed flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-brand-yellow text-brand-text-primary flex items-center justify-center font-bold text-[11px] shrink-0">
                  {idx + 1}
                </span>
                <span>{sugg}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Facilitator Comments */}
      {feedbackSections.facilitatorComments && (
        <div className="bg-brand-blue-light/50 border border-brand-blue/20 rounded-3xl p-6 md:p-7 shadow-soft">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 text-brand-blue font-bold text-xs uppercase tracking-wider">
              <MessageSquare className="w-4 h-4" />
              <span>Facilitator Comments</span>
            </div>
            {facilitator && (
              <div className="flex items-center gap-2">
                <img
                  src={facilitator.avatar}
                  alt={facilitator.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="text-xs font-semibold text-brand-text-primary">
                  {facilitator.name}
                </span>
              </div>
            )}
          </div>
          <p className="text-sm text-brand-text-primary italic leading-relaxed bg-white/70 p-4 rounded-2xl border border-brand-border/60">
            "{feedbackSections.facilitatorComments}"
          </p>
        </div>
      )}
    </div>
  );
};

export default FeedbackSection;
