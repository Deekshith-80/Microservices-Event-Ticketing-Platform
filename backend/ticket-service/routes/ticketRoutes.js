const express = require('express');
const requireTenantContext = require('../middlewares/tenantMiddleware');
const {
  listActiveEvents,
  getEventById,
  createOrder,
  verifyPayment,
  getMyTickets
} = require('../controllers/ticketController');

const router = express.Router();

router.use(requireTenantContext);

router.get('/events/active', listActiveEvents);
router.get('/events/:eventId', getEventById);
router.get('/me', getMyTickets);
router.post('/orders', createOrder);
router.post('/verify', verifyPayment);

module.exports = router;
