// server.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 3000;

// ensure pools are initialized (uses your existing config/database.js)
require("./config/database");

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// core middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : true,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// health check
app.get("/api/health", (_req, res) =>
  res.json({ ok: true, status: "healthy" })
);

// ---------- ROUTES ----------

// AUTH (keep your existing auth.js as-is)
const authRoutes = require("./routes/auth.routes"); // your working auth route file
app.use("/api/auth", authRoutes);

// DASHBOARD (new structured route)
const dashboardRoutes = require("./routes/dashboard.route");
app.use("/api/dashboard", dashboardRoutes);

// ANALYTICS
const analyticsRoutes = require("./routes/analytics.routes");
app.use("/api/analytics", analyticsRoutes);

// APPS
const appsRoutes = require("./routes/apps.routes");
app.use("/api/apps", appsRoutes);

// PAYMENTS
const paymentsRoutes = require("./routes/payments.routes");
app.use("/api/payments", paymentsRoutes);

// INVOICES (PDF upload/download)
const invoicesRoutes = require("./routes/invoices.routes");
app.use("/api/invoices", invoicesRoutes);

// BILLING (user-side)
const billingRoutes = require("./routes/billing.routes");
app.use("/api/user", billingRoutes);

// WALLET
const walletRoutes = require("./routes/wallet.routes");
app.use("/api/wallet", walletRoutes);

// SETTINGS (Account only; no team features for user side)
const settingsRoutes = require("./routes/settings.routes");
app.use("/api/settings", settingsRoutes);

// CAMPAIGNS
const campaignsRoutes = require("./routes/campaign.routes");
app.use("/api/campaigns", campaignsRoutes);

// ---------- ERROR HANDLER ----------
const { errorHandler } = require("./middleware/errorHandler");
app.use(errorHandler);

// start server
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
