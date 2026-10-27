import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { 
  X, 
  Calendar, 
  Award, 
  CheckCircle2, 
  Edit3, 
  Inbox, 
  Layers,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export const AssignmentSpecsModal = ({
  isOpen,
  onClose,
  assignment,
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

  if (!isOpen || !assignment) return null;

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl border border-brand-border shadow-2xl w-full max-w-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-brand-border flex items-center justify-between bg-[#FCFCFA]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue bg-brand-blue-light px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Layers className="w-3 h-3" />
                {assignment.courseTitle || 'UI/UX Product Design'}
              </span>
              <span className="text-[10px] text-brand-text-secondary">
                › {assignment.unitTitle || 'Curriculum Unit'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-brand-text-primary tracking-tight">
              {assignment.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-brand-text-secondary hover:text-brand-text-primary hover:bg-[#F0F0EB] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Metadata bar */}
          <div className="p-4 bg-[#FBFBFA] rounded-2xl border border-brand-border flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-brand-text-secondary">
                <Calendar className="w-4 h-4 text-brand-warning" />
                <span>Due Date: <strong className="text-brand-text-primary">{assignment.dueDateFormatted || assignment.dueDate}</strong></span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5 text-brand-text-secondary">
                <Award className="w-4 h-4 text-brand-blue" />
                <span>Max Marks: <strong className="text-brand-text-primary">{assignment.maxScore}</strong></span>
              </div>
            </div>

            <Badge
              variant={assignment.status === 'PUBLISHED' ? 'success' : assignment.status === 'ACTIVE' ? 'yellow' : 'neutral'}
              size="sm"
              dot={assignment.status === 'PUBLISHED' || assignment.status === 'ACTIVE'}
            >
              {assignment.status}
            </Badge>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-bold text-brand-text-secondary uppercase tracking-wider">
              Assignment Overview & Brief
            </h4>
            <p className="text-xs text-brand-text-primary leading-relaxed bg-white p-3.5 rounded-xl border border-brand-border/60">
              {assignment.description}
            </p>
          </div>

          {/* Requirements / Deliverables */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold text-brand-text-secondary uppercase tracking-wider">
                Expected Student Deliverables ({assignment.requirements?.length || 0})
              </h4>
              <span className="text-[10px] text-brand-text-secondary">
                Natural Assignment Order
              </span>
            </div>

            <div className="space-y-2">
              {assignment.requirements && assignment.requirements.length > 0 ? (
                assignment.requirements.map((req, idx) => (
                  <div
                    key={req.id || idx}
                    className="p-3 bg-[#FBFBFA] rounded-xl border border-brand-border flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-brand-text-primary">
                          {req.title}
                        </span>
                        {req.required ? (
                          <Badge variant="blue" size="sm">Mandatory</Badge>
                        ) : (
                          <Badge variant="neutral" size="sm">Optional</Badge>
                        )}
                      </div>
                      {req.description && (
                        <p className="text-[11px] text-brand-text-secondary leading-snug">
                          {req.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-brand-text-secondary italic">No deliverables specified.</p>
              )}
            </div>
          </div>

          {/* Guidelines */}
          <div className="space-y-3 pt-2 border-t border-brand-border/60">
            {assignment.submissionInstructions && (
              <div className="space-y-1">
                <h4 className="text-[11px] font-bold text-brand-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-brand-blue" />
                  Submission Instructions
                </h4>
                <p className="text-[11px] text-brand-text-primary bg-[#F9FAF9] p-3 rounded-xl border border-brand-border/60 leading-relaxed">
                  {assignment.submissionInstructions}
                </p>
              </div>
            )}

            {assignment.figmaGuidance && (
              <div className="space-y-1">
                <h4 className="text-[11px] font-bold text-[#946F00] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-yellow" />
                  Figma / FigJam Tool Guidance
                </h4>
                <p className="text-[11px] text-brand-text-primary bg-brand-yellow-light/50 p-3 rounded-xl border border-amber-200/60 leading-relaxed font-medium">
                  {assignment.figmaGuidance}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-brand-border bg-[#FCFCFA] flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Edit3}
              iconPosition="left"
              onClick={() => {
                onClose();
                onEdit(assignment);
              }}
            >
              Edit Specs
            </Button>
            <Link to={`/facilitator/submissions?assignmentId=${assignment.id}`}>
              <Button
                variant="primary"
                size="sm"
                icon={Inbox}
                iconPosition="left"
              >
                View Submissions ({assignment.submittedCount || 0})
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentSpecsModal;
