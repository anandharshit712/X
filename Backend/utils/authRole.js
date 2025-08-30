// utils/authRole.js
const isMobtionsEmail = (email = "") =>
  /@mobtions\.com$/i.test((email || "").trim());

const roleForEmail = (email = "") =>
  isMobtionsEmail(email) ? "admin" : "user";

// NOTE: change the user path if your monetization dashboard route differs
const redirectForRole = (role = "user") =>
  role === "admin" ? "/admin/publisher/dashboard" : "/dashboard";

module.exports = { isMobtionsEmail, roleForEmail, redirectForRole };
