/**
 * Facilitator Batch Evaluation API Service
 * 
 * Supports batch processing job queues.
 * AI analysis performed in batch runs is advisory only; final submission
 * grading remains in REVIEW_REQUIRED until facilitator human signoff.
 */
import { facilitatorApi } from './facilitatorApi';

export const batchApi = {
  getBatches: () => facilitatorApi.getBatches(),
  createBatch: (batchData) => facilitatorApi.createBatch(batchData),
  updateBatch: (batchId, updates) => facilitatorApi.updateBatch(batchId, updates)
};

export default batchApi;
