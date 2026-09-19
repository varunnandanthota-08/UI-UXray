import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Award, ArrowRight } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export const AssignmentCard = ({ assignment }) => {
  const isEvaluated = assignment.status === 'PUBLISHED';
  const isInProgress = assignment.status === 'IN_PROGRESS';

  return (
    <Card hover className="flex flex-col justify-between h-full group">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-bold tracking-wider uppercase text-brand-blue bg-brand-blue-light px-2.5 py-1 rounded-full">
            {assignment.phase}
          </span>
          <Badge
            variant={isEvaluated ? 'success' : isInProgress ? 'yellow' : 'neutral'}
            size="sm"
            dot
          >
            {isEvaluated ? 'Evaluated' : isInProgress ? 'In Progress' : 'Pending'}
          </Badge>
        </div>

        <h3 className="text-base font-bold text-brand-text-primary group-hover:text-brand-blue transition-colors">
          {assignment.title}
        </h3>

        <p className="text-xs text-brand-text-secondary mt-1.5 line-clamp-2 leading-relaxed">
          {assignment.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-brand-text-secondary">
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-brand-blue" />
            <span>Max Score: <strong>{assignment.maxScore}</strong></span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-brand-text-secondary" />
            <span>Due: <strong>{assignment.dueDate}</strong></span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-brand-border/60 flex items-center justify-between">
        <Link
          to={`/student/assignments/${assignment.id}`}
          className="text-xs font-semibold text-brand-blue hover:underline"
        >
          Assignment Specs
        </Link>

        {isEvaluated ? (
          <Link to={`/student/evaluations/eval-${assignment.id}`}>
            <Button variant="secondary" size="sm" icon={Award}>
              View Evaluation
            </Button>
          </Link>
        ) : (
          <Link to={`/student/assignments/${assignment.id}/submit`}>
            <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right">
              Submit Work
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
};

export default AssignmentCard;
