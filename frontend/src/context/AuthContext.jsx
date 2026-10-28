import React, { createContext, useContext, useState, useEffect } from 'react';
import studentApi from '../api/studentApi';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [student, setStudent] = useState(() => {
    const token = localStorage.getItem('barabari_student_token');
    const storedUser = localStorage.getItem('barabari_active_student_user');
    if (token && storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('barabari_student_token');
    localStorage.removeItem('barabari_active_student_user');
    sessionStorage.setItem('barabari_logged_out', 'true');
    setStudent(null);
  };

  useEffect(() => {
    const handleExpired = () => {
      logout();
    };
    window.addEventListener('barabari_student_session_expired', handleExpired);
    return () => window.removeEventListener('barabari_student_session_expired', handleExpired);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('barabari_student_token');
    const activeStored = localStorage.getItem('barabari_active_student_user');

    if (token) {
      // Validate with backend GET /api/auth/me
      authService.getMe('student')
        .then((beUser) => {
          if (beUser && beUser.role === 'student') {
            const formatted = {
              id: beUser.id || beUser._id,
              studentId: beUser.id || 'BC-2026-088',
              name: beUser.name,
              email: beUser.email,
              cohort: 'Cohort 4 • UI/UX Product Design',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
              role: 'Student'
            };
            setStudent(formatted);
            localStorage.setItem('barabari_active_student_user', JSON.stringify(formatted));
          } else if (activeStored) {
            try {
              setStudent(JSON.parse(activeStored));
            } catch {
              logout();
            }
          } else {
            logout();
          }
        })
        .catch((err) => {
          console.warn('[AuthContext] Session validation failed:', err);
          if (err?.response?.status === 401 || err?.response?.status === 403) {
            logout();
          } else if (activeStored) {
            try {
              setStudent(JSON.parse(activeStored));
            } catch {
              logout();
            }
          }
        })
        .finally(() => setLoading(false));
    } else {
      setStudent(null);
      setLoading(false);
    }
  }, []);

  const login = async (_email, _password, userObj = null, token = null) => {
    sessionStorage.removeItem('barabari_logged_out');

    let activeToken = token;
    let activeUser = userObj;

    // If token or userObj not provided, authenticate via authService
    if (!activeToken || !activeUser) {
      const authResult = await authService.login({
        email: _email,
        password: _password,
        role: 'student'
      });
      activeToken = authResult.token;
      activeUser = authResult.user;
    }

    if (activeToken) {
      localStorage.setItem('barabari_student_token', activeToken);
    }

    const activeStudent = {
      id: activeUser?.id || activeUser?._id || 'stu-001',
      studentId: activeUser?.studentId || activeUser?.id || 'BC-2026-088',
      name: activeUser?.name || 'Ananya Sharma',
      email: activeUser?.email || _email,
      cohort: 'Cohort 4 • UI/UX Product Design',
      avatar: activeUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      role: 'Student'
    };

    localStorage.setItem('barabari_active_student_user', JSON.stringify(activeStudent));
    setStudent(activeStudent);
    return activeStudent;
  };

  const updateProfile = async (profileData) => {
    const res = await studentApi.updateStudentProfile(profileData);
    if (res?.data) {
      setStudent(res.data);
    }
    return res;
  };

  const isAuthenticated = !!student && !!localStorage.getItem('barabari_student_token');

  return (
    <AuthContext.Provider
      value={{
        student,
        user: student,
        isAuthenticated,
        loading,
        login,
        logout,
        setStudent,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
