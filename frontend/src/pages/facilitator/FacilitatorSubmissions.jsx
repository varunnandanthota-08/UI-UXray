import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import SubmissionReviewModal from '../../components/facilitator/SubmissionReviewModal';
import { submissionApi } from '../../api/submissionApi';
import { assignmentApi } from '../../api/assignmentApi';
import { 
  getFacilitatorSubmissions, 
  getFacilitatorAssignments, 
  mockFacilitatorCourses 
} from '../../data/mockFacilitatorData';
import { 
  Search, 
  Calendar, 
  Award, 
  X, 
  LayoutGrid,
  List,
  Layers,
  Inbox,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  UserCheck,
  ChevronDown
} from 'lucide-react';

export const FacilitatorSubmissions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const assignmentIdParam = searchParams.get('assignmentId') || 'ALL';

  // Submissions data
  const [submissions, setSubmissions] = useState(() => {
    return isDemoSession() ? getFacilitatorSubmissions() : [];
  });
  const [assignments, setAssignments] = useState(() => {
    return isDemoSession() ? getFacilitatorAssignments() : [];
  });
  const [isLoading, setIsLoading] = useState(!isDemoSession());
  const [apiError, setApiError] = useState(null);
  const currentCourse = mockFacilitatorCourses[0];

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState(assignmentIdParam);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [filterReEvalOnly, setFilterReEvalOnly] = useState(false);
  const [viewMode, setViewMode] = useState('TABLE'); // 'TABLE' or 'CARDS'

  // Review Modal state
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Sync data via API adapter
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      setApiError(null);
      try {
        const [subsData, asgsData] = await Promise.all([
          submissionApi.getSubmissions(),
          assignmentApi.getAssignments()
        ]);
        if (isMounted) {
          setSubmissions(Array.isArray(subsData) ? subsData : []);
          setAssignments(Array.isArray(asgsData) ? asgsData : []);
        }
      } catch (err) {
        if (isMounted) setApiError(err.userFriendlyMessage || err.message || 'Failed to sync queue with server');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  // Sync if assignmentId query parameter changes in URL
  useEffect(() => {
    if (assignmentIdParam) {
      setSelectedAssignment(assignmentIdParam);
    }
  }, [assignmentIdParam]);

  // Filter logic
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      // Search match
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        sub.studentName?.toLowerCase().includes(query) ||
        sub.studentEmail?.toLowerCase().includes(query) ||
        sub.assignmentTitle?.toLowerCase().includes(query) ||
        sub.unitTitle?.toLowerCase().includes(query);

      // Assignment match
      const matchesAssignment = selectedAssignment === 'ALL' || sub.assignmentId === selectedAssignment;

      // Evaluation Status match
      const matchesStatus = selectedStatus === 'ALL' || sub.evaluationStatus === selectedStatus;

      // Re-evaluation match
      const matchesReEval = !filterReEvalOnly || sub.hasReEvaluationRequest;

      return matchesSearch && matchesAssignment && matchesStatus && matchesReEval;
    });
  }, [submissions, searchQuery, selectedAssignment, selectedStatus, filterReEvalOnly]);

  // Counts
  const totalCount = submissions.length;
  const pendingCount = submissions.filter(s => s.evaluationStatus === 'PENDING_REVIEW').length;
  const inReviewCount = submissions.filter(s => s.evaluationStatus === 'IN_REVIEW').length;
  const evaluatedCount = submissions.filter(s => s.evaluationStatus === 'EVALUATED').length;
  const reEvalCount = submissions.filter(s => s.hasReEvaluationRequest).length;

  // Handlers
  const handleOpenReview = (submission) => {
    setSelectedSubmission(submission);
    setIsReviewModalOpen(true);
  };

  const handleSubmissionUpdated = (updatedSub) => {
    setSubmissions(prev => prev.map(s => s.id === updatedSub.id ? updatedSub : s));
    setSelectedSubmission(updatedSub);
  };

  const handleAssignmentFilterChange = (val) => {
    setSelectedAssignment(val);
    if (val === 'ALL') {
      searchParams.delete('assignmentId');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ assignmentId: val });
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedAssignment('ALL');
    setSelectedStatus('ALL');
    setFilterReEvalOnly(false);
    searchParams.delete('assignmentId');
    setSearchParams(searchParams);
  };

  const hasActiveFilters = searchQuery !== '' || selectedAssignment !== 'ALL' || selectedStatus !== 'ALL' || filterReEvalOnly;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Top Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="warning" size="sm">
              FACILITATOR GRADING
            </Badge>
            <span className="text-xs text-brand-text-secondary">
              Cohort Queue • {currentCourse?.title}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-brand-text-primary tracking-tight">
            Submissions & Grading Queue
          </h1>
          <p className="text-xs md:text-sm text-brand-text-secondary mt-1 max-w-xl leading-relaxed">
            Review student deliverables, inspect Figma file evidence, apply rubric criterion scores, and publish qualitative feedback.
          </p>
        </div>

        {/* Re-evaluation indicator badge if any requests exist */}
        {reEvalCount > 0 && (
          <button
            onClick={() => setFilterReEvalOnly(prev => !prev)}
            className={`px-3.5 py-2 rounded-2xl border text-xs font-bold transition-colors flex items-center gap-2 shrink-0 ${
              filterReEvalOnly
                ? 'bg-purple-100 border-purple-300 text-purple-900 shadow-2xs'
                : 'bg-purple-50/80 border-purple-200 text-purple-800 hover:bg-purple-100'
            }`}
          >
            <RotateCcw className="w-4 h-4 text-purple-600" />
            <span>{reEvalCount} Re-Evaluation Request{reEvalCount > 1 ? 's' : ''}</span>
          </button>
        )}
      </div>

      {/* API Notice / Error Banner if any */}
      {apiError && (
        <div className="flex items-center justify-between p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-700 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{apiError}</span>
          </div>
          <button onClick={() => setApiError(null)} className="text-amber-700 hover:text-amber-900 font-bold text-sm px-1.5">×</button>
        </div>
      )}

      {/* Human Evaluator Authority Banner */}
      <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200/80 flex items-start gap-3.5">
        <UserCheck className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h4 className="font-bold text-brand-blue">
            Human Evaluator Decision Authority
          </h4>
          <p className="text-blue-900 leading-relaxed">
            Final evaluation scores and qualitative feedback are entered and authorized exclusively by the facilitator. Automated tooling serves as advisory evidence and never assigns autonomous grades.
          </p>
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-2xl border border-brand-border p-4 shadow-soft">
          <span className="text-[11px] font-bold text-brand-text-secondary uppercase tracking-wider block">
            Total Submissions
          </span>
          <span className="text-2xl md:text-3xl font-black text-brand-text-primary mt-2 block">
            {totalCount}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-brand-border p-4 shadow-soft">
          <span className="text-[11px] font-bold text-brand-text-secondary uppercase tracking-wider block">
            Pending Review
          </span>
          <span className="text-2xl md:text-3xl font-black text-brand-warning mt-2 block">
            {pendingCount}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-brand-border p-4 shadow-soft">
          <span className="text-[11px] font-bold text-brand-text-secondary uppercase tracking-wider block">
            In Review (Drafts)
          </span>
          <span className="text-2xl md:text-3xl font-black text-brand-blue mt-2 block">
            {inReviewCount}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-brand-border p-4 shadow-soft">
          <span className="text-[11px] font-bold text-brand-text-secondary uppercase tracking-wider block">
            Evaluated & Published
          </span>
          <span className="text-2xl md:text-3xl font-black text-emerald-600 mt-2 block">
            {evaluatedCount}
          </span>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <Card className="p-3.5 md:p-4 shadow-soft space-y-3">
        <div className="flex flex-wrap items-center gap-2.5 w-full">
          {/* 1. Search Input */}
          <div className="relative flex-1 min-w-[200px] sm:min-w-[240px] max-w-sm shrink-0">
            <Search className="w-4 h-4 text-brand-text-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student name, email..."
              className="w-full h-9 pl-9 pr-8 rounded-xl border border-brand-border bg-[#FBFBFA] text-xs font-medium text-brand-text-primary focus:outline-none focus:border-brand-blue focus:bg-white transition-all shadow-2xs placeholder:text-brand-text-secondary/70"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-text-secondary hover:text-brand-text-primary p-0.5"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 2. Assignment Filter */}
          <div className="relative shrink-0">
            <select
              value={selectedAssignment}
              onChange={(e) => handleAssignmentFilterChange(e.target.value)}
              aria-label="Filter by Assignment"
              className="h-9 pl-3 pr-8 rounded-xl border border-brand-border bg-[#FBFBFA] text-xs font-medium text-brand-text-primary focus:outline-none focus:border-brand-blue focus:bg-white transition-all shadow-2xs appearance-none cursor-pointer max-w-[200px] sm:max-w-[220px] truncate"
            >
              <option value="ALL">All Assignments</option>
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.sprint}: {a.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-brand-text-secondary absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* 3. Status Pills */}
          <div className="flex items-center h-9 bg-[#F4F4F0] p-1 rounded-xl shrink-0 overflow-x-auto">
            {[
              { key: 'ALL', label: 'All' },
              { key: 'PENDING_REVIEW', label: 'Pending' },
              { key: 'IN_REVIEW', label: 'In Review' },
              { key: 'EVALUATED', label: 'Evaluated' },
              { key: 'RETURNED', label: 'Returned' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedStatus(tab.key)}
                className={`h-7 px-2.5 md:px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center shrink-0 ${
                  selectedStatus === tab.key
                    ? 'bg-white text-brand-text-primary shadow-2xs'
                    : 'text-brand-text-secondary hover:text-brand-text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 4. Reset Filters button */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="h-9 px-2 text-xs font-semibold text-brand-text-secondary hover:text-brand-warning transition-colors flex items-center gap-1 shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          {/* 5. View Mode Toggle */}
          <div className="flex items-center h-9 bg-[#F4F4F0] p-1 rounded-xl shrink-0 sm:ml-auto">
            <button
              onClick={() => setViewMode('TABLE')}
              className={`h-7 w-8 rounded-lg flex items-center justify-center transition-all ${
                viewMode === 'TABLE'
                  ? 'bg-white text-brand-blue shadow-2xs'
                  : 'text-brand-text-secondary hover:text-brand-text-primary'
              }`}
              title="Table View"
              aria-label="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('CARDS')}
              className={`h-7 w-8 rounded-lg flex items-center justify-center transition-all ${
                viewMode === 'CARDS'
                  ? 'bg-white text-brand-blue shadow-2xs'
                  : 'text-brand-text-secondary hover:text-brand-text-primary'
              }`}
              title="Grid Cards View"
              aria-label="Grid Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Results Info Line */}
        <div className="flex items-center justify-between text-[11px] text-brand-text-secondary pt-2 border-t border-brand-border/50">
          <span>
            Showing <strong className="text-brand-text-primary font-semibold">{filteredSubmissions.length}</strong> of {totalCount} submissions
          </span>
          {selectedAssignment !== 'ALL' && (
            <span className="text-brand-blue font-medium flex items-center gap-1">
              <Layers className="w-3 h-3" /> Filtered by Assignment: {assignments.find(a => a.id === selectedAssignment)?.title || selectedAssignment}
            </span>
          )}
        </div>
      </Card>

      {/* Main Submissions Content */}
      {isLoading ? (
        <Card className="p-12 text-center shadow-soft">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-brand-blue border-t-transparent animate-spin" />
            <p className="text-xs font-semibold text-brand-text-secondary">Loading cohort submissions...</p>
          </div>
        </Card>
      ) : apiError ? (
        <Card className="p-8 text-center shadow-soft border-red-200 bg-red-50/40">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-red-900">
              Unable to load submissions
            </h3>
            <p className="text-xs text-red-700 leading-relaxed">
              {apiError}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              className="mt-2 text-xs border-red-300 text-red-800 hover:bg-red-100"
            >
              Retry
            </Button>
          </div>
        </Card>
      ) : filteredSubmissions.length === 0 ? (
        <Card className="p-12 text-center shadow-soft">
          <div className="max-w-sm mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-blue-light text-brand-blue flex items-center justify-center mx-auto">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-brand-text-primary">
              {hasActiveFilters ? 'No submissions match criteria' : 'No submissions yet'}
            </h3>
            <p className="text-xs text-brand-text-secondary leading-relaxed">
              {hasActiveFilters
                ? 'Try clearing active filters or search terms to see all cohort submissions.'
                : 'No student submissions have been submitted for your assignments yet.'}
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="mt-2"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </Card>
      ) : viewMode === 'TABLE' ? (
        /* Table View */
        <Card className="shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-brand-border bg-[#FCFCFA] text-[11px] font-bold text-brand-text-secondary uppercase tracking-wider">
                  <th className="py-3.5 px-5">Student</th>
                  <th className="py-3.5 px-4">Assignment & Unit</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4">Deliverables</th>
                  <th className="py-3.5 px-4">Evaluation Status</th>
                  <th className="py-3.5 px-4">Score</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {filteredSubmissions.map((sub) => {
                  const isEvaluated = sub.evaluationStatus === 'EVALUATED';
                  const isInReview = sub.evaluationStatus === 'IN_REVIEW';
                  const isReturned = sub.evaluationStatus === 'RETURNED';
                  const deliverables = sub.deliverables || [];
                  const missingCount = deliverables.filter(d => !d.isSubmitted).length;

                  return (
                    <tr 
                      key={sub.id}
                      className="hover:bg-[#FCFCFA] transition-colors group"
                    >
                      {/* Student Profile */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <img 
                            src={sub.studentAvatar} 
                            alt={sub.studentName}
                            className="w-8 h-8 rounded-full object-cover border border-brand-border shrink-0"
                          />
                          <div>
                            <h4 
                              onClick={() => handleOpenReview(sub)}
                              className="text-xs font-bold text-brand-text-primary group-hover:text-brand-blue cursor-pointer transition-colors"
                            >
                              {sub.studentName}
                            </h4>
                            <span className="text-[11px] text-brand-text-secondary block">
                              {sub.studentEmail}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Assignment & Unit */}
                      <td className="py-4 px-4 max-w-xs">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue bg-brand-blue-light px-2 py-0.5 rounded-full inline-block">
                            {sub.unitTitle ? sub.unitTitle.split(':')[0] : 'Unit'}
                          </span>
                          <h5 className="text-xs font-semibold text-brand-text-primary truncate block mt-1">
                            {sub.assignmentTitle}
                          </h5>
                        </div>
                      </td>

                      {/* Submitted Date */}
                      <td className="py-4 px-4 whitespace-nowrap text-brand-text-secondary">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-amber-500" />
                          <span className="font-medium text-brand-text-primary">
                            {sub.submittedAtFormatted}
                          </span>
                        </div>
                      </td>

                      {/* Deliverables Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className="text-[11px] font-semibold text-brand-text-primary block">
                            {deliverables.length - missingCount}/{deliverables.length} Items
                          </span>
                          {missingCount > 0 ? (
                            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> {missingCount} Missing
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Complete
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Evaluation Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <Badge
                            variant={
                              isEvaluated ? 'success' :
                              isReturned ? 'danger' :
                              isInReview ? 'blue' : 'warning'
                            }
                            size="sm"
                            dot={isEvaluated || isInReview}
                          >
                            {sub.evaluationStatus.replace('_', ' ')}
                          </Badge>

                          {sub.hasReEvaluationRequest && (
                            <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded block">
                              Re-Eval Active
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Score */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {isEvaluated && sub.score !== null ? (
                          <div className="flex items-center gap-1.5 font-bold text-brand-blue">
                            <Award className="w-4 h-4" />
                            <span>{sub.score} / {sub.maxScore || 20} pts</span>
                          </div>
                        ) : isInReview && sub.evaluation?.totalScore > 0 ? (
                          <span className="text-[11px] font-bold text-amber-600">
                            Draft: {sub.evaluation.totalScore} pts
                          </span>
                        ) : (
                          <span className="text-[11px] text-brand-text-secondary font-medium">
                            Not Graded
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <Button
                          variant={isEvaluated ? 'outline' : 'primary'}
                          size="sm"
                          onClick={() => handleOpenReview(sub)}
                          className="font-bold text-xs"
                        >
                          {isEvaluated ? 'Inspect Result' : isInReview ? 'Resume Review' : 'Review & Grade'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubmissions.map((sub) => {
            const isEvaluated = sub.evaluationStatus === 'EVALUATED';
            const isInReview = sub.evaluationStatus === 'IN_REVIEW';
            const isReturned = sub.evaluationStatus === 'RETURNED';
            const deliverables = sub.deliverables || [];
            const missingCount = deliverables.filter(d => !d.isSubmitted).length;

            return (
              <Card 
                key={sub.id}
                className="p-5 shadow-soft flex flex-col justify-between space-y-4 hover:border-brand-border-strong transition-all"
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={sub.studentAvatar} 
                        alt={sub.studentName}
                        className="w-9 h-9 rounded-full object-cover border border-brand-border"
                      />
                      <div>
                        <h4 
                          onClick={() => handleOpenReview(sub)}
                          className="text-xs font-bold text-brand-text-primary hover:text-brand-blue cursor-pointer transition-colors"
                        >
                          {sub.studentName}
                        </h4>
                        <span className="text-[10px] text-brand-text-secondary block">
                          {sub.studentCohort}
                        </span>
                      </div>
                    </div>

                    <Badge
                      variant={
                        isEvaluated ? 'success' :
                        isReturned ? 'danger' :
                        isInReview ? 'blue' : 'warning'
                      }
                      size="sm"
                    >
                      {sub.evaluationStatus.replace('_', ' ')}
                    </Badge>
                  </div>

                  {/* Assignment Pill */}
                  <div className="p-2.5 bg-[#FBFBFA] rounded-xl border border-brand-border space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue block">
                      {sub.unitTitle ? sub.unitTitle.split(':')[0] : 'Unit'}
                    </span>
                    <p className="text-xs font-semibold text-brand-text-primary truncate">
                      {sub.assignmentTitle}
                    </p>
                  </div>

                  {/* Deliverables summary */}
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-brand-text-secondary font-medium">Deliverables:</span>
                    {missingCount > 0 ? (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {missingCount} Missing
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Complete
                      </span>
                    )}
                  </div>

                  {/* Re-evaluation flag */}
                  {sub.hasReEvaluationRequest && (
                    <div className="p-2 bg-purple-50 rounded-xl border border-purple-200 text-[10px] text-purple-900 flex items-center gap-1.5">
                      <RotateCcw className="w-3 h-3 text-purple-600 shrink-0" />
                      <span>Re-evaluation review requested</span>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between">
                  <div>
                    {isEvaluated && sub.score !== null ? (
                      <span className="text-xs font-bold text-brand-blue flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        {sub.score} / {sub.maxScore || 20} pts
                      </span>
                    ) : (
                      <span className="text-[11px] text-brand-text-secondary">
                        {sub.submittedAtFormatted.split(',')[0]}
                      </span>
                    )}
                  </div>

                  <Button
                    variant={isEvaluated ? 'outline' : 'primary'}
                    size="sm"
                    onClick={() => handleOpenReview(sub)}
                    className="text-xs font-bold"
                  >
                    {isEvaluated ? 'Inspect' : 'Grade'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Submission Review and Grading Modal */}
      <SubmissionReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedSubmission(null);
        }}
        submission={selectedSubmission}
        onSubmissionUpdated={handleSubmissionUpdated}
      />
    </div>
  );
};

export default FacilitatorSubmissions;
