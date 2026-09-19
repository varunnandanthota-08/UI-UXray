import React, { useState, useEffect, useMemo } from 'react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import FigmaIcon from '../ui/FigmaIcon';
import { 
  X, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Layers, 
  Clock, 
  Sparkles, 
  Save, 
  Send, 
  RotateCcw, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Copy
} from 'lucide-react';
import { evaluationApi } from '../../api/evaluationApi';
import { submissionApi } from '../../api/submissionApi';
import { 
  getFacilitatorRubrics 
} from '../../data/mockFacilitatorData';

export const SubmissionReviewModal = ({
  isOpen,
  onClose,
  submission,
  onSubmissionUpdated
}) => {
  // Find linked rubric
  const allRubrics = useMemo(() => getFacilitatorRubrics(), []);
  const linkedRubric = useMemo(() => {
    if (!submission) return allRubrics[0] || null;
    return allRubrics.find(r => r.assignmentId === submission.assignmentId) || allRubrics[0] || null;
  }, [allRubrics, submission]);
  const criteria = linkedRubric?.criteria || [];

  // Evaluation Form State
  const [criterionScores, setCriterionScores] = useState({});
  const [criterionFeedback, setCriterionFeedback] = useState({});
  const [generalFeedback, setGeneralFeedback] = useState('');
  const [strengths, setStrengths] = useState('');
  const [growthAreas, setGrowthAreas] = useState('');
  const [expandedDescriptors, setExpandedDescriptors] = useState({});
  const [copiedUrl, setCopiedUrl] = useState(null);

  // Workflow states
  const [showFinalizeConfirm, setShowFinalizeConfirm] = useState(false);
  const [showReturnPrompt, setShowReturnPrompt] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [alertMessage, setAlertMessage] = useState(null);
  const [isEditingEvaluated, setIsEditingEvaluated] = useState(false);

  // Sync state if submission changes
  useEffect(() => {
    if (submission) {
      const ev = submission.evaluation || {};
      setCriterionScores(ev.criterionScores || {});
      setCriterionFeedback(ev.criterionFeedback || {});
      setGeneralFeedback(ev.generalFeedback || '');
      setStrengths(ev.strengths || '');
      setGrowthAreas(ev.growthAreas || '');
      setReturnReason(submission.returnReason || '');
      setShowFinalizeConfirm(false);
      setShowReturnPrompt(false);
      setAlertMessage(null);
      setIsEditingEvaluated(false);
    }
  }, [submission]);

  // Calculate real-time total score from entered criterion scores
  const calculatedTotalScore = useMemo(() => {
    return Object.values(criterionScores).reduce((sum, val) => {
      const num = Number(val);
      return !isNaN(num) ? sum + num : sum;
    }, 0);
  }, [criterionScores]);

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

  if (!isOpen || !submission) return null;

  const maxTotalScore = linkedRubric?.totalMarks || submission.maxScore || 20;

  // Deliverables stats
  const deliverables = submission.deliverables || [];
  const missingDeliverables = deliverables.filter(d => !d.isSubmitted);
  const submittedDeliverables = deliverables.filter(d => d.isSubmitted);

  // Score change handler
  const handleScoreChange = (criterionId, val, maxMarks) => {
    const parsed = val === '' ? '' : Math.min(Math.max(0, Number(val)), maxMarks);
    setCriterionScores(prev => ({
      ...prev,
      [criterionId]: parsed
    }));
  };

  const handleFeedbackChange = (criterionId, val) => {
    setCriterionFeedback(prev => ({
      ...prev,
      [criterionId]: val
    }));
  };

  const toggleDescriptors = (criterionId) => {
    setExpandedDescriptors(prev => ({
      ...prev,
      [criterionId]: !prev[criterionId]
    }));
  };

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  // Draft Save Handler
  const handleSaveDraft = async () => {
    const draftPayload = {
      criterionScores,
      criterionFeedback,
      generalFeedback,
      strengths,
      growthAreas,
      totalScore: calculatedTotalScore
    };

    try {
      const updated = await evaluationApi.saveEvaluationDraft(submission.id, draftPayload);
      if (updated) {
        if (onSubmissionUpdated) onSubmissionUpdated(updated);
        setAlertMessage({ type: 'success', text: 'Draft evaluation saved successfully. You can continue later.' });
        setTimeout(() => setAlertMessage(null), 4000);
      }
    } catch (err) {
      setAlertMessage({ type: 'warning', text: err.message || 'Failed to save evaluation draft' });
    }
  };

  // Finalize Handler
  const handleConfirmFinalize = async () => {
    const finalPayload = {
      criterionScores,
      criterionFeedback,
      generalFeedback,
      strengths,
      growthAreas,
      totalScore: calculatedTotalScore
    };

    try {
      const updated = await evaluationApi.finalizeEvaluation(submission.id, finalPayload);
      if (updated) {
        if (onSubmissionUpdated) onSubmissionUpdated(updated);
        setShowFinalizeConfirm(false);
        setIsEditingEvaluated(false);
        setAlertMessage({ type: 'success', text: 'Evaluation finalized and results published!' });
        setTimeout(() => setAlertMessage(null), 4000);
      }
    } catch (err) {
      setAlertMessage({ type: 'warning', text: err.message || 'Failed to finalize evaluation' });
    }
  };

  // Return for revision handler
  const handleConfirmReturn = async () => {
    if (!returnReason.trim()) {
      alert('Please provide a reason for returning the submission.');
      return;
    }

    try {
      const updated = await submissionApi.returnSubmission(submission.id, returnReason);
      if (updated) {
        if (onSubmissionUpdated) onSubmissionUpdated(updated);
        setShowReturnPrompt(false);
        setAlertMessage({ type: 'warning', text: 'Submission returned to student for revision.' });
        setTimeout(() => setAlertMessage(null), 4000);
      }
    } catch (err) {
      setAlertMessage({ type: 'warning', text: err.message || 'Failed to return submission' });
    }
  };

  const isEvaluated = submission.evaluationStatus === 'EVALUATED' && !isEditingEvaluated;
  const isReturned = submission.evaluationStatus === 'RETURNED';

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/45 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl border border-brand-border shadow-2xl w-full max-w-6xl my-4 sm:my-8 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-4 sm:py-5 border-b border-brand-border bg-[#FCFCFA] flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1.5 min-w-0">
            {/* Hierarchy Breadcrumb */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-brand-text-secondary">
              <span className="text-brand-blue bg-brand-blue-light/80 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Layers className="w-3 h-3" />
                {submission.courseTitle || 'UI/UX Product Design'}
              </span>
              <span>›</span>
              <span className="text-brand-text-primary font-semibold truncate">
                {submission.unitTitle || 'Curriculum Unit'}
              </span>
              <span>›</span>
              <span className="text-brand-text-secondary truncate">
                {submission.assignmentTitle}
              </span>
            </div>

            {/* Student & Status Info */}
            <div className="flex flex-wrap items-center gap-3 pt-0.5">
              <div className="flex items-center gap-2.5">
                <img 
                  src={submission.studentAvatar} 
                  alt={submission.studentName}
                  className="w-7 h-7 rounded-full object-cover border border-brand-border"
                />
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-brand-text-primary leading-tight">
                    {submission.studentName}
                  </h2>
                  <span className="text-[11px] text-brand-text-secondary block">
                    {submission.studentEmail} • {submission.studentCohort}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pl-2 border-l border-brand-border/80">
                <Badge
                  variant={
                    submission.evaluationStatus === 'EVALUATED' ? 'success' :
                    submission.evaluationStatus === 'RETURNED' ? 'danger' :
                    submission.evaluationStatus === 'IN_REVIEW' ? 'blue' : 'warning'
                  }
                  size="sm"
                  className="font-bold text-[10px]"
                >
                  {submission.evaluationStatus.replace('_', ' ')}
                </Badge>

                {submission.score !== null && submission.score !== undefined && (
                  <span className="text-xs font-bold text-brand-blue bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                    Final Score: {submission.score} / {maxTotalScore}
                  </span>
                )}
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

        {/* Re-evaluation Alert Banner if active */}
        {submission.hasReEvaluationRequest && (
          <div className="px-6 py-2.5 bg-purple-50 border-b border-purple-200 flex items-center justify-between text-xs text-purple-900">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-purple-600 shrink-0" />
              <span>
                <strong>Re-Evaluation Request Active:</strong> {submission.reEvaluationNote || 'Student submitted a dispute or review request for this evaluation.'}
              </span>
            </div>
            <Badge variant="neutral" className="bg-purple-100 text-purple-800 text-[10px] font-bold">
              Review Requested
            </Badge>
          </div>
        )}

        {/* Inline Feedback Alerts */}
        {alertMessage && (
          <div className={`px-6 py-2.5 border-b text-xs font-medium flex items-center justify-between ${
            alertMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
              : 'bg-amber-50 text-amber-900 border-amber-200'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{alertMessage.text}</span>
            </div>
            <button onClick={() => setAlertMessage(null)} className="opacity-70 hover:opacity-100">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Main Split Content */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-brand-border">
          {/* ============================================================ */}
          {/* LEFT PANEL: Student Submission & Evidence (5 Cols)          */}
          {/* ============================================================ */}
          <div className="lg:col-span-5 p-5 sm:p-6 space-y-6 overflow-y-auto bg-[#FDFDFD]">
            {/* Timestamp & Meta */}
            <div className="p-3.5 bg-[#FBFBFA] rounded-2xl border border-brand-border text-xs flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-brand-text-secondary">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Submitted: <strong className="text-brand-text-primary">{submission.submittedAtFormatted}</strong></span>
              </div>
              <span className="text-[11px] text-brand-text-secondary font-medium">
                Reviewer: <strong className="text-brand-text-primary">{submission.reviewer || 'Unassigned'}</strong>
              </span>
            </div>

            {/* Student Notes */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-brand-blue" />
                Student Rationale & Notes
              </h3>
              <div className="p-4 bg-[#FBFBFA] rounded-2xl border border-brand-border text-xs text-brand-text-primary leading-relaxed">
                {submission.studentNotes ? (
                  <p className="italic">"{submission.studentNotes}"</p>
                ) : (
                  <p className="text-brand-text-secondary">No additional notes provided by student.</p>
                )}
              </div>
            </div>

            {/* Deliverables & Evidence Checklist */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary">
                  Submitted Deliverables ({submittedDeliverables.length}/{deliverables.length})
                </h3>
                {missingDeliverables.length > 0 && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {missingDeliverables.length} Missing
                  </span>
                )}
              </div>

              <div className="space-y-2.5">
                {deliverables.map((del) => {
                  const isMissing = !del.isSubmitted;
                  return (
                    <div 
                      key={del.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isMissing 
                          ? 'bg-red-50/40 border-red-200 text-red-950' 
                          : 'bg-white border-brand-border text-brand-text-primary shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          {del.type === 'figma' ? (
                            <FigmaIcon className="w-4 h-4 shrink-0 mt-0.5 text-purple-600" />
                          ) : del.type === 'figjam' ? (
                            <Layers className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                          ) : (
                            <FileText className="w-4 h-4 shrink-0 mt-0.5 text-brand-blue" />
                          )}
                          <div>
                            <h4 className="text-xs font-bold leading-tight">
                              {del.name}
                            </h4>
                            <span className="text-[10px] text-brand-text-secondary block mt-0.5">
                              {isMissing ? 'Required deliverable not submitted' : `Uploaded • ${del.submittedAt || 'on-time'}`}
                            </span>
                          </div>
                        </div>

                        <Badge
                          variant={isMissing ? 'danger' : 'success'}
                          size="sm"
                          className="font-bold text-[9px] uppercase tracking-wider shrink-0"
                        >
                          {isMissing ? 'Missing' : 'Available'}
                        </Badge>
                      </div>

                      {/* URL or Content Preview */}
                      {!isMissing && del.url && (
                        <div className="mt-2.5 pt-2.5 border-t border-brand-border/60 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-brand-blue font-mono truncate max-w-[240px]">
                            {del.url}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleCopyLink(del.url)}
                              className="p-1 rounded text-brand-text-secondary hover:text-brand-text-primary hover:bg-[#F0F0EB] text-[10px] transition-colors"
                              title="Copy link"
                            >
                              {copiedUrl === del.url ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                            <a
                              href={del.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-blue hover:underline"
                            >
                              Open <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Content Preview Box */}
                      {!isMissing && del.contentPreview && (
                        <p className="mt-2 p-2 bg-[#FBFBFA] rounded-lg border border-brand-border/70 text-[11px] text-brand-text-secondary leading-relaxed italic">
                          "{del.contentPreview}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Return for revision notice if active */}
            {isReturned && (
              <div className="p-4 bg-red-50 rounded-2xl border border-red-200 space-y-1.5 text-xs text-red-950">
                <span className="font-bold uppercase tracking-wider text-[10px] text-red-700 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Returned For Revision
                </span>
                <p className="leading-relaxed">
                  {submission.returnReason || 'Mentor requested updates before final grading.'}
                </p>
              </div>
            )}

            {/* AI-Assisted Advisory Placeholder (Requirement 14) */}
            <div className="p-4 bg-gradient-to-br from-indigo-50/60 to-purple-50/40 rounded-2xl border border-indigo-100 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-indigo-950 font-bold">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>AI-Assisted Analysis (Upcoming Engine)</span>
              </div>
              <p className="text-[11px] text-indigo-900/80 leading-relaxed">
                AI automated heuristic analysis and auto-layout token compliance will display advisory insights here. Human facilitators maintain 100% authority over final marks.
              </p>
            </div>
          </div>

          {/* ============================================================ */}
          {/* RIGHT PANEL: Rubric-Driven Evaluation Form (7 Cols)         */}
          {/* ============================================================ */}
          <div className="lg:col-span-7 p-5 sm:p-6 space-y-6 overflow-y-auto bg-white flex flex-col justify-between">
            <div className="space-y-6">
              {/* Facilitator Notice & Score Status Header */}
              <div className="p-4 bg-[#FBFBFA] rounded-2xl border border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary block">
                    Rubric Evaluation Framework
                  </span>
                  <h3 className="text-sm font-bold text-brand-text-primary mt-0.5">
                    {linkedRubric?.title || 'Assignment Evaluation Rubric'}
                  </h3>
                </div>

                <div className="flex items-center gap-3 bg-white px-3.5 py-2 rounded-xl border border-brand-border shadow-2xs self-start sm:self-auto">
                  <Award className="w-5 h-5 text-brand-blue" />
                  <div>
                    <span className="text-[10px] text-brand-text-secondary font-semibold block leading-none">
                      Evaluator Score
                    </span>
                    <span className="text-base font-black text-brand-text-primary">
                      {calculatedTotalScore} <span className="text-xs font-normal text-brand-text-secondary">/ {maxTotalScore} pts</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Rubric Criteria List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <h4 className="font-bold uppercase tracking-wider text-brand-text-secondary">
                    Criterion Scoring & Specific Feedback
                  </h4>
                  <span className="text-[11px] text-brand-text-secondary">
                    {criteria.length} criteria defined
                  </span>
                </div>

                <div className="space-y-4">
                  {criteria.map((criterion, idx) => {
                    const currentScore = criterionScores[criterion.id] ?? '';
                    const currentComment = criterionFeedback[criterion.id] ?? '';
                    const isExpanded = !!expandedDescriptors[criterion.id];

                    return (
                      <div 
                        key={criterion.id || idx}
                        className="p-4 rounded-2xl border border-brand-border bg-[#FCFCFA] space-y-3.5 shadow-2xs"
                      >
                        {/* Criterion Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                          <div className="space-y-1 max-w-md">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-brand-blue-light text-brand-blue font-bold text-[10px] flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <h5 className="text-xs font-bold text-brand-text-primary">
                                {criterion.name}
                              </h5>
                              <Badge variant="blue" className="text-[9px] font-bold">
                                {criterion.weight || `${Math.round((criterion.marks / maxTotalScore) * 100)}%`}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-brand-text-secondary pl-7 leading-snug">
                              {criterion.description}
                            </p>
                          </div>

                          {/* Criterion Score Input */}
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto pl-7 sm:pl-0">
                            <label className="text-[11px] font-bold text-brand-text-secondary">
                              Score:
                            </label>
                            <div className="flex items-center">
                              <input
                                type="number"
                                min="0"
                                max={criterion.marks}
                                step="1"
                                disabled={isEvaluated}
                                value={currentScore}
                                onChange={(e) => handleScoreChange(criterion.id, e.target.value, criterion.marks)}
                                placeholder="0"
                                className="w-14 px-2 py-1.5 text-center font-bold text-xs rounded-xl border border-brand-border bg-white focus:outline-none focus:border-brand-blue disabled:bg-[#F0F0EB] transition-colors"
                              />
                              <span className="text-xs font-bold text-brand-text-secondary ml-1.5">
                                / {criterion.marks}m
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Descriptors Accordion */}
                        {criterion.descriptors && criterion.descriptors.length > 0 && (
                          <div className="pl-7">
                            <button
                              type="button"
                              onClick={() => toggleDescriptors(criterion.id)}
                              className="text-[11px] font-semibold text-brand-blue flex items-center gap-1 hover:underline"
                            >
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              {isExpanded ? 'Hide scoring anchors' : 'View scoring anchors & descriptors'}
                            </button>

                            {isExpanded && (
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 pt-2 border-t border-brand-border/60">
                                {criterion.descriptors.map((desc, dIdx) => (
                                  <div 
                                    key={dIdx}
                                    className="p-2.5 bg-white rounded-xl border border-brand-border/80 text-[10px] space-y-1"
                                  >
                                    <div className="flex items-center justify-between font-bold">
                                      <span className="text-brand-blue">{desc.level}</span>
                                      <span className="text-brand-text-secondary">{desc.scoreRange} pts</span>
                                    </div>
                                    <p className="text-brand-text-secondary leading-tight">
                                      {desc.text}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Criterion Feedback Input */}
                        <div className="pl-7">
                          <textarea
                            rows="2"
                            disabled={isEvaluated}
                            value={currentComment}
                            onChange={(e) => handleFeedbackChange(criterion.id, e.target.value)}
                            placeholder={`Specific feedback for ${criterion.name}...`}
                            className="w-full p-2.5 text-xs rounded-xl border border-brand-border bg-white text-brand-text-primary focus:outline-none focus:border-brand-blue disabled:bg-[#F0F0EB] transition-colors"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Overall Feedback Section */}
              <div className="space-y-4 pt-2 border-t border-brand-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary">
                  Holistic Evaluation Summary
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-brand-text-primary block mb-1">
                      Key Strengths Demonstrated
                    </label>
                    <textarea
                      rows="2"
                      disabled={isEvaluated}
                      value={strengths}
                      onChange={(e) => setStrengths(e.target.value)}
                      placeholder="e.g., Clean Figma layer naming, intuitive micro-motion physics..."
                      className="w-full p-2.5 text-xs rounded-xl border border-brand-border bg-[#FBFBFA] focus:outline-none focus:border-brand-blue disabled:bg-[#F0F0EB]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-brand-text-primary block mb-1">
                      Actionable Growth Areas / Recommendations
                    </label>
                    <textarea
                      rows="2"
                      disabled={isEvaluated}
                      value={growthAreas}
                      onChange={(e) => setGrowthAreas(e.target.value)}
                      placeholder="e.g., Ensure public link permissions; test mobile breakpoints..."
                      className="w-full p-2.5 text-xs rounded-xl border border-brand-border bg-[#FBFBFA] focus:outline-none focus:border-brand-blue disabled:bg-[#F0F0EB]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-brand-text-primary block mb-1">
                      Overall Evaluator Remarks
                    </label>
                    <textarea
                      rows="2"
                      disabled={isEvaluated}
                      value={generalFeedback}
                      onChange={(e) => setGeneralFeedback(e.target.value)}
                      placeholder="Comprehensive feedback explaining the score and cohort benchmarks..."
                      className="w-full p-2.5 text-xs rounded-xl border border-brand-border bg-[#FBFBFA] focus:outline-none focus:border-brand-blue disabled:bg-[#F0F0EB]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onClose}>
                  Close
                </Button>

                {!isEvaluated && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReturnPrompt(true)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 text-xs"
                  >
                    Return for Revision
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                {isEvaluated ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingEvaluated(true)}
                  >
                    Edit Evaluation
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Save}
                      iconPosition="left"
                      onClick={handleSaveDraft}
                    >
                      Save Draft
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      icon={Send}
                      iconPosition="left"
                      onClick={() => setShowFinalizeConfirm(true)}
                      className="font-bold shadow-sm"
                    >
                      Finalize Evaluation
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Step Before Finalizing (Requirement 8) */}
      {showFinalizeConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-brand-border shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-brand-text-primary">
                Finalize & Publish Evaluation?
              </h3>
              <p className="text-xs text-brand-text-secondary mt-1 leading-relaxed">
                Confirming will publish the marks and feedback directly to the student. Facilitator evaluation decisions are final.
              </p>
            </div>

            {/* Score Breakdown Confirmation */}
            <div className="p-3.5 bg-[#FBFBFA] rounded-2xl border border-brand-border space-y-2 text-xs">
              <div className="flex justify-between items-center font-bold">
                <span className="text-brand-text-secondary">Total Final Score:</span>
                <span className="text-sm text-brand-blue">{calculatedTotalScore} / {maxTotalScore} pts</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-brand-text-secondary pt-1 border-t border-brand-border/60">
                <span>Student:</span>
                <strong className="text-brand-text-primary">{submission.studentName}</strong>
              </div>
              {missingDeliverables.length > 0 && (
                <div className="p-2 bg-amber-50 rounded-lg text-[10px] text-amber-900 border border-amber-200">
                  <strong>Notice:</strong> {missingDeliverables.length} required deliverable item(s) are marked as missing.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFinalizeConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmFinalize}
                className="font-bold"
              >
                Confirm & Publish Result
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Return for Revision Prompt Modal */}
      {showReturnPrompt && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-brand-border shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-brand-text-primary">
                Return Submission for Revision
              </h3>
              <p className="text-xs text-brand-text-secondary mt-1 leading-relaxed">
                Explain clearly why this deliverable is being returned (e.g. broken permissions, missing flow state).
              </p>
            </div>

            <textarea
              rows="3"
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="Provide actionable instructions for the student to resubmit..."
              className="w-full p-3 text-xs rounded-xl border border-brand-border bg-[#FBFBFA] focus:outline-none focus:border-brand-blue"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReturnPrompt(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmReturn}
              >
                Return Submission
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionReviewModal;
