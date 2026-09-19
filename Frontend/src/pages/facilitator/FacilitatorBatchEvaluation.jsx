import React, { useState, useMemo, useEffect, useRef } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import SubmissionReviewModal from '../../components/facilitator/SubmissionReviewModal';
import { batchApi } from '../../api/batchApi';
import { submissionApi } from '../../api/submissionApi';
import { assignmentApi } from '../../api/assignmentApi';
import { rubricApi } from '../../api/rubricApi';
import { 
  getFacilitatorAssignments, 
  getFacilitatorRubrics, 
  getFacilitatorSubmissions, 
  getFacilitatorBatches, 
  mockFacilitatorCourses 
} from '../../data/mockFacilitatorData';
import { 
  Sparkles, 
  Play, 
  Pause, 
  XSquare, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  History, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck,
  Check
} from 'lucide-react';

export const FacilitatorBatchEvaluation = () => {
  // Core datasets
  const courses = mockFacilitatorCourses;
  const currentCourse = courses[0];
  const [assignments, setAssignments] = useState(getFacilitatorAssignments);
  const [allRubrics, setAllRubrics] = useState(getFacilitatorRubrics);
  const [allSubmissions, setAllSubmissions] = useState(getFacilitatorSubmissions);
  const [batchHistory, setBatchHistory] = useState(getFacilitatorBatches);
  const [apiError, setApiError] = useState(null);

  // Sync with API adapter
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const [asgs, rubs, subs, bats] = await Promise.all([
          assignmentApi.getAssignments(),
          rubricApi.getRubrics(),
          submissionApi.getSubmissions(),
          batchApi.getBatches()
        ]);
        if (isMounted) {
          if (asgs) setAssignments(asgs);
          if (rubs) setAllRubrics(rubs);
          if (subs) setAllSubmissions(subs);
          if (bats) setBatchHistory(bats);
        }
      } catch (err) {
        if (isMounted) setApiError(err.message || 'Failed to sync batch data with server');
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  // Configuration Setup State
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(assignments[3]?.id || assignments[0]?.id || 'asg-4');
  const selectedAssignment = assignments.find(a => a.id === selectedAssignmentId) || assignments[0];
  const selectedRubric = allRubrics.find(r => r.assignmentId === selectedAssignmentId) || allRubrics[0];

  // Submissions selection state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState([]);
  const [expandedAiDetails, setExpandedAiDetails] = useState({});

  // Batch Processing Simulation State
  const [batchState, setBatchState] = useState('NOT_STARTED'); // 'NOT_STARTED', 'PROCESSING', 'PAUSED', 'REVIEW_REQUIRED', 'COMPLETED', 'CANCELLED'
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState(-1);
  const [batchItems, setBatchItems] = useState([]);

  // Modal State for Reviewing
  const [selectedSubmissionForReview, setSelectedSubmissionForReview] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Timer Ref for simulation
  const timerRef = useRef(null);

  // Filter submissions belonging to selected assignment
  const assignmentSubmissions = useMemo(() => {
    return allSubmissions.filter(s => s.assignmentId === selectedAssignmentId);
  }, [allSubmissions, selectedAssignmentId]);

  // Filtered by search
  const visibleSubmissions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return assignmentSubmissions;
    return assignmentSubmissions.filter(s => 
      s.studentName?.toLowerCase().includes(q) ||
      s.studentEmail?.toLowerCase().includes(q)
    );
  }, [assignmentSubmissions, searchQuery]);

  // Counts for selected assignment
  const pendingCount = assignmentSubmissions.filter(s => s.evaluationStatus === 'PENDING_REVIEW' || s.evaluationStatus === 'IN_REVIEW').length;
  const evaluatedCount = assignmentSubmissions.filter(s => s.evaluationStatus === 'EVALUATED').length;
  const returnedCount = assignmentSubmissions.filter(s => s.evaluationStatus === 'RETURNED').length;

  // Auto-select pending submissions on assignment change
  useEffect(() => {
    const defaultPendingIds = assignmentSubmissions
      .filter(s => s.evaluationStatus === 'PENDING_REVIEW' || s.evaluationStatus === 'IN_REVIEW')
      .map(s => s.id);
    setSelectedSubmissionIds(defaultPendingIds);
    setBatchState('NOT_STARTED');
    setBatchItems([]);
    setProcessingProgress(0);
    setCurrentProcessingIndex(-1);
  }, [selectedAssignmentId, assignmentSubmissions]);

  // Selection handlers
  const handleToggleSelect = (id) => {
    setSelectedSubmissionIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedSubmissionIds(visibleSubmissions.map(s => s.id));
  };

  const handleSelectNone = () => {
    setSelectedSubmissionIds([]);
  };

  // Generate mock AI pre-review findings for a submission
  const generateAiPreReview = (sub) => {
    const deliverables = sub.deliverables || [];
    const missing = deliverables.filter(d => !d.isSubmitted);
    const hasFigma = deliverables.some(d => d.type === 'figma' && d.isSubmitted);
    const hasRationale = deliverables.some(d => (d.type === 'file' || d.type === 'figjam') && d.isSubmitted);

    const evidenceDetected = [];
    const flags = [];
    const suggestedPrompts = [];

    if (hasFigma) {
      evidenceDetected.push('Public Figma prototype link verified with accessible permissions');
      evidenceDetected.push('Smart-animate transition curves and frame auto-layout detected');
    }
    if (hasRationale) {
      evidenceDetected.push('Interaction flow rationale document provided with motion notes');
    }
    if (sub.studentNotes) {
      evidenceDetected.push(`Student design notes parsed: "${sub.studentNotes.substring(0, 60)}..."`);
    }

    if (missing.length > 0) {
      flags.push(`Missing ${missing.length} required deliverable(s): ${missing.map(m => m.name).join(', ')}`);
    } else {
      evidenceDetected.push('100% required deliverables submitted and accessible');
    }

    if (sub.hasReEvaluationRequest) {
      flags.push('Active re-evaluation request attached to this record');
    }

    suggestedPrompts.push('Inspect motion pacing (200-300ms) on primary drawer interactions');
    suggestedPrompts.push('Verify interactive states for hover, pressed, and disabled buttons');

    return {
      completeness: missing.length === 0 ? 'COMPLETE' : 'INCOMPLETE',
      confidenceScore: missing.length === 0 ? '94% Evidence Match' : '72% Partial Evidence',
      evidenceDetected,
      flags,
      suggestedPrompts,
      rubricCoverage: `Mapped evidence to ${selectedRubric?.criteria?.length || 3} evaluation criteria.`
    };
  };

  // Start Batch Processing Simulation
  const handleStartBatch = () => {
    if (selectedSubmissionIds.length === 0) return;

    const selectedSubs = allSubmissions.filter(s => selectedSubmissionIds.includes(s.id));
    const initialItems = selectedSubs.map(s => ({
      submission: s,
      status: 'PROCESSING',
      aiPreReview: null
    }));

    setBatchItems(initialItems);
    setBatchState('PROCESSING');
    setProcessingProgress(10);
    setCurrentProcessingIndex(0);

    let currentIndex = 0;

    // Simulation loop
    timerRef.current = setInterval(() => {
      setBatchItems(prev => {
        const next = [...prev];
        if (currentIndex < next.length) {
          next[currentIndex] = {
            ...next[currentIndex],
            status: 'REVIEW_REQUIRED',
            aiPreReview: generateAiPreReview(next[currentIndex].submission)
          };
          currentIndex += 1;
          setCurrentProcessingIndex(currentIndex);
          setProcessingProgress(Math.round(((currentIndex) / next.length) * 100));
          return next;
        } else {
          clearInterval(timerRef.current);
          setBatchState('REVIEW_REQUIRED');

          // Persist completed batch run to history
          const newBatchRun = {
            id: `batch-${Date.now()}`,
            batchName: `${selectedAssignment.sprint} • AI Pre-Review Batch`,
            assignmentId: selectedAssignment.id,
            assignmentTitle: selectedAssignment.title,
            unitId: selectedAssignment.unitId,
            unitTitle: selectedAssignment.unitTitle,
            courseId: selectedAssignment.courseId,
            rubricId: selectedRubric?.id,
            rubricTitle: selectedRubric?.title,
            status: 'COMPLETED',
            totalSelected: selectedSubs.length,
            processedCount: selectedSubs.length,
            reviewRequiredCount: selectedSubs.length,
            completedCount: 0,
            flaggedCount: next.filter(i => i.aiPreReview?.flags?.length > 0).length,
            items: next
          };
          batchApi.createBatch(newBatchRun).then(() => {
            return batchApi.getBatches();
          }).then(refreshed => {
            if (refreshed) setBatchHistory(refreshed);
          }).catch(err => {
            console.warn('Batch creation sync notice:', err);
          });

          return next;
        }
      });
    }, 650);
  };

  // Pause Batch
  const handlePauseBatch = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setBatchState('PAUSED');
  };

  // Resume Batch
  const handleResumeBatch = () => {
    setBatchState('PROCESSING');
    let currentIndex = currentProcessingIndex >= 0 ? currentProcessingIndex : 0;

    timerRef.current = setInterval(() => {
      setBatchItems(prev => {
        const next = [...prev];
        if (currentIndex < next.length) {
          next[currentIndex] = {
            ...next[currentIndex],
            status: 'REVIEW_REQUIRED',
            aiPreReview: generateAiPreReview(next[currentIndex].submission)
          };
          currentIndex += 1;
          setCurrentProcessingIndex(currentIndex);
          setProcessingProgress(Math.round(((currentIndex) / next.length) * 100));
          return next;
        } else {
          clearInterval(timerRef.current);
          setBatchState('REVIEW_REQUIRED');
          return next;
        }
      });
    }, 650);
  };

  // Cancel Batch
  const handleCancelBatch = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setBatchState('CANCELLED');
  };

  // Reset to Configuration
  const handleResetBatch = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setBatchState('NOT_STARTED');
    setBatchItems([]);
    setProcessingProgress(0);
    setCurrentProcessingIndex(-1);
  };

  // Open full submission review modal
  const handleOpenSubmissionReview = (submission) => {
    setSelectedSubmissionForReview(submission);
    setIsReviewModalOpen(true);
  };

  // Callback when submission is evaluated or updated in modal
  const handleSubmissionUpdated = (updated) => {
    setAllSubmissions(prev => prev.map(s => s.id === updated.id ? updated : s));
    setBatchItems(prev => prev.map(i => {
      if (i.submission.id === updated.id) {
        return {
          ...i,
          submission: updated,
          status: updated.evaluationStatus === 'EVALUATED' ? 'COMPLETED' : 'REVIEW_REQUIRED'
        };
      }
      return i;
    }));
    setSelectedSubmissionForReview(updated);
  };

  const toggleAiDetails = (id) => {
    setExpandedAiDetails(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="blue" size="sm">
              AI-ASSISTED PRE-REVIEW
            </Badge>
            <span className="text-xs text-brand-text-secondary">
              Cohort Grading Accelerators • {currentCourse?.title}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-brand-text-primary tracking-tight">
            Batch Evaluation Assistant
          </h1>
          <p className="text-xs md:text-sm text-brand-text-secondary mt-1 max-w-xl leading-relaxed">
            Run automated pre-review evidence detection, deliverable completeness checks, and rubric coverage notes across submissions. Facilitators retain 100% final grading authority.
          </p>
        </div>

        {/* Batch Status Pill */}
        {batchState !== 'NOT_STARTED' && (
          <div className="flex items-center gap-2 shrink-0">
            <Badge
              variant={
                batchState === 'PROCESSING' ? 'warning' :
                batchState === 'REVIEW_REQUIRED' ? 'blue' :
                batchState === 'PAUSED' ? 'neutral' : 'success'
              }
              size="md"
              className="font-bold text-xs"
            >
              Batch: {batchState.replace('_', ' ')}
            </Badge>
          </div>
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

      {/* AI Advisory Boundary Notice (Requirement 13) */}
      <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/90 flex items-start gap-3.5">
        <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h4 className="font-bold text-amber-950">
            Human Evaluator Decision Authority & Advisory Boundary
          </h4>
          <p className="text-amber-900 leading-relaxed">
            The Batch Evaluation Assistant scans submitted Figma links and files for objective deliverable presence and rubric alignment prompts. <strong>AI never autonomously assigns marks, overrides mentor judgment, or publishes final scores.</strong> Every grade must be manually confirmed and authorized by the facilitator.
          </p>
        </div>
      </div>

      {/* Step 1: Batch Configuration Card */}
      <Card className="p-5 md:p-6 shadow-soft space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border pb-4">
          <div>
            <h2 className="text-sm md:text-base font-bold text-brand-text-primary">
              1. Select Curriculum Module & Rubric
            </h2>
            <p className="text-xs text-brand-text-secondary mt-0.5">
              Choose the target assignment to configure the evaluation batch.
            </p>
          </div>

          {/* Assignment Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-text-secondary">Assignment:</span>
            <select
              value={selectedAssignmentId}
              onChange={(e) => setSelectedAssignmentId(e.target.value)}
              disabled={batchState === 'PROCESSING'}
              aria-label="Target Assignment"
              className="px-3 py-1.5 rounded-xl border border-brand-border bg-[#FBFBFA] text-xs font-semibold text-brand-text-primary focus:outline-none focus:border-brand-blue disabled:opacity-50"
            >
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.sprint}: {a.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Counts Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-3 bg-[#FBFBFA] rounded-xl border border-brand-border">
            <span className="text-[10px] uppercase font-bold text-brand-text-secondary block">
              Total Submissions
            </span>
            <span className="text-lg font-black text-brand-text-primary mt-0.5 block">
              {assignmentSubmissions.length}
            </span>
          </div>

          <div className="p-3 bg-[#FBFBFA] rounded-xl border border-brand-border">
            <span className="text-[10px] uppercase font-bold text-brand-warning block">
              Pending / In Review
            </span>
            <span className="text-lg font-black text-brand-warning mt-0.5 block">
              {pendingCount}
            </span>
          </div>

          <div className="p-3 bg-[#FBFBFA] rounded-xl border border-brand-border">
            <span className="text-[10px] uppercase font-bold text-emerald-600 block">
              Already Finalized
            </span>
            <span className="text-lg font-black text-emerald-600 mt-0.5 block">
              {evaluatedCount}
            </span>
          </div>

          <div className="p-3 bg-[#FBFBFA] rounded-xl border border-brand-border">
            <span className="text-[10px] uppercase font-bold text-amber-600 block">
              Returned / Re-eval
            </span>
            <span className="text-lg font-black text-amber-600 mt-0.5 block">
              {returnedCount}
            </span>
          </div>

          <div className="p-3 bg-[#FBFBFA] rounded-xl border border-brand-border">
            <span className="text-[10px] uppercase font-bold text-brand-blue block">
              Linked Rubric
            </span>
            <span className="text-xs font-bold text-brand-text-primary mt-1 block truncate" title={selectedRubric?.title}>
              {selectedRubric?.title || 'Default Rubric'}
            </span>
          </div>
        </div>

        {/* Submissions Checklist & Selection Tools */}
        {batchState === 'NOT_STARTED' && (
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary">
                  Select Submissions for Batch Pre-Review ({selectedSubmissionIds.length} of {visibleSubmissions.length} chosen)
                </h3>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                  Select All
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSelectNone}>
                  Clear
                </Button>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-brand-text-secondary absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search students..."
                    className="pl-8 pr-3 py-1 rounded-xl border border-brand-border bg-white text-xs font-medium focus:outline-none focus:border-brand-blue"
                  />
                </div>
              </div>
            </div>

            {/* Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {visibleSubmissions.map((sub) => {
                const isSelected = selectedSubmissionIds.includes(sub.id);
                const deliverables = sub.deliverables || [];
                const missingCount = deliverables.filter(d => !d.isSubmitted).length;

                return (
                  <div
                    key={sub.id}
                    onClick={() => handleToggleSelect(sub.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                      isSelected
                        ? 'bg-blue-50/60 border-brand-blue shadow-2xs'
                        : 'bg-white border-brand-border hover:border-brand-border-strong'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // Handled by parent div
                      className="mt-1 rounded border-brand-border text-brand-blue focus:ring-brand-blue"
                    />

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-brand-text-primary truncate">
                          {sub.studentName}
                        </h4>
                        <Badge
                          variant={
                            sub.evaluationStatus === 'EVALUATED' ? 'success' :
                            sub.evaluationStatus === 'IN_REVIEW' ? 'blue' : 'warning'
                          }
                          size="sm"
                          className="text-[9px]"
                        >
                          {sub.evaluationStatus.replace('_', ' ')}
                        </Badge>
                      </div>

                      <span className="text-[10px] text-brand-text-secondary block">
                        Submitted: {sub.submittedAtFormatted.split(',')[0]}
                      </span>

                      <div className="flex items-center gap-1.5 pt-1 text-[10px]">
                        {missingCount > 0 ? (
                          <span className="text-red-600 font-bold flex items-center gap-0.5">
                            <AlertCircle className="w-3 h-3" /> {missingCount} missing artifact
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> All artifacts present
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Start CTA */}
            <div className="pt-3 flex items-center justify-between border-t border-brand-border">
              <span className="text-xs text-brand-text-secondary font-medium">
                {selectedSubmissionIds.length === 0
                  ? 'Please select at least one submission to begin batch pre-review.'
                  : `${selectedSubmissionIds.length} submission(s) ready for AI advisory scan.`}
              </span>

              <Button
                variant="primary"
                size="md"
                icon={Sparkles}
                iconPosition="left"
                disabled={selectedSubmissionIds.length === 0}
                onClick={handleStartBatch}
                className="font-bold shadow-sm"
              >
                Start Batch Pre-Review ({selectedSubmissionIds.length})
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Step 2: Active Batch Queue & Processing Controls (Requirement 3 & 5) */}
      {batchState !== 'NOT_STARTED' && (
        <Card className="p-5 md:p-6 shadow-soft space-y-5 border-brand-blue/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-blue animate-pulse" />
                <h2 className="text-sm md:text-base font-bold text-brand-text-primary">
                  2. Batch Execution & AI Advisory Pre-Review Queue
                </h2>
              </div>
              <p className="text-xs text-brand-text-secondary mt-0.5">
                Scanning evidence, checking deliverables completeness, and mapping rubric coverage.
              </p>
            </div>

            {/* Batch Controls */}
            <div className="flex items-center gap-2">
              {batchState === 'PROCESSING' && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={Pause}
                  iconPosition="left"
                  onClick={handlePauseBatch}
                >
                  Pause
                </Button>
              )}

              {batchState === 'PAUSED' && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={Play}
                  iconPosition="left"
                  onClick={handleResumeBatch}
                >
                  Resume
                </Button>
              )}

              {batchState !== 'COMPLETED' && batchState !== 'REVIEW_REQUIRED' && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={XSquare}
                  iconPosition="left"
                  onClick={handleCancelBatch}
                  className="text-red-600 hover:text-red-800"
                >
                  Cancel Batch
                </Button>
              )}

              {(batchState === 'REVIEW_REQUIRED' || batchState === 'COMPLETED' || batchState === 'CANCELLED') && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={RotateCcw}
                  iconPosition="left"
                  onClick={handleResetBatch}
                >
                  Configure New Batch
                </Button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-brand-text-primary">
              <span>
                {batchState === 'PROCESSING' 
                  ? `Analyzing submission ${currentProcessingIndex + 1} of ${batchItems.length}...` 
                  : batchState === 'REVIEW_REQUIRED'
                  ? 'All submissions scanned. Facilitator review required.'
                  : `Batch Status: ${batchState}`}
              </span>
              <span>{processingProgress}%</span>
            </div>
            <div className="w-full h-2.5 bg-[#F0F0EB] rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-blue rounded-full transition-all duration-300"
                style={{ width: `${processingProgress}%` }}
              />
            </div>
          </div>

          {/* Batch Items Queue Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-brand-border bg-[#FCFCFA] text-[11px] font-bold text-brand-text-secondary uppercase tracking-wider">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Deliverables</th>
                  <th className="py-3 px-4">Batch Status</th>
                  <th className="py-3 px-4">AI Advisory Insights</th>
                  <th className="py-3 px-4 text-right">Facilitator Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {batchItems.map((item, idx) => {
                  const sub = item.submission;
                  const ai = item.aiPreReview;
                  const isExpanded = !!expandedAiDetails[sub.id];

                  return (
                    <React.Fragment key={sub.id || idx}>
                      <tr className="hover:bg-[#FCFCFA] transition-colors">
                        {/* Student */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <img 
                              src={sub.studentAvatar} 
                              alt={sub.studentName} 
                              className="w-7 h-7 rounded-full object-cover border border-brand-border"
                            />
                            <div>
                              <strong className="text-xs text-brand-text-primary block leading-tight">
                                {sub.studentName}
                              </strong>
                              <span className="text-[10px] text-brand-text-secondary">
                                {sub.studentEmail}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Deliverables */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-semibold text-brand-text-primary block">
                            {sub.deliverables?.filter(d => d.isSubmitted).length}/{sub.deliverables?.length} items
                          </span>
                          {sub.deliverables?.some(d => !d.isSubmitted) && (
                            <span className="text-[9px] font-bold text-red-600 block">
                              Missing artifact
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <Badge
                            variant={
                              item.status === 'COMPLETED' ? 'success' :
                              item.status === 'REVIEW_REQUIRED' ? 'blue' :
                              item.status === 'PROCESSING' ? 'warning' : 'neutral'
                            }
                            size="sm"
                          >
                            {item.status.replace('_', ' ')}
                          </Badge>
                        </td>

                        {/* AI Advisory Summary */}
                        <td className="py-3.5 px-4">
                          {ai ? (
                            <div className="space-y-1 max-w-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                  {ai.confidenceScore}
                                </span>
                                {ai.flags.length > 0 && (
                                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md">
                                    {ai.flags.length} flag(s)
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => toggleAiDetails(sub.id)}
                                className="text-[11px] font-bold text-brand-blue hover:underline flex items-center gap-1 mt-0.5"
                              >
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                {isExpanded ? 'Hide AI Details' : 'View AI Pre-Review Details'}
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-brand-text-secondary italic">
                              Analyzing evidence...
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <Button
                            variant={sub.evaluationStatus === 'EVALUATED' ? 'outline' : 'primary'}
                            size="sm"
                            onClick={() => handleOpenSubmissionReview(sub)}
                            className="font-bold text-xs"
                          >
                            {sub.evaluationStatus === 'EVALUATED' ? 'Inspect Grade' : 'Review & Enter Marks'}
                          </Button>
                        </td>
                      </tr>

                      {/* Expanded AI Details Accordion Row */}
                      {isExpanded && ai && (
                        <tr className="bg-[#F8F9FA]">
                          <td colSpan={5} className="p-4 space-y-3 border-b border-brand-border text-xs">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {/* Evidence Detected */}
                              <div className="p-3 bg-white rounded-xl border border-brand-border space-y-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Evidence Detected
                                </span>
                                <ul className="space-y-1 text-[11px] text-brand-text-primary">
                                  {ai.evidenceDetected.map((ev, eIdx) => (
                                    <li key={eIdx} className="leading-snug">• {ev}</li>
                                  ))}
                                </ul>
                              </div>

                              {/* Flags / Missing items */}
                              <div className="p-3 bg-white rounded-xl border border-brand-border space-y-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block flex items-center gap-1">
                                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Pre-Review Flags
                                </span>
                                {ai.flags.length > 0 ? (
                                  <ul className="space-y-1 text-[11px] text-amber-950 font-medium">
                                    {ai.flags.map((fl, fIdx) => (
                                      <li key={fIdx} className="leading-snug">• {fl}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-[11px] text-brand-text-secondary">Zero blocking flags detected.</p>
                                )}
                              </div>

                              {/* Suggested Evaluator Prompts */}
                              <div className="p-3 bg-white rounded-xl border border-brand-border space-y-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue block flex items-center gap-1">
                                  <Sparkles className="w-3.5 h-3.5" /> Suggested Prompts for Mentor
                                </span>
                                <ul className="space-y-1 text-[11px] text-brand-text-primary">
                                  {ai.suggestedPrompts.map((pr, pIdx) => (
                                    <li key={pIdx} className="leading-snug italic">• "{pr}"</li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-brand-text-secondary pt-1">
                              <span><strong>Rubric Coverage:</strong> {ai.rubricCoverage}</span>
                              <span className="text-amber-700 font-bold">Reminder: AI suggestions do not assign marks.</span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Step 3: Recent Batch Runs History (Requirement 9) */}
      <Card className="p-5 md:p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-brand-border pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-brand-text-secondary" />
            <h3 className="text-sm font-bold text-brand-text-primary">
              Recent Batch Review Runs
            </h3>
          </div>
          <span className="text-xs text-brand-text-secondary">
            {batchHistory.length} recorded run(s)
          </span>
        </div>

        <div className="divide-y divide-brand-border/60 text-xs">
          {batchHistory.map((b) => (
            <div 
              key={b.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-brand-text-primary text-xs">
                    {b.batchName}
                  </span>
                  <Badge variant="success" size="sm" className="text-[9px]">
                    {b.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-brand-text-secondary">
                  <span>{b.assignmentTitle}</span>
                  <span>•</span>
                  <span>{b.createdAt}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[11px]">
                <div className="text-right">
                  <span className="font-bold text-brand-text-primary block">
                    {b.totalSelected} submissions scanned
                  </span>
                  <span className="text-brand-text-secondary block">
                    {b.flaggedCount || 0} flagged for review
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Integrated Submission Review Modal */}
      <SubmissionReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedSubmissionForReview(null);
        }}
        submission={selectedSubmissionForReview}
        onSubmissionUpdated={handleSubmissionUpdated}
      />
    </div>
  );
};

export default FacilitatorBatchEvaluation;
