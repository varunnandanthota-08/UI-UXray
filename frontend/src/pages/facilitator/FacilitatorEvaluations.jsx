import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EvaluationDetailModal from '../../components/facilitator/EvaluationDetailModal';
import { evaluationApi } from '../../api/evaluationApi';
import { assignmentApi } from '../../api/assignmentApi';
import { 
  getFacilitatorEvaluations, 
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
  RotateCcw, 
  Eye, 
  History, 
  ShieldCheck,
  AlertCircle,
  ChevronDown
} from 'lucide-react';

export const FacilitatorEvaluations = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const assignmentIdParam = searchParams.get('assignmentId') || 'ALL';
  const statusParam = searchParams.get('status') || 'ALL';

  // State
  const [evaluations, setEvaluations] = useState(getFacilitatorEvaluations);
  const [assignments, setAssignments] = useState(getFacilitatorAssignments);
  const [apiError, setApiError] = useState(null);
  const currentCourse = mockFacilitatorCourses[0];

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState(assignmentIdParam);
  const [selectedStatus, setSelectedStatus] = useState(statusParam);
  const [viewMode, setViewMode] = useState('TABLE');

  // Inspection Modal
  const [viewingEvaluation, setViewingEvaluation] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Sync data via API adapter
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [evalsData, asgsData] = await Promise.all([
          evaluationApi.getEvaluations(),
          assignmentApi.getAssignments()
        ]);
        if (isMounted) {
          if (evalsData) setEvaluations(evalsData);
          if (asgsData) setAssignments(asgsData);
        }
      } catch (err) {
        if (isMounted) setApiError(err.message || 'Failed to sync evaluations with server');
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  // Sync with URL query params
  useEffect(() => {
    if (assignmentIdParam) setSelectedAssignment(assignmentIdParam);
    if (statusParam) setSelectedStatus(statusParam);
  }, [assignmentIdParam, statusParam]);

  // Filtered evaluations
  const filteredEvaluations = useMemo(() => {
    return evaluations.filter((ev) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        ev.studentName?.toLowerCase().includes(query) ||
        ev.studentEmail?.toLowerCase().includes(query) ||
        ev.assignmentTitle?.toLowerCase().includes(query) ||
        ev.unitTitle?.toLowerCase().includes(query);

      const matchesAssignment = selectedAssignment === 'ALL' || ev.assignmentId === selectedAssignment;
      const matchesStatus = selectedStatus === 'ALL' || ev.status === selectedStatus;

      return matchesSearch && matchesAssignment && matchesStatus;
    });
  }, [evaluations, searchQuery, selectedAssignment, selectedStatus]);

  // Counts & metrics
  const totalCount = evaluations.length;
  const finalizedCount = evaluations.filter(e => e.status === 'FINALIZED').length;
  const reEvalRequestedCount = evaluations.filter(e => e.status === 'RE_EVALUATION_REQUESTED' || e.reEvaluation?.status === 'REQUESTED').length;
  const reEvaluatedCount = evaluations.filter(e => e.status === 'RE_EVALUATED').length;

  const averageScore = useMemo(() => {
    if (evaluations.length === 0) return 0;
    const sum = evaluations.reduce((acc, e) => acc + (Number(e.score) || 0), 0);
    return Math.round((sum / evaluations.length) * 10) / 10;
  }, [evaluations]);

  // Active re-evaluation requests list
  const activeReEvalRequests = useMemo(() => {
    return evaluations.filter(e => e.reEvaluation?.isRequested && e.reEvaluation.status !== 'COMPLETED');
  }, [evaluations]);

  // Handlers
  const handleOpenDetail = (ev) => {
    setViewingEvaluation(ev);
    setIsDetailModalOpen(true);
  };

  const handleAssignmentFilterChange = (val) => {
    setSelectedAssignment(val);
    if (val === 'ALL') {
      searchParams.delete('assignmentId');
    } else {
      searchParams.set('assignmentId', val);
    }
    setSearchParams(searchParams);
  };

  const handleStatusFilterChange = (val) => {
    setSelectedStatus(val);
    if (val === 'ALL') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', val);
    }
    setSearchParams(searchParams);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedAssignment('ALL');
    setSelectedStatus('ALL');
    searchParams.delete('assignmentId');
    searchParams.delete('status');
    setSearchParams(searchParams);
  };

  const hasActiveFilters = searchQuery !== '' || selectedAssignment !== 'ALL' || selectedStatus !== 'ALL';

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Top Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="blue" size="sm">
              FEEDBACK AUDIT & RECORDS
            </Badge>
            <span className="text-xs text-brand-text-secondary">
              Cohort Grades • {currentCourse?.title}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-brand-text-primary tracking-tight">
            Completed Evaluations & Audit
          </h1>
          <p className="text-xs md:text-sm text-brand-text-secondary mt-1 max-w-xl leading-relaxed">
            Audit finalized rubric grades, qualitative mentor feedback, and version history. Facilitators retain exclusive assessment authority.
          </p>
        </div>

        {/* Link to submissions queue */}
        <Link to="/facilitator/submissions">
          <Button variant="outline" size="md">
            View Active Grading Queue
          </Button>
        </Link>
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
      <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 flex items-start gap-3.5">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h4 className="font-bold text-emerald-950">
            Immutable Finalized Assessment Records
          </h4>
          <p className="text-emerald-900 leading-relaxed">
            Finalized evaluations are preserved as official cohort records. Grades cannot be arbitrarily edited from the audit view; all revisions require a formal re-evaluation cycle preserving version history.
          </p>
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-2xl border border-brand-border p-4 shadow-soft">
          <span className="text-[11px] font-bold text-brand-text-secondary uppercase tracking-wider block">
            Evaluated Submissions
          </span>
          <span className="text-2xl md:text-3xl font-black text-brand-text-primary mt-2 block">
            {totalCount}
          </span>
          <span className="text-[10px] text-brand-text-secondary font-medium mt-0.5 block">
            {finalizedCount} finalized records
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-brand-border p-4 shadow-soft">
          <span className="text-[11px] font-bold text-brand-text-secondary uppercase tracking-wider block">
            Average Score
          </span>
          <span className="text-2xl md:text-3xl font-black text-brand-blue mt-2 block">
            {averageScore} <span className="text-xs font-normal text-brand-text-secondary">/ 20</span>
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-brand-border p-4 shadow-soft">
          <span className="text-[11px] font-bold text-brand-text-secondary uppercase tracking-wider block">
            Re-Evaluation Requests
          </span>
          <span className={`text-2xl md:text-3xl font-black mt-2 block ${reEvalRequestedCount > 0 ? 'text-purple-600' : 'text-brand-text-secondary'}`}>
            {reEvalRequestedCount}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-brand-border p-4 shadow-soft">
          <span className="text-[11px] font-bold text-brand-text-secondary uppercase tracking-wider block">
            Re-Evaluated (Resolved)
          </span>
          <span className="text-2xl md:text-3xl font-black text-emerald-600 mt-2 block">
            {reEvaluatedCount}
          </span>
        </div>
      </div>

      {/* Active Re-evaluations Section (Requirement 6) */}
      {activeReEvalRequests.length > 0 && (
        <Card className="p-5 border-purple-200 bg-purple-50/40 shadow-soft space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm font-bold text-purple-950">
                Active Re-Evaluation Requests ({activeReEvalRequests.length})
              </h3>
            </div>
            <span className="text-[11px] text-purple-800 font-semibold">
              Action Required
            </span>
          </div>

          <div className="space-y-3">
            {activeReEvalRequests.map((req) => (
              <div 
                key={req.id}
                className="p-4 bg-white rounded-2xl border border-purple-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <img 
                      src={req.studentAvatar} 
                      alt={req.studentName} 
                      className="w-6 h-6 rounded-full object-cover border border-brand-border"
                    />
                    <strong className="text-xs text-brand-text-primary">
                      {req.studentName}
                    </strong>
                    <span className="text-[11px] text-brand-text-secondary">
                      • {req.assignmentTitle}
                    </span>
                    <Badge variant="warning" size="sm" className="text-[9px] font-bold">
                      Original: {req.score} / {req.maxScore || 20} pts
                    </Badge>
                  </div>
                  <p className="text-xs text-purple-950 italic pl-8 leading-relaxed">
                    "{req.reEvaluation?.reason}"
                  </p>
                  <span className="text-[10px] text-brand-text-secondary pl-8 block">
                    Requested: {req.reEvaluation?.requestedAt}
                  </span>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDetail(req)}
                    className="text-xs"
                  >
                    View Original
                  </Button>
                  <Link to={`/facilitator/evaluations/re-evaluation/${req.submissionId || req.id}`}>
                    <Button
                      variant="primary"
                      size="sm"
                      className="text-xs font-bold shadow-sm"
                    >
                      Handle Request
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

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
              placeholder="Search student, email..."
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
              { key: 'FINALIZED', label: 'Finalized' },
              { key: 'RE_EVALUATION_REQUESTED', label: 'Re-Eval Active' },
              { key: 'RE_EVALUATED', label: 'Re-Evaluated' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleStatusFilterChange(tab.key)}
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
            Showing <strong className="text-brand-text-primary font-semibold">{filteredEvaluations.length}</strong> of {totalCount} records
          </span>
          {selectedAssignment !== 'ALL' && (
            <span className="text-brand-blue font-medium flex items-center gap-1">
              <Layers className="w-3 h-3" /> {assignments.find(a => a.id === selectedAssignment)?.title || selectedAssignment}
            </span>
          )}
        </div>
      </Card>

      {/* Main Evaluations Content */}
      {filteredEvaluations.length === 0 ? (
        <Card className="p-12 text-center shadow-soft">
          <div className="max-w-sm mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-blue-light text-brand-blue flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-brand-text-primary">
              No evaluation records found
            </h3>
            <p className="text-xs text-brand-text-secondary leading-relaxed">
              {hasActiveFilters
                ? 'Try resetting the filters or clearing the search bar to view all cohort evaluations.'
                : 'No submissions have been finalized for evaluation yet.'}
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
                  <th className="py-3.5 px-4">Evaluated Date</th>
                  <th className="py-3.5 px-4">Final Score</th>
                  <th className="py-3.5 px-4">Audit Status</th>
                  <th className="py-3.5 px-4">Reviewer</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {filteredEvaluations.map((ev) => {
                  const isReEval = ev.status === 'RE_EVALUATION_REQUESTED' || ev.reEvaluation?.status === 'REQUESTED';
                  const isReEvaluated = ev.status === 'RE_EVALUATED';
                  const versionsCount = ev.versions?.length || 1;

                  return (
                    <tr 
                      key={ev.id}
                      className="hover:bg-[#FCFCFA] transition-colors group"
                    >
                      {/* Student Profile */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <img 
                            src={ev.studentAvatar} 
                            alt={ev.studentName}
                            className="w-8 h-8 rounded-full object-cover border border-brand-border shrink-0"
                          />
                          <div>
                            <h4 
                              onClick={() => handleOpenDetail(ev)}
                              className="text-xs font-bold text-brand-text-primary group-hover:text-brand-blue cursor-pointer transition-colors"
                            >
                              {ev.studentName}
                            </h4>
                            <span className="text-[11px] text-brand-text-secondary block">
                              {ev.studentEmail}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Assignment & Unit */}
                      <td className="py-4 px-4 max-w-xs">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue bg-brand-blue-light px-2 py-0.5 rounded-full inline-block">
                            {ev.unitTitle ? ev.unitTitle.split(':')[0] : 'Unit'}
                          </span>
                          <h5 className="text-xs font-semibold text-brand-text-primary truncate block mt-1">
                            {ev.assignmentTitle}
                          </h5>
                        </div>
                      </td>

                      {/* Evaluated Date */}
                      <td className="py-4 px-4 whitespace-nowrap text-brand-text-secondary">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-amber-500" />
                          <span className="font-medium text-brand-text-primary">
                            {ev.evaluationDate}
                          </span>
                        </div>
                      </td>

                      {/* Score & Percentage */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-brand-blue" />
                          <span className="font-bold text-brand-text-primary text-xs">
                            {ev.score} / {ev.maxScore || 20}
                          </span>
                          <span className="text-[11px] text-brand-text-secondary font-medium">
                            ({ev.percentage || Math.round((ev.score / (ev.maxScore || 20)) * 100)}%)
                          </span>
                        </div>
                      </td>

                      {/* Audit Status & Versions */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <Badge
                            variant={
                              isReEvaluated ? 'blue' :
                              isReEval ? 'warning' : 'success'
                            }
                            size="sm"
                          >
                            {ev.status.replace(/_/g, ' ')}
                          </Badge>

                          {versionsCount > 1 && (
                            <span className="text-[10px] font-bold text-brand-blue bg-blue-50 px-1.5 py-0.5 rounded block flex items-center gap-1">
                              <History className="w-2.5 h-2.5" /> v{versionsCount} (Resolved)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Reviewer */}
                      <td className="py-4 px-4 whitespace-nowrap text-brand-text-secondary text-xs">
                        {ev.reviewer || 'Rohan Mehta'}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Eye}
                            onClick={() => handleOpenDetail(ev)}
                            title="Audit Evaluation"
                            aria-label="Audit Evaluation"
                          />

                          {isReEval ? (
                            <Link to={`/facilitator/evaluations/re-evaluation/${ev.submissionId || ev.id}`}>
                              <Button
                                variant="primary"
                                size="sm"
                                className="font-bold text-xs"
                              >
                                Handle Re-Eval
                              </Button>
                            </Link>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDetail(ev)}
                              className="text-xs"
                            >
                              Inspect
                            </Button>
                          )}
                        </div>
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
          {filteredEvaluations.map((ev) => {
            const isReEval = ev.status === 'RE_EVALUATION_REQUESTED' || ev.reEvaluation?.status === 'REQUESTED';
            const isReEvaluated = ev.status === 'RE_EVALUATED';
            const versionsCount = ev.versions?.length || 1;

            return (
              <Card 
                key={ev.id}
                className="p-5 shadow-soft flex flex-col justify-between space-y-4 hover:border-brand-border-strong transition-all"
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={ev.studentAvatar} 
                        alt={ev.studentName}
                        className="w-9 h-9 rounded-full object-cover border border-brand-border"
                      />
                      <div>
                        <h4 
                          onClick={() => handleOpenDetail(ev)}
                          className="text-xs font-bold text-brand-text-primary hover:text-brand-blue cursor-pointer transition-colors"
                        >
                          {ev.studentName}
                        </h4>
                        <span className="text-[10px] text-brand-text-secondary block">
                          {ev.studentCohort}
                        </span>
                      </div>
                    </div>

                    <Badge
                      variant={
                        isReEvaluated ? 'blue' :
                        isReEval ? 'warning' : 'success'
                      }
                      size="sm"
                    >
                      {ev.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>

                  {/* Assignment Pill */}
                  <div className="p-2.5 bg-[#FBFBFA] rounded-xl border border-brand-border space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue block">
                      {ev.unitTitle ? ev.unitTitle.split(':')[0] : 'Unit'}
                    </span>
                    <p className="text-xs font-semibold text-brand-text-primary truncate">
                      {ev.assignmentTitle}
                    </p>
                  </div>

                  {/* Score & Versions */}
                  <div className="p-3 bg-white rounded-xl border border-brand-border flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary block">
                        Final Score
                      </span>
                      <span className="text-base font-black text-brand-blue flex items-center gap-1.5 mt-0.5">
                        <Award className="w-4 h-4" />
                        {ev.score} / {ev.maxScore || 20} pts ({ev.percentage || Math.round((ev.score / (ev.maxScore || 20)) * 100)}%)
                      </span>
                    </div>

                    {versionsCount > 1 && (
                      <span className="text-[10px] font-bold text-brand-blue bg-blue-50 px-2 py-1 rounded-lg border border-blue-200 flex items-center gap-1">
                        <History className="w-3 h-3" /> v{versionsCount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between text-[11px]">
                  <span className="text-brand-text-secondary">
                    {ev.evaluationDate}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDetail(ev)}
                      className="text-xs"
                    >
                      Inspect
                    </Button>

                    {isReEval && (
                      <Link to={`/facilitator/evaluations/re-evaluation/${ev.submissionId || ev.id}`}>
                        <Button
                          variant="primary"
                          size="sm"
                          className="font-bold text-xs"
                        >
                          Re-Eval
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Evaluation Detail Audit Modal */}
      <EvaluationDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setViewingEvaluation(null);
        }}
        evaluation={viewingEvaluation}
      />
    </div>
  );
};

export default FacilitatorEvaluations;
