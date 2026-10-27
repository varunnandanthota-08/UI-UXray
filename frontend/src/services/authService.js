/**
 * Barabari Collective Authentication Service
 * 
 * Primary Path: Real Backend REST API
 * - POST /auth/register -> { name, email, password, role }
 * - POST /auth/login    -> { email, password }
 * - GET  /auth/me       -> { Authorization: Bearer <token> }
 * 
 * Fallback Path: Offline development & local demo fallback
 * Used ONLY when the backend is unreachable (network error / connection refused).
 * Never converts real HTTP 4xx errors into mock success.
 */

import apiClient from '../api/apiClient';

const STORAGE_KEY_REGISTERED_USERS = 'barabari_registered_users_v1';

// Seed initial default demo users for offline workspace
const defaultUsers = [
  {
    id: 'usr-student-001',
    name: 'Ananya Sharma',
    email: 'ananya.sharma@barabaricollective.in',
    password: 'password123',
    role: 'student',
    createdAt: '2026-08-01T10:00:00.000Z'
  },
  {
    id: 'usr-fac-001',
    name: 'Rohan Mehta',
    email: 'rohan.mehta@barabaricollective.in',
    password: 'password123',
    role: 'facilitator',
    createdAt: '2026-08-01T10:00:00.000Z'
  }
];

export const getRegisteredUsers = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REGISTERED_USERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading registered users from storage:', err);
  }
  localStorage.setItem(STORAGE_KEY_REGISTERED_USERS, JSON.stringify(defaultUsers));
  return defaultUsers;
};

export const saveRegisteredUsers = (users) => {
  try {
    localStorage.setItem(STORAGE_KEY_REGISTERED_USERS, JSON.stringify(users));
  } catch (err) {
    console.error('Error saving registered users to storage:', err);
  }
};

/**
 * Check if an error is an offline/network failure vs an actual HTTP response from backend
 */
function isNetworkError(error) {
  return !error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED' || error.code === 'ECONNREFUSED';
}

