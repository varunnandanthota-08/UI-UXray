/**
 * Facilitator Assignment API Service
 */
import { facilitatorApi } from './facilitatorApi';

export const assignmentApi = {
  getAssignments: () => facilitatorApi.getAssignments(),
  getAssignment: (id) => facilitatorApi.getAssignment(id),
  createAssignment: (data) => facilitatorApi.createAssignment(data),
  updateAssignment: (id, data) => facilitatorApi.updateAssignment(id, data),
  saveAssignment: (data) => facilitatorApi.saveAssignment(data),
  toggleAssignmentStatus: (id, nextStatus) => facilitatorApi.toggleAssignmentStatus(id, nextStatus),
  deleteAssignment: (id) => facilitatorApi.deleteAssignment(id),
  getCourses: () => facilitatorApi.getCourses()
};

export default assignmentApi;
