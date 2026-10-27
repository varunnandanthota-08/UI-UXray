import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import studentApi from '../../api/studentApi';
import SubmissionTimeline from '../../components/student/SubmissionTimeline';
import Button from '../../components/ui/Button';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { 
  ArrowLeft, 
  Award, 
  ExternalLink 
} from 'lucide-react';
import FigmaIcon from '../../components/ui/FigmaIcon';

export const SubmissionDetails = () => {
  const { submissionId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        setLoading(true);
        const res = await studentApi.getSubmission(submissionId);
        setSubmission(res.data);
      } catch (err) {
        console.error('Error fetching submission details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [submissionId]);

  if (loading || !submission) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-white rounded-2xl animate-pulse" />
        <CardSkeleton />
      </div>
    );
  }

  const isPublished = submission.status === 'PUBLISHED' || submission.status === 'APPROVED';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          to="/student/submissions"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-text-secondary hover:text-brand-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Submissions</span>
        </Link>
      </div>

      {/* Header Info */}
      <div className="bg-white rounded-3xl border border-brand-border p-6 md:p-8 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-bold text-brand-blue bg-brand-blue-light px-2.5 py-0.5 rounded-md">
              {submission.id}
            </span>
            <span className="text-xs text-brand-text-secondary">
              {submission.courseTitle}
            </span>
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-brand-text-primary">
            {submission.assignmentTitle}
          </h1>

          <p className="text-xs text-brand-text-secondary mt-1">
            Submitted: {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'Recently'}
          </p>
        </div>

        {isPublished && submission.evaluationId && (
          <div>
            <Link to={`/student/evaluations/${submission.evaluationId}`}>
              <Button variant="primary" size="md" icon={Award} iconPosition="left">
                View Final Evaluation
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Visual Timeline component */}
      <SubmissionTimeline
        status={submission.status}
        timeline={submission.timeline}
      />

      {/* Submitted Artifacts Overview */}
      <div className="bg-white rounded-3xl border border-brand-border p-6 md:p-8 shadow-soft space-y-4">
        <h3 className="text-sm font-bold text-brand-text-primary tracking-tight">
          Submitted Artifacts
        </h3>

        <div className="space-y-3">
          {submission.artifacts?.figmaUrl && (
            <div className="p-3.5 bg-[#F9FAF9] rounded-2xl border border-brand-border flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <FigmaIcon className="w-4 h-4 shrink-0" />
                <div className="truncate">
                  <span className="font-semibold text-brand-text-primary">Figma Prototype: </span>
                  <span className="text-brand-text-secondary font-mono text-[11px] truncate">
                    {submission.artifacts.figmaUrl}
                  </span>
                </div>
              </div>
              <a
                href={submission.artifacts.figmaUrl}
                target="_blank"
                rel="noreferrer"
                className="text-brand-blue font-semibold inline-flex items-center gap-1 hover:underline ml-3 shrink-0"
              >
                <span>Open in Figma</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {Object.entries(submission.artifacts || {})
            .filter(([k]) => k !== 'figmaUrl')
            .map(([key, val]) => (
              <div key={key} className="p-3.5 bg-[#F9FAF9] rounded-2xl border border-brand-border text-xs space-y-1">
                <span className="font-bold text-brand-text-primary capitalize">
                  {key.replace(/([A-Z])/g, ' $1')}:
                </span>
                <p className="text-brand-text-secondary leading-relaxed font-sans">
                  {String(val)}
                </p>
              </div>
            ))}
        </div>

        {/* Requirements Scope (Partial / Complete Breakdown) */}
        {((submission.completedRequirements && submission.completedRequirements.length > 0) || (submission.incompleteRequirements && submission.incompleteRequirements.length > 0)) && (
          <div className="pt-4 border-t border-brand-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-text-primary uppercase tracking-wider">
                Requirements Scope:
              </span>
              <span className="text-xs font-semibold text-brand-text-secondary">
                {submission.completedRequirements?.length || 0} completed • {submission.incompleteRequirements?.length || 0} incomplete
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Completed items */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-success">
                  Completed Deliverables
                </span>
                {submission.completedRequirements?.map((item, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-brand-success-bg/40 border border-emerald-200/60 flex items-center gap-2 text-brand-text-primary">
                    <span className="text-brand-success font-bold">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Incomplete items */}
              {submission.incompleteRequirements && submission.incompleteRequirements.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-warning">
                    Incomplete Deliverables
                  </span>
                  {submission.incompleteRequirements.map((item, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-[#FFFDF7] border border-amber-200/70 flex items-center gap-2 text-brand-text-secondary">
                      <span className="text-brand-warning">○</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionDetails;
