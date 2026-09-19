import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { 
  X, 
  Plus, 
  Trash2, 
  Award, 
  CheckCircle2, 
  BookOpen, 
  Layers, 
  AlertCircle, 
  ArrowUp, 
  ArrowDown,
  Sliders,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { assignmentApi } from '../../api/assignmentApi';
import { 
  mockFacilitatorCourses, 
  getFacilitatorAssignments 
} from '../../data/mockFacilitatorData';

export const RubricModal = ({
  isOpen,
  onClose,
  onSave,
  rubric = null
}) => {
  const isEditing = !!rubric;

  // Form State
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('course-uiux-101');
  const [unitId, setUnitId] = useState('unit-4');
  const [assignmentId, setAssignmentId] = useState('asg-4');
  const [description, setDescription] = useState('');
  const [totalMarks, setTotalMarks] = useState(20);
  const [status, setStatus] = useState('PUBLISHED');
  const [expandedCriteria, setExpandedCriteria] = useState({});
  const [criteria, setCriteria] = useState([
    {
      id: 'crit-1',
      name: '',
      description: '',
      marks: 5,
      weight: '25%',
      descriptors: [
        { level: 'Exemplary', scoreRange: '5', text: '' },
        { level: 'Proficient', scoreRange: '3-4', text: '' },
        { level: 'Developing', scoreRange: '1-2', text: '' }
      ]
    }
  ]);
  const [errors, setErrors] = useState({});
  const [assignments, setAssignments] = useState(getFacilitatorAssignments);

  useEffect(() => {
    let isMounted = true;
    assignmentApi.getAssignments().then(data => {
      if (isMounted && data) setAssignments(data);
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const currentCourse = mockFacilitatorCourses.find(c => c.id === courseId) || mockFacilitatorCourses[0];
  const units = currentCourse.units || [];

  // Filter assignments matching selected course and unit
  const eligibleAssignments = assignments.filter(a => a.courseId === courseId && a.unitId === unitId);

  useEffect(() => {
    if (rubric) {
      setTitle(rubric.title || '');
      setCourseId(rubric.courseId || 'course-uiux-101');
      setUnitId(rubric.unitId || 'unit-4');
      setAssignmentId(rubric.assignmentId || 'asg-4');
      setDescription(rubric.description || '');
      setTotalMarks(rubric.totalMarks || 20);
      setStatus(rubric.status || 'DRAFT');
      setCriteria(
        rubric.criteria && rubric.criteria.length > 0
          ? rubric.criteria
          : [
              {
                id: 'crit-1',
                name: '',
                description: '',
                marks: 5,
                weight: '25%',
                descriptors: [
                  { level: 'Exemplary', scoreRange: '5', text: '' },
                  { level: 'Proficient', scoreRange: '3-4', text: '' },
                  { level: 'Developing', scoreRange: '1-2', text: '' }
                ]
              }
            ]
      );
    } else {
      setTitle('');
      setCourseId('course-uiux-101');
      setUnitId('unit-4');
      setAssignmentId('asg-4');
      setDescription('Assessment framework evaluating core student deliverables and execution polish.');
      setTotalMarks(20);
      setStatus('DRAFT');
      setCriteria([
        {
          id: `crit-${Date.now()}-1`,
          name: 'Core Workflow & Functional Execution',
          description: 'Completeness of primary deliverables with proper visual hierarchy.',
          marks: 10,
          weight: '50%',
          descriptors: [
            { level: 'Exemplary', scoreRange: '9-10', text: 'Flawless execution addressing all user scenarios with high polish.' },
            { level: 'Proficient', scoreRange: '7-8', text: 'Meets main requirements with minor interaction gaps.' },
            { level: 'Developing', scoreRange: '1-6', text: 'Missing core deliverables or noticeable visual errors.' }
          ]
        },
        {
          id: `crit-${Date.now()}-2`,
          name: 'Visual Rigor & Auto-Layout Discipline',
          description: 'Design token structure, spacing consistency, and responsive auto-layout.',
          marks: 10,
          weight: '50%',
          descriptors: [
            { level: 'Exemplary', scoreRange: '9-10', text: 'Systematic auto-layout with zero detached elements.' },
            { level: 'Proficient', scoreRange: '7-8', text: 'Consistent spacing with minor fixed-width frames.' },
            { level: 'Developing', scoreRange: '1-6', text: 'Unstructured layers and inconsistent type scale.' }
          ]
        }
      ]);
    }
    setErrors({});
  }, [rubric, isOpen]);

  if (!isOpen) return null;

  // Criteria actions
  const handleAddCriterion = () => {
    const newCrit = {
      id: `crit-${Date.now()}`,
      name: '',
      description: '',
      marks: 5,
      weight: '25%',
      descriptors: [
        { level: 'Exemplary', scoreRange: '5', text: '' },
        { level: 'Proficient', scoreRange: '3-4', text: '' },
        { level: 'Developing', scoreRange: '1-2', text: '' }
      ]
    };
    setCriteria([...criteria, newCrit]);
  };

  const handleUpdateCriterion = (index, field, value) => {
    const updated = [...criteria];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-calculate weight if marks changed
    if (field === 'marks') {
      const numMarks = Number(value) || 0;
      const calcTotal = Number(totalMarks) || 20;
      updated[index].weight = `${Math.round((numMarks / calcTotal) * 100)}%`;
    }

    setCriteria(updated);
  };

  const handleUpdateDescriptor = (critIndex, descIndex, field, value) => {
    const updated = [...criteria];
    const updatedDescriptors = [...(updated[critIndex].descriptors || [])];
    updatedDescriptors[descIndex] = { ...updatedDescriptors[descIndex], [field]: value };
    updated[critIndex] = { ...updated[critIndex], descriptors: updatedDescriptors };
    setCriteria(updated);
  };

  const handleRemoveCriterion = (index) => {
    if (criteria.length <= 1) return;
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  const handleMoveCriterion = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= criteria.length) return;
    const updated = [...criteria];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setCriteria(updated);
  };

  const toggleExpand = (id) => {
    setExpandedCriteria(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Calculations & reconciliation
  const sumOfCriterionMarks = criteria.reduce((sum, c) => sum + (Number(c.marks) || 0), 0);
  const marksDifference = Number(totalMarks) - sumOfCriterionMarks;

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Rubric title is required.';
    if (!assignmentId) newErrors.assignmentId = 'Linked assignment is required.';
    if (!description.trim()) newErrors.description = 'Rubric description is required.';
    if (!totalMarks || Number(totalMarks) <= 0) newErrors.totalMarks = 'Total marks must be positive.';

    const validCriteria = criteria.filter(c => c.name.trim() && Number(c.marks) > 0);
    if (validCriteria.length === 0) {
      newErrors.criteria = 'At least one criterion with a name and positive marks is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const selectedAssignment = assignments.find(a => a.id === assignmentId) || assignments[0];
    const selectedUnit = units.find(u => u.id === unitId) || units[0];

    const payload = {
      courseId,
      courseTitle: currentCourse.title,
      unitId,
      unitTitle: selectedUnit.title,
      assignmentId: selectedAssignment.id,
      assignmentTitle: selectedAssignment.title,
      title: title.trim(),
      description: description.trim(),
      totalMarks: Number(totalMarks),
      status,
      criteria: criteria.map(c => {
        const cMarks = Number(c.marks) || 0;
        return {
          ...c,
          name: c.name.trim(),
          description: c.description.trim(),
          marks: cMarks,
          weight: `${Math.round((cMarks / Number(totalMarks)) * 100)}%`
        };
      })
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
                {isEditing ? 'EDIT RUBRIC' : 'NEW RUBRIC'}
              </span>
              <span className="text-xs text-brand-text-secondary">
                Course: {currentCourse.title}
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-brand-text-primary tracking-tight">
              {isEditing ? `Edit Rubric: ${rubric?.title}` : 'Design Evaluation Rubric'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-brand-text-secondary hover:text-brand-text-primary hover:bg-[#F0F0EB] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Section 1: Linked Hierarchy */}
          <div className="space-y-3 pb-4 border-b border-brand-border/60">
            <div className="flex items-center gap-2 text-brand-blue font-bold uppercase tracking-wider text-[11px]">
              <Layers className="w-3.5 h-3.5" />
              <span>Assignment Linkage (Course → Unit → Assignment)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-brand-text-primary block">
                  Unit
                </label>
                <select
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-brand-border bg-[#FBFBFA] text-brand-text-primary focus:outline-none focus:border-brand-blue font-medium"
                >
                  {units.map(u => (
                    <option key={u.id} value={u.id}>Unit 0{u.unitNumber}: {u.title.substring(0, 20)}...</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-brand-text-primary block">
                  Linked Assignment <span className="text-brand-error">*</span>
                </label>
                <select
                  value={assignmentId}
                  onChange={(e) => setAssignmentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-brand-border bg-[#FBFBFA] text-brand-text-primary focus:outline-none focus:border-brand-blue font-medium"
                >
                  {eligibleAssignments.length > 0 ? (
                    eligibleAssignments.map(a => (
                      <option key={a.id} value={a.id}>{a.sprint}: {a.title.substring(0, 25)}...</option>
                    ))
                  ) : (
                    assignments.map(a => (
                      <option key={a.id} value={a.id}>{a.sprint}: {a.title.substring(0, 25)}...</option>
                    ))
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Rubric Details & Marks Reconciliation */}
          <div className="space-y-4 pb-4 border-b border-brand-border/60">
            <div className="flex items-center gap-2 text-brand-blue font-bold uppercase tracking-wider text-[11px]">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Rubric Overview & Total Marks</span>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-brand-text-primary block">
                Rubric Name / Title <span className="text-brand-error">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Prototype Motion & Interaction Evaluation Rubric"
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
                Framework Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Explain the criteria purpose, mentor grading guidelines, and qualitative assessment goals."
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FBFBFA] text-brand-text-primary focus:outline-none focus:border-brand-blue leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-brand-text-primary block flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-brand-blue" />
                  Total Maximum Marks <span className="text-brand-error">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-brand-border bg-[#FBFBFA] text-brand-text-primary focus:outline-none focus:border-brand-blue font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-brand-text-primary block">
                  Publish Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-brand-border bg-[#FBFBFA] text-brand-text-primary focus:outline-none focus:border-brand-blue font-medium"
                >
                  <option value="PUBLISHED">Published (Visible to Mentors & Students)</option>
                  <option value="DRAFT">Draft (Under Review)</option>
                </select>
              </div>
            </div>

            {/* Marks Reconciliation Indicator */}
            <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
              marksDifference === 0
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
                : 'bg-amber-50/60 border-amber-200 text-amber-800'
            }`}>
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 shrink-0" />
                <span>
                  Allocated Criteria Sum: <strong>{sumOfCriterionMarks}</strong> / <strong>{totalMarks} Marks</strong>
                </span>
              </div>
              <div className="font-semibold">
                {marksDifference === 0 ? (
                  <span className="flex items-center gap-1 text-brand-success">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Marks Reconciled (100%)
                  </span>
                ) : marksDifference > 0 ? (
                  <span>{marksDifference} Marks Unassigned</span>
                ) : (
                  <span>Exceeds Target by {Math.abs(marksDifference)} Marks</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Criteria Builder */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-brand-blue font-bold uppercase tracking-wider text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Evaluation Criteria ({criteria.length})</span>
                </div>
                <p className="text-[11px] text-brand-text-secondary mt-0.5">
                  Weightage belongs to the rubric framework. (Requirements are evaluated here without priority labels).
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCriterion}
                icon={Plus}
              >
                Add Criterion
              </Button>
            </div>

            {errors.criteria && (
              <p className="text-[11px] text-brand-error flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.criteria}
              </p>
            )}

            <div className="space-y-3">
              {criteria.map((crit, idx) => {
                const isExpanded = !!expandedCriteria[crit.id || idx];
                const critWeight = totalMarks > 0 ? Math.round(((Number(crit.marks) || 0) / Number(totalMarks)) * 100) : 0;

                return (
                  <div
                    key={crit.id || idx}
                    className="bg-white rounded-2xl border border-brand-border/80 shadow-2xs overflow-hidden"
                  >
                    {/* Criterion Header */}
                    <div className="p-3.5 bg-[#FBFBFA] border-b border-brand-border/60 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 flex-1">
                        {/* Order Controls */}
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveCriterion(idx, -1)}
                            className="p-1 rounded text-brand-text-secondary hover:text-brand-text-primary disabled:opacity-30"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === criteria.length - 1}
                            onClick={() => handleMoveCriterion(idx, 1)}
                            className="p-1 rounded text-brand-text-secondary hover:text-brand-text-primary disabled:opacity-30"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="w-5 h-5 rounded-full bg-brand-blue-light text-brand-blue font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>

                        <input
                          type="text"
                          value={crit.name}
                          onChange={(e) => handleUpdateCriterion(idx, 'name', e.target.value)}
                          placeholder="Criterion Name (e.g. Prototype Flow Continuity & Logic)"
                          className="flex-1 px-3 py-1.5 rounded-lg border border-brand-border bg-white text-brand-text-primary font-bold text-xs focus:outline-none focus:border-brand-blue"
                        />
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-brand-border">
                          <span className="font-semibold text-brand-text-secondary">Marks:</span>
                          <input
                            type="number"
                            min="1"
                            max={totalMarks}
                            value={crit.marks}
                            onChange={(e) => handleUpdateCriterion(idx, 'marks', e.target.value)}
                            className="w-12 text-center font-bold text-brand-text-primary focus:outline-none"
                          />
                          <span className="text-brand-blue font-bold text-[10px]">({critWeight}%)</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleExpand(crit.id || idx)}
                          className="p-1.5 rounded-lg text-brand-text-secondary hover:text-brand-text-primary hover:bg-[#F0F0EB] transition-colors"
                          title={isExpanded ? 'Collapse Descriptors' : 'Expand Descriptors'}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {criteria.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCriterion(idx)}
                            className="p-1.5 rounded-lg text-brand-text-secondary hover:text-brand-error hover:bg-red-50 transition-colors"
                            title="Delete Criterion"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Criterion Body */}
                    <div className="p-3.5 space-y-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-brand-text-secondary block">
                          Criterion Scope & Evaluation Guidelines
                        </label>
                        <textarea
                          value={crit.description}
                          onChange={(e) => handleUpdateCriterion(idx, 'description', e.target.value)}
                          rows={2}
                          placeholder="Explain how the facilitator assesses this criterion and what evidence in Figma to examine."
                          className="w-full px-3 py-1.5 rounded-lg border border-brand-border bg-[#FDFDFB] text-brand-text-primary text-[11px] focus:outline-none focus:border-brand-blue"
                        />
                      </div>

                      {/* Performance Descriptors (Collapsible) */}
                      {isExpanded && (
                        <div className="space-y-2 pt-2 border-t border-brand-border/60 animate-in fade-in duration-150">
                          <p className="text-[11px] font-bold text-brand-text-primary uppercase tracking-wider">
                            Performance Level Descriptors
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                            {crit.descriptors?.map((desc, dIdx) => (
                              <div key={dIdx} className="p-2.5 bg-[#F9FAF9] rounded-xl border border-brand-border/70 space-y-1.5">
                                <div className="flex items-center justify-between font-bold text-brand-text-primary">
                                  <span>{desc.level}</span>
                                  <input
                                    type="text"
                                    value={desc.scoreRange}
                                    onChange={(e) => handleUpdateDescriptor(idx, dIdx, 'scoreRange', e.target.value)}
                                    placeholder="Score"
                                    className="w-14 px-1.5 py-0.5 text-center bg-white rounded border border-brand-border text-[10px]"
                                  />
                                </div>
                                <textarea
                                  value={desc.text}
                                  onChange={(e) => handleUpdateDescriptor(idx, dIdx, 'text', e.target.value)}
                                  rows={2}
                                  placeholder={`${desc.level} performance expectation...`}
                                  className="w-full p-1.5 rounded border border-brand-border bg-white text-[10px] focus:outline-none"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-brand-border flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="font-bold shadow-sm"
            >
              {isEditing ? 'Save Rubric Changes' : 'Publish Rubric'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RubricModal;
