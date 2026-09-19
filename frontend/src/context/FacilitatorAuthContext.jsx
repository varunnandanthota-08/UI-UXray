import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockFacilitatorUser } from '../data/mockFacilitatorData';
import facilitatorApi from '../api/facilitatorApi';

const FacilitatorAuthContext = createContext(null);

export const FacilitatorAuthProvider = ({ children }) => {
  const [facilitator, setFacilitator] = useState(() => {
    const token = localStorage.getItem('barabari_facilitator_token');
    const storedUser = localStorage.getItem('barabari_facilitator_user');
    if (token && storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return mockFacilitatorUser;
      }
    } else if (!sessionStorage.getItem('barabari_facilitator_logged_out')) {
      return mockFacilitatorUser;
    }
    return null;
  });
  const [loading] = useState(false);

  const logout = () => {
    localStorage.removeItem('barabari_facilitator_token');
    localStorage.removeItem('barabari_facilitator_user');
    sessionStorage.setItem('barabari_facilitator_logged_out', 'true');
    setFacilitator(null);
  };

  // Listen for session expiry event dispatched by apiClient interceptor
  useEffect(() => {
    const handleExpired = () => {
      logout();
    };
    window.addEventListener('barabari_facilitator_session_expired', handleExpired);
    return () => window.removeEventListener('barabari_facilitator_session_expired', handleExpired);
  }, []);

  const login = async (email, password, userObj = null) => {
    sessionStorage.removeItem('barabari_facilitator_logged_out');
    if (userObj) {
      const activeUser = {
        ...mockFacilitatorUser,
        id: userObj.id || mockFacilitatorUser.id,
        name: userObj.name || mockFacilitatorUser.name,
        email: userObj.email || email,
        role: 'Lead Design Facilitator'
      };
      localStorage.setItem('barabari_facilitator_token', 'demo-token-facilitator');
      localStorage.setItem('barabari_facilitator_user', JSON.stringify(activeUser));
      setFacilitator(activeUser);
      return activeUser;
    }
    const result = await facilitatorApi.login(email, password);
    const activeUser = result?.user || {
      ...mockFacilitatorUser,
      email: email || mockFacilitatorUser.email
    };
    setFacilitator(activeUser);
    return activeUser;
  };

  const updateProfile = async (updatedData) => {
    const next = { ...facilitator, ...updatedData };
    setFacilitator(next);
    localStorage.setItem('barabari_facilitator_user', JSON.stringify(next));
    try {
      await facilitatorApi.updateProfile(updatedData);
    } catch {
      // safe fallback
    }
  };

  const isAuthenticated = !!facilitator;

  return (
    <FacilitatorAuthContext.Provider
      value={{
        facilitator,
        user: facilitator,
        isAuthenticated,
        loading,
        login,
        logout,
        updateProfile
      }}
    >
      {children}
    </FacilitatorAuthContext.Provider>
  );
};

export const useFacilitatorAuth = () => {
  const context = useContext(FacilitatorAuthContext);
  if (!context) {
    throw new Error('useFacilitatorAuth must be used within a FacilitatorAuthProvider');
  }
  return context;
};

export default FacilitatorAuthContext;
