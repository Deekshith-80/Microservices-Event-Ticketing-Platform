const mongoose = require('mongoose');
const Tenant = require('../models/Tenant');
const Event = require('../models/Event');

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');

const isValidDateString = (value) => {
  if (typeof value !== 'string') {
    return false;
  }

  return !Number.isNaN(Date.parse(value));
};

const parseNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const buildTenantScope = (req) => {
  const tenantId = normalizeString(req.tenantId);
  const organizerId = normalizeString(req.query?.organizerId || req.body?.organizerId);

  return {
    tenantId,
    organizerId
  };
};

const ensureTenantRecord = async (tenantId) => {
  let record = await Tenant.findOne({ tenantId });
  if (!record) {
    record = await Tenant.create({ tenantId });
  }
  return record;
};

exports.getProfileSettings = async (req, res) => {
  try {
    const tenantId = normalizeString(req.tenantId);
    if (!tenantId) {
      return res.status(400).json({ success: false, error: 'Tenant scope missing.' });
    }

    const settings = await ensureTenantRecord(tenantId);
    return res.status(200).json({ success: true, settings });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateProfileSettings = async (req, res) => {
  try {
    const tenantId = normalizeString(req.tenantId);
    if (!tenantId) {
      return res.status(400).json({ success: false, error: 'Tenant scope missing.' });
    }

    const {
      companyName = '',
      contactPhone = '',
      payoutRoutingNumber = '',
      payoutAccountNumber = '',
      brandName = 'SHOWTIME',
      tagline = 'Premium Ticket Exchange Network',
      supportEmail = 'operations@showtime.com'
    } = req.body || {};

    const updatedConfig = await Tenant.findOneAndUpdate(
      { tenantId },
      {
        $set: {
          companyName,
          contactPhone,
          payoutRoutingNumber,
          payoutAccountNumber,
          brandName,
          tagline,
          supportEmail
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    return res.status(200).json({ success: true, settings: updatedConfig });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { tenantId } = buildTenantScope(req);
    const {
      organizerId,
      title,
      description,
      category,
      location,
      date,
      ticketPrice,
      totalCapacity,
      bannerUrl = '',
      logoUrl = ''
    } = req.body || {};

    if (!tenantId) {
      return res.status(400).json({ success: false, error: 'Tenant scope missing.' });
    }

    const organizerKey = normalizeString(organizerId);
    const eventTitle = normalizeString(title);
    const eventDescription = normalizeString(description);
    const eventCategory = normalizeString(category);
    const eventLocation = normalizeString(location);
    const eventDate = normalizeString(date);

    if (!organizerKey || !eventTitle || !eventDescription || !eventCategory || !eventLocation || !eventDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required event fields.'
      });
    }

    const numericTicketPrice = parseNumber(ticketPrice);
    const numericTotalCapacity = parseNumber(totalCapacity);

    if (numericTicketPrice === null || numericTicketPrice < 0) {
      return res.status(400).json({ success: false, error: 'Ticket price must be a non-negative number.' });
    }

    if (numericTotalCapacity === null || numericTotalCapacity < 1) {
      return res.status(400).json({ success: false, error: 'Total capacity must be at least 1.' });
    }

    if (!isValidDateString(eventDate)) {
      return res.status(400).json({ success: false, error: 'Event date must be a valid ISO date string.' });
    }

    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant?.isProfileComplete) {
      return res.status(403).json({
        success: false,
        error: 'Profile verification required before publishing events.'
      });
    }

    const newEvent = await Event.create({
      tenantId,
      organizerId: organizerKey,
      title: eventTitle,
      description: eventDescription,
      category: eventCategory,
      location: eventLocation,
      date: new Date(eventDate).toISOString(),
      ticketPrice: numericTicketPrice,
      totalCapacity: numericTotalCapacity,
      ticketsSold: 0,
      grossRevenue: 0,
      bannerUrl: typeof bannerUrl === 'string' ? bannerUrl : '',
      logoUrl: typeof logoUrl === 'string' ? logoUrl : ''
    });

    return res.status(201).json({ success: true, event: newEvent });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getOrganizerEvents = async (req, res) => {
  try {
    const { tenantId, organizerId } = buildTenantScope(req);

    if (!tenantId) {
      return res.status(400).json({ success: false, error: 'Tenant scope missing.' });
    }

    if (!organizerId) {
      return res.status(400).json({ success: false, error: 'Organizer identification key required.' });
    }

    const events = await Event.find({ tenantId, organizerId }).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, events });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getActiveEvents = async (req, res) => {
  try {
    const { tenantId } = buildTenantScope(req);

    if (!tenantId) {
      return res.status(400).json({ success: false, error: 'Tenant scope missing.' });
    }

    const events = await Event.find({ tenantId, status: 'Active' })
      .sort({ date: 1, createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, events });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const { tenantId } = buildTenantScope(req);
    const { eventId } = req.params;

    if (!tenantId) {
      return res.status(400).json({ success: false, error: 'Tenant scope missing.' });
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ success: false, error: 'Invalid event identifier.' });
    }

    const event = await Event.findOne({ _id: eventId, tenantId }).lean();
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found.' });
    }

    return res.status(200).json({ success: true, event });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.settleTicketSale = async (req, res) => {
  try {
    const { tenantId } = buildTenantScope(req);
    const { eventId } = req.params;
    const quantity = parseNumber(req.body?.quantity);
    const amount = parseNumber(req.body?.amount);

    if (!tenantId) {
      return res.status(400).json({ success: false, error: 'Tenant scope missing.' });
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ success: false, error: 'Invalid event identifier.' });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ success: false, error: 'Quantity must be a positive integer.' });
    }

    if (amount === null || amount < 0) {
      return res.status(400).json({ success: false, error: 'Amount must be a non-negative number.' });
    }

    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        tenantId,
        status: 'Active',
        $expr: {
          $lte: [
            { $add: ['$ticketsSold', quantity] },
            '$totalCapacity'
          ]
        }
      },
      {
        $inc: {
          ticketsSold: quantity,
          grossRevenue: amount
        }
      },
      {
        new: true
      }
    ).lean();

    if (!updatedEvent) {
      return res.status(409).json({
        success: false,
        error: 'Insufficient inventory or the event is no longer active.'
      });
    }

    return res.status(200).json({ success: true, event: updatedEvent });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.cancelEvent = async (req, res) => {
  try {
    const { tenantId } = buildTenantScope(req);
    const { eventId } = req.params;

    if (!tenantId) {
      return res.status(400).json({ success: false, error: 'Tenant scope missing.' });
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ success: false, error: 'Invalid event identifier.' });
    }

    const targetEvent = await Event.findOne({ _id: eventId, tenantId });
    if (!targetEvent) {
      return res.status(404).json({ success: false, error: 'Target event entity not found.' });
    }

    if (targetEvent.status === 'Cancelled') {
      return res.status(400).json({ success: false, error: 'Event is already cancelled.' });
    }

    targetEvent.status = 'Cancelled';
    await targetEvent.save();

    return res.status(200).json({
      success: true,
      message: 'Event cancelled successfully.',
      event: targetEvent
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getDashboardAnalytics = async (req, res) => {
  try {
    const { tenantId, organizerId } = buildTenantScope(req);

    if (!tenantId) {
      return res.status(400).json({ success: false, error: 'Tenant scope missing.' });
    }

    const match = organizerId ? { tenantId, organizerId } : { tenantId };
    const [result] = await Event.aggregate([
      { $match: match },
      {
        $facet: {
          metrics: [
            {
              $group: {
                _id: null,
                globalPublishedEventsCount: { $sum: 1 },
                activeEventsCount: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'Active'] }, 1, 0]
                  }
                },
                sumTicketsSold: { $sum: '$ticketsSold' },
                sumGrossRevenue: { $sum: '$grossRevenue' },
                totalCapacity: { $sum: '$totalCapacity' }
              }
            },
            {
              $project: {
                _id: 0,
                globalPublishedEventsCount: 1,
                activeEventsCount: 1,
                sumTicketsSold: 1,
                sumGrossRevenue: 1,
                occupancyRatioPercentage: {
                  $cond: [
                    { $gt: ['$totalCapacity', 0] },
                    {
                      $round: [
                        {
                          $multiply: [
                            { $divide: ['$sumTicketsSold', '$totalCapacity'] },
                            100
                          ]
                        },
                        2
                      ]
                    },
                    0
                  ]
                }
              }
            }
          ],
          revenueByEvent: [
            { $sort: { grossRevenue: -1, createdAt: -1 } },
            { $limit: 6 },
            {
              $project: {
                _id: 1,
                title: 1,
                grossRevenue: 1,
                ticketPrice: 1,
                status: 1
              }
            }
          ],
          categoryDistribution: [
            {
              $group: {
                _id: '$category',
                ticketVolume: { $sum: '$ticketsSold' },
                eventCount: { $sum: 1 }
              }
            },
            { $sort: { ticketVolume: -1, eventCount: -1 } },
            {
              $project: {
                _id: 0,
                category: '$_id',
                ticketVolume: 1,
                eventCount: 1
              }
            }
          ]
        }
      }
    ]);

    const metrics = result?.metrics?.[0] || {
      globalPublishedEventsCount: 0,
      activeEventsCount: 0,
      sumTicketsSold: 0,
      sumGrossRevenue: 0,
      occupancyRatioPercentage: 0
    };

    return res.status(200).json({
      success: true,
      analytics: {
        ...metrics,
        revenueByEvent: result?.revenueByEvent || [],
        categoryDistribution: result?.categoryDistribution || []
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
