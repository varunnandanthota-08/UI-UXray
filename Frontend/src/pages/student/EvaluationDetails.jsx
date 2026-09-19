import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import studentApi from '../../api/studentApi';
import CriterionScore from '../../components/student/CriterionScore';
import EvidenceCard from '../../components/student/EvidenceCard';
import FeedbackSection from '../../components/student/FeedbackSection';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { 
  ArrowLeft, 
  ShieldCheck, 
  HelpCircle 
} from 'lucide-react';

export const EvaluationDetails = () => {
  const { evaluationId } = useParams();
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        setLoading(true);
        const res = await studentApi.getEvaluation(evaluationId);
        setEvaluation(res.data);
      } catch (err) {
        console.error('Error fetching evaluation:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluation();
  }, [evaluationId]);

  if (loading || !evaluation) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-white rounded-2xl animate-pulse" />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          to="/student/submissions"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-text-secondary hover:text-brand-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Submissions</span>
        </Link>

        <Link to={`/student/re-evaluation/${evaluation.id}`}>
          <Button variant="outline" size="sm" icon={HelpCircle}>
            Request Re-evaluation
          </Button>
        </Link>
      </div>

      {/* Assessment Summary Card */}
      <div className="bg-white rounded-3xl border border-brand-border p-6 md:p-8 shadow-card space-y-6">
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

            <h1 className="text-xl md:text-2xl font-black text-brand-text-primary">
              {evaluation.assignmentTitle}
            </h1>

            <p className="text-xs text-brand-text-secondary">
              Evaluated on {evaluation.evaluatedAt} for <strong>{evaluation.studentName}</strong>
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
                {evaluation.gradeBadge || 'Strong Pass'} ({evaluation.percentage}%)
              </span>
            </div>
          </div>
        </div>

        {/* Lead Facilitator Note */}
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
              <span>{evaluation.facilitator?.name || 'Rohan Mehta'} ({evaluation.facilitator?.role || 'Lead Facilitator'})</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-brand-blue font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Final Approved Assessment</span>
          </div>
        </div>
      </div>

      {/* Criterion Breakdown Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-brand-text-primary">
            Criterion Breakdown
          </h3>
          <p className="text-xs text-brand-text-secondary mt-0.5">
            Detailed points and observations scored against each rubric milestone.
          </p>
        </div>

        <div className="space-y-3">
          {evaluation.criteriaBreakdown?.map((criterion) => (
            <CriterionScore key={criterion.id} criterion={criterion} />
          ))}
        </div>
      </div>

      {/* Evidence Cards */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-brand-text-primary">
            Observed Evidence & Frame Inspect
          </h3>
          <p className="text-xs text-brand-text-secondary mt-0.5">
            Specific design elements and component tokens reviewed directly from your Figma canvas.
          </p>
        </div>

        <div className="space-y-3">
          {evaluation.criteriaBreakdown?.map((crit) => (
            <EvidenceCard
              key={crit.id}
              criterionTitle={crit.title}
              score={crit.score}
              maxScore={crit.maxScore}
              evidence={crit.evidence}
              onViewSubmission={() => {
                alert(`Direct link to node ${crit.evidence?.component || 'component'} on canvas.`);
              }}
            />
          ))}
        </div>
      </div>

      {/* Holistic Educational Feedback */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-brand-text-primary">
            Actionable Educational Feedback
          </h3>
          <p className="text-xs text-brand-text-secondary mt-0.5">
            Structured design feedback to guide your growth in the Barabari Collective studio.
          </p>
        </div>

        <FeedbackSection
          feedbackSections={evaluation.feedbackSections}
          facilitator={evaluation.facilitator}
        />
      </div>

      {/* Re-evaluation Banner */}
      <div className="bg-white rounded-3xl border border-brand-border p-6 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-brand-text-primary">
            Think something needs another look?
          </h4>
          <p className="text-xs text-brand-text-secondary mt-0.5">
            You can submit a polite re-evaluation request for lead facilitator review.
          </p>
        </div>
        <Link to={`/student/re-evaluation/${evaluation.id}`}>
          <Button variant="secondary" size="md">
            Request Re-evaluation
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default EvaluationDetails;
