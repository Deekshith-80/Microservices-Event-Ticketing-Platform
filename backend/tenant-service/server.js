const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const tenantRoutes = require("./routes/tenantRoutes");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5002;
const frontendOrigin = (
  process.env.FRONTEND_URL || "http://localhost:5173"
).trim();

// Connect to the tenant database cluster
connectDB();

// CORS configuration to allow secure communication with the frontend
app.use(
  cors({
    origin: frontendOrigin,
    credentials: true,
  }),
);
app.options(
  "*",
  cors({
    origin: frontendOrigin,
    credentials: true,
  }),
);

// Configure body parsing middleware with 50mb limit for large Base64 media uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Mount the Tenant configuration endpoints
app.use("/api/tenant", tenantRoutes);

app.use((req, res) => {
  res
    .status(404)
    .json({ success: false, error: "Endpoint not found on Tenant Service." });
});

app.listen(PORT, () => {
  console.log(`🎨 Tenant Customization Engine online on port ${PORT}`);
});
