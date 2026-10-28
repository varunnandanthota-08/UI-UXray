import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import studentApi, { resolveAssignmentAction } from '../../api/studentApi';
import { ArrowLeft, Calendar, Clock, ArrowRight, Award, CheckCircle2, BookOpen } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { CardSkeleton } from '../../components/ui/Skeleton';

export const UnitDetails = () => {
  const { unitId } = useParams();
  const [unit, setUnit] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnitAndSubmissions = async () => {
      try {
        setLoading(true);
        const [unitRes, subRes] = await Promise.all([
          studentApi.getUnit(unitId),
          studentApi.getStudentSubmissions()
        ]);
        setUnit(unitRes.data);
        setSubmissions(subRes.data || []);
        if (unitRes.data?.associatedAssignment?.id) {
          const draftRes = await studentApi.getDraft(unitRes.data.associatedAssignment.id);
          setDraft(draftRes?.data || null);
        }
      } catch (err) {
        console.error('Error fetching unit:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUnitAndSubmissions();
  }, [unitId]);

  if (loading || !unit) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-white rounded-2xl animate-pulse" />
        <CardSkeleton />
      </div>
    );
  }

  const asg = unit.associatedAssignment;
  const action = resolveAssignmentAction({
    assignmentId: asg?.id,
    submissions,
    draft,
    hasDraft: asg?.hasDraft
  });
  const isCompleted = unit.status === 'COMPLETED' || action.isEvaluated;
  const isCurrent = (unit.status === 'CURRENT' || unit.status === 'IN_PROGRESS' || action.isSubmitted || action.hasDraft) && !action.isEvaluated;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Back link */}
      <div>
        <Link
          to={`/student/courses/${unit.courseId || 'course-uiux-101'}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-text-secondary hover:text-brand-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Back to Course</span>
        </Link>
      </div>

      {/* Unit Header Card */}
      <div className="bg-white rounded-3xl border border-brand-border p-6 md:p-8 shadow-soft space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-brand-blue uppercase tracking-wider bg-brand-blue-light px-2.5 py-1 rounded-full">
              Unit 0{unit.unitNumber}
            </span>
            <span className="text-xs font-semibold text-brand-text-secondary">
              Phase: {unit.coursePhase || 'UI Fundamentals'}
            </span>
          </div>

          <Badge
            variant={isCompleted ? 'success' : isCurrent ? 'yellow' : 'neutral'}
            size="md"
            dot
          >
            {isCompleted ? '✓ Completed' : isCurrent ? '● Current' : '○ Not Started'}
          </Badge>
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-brand-text-primary tracking-tight">
          {unit.title}
        </h1>

        <p className="text-xs md:text-sm text-brand-text-secondary leading-relaxed max-w-3xl">
          {unit.description}
        </p>

        {/* Learning Objectives Box */}
        <div className="p-4 bg-[#F8F9F8] rounded-2xl border border-brand-border/70 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-blue uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Learning Objective • What you will learn</span>
          </div>
          <p className="text-xs text-brand-text-primary leading-relaxed">
            {unit.objective || 'Master fundamental principles of user experience design, spatial rhythm, and interactive prototyping.'}
          </p>
        </div>
      </div>

      {/* Associated Assignment Card */}
      {asg && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-blue" />
            <h2 className="text-base font-bold text-brand-text-primary">
              Associated Studio Assignment
            </h2>
          </div>

          <div className="bg-white rounded-3xl border-2 border-brand-yellow/80 p-6 md:p-8 shadow-card space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-brand-blue uppercase tracking-wider bg-brand-blue-light px-2.5 py-1 rounded-full">
                  Assignment 0{unit.unitNumber} • {asg.phase}
                </span>
                <h3 className="text-xl md:text-2xl font-black text-brand-text-primary mt-2">
                  {asg.title}
                </h3>
                <p className="text-xs text-brand-text-secondary mt-1.5 leading-relaxed max-w-2xl">
                  {asg.description}
                </p>
              </div>

              <div className="p-3.5 bg-[#F9FAF9] rounded-2xl border border-brand-border text-center shrink-0 min-w-[130px]">
                <span className="text-[11px] text-brand-text-secondary block">Maximum Score</span>
                <span className="text-xl font-black text-brand-blue mt-0.5 block">{asg.maxScore || asg.maxMarks || 20} Marks</span>
              </div>
            </div>

            {/* Requirements Summary */}
            <div className="space-y-2 pt-2 border-t border-brand-border/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-text-secondary">
                Requirements Summary:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(asg.requirements || []).slice(0, 4).map((req, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-[#F9FAF9] rounded-xl text-xs text-brand-text-primary">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-blue shrink-0" />
                    <span className="truncate">{req.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assignment Action Bar */}
            <div className="pt-4 border-t border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 text-xs text-brand-text-secondary">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-brand-warning" />
                  <span>Deadline: <strong className="text-brand-text-primary">{asg.dueDate || asg.deadline}</strong></span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-brand-text-secondary" />
                  <span>Status: <strong className="text-brand-text-primary">{action.badgeLabel}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link to={`/student/assignments/${asg.id}`}>
                  <Button variant="outline" size="md">
                    Assignment Specs
                  </Button>
                </Link>
                <Link to={action.link}>
                  <Button variant="primary" size="md" icon={action.isEvaluated ? Award : ArrowRight} iconPosition="right">
                    {action.label}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Next / Previous Unit Navigation */}
      <div className="pt-4 pb-2 border-t border-brand-border flex items-center justify-between gap-4">
        {unit.previousUnit ? (
          <Link to={`/student/units/${unit.previousUnit.id}`}>
            <Button variant="outline" size="md" icon={ArrowLeft} iconPosition="left">
              ← Previous Unit
            </Button>
          </Link>
        ) : (
          <div /> /* Spacer */
        )}

        {unit.nextUnit ? (
          <Link to={`/student/units/${unit.nextUnit.id}`}>
            <Button variant="primary" size="md" icon={ArrowRight} iconPosition="right">
              Next Unit →
            </Button>
          </Link>
        ) : unit.isLastUnit ? (
          <Link to={`/student/courses/${unit.courseId || 'course-uiux-101'}`}>
            <Button variant="primary" size="md">
              Complete Course
            </Button>
          </Link>
        ) : null}
      </div>
    </div>
  );
};

export default UnitDetails;
