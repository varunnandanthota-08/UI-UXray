import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Award } from 'lucide-react';
import Badge from '../ui/Badge';
import Card from '../ui/Card';
import Button from '../ui/Button';

export const UnitCard = ({ unit }) => {
  const isCompleted = unit.status === 'COMPLETED';
  const isCurrent = unit.status === 'CURRENT' || unit.status === 'IN_PROGRESS';

  const getStatusBadge = () => {
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
              {unit.score && (
                <>
                  <span>•</span>
                  <span className="text-brand-blue font-bold">Evaluated: {unit.score}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {isCurrent ? (
              <Link to={`/student/assignments/${unit.assignmentId}/submit`}>
                <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right">
                  Submit Assignment
                </Button>
              </Link>
            ) : (
              <Link to={`/student/assignments/${unit.assignmentId}`}>
                <Button variant="outline" size="sm">
                  View Assignment
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default UnitCard;
