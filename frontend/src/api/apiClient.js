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

// Request interceptor: Attach appropriate JWT token if available with strict role isolation
apiClient.interceptors.request.use(
  (config) => {
    const facilitatorToken = localStorage.getItem('barabari_facilitator_token');
    const studentToken = localStorage.getItem('barabari_student_token');

    const isStudentContext =
      config.role === 'student' ||
      config.url?.includes('/student') ||
      (typeof window !== 'undefined' && window.location.pathname.startsWith('/student'));

    const isFacilitatorContext =
      config.role === 'facilitator' ||
      config.url?.includes('/facilitator') ||
      (typeof window !== 'undefined' && window.location.pathname.startsWith('/facilitator'));

    if (isStudentContext) {
      if (studentToken) {
        config.headers.Authorization = `Bearer ${studentToken}`;
      }
    } else if (isFacilitatorContext) {
      if (facilitatorToken) {
        config.headers.Authorization = `Bearer ${facilitatorToken}`;
      }
    } else if (config.role === 'student') {
      if (studentToken) {
        config.headers.Authorization = `Bearer ${studentToken}`;
      }
    } else if (config.role === 'facilitator') {
      if (facilitatorToken) {
        config.headers.Authorization = `Bearer ${facilitatorToken}`;
      }
    } else if (studentToken) {
      config.headers.Authorization = `Bearer ${studentToken}`;
    } else if (facilitatorToken) {
      config.headers.Authorization = `Bearer ${facilitatorToken}`;
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
    const backendMsg = error.response?.data?.message || error.response?.data?.error;
    let userMessage = backendMsg || 'A network error occurred. Please verify your connection.';

    if (status === 400) {
      userMessage = backendMsg || 'Invalid request parameters provided.';
    } else if (status === 401) {
      userMessage = backendMsg || 'Session expired or invalid credentials.';
      console.warn('[API Client] Unauthorized request (401).');
      const isLoginOrRegister =
        error.config?.url?.includes('/login') || error.config?.url?.includes('/register');

      if (!isLoginOrRegister) {
        const isStudentReq =
          error.config?.role === 'student' ||
          error.config?.url?.includes('/student') ||
          (typeof window !== 'undefined' && window.location.pathname.startsWith('/student'));

        const isFacilitatorReq =
          error.config?.role === 'facilitator' ||
          error.config?.url?.includes('/facilitator') ||
          (typeof window !== 'undefined' && window.location.pathname.startsWith('/facilitator'));

        if (isStudentReq) {
          window.dispatchEvent(new CustomEvent('barabari_student_session_expired'));
        }
        if (isFacilitatorReq) {
          window.dispatchEvent(new CustomEvent('barabari_facilitator_session_expired'));
        }
      }
    } else if (status === 403) {
      userMessage = backendMsg || 'You do not have permission to perform this operation.';
    } else if (status === 404) {
      userMessage = backendMsg || 'The requested resource was not found on the server.';
    } else if (status === 409) {
      userMessage = backendMsg || 'Conflict with existing record.';
    } else if (status === 422) {
      userMessage = backendMsg || 'Validation error in submission payload.';
    } else if (status === 429) {
      userMessage = 'Too many requests. Please slow down and try again shortly.';
    } else if (status >= 500) {
      userMessage = backendMsg || 'The server encountered an internal error. Falling back to local offline workspace.';
    }

    error.message = userMessage;
    error.userFriendlyMessage = userMessage;
    return Promise.reject(error);
  }
);

export default apiClient;
