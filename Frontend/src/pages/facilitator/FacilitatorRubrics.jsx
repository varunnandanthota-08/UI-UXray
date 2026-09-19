import React, { useState, useMemo, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import RubricModal from '../../components/facilitator/RubricModal';
import RubricInspectModal from '../../components/facilitator/RubricInspectModal';
import { rubricApi } from '../../api/rubricApi';
import { 
  getFacilitatorRubrics, 
  mockFacilitatorCourses 
} from '../../data/mockFacilitatorData';
import { 
  Plus, 
  Search, 
  Calendar, 
  Award, 
  X, 
  LayoutGrid,
  List,
  Layers,
  Edit3,
  Eye,
  Trash2,
  Sliders,
  AlertCircle,
  FileCheck2,
  Sparkles
} from 'lucide-react';

export const FacilitatorRubrics = () => {
  const [rubrics, setRubrics] = useState(getFacilitatorRubrics);
  const [apiError, setApiError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedUnit, setSelectedUnit] = useState('ALL');
  const [viewMode, setViewMode] = useState('TABLE'); // 'TABLE' or 'CARDS'

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isInspectModalOpen, setIsInspectModalOpen] = useState(false);
  const [editingRubric, setEditingRubric] = useState(null);
  const [viewingRubric, setViewingRubric] = useState(null);
  const [deletingRubricId, setDeletingRubricId] = useState(null);

  const currentCourse = mockFacilitatorCourses[0];
  const units = currentCourse?.units || [];

  // Data fetching via API adapter
  useEffect(() => {
    let isMounted = true;
    const fetchRubrics = async () => {
      try {
        const data = await rubricApi.getRubrics();
        if (isMounted && data) {
          setRubrics(data);
        }
      } catch (err) {
        if (isMounted) setApiError(err.message || 'Failed to sync rubrics with server');
      }
    };
    fetchRubrics();
    return () => { isMounted = false; };
  }, []);

  // Filter & Search logic
  const filteredRubrics = useMemo(() => {
    return rubrics.filter((rubric) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        rubric.title?.toLowerCase().includes(query) ||
        rubric.assignmentTitle?.toLowerCase().includes(query) ||
        rubric.unitTitle?.toLowerCase().includes(query) ||
        rubric.description?.toLowerCase().includes(query);

      const matchesStatus = selectedStatus === 'ALL' || rubric.status === selectedStatus;
      const matchesUnit = selectedUnit === 'ALL' || rubric.unitId === selectedUnit;

      return matchesSearch && matchesStatus && matchesUnit;
    });
  }, [rubrics, searchQuery, selectedStatus, selectedUnit]);

  // Metric counts
  const totalCount = rubrics.length;
  const publishedCount = rubrics.filter(r => r.status === 'PUBLISHED').length;
  const draftCount = rubrics.filter(r => r.status === 'DRAFT').length;
  const totalCriteriaCount = rubrics.reduce((acc, r) => acc + (r.criteria?.length || 0), 0);

  // Handlers
  const handleOpenCreateModal = () => {
    setEditingRubric(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (rubric) => {
    setEditingRubric(rubric);
    setIsFormModalOpen(true);
  };

  const handleOpenInspectModal = (rubric) => {
    setViewingRubric(rubric);
    setIsInspectModalOpen(true);
  };

  const handleSaveRubric = async (formData) => {
    try {
      if (editingRubric) {
        const updated = await rubricApi.updateRubric(editingRubric.id, formData);
        setRubrics(prev => prev.map(r => r.id === editingRubric.id ? updated : r));
      } else {
        const created = await rubricApi.createRubric(formData);
        setRubrics(prev => [created, ...prev]);
      }
    } catch (err) {
      setApiError(err.message || 'Failed to save rubric');
    }
  };

  const handleToggleStatus = async (id, nextStatus) => {
    try {
      const updated = await rubricApi.toggleRubricStatus(id, nextStatus);
      setRubrics(prev => prev.map(r => r.id === id ? updated : r));
    } catch (err) {
      setApiError(err.message || 'Failed to update rubric status');
    }
  };

  const handleDeleteRubric = async (id) => {
    try {
      await rubricApi.deleteRubric(id);
      setRubrics(prev => prev.filter(r => r.id !== id));
      setDeletingRubricId(null);
    } catch (err) {
      setApiError(err.message || 'Failed to delete rubric');
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setSelectedUnit('ALL');
  };

  const hasActiveFilters = searchQuery !== '' || selectedStatus !== 'ALL' || selectedUnit !== 'ALL';

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Top Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="blue" size="sm">
              EVALUATION FRAMEWORK
            </Badge>
            <span className="text-xs text-brand-text-secondary">
              Curriculum Rubrics • {currentCourse?.title}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-brand-text-primary tracking-tight">
            Rubric Management
          </h1>
          <p className="text-xs md:text-sm text-brand-text-secondary mt-1 max-w-xl leading-relaxed">
            Construct and maintain structured evaluation criteria, mark weights, and scoring anchors. Facilitators retain full authority over grading.
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            iconPosition="left"
            onClick={handleOpenCreateModal}
          >
            Create Rubric
          </Button>
        </div>
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

      {/* Human Assessment Notice */}
      <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 flex items-start gap-3.5">
        <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h4 className="font-bold text-amber-950">
            Facilitator Evaluation Principles
          </h4>
          <p className="text-amber-900 leading-relaxed">
            Rubric criteria define how facilitators assess student submissions. Rubric marks and weights do not reprioritize student requirements or dictate deliverable importance. All final grading decisions remain strictly human-controlled.
          </p>
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-2xl border border-brand-border p-4 shadow-soft">
          <span className="text-[11px] font-bold text-brand-text-secondary uppercase tracking-wider block">
            Total Rubrics
          </span>
          <span className="text-2xl md:text-3xl font-black text-brand-text-primary mt-2 block">
            {totalCount}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-brand-border p-4 shadow-soft">
          <span className="text-[11px] font-bold text-brand-text-secondary uppercase tracking-wider block">
            Published Active
          </span>
          <span className="text-2xl md:text-3xl font-black text-brand-blue mt-2 block">
            {publishedCount}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-brand-border p-4 shadow-soft">
          <span className="text-[11px] font-bold text-brand-text-secondary uppercase tracking-wider block">
            In Draft
          </span>
          <span className="text-2xl md:text-3xl font-black text-brand-warning mt-2 block">
            {draftCount}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-brand-border p-4 shadow-soft">
          <span className="text-[11px] font-bold text-brand-text-secondary uppercase tracking-wider block">
            Total Criteria
          </span>
          <span className="text-2xl md:text-3xl font-black text-emerald-600 mt-2 block">
            {totalCriteriaCount}
          </span>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <Card className="p-4 md:p-5 shadow-soft space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-brand-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by rubric title, assignment, or unit..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-brand-border bg-[#FBFBFA] text-xs font-medium text-brand-text-primary focus:outline-none focus:border-brand-blue transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-secondary hover:text-brand-text-primary"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Controls: Status, Unit, and View Mode */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {/* Status Pills */}
            <div className="flex items-center bg-[#F4F4F0] p-1 rounded-xl">
              {['ALL', 'PUBLISHED', 'DRAFT'].map((statusKey) => (
                <button
                  key={statusKey}
                  onClick={() => setSelectedStatus(statusKey)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                    selectedStatus === statusKey
                      ? 'bg-white text-brand-text-primary shadow-2xs'
                      : 'text-brand-text-secondary hover:text-brand-text-primary'
                  }`}
                >
                  {statusKey === 'ALL' ? 'All Status' : statusKey}
                </button>
              ))}
            </div>

            {/* Unit Dropdown */}
            <div className="flex items-center">
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                aria-label="Filter by Unit"
                className="px-3 py-1.5 rounded-xl border border-brand-border bg-[#FBFBFA] text-xs font-medium text-brand-text-primary focus:outline-none focus:border-brand-blue"
              >
                <option value="ALL">All Curriculum Units</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    Unit {u.unitNumber}: {u.title}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#F4F4F0] p-1 rounded-xl">
              <button
                onClick={() => setViewMode('TABLE')}
                className={`p-1.5 rounded-lg transition-colors ${
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
                className={`p-1.5 rounded-lg transition-colors ${
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

            {/* Reset Filters button */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs text-brand-text-secondary hover:text-brand-warning"
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Filter results info tag */}
        <div className="flex items-center justify-between text-[11px] text-brand-text-secondary pt-1 border-t border-brand-border/40">
          <span>
            Showing <strong className="text-brand-text-primary">{filteredRubrics.length}</strong> of {totalCount} rubrics
          </span>
          {hasActiveFilters && (
            <span className="text-brand-warning font-medium">
              Filtered criteria applied
            </span>
          )}
        </div>
      </Card>

      {/* Main Rubrics Content */}
      {filteredRubrics.length === 0 ? (
        <Card className="p-12 text-center shadow-soft">
          <div className="max-w-sm mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-blue-light text-brand-blue flex items-center justify-center mx-auto">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-brand-text-primary">
              No rubrics found
            </h3>
            <p className="text-xs text-brand-text-secondary leading-relaxed">
              {hasActiveFilters
                ? 'No rubrics matched your search or filter options. Try resetting your filters.'
                : 'No evaluation rubrics have been created for this course yet.'}
            </p>
            {hasActiveFilters ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="mt-2"
              >
                Clear Filters
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                iconPosition="left"
                onClick={handleOpenCreateModal}
                className="mt-2"
              >
                Create First Rubric
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
                  <th className="py-3.5 px-5">Rubric & Linked Assignment</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Total Marks</th>
                  <th className="py-3.5 px-4">Criteria</th>
                  <th className="py-3.5 px-4">Last Updated</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {filteredRubrics.map((rubric) => {
                  const isPublished = rubric.status === 'PUBLISHED';
                  const criteriaList = rubric.criteria || [];
                  const criteriaMarks = criteriaList.reduce((s, c) => s + (Number(c.marks) || 0), 0);
                  const isReconciled = criteriaMarks === Number(rubric.totalMarks);

                  return (
                    <tr 
                      key={rubric.id}
                      className="hover:bg-[#FCFCFA] transition-colors group"
                    >
                      {/* Rubric Title & Hierarchy */}
                      <td className="py-4 px-5 max-w-xs sm:max-w-md">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue bg-brand-blue-light px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Layers className="w-3 h-3" />
                              {rubric.unitTitle ? rubric.unitTitle.split('&')[0].trim() : 'Curriculum Unit'}
                            </span>
                            <span className="text-[10px] text-brand-text-secondary truncate font-medium">
                              › {rubric.assignmentTitle || 'Linked Assignment'}
                            </span>
                          </div>
                          <h4 
                            onClick={() => handleOpenInspectModal(rubric)}
                            className="text-xs font-bold text-brand-text-primary group-hover:text-brand-blue cursor-pointer transition-colors"
                          >
                            {rubric.title}
                          </h4>
                          <p className="text-[11px] text-brand-text-secondary line-clamp-1 leading-snug">
                            {rubric.description || 'No description provided.'}
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(rubric.id, isPublished ? 'DRAFT' : 'PUBLISHED')}
                          title={`Click to switch to ${isPublished ? 'DRAFT' : 'PUBLISHED'}`}
                        >
                          <Badge
                            variant={isPublished ? 'success' : 'default'}
                            size="sm"
                            dot={isPublished}
                            className="cursor-pointer hover:opacity-85 transition-opacity"
                          >
                            {rubric.status}
                          </Badge>
                        </button>
                      </td>

                      {/* Marks & Reconciliation */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-brand-blue" />
                          <span className="font-bold text-brand-text-primary">
                            {rubric.totalMarks} Marks
                          </span>
                          {!isReconciled && (
                            <span title="Criteria marks do not equal total rubric marks" className="text-amber-500">
                              <AlertCircle className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Criteria Count */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-text-primary bg-[#F4F4F0] px-2.5 py-1 rounded-lg">
                          <Sliders className="w-3 h-3 text-emerald-600" />
                          {criteriaList.length} criteria
                        </span>
                      </td>

                      {/* Last Updated */}
                      <td className="py-4 px-4 whitespace-nowrap text-brand-text-secondary">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-amber-500" />
                          <span>{rubric.lastUpdated || 'Recent'}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Eye}
                            onClick={() => handleOpenInspectModal(rubric)}
                            title="Inspect Rubric"
                            aria-label="Inspect Rubric"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Edit3}
                            onClick={() => handleOpenEditModal(rubric)}
                            title="Edit Rubric"
                            aria-label="Edit Rubric"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            onClick={() => setDeletingRubricId(rubric.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Delete Rubric"
                            aria-label="Delete Rubric"
                          />
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
          {filteredRubrics.map((rubric) => {
            const isPublished = rubric.status === 'PUBLISHED';
            const criteriaList = rubric.criteria || [];

            return (
              <Card 
                key={rubric.id}
                className="p-5 shadow-soft flex flex-col justify-between space-y-4 hover:border-brand-border-strong transition-all"
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue bg-brand-blue-light px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      {rubric.unitTitle ? rubric.unitTitle.split('&')[0].trim() : 'Unit'}
                    </span>
                    <button
                      onClick={() => handleToggleStatus(rubric.id, isPublished ? 'DRAFT' : 'PUBLISHED')}
                      title={`Click to switch to ${isPublished ? 'DRAFT' : 'PUBLISHED'}`}
                    >
                      <Badge
                        variant={isPublished ? 'success' : 'default'}
                        size="sm"
                        dot={isPublished}
                        className="cursor-pointer"
                      >
                        {rubric.status}
                      </Badge>
                    </button>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 
                      onClick={() => handleOpenInspectModal(rubric)}
                      className="text-sm font-bold text-brand-text-primary hover:text-brand-blue cursor-pointer transition-colors"
                    >
                      {rubric.title}
                    </h3>
                    <p className="text-[11px] text-brand-text-secondary mt-1 line-clamp-2 leading-relaxed">
                      {rubric.description || 'Structured criteria for evaluating deliverables against learning outcomes.'}
                    </p>
                  </div>

                  {/* Linked Assignment Pill */}
                  <div className="p-2.5 bg-[#FBFBFA] rounded-xl border border-brand-border text-[11px] flex items-center justify-between">
                    <span className="text-brand-text-secondary font-medium truncate max-w-[200px]">
                      {rubric.assignmentTitle || 'Assignment'}
                    </span>
                    <span className="font-bold text-brand-blue shrink-0">
                      {rubric.totalMarks} pts
                    </span>
                  </div>

                  {/* Criteria Preview */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary block">
                      Criteria Breakdown ({criteriaList.length})
                    </span>
                    <div className="space-y-1">
                      {criteriaList.slice(0, 3).map((crit, cIdx) => (
                        <div 
                          key={crit.id || cIdx} 
                          className="flex items-center justify-between text-[11px] text-brand-text-primary py-0.5"
                        >
                          <span className="truncate pr-2 font-medium">
                            • {crit.name}
                          </span>
                          <span className="text-brand-text-secondary font-bold shrink-0">
                            {crit.marks}m ({crit.weight || `${Math.round((crit.marks / (rubric.totalMarks || 1)) * 100)}%`})
                          </span>
                        </div>
                      ))}
                      {criteriaList.length > 3 && (
                        <p className="text-[10px] text-brand-blue font-semibold pt-0.5">
                          +{criteriaList.length - 3} more criteria
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between text-[11px]">
                  <span className="text-brand-text-secondary">
                    {rubric.lastUpdated || 'Recent'}
                  </span>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Eye}
                      onClick={() => handleOpenInspectModal(rubric)}
                      title="Inspect"
                      aria-label="Inspect"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Edit3}
                      onClick={() => handleOpenEditModal(rubric)}
                      title="Edit"
                      aria-label="Edit"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => setDeletingRubricId(rubric.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete"
                      aria-label="Delete"
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingRubricId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-brand-border shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-text-primary">
                Delete Evaluation Rubric?
              </h3>
              <p className="text-xs text-brand-text-secondary mt-1 leading-relaxed">
                This will remove the rubric criteria and performance descriptors from the facilitator workspace. Existing student submissions will not be altered.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeletingRubricId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDeleteRubric(deletingRubricId)}
              >
                Delete Rubric
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Rubric Modal */}
      <RubricModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingRubric(null);
        }}
        onSave={handleSaveRubric}
        rubric={editingRubric}
      />

      {/* Inspect Rubric Modal */}
      <RubricInspectModal
        isOpen={isInspectModalOpen}
        onClose={() => {
          setIsInspectModalOpen(false);
          setViewingRubric(null);
        }}
        rubric={viewingRubric}
        onEdit={(rubric) => {
          setIsInspectModalOpen(false);
          handleOpenEditModal(rubric);
        }}
      />
    </div>
  );
};

export default FacilitatorRubrics;
