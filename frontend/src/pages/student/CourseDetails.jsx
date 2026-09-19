import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import studentApi from '../../api/studentApi';
import UnitCard from '../../components/student/UnitCard';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { ArrowLeft, BookOpen, Layers } from 'lucide-react';
import Card from '../../components/ui/Card';

export const CourseDetails = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const res = await studentApi.getCourse(courseId);
        setCourse(res.data);
      } catch (err) {
        console.error('Error fetching course:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  if (loading || !course) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-white rounded-2xl animate-pulse" />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/student/courses"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-text-secondary hover:text-brand-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Back to Courses</span>
        </Link>
      </div>

      {/* Course Header Banner */}
      <div className="bg-white rounded-3xl border border-brand-border p-6 md:p-8 shadow-soft space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-blue-light text-brand-blue text-xs font-bold rounded-full uppercase tracking-wider">
              <span>Phase: {course.phase}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-brand-text-primary tracking-tight">
              {course.title}
            </h1>
            <p className="text-xs md:text-sm text-brand-text-secondary max-w-2xl leading-relaxed">
              {course.description}
            </p>
          </div>

          <div className="bg-[#F8F9F8] p-5 rounded-2xl border border-brand-border/70 shrink-0 text-center min-w-[180px]">
            <span className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider block">
              Overall Progress
            </span>
            <span className="text-3xl font-black text-brand-blue mt-1 block">
              {course.progress}%
            </span>
            <span className="text-xs font-semibold text-brand-text-primary mt-1 block">
              {course.completedUnits} / {course.totalUnits} Units Completed
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 pt-2 border-t border-brand-border/60">
          <div className="flex justify-between text-xs text-brand-text-secondary">
            <span>Curriculum Trajectory</span>
            <span className="font-bold text-brand-text-primary">{course.completedUnits} Units Done • {course.totalUnits - course.completedUnits} Remaining</span>
          </div>
          <div className="w-full bg-[#EFEFEA] h-3 rounded-full overflow-hidden">
            <div
              className="bg-brand-yellow h-full rounded-full transition-all duration-500"
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Course Overview Section */}
      <Card className="p-6 md:p-7 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-brand-blue uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>Course Overview</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-4 bg-[#F9FAF9] rounded-2xl border border-brand-border/60 space-y-1">
            <span className="text-[11px] font-bold text-brand-text-secondary uppercase">Description</span>
            <p className="text-xs text-brand-text-primary leading-relaxed">
              Comprehensive industry-aligned UI/UX curriculum covering generative research, spatial design tokens, micro-motion, and AI-native workflows.
            </p>
          </div>

          <div className="p-4 bg-brand-yellow-light/40 rounded-2xl border border-amber-200/60 space-y-1">
            <span className="text-[11px] font-bold text-[#946F00] uppercase">Current Learning Stage</span>
            <p className="text-xs font-bold text-brand-text-primary">
              {course.currentUnitTitle}
            </p>
            <p className="text-[11px] text-brand-text-secondary">
              Focus on micro-motion transitions, spring curves, and state design.
            </p>
          </div>

          <div className="p-4 bg-[#F9FAF9] rounded-2xl border border-brand-border/60 space-y-1">
            <span className="text-[11px] font-bold text-brand-text-secondary uppercase">Progress Information</span>
            <p className="text-xs text-brand-text-primary">
              <strong>3 Units</strong> completed and evaluated. Unit 4 is active for submission.
            </p>
            <p className="text-[11px] text-brand-success font-semibold">
              On track for cohort portfolio graduation.
            </p>
          </div>
        </div>
      </Card>

      {/* Units Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-blue" />
            <h2 className="text-lg font-bold text-brand-text-primary tracking-tight">
              Curriculum Units ({course.units?.length || 0})
            </h2>
          </div>
          <span className="text-xs text-brand-text-secondary">
            Each unit contains an associated studio assignment for evaluation
          </span>
        </div>

        {/* Ordered Units List */}
        <div className="space-y-4">
          {course.units?.map((unit) => (
            <UnitCard key={unit.id} unit={unit} courseId={course.id} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
