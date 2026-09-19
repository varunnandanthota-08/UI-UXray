import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor: Attach appropriate JWT token if available
apiClient.interceptors.request.use(
  (config) => {
    // Prefer facilitator token for facilitator routes or if authenticated as facilitator
    const facilitatorToken = localStorage.getItem('barabari_facilitator_token');
    const studentToken = localStorage.getItem('barabari_student_token');
    
    if (config.url?.includes('/facilitator') && facilitatorToken) {
      config.headers.Authorization = `Bearer ${facilitatorToken}`;
    } else if (facilitatorToken && !studentToken) {
      config.headers.Authorization = `Bearer ${facilitatorToken}`;
    } else if (studentToken) {
      config.headers.Authorization = `Bearer ${studentToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle common auth / network errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    let userMessage = 'A network error occurred. Please verify your connection.';

    if (status === 400) {
      userMessage = error.response?.data?.message || 'Invalid request parameters provided.';
    } else if (status === 401) {
      userMessage = 'Your session has expired. Please sign in again.';
      console.warn('[API Client] Unauthorized request (401).');
      // If facilitator request is unauthorized, dispatch session expired notice
      if (error.config?.url?.includes('/facilitator')) {
        window.dispatchEvent(new CustomEvent('barabari_facilitator_session_expired'));
      }
    } else if (status === 403) {
      userMessage = 'You do not have permission to perform this operation.';
    } else if (status === 404) {
      userMessage = 'The requested resource was not found on the server.';
    } else if (status === 409) {
      userMessage = error.response?.data?.message || 'Conflict with existing record.';
    } else if (status === 422) {
      userMessage = error.response?.data?.message || 'Validation error in submission payload.';
    } else if (status === 429) {
      userMessage = 'Too many requests. Please slow down and try again shortly.';
    } else if (status >= 500) {
      userMessage = 'The server encountered an internal error. Falling back to local offline workspace.';
    }

    error.userFriendlyMessage = userMessage;
    return Promise.reject(error);
  }
);

export default apiClient;
