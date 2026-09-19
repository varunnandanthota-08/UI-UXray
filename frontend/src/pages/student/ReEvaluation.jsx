import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import studentApi from '../../api/studentApi';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { 
  ArrowLeft, 
  Clock, 
  ShieldAlert, 
  SendHorizontal 
} from 'lucide-react';

export const ReEvaluation = () => {
  const { evaluationId } = useParams();
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [existingRequest, setExistingRequest] = useState(null);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [evalRes, reqRes] = await Promise.all([
          studentApi.getEvaluation(evaluationId),
          studentApi.getReEvaluation(evaluationId)
        ]);
        setEvaluation(evalRes.data);
        if (reqRes?.data) {
          setExistingRequest(reqRes.data);
        }
      } catch (err) {
        console.error('Error loading re-evaluation data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [evaluationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        evaluationId,
        assignmentId: evaluation?.assignmentId,
        reason: reason.trim()
      };
      const res = await studentApi.requestReEvaluation(payload);
      setExistingRequest(res.data);
      setSubmittedSuccess(true);
    } catch (err) {
      console.error('Error submitting re-evaluation:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !evaluation) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-white rounded-2xl animate-pulse" />
        <CardSkeleton />
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'REQUESTED':
        return <Badge variant="yellow" size="md" dot>Requested</Badge>;
      case 'UNDER_REVIEW':
        return <Badge variant="blue" size="md" dot>Under Mentor Review</Badge>;
      case 'RESOLVED':
        return <Badge variant="success" size="md" dot>Resolved</Badge>;
      case 'REJECTED':
        return <Badge variant="error" size="md" dot>Rejected</Badge>;
      default:
        return <Badge variant="neutral" size="md">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          to={`/student/evaluations/${evaluation.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-text-secondary hover:text-brand-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assessment View</span>
        </Link>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-3xl border border-brand-border p-6 md:p-8 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
          <div>
            <span className="text-[11px] font-bold text-brand-blue uppercase tracking-wider bg-brand-blue-light px-2.5 py-1 rounded-full">
              Re-evaluation Request
            </span>
            <h1 className="text-xl md:text-2xl font-black text-brand-text-primary mt-1.5">
              {evaluation.assignmentTitle}
            </h1>
          </div>

          <div className="text-left sm:text-right p-3 bg-[#F8F9F8] rounded-2xl border border-brand-border/60">
            <span className="text-[11px] text-brand-text-secondary block">Current Assessment</span>
            <span className="text-xl font-black text-brand-blue">
              {evaluation.score} <span className="text-xs font-medium text-brand-text-secondary">/ {evaluation.maxScore}</span>
            </span>
          </div>
        </div>

        {/* Existing Request Status Banner */}
        {existingRequest ? (
          <div className="space-y-4 pt-2">
            <div className="p-5 bg-brand-yellow-light/50 border border-amber-200/80 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#946F00]" />
                  <span className="text-xs font-bold text-[#946F00] uppercase tracking-wider">
                    Re-evaluation Status
                  </span>
                </div>
                {getStatusBadge(existingRequest.status)}
              </div>

              <div className="text-xs text-brand-text-primary space-y-1.5">
                <p>
                  <strong>Reason Submitted:</strong>
                </p>
                <p className="p-3 bg-white rounded-xl border border-amber-200/60 text-brand-text-secondary italic">
                  "{existingRequest.reason}"
                </p>
              </div>

              <p className="text-[11px] text-brand-text-secondary leading-relaxed">
                Your request is recorded. Lead facilitator {evaluation.facilitator?.name || 'Rohan Mehta'} will review the submission frame notes during studio hours.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <Link to={`/student/evaluations/${evaluation.id}`}>
                <Button variant="outline" size="md">
                  Return to Assessment
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-brand-text-primary">
                Think something needs another look?
              </h3>
              <p className="text-xs text-brand-text-secondary leading-relaxed">
                Please state respectfully which criterion or observation you would like the facilitator to re-examine, pointing to the specific Figma node or frame.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-text-primary mb-1.5">
                Reason for Re-evaluation <span className="text-brand-error">*</span>
              </label>
              <textarea
                rows={5}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="E.g., In the 'User Flow & State Fidelity' criterion, the back navigation affordance was added in frame 'Checkout_v2' (Node 123:45) which may have been overlooked during the automated scan..."
                className="w-full px-3.5 py-3 text-xs rounded-xl border border-brand-border bg-[#FAFAF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-text-primary transition-all leading-relaxed"
              />
            </div>

            <div className="p-3.5 bg-brand-blue-light/50 border border-brand-blue/15 rounded-2xl flex items-start gap-2.5 text-xs text-brand-blue">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Academic Boundary:</strong> Submitting a request does not directly modify or guarantee a score change. The facilitator maintains independent grading authority.
              </span>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-brand-border">
              <Link to={`/student/evaluations/${evaluation.id}`}>
                <Button variant="outline" size="md">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={!reason.trim()}
                isLoading={isSubmitting}
                icon={SendHorizontal}
                iconPosition="right"
              >
                Submit Re-evaluation Request
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReEvaluation;
