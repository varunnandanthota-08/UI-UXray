import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import studentApi, { resolveAssignmentAction } from '../../api/studentApi';
import AssignmentDonutChart from '../../components/student/AssignmentDonutChart';
import UnitProgressTimeline from '../../components/student/UnitProgressTimeline';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { 
  ArrowRight, 
  TrendingUp 
} from 'lucide-react';

export const Dashboard = () => {
  const { student, isAuthenticated } = useAuth();
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activeDraft, setActiveDraft] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [courseRes, asgRes, subRes, draftRes] = await Promise.all([
          studentApi.getCourses(),
          studentApi.getStudentAssignments(),
          studentApi.getStudentSubmissions(),
          studentApi.getDraft('asg-4')
        ]);
        setCourses(courseRes.data || []);
        setAssignments(asgRes.data || []);
        setSubmissions(subRes.data || []);
        setActiveDraft(draftRes?.data || null);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-white rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const primaryCourse = courses[0] || {};
  const units = primaryCourse.units || [];
  const activeAssignment = assignments.find((a) => a.id === 'asg-4') || assignments[3] || assignments[0] || {};
  const asg5 = assignments.find((a) => a.id === 'asg-5') || assignments[4] || {};
  const asg6 = assignments.find((a) => a.id === 'asg-6') || assignments[5] || {};

  // Resolve active sprint submission & draft state using shared logic
  const activeAction = resolveAssignmentAction({
    assignmentId: activeAssignment.id || 'asg-4',
    submissions,
    draft: activeDraft
  });

  const heroActionLabel = activeAction.label;
  const heroActionLink = activeAction.link;
  const activeStatusLabel = activeAction.badgeLabel;
  const activeStatusVariant = activeAction.badgeVariant;

  const evaluatedSubmissions = submissions.filter((s) => s.status === 'PUBLISHED' || s.status === 'APPROVED');
  const eval1 = evaluatedSubmissions[0] || {};
  const eval2 = evaluatedSubmissions[1] || {};
  const eval3 = evaluatedSubmissions[2] || {};

  const evaluatedCount = evaluatedSubmissions.length;
  const underReviewCount = submissions.filter((s) => s.status === 'SUBMITTED' || s.status === 'PROCESSING' || s.status === 'UNDER_REVIEW' || s.status === 'AUTOMATED_ANALYSIS_COMPLETE').length;
  const inProgressCount = activeAction.hasDraft && !activeAction.isSubmitted ? 1 : 0;
  const notStartedCount = Math.max(0, 6 - evaluatedCount - underReviewCount - inProgressCount);

  // Metrics matching Facilitator Dashboard analytics
  const metrics = [
    { label: 'Total Assignments', value: 6, color: 'text-brand-text-primary' },
    { label: 'Completed', value: evaluatedCount + underReviewCount, color: 'text-brand-blue' },
    { label: 'In Progress', value: inProgressCount, color: 'text-brand-warning' },
    { label: 'Not Started', value: notStartedCount, color: 'text-brand-text-secondary' },
    { label: 'Under Evaluation', value: underReviewCount, color: 'text-[#946F00]' },
    { label: 'Published Results', value: evaluatedCount, color: 'text-brand-success' }
  ];

  // Donut chart segments
  const chartData = [
    { label: 'Completed', count: evaluatedCount, color: '#344499' },
    { label: 'In Progress', count: inProgressCount, color: '#FFCC33' },
    { label: 'Under Evaluation', count: underReviewCount, color: '#C88700' },
    { label: 'Not Started', count: notStartedCount, color: '#D5D5CE' }
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Page Header matching Facilitator Dashboard structure */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="STUDENT" size="sm">
              STUDENT
            </Badge>
            <span className="text-xs text-brand-text-secondary">
              Good morning, {student?.name?.split(' ')[0] || 'Ananya'} 👋
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-brand-text-primary tracking-tight">
            Student Dashboard
          </h1>
          <p className="text-xs md:text-sm text-brand-text-secondary mt-1 max-w-xl leading-relaxed">
            Track your learning progress, assignments, submissions and published evaluations.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link to="/student/profile">
            <Button variant="outline" size="md">
              Edit Profile
            </Button>
          </Link>
          <Link to={heroActionLink}>
            <Button variant="primary" size="md" icon={ArrowRight} iconPosition="right">
              {heroActionLabel}
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards (Compact grid matching Facilitator Dashboard) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {metrics.map((m, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-brand-border p-4 shadow-soft hover:shadow-card transition-all flex flex-col justify-between"
          >
            <span className="text-[11px] font-bold text-brand-text-secondary uppercase tracking-wider block">
              {m.label}
            </span>
            <span className={`text-2xl md:text-3xl font-black mt-2 block ${m.color}`}>
              {m.value}
            </span>
          </div>
        ))}
      </div>

      {/* Main Content Area: Row 1 (Program Progression & Assignment Status Visual) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Program Progression */}
        <div className="lg:col-span-7">
          <Card className="p-6 md:p-7 space-y-4 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-brand-blue uppercase tracking-wider bg-brand-blue-light px-2.5 py-1 rounded-full">
                    Program Progression
                  </span>
                  <h3 className="text-lg font-bold text-brand-text-primary mt-1.5">
                    {primaryCourse.title || 'UI/UX Product Design'}
                  </h3>
                </div>
                <Link to="/student/courses/course-uiux-101" className="text-xs font-semibold text-brand-blue hover:underline">
                  Course Details →
                </Link>
              </div>

              <div className="space-y-2 pt-3">
                <div className="flex justify-between text-xs">
                  <span className="text-brand-text-secondary font-medium">Overall Curriculum Completion</span>
                  <span className="font-bold text-brand-text-primary">60% (3 / 10 Units Completed)</span>
                </div>
                <div className="w-full bg-[#EFEFEA] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-yellow h-full rounded-full transition-all duration-500"
                    style={{ width: `60%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-brand-text-secondary font-medium">
                  <span>✓ 3 Units Completed</span>
                  <span>○ 7 Units Remaining</span>
                </div>
              </div>
            </div>

            {/* Visually Connected Unit Progress Timeline */}
            <div className="pt-4 border-t border-brand-border/60">
              <UnitProgressTimeline units={units} />
            </div>
          </Card>
        </div>

        {/* Right Column (5 cols): Assignment Status Visual */}
        <div className="lg:col-span-5">
          <Card className="p-6 shadow-soft space-y-3 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-brand-text-primary uppercase tracking-wider">
                Assignment Status Visual
              </h3>
              <p className="text-[11px] text-brand-text-secondary mt-0.5">
                Distribution across all 6 curriculum sprints
              </p>
            </div>

            <AssignmentDonutChart data={chartData} />
          </Card>
        </div>
      </div>

      {/* Main Content Area: Row 2 (Upcoming Assignments & Recent Evaluations) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Upcoming Assignments */}
        <div className="lg:col-span-7">
          <Card className="p-6 md:p-7 shadow-soft space-y-4 h-full">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-brand-text-primary uppercase tracking-wider">
                  Upcoming Assignments
                </h3>
                <p className="text-[11px] text-brand-text-secondary mt-0.5">
                  Studio sprints and scheduled delivery milestones
                </p>
              </div>
              <Link to="/student/courses" className="text-xs font-semibold text-brand-blue hover:underline">
                View All →
              </Link>
            </div>

            <div className="space-y-3">
              {/* Assignment 4 (Active) */}
              <div className="p-4 rounded-2xl border border-brand-border bg-white hover:border-[#D5D5CE] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-brand-text-primary">
                      {activeAssignment.title || 'One Clickable Prototype with Motion'}
                    </span>
                    <Badge variant={activeStatusVariant} size="sm" dot={activeStatusVariant !== 'NOT_STARTED'}>
                      {activeStatusLabel}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-brand-text-secondary">
                    UI/UX Design • Due: {activeAssignment.dueDate || activeAssignment.deadline || '22 Sep 2026'} • {activeAssignment.maxScore || 20} Marks
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link to={`/student/assignments/${activeAssignment.id || 'asg-4'}`}>
                    <Button variant="outline" size="sm">
                      Specs
                    </Button>
                  </Link>
                  <Link to={heroActionLink}>
                    <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right">
                      {heroActionLabel}
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Assignment 5 */}
              <div className="p-4 rounded-2xl border border-brand-border bg-white hover:border-[#D5D5CE] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-brand-text-primary">
                      Design System & Component Library
                    </span>
                    <Badge variant="NOT_STARTED" size="sm">
                      NOT STARTED
                    </Badge>
                  </div>
                  <p className="text-[11px] text-brand-text-secondary">
                    UI/UX Design • Due: 05 Oct 2026 • 20 Marks
                  </p>
                </div>
                <Link to={`/student/assignments/${asg5.id || 'asg-5'}`}>
                  <Button variant="outline" size="sm" icon={ArrowRight} iconPosition="right">
                    Open Assignment
                  </Button>
                </Link>
              </div>

              {/* Assignment 6 */}
              <div className="p-4 rounded-2xl border border-brand-border bg-white hover:border-[#D5D5CE] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-brand-text-primary">
                      AI Landing Page You'd Ship
                    </span>
                    <Badge variant="NOT_STARTED" size="sm">
                      NOT STARTED
                    </Badge>
                  </div>
                  <p className="text-[11px] text-brand-text-secondary">
                    UI/UX Design • Due: 20 Oct 2026 • 25 Marks
                  </p>
                </div>
                <Link to={`/student/assignments/${asg6.id || 'asg-6'}`}>
                  <Button variant="outline" size="sm" icon={ArrowRight} iconPosition="right">
                    Open Assignment
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (5 cols): Recent Evaluations */}
        <div className="lg:col-span-5">
          <Card className="p-6 md:p-7 shadow-soft space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-brand-text-primary uppercase tracking-wider">
                    Recent Evaluations
                  </h3>
                  <p className="text-[11px] text-brand-text-secondary mt-0.5">
                    Verified mentor scores and published feedback
                  </p>
                </div>
                <TrendingUp className="w-4 h-4 text-brand-success" />
              </div>

              {/* Score Trend Banner */}
              <div className="p-3 bg-brand-blue-light/60 rounded-2xl border border-brand-blue/15 flex items-center justify-between text-xs">
                <span className="font-semibold text-brand-blue">Score Progression:</span>
                <span className="font-black text-brand-text-primary tracking-wider">
                  15/20 → 17/20 → 18/20 (85% Avg)
                </span>
              </div>

              {/* Evaluations List */}
              <div className="space-y-2.5">
                {/* Item 1 */}
                <div className="p-3 bg-[#F9FAF9] rounded-xl border border-brand-border/80 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-brand-text-primary truncate block max-w-[170px]">
                      Recreated a Real Screen
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-brand-text-secondary">
                      <span>11 Sep 2026</span>
                      <span>•</span>
                      <Badge variant="PUBLISHED" size="sm">
                        PUBLISHED
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-brand-blue text-sm">18 / 20</span>
                    <Link to={`/student/evaluations/${eval1.evaluationId || eval1.id || 'eval-asg-3'}`} className="text-brand-blue font-semibold hover:underline text-[11px]">
                      Inspect →
                    </Link>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="p-3 bg-[#F9FAF9] rounded-xl border border-brand-border/80 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-brand-text-primary truncate block max-w-[170px]">
                      Friction Map
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-brand-text-secondary">
                      <span>26 Aug 2026</span>
                      <span>•</span>
                      <Badge variant="PUBLISHED" size="sm">
                        PUBLISHED
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-brand-blue text-sm">17 / 20</span>
                    <Link to={`/student/evaluations/${eval2.evaluationId || eval2.id || 'eval-asg-2'}`} className="text-brand-blue font-semibold hover:underline text-[11px]">
                      Inspect →
                    </Link>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="p-3 bg-[#F9FAF9] rounded-xl border border-brand-border/80 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-brand-text-primary truncate block max-w-[170px]">
                      UX Research & Personas
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-brand-text-secondary">
                      <span>12 Aug 2026</span>
                      <span>•</span>
                      <Badge variant="PUBLISHED" size="sm">
                        PUBLISHED
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-brand-blue text-sm">15 / 20</span>
                    <Link to={`/student/evaluations/${eval3.evaluationId || eval3.id || 'eval-asg-1'}`} className="text-brand-blue font-semibold hover:underline text-[11px]">
                      Inspect →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <Link
              to="/student/submissions"
              className="mt-3 block text-center text-xs font-semibold text-brand-blue hover:underline py-1"
            >
              View All Evaluations & Submissions →
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
