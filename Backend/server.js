// server.js
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

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
const authRoutes = require("./user/routes/auth.routes"); // your working auth route file
app.use("/api/auth", authRoutes);

// DASHBOARD (new structured route)
const dashboardRoutes = require("./user/routes/dashboard.route");
app.use("/api/dashboard", dashboardRoutes);

// ANALYTICS
const analyticsRoutes = require("./user/routes/analytics.routes");
app.use("/api/analytics", analyticsRoutes);

// APPS
const appsRoutes = require("./user/routes/apps.routes");
app.use("/api/apps", appsRoutes);

// PAYMENTS
const paymentsRoutes = require("./user/routes/payments.routes");
app.use("/api/payments", paymentsRoutes);

// INVOICES (PDF upload/download)
const invoicesRoutes = require("./user/routes/invoices.routes");
app.use("/api/invoices", invoicesRoutes);

// BILLING (user-side)
const billingRoutes = require("./user/routes/billing.routes");
app.use("/api/user", billingRoutes);

// WALLET
const walletRoutes = require("./user/routes/wallet.routes");
app.use("/api/wallet", walletRoutes);

// SETTINGS (Account only; no team features for user side)
const settingsRoutes = require("./user/routes/settings.routes");
app.use("/api/settings", settingsRoutes);

// CAMPAIGNS
const campaignsRoutes = require("./user/routes/campaign.routes");
app.use("/api/campaigns", campaignsRoutes);

// ========================= Admin: Publisher =========================
try {
  const pubValidationRoutes = require("./admin/routes/admin.publisher.validation.routes");
  const pubInvoicesRoutes = require("./admin/routes/admin.publisher.invoices.routes");
  const pubTransactionsRoutes = require("./admin/routes/admin.publisher.transactions.routes");
  const pubListRoutes = require("./admin/routes/admin.publisher.list.routes");
  const pubDetailRoutes = require("./admin/routes/admin.publisher.detail.routes");
  const pubApprovalsRoutes = require("./admin/routes/admin.publisher.approvals.routes");

  app.use("/api/admin/publisher/validations", pubValidationRoutes);
  app.use("/api/admin/publisher/invoices", pubInvoicesRoutes);
  // transactions file defines full paths inside (/admin/publisher/...); mount at /api to avoid double prefix
  app.use("/api", pubTransactionsRoutes);
  app.use("/api/admin/publisher", pubListRoutes); // /publishers
  app.use("/api/admin/publisher", pubDetailRoutes); // /publishers/:publisherName
  app.use("/api/admin/publisher/approvals", pubApprovalsRoutes);
} catch (e) {
  console.warn("Admin Publisher routes not mounted:", e.message);
}

// ========================= Admin: Advertiser =========================
try {
  const advOverviewRoutes = require("./admin/routes/admin.advertiser.overview.routes");
  const advOffersRoutes = require("./admin/routes/admin.advertiser.offers.routes");
  const advOfferRewardsRoutes = require("./admin/routes/admin.advertiser.offerRewards.routes");
  const advOfferApprRoutes = require("./admin/routes/admin.advertiser.offerApprovals.routes");
  const advNotifApprRoutes = require("./admin/routes/admin.advertiser.notificationApprovals.routes");
  const advAdvertisersRoutes = require("./admin/routes/admin.advertiser.advertisers.routes");

  app.use("/api/admin/advertiser/overview", advOverviewRoutes); // /summary, /top-offers
  app.use("/api/admin/advertiser/offers", advOffersRoutes); // list/create/read/update/status
  app.use("/api/admin/advertiser", advOfferRewardsRoutes); // /offers/:offerId/rewards, /rewards/:rewardId
  app.use("/api/admin/advertiser", advOfferApprRoutes); // /offer-approvals...
  app.use("/api/admin/advertiser", advNotifApprRoutes); // /notification-approvals...
  app.use("/api/admin/advertiser", advAdvertisersRoutes); // /advertisers...
} catch (e) {
  console.warn("Admin Advertiser routes not mounted:", e.message);
}

// ---------- ERROR HANDLER ----------
const { errorHandler } = require("./middleware/errorHandler");
app.use(errorHandler);

// start server
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
