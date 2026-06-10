const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🍃 Tenant Database connected safely to Atlas Cluster');
  } catch (error) {
    console.error(`Database connection fault: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;