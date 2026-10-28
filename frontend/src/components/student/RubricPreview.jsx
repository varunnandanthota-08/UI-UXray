import React from 'react';
import { Award, ShieldCheck, X } from 'lucide-react';
import Badge from '../ui/Badge';

export const RubricPreview = ({ rubric = [], isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl border border-brand-border shadow-card max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rubric-modal-title"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-brand-border flex items-center justify-between bg-[#FFFDF7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-blue-light text-brand-blue flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 id="rubric-modal-title" className="text-base font-bold text-brand-text-primary">
                Evaluation Rubric
              </h3>
              <p className="text-xs text-brand-text-secondary mt-0.5">
                Criteria & Performance Expectations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-brand-text-secondary hover:text-brand-text-primary hover:bg-[#F7F7F4] rounded-full transition-colors focus:outline-none"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-3 bg-brand-blue-light/50 border border-brand-blue/15 rounded-xl flex items-start gap-2.5 text-xs text-brand-blue">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Facilitators evaluate your submission against these criteria. As a student, you have transparent read-only access to understand expectations prior to submitting.
            </span>
          </div>

          <div className="divide-y divide-brand-border/60">
            {rubric.map((criterion, idx) => (
              <div key={criterion.id || idx} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                <div className="space-y-1 w-full">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-brand-blue">
                        0{idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-brand-text-primary">
                        {criterion.name || criterion.title}
                      </h4>
                    </div>
                    <Badge variant="neutral" size="sm">
                      Core Criterion
                    </Badge>
                  </div>
                  <p className="text-xs text-brand-text-secondary leading-relaxed pl-6">
                    {criterion.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-brand-border bg-[#F7F7F4] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-brand-blue text-white rounded-xl text-xs font-semibold hover:bg-brand-blue-dark transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

export default RubricPreview;
