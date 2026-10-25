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
    const isNetworkOrOffline = !error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED' || error.code === 'ECONNREFUSED';
    const isPendingBackend = error.response?.status === 404 || error.response?.status === 501;

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
      () => apiClient.get('/auth/me'),
      () => mockStudentService.getStudentProfile()
    );
  },

  // Course/Unit APIs are not in current backend; keeping on mock layer as required
  getCourses: async () => {
    return withFallback(
      () => apiClient.get('/courses'),
      () => mockStudentService.getCourses()
    );
  },

  getCourse: async (courseId) => {
    return withFallback(
      () => apiClient.get(`/courses/${courseId}`),
      () => mockStudentService.getCourse(courseId)
    );
  },

  getUnit: async (unitId) => {
    return withFallback(
      () => apiClient.get(`/units/${unitId}`),
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
    return withFallback(
      async () => {
        const assignmentId = payload.assignmentId;
        const bePayload = toBackendSubmission(payload);
        const res = await apiClient.post(`/assignments/${assignmentId}/submissions`, bePayload, { role: 'student' });
        return {
          success: true,
          data: fromBackendSubmission(res.data),
          message: 'Assignment submitted successfully.'
        };
      },
      () => mockStudentService.submitAssignment(payload)
    );
  },

  // Real Backend My Submission: GET /api/assignments/:assignmentId/my-submission
  getMySubmission: async (assignmentId) => {
    try {
      const res = await apiClient.get(`/assignments/${assignmentId}/my-submission`, { role: 'student' });
      return { success: true, data: fromBackendSubmission(res.data) };
    } catch (err) {
      if (err.response?.status === 404) {
        return { success: true, data: null };
      }
      const isNetwork = !err.response || err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED';
      if (isNetwork) {
        return { success: true, data: null };
      }
      throw err;
    }
  },

  // Real Backend Student History: GET /api/submissions/student/mine
  getStudentSubmissions: async () => {
    return withFallback(
      async () => {
        const res = await apiClient.get('/submissions/student/mine', { role: 'student' });
        const list = Array.isArray(res.data) ? res.data : [];
        return { success: true, data: list.map(fromBackendSubmission) };
      },
      () => mockStudentService.getStudentSubmissions()
    );
  },

  // Real Backend Submission Detail: GET /api/submissions/:id
  getSubmission: async (submissionId) => {
    return withFallback(
      async () => {
        const res = await apiClient.get(`/submissions/${submissionId}`, { role: 'student' });
        return { success: true, data: fromBackendSubmission(res.data) };
      },
      () => mockStudentService.getSubmission(submissionId)
    );
  },

  // Real Backend Submission Update: PUT /api/submissions/:id
  updateSubmission: async (submissionId, payload) => {
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
    return withFallback(
      () => apiClient.get(`/evaluations/${evaluationId}`),
      () => mockStudentService.getEvaluation(evaluationId)
    );
  },

  requestReEvaluation: async (payload) => {
    return withFallback(
      () => apiClient.post('/re-evaluations', payload),
      () => mockStudentService.requestReEvaluation(payload)
    );
  },

  getReEvaluation: async (evaluationId) => {
    return withFallback(
      () => apiClient.get(`/re-evaluations/${evaluationId}`),
      () => mockStudentService.getReEvaluation(evaluationId)
    );
  },

  updateStudentProfile: async (profileData) => {
    return withFallback(
      () => apiClient.put('/student/profile', profileData),
      () => mockStudentService.updateStudentProfile(profileData)
    );
  },

  saveDraft: async (assignmentId, draftData) => {
    return withFallback(
      () => apiClient.post(`/assignments/${assignmentId}/draft`, draftData),
      () => mockStudentService.saveDraft(assignmentId, draftData)
    );
  },

  getDraft: async (assignmentId) => {
    return withFallback(
      () => apiClient.get(`/assignments/${assignmentId}/draft`),
      () => mockStudentService.getDraft(assignmentId)
    );
  }
};

export default studentApi;
