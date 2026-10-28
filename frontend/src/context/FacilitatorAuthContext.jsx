import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockFacilitatorUser } from '../data/mockFacilitatorData';
import facilitatorApi from '../api/facilitatorApi';
import authService from '../services/authService';

const FacilitatorAuthContext = createContext(null);

export const FacilitatorAuthProvider = ({ children }) => {
  const [facilitator, setFacilitator] = useState(() => {
    const token = localStorage.getItem('barabari_facilitator_token');
    const storedUser = localStorage.getItem('barabari_facilitator_user');
    const loggedOut = sessionStorage.getItem('barabari_facilitator_logged_out');
    if (loggedOut) return null;
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
    localStorage.removeItem('barabari_facilitator_token');
    localStorage.removeItem('barabari_facilitator_user');
    sessionStorage.setItem('barabari_facilitator_logged_out', 'true');
    setFacilitator(null);
  };

  // On startup, validate token with backend GET /api/auth/me
  useEffect(() => {
    const token = localStorage.getItem('barabari_facilitator_token');
    const storedUser = localStorage.getItem('barabari_facilitator_user');
    const loggedOut = sessionStorage.getItem('barabari_facilitator_logged_out');

    if (loggedOut || !token) {
      setFacilitator(null);
      setLoading(false);
      return;
    }

    const isExplicitDemoToken = typeof token === 'string' && token.startsWith('demo-token-');

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
        } else if (isExplicitDemoToken && storedUser) {
          // Explicit demo mode session
          try {
            setFacilitator(JSON.parse(storedUser));
          } catch {
            logout();
          }
        } else if (!beUser && storedUser) {
          // Backend is offline/unreachable (temporary outage): preserve valid session
          try {
            setFacilitator(JSON.parse(storedUser));
          } catch {
            logout();
          }
        } else {
          // Active rejection or invalid role
          logout();
        }
      })
      .catch((err) => {
        console.warn('[FacilitatorAuthContext] Session validation failed:', err);
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          // Expired or revoked credentials
          logout();
        } else {
          // Temporary network error or backend outage
          const isNetwork = !err?.response || err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED' || err.code === 'ECONNABORTED';
          if (isNetwork && storedUser) {
            try {
              setFacilitator(JSON.parse(storedUser));
            } catch {
              logout();
            }
          } else {
            logout();
          }
        }
      })
      .finally(() => setLoading(false));
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

    let activeToken = token;
    let activeUser = userObj;

    if (!activeToken || !activeUser) {
      const authResult = await authService.login({
        email,
        password,
        role: 'facilitator'
      });
      activeToken = authResult.token;
      activeUser = authResult.user;
    }

    if (activeToken) {
      localStorage.setItem('barabari_facilitator_token', activeToken);
    }

    const formattedUser = {
      ...mockFacilitatorUser,
      id: activeUser?.id || activeUser?._id || mockFacilitatorUser.id,
      name: activeUser?.name || mockFacilitatorUser.name,
      email: activeUser?.email || email,
      role: 'Lead Design Facilitator'
    };

    localStorage.setItem('barabari_facilitator_user', JSON.stringify(formattedUser));
    setFacilitator(formattedUser);
    return formattedUser;
  };

  const loginDemo = () => {
    sessionStorage.removeItem('barabari_facilitator_logged_out');
    const demoToken = 'demo-token-facilitator';
    const activeUser = {
      ...mockFacilitatorUser,
      id: 'usr-fac-001',
      name: 'Rohan Mehta',
      email: 'rohan.mehta@barabaricollective.in',
      role: 'Lead Design Facilitator'
    };
    localStorage.setItem('barabari_facilitator_token', demoToken);
    localStorage.setItem('barabari_facilitator_user', JSON.stringify(activeUser));
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

  const isAuthenticated = Boolean(
    facilitator &&
    localStorage.getItem('barabari_facilitator_token') &&
    !sessionStorage.getItem('barabari_facilitator_logged_out')
  );

  return (
    <FacilitatorAuthContext.Provider
      value={{
        facilitator,
        user: facilitator,
        isAuthenticated,
        loading,
        login,
        loginDemo,
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
