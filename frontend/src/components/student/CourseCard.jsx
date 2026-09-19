import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

export const CourseCard = ({ course }) => {
  return (
    <Card hover className="flex flex-col justify-between h-full group">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className="text-[11px] font-bold tracking-wider uppercase text-brand-blue bg-brand-blue-light px-2.5 py-1 rounded-full">
            Phase: {course.phase}
          </span>
          <span className="text-xs font-semibold text-brand-text-secondary">
            {course.completedUnits} / {course.totalUnits} Units Completed
          </span>
        </div>

        <h3 className="text-lg font-bold text-brand-text-primary group-hover:text-brand-blue transition-colors">
          {course.title}
        </h3>
        <p className="text-xs text-brand-text-secondary mt-1.5 line-clamp-2 leading-relaxed">
          {course.description}
        </p>

        {/* Progress Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-brand-text-secondary">Overall Progress</span>
            <span className="text-brand-text-primary font-bold">{course.progress}%</span>
          </div>
          <div className="w-full bg-[#EFEFEA] h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-brand-yellow h-full rounded-full transition-all duration-500"
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>

        {/* Current Unit Info */}
        {course.currentUnitTitle && (
          <div className="mt-4 p-3 bg-[#F7F7F4] rounded-xl text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse shrink-0" />
            <span className="text-brand-text-secondary">Current:</span>
            <span className="font-semibold text-brand-text-primary truncate">
              {course.currentUnitTitle}
            </span>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-brand-border/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {course.facilitator?.avatar && (
            <img
              src={course.facilitator.avatar}
              alt={course.facilitator.name}
              className="w-6 h-6 rounded-full object-cover"
            />
          )}
          <span className="text-xs text-brand-text-secondary">
            {course.facilitator?.name || 'Lead Facilitator'}
          </span>
        </div>

        <Link to={`/student/courses/${course.id}`}>
          <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right">
            Continue
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default CourseCard;
