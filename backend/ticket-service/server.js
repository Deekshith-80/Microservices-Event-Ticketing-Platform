const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const ticketRoutes = require('./routes/ticketRoutes');

const app = express();
const PORT = process.env.PORT || 5003;
const frontendOrigin = (process.env.FRONTEND_URL || 'http://localhost:3000').trim();

connectDB();

app.use(cors({
  origin: frontendOrigin,
  credentials: true
}));
app.options('*', cors({
  origin: frontendOrigin,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/tickets', ticketRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found on Ticket Service.' });
});

app.listen(PORT, () => {
  console.log(`🎟️ Ticket Service online on port ${PORT}`);
});
