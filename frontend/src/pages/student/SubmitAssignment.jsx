import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import studentApi from '../../api/studentApi';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { CardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  FileCheck2, 
  Sparkles, 
  AlertCircle,
  ExternalLink,
  Save,
  Circle
} from 'lucide-react';
import FigmaIcon from '../../components/ui/FigmaIcon';

export const SubmitAssignment = () => {
  const { assignmentId } = useParams();
  const { student } = useAuth();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftSavedMsg, setDraftSavedMsg] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Form State
  const [figmaUrl, setFigmaUrl] = useState('https://www.figma.com/proto/barabari-prototype-demo-ananya');
  const [artifactValues, setArtifactValues] = useState({
    prototypeOverview: 'Designed an interactive bottom-sheet checkout sheet with spring-based motion curve to guide users through item customization.',
    motionType: 'Smart Animate Ease-Out 300ms on Bottom Sheet & Card Expansion',
    interactiveState: 'Active tab pill toggle + validated primary CTA button state',
    figJamUrl: 'https://www.figma.com/board/sample-figjam-user-flow',
    personaDoc: 'Target Persona: High-intent mobile shopper needing frictionless payment.',
    interviewSurprises: 'Users expected back button on modal to save unsaved draft states automatically.',
    userFlowDoc: 'Core purchase funnel: Discovery -> Customization Drawer -> Confirmation.',
    journeyMapDoc: 'Emotional friction hotspot identified at checkout step 2.',
    recreatedScreenName: 'Linear Mobile App - Issue Details Screen',
    autoLayoutNotes: '100% nested auto-layout with min-width tags and 8px grid tokens.',
  });

  // Track requirement completion checklist
  const [completedReqMap, setCompletedReqMap] = useState({
    'req-4-1': true, // Prototype Navigation
    'req-4-2': true, // Visual Hierarchy
    'req-4-3': true, // Interactive State
    'req-4-4': false, // Micro-motion (incomplete)
    'req-4-5': false  // Publication Link (incomplete)
  });

  useEffect(() => {
    const fetchAssignmentAndDraft = async () => {
      try {
        setLoading(true);
        setError(null);
        const [asgRes, draftRes] = await Promise.all([
          studentApi.getAssignment(assignmentId),
          studentApi.getDraft(assignmentId)
        ]);

        const asgData = asgRes?.data;
        if (!asgData) {
          setError('Assignment not found');
        } else {
          setAssignment(asgData);
        }

        // Populate initial completion map from assignment requirements
        if (asgData?.requirements) {
          const initialMap = {};
          asgData.requirements.forEach((r) => {
            initialMap[r.requirementId] = r.completed ?? false;
          });
          setCompletedReqMap(initialMap);
        }

        // Restore draft if found in localStorage / API
        if (draftRes?.data) {
          if (draftRes.data.figmaUrl) setFigmaUrl(draftRes.data.figmaUrl);
          if (draftRes.data.artifactValues) setArtifactValues(draftRes.data.artifactValues);
          if (draftRes.data.completedReqMap) setCompletedReqMap(draftRes.data.completedReqMap);
          setDraftSavedMsg('Draft restored from previous session.');
          setTimeout(() => setDraftSavedMsg(null), 4000);
        }
      } catch (err) {
        console.error('Error fetching assignment or draft:', err);
        setError(err.message || 'Failed to load assignment workspace');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignmentAndDraft();
  }, [assignmentId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-white rounded-2xl animate-pulse" />
        <CardSkeleton />
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <Link
            to="/student/courses"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-text-secondary hover:text-brand-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back to Courses</span>
          </Link>
        </div>
        <EmptyState
          icon={AlertCircle}
          title="Assignment not found"
          description={error || "We couldn't locate the requested assignment to submit."}
          actionLabel="View All Courses"
          onAction={() => { window.location.href = '/student/courses'; }}
        />
      </div>
    );
  }

  // Assignment deliverables in natural order
  const requirements = assignment.requirements || [
    { requirementId: 'req-4-1', title: 'Prototype Navigation & Flow', description: 'Seamless forward and backward navigation with no dead-ends or broken interaction hot-spots.' },
    { requirementId: 'req-4-2', title: 'Meaningful Micro-motion', description: 'Motion conveys spatial continuity and hierarchy without gratuitous or distracting animation.' },
    { requirementId: 'req-4-3', title: 'Interactive State Decision', description: 'Genuine interactive states (active, focused, loaded, error) handled convincingly.' },
    { requirementId: 'req-4-4', title: 'Responsive Layout Stability', description: 'Frames retain structural integrity, auto-layout constraints, and typographic rhythm.' },
    { requirementId: 'req-4-5', title: 'Public Figma Presentation Link', description: 'Public link works instantly in presentation mode with clear starting node set.' }
  ];

  // Calculate completed / incomplete lists
  const completedList = requirements
    .filter((r) => completedReqMap[r.requirementId])
    .map((r) => r.title);

  const incompleteList = requirements
    .filter((r) => !completedReqMap[r.requirementId])
    .map((r) => r.title);

  const completedCount = completedList.length;
  const totalCount = requirements.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleToggleRequirement = (id) => {
    setCompletedReqMap((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleArtifactChange = (key, val) => {
    setArtifactValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      await studentApi.saveDraft(assignment.id, {
        figmaUrl,
        artifactValues,
        completedReqMap
      });
      setDraftSavedMsg('Draft saved successfully!');
      setTimeout(() => setDraftSavedMsg(null), 3500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const isValidFigmaUrl = figmaUrl.trim().length > 0 && figmaUrl.trim().startsWith('http');

  // Submit Handler (Supports PARTIAL SUBMISSION!)
  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        assignmentId: assignment.id,
        figmaUrl,
        artifacts: artifactValues,
        completedRequirements: completedList,
        incompleteRequirements: incompleteList,
        completionPercentage,
        submittedBy: student?.id || 'student-27-01'
      };

      const res = await studentApi.submitAssignment(payload);
      if (res?.data) {
        setSubmissionResult(res.data);
        setStep(5);
      } else {
        setSubmitError('Failed to record submission. Please retry.');
      }
    } catch (err) {
      console.error('Submission failed:', err);
      setSubmitError(err.response?.data?.message || err.message || 'Submission failed. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsMeta = [
    { number: 1, title: 'Requirements' },
    { number: 2, title: 'Figma Link' },
    { number: 3, title: 'UX Artifacts' },
    { number: 4, title: 'Review' },
    { number: 5, title: 'Outcome' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button and Save Draft */}
      <div className="flex items-center justify-between">
        <Link
          to={`/student/assignments/${assignment.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-text-secondary hover:text-brand-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Back to Assignment</span>
        </Link>

        {step < 5 && (
          <div className="flex items-center gap-2">
            {draftSavedMsg && (
              <span className="text-xs text-brand-success font-semibold flex items-center gap-1 bg-brand-success-bg px-2.5 py-1 rounded-lg animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>{draftSavedMsg}</span>
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              icon={Save}
              isLoading={isSavingDraft}
              onClick={handleSaveDraft}
            >
              Save Draft
            </Button>
          </div>
        )}
      </div>

      {/* Submission Workspace Header */}
      <div className="bg-white rounded-3xl border border-brand-border p-6 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-brand-border">
          <div>
            <span className="text-[11px] font-bold text-brand-blue uppercase tracking-wider bg-brand-blue-light px-2.5 py-1 rounded-full">
              Guided Submission Workspace
            </span>
            <h1 className="text-xl md:text-2xl font-black text-brand-text-primary mt-1.5">
              {assignment.title}
            </h1>
            <p className="text-xs text-brand-text-secondary mt-0.5">
              Phase: {assignment.phase} • Maximum Score: {assignment.maxScore || assignment.maxMarks || 20} Marks
            </p>
          </div>

          <div className="text-xs text-brand-text-secondary">
            Student: <strong className="text-brand-text-primary">{student?.name || 'Ananya Sharma'}</strong>
          </div>
        </div>

        {/* Stepper Header */}
        <div className="pt-6 grid grid-cols-5 gap-2 md:gap-4">
          {stepsMeta.map((s) => {
            const isCompleted = step > s.number || (step === 5 && s.number === 5);
            const isCurrent = step === s.number && step !== 5;
            return (
              <div key={s.number} className="flex flex-col items-center text-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-brand-success text-white shadow-xs'
                      : isCurrent
                      ? 'bg-brand-blue text-white ring-4 ring-brand-blue-light'
                      : 'bg-[#F4F4F0] text-brand-text-secondary'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : s.number}
                </div>
                <span
                  className={`text-[11px] font-semibold mt-1.5 hidden sm:block ${
                    isCurrent ? 'text-brand-blue' : isCompleted ? 'text-brand-text-primary' : 'text-brand-text-secondary'
                  }`}
                >
                  Step {s.number}: {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1: Requirements Checklist */}
      {step === 1 && (
        <div className="bg-white rounded-3xl border border-brand-border p-6 md:p-8 shadow-soft space-y-6 animate-in fade-in duration-150">
          <div className="space-y-2">
            <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">
              Step 1 of 5: Requirements
            </span>
            <h2 className="text-lg md:text-xl font-bold text-brand-text-primary">
              Assignment Deliverables
            </h2>
            <p className="text-xs md:text-sm text-brand-text-secondary leading-relaxed">
              Check off the deliverables you have completed. You can submit your work even if some items remain incomplete.
            </p>
          </div>

          {/* Requirements List with Clickable Completion Status */}
          <div className="space-y-3">
            {requirements.map((req, idx) => {
              const isDone = completedReqMap[req.requirementId];
              return (
                <div
                  key={req.requirementId || idx}
                  onClick={() => handleToggleRequirement(req.requirementId)}
                  className={`p-4 rounded-2xl border cursor-pointer select-none transition-all flex items-start justify-between gap-3 ${
                    isDone
                      ? 'bg-brand-success-bg/30 border-emerald-200/80 hover:bg-brand-success-bg/50'
                      : 'bg-[#FFFDF7] border-brand-border hover:border-brand-blue'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                        isDone
                          ? 'bg-brand-success text-white border-brand-success'
                          : 'border-brand-border bg-white text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-brand-text-primary">
                        {req.title}
                      </h4>
                      <p className="text-[11px] text-brand-text-secondary mt-0.5 leading-relaxed">
                        {req.description}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold shrink-0 ${
                      isDone ? 'text-brand-success' : 'text-brand-text-secondary'
                    }`}
                  >
                    {isDone ? '✓ Complete' : '○ Incomplete'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-brand-yellow-light/50 border border-amber-200/70 rounded-2xl flex items-start gap-3 text-xs text-brand-text-primary">
            <Sparkles className="w-4 h-4 text-[#946F00] shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-[#946F00]">Partial Submission Allowed: </strong>
              You do not need to finish every requirement to submit. Facilitators will evaluate your submission based on completed deliverables.
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-brand-border">
            <span className="text-xs text-brand-text-secondary">
              {completedCount} of {totalCount} requirements completed
            </span>
            <Button
              variant="primary"
              size="md"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => setStep(2)}
            >
              Continue to Figma Link
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Figma Design Link */}
      {step === 2 && (
        <div className="bg-white rounded-3xl border border-brand-border p-6 md:p-8 shadow-soft space-y-6 animate-in fade-in duration-150">
          <div className="space-y-2">
            <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">
              Step 2 of 5: Figma Design Link
            </span>
            <h2 className="text-lg md:text-xl font-bold text-brand-text-primary">
              Enter Public Figma Link
            </h2>
            <p className="text-xs md:text-sm text-brand-text-secondary leading-relaxed">
              Paste the public link to your Figma design file or interactive prototype presentation.
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-brand-text-primary">
              Public Figma Prototype or File URL <span className="text-brand-error">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <FigmaIcon className="w-4 h-4" />
              </div>
              <input
                type="url"
                value={figmaUrl}
                onChange={(e) => setFigmaUrl(e.target.value)}
                placeholder="https://www.figma.com/proto/... or https://www.figma.com/design/..."
                className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-brand-border bg-[#FAFAF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-text-primary font-mono transition-all"
              />
            </div>

            {isValidFigmaUrl ? (
              <p className="text-xs text-brand-success flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>Valid design URL provided.</span>
              </p>
            ) : (
              <p className="text-xs text-brand-error flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Please enter a valid link starting with http/https.</span>
              </p>
            )}
          </div>

          {isValidFigmaUrl && (
            <div className="p-3 bg-[#F7F7F4] rounded-xl flex items-center justify-between text-xs">
              <span className="text-brand-text-secondary truncate max-w-md font-mono text-[11px]">
                {figmaUrl}
              </span>
              <a
                href={figmaUrl}
                target="_blank"
                rel="noreferrer"
                className="text-brand-blue font-semibold inline-flex items-center gap-1 hover:underline ml-2"
              >
                <span>Test Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          <div className="pt-4 flex items-center justify-between border-t border-brand-border">
            <Button variant="outline" size="md" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={!isValidFigmaUrl}
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => setStep(3)}
            >
              Continue to UX Artifacts
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: UX Artifacts */}
      {step === 3 && (
        <div className="bg-white rounded-3xl border border-brand-border p-6 md:p-8 shadow-soft space-y-6 animate-in fade-in duration-150">
          <div className="space-y-2">
            <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">
              Step 3 of 5: UX Artifacts & Notes
            </span>
            <h2 className="text-lg md:text-xl font-bold text-brand-text-primary">
              Provide context and supporting artifacts
            </h2>
            <p className="text-xs md:text-sm text-brand-text-secondary leading-relaxed">
              Fill in as much detail as you have completed. Partial entries are welcomed.
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-brand-text-primary">
                Interactive Flow Rationale
              </label>
              <textarea
                rows={3}
                value={artifactValues.prototypeOverview || ''}
                onChange={(e) => handleArtifactChange('prototypeOverview', e.target.value)}
                placeholder="Describe the key transition and how motion aids user comprehension..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-brand-border bg-[#FAFAF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-text-primary transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-brand-text-primary">
                  Motion / Transition Technique
                </label>
                <input
                  type="text"
                  value={artifactValues.motionType || ''}
                  onChange={(e) => handleArtifactChange('motionType', e.target.value)}
                  placeholder="e.g., Smart Animate Ease-Out 300ms on Bottom Sheet"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-brand-border bg-[#FAFAF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-text-primary transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-brand-text-primary">
                  Interactive State Documented
                </label>
                <input
                  type="text"
                  value={artifactValues.interactiveState || ''}
                  onChange={(e) => handleArtifactChange('interactiveState', e.target.value)}
                  placeholder="e.g., Active tab toggle + validation state"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-brand-border bg-[#FAFAF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-text-primary transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-brand-text-primary">
                Optional FigJam / Research URL
              </label>
              <input
                type="url"
                value={artifactValues.figJamUrl || ''}
                onChange={(e) => handleArtifactChange('figJamUrl', e.target.value)}
                placeholder="https://www.figma.com/board/..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-brand-border bg-[#FAFAF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-text-primary transition-all"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-brand-border">
            <Button variant="outline" size="md" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => setStep(4)}
            >
              Review & Partial Submission
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Review Submission */}
      {step === 4 && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-brand-border p-6 md:p-8 shadow-soft space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">
                Step 4 of 5: Review
              </span>
              <h2 className="text-lg md:text-xl font-bold text-brand-text-primary">
                REVIEW SUBMISSION
              </h2>
              <p className="text-xs text-brand-text-secondary">
                Confirm your submission details before sending.
              </p>
            </div>

            {/* Submission Summary Details */}
            <div className="bg-[#F8F9F8] rounded-2xl border border-brand-border p-5 space-y-3 text-xs">
              <div className="flex justify-between border-b border-brand-border/60 pb-2">
                <span className="text-brand-text-secondary font-medium">Assignment:</span>
                <span className="font-bold text-brand-text-primary">{assignment.title}</span>
              </div>
              <div className="flex justify-between border-b border-brand-border/60 pb-2">
                <span className="text-brand-text-secondary font-medium">Student:</span>
                <span className="font-bold text-brand-text-primary">{student?.name || 'Ananya Sharma'}</span>
              </div>
              <div className="flex justify-between border-b border-brand-border/60 pb-2">
                <span className="text-brand-text-secondary font-medium">Figma:</span>
                <span className="font-mono text-brand-blue truncate max-w-xs">{figmaUrl}</span>
              </div>

              {/* UX Artifacts Summary */}
              <div className="border-b border-brand-border/60 pb-3 pt-1 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-text-secondary block">
                  UX Artifacts:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-brand-text-primary">
                    <span className="text-brand-success font-bold">✓</span>
                    <span>User Flow & Rationale ✓</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-brand-text-primary">
                    <span className="text-brand-success font-bold">✓</span>
                    <span>Motion Transition ✓</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-brand-text-primary">
                    <span className="text-brand-success font-bold">✓</span>
                    <span>Interactive State Decision ✓</span>
                  </div>
                  {artifactValues.figJamUrl && (
                    <div className="flex items-center gap-1.5 text-brand-text-primary">
                      <span className="text-brand-success font-bold">✓</span>
                      <span>Journey Map / FigJam ✓</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Requirements */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-text-secondary">
                    Requirements:
                  </span>
                  <span className="font-bold text-brand-text-primary">
                    Completion: {completedCount} / {totalCount} ({completionPercentage}%)
                  </span>
                </div>

                {/* Completed */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-success">
                    Completed:
                  </span>
                  {completedList.length > 0 ? (
                    completedList.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-brand-text-primary p-2 bg-white rounded-lg border border-brand-border/60">
                        <Check className="w-3.5 h-3.5 text-brand-success stroke-[3] shrink-0" />
                        <span>✓ {item}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-brand-text-secondary italic">None marked complete</p>
                  )}
                </div>

                {/* Incomplete */}
                {incompleteList.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
                      Incomplete:
                    </span>
                    {incompleteList.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-brand-text-secondary p-2 bg-white rounded-lg border border-brand-border/60">
                        <Circle className="w-3.5 h-3.5 text-brand-text-secondary shrink-0" />
                        <span>○ {item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Neutral Information Note */}
            <div className="p-4 bg-brand-yellow-light/40 border border-amber-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-brand-text-primary">
              <Sparkles className="w-4 h-4 text-[#946F00] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Your submission can be submitted with incomplete items. Incomplete requirements may affect the final evaluation.
              </p>
            </div>

            {submitError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed font-medium">{submitError}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 flex items-center justify-between border-t border-brand-border">
              <Button variant="outline" size="md" onClick={() => setStep(3)}>
                Back to Edit
              </Button>
              <Button
                variant="primary"
                size="md"
                disabled={!isValidFigmaUrl || isSubmitting}
                isLoading={isSubmitting}
                onClick={handleSubmit}
                icon={FileCheck2}
              >
                Submit Assignment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Outcome */}
      {step === 5 && submissionResult && (
        <div className="bg-white rounded-3xl border border-brand-border p-8 md:p-10 shadow-card text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-brand-success-bg text-brand-success flex items-center justify-center mx-auto shadow-sm">
            <FileCheck2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-black text-brand-text-primary">
              Submission Successful
            </h2>
            <p className="text-xs md:text-sm text-brand-text-secondary max-w-md mx-auto">
              Your assignment has been submitted.
            </p>
          </div>

          {/* Detailed Confirmation Box */}
          <div className="p-6 bg-[#F8F9F8] rounded-3xl border border-brand-border max-w-lg mx-auto space-y-3 text-xs text-left">
            <div className="flex justify-between border-b border-brand-border/60 pb-2.5">
              <span className="text-brand-text-secondary font-medium">Status:</span>
              <Badge variant="blue" size="sm" dot>
                Submitted
              </Badge>
            </div>

            <div className="flex justify-between border-b border-brand-border/60 pb-2.5">
              <span className="text-brand-text-secondary font-medium">Submitted:</span>
              <span className="font-semibold text-brand-text-primary">
                {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-brand-text-secondary font-medium">Completed:</span>
              <span className="font-bold text-brand-text-primary">
                {completedCount} / {totalCount} requirements
              </span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to={`/student/submissions/${submissionResult.id || 'sub-004'}`}>
              <Button variant="primary" size="md">
                View Submission
              </Button>
            </Link>
            <Link to="/student/dashboard">
              <Button variant="outline" size="md">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmitAssignment;
