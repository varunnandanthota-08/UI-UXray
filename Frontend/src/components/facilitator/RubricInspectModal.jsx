import React, { useEffect } from 'react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { 
  X, 
  Award, 
  CheckCircle2, 
  Edit3, 
  Layers,
  Info,
  Calendar,
  Sliders,
  FileText
} from 'lucide-react';

export const RubricInspectModal = ({
  isOpen,
  onClose,
  rubric,
  onEdit
}) => {
  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !rubric) return null;

  const criteria = rubric.criteria || [];
  const totalAllocatedMarks = criteria.reduce((sum, c) => sum + (Number(c.marks) || 0), 0);

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl border border-brand-border shadow-2xl w-full max-w-3xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-brand-border flex items-start justify-between bg-[#FCFCFA]">
          <div className="space-y-1.5 pr-4">
            {/* Hierarchy linkage */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-brand-text-secondary">
              <span className="text-brand-blue bg-brand-blue-light/80 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Layers className="w-3 h-3" />
                {rubric.courseTitle || 'UI/UX Product Design'}
              </span>
              <span>›</span>
              <span className="text-brand-text-primary font-semibold">
                {rubric.unitTitle || 'Unit'}
              </span>
              <span>›</span>
              <span className="text-brand-text-secondary">
                {rubric.assignmentTitle || 'Linked Assignment'}
              </span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <h2 className="text-xl font-bold text-brand-text-primary tracking-tight">
                {rubric.title}
              </h2>
              <Badge 
                variant={rubric.status === 'PUBLISHED' ? 'success' : 'default'}
                className="font-bold text-[11px]"
              >
                {rubric.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT'}
              </Badge>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-brand-text-secondary hover:text-brand-text-primary hover:bg-[#F0F0EB] transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Facilitator Notice */}
          <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200/80 flex items-center gap-3">
            <Info className="w-4 h-4 text-brand-blue shrink-0" />
            <p className="text-[11px] text-brand-blue font-medium leading-relaxed">
              <strong>Human-Controlled Evaluation:</strong> This rubric establishes the facilitator grading rubric. Final marks are determined by human evaluators, with AI assistance strictly advisory.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-[#FBFBFA] rounded-2xl border border-brand-border">
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-text-secondary block">
                Total Marks
              </span>
              <span className="text-base font-bold text-brand-text-primary flex items-center gap-1.5 mt-1">
                <Award className="w-4 h-4 text-brand-blue" />
                {rubric.totalMarks || totalAllocatedMarks} pts
              </span>
            </div>

            <div className="p-3.5 bg-[#FBFBFA] rounded-2xl border border-brand-border">
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-text-secondary block">
                Criteria Count
              </span>
              <span className="text-base font-bold text-brand-text-primary flex items-center gap-1.5 mt-1">
                <Sliders className="w-4 h-4 text-emerald-600" />
                {criteria.length} Criteria
              </span>
            </div>

            <div className="p-3.5 bg-[#FBFBFA] rounded-2xl border border-brand-border">
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-text-secondary block">
                Reconciliation
              </span>
              <span className="text-base font-bold text-emerald-600 flex items-center gap-1.5 mt-1">
                <CheckCircle2 className="w-4 h-4" />
                100% Matched
              </span>
            </div>

            <div className="p-3.5 bg-[#FBFBFA] rounded-2xl border border-brand-border">
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-text-secondary block">
                Last Updated
              </span>
              <span className="text-xs font-semibold text-brand-text-primary flex items-center gap-1.5 mt-1">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                {rubric.lastUpdated || rubric.updatedAt || 'Recent'}
              </span>
            </div>
          </div>

          {/* Description */}
          {rubric.description && (
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-brand-text-secondary">
                Rubric Purpose & Evaluation Philosophy
              </h4>
              <p className="text-xs text-brand-text-primary bg-[#FBFBFA] p-4 rounded-2xl border border-brand-border leading-relaxed">
                {rubric.description}
              </p>
            </div>
          )}

          {/* Criteria Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-brand-text-primary flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-blue" />
                Evaluation Criteria & Scoring Breakdown ({criteria.length})
              </h3>
              <span className="text-[11px] text-brand-text-secondary">
                Cumulative: <strong>{totalAllocatedMarks} / {rubric.totalMarks || totalAllocatedMarks} marks</strong>
              </span>
            </div>

            <div className="space-y-4">
              {criteria.map((criterion, idx) => (
                <div 
                  key={criterion.id || idx}
                  className="p-5 bg-[#FCFCFA] rounded-2xl border border-brand-border space-y-4 hover:border-brand-border-strong transition-all shadow-2xs"
                >
                  {/* Criterion Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-brand-border/70">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-brand-blue-light text-brand-blue font-bold text-[11px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-brand-text-primary">
                          {criterion.name}
                        </h4>
                        {criterion.description && (
                          <p className="text-[11px] text-brand-text-secondary mt-0.5">
                            {criterion.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <Badge variant="blue" className="font-bold text-[10px]">
                        Weight: {criterion.weight || `${Math.round((criterion.marks / (rubric.totalMarks || 1)) * 100)}%`}
                      </Badge>
                      <span className="text-xs font-bold text-brand-blue bg-white border border-brand-border px-2.5 py-1 rounded-lg">
                        {criterion.marks} marks max
                      </span>
                    </div>
                  </div>

                  {/* Descriptors */}
                  {criterion.descriptors && criterion.descriptors.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary block">
                        Performance Levels & Scoring Anchors
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                        {criterion.descriptors.map((desc, dIdx) => {
                          const levelColors = {
                            Exemplary: 'bg-emerald-50/60 border-emerald-200 text-emerald-900',
                            Proficient: 'bg-blue-50/60 border-blue-200 text-blue-900',
                            Developing: 'bg-amber-50/60 border-amber-200 text-amber-900'
                          };
                          const badgeVariants = {
                            Exemplary: 'success',
                            Proficient: 'blue',
                            Developing: 'warning'
                          };

                          return (
                            <div 
                              key={dIdx}
                              className={`p-3 rounded-xl border ${levelColors[desc.level] || 'bg-white border-brand-border text-brand-text-primary'} flex flex-col justify-between space-y-2`}
                            >
                              <div className="flex items-center justify-between">
                                <Badge 
                                  variant={badgeVariants[desc.level] || 'default'} 
                                  className="text-[10px] font-bold"
                                >
                                  {desc.level}
                                </Badge>
                                <span className="text-[10px] font-bold opacity-80">
                                  {desc.scoreRange} pts
                                </span>
                              </div>
                              <p className="text-[11px] leading-relaxed font-medium">
                                {desc.text || 'No descriptor defined'}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-brand-border bg-[#FCFCFA] flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Edit3}
            iconPosition="left"
            onClick={() => {
              onClose();
              if (onEdit) onEdit(rubric);
            }}
          >
            Edit Rubric
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RubricInspectModal;
