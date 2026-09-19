import React, { useState, useMemo, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { assignmentApi } from '../../api/assignmentApi';
import { rubricApi } from '../../api/rubricApi';
import { submissionApi } from '../../api/submissionApi';
import { evaluationApi } from '../../api/evaluationApi';
import { batchApi } from '../../api/batchApi';
import {
  getFacilitatorAssignments,
  getFacilitatorRubrics,
  getFacilitatorSubmissions,
  getFacilitatorEvaluations,
  getFacilitatorBatches,
  mockFacilitatorCourses
} from '../../data/mockFacilitatorData';
import {
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Inbox,
  Award,
  FileText,
  Info,
  Search,
  Filter
} from 'lucide-react';

export const FacilitatorAnalytics = () => {
  // Load core datasets from facilitator storage/mock
  const [assignments, setAssignments] = useState(getFacilitatorAssignments);
  const [rubrics, setRubrics] = useState(getFacilitatorRubrics);
  const [submissions, setSubmissions] = useState(getFacilitatorSubmissions);
  const [evaluations, setEvaluations] = useState(getFacilitatorEvaluations);
  const [batches, setBatches] = useState(getFacilitatorBatches);
  const courses = mockFacilitatorCourses;

  // Sync data via API adapter
  useEffect(() => {
    let isMounted = true;
    const fetchAnalyticsDatasets = async () => {
      try {
        const [asgs, rubs, subs, evals, bats] = await Promise.all([
          assignmentApi.getAssignments(),
          rubricApi.getRubrics(),
          submissionApi.getSubmissions(),
          evaluationApi.getEvaluations(),
          batchApi.getBatches()
        ]);
        if (isMounted) {
          if (asgs) setAssignments(asgs);
          if (rubs) setRubrics(rubs);
          if (subs) setSubmissions(subs);
          if (evals) setEvaluations(evals);
          if (bats) setBatches(bats);
        }
      } catch {
        // Safe fallback retained
      }
    };
    fetchAnalyticsDatasets();
    return () => { isMounted = false; };
  }, []);

  // Filter States
  const [selectedCourseId, setSelectedCourseId] = useState('ALL');
  const [selectedUnitId, setSelectedUnitId] = useState('ALL');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [assignmentSearch, setAssignmentSearch] = useState('');

  // Available units based on selected course
  const availableUnits = useMemo(() => {
    if (selectedCourseId === 'ALL') {
      return courses.flatMap(c => c.units || []);
    }
    const foundCourse = courses.find(c => c.id === selectedCourseId);
    return foundCourse ? foundCourse.units : [];
  }, [courses, selectedCourseId]);

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedCourseId('ALL');
    setSelectedUnitId('ALL');
    setSelectedAssignmentId('ALL');
    setSelectedStatus('ALL');
    setAssignmentSearch('');
  };

  // Filtered Submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(s => {
      if (selectedCourseId !== 'ALL' && s.courseId !== selectedCourseId) return false;
      if (selectedUnitId !== 'ALL' && s.unitId !== selectedUnitId) return false;
      if (selectedAssignmentId !== 'ALL' && s.assignmentId !== selectedAssignmentId) return false;
      if (selectedStatus !== 'ALL' && s.evaluationStatus !== selectedStatus) return false;
      return true;
    });
  }, [submissions, selectedCourseId, selectedUnitId, selectedAssignmentId, selectedStatus]);

  // Filtered Assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter(a => {
      if (selectedCourseId !== 'ALL' && a.courseId !== selectedCourseId) return false;
      if (selectedUnitId !== 'ALL' && a.unitId !== selectedUnitId) return false;
      if (selectedAssignmentId !== 'ALL' && a.id !== selectedAssignmentId) return false;
      if (assignmentSearch.trim()) {
        const q = assignmentSearch.toLowerCase();
        return a.title?.toLowerCase().includes(q) || a.sprint?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [assignments, selectedCourseId, selectedUnitId, selectedAssignmentId, assignmentSearch]);

  // Filtered Evaluations
  const filteredEvaluations = useMemo(() => {
    return evaluations.filter(e => {
      if (selectedCourseId !== 'ALL' && e.courseId !== selectedCourseId) return false;
      if (selectedUnitId !== 'ALL' && e.unitId !== selectedUnitId) return false;
      if (selectedAssignmentId !== 'ALL' && e.assignmentId !== selectedAssignmentId) return false;
      return true;
    });
  }, [evaluations, selectedCourseId, selectedUnitId, selectedAssignmentId]);

  // 1. Overview Derived Metrics
  const totalSubmissions = filteredSubmissions.length;
  const pendingCount = filteredSubmissions.filter(s => s.evaluationStatus === 'PENDING_REVIEW' || s.evaluationStatus === 'IN_REVIEW').length;
  const evaluatedCount = filteredSubmissions.filter(s => s.evaluationStatus === 'EVALUATED').length;
  const returnedCount = filteredSubmissions.filter(s => s.evaluationStatus === 'RETURNED').length;
  const reEvalCount = filteredSubmissions.filter(s => s.hasReEvaluationRequest || s.evaluationStatus === 'RE_EVALUATION_REQUESTED' || s.evaluationStatus === 'RE_EVALUATED').length;
  const completedBatchesCount = batches.filter(b => b.status === 'COMPLETED').length;

  const evaluationCompletionRate = totalSubmissions > 0 ? Math.round((evaluatedCount / totalSubmissions) * 100) : 0;

  // Average score across evaluated submissions
  const evaluatedWithScores = filteredSubmissions.filter(s => s.evaluationStatus === 'EVALUATED' && typeof s.score === 'number');
  const averageScorePercentage = evaluatedWithScores.length > 0
    ? Math.round(
        (evaluatedWithScores.reduce((acc, s) => acc + (s.score / (s.maxScore || 20)), 0) / evaluatedWithScores.length) * 100
      )
    : 0;

  // 2. Status Distribution Data for Chart
  const statusDistribution = useMemo(() => {
    const total = totalSubmissions || 1;
    const items = [
      { label: 'Finalized', count: evaluatedCount, color: '#10B981', percent: Math.round((evaluatedCount / total) * 100) },
      { label: 'In Review', count: filteredSubmissions.filter(s => s.evaluationStatus === 'IN_REVIEW').length, color: '#344499', percent: Math.round((filteredSubmissions.filter(s => s.evaluationStatus === 'IN_REVIEW').length / total) * 100) },
      { label: 'Pending Review', count: filteredSubmissions.filter(s => s.evaluationStatus === 'PENDING_REVIEW').length, color: '#FFCC33', percent: Math.round((filteredSubmissions.filter(s => s.evaluationStatus === 'PENDING_REVIEW').length / total) * 100) },
      { label: 'Returned', count: returnedCount, color: '#F97316', percent: Math.round((returnedCount / total) * 100) },
      { label: 'Re-Evaluation', count: reEvalCount, color: '#6366F1', percent: Math.round((reEvalCount / total) * 100) }
    ];
    return items.filter(i => i.count > 0);
  }, [totalSubmissions, evaluatedCount, filteredSubmissions, returnedCount, reEvalCount]);

  // SVG Donut calculation
  const donutSize = 140;
  const strokeWidth = 20;
  const radius = (donutSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const donutSegments = useMemo(() => {
    const total = totalSubmissions;
    if (total === 0) return [];
    return statusDistribution.reduce((acc, item) => {
      const frac = item.count / total;
      const strokeDasharray = `${circumference * frac} ${circumference * (1 - frac)}`;
      const strokeDashoffset = -circumference * acc.offset;
      return {
        offset: acc.offset + frac,
        items: [
          ...acc.items,
          {
            ...item,
            strokeDasharray,
            strokeDashoffset
          }
        ]
      };
    }, { offset: 0, items: [] }).items;
  }, [statusDistribution, totalSubmissions, circumference]);

  // 3. Batch Analytics Summary
  const batchMetrics = useMemo(() => {
    const totalBatches = batches.length;
    const completed = batches.filter(b => b.status === 'COMPLETED').length;
    const processing = batches.filter(b => b.status === 'PROCESSING').length;
    const reviewRequired = batches.filter(b => b.status === 'REVIEW_REQUIRED').length;
    const cancelled = batches.filter(b => b.status === 'CANCELLED').length;
    const totalCandidates = batches.reduce((acc, b) => acc + (b.totalScanned || b.candidatesCount || 0), 0);
    const totalFlags = batches.reduce((acc, b) => acc + (b.flaggedCount || b.flagsRaised || 0), 0);
    const avgPerBatch = totalBatches > 0 ? (totalCandidates / totalBatches).toFixed(1) : '0';

    return {
      totalBatches,
      completed,
      processing,
      reviewRequired,
      cancelled,
      totalCandidates,
      totalFlags,
      avgPerBatch
    };
  }, [batches]);

  // 4. Rubric Criteria Attainment Insights
  const rubricInsights = useMemo(() => {
    if (filteredAssignments.length === 0 || rubrics.length === 0) return [];

    return filteredAssignments.map(asg => {
      const linkedRubric = rubrics.find(r => r.assignmentId === asg.id) || rubrics[0];
      if (!linkedRubric || !linkedRubric.criteria) return null;

      // Find evaluations for this assignment
      const asgEvals = filteredEvaluations.filter(e => e.assignmentId === asg.id);

      // Compute average per criterion
      const criteriaAttainment = linkedRubric.criteria.map(crit => {
        const scores = asgEvals
          .map(e => e.criterionScores ? e.criterionScores[crit.id] : null)
          .filter(s => typeof s === 'number');

        const avgScore = scores.length > 0
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : null;

        const maxPoints = crit.points || crit.maxScore || 5;
        const attainmentPct = avgScore !== null && maxPoints > 0
          ? Math.round((avgScore / maxPoints) * 100)
          : null;

        let attainmentLabel = 'No data';
        let attainmentVariant = 'neutral';
        if (attainmentPct !== null) {
          if (attainmentPct >= 85) {
            attainmentLabel = 'Higher average attainment';
            attainmentVariant = 'emerald';
          } else if (attainmentPct >= 70) {
            attainmentLabel = 'Balanced attainment';
            attainmentVariant = 'blue';
          } else {
            attainmentLabel = 'Frequently lower-scoring criterion';
            attainmentVariant = 'warning';
          }
        }

        return {
          id: crit.id,
          title: crit.title || crit.name,
          maxPoints,
          avgScore: avgScore !== null ? avgScore.toFixed(1) : null,
          attainmentPct,
          attainmentLabel,
          attainmentVariant
        };
      });

      return {
        assignmentId: asg.id,
        assignmentTitle: asg.title,
        sprint: asg.sprint,
        rubricTitle: linkedRubric.title,
        totalCriteria: linkedRubric.criteria.length,
        totalMarks: linkedRubric.totalMarks || 20,
        evalCount: asgEvals.length,
        criteria: criteriaAttainment
      };
    }).filter(Boolean);
  }, [filteredAssignments, rubrics, filteredEvaluations]);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-yellow" />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary">
              Facilitator Intelligence & Insights
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-brand-text-primary tracking-tight">
            Analytics & Evaluation Overview
          </h1>
          <p className="text-sm text-brand-text-secondary mt-1">
            Summary of cohort submission throughput, rubric attainment trends, and batch review activity.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
            className="text-xs font-semibold text-brand-text-secondary hover:text-brand-text-primary"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Human Assessment Authority Notice Banner */}
      <div className="p-4 rounded-2xl bg-[#EEF2FF] border border-[#C7D2FE] flex items-start gap-3.5 shadow-sm">
        <div className="w-8 h-8 rounded-xl bg-brand-blue flex items-center justify-center shrink-0 mt-0.5 text-white shadow-soft">
          <Sparkles className="w-4 h-4 text-brand-yellow" />
        </div>
        <div className="flex-1 text-xs">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-bold text-brand-blue uppercase tracking-wide text-[11px]">
              AI Advisory Boundary & Human Grading Authority
            </span>
            <Badge variant="blue" size="sm">Advisory Only</Badge>
          </div>
          <p className="text-brand-text-primary leading-relaxed">
            Analytics summarize evaluation activity and AI-assisted pre-review signals. 
            <strong> Final assessment decisions remain with the facilitator.</strong> AI never automatically changes scores, finalizes evaluations, or publishes student grades.
          </p>
        </div>
      </div>

      {/* Lightweight Filters Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-brand-text-secondary font-bold">
            <Filter className="w-3.5 h-3.5 text-brand-blue" />
            <span>Filter Cohort Data:</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 flex-1 max-w-4xl">
            {/* Course Filter */}
            <select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setSelectedUnitId('ALL');
              }}
              aria-label="Filter Course"
              className="px-3 py-2 rounded-xl border border-brand-border bg-[#FBFBFA] font-medium text-brand-text-primary focus:outline-none focus:border-brand-blue"
            >
              <option value="ALL">All Courses</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>

            {/* Unit Filter */}
            <select
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              aria-label="Filter Unit"
              className="px-3 py-2 rounded-xl border border-brand-border bg-[#FBFBFA] font-medium text-brand-text-primary focus:outline-none focus:border-brand-blue"
            >
              <option value="ALL">All Units</option>
              {availableUnits.map(u => (
                <option key={u.id} value={u.id}>Unit {u.unitNumber}: {u.title}</option>
              ))}
            </select>

            {/* Assignment Filter */}
            <select
              value={selectedAssignmentId}
              onChange={(e) => setSelectedAssignmentId(e.target.value)}
              aria-label="Filter Assignment"
              className="px-3 py-2 rounded-xl border border-brand-border bg-[#FBFBFA] font-medium text-brand-text-primary focus:outline-none focus:border-brand-blue"
            >
              <option value="ALL">All Assignments</option>
              {assignments.map(a => (
                <option key={a.id} value={a.id}>{a.sprint}: {a.title}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter Status"
              className="px-3 py-2 rounded-xl border border-brand-border bg-[#FBFBFA] font-medium text-brand-text-primary focus:outline-none focus:border-brand-blue"
            >
              <option value="ALL">All Evaluation Statuses</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="EVALUATED">Finalized / Evaluated</option>
              <option value="RETURNED">Returned for Revisions</option>
              <option value="RE_EVALUATION_REQUESTED">Re-Evaluation Requested</option>
              <option value="RE_EVALUATED">Re-Evaluated</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 1. Overview Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        <Card className="p-4 bg-white border border-brand-border">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-text-secondary">
              Assignments
            </span>
            <FileText className="w-3.5 h-3.5 text-brand-blue" />
          </div>
          <p className="text-2xl font-black text-brand-text-primary">
            {filteredAssignments.length}
          </p>
          <span className="text-[10px] text-brand-text-secondary mt-0.5 block">
            Cohort 4 Active Sprints
          </span>
        </Card>

        <Card className="p-4 bg-white border border-brand-border">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-text-secondary">
              Submissions
            </span>
            <Inbox className="w-3.5 h-3.5 text-brand-blue" />
          </div>
          <p className="text-2xl font-black text-brand-text-primary">
            {totalSubmissions}
          </p>
          <span className="text-[10px] text-brand-text-secondary mt-0.5 block">
            Deliverables Received
          </span>
        </Card>

        <Card className="p-4 bg-white border border-brand-border">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-warning">
              Pending / In Review
            </span>
            <AlertCircle className="w-3.5 h-3.5 text-brand-warning" />
          </div>
          <p className="text-2xl font-black text-brand-warning">
            {pendingCount}
          </p>
          <span className="text-[10px] text-brand-text-secondary mt-0.5 block">
            Awaiting Final Score
          </span>
        </Card>

        <Card className="p-4 bg-white border border-brand-border">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
              Evaluated
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600">
            {evaluatedCount}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">
            {evaluationCompletionRate}% Finalized
          </span>
        </Card>

        <Card className="p-4 bg-white border border-brand-border">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-blue">
              Re-Evaluations
            </span>
            <Award className="w-3.5 h-3.5 text-brand-blue" />
          </div>
          <p className="text-2xl font-black text-brand-blue">
            {reEvalCount}
          </p>
          <span className="text-[10px] text-brand-text-secondary mt-0.5 block">
            Appeals / Resolved
          </span>
        </Card>

        <Card className="p-4 bg-white border border-brand-border">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
              Batch Runs
            </span>
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-purple-600">
            {completedBatchesCount}
          </p>
          <span className="text-[10px] text-brand-text-secondary mt-0.5 block">
            AI Pre-Review Batches
          </span>
        </Card>
      </div>

      {/* 2. Submission Pipeline Visual Funnel */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-black text-brand-text-primary">
              Submission Throughput Pipeline
            </h2>
            <p className="text-xs text-brand-text-secondary">
              End-to-end status of student submissions through the evaluation lifecycle.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-brand-text-secondary">Overall Completion:</span>
            <Badge variant="blue" size="sm">{evaluationCompletionRate}% Finalized</Badge>
          </div>
        </div>

        {/* Stepped Visual Pipeline Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div className="p-3 bg-[#FBFBFA] rounded-xl border border-brand-border relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-brand-blue" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary block">
              1. Submitted
            </span>
            <span className="text-xl font-black text-brand-text-primary mt-1 block">
              {totalSubmissions}
            </span>
            <span className="text-[11px] text-brand-text-secondary mt-0.5 block">
              100% In Pipeline
            </span>
          </div>

          <div className="p-3 bg-[#FBFBFA] rounded-xl border border-brand-border relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-brand-warning" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-warning block">
              2. In Review
            </span>
            <span className="text-xl font-black text-brand-text-primary mt-1 block">
              {filteredSubmissions.filter(s => s.evaluationStatus === 'IN_REVIEW').length}
            </span>
            <span className="text-[11px] text-brand-text-secondary mt-0.5 block">
              {totalSubmissions > 0 ? Math.round((filteredSubmissions.filter(s => s.evaluationStatus === 'IN_REVIEW').length / totalSubmissions) * 100) : 0}% Active Review
            </span>
          </div>

          <div className="p-3 bg-[#FBFBFA] rounded-xl border border-brand-border relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
              3. Evaluated
            </span>
            <span className="text-xl font-black text-emerald-600 mt-1 block">
              {evaluatedCount}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
              {evaluationCompletionRate}% Finalized
            </span>
          </div>

          <div className="p-3 bg-[#FBFBFA] rounded-xl border border-brand-border relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-orange-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 block">
              4. Returned
            </span>
            <span className="text-xl font-black text-brand-text-primary mt-1 block">
              {returnedCount}
            </span>
            <span className="text-[11px] text-brand-text-secondary mt-0.5 block">
              {totalSubmissions > 0 ? Math.round((returnedCount / totalSubmissions) * 100) : 0}% Revisions
            </span>
          </div>

          <div className="p-3 bg-[#FBFBFA] rounded-xl border border-brand-border relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
              5. Re-Evaluation
            </span>
            <span className="text-xl font-black text-brand-text-primary mt-1 block">
              {reEvalCount}
            </span>
            <span className="text-[11px] text-brand-text-secondary mt-0.5 block">
              {totalSubmissions > 0 ? Math.round((reEvalCount / totalSubmissions) * 100) : 0}% Handled
            </span>
          </div>
        </div>

        {/* Progress Fill Meter */}
        <div className="w-full bg-[#F0F0EB] rounded-full h-3 flex overflow-hidden">
          <div
            style={{ width: `${evaluationCompletionRate}%` }}
            className="bg-emerald-500 h-full transition-all duration-500"
            title={`Finalized: ${evaluationCompletionRate}%`}
          />
          <div
            style={{ width: `${totalSubmissions > 0 ? Math.round((pendingCount / totalSubmissions) * 100) : 0}%` }}
            className="bg-brand-warning h-full transition-all duration-500"
            title={`Pending/In Review: ${totalSubmissions > 0 ? Math.round((pendingCount / totalSubmissions) * 100) : 0}%`}
          />
          <div
            style={{ width: `${totalSubmissions > 0 ? Math.round((returnedCount / totalSubmissions) * 100) : 0}%` }}
            className="bg-orange-400 h-full transition-all duration-500"
            title={`Returned: ${totalSubmissions > 0 ? Math.round((returnedCount / totalSubmissions) * 100) : 0}%`}
          />
        </div>
      </Card>

      {/* Row: Evaluation Status Distribution (Donut) & Batch Run Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-brand-text-primary">
                Evaluation Status Distribution
              </h2>
              <p className="text-xs text-brand-text-secondary">
                Breakdown of active submission states across the cohort.
              </p>
            </div>
            <Badge variant="neutral" size="sm">{totalSubmissions} Total</Badge>
          </div>

          {totalSubmissions === 0 ? (
            <div className="py-8 text-center text-xs text-brand-text-secondary">
              No submissions found for the selected filters.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
              {/* SVG Donut */}
              <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                <svg width={donutSize} height={donutSize} viewBox={`0 0 ${donutSize} ${donutSize}`} className="transform -rotate-90">
                  <circle
                    cx={donutSize / 2}
                    cy={donutSize / 2}
                    r={radius}
                    fill="transparent"
                    stroke="#F0F0EB"
                    strokeWidth={strokeWidth}
                  />
                  {donutSegments.map((item, idx) => (
                    <circle
                      key={idx}
                      cx={donutSize / 2}
                      cy={donutSize / 2}
                      r={radius}
                      fill="transparent"
                      stroke={item.color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={item.strokeDasharray}
                      strokeDashoffset={item.strokeDashoffset}
                      strokeLinecap="round"
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-xl font-black text-brand-text-primary">
                    {averageScorePercentage > 0 ? `${averageScorePercentage}%` : `${evaluationCompletionRate}%`}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-brand-text-secondary">
                    {averageScorePercentage > 0 ? 'Avg Attainment' : 'Evaluated'}
                  </span>
                </div>
              </div>

              {/* Legend with Counts */}
              <div className="space-y-2 text-xs w-full max-w-xs">
                {statusDistribution.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-brand-text-primary truncate">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 text-brand-text-secondary font-medium">
                      <span>{item.count}</span>
                      <span className="text-[11px] text-brand-text-secondary w-9 text-right font-bold">({item.percent}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Batch Evaluation Activity Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-base font-black text-brand-text-primary">
                  Batch Evaluation Assistant Activity
                </h2>
                <Badge variant="soft" size="sm">Pre-Review</Badge>
              </div>
              <p className="text-xs text-brand-text-secondary">
                Simulation throughput of AI advisory pre-review runs.
              </p>
            </div>
            <Sparkles className="w-4 h-4 text-brand-blue" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-[#FBFBFA] rounded-xl border border-brand-border">
              <span className="text-[10px] uppercase font-bold text-brand-text-secondary block">
                Total Batches
              </span>
              <span className="text-lg font-black text-brand-text-primary mt-0.5 block">
                {batchMetrics.totalBatches}
              </span>
            </div>

            <div className="p-3 bg-[#FBFBFA] rounded-xl border border-brand-border">
              <span className="text-[10px] uppercase font-bold text-emerald-600 block">
                Completed
              </span>
              <span className="text-lg font-black text-emerald-600 mt-0.5 block">
                {batchMetrics.completed}
              </span>
            </div>

            <div className="p-3 bg-[#FBFBFA] rounded-xl border border-brand-border">
              <span className="text-[10px] uppercase font-bold text-brand-blue block">
                Scanned
              </span>
              <span className="text-lg font-black text-brand-blue mt-0.5 block">
                {batchMetrics.totalCandidates}
              </span>
            </div>

            <div className="p-3 bg-[#FBFBFA] rounded-xl border border-brand-border">
              <span className="text-[10px] uppercase font-bold text-brand-warning block">
                Flags Raised
              </span>
              <span className="text-lg font-black text-brand-warning mt-0.5 block">
                {batchMetrics.totalFlags}
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-[#FBFBFA] rounded-xl border border-brand-border space-y-1.5 text-xs text-brand-text-secondary">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-brand-text-primary">Avg. Submissions Scanned / Batch:</span>
              <span className="font-bold text-brand-text-primary">{batchMetrics.avgPerBatch} items</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-brand-text-primary">Requires Facilitator Review:</span>
              <span className="font-bold text-brand-warning">{batchMetrics.reviewRequired} items</span>
            </div>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-start gap-2 text-xs text-brand-blue">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>
              Batch flags represent AI advisory signals (e.g., missing responsive frame, incomplete design tokens) for facilitator inspection, not automatic score deductions.
            </span>
          </div>
        </Card>
      </div>

      {/* 3. Assignment Performance Breakdown */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-brand-text-primary">
              Assignment Performance & Completion
            </h2>
            <p className="text-xs text-brand-text-secondary">
              Submission progress and finalized scoring attainment per assignment.
            </p>
          </div>

          <div className="relative w-full sm:w-64 text-xs">
            <Search className="w-3.5 h-3.5 text-brand-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={assignmentSearch}
              onChange={(e) => setAssignmentSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-brand-border bg-[#FBFBFA] text-xs font-medium focus:outline-none focus:border-brand-blue"
            />
          </div>
        </div>

        {filteredAssignments.length === 0 ? (
          <div className="py-8 text-center text-xs text-brand-text-secondary">
            No assignments match the specified search or filters.
          </div>
        ) : (
          <div className="overflow-x-auto border border-brand-border rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FBFBFA] text-brand-text-secondary font-bold uppercase tracking-wider border-b border-brand-border">
                <tr>
                  <th className="py-3 px-4">Assignment / Sprint</th>
                  <th className="py-3 px-3">Unit</th>
                  <th className="py-3 px-3 text-center">Submissions</th>
                  <th className="py-3 px-3 text-center">Evaluated</th>
                  <th className="py-3 px-3 text-center">Pending</th>
                  <th className="py-3 px-3 text-center">Avg Finalized Score</th>
                  <th className="py-3 px-4 text-right">Completion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {filteredAssignments.map((asg) => {
                  // Compute for this assignment
                  const asgSubs = submissions.filter(s => s.assignmentId === asg.id);
                  const asgEvaluated = asgSubs.filter(s => s.evaluationStatus === 'EVALUATED');
                  const asgPending = asgSubs.filter(s => s.evaluationStatus === 'PENDING_REVIEW' || s.evaluationStatus === 'IN_REVIEW');

                  const evaluatedScores = asgEvaluated
                    .map(s => s.score)
                    .filter(score => typeof score === 'number');

                  const avgScore = evaluatedScores.length > 0
                    ? (evaluatedScores.reduce((a, b) => a + b, 0) / evaluatedScores.length).toFixed(1)
                    : null;

                  const completionPct = asgSubs.length > 0
                    ? Math.round((asgEvaluated.length / asgSubs.length) * 100)
                    : (asg.submittedCount > 0 ? Math.round(((asg.evaluatedCount || 0) / asg.submittedCount) * 100) : 0);

                  return (
                    <tr key={asg.id} className="hover:bg-[#FDFDFD] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-brand-text-primary">
                        <span className="text-brand-blue block text-[11px]">{asg.sprint}</span>
                        {asg.title}
                      </td>
                      <td className="py-3.5 px-3 text-brand-text-secondary font-medium">
                        {asg.unitTitle || `Unit ${asg.unitId}`}
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-brand-text-primary">
                        {asgSubs.length || asg.submittedCount || 0}
                      </td>
                      <td className="py-3.5 px-3 text-center font-semibold text-emerald-600">
                        {asgEvaluated.length || asg.evaluatedCount || 0}
                      </td>
                      <td className="py-3.5 px-3 text-center font-semibold text-brand-warning">
                        {asgPending.length || asg.pendingReviewCount || 0}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        {avgScore !== null ? (
                          <span className="font-bold text-brand-text-primary">
                            {avgScore} / {asg.maxScore || 20}
                            <span className="text-[10px] text-brand-text-secondary block font-normal">
                              ({Math.round((avgScore / (asg.maxScore || 20)) * 100)}%)
                            </span>
                          </span>
                        ) : (
                          <span className="text-brand-text-secondary italic">No scores yet</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-[#F0F0EB] rounded-full h-2 overflow-hidden">
                            <div
                              style={{ width: `${completionPct}%` }}
                              className="bg-emerald-500 h-full rounded-full"
                            />
                          </div>
                          <span className="font-bold text-brand-text-primary w-8 text-right">
                            {completionPct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 4. Rubric Insights & Criterion-Level Attainment */}
      <Card className="p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-black text-brand-text-primary">
              Rubric Criterion Attainment Insights
            </h2>
            <p className="text-xs text-brand-text-secondary">
              Criterion-level scoring attainment across evaluated student submissions.
            </p>
          </div>
          <Badge variant="blue" size="sm">Neutral Attainment Descriptors</Badge>
        </div>

        {rubricInsights.length === 0 ? (
          <div className="py-8 text-center text-xs text-brand-text-secondary">
            No rubric evaluation data available for selected assignments.
          </div>
        ) : (
          <div className="space-y-6">
            {rubricInsights.map((r) => (
              <div key={r.assignmentId} className="p-4 rounded-xl border border-brand-border bg-[#FDFDFD] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-brand-border/60">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-brand-blue tracking-wide">
                      {r.sprint} Rubric
                    </span>
                    <h3 className="text-sm font-bold text-brand-text-primary">
                      {r.rubricTitle}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-brand-text-secondary">
                    <span>{r.totalCriteria} Criteria</span>
                    <span>•</span>
                    <span>{r.totalMarks} Total Marks</span>
                    <span>•</span>
                    <span className="font-semibold text-emerald-600">{r.evalCount} Evaluated</span>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  {r.criteria.map((crit) => (
                    <div key={crit.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-brand-text-primary">{crit.title}</span>
                          {crit.attainmentPct !== null && (
                            <Badge
                              variant={crit.attainmentVariant === 'warning' ? 'warning' : crit.attainmentVariant === 'emerald' ? 'success' : 'soft'}
                              size="sm"
                            >
                              {crit.attainmentLabel}
                            </Badge>
                          )}
                        </div>
                        <div className="font-semibold text-brand-text-primary">
                          {crit.avgScore !== null ? (
                            <span>
                              {crit.avgScore} / {crit.maxPoints} pts{' '}
                              <span className="text-brand-text-secondary font-normal">({crit.attainmentPct}%)</span>
                            </span>
                          ) : (
                            <span className="text-brand-text-secondary italic">Awaiting evaluations</span>
                          )}
                        </div>
                      </div>

                      {/* Attainment progress bar */}
                      <div className="w-full bg-[#F0F0EB] rounded-full h-2 overflow-hidden">
                        <div
                          style={{ width: `${crit.attainmentPct || 0}%` }}
                          className={`h-full rounded-full transition-all duration-300 ${
                            (crit.attainmentPct || 0) >= 85
                              ? 'bg-emerald-500'
                              : (crit.attainmentPct || 0) >= 70
                              ? 'bg-brand-blue'
                              : 'bg-brand-warning'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default FacilitatorAnalytics;
