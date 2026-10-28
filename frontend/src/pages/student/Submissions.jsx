import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import studentApi from '../../api/studentApi';
import { getStatusMeta } from '../../components/student/SubmissionTimeline';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { CardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { SendHorizontal, Award } from 'lucide-react';

export const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const res = await studentApi.getStudentSubmissions();
        setSubmissions(res.data || []);
      } catch (err) {
        console.error('Error fetching submissions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-brand-border p-6 md:p-8 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-blue-light text-brand-blue flex items-center justify-center">
            <SendHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-brand-text-primary">
              My Submissions & Outcomes
            </h1>
            <p className="text-xs text-brand-text-secondary mt-0.5">
              Track processing status, automated checks, and published mentor grades.
            </p>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : submissions.length === 0 ? (
        <EmptyState
          icon={SendHorizontal}
          title="No submissions yet"
          description="You have not submitted any assignments yet. Start by working on your current studio sprint."
        />
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => {
            const meta = getStatusMeta(sub.status);
            const isPublished = (sub.status === 'PUBLISHED' || sub.status === 'APPROVED' || sub.evaluationStatus === 'FINALIZED') && Boolean(sub.evaluationId);
            const hasScore = isPublished && sub.score !== null && sub.score !== undefined;
            const attemptNumber = sub.attempt || sub.attemptNumber || 1;

            return (
              <div
                key={sub.id}
                className="bg-white rounded-2xl border border-brand-border p-5 md:p-6 shadow-soft hover:shadow-card hover:border-[#D5D5CE] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-brand-text-secondary">
                      {sub.id}
                    </span>
                    <Badge variant={meta.variant} size="sm" dot>
                      {meta.label}
                    </Badge>
                    <span className="text-[11px] font-semibold text-brand-text-secondary bg-[#F8F9F8] px-2 py-0.5 rounded-md border border-brand-border/60">
                      Attempt {attemptNumber}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-brand-text-primary">
                    {sub.assignmentTitle}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-brand-text-secondary">
                    <span>{sub.courseTitle || 'UI/UX Product Design'}</span>
                    <span>•</span>
                    <span>Submitted: {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'Recently'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-brand-border/60">
                  {hasScore ? (
                    <div className="text-right">
                      <span className="text-lg font-black text-brand-blue">
                        {sub.score}
                      </span>
                      <span className="text-xs text-brand-text-secondary font-medium">
                        {' '}/ {sub.maxScore || 20}
                      </span>
                    </div>
                  ) : (
                    <div className="text-right">
                      <span className="text-xs font-semibold text-brand-text-secondary">
                        Under Review
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Link to={`/student/submissions/${sub.id}`}>
                      <Button variant="outline" size="sm">
                        View Submission
                      </Button>
                    </Link>

                    {isPublished && (
                      <Link to={`/student/evaluations/${sub.evaluationId}`}>
                        <Button variant="primary" size="sm" icon={Award}>
                          View Evaluation
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Submissions;
