const express = require('express');
const router = express.Router();
const requireTenantContext = require('../middlewares/tenantMiddleware');
const { 
  getProfileSettings, updateProfileSettings, 
  createEvent, getOrganizerEvents, getActiveEvents, getEventById, cancelEvent, settleTicketSale, getDashboardAnalytics 
} = require('../controllers/tenantController');

router.use(requireTenantContext);

// Profile Endpoints Context
router.get('/settings', getProfileSettings);
router.put('/settings', updateProfileSettings);

// Event Generation Factory Context
router.post('/events', createEvent);
router.get('/events/list', getOrganizerEvents);
router.get('/events/active', getActiveEvents);
router.get('/events/:eventId', getEventById);
router.patch('/events/:eventId/settle-sale', settleTicketSale);
router.patch('/events/:eventId/cancel', cancelEvent); // Event cancellation handler mapping

// Monitoring Metrics Analytics Context
router.get('/analytics', getDashboardAnalytics);

module.exports = router;
