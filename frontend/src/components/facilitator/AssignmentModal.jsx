import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { 
  X, 
  Plus, 
  Trash2, 
  Calendar, 
  Award, 
  CheckCircle2, 
  BookOpen, 
  Layers,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { mockFacilitatorCourses } from '../../data/mockFacilitatorData';

export const AssignmentModal = ({
  isOpen,
  onClose,
  onSave,
  assignment = null // If provided, we are editing; otherwise creating
}) => {
  const isEditing = !!assignment;

  // Form State
  const [courseId, setCourseId] = useState('course-uiux-101');
  const [unitId, setUnitId] = useState('unit-4');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [phase, setPhase] = useState('Phase 2 • Interactive Prototyping');
  const [sprint, setSprint] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxScore, setMaxScore] = useState(20);
  const [status, setStatus] = useState('DRAFT');
  const [submissionInstructions, setSubmissionInstructions] = useState('');
  const [figmaGuidance, setFigmaGuidance] = useState('');
  const [requirements, setRequirements] = useState([
    { id: 'req-1', title: '', description: '', required: true }
  ]);
  const [errors, setErrors] = useState({});

  // Populate data if editing
  useEffect(() => {
    if (assignment) {
      setCourseId(assignment.courseId || 'course-uiux-101');
      setUnitId(assignment.unitId || 'unit-4');
      setTitle(assignment.title || '');
      setDescription(assignment.description || '');
      setPhase(assignment.phase || 'Phase 2 • Interactive Prototyping');
      setSprint(assignment.sprint || '');
      setDueDate(assignment.dueDate || '');
      setMaxScore(assignment.maxScore || 20);
      setStatus(assignment.status || 'DRAFT');
      setSubmissionInstructions(assignment.submissionInstructions || '');
      setFigmaGuidance(assignment.figmaGuidance || '');
      setRequirements(
        assignment.requirements && assignment.requirements.length > 0
          ? assignment.requirements
          : [{ id: 'req-1', title: '', description: '', required: true }]
      );
    } else {
      // Defaults for new assignment
      setCourseId('course-uiux-101');
      setUnitId('unit-4');
      setTitle('');
      setDescription('');
      setPhase('Phase 2 • Interactive Prototyping');
      setSprint(`Sprint 07`);
      setDueDate('2026-10-30');
      setMaxScore(20);
      setStatus('DRAFT');
      setSubmissionInstructions('Provide view or edit access to your Figma project file with active starting flow.');
      setFigmaGuidance('Starting frame must be titled [START-FLOW]. Zero detached components allowed.');
      setRequirements([
        { id: `req-${Date.now()}-1`, title: 'Primary Flow Screens Frame', description: 'At least 4 screens organized into a clean Auto-Layout flow.', required: true },
        { id: `req-${Date.now()}-2`, title: 'Interactive Prototype Connections', description: 'Smart-animate easing applied between interactive states.', required: true }
      ]);
    }
    setErrors({});
  }, [assignment, isOpen]);

  if (!isOpen) return null;

  const currentCourse = mockFacilitatorCourses.find(c => c.id === courseId) || mockFacilitatorCourses[0];
  const units = currentCourse.units || [];

  // Requirements handlers
  const handleAddRequirement = () => {
    setRequirements([
      ...requirements,
      { id: `req-${Date.now()}`, title: '', description: '', required: true }
    ]);
  };

  const handleUpdateRequirement = (index, field, value) => {
    const updated = [...requirements];
    updated[index] = { ...updated[index], [field]: value };
    setRequirements(updated);
  };

  const handleRemoveRequirement = (index) => {
    if (requirements.length <= 1) return;
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Assignment title is required.';
    if (!description.trim()) newErrors.description = 'Assignment description is required.';
    if (!dueDate) newErrors.dueDate = 'Due date is required.';
    if (!maxScore || Number(maxScore) <= 0) newErrors.maxScore = 'Max marks must be greater than 0.';
    
    // Check if at least one requirement has a title
    const validReqs = requirements.filter(r => r.title.trim());
    if (validReqs.length === 0) {
      newErrors.requirements = 'At least one deliverable requirement is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const selectedUnit = units.find(u => u.id === unitId) || units[0];

    const payload = {
      courseId,
      courseTitle: currentCourse.title,
      unitId,
      unitTitle: selectedUnit.title,
      title: title.trim(),
      description: description.trim(),
      phase: phase.trim(),
      sprint: sprint.trim() || 'Sprint Sprint',
      dueDate,
      maxScore: Number(maxScore),
      status,
      submissionInstructions: submissionInstructions.trim(),
      figmaGuidance: figmaGuidance.trim(),
      requirements: requirements.filter(r => r.title.trim())
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-brand-border shadow-2xl w-full max-w-3xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-brand-border flex items-center justify-between bg-[#FCFCFA]">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue bg-brand-blue-light px-2.5 py-0.5 rounded-full">
                {isEditing ? 'EDIT ASSIGNMENT' : 'NEW ASSIGNMENT'}
              </span>
              <span className="text-xs text-brand-text-secondary">
                Course: {currentCourse.title}
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-brand-text-primary tracking-tight">
              {isEditing ? `Edit Assignment: ${assignment?.title}` : 'Create Studio Assignment'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-brand-text-secondary hover:text-brand-text-primary hover:bg-[#F0F0EB] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Section 1: Course Hierarchy & Unit Mapping */}
          <div className="space-y-3 pb-4 border-b border-brand-border/60">
            <div className="flex items-center gap-2 text-brand-blue font-bold uppercase tracking-wider text-[11px]">
              <Layers className="w-3.5 h-3.5" />
              <span>Course Hierarchy (Course → Unit)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-brand-text-primary block">
                  Course
                </label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-brand-border bg-[#FBFBFA] text-brand-text-primary focus:outline-none focus:border-brand-blue font-medium"
                >
                  {mockFacilitatorCourses.map(c => (
                    <option key={c.id} value={c.id}>{c.title} ({c.cohort})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-brand-text-primary block">
                  Curriculum Unit
                </label>
                <select
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-brand-border bg-[#FBFBFA] text-brand-text-primary focus:outline-none focus:border-brand-blue font-medium"
                >
                  {units.map(u => (
                    <option key={u.id} value={u.id}>Unit 0{u.unitNumber}: {u.title}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Assignment Specifications */}
          <div className="space-y-4 pb-4 border-b border-brand-border/60">
            <div className="flex items-center gap-2 text-brand-blue font-bold uppercase tracking-wider text-[11px]">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Assignment Specifications</span>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-brand-text-primary block">
                Assignment Title <span className="text-brand-error">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. One Clickable Prototype with Motion"
                className={`w-full px-3.5 py-2.5 rounded-xl border ${errors.title ? 'border-brand-error bg-red-50/20' : 'border-brand-border bg-[#FBFBFA]'} text-brand-text-primary focus:outline-none focus:border-brand-blue font-medium`}
              />
              {errors.title && (
                <p className="text-[11px] text-brand-error flex items-center gap-1 mt-0.5">
                  <AlertCircle className="w-3 h-3" /> {errors.title}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-brand-text-primary block">
                Description & Brief <span className="text-brand-error">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Detailed explanation of the student learning outcomes, user scenario, and studio constraints."
                className={`w-full px-3.5 py-2.5 rounded-xl border ${errors.description ? 'border-brand-error bg-red-50/20' : 'border-brand-border bg-[#FBFBFA]'} text-brand-text-primary focus:outline-none focus:border-brand-blue font-normal leading-relaxed`}
              />
              {errors.description && (
                <p className="text-[11px] text-brand-error flex items-center gap-1 mt-0.5">
                  <AlertCircle className="w-3 h-3" /> {errors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-brand-text-primary block flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-brand-text-secondary" />
                  Due Date <span className="text-brand-error">*</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border ${errors.dueDate ? 'border-brand-error bg-red-50/20' : 'border-brand-border bg-[#FBFBFA]'} text-brand-text-primary focus:outline-none focus:border-brand-blue font-medium`}
                />
                {errors.dueDate && (
                  <p className="text-[11px] text-brand-error mt-0.5">{errors.dueDate}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-brand-text-primary block flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-brand-text-secondary" />
                  Max Marks <span className="text-brand-error">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={maxScore}
                  onChange={(e) => setMaxScore(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border ${errors.maxScore ? 'border-brand-error' : 'border-brand-border bg-[#FBFBFA]'} text-brand-text-primary focus:outline-none focus:border-brand-blue font-medium`}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-brand-text-primary block">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-brand-border bg-[#FBFBFA] text-brand-text-primary focus:outline-none focus:border-brand-blue font-medium"
                >
                  <option value="DRAFT">Draft (Hidden from students)</option>
                  <option value="PUBLISHED">Published (Open for submission)</option>
                  <option value="CLOSED">Closed (Archived)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Deliverables & Requirements */}
          <div className="space-y-3 pb-4 border-b border-brand-border/60">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-brand-blue font-bold uppercase tracking-wider text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Student Deliverables / Requirements</span>
                </div>
                <p className="text-[11px] text-brand-text-secondary mt-0.5">
                  Specify what artifacts the student must produce. (Natural order without rubric weight sorting).
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddRequirement}
                icon={Plus}
              >
                Add Deliverable
              </Button>
            </div>

            {errors.requirements && (
              <p className="text-[11px] text-brand-error flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.requirements}
              </p>
            )}

            <div className="space-y-2.5">
              {requirements.map((req, idx) => (
                <div
                  key={req.id || idx}
                  className="p-3 bg-[#FBFBFA] rounded-2xl border border-brand-border/80 flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-brand-blue-light text-brand-blue font-bold flex items-center justify-center shrink-0 mt-1 text-[11px]">
                    {idx + 1}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <input
                        type="text"
                        value={req.title}
                        onChange={(e) => handleUpdateRequirement(idx, 'title', e.target.value)}
                        placeholder="Deliverable Title (e.g. Interactive Prototype Flow)"
                        className="flex-1 px-3 py-1.5 rounded-lg border border-brand-border bg-white text-brand-text-primary focus:outline-none focus:border-brand-blue font-medium"
                      />

                      <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] text-brand-text-secondary shrink-0">
                        <input
                          type="checkbox"
                          checked={req.required}
                          onChange={(e) => handleUpdateRequirement(idx, 'required', e.target.checked)}
                          className="rounded text-brand-blue focus:ring-brand-blue"
                        />
                        <span>Mandatory item</span>
                      </label>
                    </div>

                    <textarea
                      value={req.description}
                      onChange={(e) => handleUpdateRequirement(idx, 'description', e.target.value)}
                      rows={1}
                      placeholder="Guidance on deliverables (e.g. 5 connected screens with transitions)"
                      className="w-full px-3 py-1.5 rounded-lg border border-brand-border bg-white text-brand-text-primary focus:outline-none focus:border-brand-blue text-[11px]"
                    />
                  </div>

                  {requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(idx)}
                      className="p-1.5 text-brand-text-secondary hover:text-brand-error rounded-lg hover:bg-red-50 transition-colors"
                      title="Remove deliverable"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Submission Instructions & Figma Guidance */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-brand-blue font-bold uppercase tracking-wider text-[11px]">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Submission Guidelines & Tool Guidance</span>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-brand-text-primary block">
                General Submission Instructions
              </label>
              <textarea
                value={submissionInstructions}
                onChange={(e) => setSubmissionInstructions(e.target.value)}
                rows={2}
                placeholder="e.g. Provide view or edit access to your Figma project file with active starting flow."
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FBFBFA] text-brand-text-primary focus:outline-none focus:border-brand-blue"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-brand-text-primary block">
                Optional Figma / FigJam Specific Guidance
              </label>
              <input
                type="text"
                value={figmaGuidance}
                onChange={(e) => setFigmaGuidance(e.target.value)}
                placeholder="e.g. Starting frame must be titled [START-PROTOTYPE]. Auto-Layout required."
                className="w-full px-3.5 py-2 rounded-xl border border-brand-border bg-[#FBFBFA] text-brand-text-primary focus:outline-none focus:border-brand-blue"
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-brand-border flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={onClose}
            >
              Cancel
            </Button>

            <div className="flex items-center gap-3">
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="font-bold shadow-sm"
              >
                {isEditing ? 'Save Changes' : 'Create Assignment'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentModal;
