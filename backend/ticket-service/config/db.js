const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🎟️ Ticket Database connected safely');
  } catch (error) {
    console.error(`Ticket service database connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
