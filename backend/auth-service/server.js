const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;
const frontendOrigin = (process.env.FRONTEND_URL || 'http://localhost:5173').trim();

// Establish secure connection to MongoDB Atlas
connectDB();

app.use(cookieParser());
// Essential request processing parsers
app.use(express.json());

// Production CORS configuration to allow cross-origin cookie passing
app.use(cors({
  origin: frontendOrigin,
  credentials: true
}));
app.options('*', cors({
  origin: frontendOrigin,
  credentials: true
}));

// Microservice Routing Core Mount Point
app.use('/api/auth', authRoutes);

// Catch-all route for missing endpoint exceptions
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint context not found on Auth Service.' });
});

app.listen(PORT, () => {
  console.log(`🔒 Secure Auth Microservice active on port ${PORT}`);
});
