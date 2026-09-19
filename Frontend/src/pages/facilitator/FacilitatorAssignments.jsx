import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import AssignmentModal from '../../components/facilitator/AssignmentModal';
import AssignmentSpecsModal from '../../components/facilitator/AssignmentSpecsModal';
import { assignmentApi } from '../../api/assignmentApi';
import { 
  getFacilitatorAssignments, 
  mockFacilitatorCourses 
} from '../../data/mockFacilitatorData';
import { 
  Plus, 
  Search, 
  Calendar, 
  Inbox, 
  X, 
  LayoutGrid,
  List,
  AlertCircle
} from 'lucide-react';

export const FacilitatorAssignments = () => {
  const [assignments, setAssignments] = useState(getFacilitatorAssignments);
  const [apiError, setApiError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedUnit, setSelectedUnit] = useState('ALL');
  const [viewMode, setViewMode] = useState('TABLE'); // 'TABLE' or 'CARDS'

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSpecsModalOpen, setIsSpecsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [viewingAssignment, setViewingAssignment] = useState(null);

  const currentCourse = mockFacilitatorCourses[0];
  const units = currentCourse?.units || [];

  // Data fetching via API adapter
  useEffect(() => {
    let isMounted = true;
    const fetchAssignments = async () => {
      try {
        const data = await assignmentApi.getAssignments();
        if (isMounted && data) {
          setAssignments(data);
        }
      } catch (err) {
        if (isMounted) setApiError(err.message || 'Failed to sync assignments with server');
      }
    };
    fetchAssignments();
    return () => { isMounted = false; };
  }, []);

  // Filter & Search logic
  const filteredAssignments = useMemo(() => {
    return assignments.filter((asg) => {
      // Search match
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        asg.title?.toLowerCase().includes(query) ||
        asg.sprint?.toLowerCase().includes(query) ||
        asg.unitTitle?.toLowerCase().includes(query) ||
        asg.phase?.toLowerCase().includes(query);

      // Status match
      const matchesStatus = selectedStatus === 'ALL' || asg.status === selectedStatus;

      // Unit match
      const matchesUnit = selectedUnit === 'ALL' || asg.unitId === selectedUnit;

      return matchesSearch && matchesStatus && matchesUnit;
    });
  }, [assignments, searchQuery, selectedStatus, selectedUnit]);

  // Metric counts
  const totalCount = assignments.length;
  const publishedCount = assignments.filter(a => a.status === 'PUBLISHED' || a.status === 'ACTIVE').length;
  const draftCount = assignments.filter(a => a.status === 'DRAFT').length;
  const closedCount = assignments.filter(a => a.status === 'CLOSED').length;

  // Handlers
  const handleOpenCreateModal = () => {
    setEditingAssignment(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (asg) => {
    setEditingAssignment(asg);
    setIsFormModalOpen(true);
  };

  const handleOpenSpecsModal = (asg) => {
    setViewingAssignment(asg);
    setIsSpecsModalOpen(true);
  };

  const handleSaveAssignment = async (formData) => {
    try {
      if (editingAssignment) {
        const updated = await assignmentApi.updateAssignment(editingAssignment.id, formData);
        setAssignments(prev => prev.map(a => a.id === editingAssignment.id ? updated : a));
      } else {
        const created = await assignmentApi.createAssignment(formData);
        setAssignments(prev => [created, ...prev]);
      }
    } catch (err) {
      setApiError(err.message || 'Failed to save assignment');
    }
  };

  const handleToggleStatus = async (id, nextStatus) => {
    try {
      const updated = await assignmentApi.toggleAssignmentStatus(id, nextStatus);
      setAssignments(prev => prev.map(a => a.id === id ? updated : a));
    } catch (err) {
      setApiError(err.message || 'Failed to update assignment status');
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
            <Badge variant="warning" size="sm">
              FACILITATOR WORKSPACE
            </Badge>
            <span className="text-xs text-brand-text-secondary">
              Curriculum Control • {currentCourse?.title}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-brand-text-primary tracking-tight">
            Assignment Management
          </h1>
          <p className="text-xs md:text-sm text-brand-text-secondary mt-1 max-w-xl leading-relaxed">
            Author curriculum assignments, define deliverables, set submission cutoffs, and monitor cohort completion.
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
            Create Assignment
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

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-2xl border border-brand-border p-4 shadow-soft">
          <span className="text-[11px] font-bold text-brand-text-secondary uppercase tracking-wider block">
            Total Assignments
          </span>
          <span className="text-2xl md:text-3xl font-black text-brand-text-primary mt-2 block">
            {totalCount}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-brand-border p-4 shadow-soft">
          <span className="text-[11px] font-bold text-brand-text-secondary uppercase tracking-wider block">
            Published & Active
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
            Closed / Archived
          </span>
          <span className="text-2xl md:text-3xl font-black text-brand-text-secondary mt-2 block">
            {closedCount}
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
              placeholder="Search by assignment title, sprint, or unit..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-brand-border bg-[#FBFBFA] text-xs font-medium text-brand-text-primary focus:outline-none focus:border-brand-blue transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-secondary hover:text-brand-text-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Controls: Status, Unit, and View Mode */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {/* Status Pills */}
            <div className="flex items-center bg-[#F4F4F0] p-1 rounded-xl">
              {['ALL', 'PUBLISHED', 'DRAFT', 'CLOSED'].map((statusKey) => (
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
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-brand-border bg-[#FBFBFA] text-brand-text-primary font-medium focus:outline-none focus:border-brand-blue"
            >
              <option value="ALL">All Units</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>Unit {u.unitNumber}: {u.title.substring(0, 24)}...</option>
              ))}
            </select>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-brand-error hover:bg-brand-error-bg"
              >
                Reset
              </Button>
            )}

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center border border-brand-border rounded-xl p-0.5 bg-[#FBFBFA]">
              <button
                onClick={() => setViewMode('TABLE')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'TABLE' ? 'bg-white text-brand-blue shadow-2xs' : 'text-brand-text-secondary'}`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('CARDS')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'CARDS' ? 'bg-white text-brand-blue shadow-2xs' : 'text-brand-text-secondary'}`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-[11px] text-brand-text-secondary pt-1">
          <span>
            Showing <strong>{filteredAssignments.length}</strong> of {totalCount} assignments
          </span>
          {hasActiveFilters && (
            <span className="text-brand-blue font-semibold">Active filter applied</span>
          )}
        </div>
      </Card>

      {/* Main Content Area: Assignments List/Table */}
      {filteredAssignments.length === 0 ? (
        /* Empty State */
        <Card className="p-12 text-center space-y-4 shadow-soft">
          <div className="w-12 h-12 rounded-2xl bg-[#F4F4F0] text-brand-text-secondary mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-brand-text-primary">
              No assignments found
            </h3>
            <p className="text-xs text-brand-text-secondary max-w-sm mx-auto">
              No curriculum assignments match your current search or filter criteria. Try resetting filters or creating a new assignment.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </Card>
      ) : viewMode === 'TABLE' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl border border-brand-border shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-brand-border bg-[#FCFCFA] text-[11px] font-bold text-brand-text-secondary uppercase tracking-wider">
                  <th className="py-3.5 px-5">Assignment & Unit</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Marks</th>
                  <th className="py-3.5 px-5">Submission Progress</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {filteredAssignments.map((asg) => {
                  const percentSubmitted = Math.round((asg.submittedCount / asg.totalEnrolled) * 100);
                  const isClosed = asg.status === 'CLOSED';
                  const isPublished = asg.status === 'PUBLISHED' || asg.status === 'ACTIVE';

                  return (
                    <tr 
                      key={asg.id}
                      className="hover:bg-[#FCFCFA] transition-colors group"
                    >
                      {/* Assignment & Hierarchy */}
                      <td className="py-4 px-5 max-w-xs sm:max-w-md">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue bg-brand-blue-light px-2 py-0.5 rounded-full">
                              {asg.sprint}
                            </span>
                            <span className="text-[10px] text-brand-text-secondary truncate font-medium">
                              {asg.unitTitle || 'Curriculum Unit'}
                            </span>
                          </div>
                          <h4 
                            onClick={() => handleOpenSpecsModal(asg)}
                            className="text-xs font-bold text-brand-text-primary group-hover:text-brand-blue cursor-pointer transition-colors"
                          >
                            {asg.title}
                          </h4>
                          <p className="text-[11px] text-brand-text-secondary line-clamp-1 leading-snug">
                            {asg.description}
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <Badge
                          variant={isPublished ? 'success' : isClosed ? 'neutral' : 'warning'}
                          size="sm"
                          dot={isPublished}
                        >
                          {asg.status}
                        </Badge>
                      </td>

                      {/* Due Date */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-brand-text-secondary">
                          <Calendar className="w-3.5 h-3.5 text-brand-warning" />
                          <span className="font-semibold text-brand-text-primary">
                            {asg.dueDateFormatted || asg.dueDate}
                          </span>
                        </div>
                      </td>

                      {/* Marks */}
                      <td className="py-4 px-4 whitespace-nowrap font-bold text-brand-text-primary">
                        {asg.maxScore} Marks
                      </td>

                      {/* Submissions Progress */}
                      <td className="py-4 px-5 min-w-[180px]">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px]">
                            <span className="font-semibold text-brand-text-primary">
                              {asg.submittedCount} / {asg.totalEnrolled} ({percentSubmitted}%)
                            </span>
                            <span className="text-brand-text-secondary">
                              {asg.evaluatedCount} eval • {asg.pendingReviewCount} pend
                            </span>
                          </div>

                          {/* Multi-segment progress bar */}
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
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* View Specs */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenSpecsModal(asg)}
                            title="View Assignment Specifications"
                          >
                            Specs
                          </Button>

                          {/* Edit */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditModal(asg)}
                            title="Edit Assignment"
                          >
                            Edit
                          </Button>

                          {/* Submissions button */}
                          <Link to={`/facilitator/submissions?assignmentId=${asg.id}`}>
                            <Button
                              variant={asg.pendingReviewCount > 0 ? 'primary' : 'outline'}
                              size="sm"
                              icon={Inbox}
                              title="Inspect Submissions Queue"
                            >
                              Submissions
                            </Button>
                          </Link>

                          {/* Status toggle quick action */}
                          <select
                            value={asg.status}
                            onChange={(e) => handleToggleStatus(asg.id, e.target.value)}
                            className="text-[10px] font-semibold px-2 py-1.5 rounded-lg border border-brand-border bg-white text-brand-text-secondary focus:outline-none"
                            title="Change status"
                          >
                            <option value="DRAFT">Draft</option>
                            <option value="PUBLISHED">Publish</option>
                            <option value="CLOSED">Close</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredAssignments.map((asg) => {
            const percentSubmitted = Math.round((asg.submittedCount / asg.totalEnrolled) * 100);
            const isClosed = asg.status === 'CLOSED';
            const isPublished = asg.status === 'PUBLISHED' || asg.status === 'ACTIVE';

            return (
              <Card 
                key={asg.id}
                className="p-5 shadow-soft flex flex-col justify-between space-y-4 hover:border-[#D5D5CE] transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue bg-brand-blue-light px-2 py-0.5 rounded-full">
                      {asg.sprint}
                    </span>
                    <Badge
                      variant={isPublished ? 'success' : isClosed ? 'neutral' : 'warning'}
                      size="sm"
                      dot={isPublished}
                    >
                      {asg.status}
                    </Badge>
                  </div>

                  <div>
                    <h3 
                      onClick={() => handleOpenSpecsModal(asg)}
                      className="text-sm font-bold text-brand-text-primary hover:text-brand-blue cursor-pointer transition-colors leading-snug"
                    >
                      {asg.title}
                    </h3>
                    <p className="text-[11px] text-brand-text-secondary mt-1 line-clamp-2 leading-relaxed">
                      {asg.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-brand-text-secondary pt-1 border-t border-brand-border/60">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-brand-warning" />
                      <span>{asg.dueDateFormatted || asg.dueDate}</span>
                    </div>
                    <span>•</span>
                    <div>
                      Max Marks: <strong>{asg.maxScore}</strong>
                    </div>
                  </div>

                  {/* Submission Progress */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-brand-text-secondary">
                        Submissions: <strong>{asg.submittedCount} / {asg.totalEnrolled}</strong> ({percentSubmitted}%)
                      </span>
                      <span className="text-brand-text-secondary font-medium">
                        {asg.evaluatedCount} eval • {asg.pendingReviewCount} pend
                      </span>
                    </div>
                    <div className="w-full bg-[#EFEFEA] h-2 rounded-full overflow-hidden flex">
                      <div
                        className="bg-brand-success h-full"
                        style={{ width: `${(asg.evaluatedCount / asg.totalEnrolled) * 100}%` }}
                      />
                      <div
                        className="bg-brand-warning h-full"
                        style={{ width: `${(asg.pendingReviewCount / asg.totalEnrolled) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenSpecsModal(asg)}
                    >
                      Specs
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditModal(asg)}
                    >
                      Edit
                    </Button>
                  </div>

                  <Link to={`/facilitator/submissions?assignmentId=${asg.id}`}>
                    <Button
                      variant={asg.pendingReviewCount > 0 ? 'primary' : 'outline'}
                      size="sm"
                      icon={Inbox}
                      iconPosition="right"
                    >
                      Submissions
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Assignment Create / Edit Modal */}
      <AssignmentModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveAssignment}
        assignment={editingAssignment}
      />

      {/* Assignment Specs Preview Modal */}
      <AssignmentSpecsModal
        isOpen={isSpecsModalOpen}
        onClose={() => setIsSpecsModalOpen(false)}
        assignment={viewingAssignment}
        onEdit={handleOpenEditModal}
      />
    </div>
  );
};

export default FacilitatorAssignments;
