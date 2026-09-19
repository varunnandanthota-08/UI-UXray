/**
 * Facilitator Submission API Service
 */
import { facilitatorApi } from './facilitatorApi';

export const submissionApi = {
  getSubmissions: (params) => facilitatorApi.getSubmissions(params),
  getSubmission: (id) => facilitatorApi.getSubmission(id),
  returnSubmission: (id, reason) => facilitatorApi.returnSubmission(id, reason)
};

export default submissionApi;
