/**
 * Facilitator Rubric API Service
 */
import { facilitatorApi } from './facilitatorApi';

export const rubricApi = {
  getRubrics: () => facilitatorApi.getRubrics(),
  getRubric: (id) => facilitatorApi.getRubric(id),
  createRubric: (data) => facilitatorApi.createRubric(data),
  updateRubric: (id, data) => facilitatorApi.updateRubric(id, data),
  saveRubric: (data) => facilitatorApi.saveRubric(data),
  toggleRubricStatus: (id, nextStatus) => facilitatorApi.toggleRubricStatus(id, nextStatus),
  deleteRubric: (id) => facilitatorApi.deleteRubric(id)
};

export default rubricApi;
