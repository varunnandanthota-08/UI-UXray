/**
 * Facilitator API Service Layer
 *
 * Provides a clean abstraction between Facilitator UI modules and the backend REST API.
 * Uses transparent adapter fallback to mockFacilitatorData when the backend is offline,
 * during development/demo mode, or when specific endpoints are not yet deployed.
 *
 * IMPORTANT PRODUCT RULE:
 * The facilitator remains the sole grading authority. AI is advisory only.
 * No API method here may automatically finalize, approve, or alter scores autonomously.
 */

import apiClient from './apiClient';
import {
  getFacilitatorAssignments,
  createFacilitatorAssignment as mockCreateAssignment,
  updateFacilitatorAssignment as mockUpdateAssignment,
  toggleAssignmentStatus as mockToggleAssignmentStatus,
  deleteFacilitatorAssignment as mockDeleteAssignment,
  getFacilitatorRubrics,
  createFacilitatorRubric as mockCreateRubric,
  updateFacilitatorRubric as mockUpdateRubric,
  toggleRubricStatus as mockToggleRubricStatus,
  deleteFacilitatorRubric as mockDeleteRubric,
  getFacilitatorSubmissions,
  saveFacilitatorSubmissions,
  finalizeEvaluation as mockFinalizeEvaluation,
  returnSubmissionForRevision as mockReturnSubmission,
  getFacilitatorEvaluations,
  getEvaluationById as mockGetEvaluationById,
  getReEvaluationRequests as mockGetReEvaluationRequests,
  approveReEvaluation as mockApproveReEvaluation,
  rejectReEvaluation as mockRejectReEvaluation,
  finalizeReEvaluation as mockFinalizeReEvaluation,
  getFacilitatorBatches,
  createFacilitatorBatch as mockCreateFacilitatorBatch,
  updateFacilitatorBatch as mockUpdateFacilitatorBatch,
  getFacilitatorSettings,
  saveFacilitatorSettings,
  resetFacilitatorSettings,
  mockFacilitatorCourses,
  mockFacilitatorUser
} from '../data/mockFacilitatorData';

/**
 * Normalization & Status Mapping Helpers
 */
export function isValidMongoId(id) {
  return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id.trim());
}

export function isDemoSession() {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('barabari_facilitator_token');
  return typeof token === 'string' && token.startsWith('demo-token-');
}

export function mapBackendStatusToFrontend(status) {
  if (!status) return 'DRAFT';
  const s = String(status).toLowerCase();
  if (s === 'active' || s === 'published') return 'PUBLISHED';
  if (s === 'closed') return 'CLOSED';
  return 'DRAFT';
}

export function mapFrontendStatusToBackend(status) {
  if (!status) return 'draft';
  const s = String(status).toUpperCase();
  if (s === 'PUBLISHED' || s === 'ACTIVE') return 'active';
  if (s === 'CLOSED') return 'closed';
  return 'draft';
}

export function mapBackendSubmissionStatus(status) {
  if (!status) return { status: 'DRAFT', evaluationStatus: 'DRAFT' };
  const s = String(status).toLowerCase();
  switch (s) {
    case 'submitted':
      return { status: 'SUBMITTED', evaluationStatus: 'PENDING_REVIEW' };
    case 'processing':
      return { status: 'PROCESSING', evaluationStatus: 'IN_REVIEW' };
    case 'ai_review_complete':
      return { status: 'AUTOMATED_ANALYSIS_COMPLETE', evaluationStatus: 'IN_REVIEW' };
    case 'facilitator_review':
      return { status: 'FACILITATOR_REVIEWED', evaluationStatus: 'IN_REVIEW' };
    case 'evaluated':
      return { status: 'PUBLISHED', evaluationStatus: 'EVALUATED' };
    case 'draft':
    default:
      return { status: 'DRAFT', evaluationStatus: 'DRAFT' };
  }
}

export function fromBackendAssignment(b) {
  if (!b) return null;
  const id = b._id || b.id;
  const deadlineStr = b.deadline || b.dueDate;
  let dueDate = '';
  let dueDateFormatted = '';
  if (deadlineStr) {
    try {
      const d = new Date(deadlineStr);
      dueDate = d.toISOString().split('T')[0];
      dueDateFormatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      dueDate = deadlineStr;
      dueDateFormatted = deadlineStr;
    }
  }

  const requirements = Array.isArray(b.requirements)
    ? b.requirements.map((req, idx) => {
        if (typeof req === 'object' && req !== null) {
          return {
            id: req.id || req.requirementId || `req-${idx + 1}`,
            title: req.title || '',
            description: req.description || '',
            required: req.required !== false,
            completed: Boolean(req.completed),
          };
        }
        const str = String(req);
        const colonIdx = str.indexOf(':');
        if (colonIdx !== -1) {
          return {
            id: `req-${idx + 1}`,
            title: str.slice(0, colonIdx).trim(),
            description: str.slice(colonIdx + 1).trim(),
            required: true,
            completed: false,
          };
        }
        return {
          id: `req-${idx + 1}`,
          title: str,
          description: '',
          required: true,
          completed: false,
        };
      })
    : [];

  return {
    ...b,
    id,
    _id: id,
    title: b.title || '',
    description: b.description || '',
    instructions: b.instructions || '',
    submissionInstructions: b.instructions || '',
    figmaGuidance: b.instructions || '',
    totalMarks: Number(b.totalMarks ?? 20),
    maxScore: Number(b.totalMarks ?? 20),
    deadline: b.deadline,
    dueDate,
    dueDateFormatted,
    status: mapBackendStatusToFrontend(b.status),
    requirements,
    courseId: b.courseId || 'course-uiux-101',
    courseTitle: b.courseTitle || 'UI/UX Design Studio Apprenticeship',
    unitId: b.unitId || 'unit-4',
    unitTitle: b.unitTitle || 'Unit 4: High-Fidelity Prototyping & Design Systems',
    sprint: b.assignmentType || b.sprint || 'Sprint 07',
    phase: b.phase || 'Phase 2 • Interactive Prototyping',
    totalEnrolled: b.totalEnrolled ?? 28,
    submittedCount: b.submittedCount ?? 0,
    evaluatedCount: b.evaluatedCount ?? 0,
    pendingReviewCount: b.pendingReviewCount ?? 0,
  };
}

