import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import FigmaIcon from '../../components/ui/FigmaIcon';
import { evaluationApi } from '../../api/evaluationApi';
import { 
  getEvaluationById, 
  getFacilitatorRubrics 
} from '../../data/mockFacilitatorData';
import { 
  ArrowLeft, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  FileText, 
  RotateCcw, 
  Sparkles, 
  Check, 
  Copy,
  History,
  Send,
  XCircle
} from 'lucide-react';

export const FacilitatorReEvaluation = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  // Load evaluation
  const [evaluation, setEvaluation] = useState(() => getEvaluationById(submissionId));
  const [copiedUrl, setCopiedUrl] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchRecord = async () => {
      try {
        const record = await evaluationApi.getEvaluation(submissionId);
        if (isMounted && record) {
          setEvaluation(record);
        }
      } catch {
        // Safe fallback retained
      }
    };
    fetchRecord();
    return () => { isMounted = false; };
  }, [submissionId]);

  // Re-evaluation Form state
  const originalVersion = evaluation?.versions?.[0] || {
    score: evaluation?.score || 0,
    criterionScores: evaluation?.currentEvaluation?.criterionScores || {},
    criterionFeedback: evaluation?.currentEvaluation?.criterionFeedback || {},
    strengths: evaluation?.currentEvaluation?.strengths || '',
    growthAreas: evaluation?.currentEvaluation?.growthAreas || '',
    generalFeedback: evaluation?.currentEvaluation?.generalFeedback || ''
  };

  const [revisedScores, setRevisedScores] = useState(() => ({ ...(originalVersion.criterionScores || {}) }));
  const [revisedCriterionFeedback, setRevisedCriterionFeedback] = useState(() => ({ ...(originalVersion.criterionFeedback || {}) }));
  const [revisedStrengths, setRevisedStrengths] = useState(originalVersion.strengths || '');
  const [revisedGrowthAreas, setRevisedGrowthAreas] = useState(originalVersion.growthAreas || '');
  const [revisedGeneralFeedback, setRevisedGeneralFeedback] = useState(originalVersion.generalFeedback || '');
  const [reEvaluationResolutionNotes, setReEvaluationResolutionNotes] = useState(
    evaluation?.reEvaluation?.resolutionNotes || ''
  );

  // Dialogs
  const [showDeclinePrompt, setShowDeclinePrompt] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [showConfirmFinalize, setShowConfirmFinalize] = useState(false);
  const [alertBanner, setAlertBanner] = useState(null);

  // Rubric
  const allRubrics = useMemo(() => getFacilitatorRubrics(), []);
  const linkedRubric = useMemo(() => {
    if (!evaluation) return allRubrics[0] || null;
    return allRubrics.find(r => r.assignmentId === evaluation.assignmentId) || allRubrics[0] || null;
  }, [allRubrics, evaluation]);
  const criteria = linkedRubric?.criteria || [];

  // Calculate live revised total score
  const revisedTotalScore = useMemo(() => {
    return Object.values(revisedScores).reduce((sum, val) => {
      const num = Number(val);
      return !isNaN(num) ? sum + num : sum;
    }, 0);
  }, [revisedScores]);

  const maxScore = evaluation?.maxScore || 20;

  // Handlers
  const handleScoreChange = (critId, val, maxMarks) => {
    const parsed = val === '' ? '' : Math.min(Math.max(0, Number(val)), maxMarks);
    setRevisedScores(prev => ({
      ...prev,
      [critId]: parsed
    }));
  };

  const handleFeedbackChange = (critId, val) => {
    setRevisedCriterionFeedback(prev => ({
      ...prev,
      [critId]: val
    }));
  };

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleApprove = async () => {
    try {
      const updated = await evaluationApi.approveReEvaluation(evaluation.id, 'Facilitator initiated review.');
      if (updated) {
        setEvaluation(updated);
        setAlertBanner({ type: 'success', text: 'Re-evaluation request approved and moved to Under Review.' });
        setTimeout(() => setAlertBanner(null), 4000);
      }
    } catch (err) {
      setAlertBanner({ type: 'warning', text: err.message || 'Failed to approve re-evaluation' });
    }
  };

  const handleDecline = async () => {
    if (!declineReason.trim()) {
      alert('Please provide a reason for declining the re-evaluation request.');
      return;
    }

    try {
      const updated = await evaluationApi.rejectReEvaluation(evaluation.id, declineReason);
      if (updated) {
        setEvaluation(updated);
        setShowDeclinePrompt(false);
        setAlertBanner({ type: 'warning', text: 'Re-evaluation request declined. Evaluation remains as Version 1.' });
        setTimeout(() => navigate('/facilitator/evaluations'), 2500);
      }
    } catch (err) {
      setAlertBanner({ type: 'warning', text: err.message || 'Failed to decline re-evaluation' });
    }
  };

  const handleFinalizeRevision = async () => {
    if (!reEvaluationResolutionNotes.trim()) {
      alert('Please provide resolution notes explaining your assessment verdict.');
      return;
    }

    const revisionPayload = {
      revisedScores,
      revisedCriterionFeedback,
      revisedStrengths,
      revisedGrowthAreas,
      revisedGeneralFeedback,
      revisedTotalScore,
      reEvaluationResolutionNotes
    };

    try {
      const updated = await evaluationApi.finalizeReEvaluation(evaluation.id, revisionPayload);
      if (updated) {
        setEvaluation(updated);
        setShowConfirmFinalize(false);
        setAlertBanner({ type: 'success', text: 'Revised evaluation finalized! Version 2 has been published.' });
        setTimeout(() => navigate('/facilitator/evaluations'), 2000);
      }
    } catch (err) {
      setAlertBanner({ type: 'warning', text: err.message || 'Failed to finalize re-evaluation' });
    }
  };

  if (!evaluation) {
    return (
      <div className="p-12 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-brand-text-primary">Evaluation Record Not Found</h2>
        <p className="text-xs text-brand-text-secondary">Could not find an evaluation matching ID: {submissionId}</p>
        <Link to="/facilitator/evaluations">
          <Button variant="primary" size="sm">Back to Evaluations</Button>
        </Link>
      </div>
    );
  }

  const isCompleted = evaluation.status === 'RE_EVALUATED' || evaluation.reEvaluation?.status === 'COMPLETED';
  const isDeclined = evaluation.reEvaluation?.status === 'REJECTED';

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Top Breadcrumb & Header */}
      <div className="space-y-3 pb-2 border-b border-brand-border">
        <Link 
          to="/facilitator/evaluations"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-text-secondary hover:text-brand-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Evaluation Audit
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="blue" size="sm">
                RE-EVALUATION WORKSPACE
              </Badge>
              <span className="text-xs text-brand-text-secondary">
                Review & Dispute Resolution • {evaluation.courseTitle}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-brand-text-primary tracking-tight">
              Re-Evaluation: {evaluation.studentName}
            </h1>
            <p className="text-xs md:text-sm text-brand-text-secondary mt-1">
              {evaluation.assignmentTitle} • {evaluation.unitTitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant={
                isCompleted ? 'success' :
                isDeclined ? 'danger' : 'warning'
              }
              size="md"
              className="font-bold text-xs"
            >
              Status: {evaluation.reEvaluation?.status || 'REQUESTED'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {alertBanner && (
        <div className={`p-4 rounded-2xl border text-xs font-medium flex items-center justify-between ${
          alertBanner.type === 'success' 
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
            : 'bg-amber-50 text-amber-900 border-amber-200'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{alertBanner.text}</span>
          </div>
          <button onClick={() => setAlertBanner(null)} className="opacity-70 hover:opacity-100">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Student Re-Evaluation Request Card (Requirement 6) */}
      <Card className="p-5 border-purple-200 bg-purple-50/50 shadow-soft space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-200/80 pb-3">
          <div className="flex items-center gap-2.5">
            <RotateCcw className="w-5 h-5 text-purple-600 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-purple-950">
                Student Appeal & Re-Evaluation Request
              </h3>
              <span className="text-[11px] text-purple-800">
                Submitted: {evaluation.reEvaluation?.requestedAt || '12 Sep 2026, 11:20 AM'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-purple-900 bg-white px-3 py-1 rounded-xl border border-purple-200">
              Original Grade: {originalVersion.score} / {maxScore} pts
            </span>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900 block">
            Student's Explanation / Reason:
          </span>
          <p className="p-3.5 bg-white rounded-xl border border-purple-200/90 text-purple-950 leading-relaxed italic font-medium">
            "{evaluation.reEvaluation?.reason || 'Student requested a review of their score.'}"
          </p>
        </div>

        {/* Action button if currently just requested */}
        {evaluation.reEvaluation?.status === 'REQUESTED' && (
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-purple-200/60">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeclinePrompt(true)}
              className="text-red-600 hover:text-red-800 hover:bg-red-50 text-xs"
            >
              Decline Request
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleApprove}
              className="font-bold text-xs"
            >
              Approve & Begin Re-Evaluation
            </Button>
          </div>
        )}
      </Card>

      {/* Submitted Evidence & Deliverables */}
      {evaluation.deliverables && evaluation.deliverables.length > 0 && (
        <Card className="p-5 shadow-soft space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary">
            Submitted Deliverables & Evidence
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {evaluation.deliverables.map((del) => (
              <div 
                key={del.id}
                className="p-3.5 bg-[#FCFCFA] rounded-2xl border border-brand-border space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    {del.type === 'figma' ? (
                      <FigmaIcon className="w-4 h-4 text-purple-600 shrink-0" />
                    ) : (
                      <FileText className="w-4 h-4 text-brand-blue shrink-0" />
                    )}
                    <span className="font-bold text-brand-text-primary truncate">
                      {del.name}
                    </span>
                  </div>
                </div>

                {del.url && (
                  <div className="flex items-center justify-between gap-1 pt-1 border-t border-brand-border/60">
                    <span className="text-[10px] text-brand-blue truncate font-mono">
                      {del.url}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleCopyLink(del.url)}
                        className="p-1 rounded text-brand-text-secondary hover:text-brand-text-primary"
                        title="Copy URL"
                      >
                        {copiedUrl === del.url ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                      <a
                        href={del.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold text-brand-blue inline-flex items-center gap-0.5 hover:underline"
                      >
                        Open <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Side-by-Side Dual Column: Version 1 (Original) vs Version 2 (Revised Workspace) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ============================================================ */}
        {/* LEFT CARD: Version 1 (Original Finalized Evaluation)        */}
        {/* ============================================================ */}
        <Card className="p-6 shadow-soft space-y-5 bg-[#FDFDFD] border-brand-border">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <div>
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-brand-text-secondary" />
                <h3 className="text-sm font-bold text-brand-text-primary">
                  Version 1 (Original Finalized Grade)
                </h3>
              </div>
              <span className="text-[11px] text-brand-text-secondary block mt-0.5">
                Evaluated: {originalVersion.evaluatedAt || evaluation.evaluationDate} by {originalVersion.evaluatedBy || 'Rohan Mehta'}
              </span>
            </div>

            <span className="text-sm font-black text-brand-blue bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
              {originalVersion.score} / {maxScore} pts ({Math.round((originalVersion.score / maxScore) * 100)}%)
            </span>
          </div>

          {/* Original Criteria Breakdown */}
          <div className="space-y-3 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary block">
              Original Criteria Scores
            </span>

            <div className="space-y-3">
              {criteria.map((crit, idx) => {
                const origScore = originalVersion.criterionScores?.[crit.id] ?? '-';
                const origComment = originalVersion.criterionFeedback?.[crit.id] || 'No notes.';

                return (
                  <div 
                    key={crit.id || idx}
                    className="p-3.5 bg-[#FBFBFA] rounded-2xl border border-brand-border space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-brand-text-primary">
                        {idx + 1}. {crit.name}
                      </span>
                      <span className="font-bold text-brand-blue">
                        {origScore} / {crit.marks} pts
                      </span>
                    </div>
                    <p className="text-[11px] text-brand-text-secondary italic">
                      "{origComment}"
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Original Holistic Feedback */}
          <div className="space-y-3 pt-2 border-t border-brand-border text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary block">
              Original Feedback
            </span>

            <div className="p-3 bg-[#FBFBFA] rounded-xl border border-brand-border text-xs text-brand-text-primary space-y-1">
              <strong>General Remarks:</strong>
              <p className="text-[11px] text-brand-text-secondary leading-relaxed">
                {originalVersion.generalFeedback || 'Work meets baseline criteria.'}
              </p>
            </div>
          </div>
        </Card>

        {/* ============================================================ */}
        {/* RIGHT CARD: Version 2 (Revised Evaluation Workspace)        */}
        {/* ============================================================ */}
        <Card className="p-6 shadow-soft space-y-5 bg-white border-brand-border">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-brand-text-primary">
                  Version 2 (Revised Re-Evaluation Workspace)
                </h3>
              </div>
              <span className="text-[11px] text-emerald-700 font-medium block mt-0.5">
                Facilitator-controlled revised scoring
              </span>
            </div>

            <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
              Revised: {revisedTotalScore} / {maxScore} pts ({Math.round((revisedTotalScore / maxScore) * 100)}%)
            </span>
          </div>

          {/* Revised Criteria Scoring */}
          <div className="space-y-3 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary block">
              Modify Criterion Scores & Remarks
            </span>

            <div className="space-y-4">
              {criteria.map((crit, idx) => {
                const currentVal = revisedScores[crit.id] ?? '';
                const currentFeedback = revisedCriterionFeedback[crit.id] ?? '';

                return (
                  <div 
                    key={crit.id || idx}
                    className="p-3.5 rounded-2xl border border-brand-border bg-[#FCFCFA] space-y-2.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-brand-text-primary">
                          {idx + 1}. {crit.name}
                        </h4>
                        <span className="text-[10px] text-brand-text-secondary">
                          Max: {crit.marks} marks
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <label className="text-[11px] font-bold text-brand-text-secondary">Score:</label>
                        <input
                          type="number"
                          min="0"
                          max={crit.marks}
                          step="1"
                          disabled={isCompleted}
                          value={currentVal}
                          onChange={(e) => handleScoreChange(crit.id, e.target.value, crit.marks)}
                          className="w-14 px-2 py-1 text-center font-bold text-xs rounded-xl border border-brand-border bg-white focus:outline-none focus:border-brand-blue"
                        />
                        <span className="text-[11px] text-brand-text-secondary font-bold">/ {crit.marks}m</span>
                      </div>
                    </div>

                    <textarea
                      rows="2"
                      disabled={isCompleted}
                      value={currentFeedback}
                      onChange={(e) => handleFeedbackChange(crit.id, e.target.value)}
                      placeholder={`Revised feedback for ${crit.name}...`}
                      className="w-full p-2 text-xs rounded-xl border border-brand-border bg-white focus:outline-none focus:border-brand-blue text-brand-text-primary"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Holistic Feedback Adjustments */}
          <div className="space-y-3 pt-2 border-t border-brand-border text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary block">
              Revised Holistic Feedback
            </span>

            <div>
              <label className="text-[11px] font-bold text-brand-text-primary block mb-1">
                Revised Strengths
              </label>
              <textarea
                rows="2"
                disabled={isCompleted}
                value={revisedStrengths}
                onChange={(e) => setRevisedStrengths(e.target.value)}
                placeholder="Updated strengths..."
                className="w-full p-2 text-xs rounded-xl border border-brand-border bg-white focus:outline-none focus:border-brand-blue"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-brand-text-primary block mb-1">
                Revised Growth Areas
              </label>
              <textarea
                rows="2"
                disabled={isCompleted}
                value={revisedGrowthAreas}
                onChange={(e) => setRevisedGrowthAreas(e.target.value)}
                placeholder="Updated growth areas..."
                className="w-full p-2 text-xs rounded-xl border border-brand-border bg-white focus:outline-none focus:border-brand-blue"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-brand-text-primary block mb-1">
                Revised General Remarks
              </label>
              <textarea
                rows="2"
                disabled={isCompleted}
                value={revisedGeneralFeedback}
                onChange={(e) => setRevisedGeneralFeedback(e.target.value)}
                placeholder="Updated general remarks..."
                className="w-full p-2 text-xs rounded-xl border border-brand-border bg-white focus:outline-none focus:border-brand-blue"
              />
            </div>
          </div>

          {/* Re-evaluation Resolution Notes (Requirement 7 & 8) */}
          <div className="space-y-2 pt-2 border-t border-brand-border text-xs">
            <label className="font-bold text-brand-text-primary block">
              Re-Evaluation Resolution Notes (Required)
            </label>
            <p className="text-[11px] text-brand-text-secondary">
              Explain why marks were adjusted or retained based on the student's appeal and revised evidence.
            </p>
            <textarea
              rows="3"
              disabled={isCompleted}
              value={reEvaluationResolutionNotes}
              onChange={(e) => setReEvaluationResolutionNotes(e.target.value)}
              placeholder="e.g., Reviewed updated nested auto-layout constraints in Linear header. Fluid responsive resizing verified (+1 mark awarded on Criterion 1)."
              className="w-full p-2.5 text-xs rounded-xl border border-brand-border bg-[#FBFBFA] focus:outline-none focus:border-brand-blue"
            />
          </div>

          {/* Actions Footer */}
          {!isCompleted && (
            <div className="pt-4 border-t border-brand-border flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeclinePrompt(true)}
                className="text-red-600 hover:text-red-800 hover:bg-red-50 text-xs"
              >
                Decline Appeal
              </Button>

              <Button
                variant="primary"
                size="sm"
                icon={Send}
                iconPosition="left"
                onClick={() => setShowConfirmFinalize(true)}
                className="font-bold shadow-sm"
              >
                Finalize Re-Evaluation
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Confirmation Modal Before Finalizing Re-Evaluation */}
      {showConfirmFinalize && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-brand-border shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-brand-text-primary">
                Finalize Revised Evaluation (Version 2)?
              </h3>
              <p className="text-xs text-brand-text-secondary mt-1 leading-relaxed">
                This will resolve the re-evaluation request and publish Version 2 to the student while preserving Version 1 in the audit history.
              </p>
            </div>

            <div className="p-3.5 bg-[#FBFBFA] rounded-2xl border border-brand-border space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-brand-text-secondary">Original Grade:</span>
                <span className="font-bold text-brand-text-primary">{originalVersion.score} / {maxScore} pts</span>
              </div>
              <div className="flex justify-between items-center font-bold text-sm text-emerald-700 pt-1 border-t border-brand-border/60">
                <span>New Revised Grade:</span>
                <span>{revisedTotalScore} / {maxScore} pts</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirmFinalize(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleFinalizeRevision}
                className="font-bold"
              >
                Confirm & Publish Version 2
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Appeal Modal Prompt */}
      {showDeclinePrompt && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-brand-border shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <XCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-brand-text-primary">
                Decline Re-Evaluation Appeal
              </h3>
              <p className="text-xs text-brand-text-secondary mt-1 leading-relaxed">
                Provide a clear reason why the re-evaluation is declined. The original grade (Version 1) will remain unchanged.
              </p>
            </div>

            <textarea
              rows="3"
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="e.g., Reviewed appeal; original score of 18 accurately reflects fixed width constraints flagged in rubrics..."
              className="w-full p-3 text-xs rounded-xl border border-brand-border bg-[#FBFBFA] focus:outline-none focus:border-brand-blue"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeclinePrompt(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDecline}
              >
                Decline Request
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilitatorReEvaluation;
