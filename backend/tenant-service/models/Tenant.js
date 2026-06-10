const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, unique: true },
  companyName: { type: String, trim: true, default: '' },
  contactPhone: { type: String, trim: true, default: '' },
  payoutRoutingNumber: { type: String, trim: true, default: '' },
  payoutAccountNumber: { type: String, trim: true, default: '' },
  brandName: { type: String, trim: true, default: 'SHOWTIME' },
  tagline: { type: String, trim: true, default: 'Premium Ticket Exchange Network' },
  supportEmail: { type: String, trim: true, default: 'operations@showtime.com' },
  isProfileComplete: { type: Boolean, default: false }
}, { timestamps: true });

function evaluateProfileCompleteness(doc) {
  const requiredFields = [
    doc.companyName,
    doc.contactPhone,
    doc.payoutRoutingNumber,
    doc.payoutAccountNumber
  ];

  return requiredFields.every((value) => typeof value === 'string' && value.trim().length > 0);
}

tenantSchema.pre('save', function preSave(next) {
  this.isProfileComplete = evaluateProfileCompleteness(this);
  next();
});

tenantSchema.pre('findOneAndUpdate', async function preFindOneAndUpdate(next) {
  const update = this.getUpdate() || {};
  const set = update.$set || update;
  const currentDoc = await this.model.findOne(this.getQuery()).lean();

  const merged = {
    companyName: set.companyName ?? currentDoc?.companyName ?? '',
    contactPhone: set.contactPhone ?? currentDoc?.contactPhone ?? '',
    payoutRoutingNumber: set.payoutRoutingNumber ?? currentDoc?.payoutRoutingNumber ?? '',
    payoutAccountNumber: set.payoutAccountNumber ?? currentDoc?.payoutAccountNumber ?? ''
  };

  const isProfileComplete = evaluateProfileCompleteness(merged);
  if (update.$set) {
    update.$set.isProfileComplete = isProfileComplete;
  } else {
    update.isProfileComplete = isProfileComplete;
  }

  this.setUpdate(update);
  next();
});

module.exports = mongoose.model('Tenant', tenantSchema);
