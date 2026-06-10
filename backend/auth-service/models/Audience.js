const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const audienceSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  password: { type: String }, 
  googleId: { type: String },
  avatar: { type: String },
  role: { type: String, default: 'Customer' }
}, { timestamps: true });

// Prevent duplicate signups within the same tenant site context
audienceSchema.index({ tenantId: 1, email: 1 }, { unique: true });

// Corrected lifecycle hook targeting the audienceSchema variable directly
audienceSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('Audience', audienceSchema);