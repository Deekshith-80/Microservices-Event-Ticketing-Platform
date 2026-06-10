const crypto = require('crypto');
const Razorpay = require('razorpay');
const Ticket = require('../models/Ticket');

const TENANT_SERVICE_URL = (process.env.TENANT_SERVICE_URL || 'http://localhost:5002').trim();

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');

const parsePositiveInt = (value) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
};

const parseNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const getRazorpayClient = () => new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const fetchEvent = async (tenantId, eventId) => {
  const response = await fetch(`${TENANT_SERVICE_URL}/api/tenant/events/${eventId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-id': tenantId
    }
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(payload?.error || 'Unable to load event.');
    error.statusCode = response.status;
    throw error;
  }

  return payload.event;
};

const settleEventSale = async (tenantId, eventId, quantity, amount) => {
  const response = await fetch(`${TENANT_SERVICE_URL}/api/tenant/events/${eventId}/settle-sale`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-id': tenantId
    },
    body: JSON.stringify({ quantity, amount })
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(payload?.error || 'Unable to settle event sale.');
    error.statusCode = response.status;
    throw error;
  }

  return payload.event;
};

exports.listActiveEvents = async (req, res) => {
  try {
    const tenantId = normalizeString(req.tenantId);
    const response = await fetch(`${TENANT_SERVICE_URL}/api/tenant/events/active`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId
      }
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: payload?.error || 'Failed to load active events.'
      });
    }

    return res.status(200).json({ success: true, events: payload.events || [] });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const tenantId = normalizeString(req.tenantId);
    const { eventId } = req.params;
    const event = await fetchEvent(tenantId, eventId);
    return res.status(200).json({ success: true, event });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const tenantId = normalizeString(req.tenantId);
    const userId = normalizeString(req.body?.userId);
    const eventId = normalizeString(req.body?.eventId);
    const quantity = parsePositiveInt(req.body?.quantity);

    if (!tenantId) {
      return res.status(400).json({ success: false, error: 'Tenant scope missing.' });
    }

    if (!userId || !eventId || !quantity) {
      return res.status(400).json({ success: false, error: 'userId, eventId, and quantity are required.' });
    }

    const event = await fetchEvent(tenantId, eventId);
    if (!event || event.status !== 'Active') {
      return res.status(409).json({ success: false, error: 'Event is unavailable for booking.' });
    }

    const availableSeats = Number(event.totalCapacity) - Number(event.ticketsSold || 0);
    if (availableSeats < quantity) {
      return res.status(409).json({ success: false, error: 'Requested quantity exceeds remaining inventory.' });
    }

    const unitPrice = parseNumber(event.ticketPrice);
    const amount = Math.round((unitPrice * quantity) * 100);
    if (!Number.isInteger(amount) || amount < 1) {
      return res.status(400).json({ success: false, error: 'Unable to compute a valid payment amount.' });
    }

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      payment_capture: 1
    });

    const ticket = await Ticket.create({
      tenantId,
      userId,
      eventId,
      quantity,
      totalAmount: amount / 100,
      razorpayOrderId: order.id,
      status: 'Pending'
    });

    return res.status(201).json({
      success: true,
      orderId: order.id,
      currency: order.currency,
      amount: order.amount,
      ticket: {
        id: ticket._id,
        bookingReference: ticket.bookingReference,
        status: ticket.status
      }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const tenantId = normalizeString(req.tenantId);
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body || {};

    if (!tenantId) {
      return res.status(400).json({ success: false, error: 'Tenant scope missing.' });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Missing payment verification payload.' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      await Ticket.findOneAndUpdate(
        { tenantId, razorpayOrderId: razorpay_order_id },
        { $set: { status: 'Failed', razorpayPaymentId: razorpay_payment_id } },
        { new: true }
      );

      return res.status(400).json({ success: false, error: 'Payment signature verification failed.' });
    }

    const ticket = await Ticket.findOne({ tenantId, razorpayOrderId: razorpay_order_id });
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket record not found.' });
    }

    if (ticket.status === 'Confirmed') {
      return res.status(200).json({
        success: true,
        message: 'Payment already confirmed.',
        ticket
      });
    }

    const event = await fetchEvent(tenantId, ticket.eventId.toString());
    if (!event || event.status !== 'Active') {
      return res.status(409).json({ success: false, error: 'Event is no longer available.' });
    }

    const settledEvent = await settleEventSale(tenantId, event._id.toString(), ticket.quantity, ticket.totalAmount);
    if (!settledEvent) {
      return res.status(409).json({ success: false, error: 'Unable to settle ticket inventory.' });
    }

    const confirmedTicket = await Ticket.findOneAndUpdate(
      { tenantId, razorpayOrderId: razorpay_order_id, status: 'Pending' },
      {
        $set: {
          status: 'Confirmed',
          razorpayPaymentId: razorpay_payment_id
        }
      },
      { new: true }
    );

    if (!confirmedTicket) {
      return res.status(409).json({ success: false, error: 'Ticket confirmation could not be completed.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified and ticket confirmed.',
      ticket: confirmedTicket,
      event: settledEvent
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getMyTickets = async (req, res) => {
  try {
    const tenantId = normalizeString(req.tenantId);
    const userId = normalizeString(req.query?.userId);

    if (!tenantId) {
      return res.status(400).json({ success: false, error: 'Tenant scope missing.' });
    }

    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId query parameter is required.' });
    }

    const tickets = await Ticket.find({ tenantId, userId })
      .sort({ createdAt: -1 })
      .lean();

    const summary = tickets.reduce((acc, ticket) => {
      acc.totalSpend += Number(ticket.totalAmount || 0);
      acc.totalTickets += Number(ticket.quantity || 0);
      return acc;
    }, { totalSpend: 0, totalTickets: 0 });

    return res.status(200).json({
      success: true,
      tickets,
      summary
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
