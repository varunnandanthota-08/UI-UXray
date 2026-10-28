import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import studentApi from '../../api/studentApi';
import CriterionScore from '../../components/student/CriterionScore';
import EvidenceCard from '../../components/student/EvidenceCard';
import FeedbackSection from '../../components/student/FeedbackSection';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { CardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { 
  ArrowLeft, 
  ShieldCheck, 
  HelpCircle,
  AlertCircle,
  Clock,
  SendHorizontal,
  X,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';

export const EvaluationDetails = () => {
  const { evaluationId } = useParams();
  const [evaluation, setEvaluation] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [reEvaluation, setReEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal & form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reEvalReason, setReEvalReason] = useState('');
  const [reEvalSubmitting, setReEvalSubmitting] = useState(false);
  const [reEvalError, setReEvalError] = useState(null);
  const [reEvalSuccessMsg, setReEvalSuccessMsg] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const evalRes = await studentApi.getEvaluation(evaluationId);
        if (evalRes?.data) {
          setEvaluation(evalRes.data);

          // Fetch matching submission to ensure accurate attempt & canvas links
          if (evalRes.data.submissionId) {
            try {
              const subRes = await studentApi.getSubmission(evalRes.data.submissionId);
              if (subRes?.data) {
                setSubmission(subRes.data);
              }
            } catch {
              // Graceful if submission details are unavailable
            }
          }

          // Fetch any existing re-evaluation request for this evaluation
          try {
            const reEvalRes = await studentApi.getReEvaluation(evaluationId);
            if (reEvalRes?.data) {
              setReEvaluation(reEvalRes.data);
            } else if (evalRes.data.reEvaluation) {
              setReEvaluation(evalRes.data.reEvaluation);
            }
          } catch {
            // No prior re-evaluation request
          }
        } else {
          setError('Evaluation not found');
        }
      } catch (err) {
        console.error('Error fetching evaluation:', err);
        setError(err.message || 'Failed to load evaluation details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [evaluationId]);

  const handleOpenModal = () => {
    setReEvalError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (!reEvalSubmitting) {
      setIsModalOpen(false);
      setReEvalError(null);
    }
  };

  const handleSubmitReEvaluation = async (e) => {
    e.preventDefault();
    const cleanReason = reEvalReason.trim();

    if (cleanReason.length < 10) {
      setReEvalError('Please provide a reason of at least 10 characters explaining what you would like reviewed.');
      return;
    }
    if (cleanReason.length > 500) {
      setReEvalError('Reason cannot exceed 500 characters.');
      return;
    }

    setReEvalSubmitting(true);
    setReEvalError(null);

    try {
      const payload = {
        evaluationId: evaluation.id || evaluation._id || evaluationId,
        assignmentId: evaluation.assignmentId?._id || evaluation.assignmentId,
        submissionId: evaluation.submissionId?._id || evaluation.submissionId,
        reason: cleanReason
      };

      const res = await studentApi.requestReEvaluation(payload);
      if (res?.data) {
        setReEvaluation(res.data);
        setReEvalSuccessMsg('Re-evaluation request submitted successfully. Lead facilitator will review during studio hours.');
        setIsModalOpen(false);
        setReEvalReason('');
      } else {
        throw new Error('Failed to record re-evaluation request');
      }
    } catch (err) {
      console.error('Re-evaluation submission error:', err);
      const msg = err.response?.data?.message || err.message || 'Unable to submit request. Please try again.';
      setReEvalError(msg);
      // Note: reEvalReason is preserved so student does not lose their input
    } finally {
      setReEvalSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-24 bg-white rounded-2xl animate-pulse" />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (error || !evaluation) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <Link
            to="/student/submissions"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-text-secondary hover:text-brand-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back to Submissions</span>
          </Link>
        </div>
        <EmptyState
          icon={AlertCircle}
          title="Evaluation not found"
          description={error || "We couldn't locate the requested evaluation. Your submission may still be under review or pending grading."}
          actionLabel="View All Submissions"
          onAction={() => { window.location.href = '/student/submissions'; }}
        />
      </div>
    );
  }

  const criteriaList = Array.isArray(evaluation.criteriaBreakdown) ? evaluation.criteriaBreakdown : [];
  const isReEvalPending = reEvaluation && ['REQUESTED', 'UNDER_REVIEW', 'pending', 'under_review'].includes(reEvaluation.status);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Top Navigation & Action */}
      <div className="flex items-center justify-between">
        <Link
          to="/student/submissions"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-text-secondary hover:text-brand-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Submissions</span>
        </Link>

        {isReEvalPending ? (
          <Badge variant="yellow" size="md" dot>
            Re-evaluation Pending
          </Badge>
        ) : (
          <Button
            variant="outline"
            size="sm"
            icon={HelpCircle}
            onClick={handleOpenModal}
          >
            Request Re-evaluation
          </Button>
        )}
      </div>

      {/* Success notification banner if recently submitted */}
      {reEvalSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start justify-between gap-3 text-xs text-emerald-900">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{reEvalSuccessMsg}</span>
          </div>
          <button
            onClick={() => setReEvalSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. Assessment summary, approval status, score, and evaluator */}
      {/* ------------------------------------------------------------- */}
      <section className="bg-white rounded-3xl border border-brand-border p-6 md:p-8 shadow-card space-y-6" aria-labelledby="assessment-summary-heading">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-brand-border">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-brand-blue uppercase tracking-wider bg-brand-blue-light px-2.5 py-1 rounded-full">
                Verified Outcome
              </span>
              <Badge variant="success" size="sm" dot>
                Approved by Lead Facilitator
              </Badge>
            </div>

            <h1 id="assessment-summary-heading" className="text-xl md:text-2xl font-black text-brand-text-primary">
              {evaluation.assignmentTitle || 'Recreated a Real Screen in Figma'}
            </h1>

            <p className="text-xs text-brand-text-secondary">
              Evaluated on {evaluation.evaluatedAt || 'Recently'} for <strong>{evaluation.studentName || 'Student'}</strong>
            </p>
          </div>

          {/* Assessment Score Hero Badge */}
          <div className="p-6 bg-gradient-to-br from-[#FFFDF7] to-brand-yellow-light/40 rounded-3xl border-2 border-brand-yellow text-center shrink-0 min-w-[200px]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#946F00] block">
              Your Assessment
            </span>
            <div className="mt-1 flex items-baseline justify-center gap-1">
              <span className="text-4xl font-black text-brand-text-primary">
                {evaluation.score}
              </span>
              <span className="text-base font-bold text-brand-text-secondary">
                / {evaluation.maxScore}
              </span>
            </div>
            <div className="mt-2">
              <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold bg-brand-yellow text-brand-text-primary">
                {evaluation.gradeBadge || 'Strong Pass'} ({evaluation.percentage ?? Math.round(((evaluation.score || 0) / (evaluation.maxScore || 20)) * 100)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Lead Facilitator Evaluator Bar */}
        <div className="flex items-center justify-between text-xs text-brand-text-secondary bg-[#F8F9F8] p-3.5 rounded-2xl border border-brand-border/60">
          <div className="flex items-center gap-2.5">
            {evaluation.facilitator?.avatar && (
              <img
                src={evaluation.facilitator.avatar}
                alt={evaluation.facilitator.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-brand-border"
              />
            )}
            <div>
              <span className="font-semibold text-brand-text-primary">Evaluator: </span>
              <span>{evaluation.facilitator?.name || 'Rohan Mehta'} ({evaluation.facilitator?.role || 'Lead Design Facilitator'})</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-brand-blue font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Final Approved Assessment</span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2. Criterion breakdown */}
      {/* ------------------------------------------------------------- */}
      {criteriaList.length > 0 && (
        <section className="space-y-4" aria-labelledby="criterion-breakdown-heading">
          <div>
            <h2 id="criterion-breakdown-heading" className="text-base font-bold text-brand-text-primary">
              Criterion Breakdown
            </h2>
            <p className="text-xs text-brand-text-secondary mt-0.5">
              Detailed points, observations, and targeted actions scored against each rubric milestone.
            </p>
          </div>

          <div className="space-y-3">
            {criteriaList.map((criterion) => (
              <CriterionScore key={criterion.id} criterion={criterion} />
            ))}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. Observed evidence and submission-frame links */}
      {/* ------------------------------------------------------------- */}
      {criteriaList.some((c) => c.evidence) && (
        <section className="space-y-4" aria-labelledby="evidence-heading">
          <div>
            <h2 id="evidence-heading" className="text-base font-bold text-brand-text-primary">
              Observed Evidence & Frame Inspect
            </h2>
            <p className="text-xs text-brand-text-secondary mt-0.5">
              Specific design elements and component tokens reviewed directly from your Figma canvas.
            </p>
          </div>

          <div className="space-y-3">
            {criteriaList.map((crit) => (
              <EvidenceCard
                key={crit.id}
                criterionTitle={crit.title}
                score={crit.score}
                maxScore={crit.maxScore}
                evidence={crit.evidence}
                frameUrl={crit.evidence?.url || crit.evidence?.frameUrl || submission?.artifacts?.figmaUrl || submission?.figmaUrl}
              />
            ))}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. Educational feedback: What Went Well, What to Improve,     */}
      {/*    Why It Matters, Suggested Improvement Action              */}
      {/* ------------------------------------------------------------- */}
      {evaluation.feedbackSections && (
        <section className="space-y-4" aria-labelledby="educational-feedback-heading">
          <div>
            <h2 id="educational-feedback-heading" className="text-base font-bold text-brand-text-primary">
              Educational Feedback
            </h2>
            <p className="text-xs text-brand-text-secondary mt-0.5">
              Structured design guidance across strengths, improvement areas, and impact on production quality.
            </p>
          </div>

          <FeedbackSection
            feedbackSections={evaluation.feedbackSections}
            showFacilitatorComments={false}
          />
        </section>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. Facilitator comments                                       */}
      {/* ------------------------------------------------------------- */}
      {(evaluation.feedbackSections?.facilitatorComments || evaluation.facilitatorComments) && (
        <section className="space-y-3" aria-labelledby="facilitator-comments-heading">
          <div>
            <h2 id="facilitator-comments-heading" className="text-base font-bold text-brand-text-primary">
              Facilitator Comments
            </h2>
            <p className="text-xs text-brand-text-secondary mt-0.5">
              Personalized mentorship guidance from the studio review session.
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#F5F8FF] to-white rounded-3xl border border-brand-blue/20 p-6 md:p-7 shadow-soft space-y-3">
            <div className="flex items-center gap-2 text-brand-blue font-bold text-xs uppercase tracking-wider">
              <MessageSquare className="w-4 h-4" />
              <span>Studio Review Note</span>
            </div>
            <blockquote className="text-sm md:text-base text-brand-text-primary leading-relaxed bg-white/80 p-5 rounded-2xl border border-brand-blue/15 italic">
              "{evaluation.feedbackSections?.facilitatorComments || evaluation.facilitatorComments}"
            </blockquote>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. Request Re-evaluation section                             */}
      {/* ------------------------------------------------------------- */}
      <section className="space-y-3" aria-labelledby="reevaluation-heading">
        <h2 id="reevaluation-heading" className="sr-only">
          Request Re-evaluation
        </h2>

        {reEvaluation ? (
          <div className="bg-white rounded-3xl border border-brand-border p-6 md:p-8 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-brand-border">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#946F00]" />
                <h3 className="text-sm font-bold text-brand-text-primary">
                  Re-evaluation Request
                </h3>
              </div>
              <Badge
                variant={
                  reEvaluation.status === 'UNDER_REVIEW'
                    ? 'blue'
                    : reEvaluation.status === 'RESOLVED' || reEvaluation.status === 'COMPLETED'
                    ? 'success'
                    : reEvaluation.status === 'REJECTED'
                    ? 'error'
                    : 'yellow'
                }
                size="md"
                dot
              >
                {reEvaluation.status === 'UNDER_REVIEW'
                  ? 'Under Mentor Review'
                  : reEvaluation.status === 'RESOLVED' || reEvaluation.status === 'COMPLETED'
                  ? 'Resolved'
                  : reEvaluation.status === 'REJECTED'
                  ? 'Rejected'
                  : 'Requested'}
              </Badge>
            </div>

            <div className="space-y-3 text-xs text-brand-text-secondary leading-relaxed">
              <p>
                Submitted on <strong>{reEvaluation.requestedAt ? new Date(reEvaluation.requestedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : (reEvaluation.submittedDateDisplay || 'Recently')}</strong> for lead facilitator review.
              </p>

              <div className="p-4 bg-brand-surface rounded-2xl border border-brand-border text-xs space-y-1">
                <span className="font-semibold text-brand-text-primary block">
                  Your Reason Submitted:
                </span>
                <p className="italic text-brand-text-secondary">
                  "{reEvaluation.reason}"
                </p>
              </div>

              {reEvaluation.facilitatorNotes && (
                <div className="p-4 bg-brand-blue-light/40 border border-brand-blue/20 rounded-2xl text-xs space-y-1">
                  <span className="font-semibold text-brand-blue block">
                    Facilitator Response:
                  </span>
                  <p className="text-brand-text-primary italic">
                    "{reEvaluation.facilitatorNotes}"
                  </p>
                </div>
              )}

              {isReEvalPending ? (
                <p className="text-[11px] text-brand-text-secondary">
                  Duplicate requests cannot be submitted while a review is pending. Approved marks will only be updated if the facilitator approves a revision during review.
                </p>
              ) : (
                <div className="pt-2 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={HelpCircle}
                    onClick={handleOpenModal}
                  >
                    Submit New Request
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-brand-border p-6 md:p-8 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2 text-brand-blue font-bold text-xs uppercase tracking-wider">
                <HelpCircle className="w-4 h-4" />
                <span>Re-evaluation Inquiry</span>
              </div>
              <h3 className="text-base font-bold text-brand-text-primary">
                Think something needs another look?
              </h3>
              <p className="text-xs text-brand-text-secondary leading-relaxed">
                You can submit a polite re-evaluation request for lead facilitator review. Requests are reviewed independently during studio office hours and do not guarantee a score change.
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              icon={HelpCircle}
              onClick={handleOpenModal}
              className="shrink-0"
            >
              Request Re-evaluation
            </Button>
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------- */}
      {/* Re-evaluation Confirmation Modal Dialog                       */}
      {/* ------------------------------------------------------------- */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-white rounded-3xl border border-brand-border shadow-xl max-w-lg w-full p-6 md:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-brand-border">
              <div>
                <span className="text-[11px] font-bold text-brand-blue uppercase tracking-wider bg-brand-blue-light px-2.5 py-0.5 rounded-full">
                  Confirmation Form
                </span>
                <h3 id="modal-title" className="text-lg font-black text-brand-text-primary mt-1">
                  Request Re-evaluation
                </h3>
                <p className="text-xs text-brand-text-secondary mt-0.5">
                  {evaluation.assignmentTitle} • Current Score: <strong>{evaluation.score}/{evaluation.maxScore}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={reEvalSubmitting}
                className="p-1 rounded-lg text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-surface transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error banner if submission failed (retains student's reason) */}
            {reEvalError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-2xl flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold">Unable to submit request</p>
                  <p className="text-red-700">{reEvalError}</p>
                </div>
              </div>
            )}

            {/* Academic Boundary Disclosure */}
            <div className="p-3.5 bg-brand-blue-light/50 border border-brand-blue/20 rounded-2xl text-xs text-brand-blue leading-relaxed">
              <strong>Academic Boundary:</strong> Your request will be forwarded directly to Lead Facilitator {evaluation.facilitator?.name || 'Rohan Mehta'} for review. Submitting does not guarantee a score change, and approved marks are never modified automatically.
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitReEvaluation} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="reeval-reason" className="block text-xs font-bold text-brand-text-primary">
                  Specific Criterion or Feedback to Review <span className="text-brand-error">*</span>
                </label>
                <p className="text-[11px] text-brand-text-secondary">
                  Explain clearly which criterion or evidence you would like re-examined, referencing specific Figma frames or components.
                </p>
                <textarea
                  id="reeval-reason"
                  rows={4}
                  maxLength={500}
                  required
                  value={reEvalReason}
                  onChange={(e) => setReEvalReason(e.target.value)}
                  placeholder="E.g., In the User Flow & State Fidelity criterion, the return path affordance was included on canvas frame '03_Drawer_v2' (Node 103:45) with an explicit back button..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-brand-border bg-[#FAFAF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-text-primary transition-all leading-relaxed"
                />
                <div className="flex items-center justify-between text-[11px] text-brand-text-secondary pt-0.5">
                  <span>Minimum 10 characters</span>
                  <span className={reEvalReason.length > 480 ? 'text-brand-warning font-semibold' : ''}>
                    {reEvalReason.length} / 500 characters
                  </span>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-brand-border">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleCloseModal}
                  disabled={reEvalSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={reEvalReason.trim().length < 10 || reEvalSubmitting}
                  isLoading={reEvalSubmitting}
                  icon={SendHorizontal}
                  iconPosition="right"
                >
                  Submit Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationDetails;
