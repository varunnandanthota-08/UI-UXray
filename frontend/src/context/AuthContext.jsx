import React, { createContext, useContext, useState, useEffect } from 'react';
import studentApi from '../api/studentApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('barabari_student_token');
    if (token) {
      studentApi.getStudentProfile()
        .then((res) => {
          if (res?.data) {
            setStudent(res.data);
          }
        })
        .catch((err) => console.error('Error fetching profile:', err))
        .finally(() => setLoading(false));
    } else if (!sessionStorage.getItem('barabari_logged_out')) {
      // Default to demo student for frictionless initial exploration if not logged out
      studentApi.getStudentProfile()
        .then((res) => {
          if (res?.data) {
            setStudent(res.data);
            localStorage.setItem('barabari_student_token', 'demo-token-ananya-2026');
          }
        })
        .catch((err) => console.error('Profile error:', err))
        .finally(() => setLoading(false));
    } else {
      queueMicrotask(() => setLoading(false));
    }
  }, []);

  const login = async (_email, _password) => {
    // In real backend, apiClient.post('/auth/student/login', { email: _email, password: _password })
    sessionStorage.removeItem('barabari_logged_out');
    localStorage.setItem('barabari_student_token', 'demo-token-ananya-2026');
    const profileRes = await studentApi.getStudentProfile();
    setStudent(profileRes.data);
    return profileRes.data;
  };

  const logout = () => {
    localStorage.removeItem('barabari_student_token');
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
