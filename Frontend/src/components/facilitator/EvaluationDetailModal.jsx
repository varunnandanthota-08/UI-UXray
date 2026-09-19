import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import FigmaIcon from '../ui/FigmaIcon';
import { 
  X, 
  Award, 
  CheckCircle2, 
  ExternalLink, 
  Layers, 
  Calendar, 
  FileText, 
  RotateCcw, 
  Lock,
  History,
  Clock
} from 'lucide-react';
import { getFacilitatorRubrics } from '../../data/mockFacilitatorData';

export const EvaluationDetailModal = ({
  isOpen,
  onClose,
  evaluation
}) => {
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0);

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

  if (!isOpen || !evaluation) return null;

  const versions = evaluation.versions || [];
  // Use selected version or fallback to latest version / currentEvaluation
  const activeVersion = versions[selectedVersionIndex] || versions[0] || {
    score: evaluation.score,
    maxScore: evaluation.maxScore,
    percentage: evaluation.percentage,
    evaluatedAt: evaluation.evaluationDate,
    evaluatedBy: evaluation.reviewer,
    criterionScores: evaluation.currentEvaluation?.criterionScores || {},
    criterionFeedback: evaluation.currentEvaluation?.criterionFeedback || {},
    strengths: evaluation.currentEvaluation?.strengths || '',
    growthAreas: evaluation.currentEvaluation?.growthAreas || '',
    generalFeedback: evaluation.currentEvaluation?.generalFeedback || ''
  };

  // Rubric details
  const allRubrics = getFacilitatorRubrics();
  const linkedRubric = allRubrics.find(r => r.assignmentId === evaluation.assignmentId) || allRubrics[0];
  const criteria = linkedRubric?.criteria || [];

  const isReEvalRequested = evaluation.status === 'RE_EVALUATION_REQUESTED' || evaluation.reEvaluation?.status === 'REQUESTED';
  const isReEvaluated = evaluation.status === 'RE_EVALUATED' || evaluation.reEvaluation?.status === 'COMPLETED';

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/45 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl border border-brand-border shadow-2xl w-full max-w-5xl my-4 sm:my-8 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-4 sm:py-5 border-b border-brand-border bg-[#FCFCFA] flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1.5 min-w-0">
            {/* Hierarchy Lineage */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-brand-text-secondary">
              <span className="text-brand-blue bg-brand-blue-light/80 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Layers className="w-3 h-3" />
                {evaluation.courseTitle || 'UI/UX Product Design'}
              </span>
              <span>›</span>
              <span className="text-brand-text-primary font-semibold truncate">
                {evaluation.unitTitle || 'Unit'}
              </span>
              <span>›</span>
              <span className="text-brand-text-secondary truncate">
                {evaluation.assignmentTitle}
              </span>
            </div>

            {/* Student Name & Evaluation Status */}
            <div className="flex flex-wrap items-center gap-3 pt-0.5">
              <div className="flex items-center gap-2.5">
                <img 
                  src={evaluation.studentAvatar} 
                  alt={evaluation.studentName}
                  className="w-7 h-7 rounded-full object-cover border border-brand-border"
                />
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-brand-text-primary leading-tight">
                    {evaluation.studentName}
                  </h2>
                  <span className="text-[11px] text-brand-text-secondary block">
                    {evaluation.studentEmail} • {evaluation.studentCohort}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pl-2 border-l border-brand-border/80">
                <Badge
                  variant={
                    isReEvaluated ? 'blue' :
                    isReEvalRequested ? 'warning' : 'success'
                  }
                  size="sm"
                  className="font-bold text-[10px]"
                >
                  {evaluation.status.replace(/_/g, ' ')}
                </Badge>

                <span className="text-xs font-bold text-brand-blue bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  Score: {activeVersion.score} / {evaluation.maxScore || 20} ({activeVersion.percentage || Math.round((activeVersion.score / (evaluation.maxScore || 20)) * 100)}%)
                </span>
              </div>
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

        {/* Immutability Banner (Requirement 5) */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>
              <strong>Finalized Assessment Record:</strong> This evaluation is immutable and published. Any score adjustments require an authorized re-evaluation request.
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Evaluator: {activeVersion.evaluatedBy || evaluation.reviewer || 'Lead Design Facilitator'}
          </span>
        </div>

        {/* Active Re-evaluation Alert if requested */}
        {isReEvalRequested && (
          <div className="px-6 py-3 bg-purple-50 border-b border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-purple-950">
            <div className="flex items-start gap-2.5">
              <RotateCcw className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-purple-900">Student Re-Evaluation Request Active:</strong>
                <p className="italic text-purple-800 mt-0.5">"{evaluation.reEvaluation?.reason}"</p>
              </div>
            </div>
            <Link to={`/facilitator/evaluations/re-evaluation/${evaluation.submissionId || evaluation.id}`}>
              <Button variant="primary" size="sm" className="shrink-0 font-bold">
                Handle Re-Evaluation
              </Button>
            </Link>
          </div>
        )}

        {/* Version History Selector Tabs (Requirement 8) */}
        {versions.length > 1 && (
          <div className="px-6 py-2.5 bg-[#F8F8F6] border-b border-brand-border flex items-center gap-2 text-xs">
            <History className="w-4 h-4 text-brand-text-secondary shrink-0" />
            <span className="font-bold text-brand-text-secondary text-[11px] uppercase tracking-wider mr-1">
              Version History:
            </span>
            <div className="flex items-center gap-1.5">
              {versions.map((v, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedVersionIndex(idx)}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors ${
                    selectedVersionIndex === idx
                      ? 'bg-brand-blue text-white shadow-2xs'
                      : 'bg-white text-brand-text-secondary hover:text-brand-text-primary border border-brand-border'
                  }`}
                >
                  Version {v.versionNumber} ({v.score} pts) • {v.versionNumber === 1 ? 'Initial' : 'Revised'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Modal Main Content */}
        <div className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-[#FBFBFA] rounded-2xl border border-brand-border">
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-text-secondary block">
                Final Score
              </span>
              <span className="text-base font-black text-brand-blue flex items-center gap-1.5 mt-1">
                <Award className="w-4 h-4" />
                {activeVersion.score} / {evaluation.maxScore || 20} pts
              </span>
            </div>

            <div className="p-3.5 bg-[#FBFBFA] rounded-2xl border border-brand-border">
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-text-secondary block">
                Percentage
              </span>
              <span className="text-base font-black text-emerald-600 flex items-center gap-1.5 mt-1">
                <CheckCircle2 className="w-4 h-4" />
                {activeVersion.percentage || Math.round((activeVersion.score / (evaluation.maxScore || 20)) * 100)}%
              </span>
            </div>

            <div className="p-3.5 bg-[#FBFBFA] rounded-2xl border border-brand-border">
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-text-secondary block">
                Evaluation Date
              </span>
              <span className="text-xs font-semibold text-brand-text-primary flex items-center gap-1.5 mt-1">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                {activeVersion.evaluatedAt || evaluation.evaluationDate}
              </span>
            </div>

            <div className="p-3.5 bg-[#FBFBFA] rounded-2xl border border-brand-border">
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-text-secondary block">
                Submission Date
              </span>
              <span className="text-xs font-semibold text-brand-text-primary flex items-center gap-1.5 mt-1">
                <Clock className="w-3.5 h-3.5 text-brand-blue" />
                {evaluation.submittedAtFormatted || 'On-time'}
              </span>
            </div>
          </div>

          {/* Re-evaluation Resolution Note if Version 2 */}
          {activeVersion.versionNumber > 1 && activeVersion.resolutionNotes && (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <span className="font-bold text-emerald-900 block flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Re-Evaluation Resolution Notes (Mentor Final Verdict)
              </span>
              <p className="leading-relaxed font-medium">
                {activeVersion.resolutionNotes}
              </p>
            </div>
          )}

          {/* Criterion Breakdown (Requirement 4) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-brand-text-primary flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-blue" />
                Evaluation Rubric Breakdown & Criterion Scores
              </h3>
              <span className="text-[11px] text-brand-text-secondary font-medium">
                {criteria.length} criteria audited
              </span>
            </div>

            <div className="space-y-3">
              {criteria.map((crit, idx) => {
                const awarded = activeVersion.criterionScores?.[crit.id] ?? '-';
                const feedback = activeVersion.criterionFeedback?.[crit.id] || 'No specific notes recorded.';

                return (
                  <div 
                    key={crit.id || idx}
                    className="p-4 rounded-2xl border border-brand-border bg-[#FCFCFA] space-y-2.5 shadow-2xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-brand-blue-light text-brand-blue font-bold text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-brand-text-primary">
                            {crit.name}
                          </h4>
                          <p className="text-[11px] text-brand-text-secondary">
                            {crit.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto pl-7 sm:pl-0">
                        <span className="text-xs font-black text-brand-blue bg-white border border-brand-border px-3 py-1 rounded-xl">
                          {awarded} / {crit.marks} pts
                        </span>
                      </div>
                    </div>

                    {/* Evaluator feedback for this criterion */}
                    <div className="pl-7 pt-1 border-t border-brand-border/60">
                      <p className="text-[11px] text-brand-text-primary leading-relaxed font-medium">
                        <strong className="text-brand-text-secondary font-semibold">Feedback:</strong> {feedback}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Holistic Feedback Summary */}
          <div className="space-y-4 pt-2 border-t border-brand-border">
            <h3 className="text-sm font-bold text-brand-text-primary">
              Holistic Qualitative Assessment
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 space-y-1.5">
                <span className="text-[11px] font-bold text-emerald-950 block uppercase tracking-wider">
                  Key Strengths
                </span>
                <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                  {activeVersion.strengths || 'Consistent auto-layout discipline and clean Figma layer hygiene.'}
                </p>
              </div>

              <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-1.5">
                <span className="text-[11px] font-bold text-amber-950 block uppercase tracking-wider">
                  Areas for Improvement
                </span>
                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                  {activeVersion.growthAreas || 'Focus on testing interactive states across diverse responsive screen widths.'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#FBFBFA] rounded-2xl border border-brand-border space-y-1.5">
              <span className="text-[11px] font-bold text-brand-text-secondary block uppercase tracking-wider">
                Overall Evaluator Remarks
              </span>
              <p className="text-xs text-brand-text-primary leading-relaxed">
                {activeVersion.generalFeedback || 'Work meets professional production standards for this module.'}
              </p>
            </div>
          </div>

          {/* Deliverables & Evidence Section */}
          {evaluation.deliverables && evaluation.deliverables.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-brand-border">
              <h3 className="text-sm font-bold text-brand-text-primary">
                Submitted Deliverables & Evidence
              </h3>

              <div className="space-y-2">
                {evaluation.deliverables.map((del) => {
                  const isMissing = !del.isSubmitted;
                  return (
                    <div 
                      key={del.id}
                      className="p-3 bg-[#FCFCFA] rounded-2xl border border-brand-border flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {del.type === 'figma' ? (
                          <FigmaIcon className="w-4 h-4 shrink-0 text-purple-600" />
                        ) : (
                          <FileText className="w-4 h-4 shrink-0 text-brand-blue" />
                        )}
                        <span className="text-xs font-semibold text-brand-text-primary truncate">
                          {del.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={isMissing ? 'danger' : 'success'} size="sm">
                          {isMissing ? 'Missing' : 'Available'}
                        </Badge>
                        {!isMissing && del.url && (
                          <a
                            href={del.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-blue hover:underline"
                          >
                            Open <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-brand-border bg-[#FCFCFA] flex items-center justify-between shrink-0">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center gap-2">
            <Link to={`/facilitator/submissions?assignmentId=${evaluation.assignmentId}`}>
              <Button variant="outline" size="sm">
                View in Submission Queue
              </Button>
            </Link>

            {isReEvalRequested && (
              <Link to={`/facilitator/evaluations/re-evaluation/${evaluation.submissionId || evaluation.id}`}>
                <Button variant="primary" size="sm" className="font-bold">
                  Handle Re-Evaluation
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationDetailModal;
