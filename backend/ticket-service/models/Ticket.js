const crypto = require('crypto');
const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, trim: true },
    userId: { type: String, required: true, trim: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Event' },
    quantity: { type: Number, required: true, min: 1 },
    totalAmount: { type: Number, required: true, min: 0 },
    razorpayOrderId: { type: String, required: true, unique: true, index: true },
    razorpayPaymentId: { type: String, default: '' },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Failed'], default: 'Pending' },
    bookingReference: { type: String, unique: true, index: true, default: '' }
  },
  { timestamps: true }
);

const generateBookingReference = () => crypto.randomBytes(8).toString('hex').toUpperCase();

ticketSchema.pre('validate', function preValidate(next) {
  if (!this.bookingReference) {
    this.bookingReference = generateBookingReference();
  }

  next();
});

module.exports = mongoose.model('Ticket', ticketSchema);
