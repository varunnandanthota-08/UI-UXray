import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockFacilitatorUser } from '../data/mockFacilitatorData';
import facilitatorApi from '../api/facilitatorApi';
import authService from '../services/authService';

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
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('barabari_facilitator_token');
    localStorage.removeItem('barabari_facilitator_user');
    sessionStorage.setItem('barabari_facilitator_logged_out', 'true');
    setFacilitator(null);
  };

  // On startup, validate token with backend GET /api/auth/me
  useEffect(() => {
    const token = localStorage.getItem('barabari_facilitator_token');
    const storedUser = localStorage.getItem('barabari_facilitator_user');

    if (token) {
      authService.getMe('facilitator')
        .then((beUser) => {
          if (beUser && beUser.role === 'facilitator') {
            const activeUser = {
              ...mockFacilitatorUser,
              id: beUser.id || beUser._id,
              name: beUser.name,
              email: beUser.email,
              role: 'Lead Design Facilitator'
            };
            setFacilitator(activeUser);
            localStorage.setItem('barabari_facilitator_user', JSON.stringify(activeUser));
          } else if (storedUser) {
            try {
              setFacilitator(JSON.parse(storedUser));
            } catch {}
          }
        })
        .catch((err) => {
          console.warn('[FacilitatorAuthContext] Session validation failed:', err);
          if (err?.response?.status === 401) {
            logout();
          } else if (storedUser) {
            try {
              setFacilitator(JSON.parse(storedUser));
            } catch {}
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Listen for session expiry event dispatched by apiClient interceptor
  useEffect(() => {
    const handleExpired = () => {
      logout();
    };
    window.addEventListener('barabari_facilitator_session_expired', handleExpired);
    return () => window.removeEventListener('barabari_facilitator_session_expired', handleExpired);
  }, []);

  const login = async (email, password, userObj = null, token = null) => {
    sessionStorage.removeItem('barabari_facilitator_logged_out');
    if (token) {
      localStorage.setItem('barabari_facilitator_token', token);
    }
    if (userObj) {
      const activeUser = {
        ...mockFacilitatorUser,
        id: userObj.id || userObj._id || mockFacilitatorUser.id,
        name: userObj.name || mockFacilitatorUser.name,
        email: userObj.email || email,
        role: 'Lead Design Facilitator'
      };
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
