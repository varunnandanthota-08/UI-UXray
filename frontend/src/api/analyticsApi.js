/**
 * Facilitator Analytics API Service
 * 
 * Aggregates assignment, submission, evaluation, and cohort performance metrics.
 */
import { facilitatorApi } from './facilitatorApi';

export const analyticsApi = {
  getSummary: async () => {
    // Queries assignments, submissions, and evaluations via facilitatorApi
    const [assignments, submissions, evaluations] = await Promise.all([
      facilitatorApi.getAssignments(),
      facilitatorApi.getSubmissions(),
      facilitatorApi.getEvaluations()
    ]);
    return {
      assignments,
      submissions,
      evaluations
    };
  }
};

export default analyticsApi;