export function toBackendAssignment(f) {
  if (!f) return {};
  const status = mapFrontendStatusToBackend(f.status);
  const rawDeadline = f.deadline || f.dueDate;
  let deadline = rawDeadline;
  if (rawDeadline) {
    try {
      deadline = new Date(rawDeadline).toISOString();
    } catch {
      deadline = new Date(Date.now() + 7 * 86400000).toISOString();
    }
  } else {
    deadline = new Date(Date.now() + 7 * 86400000).toISOString();
  }

  const requirements = Array.isArray(f.requirements)
    ? f.requirements
        .map((r) => {
          if (typeof r === 'string') return r.trim();
          if (r && r.title) {
            return r.description ? `${r.title.trim()}: ${r.description.trim()}` : r.title.trim();
          }
          return '';
        })
        .filter(Boolean)
    : [];

  const totalMarks = Number(f.totalMarks ?? f.maxScore ?? 20);

  return {
    title: (f.title || '').trim(),
    description: (f.description || '').trim(),
    instructions: (f.submissionInstructions || f.instructions || f.figmaGuidance || '').trim(),
    requirements,
    assignmentType: f.sprint || f.assignmentType || 'Sprint 07',
    totalMarks: totalMarks > 0 ? totalMarks : 20,
    deadline,
    status,
  };
}

