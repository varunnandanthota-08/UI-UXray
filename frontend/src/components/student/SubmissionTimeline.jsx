import { CheckCircle2, Clock, Check, Sparkles, UserCheck } from 'lucide-react';
import Badge from '../ui/Badge';

/**
 * Maps technical backend status to student-facing stage and friendly label
 */
export const getStatusMeta = (status) => {
  const s = String(status || '').toUpperCase();
  switch (s) {
    case 'DRAFT':
      return { label: 'Draft', variant: 'neutral', activeIndex: 0 };
    case 'SUBMITTED':
      return { label: 'Submitted', variant: 'blue', activeIndex: 0 };
    case 'PROCESSING':
      return { label: 'Validating Figma File', variant: 'yellow', activeIndex: 1 };
    case 'AUTOMATED_ANALYSIS_COMPLETE':
      return { label: 'Automated Checks Finished', variant: 'blue', activeIndex: 2 };
    case 'NEEDS_REVIEW':
    case 'FACILITATOR_REVIEWED':
    case 'UNDER_REVIEW':
      return { label: 'In Facilitator Review', variant: 'yellow', activeIndex: 3 };
    case 'APPROVED':
    case 'PUBLISHED':
    case 'EVALUATED':
      return { label: 'Evaluation Published', variant: 'success', activeIndex: 4 };
    case 'FAILED':
      return { label: 'Needs Student Attention', variant: 'error', activeIndex: 1 };
    default:
      return { label: status || 'Pending', variant: 'neutral', activeIndex: 1 };
  }
};

export const SubmissionTimeline = ({ status = 'SUBMITTED', timeline = [] }) => {
  const meta = getStatusMeta(status);

  const steps = [
    {
      key: 'SUBMITTED',
      title: 'Submitted',
      description: 'Your design links and UX artifacts were securely recorded.',
      icon: CheckCircle2,
    },
    {
      key: 'PROCESSING',
      title: 'Processing',
      description: 'Verifying public link permissions and extracting frame hierarchy.',
      icon: Clock,
    },
    {
      key: 'AUTOMATED_ANALYSIS',
      title: 'Automated Analysis',
      description: 'Spatial 8pt grid, typographic scale, and layer consistency checks.',
      icon: Sparkles,
    },
    {
      key: 'FACILITATOR_REVIEW',
      title: 'Facilitator Review',
      description: 'Lead design mentor evaluates craft, heuristic logic, and rubric depth.',
      icon: UserCheck,
    },
    {
      key: 'PUBLISHED',
      title: 'Published',
      description: 'Final score, actionable evidence, and holistic feedback available.',
      icon: Check,
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-brand-border p-6 md:p-8 shadow-soft">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 pb-6 border-b border-brand-border">
        <div>
          <h3 className="text-lg font-bold text-brand-text-primary">
            Submission Progress
          </h3>
          <p className="text-xs text-brand-text-secondary mt-0.5">
            Transparent tracking of your work through automated validation and mentor grading.
          </p>
        </div>
        <div>
          <Badge variant={meta.variant} size="lg" dot>
            {meta.label}
          </Badge>
        </div>
      </div>

      {/* Visual Step-by-step Timeline */}
      <div className="relative pl-6 md:pl-8 space-y-8 before:absolute before:left-[15px] md:before:left-[19px] before:top-3 before:bottom-3 before:w-0.5 before:bg-brand-border">
        {steps.map((step, idx) => {
          const isDone = idx < meta.activeIndex || (idx === meta.activeIndex && (status === 'PUBLISHED' || status === 'APPROVED'));
          const isCurrent = idx === meta.activeIndex && status !== 'PUBLISHED' && status !== 'APPROVED';

          // Find custom timestamp from timeline if provided
          const timelineEntry = timeline?.find((t) => t.step === step.key) || null;

          return (
            <div key={step.key} className="relative flex items-start gap-4 group">
              {/* Step indicator circle */}
              <div
                className={`absolute -left-[27px] md:-left-[31px] w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isDone
                    ? 'bg-brand-success text-white shadow-xs'
                    : isCurrent
                    ? 'bg-brand-blue text-white ring-4 ring-brand-blue-light animate-pulse'
                    : 'bg-white border-2 border-brand-border text-brand-text-secondary'
                }`}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-brand-yellow" />
                ) : (
                  <span className="text-[10px]">{idx + 1}</span>
                )}
              </div>

              {/* Step Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4
                    className={`text-sm font-bold ${
                      isDone || isCurrent
                        ? 'text-brand-text-primary'
                        : 'text-brand-text-secondary'
                    }`}
                  >
                    {step.title}
                  </h4>
                  {timelineEntry?.timestamp && (
                    <span className="text-[11px] font-medium text-brand-text-secondary">
                      {timelineEntry.timestamp}
                    </span>
                  )}
                </div>

                <p className="text-xs text-brand-text-secondary mt-1 leading-relaxed">
                  {step.description}
                </p>

                {timelineEntry?.actor && (
                  <div className="mt-2 text-[11px] font-semibold text-brand-blue inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-blue-light rounded-lg">
                    <span>Mentor Assigned:</span>
                    <span>{timelineEntry.actor}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubmissionTimeline;