export const authService = {
  getRegisteredUsers,
  saveRegisteredUsers,

  /**
   * Register a new user
   * Real endpoint: POST /api/auth/register
   * Body: { name, email, password, role }
   */
  signup: async ({ name, email, password, role }) => {
    const trimmedName = (name || '').trim();
    const normalizedEmail = (email || '').toLowerCase().trim();
    const cleanRole = (role || '').toLowerCase().trim();

    if (!trimmedName) {
      throw new Error('Full name is required.');
    }
    if (trimmedName.length < 2) {
      throw new Error('Name must be at least 2 characters long.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
      throw new Error('Please provide a valid email address.');
    }

    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    if (!cleanRole || (cleanRole !== 'student' && cleanRole !== 'facilitator')) {
      throw new Error('Role is required. Please select Student or Facilitator.');
    }

    // 1. Primary: Attempt Real Backend Registration
    try {
      const response = await apiClient.post('/auth/register', {
        name: trimmedName,
        email: normalizedEmail,
        password,
        role: cleanRole
      });

      if (response?.data?.user) {
        // Backend successfully created user (Note: backend registration does NOT issue token)
        return response.data.user;
      }
    } catch (error) {
      // If the backend actively responded with an HTTP error (400, 409, 422, etc.), propagate it!
      if (!isNetworkError(error)) {
        const message = error.response?.data?.message || error.userFriendlyMessage || 'Registration failed.';
        throw new Error(message);
      }

      console.warn('[Auth Service] Backend offline or unreachable. Using local offline demo storage.');
    }

    // 2. Fallback: LocalStorage mock registration for offline dev/demo
    const existingUsers = getRegisteredUsers();
    const duplicate = existingUsers.find(u => u.email.toLowerCase() === normalizedEmail);
    if (duplicate) {
      throw new Error('An account with this email address already exists. Please sign in instead.');
    }

    const newUser = {
      id: `usr-${cleanRole}-${Date.now()}`,
      name: trimmedName,
      email: normalizedEmail,
      password: password,
      role: cleanRole,
      createdAt: new Date().toISOString()
    };

    const updated = [newUser, ...existingUsers];
    saveRegisteredUsers(updated);

    return newUser;
  },

  /**
   * Authenticate a user
   * Real endpoint: POST /api/auth/login
   * Body: { email, password }
   * Note: Role is not sent to backend; backend returns authoritative user.role
   */
  login: async ({ email, password, role }) => {
    const normalizedEmail = (email || '').toLowerCase().trim();
    const cleanRole = (role || '').toLowerCase().trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
      throw new Error('Please enter a valid email address.');
    }

    if (!password) {
      throw new Error('Password is required.');
    }

    if (!cleanRole || (cleanRole !== 'student' && cleanRole !== 'facilitator')) {
      throw new Error('Role is required. Please select Student or Facilitator.');
    }

    // 1. Primary: Attempt Real Backend Login
    try {
      const response = await apiClient.post('/auth/login', {
        email: normalizedEmail,
        password
      });

      if (response?.data?.token && response?.data?.user) {
        const { user, token } = response.data;

        // Verify role isolation against backend authoritative role
        if (user.role !== cleanRole) {
          const expected = user.role === 'student' ? 'Student' : 'Facilitator';
          const attempted = cleanRole === 'student' ? 'Student' : 'Facilitator';
          throw new Error(
            `This account is registered as a ${expected}. You cannot sign in as a ${attempted}. Please switch your role selector.`
          );
        }

        // Store JWT token under role-specific key
        if (cleanRole === 'student') {
          localStorage.setItem('barabari_student_token', token);
          localStorage.setItem('barabari_active_student_user', JSON.stringify(user));
        } else {
          localStorage.setItem('barabari_facilitator_token', token);
          localStorage.setItem('barabari_facilitator_user', JSON.stringify(user));
        }

        return { user, token };
      }
    } catch (error) {
      // If the error was thrown by our own role mismatch check, propagate directly
      if (error.message?.includes('Please switch your role selector')) {
        throw error;
      }

      // If backend responded with real HTTP error (401, 400, 403, 404, 500), propagate it!
      if (!isNetworkError(error)) {
        const message = error.response?.data?.message || error.userFriendlyMessage || 'Invalid email or password.';
        throw new Error(message);
      }

      console.warn('[Auth Service] Backend offline or unreachable. Using local offline demo authentication.');
    }

    // 2. Fallback: LocalStorage mock login for offline dev/demo
    const existingUsers = getRegisteredUsers();
    const matchedUser = existingUsers.find(u => u.email.toLowerCase() === normalizedEmail);

    if (matchedUser) {
      const isDemoAccount = matchedUser.id === 'usr-student-001' || matchedUser.id === 'usr-fac-001';
      const isPasswordValid = matchedUser.password === password || (isDemoAccount && (password === 'password123' || password === 'demo'));

      if (!isPasswordValid) {
        throw new Error('Invalid credentials. Incorrect password.');
      }

      if (matchedUser.role !== cleanRole) {
        const expected = matchedUser.role === 'student' ? 'Student' : 'Facilitator';
        const attempted = cleanRole === 'student' ? 'Student' : 'Facilitator';
        throw new Error(
          `This account is registered as a ${expected}. You cannot sign in as a ${attempted}. Please switch your role selector.`
        );
      }

      const mockToken = `demo-token-${cleanRole}-${Date.now()}`;
      if (cleanRole === 'student') {
        localStorage.setItem('barabari_student_token', mockToken);
        localStorage.setItem('barabari_active_student_user', JSON.stringify(matchedUser));
      } else {
        localStorage.setItem('barabari_facilitator_token', mockToken);
        localStorage.setItem('barabari_facilitator_user', JSON.stringify(matchedUser));
      }

      return { user: matchedUser, token: mockToken };
    }

    // Seeded demo users fallback
    if (normalizedEmail === 'ananya.sharma@barabaricollective.in') {
      if (cleanRole !== 'student') {
        throw new Error('This account is registered as a Student. Please switch your role selector.');
      }
      const user = {
        id: 'usr-student-001',
        name: 'Ananya Sharma',
        email: normalizedEmail,
        role: 'student'
      };
      const mockToken = 'demo-token-student';
      localStorage.setItem('barabari_student_token', mockToken);
      localStorage.setItem('barabari_active_student_user', JSON.stringify(user));
      return { user, token: mockToken };
    }

    if (normalizedEmail === 'rohan.mehta@barabaricollective.in') {
      if (cleanRole !== 'facilitator') {
        throw new Error('This account is registered as a Facilitator. Please switch your role selector.');
      }
      const user = {
        id: 'usr-fac-001',
        name: 'Rohan Mehta',
        email: normalizedEmail,
        role: 'facilitator'
      };
      const mockToken = 'demo-token-facilitator';
      localStorage.setItem('barabari_facilitator_token', mockToken);
      localStorage.setItem('barabari_facilitator_user', JSON.stringify(user));
      return { user, token: mockToken };
    }

    throw new Error('No account found with this email. Please check your email or sign up.');
  },

  /**
   * Fetch current user profile via JWT
   * Real endpoint: GET /api/auth/me
   */
  getMe: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data?.user || null;
    } catch (error) {
      if (isNetworkError(error)) {
        return null;
      }
      throw error;
    }
  }
};

export default authService;