export function fromBackendSubmission(s) {
  if (!s) return null;
  const id = s._id || s.id;
  const assignmentObj = s.assignmentId && typeof s.assignmentId === 'object' ? s.assignmentId : null;
  const assignmentId = assignmentObj?._id || assignmentObj?.id || s.assignmentId;
  const assignmentTitle = assignmentObj?.title || s.assignmentTitle || 'Studio Assignment';
  const maxScore = assignmentObj?.totalMarks || s.maxScore || 20;

  const studentObj = s.studentId && typeof s.studentId === 'object' ? s.studentId : null;
  const studentId = studentObj?._id || studentObj?.id || s.studentId;
  const studentName = studentObj?.name || s.studentName || 'Student';
  const studentEmail = studentObj?.email || s.studentEmail || '';

  const submittedAt = s.submittedAt || s.createdAt;
  let submittedAtFormatted = 'Recently';
  if (submittedAt) {
    try {
      submittedAtFormatted = new Date(submittedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      submittedAtFormatted = String(submittedAt);
    }
  }

  const { status, evaluationStatus } = mapBackendSubmissionStatus(s.status);

  const deliverables = Array.isArray(s.deliverables) && s.deliverables.length > 0
    ? s.deliverables
    : [
        s.figmaUrl && { id: 'del-figma', name: 'Figma Prototype File', type: 'figma', url: s.figmaUrl, isSubmitted: true },
        s.figjamUrl && { id: 'del-figjam', name: 'FigJam User Flow & Journey Map', type: 'figjam', url: s.figjamUrl, isSubmitted: true },
        s.canvaUrl && { id: 'del-canva', name: 'Canva Design Presentation', type: 'canva', url: s.canvaUrl, isSubmitted: true },
        s.prototypeUrl && { id: 'del-proto', name: 'Interactive Prototype Link', type: 'prototype', url: s.prototypeUrl, isSubmitted: true },
        s.researchNotes && { id: 'del-res', name: 'Design Research Notes', type: 'notes', content: s.researchNotes, isSubmitted: true },
        s.persona && { id: 'del-persona', name: 'Target User Persona', type: 'persona', content: s.persona, isSubmitted: true },
        s.userFlow && { id: 'del-flow', name: 'User Flow Architecture', type: 'flow', content: s.userFlow, isSubmitted: true }
      ].filter(Boolean);

  return {
    ...s,
    id,
    _id: id,
    assignmentId,
    assignmentTitle,
    maxScore,
    studentId,
    studentName,
    studentEmail,
    studentAvatar: studentName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
    submittedAt,
    submittedAtFormatted,
    status: s.status ? status : 'SUBMITTED',
    evaluationStatus: s.evaluationStatus || evaluationStatus,
    evaluationId: s.evaluationId || id,
    deliverables,
    studentNotes: s.additionalNotes || s.researchNotes || s.studentNotes || '',
    figmaUrl: s.figmaUrl || '',
    figjamUrl: s.figjamUrl || '',
    canvaUrl: s.canvaUrl || '',
    prototypeUrl: s.prototypeUrl || '',
    researchNotes: s.researchNotes || '',
    persona: s.persona || '',
    userFlow: s.userFlow || '',
    additionalNotes: s.additionalNotes || '',
    courseTitle: s.courseTitle || 'UI/UX Design Studio Apprenticeship',
    unitTitle: s.unitTitle || 'Unit 4: High-Fidelity Prototyping',
    reviewer: s.reviewer || 'Rohan Mehta'
  };
}

export function toBackendSubmission(f) {
  if (!f) return {};
  const artifacts = f.artifacts || {};

  const researchParts = [
    artifacts.prototypeOverview,
    artifacts.interviewSurprises,
    artifacts.autoLayoutNotes,
    artifacts.motionType,
    artifacts.interactiveState
  ].filter(Boolean);

  const payload = {};
  const figma = f.figmaUrl || artifacts.figmaUrl;
  if (figma) payload.figmaUrl = figma.trim();

  const figjam = f.figjamUrl || artifacts.figJamUrl || artifacts.figjamUrl;
  if (figjam) payload.figjamUrl = figjam.trim();

  const canva = f.canvaUrl || artifacts.canvaUrl;
  if (canva) payload.canvaUrl = canva.trim();

  const proto = f.prototypeUrl || artifacts.prototypeUrl;
  if (proto) payload.prototypeUrl = proto.trim();

  const notes = f.researchNotes || (researchParts.length > 0 ? researchParts.join('\n\n') : '');
  if (notes) payload.researchNotes = notes.trim();

  const persona = f.persona || artifacts.personaDoc;
  if (persona) payload.persona = persona.trim();

  const flow = f.userFlow || artifacts.userFlowDoc;
  if (flow) payload.userFlow = flow.trim();

  const additional = f.additionalNotes || (Array.isArray(f.completedRequirements) && f.completedRequirements.length > 0
    ? `Completed: ${f.completedRequirements.join(', ')}`
    : '');
  if (additional) payload.additionalNotes = additional.trim();

  return payload;
}

export function fromBackendRubric(r) {
  if (!r) return null;
  const id = r._id || r.id;
  const totalMarks = Number(r.totalMarks ?? 20);
  const totalWeightage = Number(r.totalWeightage ?? 100);

  return {
    ...r,
    id,
    _id: id,
    assignmentId: r.assignmentId?._id || r.assignmentId,
    totalMarks,
    maxScore: totalMarks,
    totalWeightage,
    status: r.status || 'PUBLISHED',
    criteria: Array.isArray(r.criteria)
      ? r.criteria.map((c, idx) => {
          const maxMarks = Number(c.maxMarks ?? c.marks ?? 5);
          const weightageVal = c.weightage !== undefined
            ? Number(c.weightage)
            : (c.weight ? Number(String(c.weight).replace('%', '')) : Math.round((maxMarks / totalMarks) * 100));
          const weight = `${weightageVal}%`;

          return {
            ...c,
            id: c._id || c.id || `crit-${idx + 1}`,
            _id: c._id || c.id || `crit-${idx + 1}`,
            name: c.name || c.criterionName || c.title || `Criterion ${idx + 1}`,
            title: c.name || c.criterionName || c.title || `Criterion ${idx + 1}`,
            description: c.description || '',
            maxMarks,
            marks: maxMarks,
            weightage: weightageVal,
            weight,
            checks: Array.isArray(c.checks) ? c.checks : [],
            descriptors: Array.isArray(c.descriptors) ? c.descriptors : []
          };
        })
      : []
  };
}

export function toBackendRubric(r) {
  if (!r) return {};
  const count = (r.criteria && r.criteria.length) || 1;
  const criteria = Array.isArray(r.criteria)
    ? r.criteria.map((c, idx) => {
        const weightage = c.weightage !== undefined
          ? Number(c.weightage)
          : (c.weight ? Number(String(c.weight).replace('%', '')) : Math.round(100 / count));
        const maxMarks = Number(c.maxMarks ?? c.marks ?? c.maximumMarks ?? 5);
        return {
          name: (c.name || c.criterionName || c.title || `Criterion ${idx + 1}`).trim(),
          description: (c.description || '').trim(),
          maxMarks,
          weightage,
          checks: Array.isArray(c.checks) ? c.checks : (c.requirements || [])
        };
      })
    : [];

  return { criteria };
}

export function mapBackendEvaluationStatus(status) {
  if (!status) return 'DRAFT';
  const s = String(status).toLowerCase();
  switch (s) {
    case 'approved':
      return 'FINALIZED';
    case 'ai_review_complete':
    case 'facilitator_review':
      return 'IN_REVIEW';
    case 'draft':
    default:
      return 'DRAFT';
  }
}

export function fromBackendEvaluation(raw, { forStudent = false } = {}) {
  if (!raw) return null;
  const e = raw?.data && typeof raw.data === 'object' && !Array.isArray(raw.data) && (raw.data._id || raw.data.id || raw.data.criteriaResults || raw.data.status) ? raw.data : raw;
  const id = e._id || e.id;
  const submissionId = e.submissionId?._id || e.submissionId;
  const assignmentId = e.assignmentId?._id || e.assignmentId;
  const studentId = e.studentId?._id || e.studentId;

  const isApproved = e.status === 'approved';
  // Final facilitator marks are the authorized score. Students only see approved final marks.
  const score = isApproved
    ? (e.finalMarks ?? e.facilitatorMarks ?? 0)
    : (forStudent ? 0 : (e.facilitatorMarks ?? e.aiSuggestedMarks ?? 0));

  const maxScore = Number(e.assignmentId?.totalMarks || 20);
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  const status = mapBackendEvaluationStatus(e.status);

  const criteriaBreakdown = Array.isArray(e.criteriaResults)
    ? e.criteriaResults.map((cr, idx) => ({
        id: cr.criterionId || cr._id || `crit-${idx + 1}`,
        title: cr.criterionName || `Criterion ${idx + 1}`,
        name: cr.criterionName || `Criterion ${idx + 1}`,
        score: cr.awardedMarks ?? 0,
        maxScore: cr.maxMarks ?? 5,
        status: cr.automatedStatus || 'PASS',
        feedback: cr.facilitatorComment || (forStudent ? '' : cr.automatedNotes) || '',
        evidence: {
          available: Boolean(cr.automatedNotes),
          component: cr.criterionName,
          observations: cr.automatedNotes ? [cr.automatedNotes] : []
        }
      }))
    : [];

  const feedbackSections = {
    generalFeedback: e.facilitatorComments || 'Well executed deliverable meeting project criteria.',
    facilitatorComments: e.facilitatorComments || 'Well executed deliverable meeting project criteria.',
    strengths: e.aiFeedback?.strengths?.join('\n') || 'Clear hierarchy and component structure.',
    growthAreas: e.aiFeedback?.improvements?.join('\n') || e.aiFeedback?.missingRequirements?.join('\n') || 'Review edge cases in responsive viewports.',
    whatWentWell: Array.isArray(e.aiFeedback?.strengths) && e.aiFeedback.strengths.length > 0
      ? e.aiFeedback.strengths
      : ['Clear deliverable structure and alignment with guidelines.'],
    whatNeedsImprovement: Array.isArray(e.aiFeedback?.improvements) && e.aiFeedback.improvements.length > 0
      ? e.aiFeedback.improvements
      : (Array.isArray(e.aiFeedback?.missingRequirements) && e.aiFeedback.missingRequirements.length > 0
          ? e.aiFeedback.missingRequirements
          : ['Continue refining component edge-case handling.']),
    whyItMatters: 'Consistency across states and screen sizes reinforces user trust and production readiness.',
    suggestedImprovements: Array.isArray(e.aiFeedback?.improvements) && e.aiFeedback.improvements.length > 0
      ? e.aiFeedback.improvements
      : ['Add explicit documentation for edge cases.']
  };

  const evaluatedDate = e.reviewedAt || e.updatedAt || e.createdAt;
  const evaluatedAtFormatted = evaluatedDate
    ? new Date(evaluatedDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Recently';

  const baseResult = {
    ...e,
    id,
    _id: id,
    submissionId,
    assignmentId,
    studentId,
    score,
    maxScore,
    totalScore: score,
    percentage,
    status: isApproved ? 'FINALIZED' : (forStudent ? 'IN_REVIEW' : status),
    evaluationStatus: isApproved ? 'FINALIZED' : (forStudent ? 'IN_REVIEW' : status),
    gradeBadge: percentage >= 85 ? 'Exemplary' : percentage >= 70 ? 'Proficient' : 'Competent',
    studentName: e.studentId?.name || 'Student',
    studentEmail: e.studentId?.email || '',
    assignmentTitle: e.assignmentId?.title || 'Studio Deliverable',
    unitTitle: 'Unit 4: High-Fidelity Prototyping',
    courseTitle: 'UI/UX Design Studio Apprenticeship',
    facilitator: {
      name: 'Rohan Mehta',
      role: 'Lead Facilitator',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    },
    criteriaBreakdown,
    criterionScores: (Array.isArray(e.criteriaResults) ? e.criteriaResults : []).reduce((acc, cr) => {
      acc[cr.criterionId || cr.criterionName] = cr.awardedMarks;
      return acc;
    }, {}),
    criterionFeedback: (Array.isArray(e.criteriaResults) ? e.criteriaResults : []).reduce((acc, cr) => {
      acc[cr.criterionId || cr.criterionName] = cr.facilitatorComment;
      return acc;
    }, {}),
    feedbackSections,
    generalFeedback: feedbackSections.generalFeedback,
    strengths: feedbackSections.strengths,
    growthAreas: feedbackSections.growthAreas,
    evaluatedAt: evaluatedAtFormatted,
    reviewedAt: e.reviewedAt,
  };

  // For students, never expose raw AI suggested marks or internal AI prompts
  if (!forStudent) {
    baseResult.aiSuggestedMarks = e.aiSuggestedMarks;
    baseResult.aiFeedback = e.aiFeedback;
  }

  return baseResult;
}

export function toBackendEvaluation(data = {}, linkedCriteria = [], totalMarks = 20, isFinal = false) {
  const status = isFinal ? 'approved' : 'draft';
  const finalMarks = Number(data.totalScore ?? data.score ?? data.finalMarks ?? data.facilitatorMarks ?? 0);

  let criteriaResults = [];
  const criteriaToMap = (Array.isArray(linkedCriteria) && linkedCriteria.length > 0)
    ? linkedCriteria
    : (Array.isArray(data.criteria) && data.criteria.length > 0 ? data.criteria : []);

  if (criteriaToMap.length > 0) {
    criteriaResults = criteriaToMap.map((crit, idx) => {
      const critId = crit._id || crit.id || `crit-${idx + 1}`;
      const awarded = data.criterionScores?.[critId] !== undefined
        ? Number(data.criterionScores[critId])
        : Number(data.criterionScores?.[crit.name] ?? (crit.maxMarks || crit.marks || 5));
      const comment = data.criterionFeedback?.[critId] || data.criterionFeedback?.[crit.name] || '';
      const maxMarks = Number(crit.maxMarks ?? crit.marks ?? 5);
      const weightage = crit.weightage !== undefined
        ? Number(crit.weightage)
        : (crit.weight ? Number(String(crit.weight).replace('%', '')) : Math.round(100 / criteriaToMap.length));

      const resObj = {
        criterionName: crit.name || crit.title || `Criterion ${idx + 1}`,
        description: crit.description || '',
        maxMarks,
        awardedMarks: Number.isFinite(awarded) && awarded >= 0 ? awarded : 0,
        weightage,
        facilitatorComment: comment,
      };
      if (crit._id && String(crit._id).length === 24) {
        resObj.criterionId = crit._id;
      }
      return resObj;
    });
  } else if (data.criterionScores && Object.keys(data.criterionScores).length > 0) {
    criteriaResults = Object.entries(data.criterionScores).map(([key, score], idx) => ({
      criterionName: `Criterion ${idx + 1}`,
      maxMarks: 5,
      awardedMarks: Number(score) || 0,
      weightage: Math.round(100 / Object.keys(data.criterionScores).length),
      facilitatorComment: data.criterionFeedback?.[key] || ''
    }));
  }

  const comments = [
    data.generalFeedback,
    data.strengths ? `Strengths: ${data.strengths}` : '',
    data.growthAreas ? `Growth Areas: ${data.growthAreas}` : ''
  ].filter(Boolean).join('\n\n');

  const payload = {
    status,
    facilitatorMarks: finalMarks,
    finalMarks: isFinal ? finalMarks : undefined,
    facilitatorComments: comments || data.facilitatorComments || '',
    criteriaResults: criteriaResults.length > 0 ? criteriaResults : undefined,
  };

  if (data.aiSuggestedMarks !== undefined) {
    payload.aiSuggestedMarks = Number(data.aiSuggestedMarks);
  }
  if (data.aiFeedback) {
    payload.aiFeedback = data.aiFeedback;
  }

  return payload;
}

/**
 * Adapter helper: Executes an API call and gracefully falls back to local storage/mock data
 * ONLY if the backend is unreachable/offline or endpoints are pending.
 * Real backend business errors (400, 401, 403, 409, 422, 500) are thrown so the UI shows the error!
 */
async function withFacilitatorFallback(apiCall, mockCall, endpointName = 'Endpoint') {
  try {
    const result = await apiCall();
    if (result !== undefined) {
      return result && typeof result === 'object' && 'data' in result && result.config ? result.data : result;
    }
  } catch (error) {
    const isNetworkOrOffline = !error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED' || error.code === 'ECONNREFUSED';
    const isPendingBackend = error.response?.status === 404 || error.response?.status === 501;

    if (isNetworkOrOffline || isPendingBackend) {
      return await mockCall();
    }

    console.warn(`[Facilitator API] ${endpointName} error ${error.response?.status}:`, error.message);
    throw error;
  }
  return await mockCall();
}

/**
 * Authentication with Fallback Helper
 */
function isNetworkError(error) {
  return !error?.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED' || error.code === 'ECONNREFUSED';
}

async function withFallbackAuth(apiCall, mockCall, opName) {
  try {
    const response = await apiCall();
    if (response?.data) return response.data;
  } catch (error) {
    if (!isNetworkError(error)) {
      throw error;
    }
    console.warn(`[Facilitator Auth] ${opName} backend unavailable. Initializing authenticated demo persona.`);
    return mockCall();
  }
  return mockCall();
}

export const facilitatorApi = {
  // =========================================================================
  // 1. AUTHENTICATION & PROFILE
  // =========================================================================
  login: async (email, password) => {
    return withFallbackAuth(
      () => apiClient.post('/auth/login', { email, password }),
      () => {
        const activeUser = {
          ...mockFacilitatorUser,
          email: email || mockFacilitatorUser.email
        };
        localStorage.setItem('barabari_facilitator_token', 'demo-token-rohan-2026');
        localStorage.setItem('barabari_facilitator_user', JSON.stringify(activeUser));
        return { user: activeUser, token: 'demo-token-rohan-2026' };
      },
      'Facilitator Login'
    );
  },

  getProfile: async () => {
    return withFacilitatorFallback(
      () => apiClient.get('/auth/me'),
      () => {
        const settings = getFacilitatorSettings();
        return settings.profile || mockFacilitatorUser;
      },
      'Get Facilitator Profile'
    );
  },

  updateProfile: async (profileData) => {
    return withFacilitatorFallback(
      () => apiClient.put('/facilitator/profile', profileData),
      () => {
        const settings = getFacilitatorSettings();
        const updatedSettings = {
          ...settings,
          profile: {
            ...settings.profile,
            ...profileData
          }
        };
        saveFacilitatorSettings(updatedSettings);
        return updatedSettings.profile;
      },
      'Update Facilitator Profile'
    );
  },

  // =========================================================================
  // 2. ASSIGNMENTS (Real backend: /api/assignments)
  // =========================================================================
  getAssignments: async () => {
    if (isDemoSession()) {
      return getFacilitatorAssignments();
    }
    return withFacilitatorFallback(
      async () => {
        const res = await apiClient.get('/assignments', { role: 'facilitator' });
        const list = Array.isArray(res.data) ? res.data : [];
        return list.map(fromBackendAssignment);
      },
      () => getFacilitatorAssignments(),
      'Get Facilitator Assignments'
    );
  },

  getAssignment: async (assignmentId) => {
    if (!isValidMongoId(assignmentId)) {
      const assignments = getFacilitatorAssignments();
      return assignments.find(a => a.id === assignmentId) || null;
    }
    return withFacilitatorFallback(
      async () => {
        const res = await apiClient.get(`/assignments/${assignmentId}`, { role: 'facilitator' });
        return fromBackendAssignment(res.data);
      },
      () => {
        const assignments = getFacilitatorAssignments();
        return assignments.find(a => a.id === assignmentId) || null;
      },
      'Get Assignment by ID'
    );
  },

  createAssignment: async (assignmentData) => {
    return withFacilitatorFallback(
      async () => {
        const payload = toBackendAssignment(assignmentData);
        const res = await apiClient.post('/assignments', payload, { role: 'facilitator' });
        return fromBackendAssignment(res.data);
      },
      () => mockCreateAssignment(assignmentData),
      'Create Assignment'
    );
  },

  updateAssignment: async (id, assignmentData) => {
    if (!isValidMongoId(id)) {
      return mockUpdateAssignment(id, assignmentData);
    }
    return withFacilitatorFallback(
      async () => {
        const payload = toBackendAssignment(assignmentData);
        const res = await apiClient.put(`/assignments/${id}`, payload, { role: 'facilitator' });
        return fromBackendAssignment(res.data);
      },
      () => mockUpdateAssignment(id, assignmentData),
      'Update Assignment'
    );
  },

  saveAssignment: async (assignmentData) => {
    if (assignmentData.id && !assignmentData.id.startsWith('temp-')) {
      return facilitatorApi.updateAssignment(assignmentData.id, assignmentData);
    }
    return facilitatorApi.createAssignment(assignmentData);
  },

  toggleAssignmentStatus: async (assignmentId, nextStatus) => {
    if (!isValidMongoId(assignmentId)) {
      return mockToggleAssignmentStatus(assignmentId, nextStatus);
    }
    return withFacilitatorFallback(
      async () => {
        const res = await apiClient.put(`/assignments/${assignmentId}`, {
          status: mapFrontendStatusToBackend(nextStatus)
        }, { role: 'facilitator' });
        return fromBackendAssignment(res.data);
      },
      () => mockToggleAssignmentStatus(assignmentId, nextStatus),
      'Toggle Assignment Status'
    );
  },

  deleteAssignment: async (assignmentId) => {
    if (!isValidMongoId(assignmentId)) {
      return mockDeleteAssignment(assignmentId);
    }
    return withFacilitatorFallback(
      () => apiClient.delete(`/assignments/${assignmentId}`, { role: 'facilitator' }),
      () => mockDeleteAssignment(assignmentId),
      'Delete Assignment'
    );
  },

  getCourses: async () => {
    return withFacilitatorFallback(
      () => apiClient.get('/courses'),
      () => mockFacilitatorCourses,
      'Get Courses'
    );
  },

  // =========================================================================
  // 3. RUBRICS (Real backend: /api/assignments/:assignmentId/rubric)
  // =========================================================================
  getRubrics: async () => {
    if (isDemoSession()) {
      return getFacilitatorRubrics();
    }
    return withFacilitatorFallback(
      async () => {
        const asgRes = await apiClient.get('/assignments', { role: 'facilitator' });
        const assignments = Array.isArray(asgRes.data) ? asgRes.data : [];
        if (assignments.length === 0) return [];

        const rubrics = await Promise.all(
          assignments.map(async (asg) => {
            const asgId = asg._id || asg.id;
            if (!isValidMongoId(asgId)) return null;
            try {
              const rRes = await apiClient.get(`/assignments/${asgId}/rubric`, { role: 'facilitator' });
              return fromBackendRubric({ ...rRes.data, assignmentId: asg });
            } catch {
              return null;
            }
          })
        );
        const valid = rubrics.filter(Boolean);
        return valid.length > 0 ? valid : getFacilitatorRubrics();
      },
      () => getFacilitatorRubrics(),
      'Get Facilitator Rubrics'
    );
  },

  getRubric: async (rubricOrAssignmentId) => {
    if (!isValidMongoId(rubricOrAssignmentId)) {
      const rubrics = getFacilitatorRubrics();
      return rubrics.find(r => r.id === rubricOrAssignmentId || r.assignmentId === rubricOrAssignmentId) || null;
    }
    return withFacilitatorFallback(
      async () => {
        const res = await apiClient.get(`/assignments/${rubricOrAssignmentId}/rubric`, { role: 'facilitator' });
        return fromBackendRubric(res.data);
      },
      () => {
        const rubrics = getFacilitatorRubrics();
        return rubrics.find(r => r.id === rubricOrAssignmentId || r.assignmentId === rubricOrAssignmentId) || null;
      },
      'Get Rubric by ID'
    );
  },

  createRubric: async (rubricData) => {
    const asgId = rubricData.assignmentId;
    if (!isValidMongoId(asgId)) {
      return mockCreateRubric(rubricData);
    }
    return withFacilitatorFallback(
      async () => {
        const payload = toBackendRubric(rubricData);
        const asgId = rubricData.assignmentId;
        const res = await apiClient.post(`/assignments/${asgId}/rubric`, payload, { role: 'facilitator' });
        return fromBackendRubric(res.data);
      },
      () => mockCreateRubric(rubricData),
      'Create Rubric'
    );
  },

  updateRubric: async (id, rubricData) => {
    const asgId = rubricData.assignmentId || id;
    if (!isValidMongoId(asgId)) {
      return mockUpdateRubric(id, rubricData);
    }
    return withFacilitatorFallback(
      async () => {
        const payload = toBackendRubric(rubricData);
        const asgId = rubricData.assignmentId || id;
        const res = await apiClient.put(`/assignments/${asgId}/rubric`, payload, { role: 'facilitator' });
        return fromBackendRubric(res.data);
      },
      () => mockUpdateRubric(id, rubricData),
      'Update Rubric'
    );
  },

  saveRubric: async (rubricData) => {
    if (rubricData.id && !rubricData.id.startsWith('temp-')) {
      return facilitatorApi.updateRubric(rubricData.id, rubricData);
    }
    return facilitatorApi.createRubric(rubricData);
  },

  toggleRubricStatus: async (rubricId, nextStatus) => {
    if (!isValidMongoId(rubricId)) {
      return mockToggleRubricStatus(rubricId, nextStatus);
    }
    return withFacilitatorFallback(
      () => apiClient.patch(`/assignments/${rubricId}/rubric/status`, { status: nextStatus }, { role: 'facilitator' }),
      () => mockToggleRubricStatus(rubricId, nextStatus),
      'Toggle Rubric Status'
    );
  },

  deleteRubric: async (rubricOrAssignmentId) => {
    if (!isValidMongoId(rubricOrAssignmentId)) {
      return mockDeleteRubric(rubricOrAssignmentId);
    }
    return withFacilitatorFallback(
      () => apiClient.delete(`/assignments/${rubricOrAssignmentId}/rubric`, { role: 'facilitator' }),
      () => mockDeleteRubric(rubricOrAssignmentId),
      'Delete Rubric'
    );
  },

  // =========================================================================
  // 4. SUBMISSIONS & GRADING QUEUE (Backend: /api/assignments/:id/submissions, /api/submissions/:id)
  // =========================================================================
  getSubmissions: async (params = {}) => {
    if (isDemoSession()) {
      let subs = getFacilitatorSubmissions();
      if (params.assignmentId && params.assignmentId !== 'ALL') {
        subs = subs.filter(s => s.assignmentId === params.assignmentId);
      }
      if (params.status && params.status !== 'ALL') {
        subs = subs.filter(s => s.evaluationStatus === params.status);
      }
      return subs;
    }

    if (params.assignmentId && params.assignmentId !== 'ALL' && !isValidMongoId(params.assignmentId)) {
      return [];
    }

    return withFacilitatorFallback(
      async () => {
        // Direct assignment query
        if (params.assignmentId && params.assignmentId !== 'ALL') {
          const res = await apiClient.get(`/assignments/${params.assignmentId}/submissions`, { role: 'facilitator' });
          const list = Array.isArray(res.data) ? res.data : [];
          return list.map(fromBackendSubmission);
        }

        // Global aggregation: retrieve facilitator's assignments then their submissions
        const asgRes = await apiClient.get('/assignments', { role: 'facilitator' });
        const assignments = Array.isArray(asgRes.data) ? asgRes.data : [];
        if (assignments.length === 0) return [];

        const batches = await Promise.all(
          assignments.map(async (asg) => {
            const asgId = asg._id || asg.id;
            if (!isValidMongoId(asgId)) return [];
            try {
              const res = await apiClient.get(`/assignments/${asgId}/submissions`, { role: 'facilitator' });
              const list = Array.isArray(res.data) ? res.data : [];
              return list.map(s => fromBackendSubmission({ ...s, assignmentId: asg }));
            } catch {
              return [];
            }
          })
        );
        const flattened = batches.flat();
        if (params.status && params.status !== 'ALL') {
          return flattened.filter(s => s.evaluationStatus === params.status);
        }
        return flattened;
      },
      () => {
        let subs = getFacilitatorSubmissions();
        if (params.assignmentId && params.assignmentId !== 'ALL') {
          subs = subs.filter(s => s.assignmentId === params.assignmentId);
        }
        if (params.status && params.status !== 'ALL') {
          subs = subs.filter(s => s.evaluationStatus === params.status);
        }
        return subs;
      },
      'Get Facilitator Submissions'
    );
  },

  getSubmission: async (submissionId) => {
    if (!isValidMongoId(submissionId)) {
      const subs = getFacilitatorSubmissions();
      return subs.find(s => s.id === submissionId) || null;
    }
    return withFacilitatorFallback(
      async () => {
        const res = await apiClient.get(`/submissions/${submissionId}`, { role: 'facilitator' });
        return fromBackendSubmission(res.data);
      },
      () => {
        const subs = getFacilitatorSubmissions();
        return subs.find(s => s.id === submissionId) || null;
      },
      'Get Submission by ID'
    );
  },

  returnSubmission: async (submissionId, reason) => {
    if (!isValidMongoId(submissionId)) {
      return mockReturnSubmission(submissionId, reason);
    }
    return withFacilitatorFallback(
      () => apiClient.post(`/submissions/${submissionId}/return`, { reason }, { role: 'facilitator' }),
      () => mockReturnSubmission(submissionId, reason),
      'Return Submission for Revision'
    );
  },

  // =========================================================================
  // 5. EVALUATIONS (Real backend: POST /submissions/:id/ai-draft, POST /submissions/:id/evaluation, GET /submissions/:id/evaluation, PUT /evaluations/:id)
  // =========================================================================
  generateAiDraft: async (submissionId) => {
    if (!isValidMongoId(submissionId)) {
      return {
        aiSuggestedMarks: 17,
        score: 17,
        aiFeedback: {
          strengths: [
            'Clear interactive workflow with proper Figma layout hierarchy',
            'Thorough mapping of user decision paths and interaction branches',
            'Strong visual hierarchy and consistent spacing'
          ],
          missingRequirements: [
            'Further explore edge cases and accessibility contrast ratios (WCAG AAA)'
          ],
          improvements: [
            'Include annotated states for hover, error, and empty views in primary wireframes'
          ],
          criterionObservations: []
        },
        criteriaBreakdown: []
      };
    }
    return withFacilitatorFallback(
      async () => {
        const res = await apiClient.post(`/submissions/${submissionId}/ai-draft`, {}, { role: 'facilitator' });
        return fromBackendEvaluation(res.data);
      },
      () => {
        return {
          aiSuggestedMarks: 17,
          score: 17,
          aiFeedback: {
            strengths: [
              'Clear interactive workflow with proper Figma layout hierarchy',
              'Thorough mapping of user decision paths and interaction branches',
              'Strong visual hierarchy and consistent spacing'
            ],
            missingRequirements: [
              'Further explore edge cases and accessibility contrast ratios (WCAG AAA)'
            ],
            improvements: [
              'Include annotated states for hover, error, and empty views in primary wireframes'
            ],
            criterionObservations: []
          },
          criteriaBreakdown: []
        };
      },
      'Generate AI Advisory Pre-Review'
    );
  },

  getSubmissionEvaluation: async (submissionId) => {
    if (!isValidMongoId(submissionId)) {
      const evals = getFacilitatorEvaluations();
      return evals.find(e => e.submissionId === submissionId) || null;
    }
    return withFacilitatorFallback(
      async () => {
        const res = await apiClient.get(`/submissions/${submissionId}/evaluation`, { role: 'facilitator' });
        return fromBackendEvaluation(res.data);
      },
      () => {
        const evals = getFacilitatorEvaluations();
        return evals.find(e => e.submissionId === submissionId) || null;
      },
      'Get Submission Evaluation'
    );
  },

  saveEvaluationDraft: async (submissionId, draftData = {}) => {
    if (!isValidMongoId(submissionId)) {
      const submissions = getFacilitatorSubmissions();
      const index = submissions.findIndex(s => s.id === submissionId);
      if (index === -1) return null;
      const updated = {
        ...submissions[index],
        evaluationStatus: 'IN_REVIEW',
        evaluation: {
          ...(submissions[index].evaluation || {}),
          ...draftData,
          status: 'IN_REVIEW'
        }
      };
      submissions[index] = updated;
      saveFacilitatorSubmissions(submissions);
      return updated;
    }
    return withFacilitatorFallback(
      async () => {
        let existingId = null;
        try {
          const checkRes = await apiClient.get(`/submissions/${submissionId}/evaluation`, { role: 'facilitator' });
          if (checkRes.data?._id || checkRes.data?.id) {
            existingId = checkRes.data._id || checkRes.data.id;
          }
        } catch {
          existingId = null;
        }

        let criteria = draftData.criteria || [];
        if (criteria.length === 0) {
          try {
            const checkSub = await apiClient.get(`/submissions/${submissionId}`, { role: 'facilitator' });
            const asgId = checkSub.data?.assignmentId?._id || checkSub.data?.assignmentId;
            if (asgId && isValidMongoId(asgId)) {
              const rRes = await apiClient.get(`/assignments/${asgId}/rubric`, { role: 'facilitator' });
              if (rRes.data?.criteria) criteria = rRes.data.criteria;
            }
          } catch {}
        }
        const payload = toBackendEvaluation(draftData, criteria, draftData.maxScore || 20, false);

        let res;
        if (existingId) {
          res = await apiClient.put(`/evaluations/${existingId}`, payload, { role: 'facilitator' });
        } else {
          try {
            res = await apiClient.post(`/submissions/${submissionId}/evaluation`, payload, { role: 'facilitator' });
          } catch (postErr) {
            if (postErr.response?.status === 409) {
              const fetchRes = await apiClient.get(`/submissions/${submissionId}/evaluation`, { role: 'facilitator' });
              const foundId = fetchRes.data?._id || fetchRes.data?.id;
              res = await apiClient.put(`/evaluations/${foundId}`, payload, { role: 'facilitator' });
            } else {
              throw postErr;
            }
          }
        }
        return fromBackendEvaluation(res.data);
      },
      () => {
        const submissions = getFacilitatorSubmissions();
        const index = submissions.findIndex(s => s.id === submissionId);
        if (index === -1) return null;
        const updated = {
          ...submissions[index],
          evaluationStatus: 'IN_REVIEW',
          evaluation: {
            ...(submissions[index].evaluation || {}),
            ...draftData,
            status: 'IN_REVIEW'
          }
        };
        submissions[index] = updated;
        saveFacilitatorSubmissions(submissions);
        return updated;
      },
      'Save Evaluation Draft'
    );
  },

  finalizeEvaluation: async (submissionId, evaluationData = {}) => {
    if (!isValidMongoId(submissionId)) {
      return mockFinalizeEvaluation(submissionId, evaluationData);
    }
    return withFacilitatorFallback(
      async () => {
        let existingId = null;
        try {
          const checkRes = await apiClient.get(`/submissions/${submissionId}/evaluation`, { role: 'facilitator' });
          if (checkRes.data?._id || checkRes.data?.id) {
            existingId = checkRes.data._id || checkRes.data.id;
          }
        } catch {
          existingId = null;
        }

        let criteria = evaluationData.criteria || [];
        if (criteria.length === 0) {
          try {
            const checkSub = await apiClient.get(`/submissions/${submissionId}`, { role: 'facilitator' });
            const asgId = checkSub.data?.assignmentId?._id || checkSub.data?.assignmentId;
            if (asgId && isValidMongoId(asgId)) {
              const rRes = await apiClient.get(`/assignments/${asgId}/rubric`, { role: 'facilitator' });
              if (rRes.data?.criteria) criteria = rRes.data.criteria;
            }
          } catch {}
        }
        const payload = toBackendEvaluation(evaluationData, criteria, evaluationData.maxScore || 20, true);

        let res;
        if (existingId) {
          res = await apiClient.put(`/evaluations/${existingId}`, payload, { role: 'facilitator' });
        } else {
          try {
            res = await apiClient.post(`/submissions/${submissionId}/evaluation`, payload, { role: 'facilitator' });
          } catch (postErr) {
            if (postErr.response?.status === 409) {
              const fetchRes = await apiClient.get(`/submissions/${submissionId}/evaluation`, { role: 'facilitator' });
              const foundId = fetchRes.data?._id || fetchRes.data?.id;
              res = await apiClient.put(`/evaluations/${foundId}`, payload, { role: 'facilitator' });
            } else {
              throw postErr;
            }
          }
        }
        return fromBackendEvaluation(res.data);
      },
      () => mockFinalizeEvaluation(submissionId, evaluationData),
      'Finalize Evaluation'
    );
  },

  getEvaluations: async (params = {}) => {
    if (isDemoSession()) {
      let evals = getFacilitatorEvaluations();
      if (params.assignmentId && params.assignmentId !== 'ALL') {
        evals = evals.filter(e => e.assignmentId === params.assignmentId);
      }
      if (params.status && params.status !== 'ALL') {
        evals = evals.filter(e => e.status === params.status);
      }
      return evals;
    }
    return withFacilitatorFallback(
      async () => {
        const asgRes = await apiClient.get('/assignments', { role: 'facilitator' });
        const assignments = Array.isArray(asgRes.data) ? asgRes.data : [];
        if (assignments.length === 0) return [];

        const evalsList = [];
        for (const asg of assignments) {
          const asgId = asg._id || asg.id;
          if (!isValidMongoId(asgId)) continue;
          try {
            const subRes = await apiClient.get(`/assignments/${asgId}/submissions`, { role: 'facilitator' });
            const subs = Array.isArray(subRes.data) ? subRes.data : [];
            for (const sub of subs) {
              const subId = sub._id || sub.id;
              if (!isValidMongoId(subId)) continue;
              try {
                const evRes = await apiClient.get(`/submissions/${subId}/evaluation`, { role: 'facilitator' });
                if (evRes.data) {
                  evalsList.push(fromBackendEvaluation({
                    ...evRes.data,
                    assignmentId: asg,
                    studentId: sub.studentId
                  }));
                }
              } catch {
                // Evaluation does not exist yet for this submission
              }
            }
          } catch {
            // Submissions query error
          }
        }

        if (evalsList.length === 0) {
          return getFacilitatorEvaluations();
        }

        let evals = evalsList;
        if (params.assignmentId && params.assignmentId !== 'ALL') {
          evals = evals.filter(e => e.assignmentId === params.assignmentId);
        }
        if (params.status && params.status !== 'ALL') {
          evals = evals.filter(e => e.status === params.status);
        }
        return evals;
      },
      () => {
        let evals = getFacilitatorEvaluations();
        if (params.assignmentId && params.assignmentId !== 'ALL') {
          evals = evals.filter(e => e.assignmentId === params.assignmentId);
        }
        if (params.status && params.status !== 'ALL') {
          evals = evals.filter(e => e.status === params.status);
        }
        return evals;
      },
      'Get Facilitator Evaluations'
    );
  },

  getEvaluation: async (evaluationId) => {
    if (!isValidMongoId(evaluationId)) {
      return mockGetEvaluationById(evaluationId);
    }
    return withFacilitatorFallback(
      async () => {
        const res = await apiClient.get(`/submissions/${evaluationId}/evaluation`, { role: 'facilitator' });
        return fromBackendEvaluation(res.data);
      },
      () => mockGetEvaluationById(evaluationId),
      'Get Evaluation by ID'
    );
  },

  updateEvaluation: async (id, updates) => {
    if (!isValidMongoId(id)) {
      return mockGetEvaluationById(id);
    }
    return withFacilitatorFallback(
      async () => {
        const res = await apiClient.put(`/evaluations/${id}`, updates, { role: 'facilitator' });
        return fromBackendEvaluation(res.data);
      },
      () => mockGetEvaluationById(id),
      'Update Evaluation'
    );
  },

  // Re-evaluation routes are not implemented on the backend; preserving mock fallback as required
  getReEvaluationRequests: async () => {
    return withFacilitatorFallback(
      async () => {
        const res = await apiClient.get('/re-evaluations', { role: 'facilitator' });
        return res.data;
      },
      () => mockGetReEvaluationRequests(),
      'Get Re-Evaluation Requests'
    );
  },

  approveReEvaluation: async (evaluationId, facilitatorNotes = '') => {
    if (!isValidMongoId(evaluationId)) {
      return mockApproveReEvaluation(evaluationId, facilitatorNotes);
    }
    return withFacilitatorFallback(
      async () => {
        const res = await apiClient.post(`/re-evaluations/${evaluationId}/approve`, { facilitatorNotes }, { role: 'facilitator' });
        return res.data;
      },
      () => mockApproveReEvaluation(evaluationId, facilitatorNotes),
      'Approve Re-Evaluation'
    );
  },

  rejectReEvaluation: async (evaluationId, declineReason) => {
    if (!isValidMongoId(evaluationId)) {
      return mockRejectReEvaluation(evaluationId, declineReason);
    }
    return withFacilitatorFallback(
      async () => {
        const res = await apiClient.post(`/re-evaluations/${evaluationId}/reject`, { declineReason }, { role: 'facilitator' });
        return res.data;
      },
      () => mockRejectReEvaluation(evaluationId, declineReason),
      'Reject Re-Evaluation'
    );
  },

  finalizeReEvaluation: async (evaluationId, resolutionData) => {
    if (!isValidMongoId(evaluationId)) {
      return mockFinalizeReEvaluation(evaluationId, resolutionData);
    }
    return withFacilitatorFallback(
      async () => {
        const res = await apiClient.post(`/re-evaluations/${evaluationId}/finalize`, resolutionData, { role: 'facilitator' });
        return res.data;
      },
      () => mockFinalizeReEvaluation(evaluationId, resolutionData),
      'Finalize Re-Evaluation'
    );
  },

  // =========================================================================
  // 6. BATCH EVALUATION ASSISTANT
  // =========================================================================
  getBatches: async () => {
    return withFacilitatorFallback(
      () => apiClient.get('/facilitator/batches'),
      () => getFacilitatorBatches(),
      'Get Batch Runs'
    );
  },

  createBatch: async (batchData) => {
    return withFacilitatorFallback(
      () => apiClient.post('/facilitator/batches', batchData),
      () => mockCreateFacilitatorBatch(batchData),
      'Create Batch Run'
    );
  },

  updateBatch: async (batchId, updates) => {
    return withFacilitatorFallback(
      () => apiClient.put(`/facilitator/batches/${batchId}`, updates),
      () => mockUpdateFacilitatorBatch(batchId, updates),
      'Update Batch Run'
    );
  },

  // =========================================================================
  // 7. SETTINGS & PREFERENCES
  // =========================================================================
  getSettings: async () => {
    return withFacilitatorFallback(
      () => apiClient.get('/facilitator/settings'),
      () => getFacilitatorSettings(),
      'Get Facilitator Settings'
    );
  },

  saveSettings: async (settings) => {
    return withFacilitatorFallback(
      () => apiClient.put('/facilitator/settings', settings),
      () => {
        saveFacilitatorSettings(settings);
        return settings;
      },
      'Save Facilitator Settings'
    );
  },

  resetSettings: async () => {
    return withFacilitatorFallback(
      () => apiClient.post('/facilitator/settings/reset'),
      () => resetFacilitatorSettings(),
      'Reset Facilitator Settings'
    );
  }
};

export default facilitatorApi;
