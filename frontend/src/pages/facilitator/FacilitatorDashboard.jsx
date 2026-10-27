import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFacilitatorAuth } from '../../context/FacilitatorAuthContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { submissionApi } from '../../api/submissionApi';
import { assignmentApi } from '../../api/assignmentApi';
import { 
  mockFacilitatorMetrics, 
  mockFacilitatorAssignments, 
  mockRecentSubmissions,
  mockUpcomingMilestones,
  mockRubricCriteriaHealth 
} from '../../data/mockFacilitatorData';
import { 
  Plus, 
  Inbox, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  Calendar,
  Layers
} from 'lucide-react';

export const FacilitatorDashboard = () => {
  const { facilitator } = useFacilitatorAuth();
  const [activeTab, setActiveTab] = useState('ALL');
  const [recentSubmissions, setRecentSubmissions] = useState(mockRecentSubmissions);
  const [assignments, setAssignments] = useState(mockFacilitatorAssignments);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      try {
        const [subs, asgs] = await Promise.all([
          submissionApi.getSubmissions(),
          assignmentApi.getAssignments()
        ]);
        if (isMounted) {
          if (subs && subs.length > 0) setRecentSubmissions(subs.slice(0, 6));
          if (asgs && asgs.length > 0) setAssignments(asgs);
        }
      } catch {
        // Safe fallback retained
      }
    };
    fetchDashboardData();
    return () => { isMounted = false; };
  }, []);

  const filteredSubmissions = activeTab === 'ALL'
    ? recentSubmissions
    : activeTab === 'PENDING'
    ? recentSubmissions.filter(s => s.status === 'PENDING_REVIEW' || s.status === 'IN_REVIEW' || s.evaluationStatus === 'PENDING_REVIEW' || s.evaluationStatus === 'IN_REVIEW')
    : recentSubmissions.filter(s => s.status === 'EVALUATED' || s.evaluationStatus === 'EVALUATED');

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Page Header matching Barabari Facilitator pattern */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="warning" size="sm">
              FACILITATOR WORKSPACE
            </Badge>
            <span className="text-xs text-brand-text-secondary">
              Studio Lead: {facilitator?.name || 'Rohan Mehta'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-brand-text-primary tracking-tight">
            Mentor Dashboard
          </h1>
          <p className="text-xs md:text-sm text-brand-text-secondary mt-1 max-w-xl leading-relaxed">
            Manage published assignments, review student submissions, and evaluate rubric scoring for Cohort 4.
          </p>
        </div>

        {/* Quick Action CTAs */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/facilitator/submissions">
            <Button variant="outline" size="md" icon={Inbox} iconPosition="left">
              Review Queue (8)
            </Button>
          </Link>
          <Link to="/facilitator/assignments">
            <Button variant="primary" size="md" icon={Plus} iconPosition="left">
              Create Assignment
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid (6 compact cards matching LMS design) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {mockFacilitatorMetrics.map((m, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-brand-border p-4 shadow-soft hover:shadow-card transition-all flex flex-col justify-between"
          >
            <span className="text-[11px] font-bold text-brand-text-secondary uppercase tracking-wider block">
              {m.label}
            </span>
            <div className="mt-2">
              <span className={`text-2xl md:text-3xl font-black block ${m.color}`}>
                {m.value}
              </span>
              <span className="text-[10px] text-brand-text-secondary font-medium mt-0.5 block">
                {m.sublabel}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid Row 1: Published Assignments & Rubric Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Published Assignments */}
        <div className="lg:col-span-7">
          <Card className="p-6 md:p-7 shadow-soft space-y-4 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-brand-blue uppercase tracking-wider bg-brand-blue-light px-2.5 py-1 rounded-full">
                    Cohort 4 Sprints
                  </span>
                  <h3 className="text-lg font-bold text-brand-text-primary mt-1.5">
                    Published Assignments
                  </h3>
                </div>
                <Link to="/facilitator/assignments" className="text-xs font-semibold text-brand-blue hover:underline">
                  Manage All →
                </Link>
              </div>

              <div className="space-y-3.5 mt-4">
                {assignments.map((asg) => {
                  const percentSubmitted = Math.round((asg.submittedCount / asg.totalEnrolled) * 100);
                  const isUpcoming = asg.status === 'UPCOMING';

                  return (
                    <div
                      key={asg.id}
                      className="p-4 rounded-2xl border border-brand-border bg-white hover:border-[#D5D5CE] transition-all space-y-3 shadow-2xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-brand-text-primary">
                              {asg.title}
                            </span>
                            <Badge
                              variant={asg.status === 'ACTIVE' ? 'yellow' : 'neutral'}
                              size="sm"
                              dot={asg.status === 'ACTIVE'}
                            >
                              {asg.status}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-brand-text-secondary">
                            {asg.sprint} • Due: <strong>{asg.dueDate}</strong> • Max Marks: <strong>{asg.maxScore}</strong>
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Link to="/facilitator/assignments">
                            <Button variant="outline" size="sm">
                              Specs
                            </Button>
                          </Link>
                          {!isUpcoming && (
                            <Link to="/facilitator/submissions">
                              <Button
                                variant={asg.pendingReviewCount > 0 ? 'primary' : 'outline'}
                                size="sm"
                                icon={ArrowRight}
                                iconPosition="right"
                              >
                                {asg.pendingReviewCount > 0 ? `Review (${asg.pendingReviewCount})` : 'Submissions'}
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Submission Progress bar */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-brand-text-secondary">
                            Submissions: <strong>{asg.submittedCount} / {asg.totalEnrolled}</strong> received ({percentSubmitted}%)
                          </span>
                          <span className="text-brand-text-secondary font-medium">
                            {asg.evaluatedCount} Evaluated • {asg.pendingReviewCount} Pending
                          </span>
                        </div>
                        <div className="w-full bg-[#EFEFEA] h-2 rounded-full overflow-hidden flex">
                          <div
                            className="bg-brand-success h-full transition-all"
                            style={{ width: `${(asg.evaluatedCount / asg.totalEnrolled) * 100}%` }}
                            title={`${asg.evaluatedCount} Evaluated`}
                          />
                          <div
                            className="bg-brand-warning h-full transition-all"
                            style={{ width: `${(asg.pendingReviewCount / asg.totalEnrolled) * 100}%` }}
                            title={`${asg.pendingReviewCount} Pending Review`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-brand-border/60 flex items-center justify-between text-xs text-brand-text-secondary">
              <span>Cohort 4 • UI/UX Product Design Studio</span>
              <Link to="/facilitator/rubrics" className="font-semibold text-brand-blue hover:underline">
                View Evaluation Rubrics →
              </Link>
            </div>
          </Card>
        </div>

        {/* Right Column (5 cols): Evaluation Overview & Rubric Criteria Health */}
        <div className="lg:col-span-5">
          <Card className="p-6 md:p-7 shadow-soft space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-brand-text-primary uppercase tracking-wider">
                    Evaluation & Rubric Health
                  </h3>
                  <p className="text-[11px] text-brand-text-secondary mt-0.5">
                    Cohort scoring benchmarks across evaluated rubrics
                  </p>
                </div>
                <TrendingUp className="w-4 h-4 text-brand-success" />
              </div>

              {/* Review Queue Summary Box */}
              <div className="p-3.5 bg-brand-blue-light/60 rounded-2xl border border-brand-blue/15 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-brand-blue block">Cohort Turnaround:</span>
                  <span className="text-[11px] text-brand-text-secondary">Avg 18 hours per assessment</span>
                </div>
                <span className="font-black text-brand-text-primary text-sm tracking-wide">
                  24 / 32 Evaluated (75%)
                </span>
              </div>

              {/* Rubric Criteria Benchmark Progress */}
              <div className="space-y-3 pt-1">
                <p className="text-[11px] font-bold text-brand-text-secondary uppercase tracking-wider">
                  Criterion Performance Average
                </p>
                {mockRubricCriteriaHealth.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-brand-text-primary truncate max-w-[200px]">
                        {item.name}
                      </span>
                      <span className="font-bold text-brand-blue">{item.averageScore}%</span>
                    </div>
                    <div className="w-full bg-[#EFEFEA] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-brand-blue h-full rounded-full transition-all"
                        style={{ width: `${item.averageScore}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Academic Rigor Statement */}
            <div className="p-3 bg-[#FBFBFA] rounded-xl border border-brand-border/70 text-[11px] text-brand-text-secondary space-y-1">
              <p className="font-semibold text-brand-text-primary flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-success" />
                <span>Mentor Evaluation Standard</span>
              </p>
              <p className="leading-snug">
                Mentors retain sole authority to adjust marks and give qualitative critique. Rubric scores are never finalized autonomously by AI.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Content Grid Row 2: Recent Submissions Review Queue & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Recent Submissions (Review Queue) */}
        <div className="lg:col-span-7">
          <Card className="p-6 md:p-7 shadow-soft space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-brand-text-primary uppercase tracking-wider">
                    Recent Submissions (Review Queue)
                  </h3>
                  <p className="text-[11px] text-brand-text-secondary mt-0.5">
                    Student deliverables requiring mentor assessment & rubric scoring
                  </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 bg-[#F4F4F0] p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setActiveTab('ALL')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      activeTab === 'ALL' ? 'bg-white text-brand-text-primary shadow-xs' : 'text-brand-text-secondary hover:text-brand-text-primary'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveTab('PENDING')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      activeTab === 'PENDING' ? 'bg-white text-brand-text-primary shadow-xs' : 'text-brand-text-secondary hover:text-brand-text-primary'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setActiveTab('EVALUATED')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      activeTab === 'EVALUATED' ? 'bg-white text-brand-text-primary shadow-xs' : 'text-brand-text-secondary hover:text-brand-text-primary'
                    }`}
                  >
                    Evaluated
                  </button>
                </div>
              </div>

              {/* Submissions List */}
              <div className="space-y-2.5">
                {filteredSubmissions.map((sub) => {
                  const isPending = sub.status === 'PENDING_REVIEW';
                  const isInReview = sub.status === 'IN_REVIEW';

                  return (
                    <div
                      key={sub.id}
                      className="p-3.5 bg-white rounded-xl border border-brand-border/80 hover:border-[#D5D5CE] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={sub.studentAvatar}
                          alt={sub.studentName}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-border shrink-0"
                        />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-brand-text-primary">
                              {sub.studentName}
                            </span>
                            <span className="text-[10px] font-semibold text-brand-text-secondary">
                              {sub.studentId}
                            </span>
                            <Badge
                              variant={isPending ? 'warning' : isInReview ? 'yellow' : 'success'}
                              size="sm"
                              dot={isPending || isInReview}
                            >
                              {sub.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-brand-text-secondary">
                            {sub.assignmentTitle} • <span className="font-medium">{sub.relativeTime}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {sub.score !== undefined ? (
                          <div className="text-right mr-1">
                            <span className="font-extrabold text-brand-blue text-sm">
                              {sub.score} / {sub.maxScore}
                            </span>
                            <span className="text-[10px] text-brand-text-secondary block">Published</span>
                          </div>
                        ) : null}

                        <Link to="/facilitator/submissions">
                          <Button
                            variant={isPending ? 'primary' : 'outline'}
                            size="sm"
                            icon={ArrowRight}
                            iconPosition="right"
                          >
                            {isPending ? 'Assess' : isInReview ? 'Resume' : 'Inspect'}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Link
              to="/facilitator/submissions"
              className="mt-3 block text-center text-xs font-semibold text-brand-blue hover:underline py-1"
            >
              Open Complete Review Queue (8 Submissions) →
            </Link>
          </Card>
        </div>

        {/* Right Column (5 cols): Upcoming Deadlines & Studio Schedule */}
        <div className="lg:col-span-5">
          <Card className="p-6 md:p-7 shadow-soft space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-brand-text-primary uppercase tracking-wider">
                    Studio Milestones & Deadlines
                  </h3>
                  <p className="text-[11px] text-brand-text-secondary mt-0.5">
                    Critical cutoff dates & mentor critique schedule
                  </p>
                </div>
                <Calendar className="w-4 h-4 text-brand-blue" />
              </div>

              <div className="space-y-3">
                {mockUpcomingMilestones.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-2xl border border-brand-border bg-[#F9FAF9] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-brand-text-primary truncate max-w-[200px]">
                          {m.title}
                        </span>
                        <Badge variant={m.badgeVariant} size="sm">
                          {m.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-brand-text-secondary block">
                        {m.course} • <strong className="text-brand-text-primary">{m.date}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-brand-border flex items-center justify-between">
              <Link to="/facilitator/assignments">
                <Button variant="outline" size="sm" icon={Plus} iconPosition="left">
                  New Assignment
                </Button>
              </Link>
              <Link to="/facilitator/batch-evaluation">
                <Button variant="outline" size="sm" icon={Layers} iconPosition="left">
                  Batch Assistant
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FacilitatorDashboard;
