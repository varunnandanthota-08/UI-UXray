import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import studentApi, { resolveAssignmentAction } from '../../api/studentApi';
import RubricPreview from '../../components/student/RubricPreview';
import { CardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import { 
  ArrowLeft, 
  Award, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  FileText, 
  SendHorizontal, 
  Clock,
  Layers,
  AlertCircle
} from 'lucide-react';

export const AssignmentDetails = () => {
  const { assignmentId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRubricOpen, setIsRubricOpen] = useState(false);
  const [rubricData, setRubricData] = useState(null);
  const [rubricLoading, setRubricLoading] = useState(false);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        setLoading(true);
        setError(null);
        const [asgRes, subRes, draftRes] = await Promise.all([
          studentApi.getAssignment(assignmentId),
          studentApi.getMySubmission(assignmentId),
          studentApi.getDraft(assignmentId)
        ]);
        if (asgRes?.data) {
          setAssignment(asgRes.data);
        } else {
          setError('Assignment not found');
        }
        setSubmission(subRes?.data || null);
        setHasDraft(Boolean(draftRes?.data && (draftRes.data.figmaUrl || draftRes.data.artifactValues)));
      } catch (err) {
        console.error('Error fetching assignment:', err);
        setError(err.message || 'Failed to load assignment details');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [assignmentId]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-24 bg-white rounded-2xl animate-pulse" />
        <CardSkeleton />
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <Link
            to="/student/courses"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-text-secondary hover:text-brand-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back to Courses</span>
          </Link>
        </div>
        <EmptyState
          icon={AlertCircle}
          title="Assignment not found"
          description={error || "We couldn't locate the requested assignment. It may have been moved or removed."}
          actionLabel="View All Courses"
          onAction={() => { window.location.href = '/student/courses'; }}
        />
      </div>
    );
  }

  const handleOpenRubric = async () => {
    setIsRubricOpen(true);
    if (!rubricData) {
      setRubricLoading(true);
      try {
        const res = await studentApi.getAssignmentRubric(assignment.id);
        const data = res?.data?.criteria || res?.data || assignment.rubric || [];
        setRubricData(data);
      } catch (err) {
        console.error('Failed to load rubric:', err);
        setRubricData(assignment.rubric || []);
      } finally {
        setRubricLoading(false);
      }
    }
  };

  const action = resolveAssignmentAction({
    assignmentId: assignment?.id,
    submission,
    hasDraft
  });

  const ctaLabel = action.label === 'Submit Assignment' ? 'Start Submission' : action.label;
  const ctaLink = action.link;
  const ctaIcon = action.isEvaluated ? Award : SendHorizontal;
  const displayStatus = action.badgeLabel;

  const requirements = Array.isArray(assignment?.requirements) ? assignment.requirements : [];
  const completedCount = requirements.filter((r) => r.completed).length;
  const totalCount = requirements.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const instructionsList = Array.isArray(assignment.instructions)
    ? assignment.instructions
    : typeof assignment.instructions === 'string' && assignment.instructions.trim()
    ? [assignment.instructions]
    : [];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          to={`/student/units/${assignment.unitId || 'unit-4'}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-text-secondary hover:text-brand-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Back to Unit</span>
        </Link>
      </div>

      {/* Assignment Header Card */}
      <div className="bg-white rounded-3xl border border-brand-border p-6 md:p-8 shadow-soft space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-blue bg-brand-blue-light px-2.5 py-1 rounded-full">
                Phase: {assignment.phase || 'Studio Sprint'}
              </span>
              <span className="text-xs text-brand-text-secondary">
                {assignment.courseTitle || 'UI/UX Product Design'} • Unit 0{assignment.assignmentNumber || 4}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-brand-text-primary tracking-tight">
              {assignment.title}
            </h1>

            <p className="text-xs md:text-sm text-brand-text-secondary max-w-2xl leading-relaxed">
              {assignment.description}
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-5 bg-[#F8F9F8] rounded-2xl border border-brand-border/70 shrink-0 min-w-[170px]">
            <span className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider">Maximum Marks</span>
            <span className="text-3xl font-black text-brand-blue mt-0.5">{assignment.maxScore || assignment.maxMarks || assignment.totalMarks || 20}</span>
            <span className="text-[11px] text-brand-text-secondary mt-0.5">Rubric Weighted</span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="pt-5 border-t border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs text-brand-text-secondary">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-brand-warning" />
              <span>Deadline: <strong className="text-brand-text-primary">{assignment.dueDateFormatted || assignment.dueDate || assignment.deadline || 'Upcoming'}</strong></span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-brand-text-secondary" />
              <span>Status: <strong className="text-brand-text-primary">{displayStatus}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              icon={Award}
              onClick={handleOpenRubric}
              isLoading={rubricLoading}
            >
              View Rubric
            </Button>

            <Link to={ctaLink}>
              <Button
                variant="primary"
                size="md"
                icon={ctaIcon}
                iconPosition="right"
              >
                {ctaLabel}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Submission Progress Bar Section */}
      <div className="bg-white rounded-3xl border border-brand-border p-6 shadow-soft space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-brand-text-primary">
              Submission Progress
            </h3>
            <p className="text-xs text-brand-text-secondary">
              Deliverable items required for submission. Partial submission is accepted.
            </p>
          </div>
          <div className="text-right">
            <span className="text-lg font-black text-brand-text-primary">
              {completedCount} / {totalCount}
            </span>
            <span className="text-xs text-brand-text-secondary ml-1 font-semibold">
              ({progressPercent}% Completed)
            </span>
          </div>
        </div>

        <div className="w-full bg-[#EFEFEA] h-3 rounded-full overflow-hidden">
          <div
            className="bg-brand-yellow h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex justify-between text-[11px] text-brand-text-secondary pt-1">
          <span>✓ {completedCount} Completed</span>
          <span>○ {totalCount - completedCount} Remaining</span>
        </div>
      </div>

      {/* Main Specs & Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Objective & Instructions */}
        <div className="md:col-span-6 space-y-6">
          {/* Learning Objective */}
          {assignment.objective && (
            <div className="bg-white rounded-3xl border border-brand-border p-6 md:p-7 shadow-soft space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-blue uppercase tracking-wider">
                <Layers className="w-4 h-4" />
                <span>Studio Objective</span>
              </div>
              <p className="text-xs md:text-sm text-brand-text-primary leading-relaxed">
                {assignment.objective}
              </p>
            </div>
          )}

          {/* Instructions */}
          {instructionsList.length > 0 && (
            <div className="bg-white rounded-3xl border border-brand-border p-6 md:p-7 shadow-soft space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-text-primary uppercase tracking-wider">
                <FileText className="w-4 h-4 text-brand-blue" />
                <span>Assignment Instructions</span>
              </div>
              <div className="space-y-3">
                {instructionsList.map((inst, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs md:text-sm text-brand-text-primary leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-brand-blue-light text-brand-blue font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{inst}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Requirements */}
        <div className="md:col-span-6 space-y-6">
          <div className="bg-white rounded-3xl border border-brand-border p-6 md:p-7 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-brand-text-primary uppercase tracking-wider">
                  Requirements
                </h3>
                <p className="text-[11px] text-brand-text-secondary mt-0.5">
                  Studio deliverable criteria
                </p>
              </div>
              <span className="text-xs font-bold text-brand-blue">
                {requirements.length} Items
              </span>
            </div>

            <div className="space-y-3">
              {requirements.map((req, idx) => (
                <div
                  key={req.requirementId || req.id || idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    req.completed
                      ? 'bg-[#F9FAF9] border-emerald-200/70'
                      : 'bg-[#FFFDF7] border-brand-border hover:border-[#D5D5CE]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <h4 className="text-xs font-bold text-brand-text-primary">
                      {req.title}
                    </h4>

                    <span
                      className={`text-xs font-semibold shrink-0 flex items-center gap-1 ${
                        req.completed ? 'text-brand-success' : 'text-brand-text-secondary'
                      }`}
                    >
                      {req.completed ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>✓ Complete</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-3.5 h-3.5 text-brand-text-secondary" />
                          <span>○ Incomplete</span>
                        </>
                      )}
                    </span>
                  </div>

                  <p className="text-[11px] text-brand-text-secondary mt-1 leading-relaxed">
                    {req.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Next Step Banner */}
            <div className="pt-2">
              <Link to={ctaLink}>
                <Button variant="primary" size="md" className="w-full" icon={ctaIcon} iconPosition="right">
                  {ctaLabel} →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Rubric Preview Modal */}
      <RubricPreview
        rubric={rubricData || assignment.rubric || []}
        maxScore={assignment.maxScore || assignment.maxMarks || assignment.totalMarks || 20}
        isOpen={isRubricOpen}
        onClose={() => setIsRubricOpen(false)}
      />
    </div>
  );
};

export default AssignmentDetails;
