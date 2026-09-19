/**
 * Student API Service Layer
 * Connects directly to BE-1 Express/MongoDB REST endpoints with transparent
 * fallback to mockStudentService if backend is offline or endpoints are pending.
 */

import apiClient from './apiClient';
import mockStudentService from '../services/mockStudentApi';

// Helper to execute request with graceful fallback to mock data
async function withFallback(apiCall, mockCall) {
  try {
    const response = await apiCall();
    if (response && response.data) {
      return response.data;
    }
  } catch (_error) {
    // In hackathon / dev mode, if BE-1 is offline, connection refused, or endpoint not yet registered, gracefully fall back to mock service
    return await mockCall();
  }
  return await mockCall();
}

export const studentApi = {
  getStudentProfile: async () => {
    return withFallback(
      () => apiClient.get('/student/profile'),
      () => mockStudentService.getStudentProfile()
    );
  },

  getCourses: async () => {
    return withFallback(
      () => apiClient.get('/student/courses'),
      () => mockStudentService.getCourses()
    );
  },

  getCourse: async (courseId) => {
    return withFallback(
      () => apiClient.get(`/student/courses/${courseId}`),
      () => mockStudentService.getCourse(courseId)
    );
  },

  getUnit: async (unitId) => {
    return withFallback(
      () => apiClient.get(`/student/units/${unitId}`),
      () => mockStudentService.getUnit(unitId)
    );
  },

  getAssignment: async (assignmentId) => {
    return withFallback(
      () => apiClient.get(`/assignments/${assignmentId}`),
      () => mockStudentService.getAssignment(assignmentId)
    );
  },

  getAssignmentRubric: async (assignmentId) => {
    return withFallback(
      () => apiClient.get(`/assignments/${assignmentId}/rubric`),
      () => mockStudentService.getAssignmentRubric(assignmentId)
    );
  },

  getStudentAssignments: async () => {
    return withFallback(
      () => apiClient.get('/student/assignments'),
      () => mockStudentService.getStudentAssignments()
    );
  },

  submitAssignment: async (payload) => {
    return withFallback(
      () => apiClient.post('/submissions', payload),
      () => mockStudentService.submitAssignment(payload)
    );
  },

  getSubmission: async (submissionId) => {
    return withFallback(
      () => apiClient.get(`/submissions/${submissionId}`),
      () => mockStudentService.getSubmission(submissionId)
    );
  },

  getStudentSubmissions: async () => {
    return withFallback(
      () => apiClient.get('/student/submissions'),
      () => mockStudentService.getStudentSubmissions()
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
