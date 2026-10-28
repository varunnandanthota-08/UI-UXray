/**
 * Student API Service Layer
 * Connects directly to BE-1 Express/MongoDB REST endpoints with transparent
 * fallback to mockStudentService if backend is offline or endpoints are pending.
 */

import apiClient from './apiClient';
import mockStudentService from '../services/mockStudentApi';
import {
  fromBackendAssignment,
  toBackendSubmission,
  fromBackendSubmission,
  fromBackendRubric,
  fromBackendEvaluation
} from './facilitatorApi';

/**
 * Validates whether an identifier matches a 24-character hexadecimal MongoDB ObjectId.
 * Prevents sending mock identifiers (e.g. 'asg-4', 'eval-asg-3') to backend endpoints that
 * expect valid ObjectIds and reject them with HTTP 400.
 */
export function isValidMongoId(id) {
  return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id.trim());
}

/**
 * Shared status-resolution and CTA routing logic for student assignments/units.
 * Single source of truth across Dashboard, Unit Cards, Unit Overview,
 * Assignment Details, and Sidebar navigation.
 */
export function resolveAssignmentAction({
  assignmentId,
  submission,
  submissions = [],
  draft,
  hasDraft
}) {
  const sub = submission || (Array.isArray(submissions)
    ? submissions
        .filter((s) => s.assignmentId === assignmentId)
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0]
    : null);

  const genuineDraft = hasDraft !== undefined
    ? Boolean(hasDraft)
    : Boolean(draft && (draft.figmaUrl || draft.artifactValues));

  const isEvaluated = Boolean(
    sub &&
    (sub.status === 'PUBLISHED' || sub.status === 'APPROVED' || sub.evaluationStatus === 'FINALIZED') &&
    sub.evaluationId
  );

  const isSubmitted = Boolean(sub);

  if (isEvaluated) {
    return {
      label: 'View Evaluation',
      link: `/student/evaluations/${sub.evaluationId}`,
      state: 'PUBLISHED',
      badgeLabel: 'PUBLISHED',
      badgeVariant: 'success',
      isEvaluated: true,
      isSubmitted: true,
      hasDraft: false,
      submission: sub,
      evaluationId: sub.evaluationId
    };
  }

  if (isSubmitted) {
    const rawStatus = String(sub.status || 'SUBMITTED').toUpperCase();
    const isProcessing = rawStatus === 'PROCESSING';
    const isUnderReview = rawStatus === 'UNDER_REVIEW' || rawStatus === 'FACILITATOR_REVIEWED' || rawStatus === 'NEEDS_REVIEW';
    const displayStatus = isProcessing ? 'PROCESSING' : (isUnderReview ? 'UNDER REVIEW' : 'SUBMITTED');
    const badgeVariant = isProcessing ? 'yellow' : 'blue';

    return {
      label: 'View Submission',
      link: `/student/submissions/${sub.id}`,
      state: rawStatus,
      badgeLabel: displayStatus,
      badgeVariant,
      isEvaluated: false,
      isSubmitted: true,
      hasDraft: false,
      submission: sub,
      evaluationId: null
    };
  }

  if (genuineDraft) {
    return {
      label: 'Continue Submission',
      link: `/student/assignments/${assignmentId}/submit`,
      state: 'IN_PROGRESS',
      badgeLabel: 'IN PROGRESS',
      badgeVariant: 'warning',
      isEvaluated: false,
      isSubmitted: false,
      hasDraft: true,
      submission: null,
      evaluationId: null
    };
  }

  return {
    label: 'Submit Assignment',
    link: `/student/assignments/${assignmentId}/submit`,
    state: 'NOT_STARTED',
    badgeLabel: 'NOT STARTED',
    badgeVariant: 'neutral',
    isEvaluated: false,
    isSubmitted: false,
    hasDraft: false,
    submission: null,
    evaluationId: null
  };
}

// Helper to execute request with graceful fallback to mock data for offline/dev mode
async function withFallback(apiCall, mockCall) {
  try {
    const result = await apiCall();
    if (result !== undefined) {
      if (result && typeof result === 'object' && 'data' in result && !result.config) {
        return result;
      }
      return { success: true, data: result };
    }
  } catch (error) {
    const isNetworkOrOffline =
      !error.response ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      error.code === 'ECONNREFUSED';
    const isPendingBackend =
      error.response?.status === 404 ||
      error.response?.status === 501 ||
      error.response?.status === 503;

    if (isNetworkOrOffline || isPendingBackend) {
      return await mockCall();
    }

    console.warn('[Student API] Backend error:', error.response?.status, error.message);
    throw error;
  }
  return await mockCall();
}

