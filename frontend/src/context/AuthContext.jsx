import React, { createContext, useContext, useState, useEffect } from 'react';
import studentApi from '../api/studentApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const activeStored = localStorage.getItem('barabari_active_student_user');
    if (activeStored) {
      try {
        setStudent(JSON.parse(activeStored));
        setLoading(false);
        return;
      } catch {
        // fallback
      }
    }

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

  const login = async (_email, _password, userObj = null) => {
    sessionStorage.removeItem('barabari_logged_out');
    localStorage.setItem('barabari_student_token', 'demo-token-student');
    if (userObj) {
      const activeStudent = {
        id: userObj.id || 'stu-001',
        studentId: userObj.studentId || 'BC-2026-088',
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
