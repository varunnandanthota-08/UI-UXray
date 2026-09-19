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
 * Adapter helper: Executes an API call and gracefully falls back to local storage/mock data
 * if the backend is offline, unreachable, or returns a 404/5xx during the hackathon/demo.
 */
async function withFacilitatorFallback(apiCall, mockCall, endpointName = 'Endpoint') {
  try {
    const response = await apiCall();
    if (response && response.data !== undefined) {
      return response.data;
    }
  } catch (error) {
    // In dev / demo mode, log diagnostic and fall back seamlessly to local mock store
    const isNetworkOrOffline = !error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED';
    const isPendingBackend = error.response?.status === 404 || error.response?.status === 501;

    if (isNetworkOrOffline || isPendingBackend) {
      // Graceful demo fallback
      return await mockCall();
    }
    
    // For genuine client validation errors (400, 422), propagate or fall back safely
    console.warn(`[Facilitator API] ${endpointName} returned ${error.response?.status}. Utilizing fallback adapter.`);
    return await mockCall();
  }
  return await mockCall();
}

/**
 * Authentication with Fallback Helper
 */
async function withFallbackAuth(apiCall, mockCall, opName) {
  try {
    const response = await apiCall();
    if (response?.data) return response.data;
  } catch (_error) {
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
      () => apiClient.post('/facilitator/auth/login', { email, password }),
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
      () => apiClient.get('/facilitator/profile'),
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
  // 2. ASSIGNMENTS
  // =========================================================================
  getAssignments: async () => {
    return withFacilitatorFallback(
      () => apiClient.get('/facilitator/assignments'),
      () => getFacilitatorAssignments(),
      'Get Facilitator Assignments'
    );
  },

  getAssignment: async (assignmentId) => {
    return withFacilitatorFallback(
      () => apiClient.get(`/facilitator/assignments/${assignmentId}`),
      () => {
        const assignments = getFacilitatorAssignments();
        return assignments.find(a => a.id === assignmentId) || null;
      },
      'Get Assignment by ID'
    );
  },

  createAssignment: async (assignmentData) => {
    return withFacilitatorFallback(
      () => apiClient.post('/facilitator/assignments', assignmentData),
      () => mockCreateAssignment(assignmentData),
      'Create Assignment'
    );
  },

  updateAssignment: async (id, assignmentData) => {
    return withFacilitatorFallback(
      () => apiClient.put(`/facilitator/assignments/${id}`, assignmentData),
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
    return withFacilitatorFallback(
      () => apiClient.patch(`/facilitator/assignments/${assignmentId}/status`, { status: nextStatus }),
      () => mockToggleAssignmentStatus(assignmentId, nextStatus),
      'Toggle Assignment Status'
    );
  },

  deleteAssignment: async (assignmentId) => {
    return withFacilitatorFallback(
      () => apiClient.delete(`/facilitator/assignments/${assignmentId}`),
      () => mockDeleteAssignment(assignmentId),
      'Delete Assignment'
    );
  },

  getCourses: async () => {
    return withFacilitatorFallback(
      () => apiClient.get('/facilitator/courses'),
      () => mockFacilitatorCourses,
      'Get Courses'
    );
  },

  // =========================================================================
  // 3. RUBRICS
  // =========================================================================
  getRubrics: async () => {
    return withFacilitatorFallback(
      () => apiClient.get('/facilitator/rubrics'),
      () => getFacilitatorRubrics(),
      'Get Facilitator Rubrics'
    );
  },

  getRubric: async (rubricId) => {
    return withFacilitatorFallback(
      () => apiClient.get(`/facilitator/rubrics/${rubricId}`),
      () => {
        const rubrics = getFacilitatorRubrics();
        return rubrics.find(r => r.id === rubricId) || null;
      },
      'Get Rubric by ID'
    );
  },

  createRubric: async (rubricData) => {
    return withFacilitatorFallback(
      () => apiClient.post('/facilitator/rubrics', rubricData),
      () => mockCreateRubric(rubricData),
      'Create Rubric'
    );
  },

  updateRubric: async (id, rubricData) => {
    return withFacilitatorFallback(
      () => apiClient.put(`/facilitator/rubrics/${id}`, rubricData),
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
    return withFacilitatorFallback(
      () => apiClient.patch(`/facilitator/rubrics/${rubricId}/status`, { status: nextStatus }),
      () => mockToggleRubricStatus(rubricId, nextStatus),
      'Toggle Rubric Status'
    );
  },

  deleteRubric: async (rubricId) => {
    return withFacilitatorFallback(
      () => apiClient.delete(`/facilitator/rubrics/${rubricId}`),
      () => mockDeleteRubric(rubricId),
      'Delete Rubric'
    );
  },

  // =========================================================================
  // 4. SUBMISSIONS & GRADING QUEUE
  // =========================================================================
  getSubmissions: async (params = {}) => {
    return withFacilitatorFallback(
      () => apiClient.get('/facilitator/submissions', { params }),
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
    return withFacilitatorFallback(
      () => apiClient.get(`/facilitator/submissions/${submissionId}`),
      () => {
        const subs = getFacilitatorSubmissions();
        return subs.find(s => s.id === submissionId) || null;
      },
      'Get Submission by ID'
    );
  },

  returnSubmission: async (submissionId, reason) => {
    return withFacilitatorFallback(
      () => apiClient.post(`/facilitator/submissions/${submissionId}/return`, { reason }),
      () => mockReturnSubmission(submissionId, reason),
      'Return Submission for Revision'
    );
  },

  // =========================================================================
  // 5. EVALUATIONS & RE-EVALUATIONS
  // =========================================================================
  getEvaluations: async (params = {}) => {
    return withFacilitatorFallback(
      () => apiClient.get('/facilitator/evaluations', { params }),
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
    return withFacilitatorFallback(
      () => apiClient.get(`/facilitator/evaluations/${evaluationId}`),
      () => mockGetEvaluationById(evaluationId),
      'Get Evaluation by ID'
    );
  },

  saveEvaluationDraft: async (submissionId, draftData) => {
    return withFacilitatorFallback(
      () => apiClient.post(`/facilitator/submissions/${submissionId}/draft`, draftData),
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

  finalizeEvaluation: async (submissionId, evaluationData) => {
    return withFacilitatorFallback(
      () => apiClient.post(`/facilitator/submissions/${submissionId}/evaluate`, evaluationData),
      () => mockFinalizeEvaluation(submissionId, evaluationData),
      'Finalize Evaluation'
    );
  },

  getReEvaluationRequests: async () => {
    return withFacilitatorFallback(
      () => apiClient.get('/facilitator/re-evaluations'),
      () => mockGetReEvaluationRequests(),
      'Get Re-Evaluation Requests'
    );
  },

  approveReEvaluation: async (evaluationId, facilitatorNotes = '') => {
    return withFacilitatorFallback(
      () => apiClient.post(`/facilitator/re-evaluations/${evaluationId}/approve`, { facilitatorNotes }),
      () => mockApproveReEvaluation(evaluationId, facilitatorNotes),
      'Approve Re-Evaluation'
    );
  },

  rejectReEvaluation: async (evaluationId, declineReason) => {
    return withFacilitatorFallback(
      () => apiClient.post(`/facilitator/re-evaluations/${evaluationId}/reject`, { declineReason }),
      () => mockRejectReEvaluation(evaluationId, declineReason),
      'Reject Re-Evaluation'
    );
  },

  finalizeReEvaluation: async (evaluationId, resolutionData) => {
    return withFacilitatorFallback(
      () => apiClient.post(`/facilitator/re-evaluations/${evaluationId}/finalize`, resolutionData),
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
