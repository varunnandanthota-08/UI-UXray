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
  saveEvaluationDraft: (submissionId, draftData) => facilitatorApi.saveEvaluationDraft(submissionId, draftData),
  finalizeEvaluation: (submissionId, evaluationData) => facilitatorApi.finalizeEvaluation(submissionId, evaluationData),
  getReEvaluationRequests: () => facilitatorApi.getReEvaluationRequests(),
  approveReEvaluation: (evaluationId, notes) => facilitatorApi.approveReEvaluation(evaluationId, notes),
  rejectReEvaluation: (evaluationId, reason) => facilitatorApi.rejectReEvaluation(evaluationId, reason),
  finalizeReEvaluation: (evaluationId, resolutionData) => facilitatorApi.finalizeReEvaluation(evaluationId, resolutionData)
};

export default evaluationApi;
