import React, { createContext, useState, useEffect } from 'react';
import {
  TENANT_ID,
  authenticateUser,
  fetchCurrentUser,
  fetchTenantSettings,
  logoutUser
} from '../services/showtimeApi';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tenantSettings, setTenantSettings] = useState({
    brandName: 'SHOWTIME',
    tagline: 'Premium Ticket Exchange Network',
    companyName: '',
    contactPhone: '',
    payoutRoutingNumber: '',
    payoutAccountNumber: '',
    supportEmail: 'operations@showtime.com',
    isProfileComplete: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [tenantId] = useState(TENANT_ID);

  useEffect(() => {
    const bootstrapApplicationData = async () => {
      try {
        const [tenantRes, authRes] = await Promise.allSettled([
          fetchTenantSettings(tenantId),
          fetchCurrentUser(tenantId)
        ]);

        if (tenantRes.status === 'fulfilled' && tenantRes.value?.success) {
          setTenantSettings(tenantRes.value.settings);
        }

        if (authRes.status === 'fulfilled' && authRes.value?.success) {
          setUser(authRes.value.user);
        }
      } catch (err) {
        console.log("No active browser session credentials located.");
      } finally {
        setInitializing(false);
      }
    };
    bootstrapApplicationData();
  }, [tenantId]);

  const authenticate = async (actionType, formData, roleSelection) => {
    setError('');
    setLoading(true);
    try {
      const response = await authenticateUser({
        actionType,
        payload: formData,
        roleSelection,
        tenantId
      });

      if (response?.success) {
        setUser(response.user);
        return { success: true, user: response.user };
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication layer timeout.');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser(tenantId);
      setUser(null);
    } catch (err) {
      console.error('Logout error occurred.');
    }
  };

  const refreshTenantSettings = async () => {
    const response = await fetchTenantSettings(tenantId);
    if (response?.success) {
      setTenantSettings(response.settings);
    }
    return response;
  };

  return (
    <AuthContext.Provider value={{ user, tenantSettings, tenantId, error, loading, initializing, authenticate, logout, refreshTenantSettings }}>
      {children}
    </AuthContext.Provider>
  );
}
