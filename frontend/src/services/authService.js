/**
 * Barabari Collective Common Authentication Service
 * 
 * Provides unified authentication, user registration, local persistence,
 * and role-based validation for both Students and Facilitators.
 * 
 * Ready for future backend integration:
 * - POST /auth/login
 * - POST /auth/signup
 */

const STORAGE_KEY_REGISTERED_USERS = 'barabari_registered_users_v1';

// Seed initial default demo users into registered store if empty
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
  // Initialize with seed defaults
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

export const authService = {
  getRegisteredUsers,
  saveRegisteredUsers,

  /**
   * Register a new user with validation
   * @param {Object} params - { name, email, password, role }
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
   * Authenticate a user with email, password, and chosen role
   * @param {Object} params - { email, password, role }
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

    const existingUsers = getRegisteredUsers();
    const matchedUser = existingUsers.find(u => u.email.toLowerCase() === normalizedEmail);

    if (matchedUser) {
      // Validate password
      const isDemoAccount = matchedUser.id === 'usr-student-001' || matchedUser.id === 'usr-fac-001';
      const isPasswordValid = matchedUser.password === password || (isDemoAccount && (password === 'password123' || password === 'demo'));

      if (!isPasswordValid) {
        throw new Error('Invalid credentials. Incorrect password.');
      }

      // Enforce role isolation
      if (matchedUser.role !== cleanRole) {
        const expected = matchedUser.role === 'student' ? 'Student' : 'Facilitator';
        const attempted = cleanRole === 'student' ? 'Student' : 'Facilitator';
        throw new Error(
          `This account is registered as a ${expected}. You cannot sign in as a ${attempted}. Please switch your role selector.`
        );
      }

      return matchedUser;
    }

    // If user is not yet in registered users list, allow demo fallback only for seeded demo personas
    if (normalizedEmail === 'ananya.sharma@barabaricollective.in') {
      if (cleanRole !== 'student') {
        throw new Error('This account is registered as a Student. Please switch your role selector.');
      }
      return {
        id: 'usr-student-001',
        name: 'Ananya Sharma',
        email: normalizedEmail,
        role: 'student'
      };
    }

    if (normalizedEmail === 'rohan.mehta@barabaricollective.in') {
      if (cleanRole !== 'facilitator') {
        throw new Error('This account is registered as a Facilitator. Please switch your role selector.');
      }
      return {
        id: 'usr-fac-001',
        name: 'Rohan Mehta',
        email: normalizedEmail,
        role: 'facilitator'
      };
    }

    throw new Error('No account found with this email. Please check your email or sign up.');
  }
};

export default authService;
