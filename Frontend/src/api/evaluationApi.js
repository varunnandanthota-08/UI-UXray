/**
 * Facilitator Evaluation API Service
 * 
 * IMPORTANT:
 * AI assists with advisory feedback and criteria recommendations,
 * but final marks, comments, and publishing decisions are strictly
 * submitted by the human facilitator.
 */
import { facilitatorApi } from './facilitatorApi';

export const evaluationApi = {
  getEvaluations: (params) => facilitatorApi.getEvaluations(params),
  getEvaluation: (id) => facilitatorApi.getEvaluation(id),
  getSubmissionEvaluation: (submissionId) => facilitatorApi.getSubmissionEvaluation(submissionId),
  generateAiDraft: (submissionId) => facilitatorApi.generateAiDraft(submissionId),
  saveEvaluationDraft: (submissionId, draftData, criteria, maxScore) => facilitatorApi.saveEvaluationDraft(submissionId, draftData, criteria, maxScore),
  finalizeEvaluation: (submissionId, evaluationData, criteria, maxScore) => facilitatorApi.finalizeEvaluation(submissionId, evaluationData, criteria, maxScore),
  updateEvaluation: (id, updates) => facilitatorApi.updateEvaluation(id, updates),
  getReEvaluationRequests: () => facilitatorApi.getReEvaluationRequests(),
  approveReEvaluation: (evaluationId, notes) => facilitatorApi.approveReEvaluation(evaluationId, notes),
  rejectReEvaluation: (evaluationId, reason) => facilitatorApi.rejectReEvaluation(evaluationId, reason),
  finalizeReEvaluation: (evaluationId, resolutionData) => facilitatorApi.finalizeReEvaluation(evaluationId, resolutionData)
};

export default evaluationApi;
