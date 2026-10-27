import React, { createContext, useContext, useState, useEffect } from 'react';
import studentApi from '../api/studentApi';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('barabari_student_token');
    const activeStored = localStorage.getItem('barabari_active_student_user');

    if (token) {
      // Validate with backend GET /api/auth/me
      authService.getMe()
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
              // fallback
            }
          }
        })
        .catch((err) => {
          console.warn('[AuthContext] Session validation failed:', err);
          if (err?.response?.status === 401) {
            localStorage.removeItem('barabari_student_token');
            localStorage.removeItem('barabari_active_student_user');
            setStudent(null);
          } else if (activeStored) {
            try {
              setStudent(JSON.parse(activeStored));
            } catch {}
          }
        })
        .finally(() => setLoading(false));
    } else if (activeStored && !sessionStorage.getItem('barabari_logged_out')) {
      try {
        setStudent(JSON.parse(activeStored));
      } catch {}
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (_email, _password, userObj = null, token = null) => {
    sessionStorage.removeItem('barabari_logged_out');
    if (token) {
      localStorage.setItem('barabari_student_token', token);
    }
    if (userObj) {
      const activeStudent = {
        id: userObj.id || userObj._id || 'stu-001',
        studentId: userObj.studentId || userObj.id || 'BC-2026-088',
        name: userObj.name || 'Ananya Sharma',
        email: userObj.email || _email,
        cohort: 'Cohort 4 • UI/UX Product Design',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        role: 'Student'
      };
      localStorage.setItem('barabari_active_student_user', JSON.stringify(activeStudent));
      setStudent(activeStudent);
      return activeStudent;
    }
    const profileRes = await studentApi.getStudentProfile();
    const active = profileRes?.data || { name: 'Ananya Sharma', email: _email };
    setStudent(active);
    return active;
  };

  const logout = () => {
    localStorage.removeItem('barabari_student_token');
    localStorage.removeItem('barabari_active_student_user');
    sessionStorage.setItem('barabari_logged_out', 'true');
    setStudent(null);
  };

  const updateProfile = async (profileData) => {
    const res = await studentApi.updateStudentProfile(profileData);
    if (res?.data) {
      setStudent(res.data);
    }
    return res;
  };

  const isAuthenticated = !!student;

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
