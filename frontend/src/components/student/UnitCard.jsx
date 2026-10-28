import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Award } from 'lucide-react';
import Badge from '../ui/Badge';
import Card from '../ui/Card';
import Button from '../ui/Button';
import studentApi, { resolveAssignmentAction } from '../../api/studentApi';

export const UnitCard = ({ unit, submissions: passedSubmissions }) => {
  const [submissions, setSubmissions] = useState(passedSubmissions || []);
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    if (passedSubmissions && passedSubmissions.length > 0) {
      setSubmissions(passedSubmissions);
    } else if (unit?.assignmentId) {
      studentApi.getStudentSubmissions().then((res) => {
        setSubmissions(res.data || []);
      }).catch(() => {});
    }
  }, [passedSubmissions, unit?.assignmentId]);

  useEffect(() => {
    if (unit?.assignmentId) {
      studentApi.getDraft(unit.assignmentId).then((res) => {
        setDraft(res?.data || null);
      }).catch(() => {});
    }
  }, [unit?.assignmentId]);

  const action = resolveAssignmentAction({
    assignmentId: unit.assignmentId,
    submissions,
    draft,
    hasDraft: unit.hasDraft
  });

  const isCompleted = unit.status === 'COMPLETED' || action.isEvaluated;
  const isCurrent = (unit.status === 'CURRENT' || unit.status === 'IN_PROGRESS' || action.isSubmitted || action.hasDraft) && !action.isEvaluated;

  const getStatusBadge = () => {
    if (action.isEvaluated) {
      return (
        <Badge variant="success" size="sm" dot>
          ✓ Completed
        </Badge>
      );
    }
    if (action.isSubmitted) {
      return (
        <Badge variant={action.badgeVariant} size="sm" dot>
          ● {action.badgeLabel}
        </Badge>
      );
    }
    if (action.hasDraft) {
      return (
        <Badge variant="yellow" size="sm" dot>
          ● In Progress
        </Badge>
      );
    }
    if (isCompleted) {
      return (
        <Badge variant="success" size="sm" dot>
          ✓ Completed
        </Badge>
      );
    }
    if (isCurrent) {
      return (
        <Badge variant="yellow" size="sm" dot>
          ● Current
        </Badge>
      );
    }
    return (
      <Badge variant="neutral" size="sm">
        ○ Not Started
      </Badge>
    );
  };

  return (
    <Card hover className="relative overflow-hidden group space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          {/* Status Icon */}
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition-colors ${
              isCompleted
                ? 'bg-brand-success text-white'
                : isCurrent
                ? 'bg-brand-blue text-white ring-4 ring-brand-blue-light'
                : 'bg-[#F4F4F0] text-brand-text-secondary border border-brand-border'
            }`}
          >
            {isCompleted ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : isCurrent ? (
              <span className="w-2.5 h-2.5 rounded-full bg-brand-yellow" />
            ) : (
              <span>0{unit.unitNumber}</span>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-brand-blue uppercase tracking-wider">
                Unit 0{unit.unitNumber}
              </span>
              {getStatusBadge()}
            </div>

            <h4 className="text-base font-bold text-brand-text-primary group-hover:text-brand-blue transition-colors">
              {unit.title}
            </h4>

            <p className="text-xs text-brand-text-secondary mt-1 leading-relaxed max-w-2xl">
              {unit.description}
            </p>

            {unit.objective && (
              <p className="text-[11px] text-brand-text-secondary/90 mt-1 italic">
                Objective: {unit.objective}
              </p>
            )}
          </div>
        </div>

        {/* Top right unit link */}
        <Link
          to={`/student/units/${unit.id}`}
          className="text-xs font-semibold text-brand-blue hover:underline inline-flex items-center gap-1 self-start sm:self-auto shrink-0"
        >
          <span>Unit Overview</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Associated Assignment Banner */}
      {unit.assignmentTitle && (
        <div className="p-4 bg-[#F9FAF9] rounded-2xl border border-brand-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-blue shrink-0" />
              <span className="font-bold text-brand-text-primary">
                {unit.assignmentTitle}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-brand-text-secondary text-[11px]">
              {unit.marks && <span>Max Marks: <strong>{unit.marks}</strong></span>}
              {unit.deadline && (
                <>
                  <span>•</span>
                  <span>Due: <strong>{unit.deadline}</strong></span>
                </>
              )}
              {action.isEvaluated && action.submission?.score !== null && action.submission?.score !== undefined ? (
                <>
                  <span>•</span>
                  <span className="text-brand-blue font-bold">
                    Evaluated: {action.submission.score} / {action.submission.maxScore || 20}
                  </span>
                </>
              ) : action.isSubmitted ? (
                <>
                  <span>•</span>
                  <span className="text-brand-text-secondary font-medium">
                    Status: <strong className="text-brand-text-primary">{action.badgeLabel}</strong>
                  </span>
                </>
              ) : unit.score && isCompleted ? (
                <>
                  <span>•</span>
                  <span className="text-brand-blue font-bold">Evaluated: {unit.score}</span>
                </>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <Link to={action.link}>
              <Button
                variant="primary"
                size="sm"
                icon={action.isEvaluated ? Award : ArrowRight}
                iconPosition="right"
              >
                {action.label}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
};

export default UnitCard;