export const studentApi = {
  getStudentProfile: async () => {
    return withFallback(
      () => apiClient.get('/auth/me', { role: 'student' }),
      () => mockStudentService.getStudentProfile()
    );
  },

  // Course/Unit APIs are not in current backend; keeping on mock layer as required
  getCourses: async () => {
    return withFallback(
      () => apiClient.get('/courses', { role: 'student' }),
      () => mockStudentService.getCourses()
    );
  },

  getCourse: async (courseId) => {
    return withFallback(
      () => apiClient.get(`/courses/${courseId}`, { role: 'student' }),
      () => mockStudentService.getCourse(courseId)
    );
  },

  getUnit: async (unitId) => {
    return withFallback(
      () => apiClient.get(`/units/${unitId}`, { role: 'student' }),
      () => mockStudentService.getUnit(unitId)
    );
  },

  // Real Backend Assignments: GET /api/assignments, GET /api/assignments/:id
  getStudentAssignments: async () => {
    return withFallback(
      async () => {
        const res = await apiClient.get('/assignments', { role: 'student' });
        const list = Array.isArray(res.data) ? res.data : [];
        return { success: true, data: list.map(fromBackendAssignment) };
      },
      () => mockStudentService.getStudentAssignments()
    );
  },

  getAssignment: async (assignmentId) => {
    if (!isValidMongoId(assignmentId)) {
      return mockStudentService.getAssignment(assignmentId);
    }
    return withFallback(
      async () => {
        const res = await apiClient.get(`/assignments/${assignmentId}`, { role: 'student' });
        return { success: true, data: fromBackendAssignment(res.data) };
      },
      () => mockStudentService.getAssignment(assignmentId)
    );
  },

  // Real Backend Rubric: GET /api/assignments/:assignmentId/rubric
  getAssignmentRubric: async (assignmentId) => {
    if (!isValidMongoId(assignmentId)) {
      return mockStudentService.getAssignmentRubric(assignmentId);
    }
    return withFallback(
      async () => {
        const res = await apiClient.get(`/assignments/${assignmentId}/rubric`, { role: 'student' });
        return { success: true, data: fromBackendRubric(res.data) };
      },
      () => mockStudentService.getAssignmentRubric(assignmentId)
    );
  },

  // Real Backend Submissions: POST /api/assignments/:assignmentId/submissions
  submitAssignment: async (payload) => {
    const assignmentId = payload?.assignmentId;
    if (!isValidMongoId(assignmentId)) {
      return mockStudentService.submitAssignment(payload);
    }
    return withFallback(
      async () => {
        const bePayload = toBackendSubmission(payload);
        const res = await apiClient.post(`/assignments/${assignmentId}/submissions`, bePayload, { role: 'student' });
        const data = res.data?.data !== undefined ? res.data.data : res.data;
        return {
          success: true,
          data: fromBackendSubmission(data),
          message: 'Assignment submitted successfully.'
        };
      },
      () => mockStudentService.submitAssignment(payload)
    );
  },

  // Real Backend My Submission: GET /api/assignments/:assignmentId/my-submission
  getMySubmission: async (assignmentId) => {
    if (!isValidMongoId(assignmentId)) {
      return mockStudentService.getMySubmission
        ? mockStudentService.getMySubmission(assignmentId)
        : { success: true, data: null };
    }
    try {
      const res = await apiClient.get(`/assignments/${assignmentId}/my-submission`, { role: 'student' });
      const data = res.data?.data !== undefined ? res.data.data : res.data;
      return { success: true, data: fromBackendSubmission(data) };
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 503) {
        if (mockStudentService.getMySubmission) {
          return mockStudentService.getMySubmission(assignmentId);
        }
        return { success: true, data: null };
      }
      const isNetwork = !err.response || err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED';
      if (isNetwork) {
        if (mockStudentService.getMySubmission) {
          return mockStudentService.getMySubmission(assignmentId);
        }
        return { success: true, data: null };
      }
      throw err;
    }
  },

  // Real Backend Student History: GET /api/submissions/student/mine
  getStudentSubmissions: async () => {
    const mockRes = await mockStudentService.getStudentSubmissions();
    const mockList = Array.isArray(mockRes?.data) ? mockRes.data : [];
    return withFallback(
      async () => {
        const res = await apiClient.get('/submissions/student/mine', { role: 'student' });
        const backendRaw = Array.isArray(res.data)
          ? res.data
          : (Array.isArray(res.data?.data) ? res.data.data : []);
        const backendList = backendRaw.map(fromBackendSubmission);

        // Merge backend submissions with mock storage submissions so mock submissions
        // (like asg-4, asg-3, asg-2) are preserved alongside real backend submissions.
        const merged = [...backendList];
        for (const mockItem of mockList) {
          const exists = merged.some(
            (b) => b.id === mockItem.id || (b.assignmentId === mockItem.assignmentId && (b.attempt || 1) === (mockItem.attempt || 1))
          );
          if (!exists) {
            merged.push(mockItem);
          }
        }
        return { success: true, data: merged };
      },
      () => Promise.resolve(mockRes)
    );
  },

  // Real Backend Submission Detail: GET /api/submissions/:id
  getSubmission: async (submissionId) => {
    if (!isValidMongoId(submissionId)) {
      return mockStudentService.getSubmission(submissionId);
    }
    return withFallback(
      async () => {
        const res = await apiClient.get(`/submissions/${submissionId}`, { role: 'student' });
        const data = res.data?.data !== undefined ? res.data.data : res.data;
        return { success: true, data: fromBackendSubmission(data) };
      },
      () => mockStudentService.getSubmission(submissionId)
    );
  },

  // Real Backend Submission Update: PUT /api/submissions/:id
  updateSubmission: async (submissionId, payload) => {
    if (!isValidMongoId(submissionId)) {
      return mockStudentService.updateSubmission
        ? mockStudentService.updateSubmission(submissionId, payload)
        : mockStudentService.getSubmission(submissionId);
    }
    return withFallback(
      async () => {
        const bePayload = toBackendSubmission(payload);
        const res = await apiClient.put(`/submissions/${submissionId}`, bePayload, { role: 'student' });
        return { success: true, data: fromBackendSubmission(res.data) };
      },
      () => mockStudentService.getSubmission(submissionId)
    );
  },

  getEvaluation: async (evaluationId) => {
    if (!isValidMongoId(evaluationId)) {
      return mockStudentService.getEvaluation(evaluationId);
    }
    return withFallback(
      async () => {
        const res = await apiClient.get(`/evaluations/${evaluationId}`, { role: 'student' });
        return { success: true, data: fromBackendEvaluation(res.data, { forStudent: true }) };
      },
      () => mockStudentService.getEvaluation(evaluationId)
    );
  },

  requestReEvaluation: async (payload) => {
    const evalId = payload?.evaluationId;
    if (!isValidMongoId(evalId)) {
      return mockStudentService.requestReEvaluation(payload);
    }
    return withFallback(
      async () => {
        const res = await apiClient.post('/re-evaluations', payload, { role: 'student' });
        return { success: true, data: res.data };
      },
      () => mockStudentService.requestReEvaluation(payload)
    );
  },

  getReEvaluation: async (evaluationId) => {
    if (!isValidMongoId(evaluationId)) {
      return mockStudentService.getReEvaluation(evaluationId);
    }
    return withFallback(
      async () => {
        try {
          const res = await apiClient.get(`/re-evaluations/${evaluationId}`, { role: 'student' });
          return { success: true, data: res.data };
        } catch (err) {
          if (err.response && (err.response.status === 404 || err.response.status === 503)) {
            return { success: true, data: null };
          }
          throw err;
        }
      },
      () => mockStudentService.getReEvaluation(evaluationId)
    );
  },

  updateStudentProfile: async (profileData) => {
    return withFallback(
      () => apiClient.put('/student/profile', profileData, { role: 'student' }),
      () => mockStudentService.updateStudentProfile(profileData)
    );
  },

  saveDraft: async (assignmentId, draftData) => {
    if (!isValidMongoId(assignmentId)) {
      return mockStudentService.saveDraft(assignmentId, draftData);
    }
    return withFallback(
      () => apiClient.post(`/assignments/${assignmentId}/draft`, draftData, { role: 'student' }),
      () => mockStudentService.saveDraft(assignmentId, draftData)
    );
  },

  getDraft: async (assignmentId) => {
    if (!isValidMongoId(assignmentId)) {
      return mockStudentService.getDraft(assignmentId);
    }
    return withFallback(
      () => apiClient.get(`/assignments/${assignmentId}/draft`, { role: 'student' }),
      () => mockStudentService.getDraft(assignmentId)
    );
  }
};

export default studentApi;
