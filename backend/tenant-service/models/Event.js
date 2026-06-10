const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  organizerId: { type: String, required: true, trim: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['Movie', 'Concert', 'Theater', 'Other'], required: true },
  location: { type: String, required: true },
  date: {
    type: String,
    required: true,
    validate: {
      validator: (value) => !Number.isNaN(Date.parse(value)),
      message: 'Event date must be a valid ISO-8601 date string.'
    }
  },
  
  // Pricing & Inventory Mapping
  ticketPrice: { type: Number, required: true, min: 0 },
  totalCapacity: { type: Number, required: true, min: 1 },
  ticketsSold: { type: Number, default: 0, min: 0 },
  grossRevenue: { type: Number, default: 0, min: 0 },
  
  // Asset Media Link Layout Parameters
  bannerUrl: { type: String, default: '' },
  logoUrl: { type: String, default: '' },
  
  // Lifecycle Management State Control
  status: { type: String, enum: ['Active', 'Cancelled'], default: 'Active' }
}, { timestamps: true });

// Optimize collection lookups for high-velocity lookups
eventSchema.index({ tenantId: 1, organizerId: 1 });
eventSchema.index({ tenantId: 1, status: 1, category: 1 });

module.exports = mongoose.model('Event', eventSchema);
