import axios from 'axios';
import { TENANT_ID, tenantHeaders } from './showtimeApi';

const TICKET_SERVICE_URL = (import.meta.env.VITE_TICKET_SERVICE_URL || 'http://localhost:5003').trim();

export const fetchPublicActiveEvents = async (tenantId = TENANT_ID) => {
  const response = await axios.get(`${TICKET_SERVICE_URL}/api/tickets/events/active`, {
    headers: tenantHeaders(tenantId),
    withCredentials: true
  });
  return response.data;
};

export const fetchPublicEventById = async (eventId, tenantId = TENANT_ID) => {
  const response = await axios.get(`${TICKET_SERVICE_URL}/api/tickets/events/${eventId}`, {
    headers: tenantHeaders(tenantId),
    withCredentials: true
  });
  return response.data;
};

export const createTicketOrder = async ({ eventId, quantity, userId, tenantId = TENANT_ID }) => {
  const response = await axios.post(
    `${TICKET_SERVICE_URL}/api/tickets/orders`,
    { eventId, quantity, userId },
    {
      headers: tenantHeaders(tenantId),
      withCredentials: true
    }
  );
  return response.data;
};

export const verifyTicketPayment = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature, tenantId = TENANT_ID }) => {
  const response = await axios.post(
    `${TICKET_SERVICE_URL}/api/tickets/verify`,
    { razorpay_order_id, razorpay_payment_id, razorpay_signature },
    {
      headers: tenantHeaders(tenantId),
      withCredentials: true
    }
  );
  return response.data;
};

export const fetchMyTickets = async ({ userId, tenantId = TENANT_ID }) => {
  const response = await axios.get(`${TICKET_SERVICE_URL}/api/tickets/me`, {
    params: { userId },
    headers: tenantHeaders(tenantId),
    withCredentials: true
  });
  return response.data;
};

export { TICKET_SERVICE_URL };
