import axios from 'axios';

const normalizeBaseUrl = (value, fallback) => {
  const raw = typeof value === 'string' ? value.trim() : '';
  return raw || fallback;
};

export const TENANT_ID = (import.meta.env.VITE_TENANT_ID || 'production-main').trim();
export const TENANT_SERVICE_URL = normalizeBaseUrl(import.meta.env.VITE_TENANT_SERVICE_URL, 'http://localhost:5002');
export const AUTH_SERVICE_URL = normalizeBaseUrl(import.meta.env.VITE_AUTH_SERVICE_URL, 'http://localhost:5001');

export const tenantHeaders = (tenantId = TENANT_ID, extraHeaders = {}) => ({
  ...extraHeaders,
  'x-tenant-id': tenantId
});

export const formatCurrency = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return '₹0.00';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatLocalDateTime = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
};

export const profileIsComplete = (profile) => {
  if (!profile) {
    return false;
  }

  const requiredKeys = ['companyName', 'contactPhone', 'payoutRoutingNumber', 'payoutAccountNumber'];
  return requiredKeys.every((key) => typeof profile[key] === 'string' && profile[key].trim().length > 0);
};

export const fetchTenantSettings = async (tenantId = TENANT_ID) => {
  const response = await axios.get(`${TENANT_SERVICE_URL}/api/tenant/settings`, {
    headers: tenantHeaders(tenantId)
  });
  return response.data;
};

export const saveTenantSettings = async (payload, tenantId = TENANT_ID) => {
  const response = await axios.put(`${TENANT_SERVICE_URL}/api/tenant/settings`, payload, {
    headers: tenantHeaders(tenantId)
  });
  return response.data;
};

export const fetchOrganizerEvents = async ({ tenantId = TENANT_ID, organizerId }) => {
  const response = await axios.get(`${TENANT_SERVICE_URL}/api/tenant/events/list`, {
    params: { organizerId },
    headers: tenantHeaders(tenantId)
  });
  return response.data;
};

export const createOrganizerEvent = async (payload, tenantId = TENANT_ID) => {
  const response = await axios.post(`${TENANT_SERVICE_URL}/api/tenant/events`, payload, {
    headers: tenantHeaders(tenantId)
  });
  return response.data;
};

export const cancelOrganizerEvent = async (eventId, tenantId = TENANT_ID) => {
  const response = await axios.patch(`${TENANT_SERVICE_URL}/api/tenant/events/${eventId}/cancel`, {}, {
    headers: tenantHeaders(tenantId)
  });
  return response.data;
};

export const fetchOrganizerAnalytics = async ({ tenantId = TENANT_ID, organizerId }) => {
  const response = await axios.get(`${TENANT_SERVICE_URL}/api/tenant/analytics`, {
    params: { organizerId },
    headers: tenantHeaders(tenantId)
  });
  return response.data;
};

export const fetchCurrentUser = async (tenantId = TENANT_ID) => {
  const response = await axios.get(`${AUTH_SERVICE_URL}/api/auth/me`, {
    headers: tenantHeaders(tenantId),
    withCredentials: true
  });
  return response.data;
};

export const authenticateUser = async ({ actionType, payload, roleSelection, tenantId = TENANT_ID }) => {
  const endpoint = actionType === 'signup'
    ? 'register'
    : actionType === 'google'
      ? 'google-login'
      : 'login';

  const requestPayload = actionType === 'google'
    ? { accessToken: payload, requestedRole: roleSelection }
    : { ...payload, requestedRole: roleSelection };

  const response = await axios.post(`${AUTH_SERVICE_URL}/api/auth/${endpoint}`, requestPayload, {
    headers: tenantHeaders(tenantId),
    withCredentials: true
  });

  return response.data;
};

export const logoutUser = async (tenantId = TENANT_ID) => {
  const response = await axios.post(`${AUTH_SERVICE_URL}/api/auth/logout`, {}, {
    headers: tenantHeaders(tenantId),
    withCredentials: true
  });
  return response.data;
};
