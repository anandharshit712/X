const { body, validationResult } = require("express-validator");

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      message: "Please check your input data",
      details: errors.array(),
    });
  }
  next();
};

// Registration validation
const validateRegistration = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage("Name must be between 2 and 255 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("account_type")
    .isIn(["Individual", "Company"])
    .withMessage("Account type must be either Individual or Company"),
  body("company_name")
    .if(body("account_type").equals("Company"))
    .notEmpty()
    .withMessage("Company name is required for company accounts"),
  handleValidationErrors,
];

// Login validation
const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

// Transaction validation
const validateTransaction = [
  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be a positive number"),
  body("transaction_type")
    .isIn(["UPI", "credit_card", "debit_card", "net_banking"])
    .withMessage("Invalid transaction type"),
  handleValidationErrors,
];

// Offer validation
const validateOffer = [
  body("campaign_name")
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage(
      "Campaign name is required and must be less than 255 characters"
    ),
  body("bid_requested")
    .isFloat({ min: 0.01 })
    .withMessage("Bid amount must be a positive number"),
  body("offer_type")
    .isIn(["CPI", "CPR", "CPA"])
    .withMessage("Invalid offer type"),
  body("app_category")
    .optional()
    .isLength({ max: 100 })
    .withMessage("App category must be less than 100 characters"),
  handleValidationErrors,
];

// Wallet validation
const validateWalletTransaction = [
  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be a positive number"),
  body("transaction_type")
    .isIn(["CREDIT", "TRANSACTION_REVERSAL", "REFUND"])
    .withMessage("Invalid transaction type"),
  handleValidationErrors,
];

// App validation
const validateApp = [
  body("app_name")
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("App name is required and must be less than 255 characters"),
  body("package_id")
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Package ID is required and must be less than 255 characters"),
  handleValidationErrors,
];

// Profile update validation
const validateProfileUpdate = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage("Name must be between 2 and 255 characters"),
  body("personal_email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("whatsapp_number")
    .optional()
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),
  body("address")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Address must be less than 1000 characters"),
  body("city")
    .optional()
    .isLength({ max: 100 })
    .withMessage("City must be less than 100 characters"),
  body("pincode")
    .optional()
    .isLength({ max: 20 })
    .withMessage("Pincode must be less than 20 characters"),
  handleValidationErrors,
];

const validateChangePassword = [
  body("old_password")
    .isString()
    .notEmpty()
    .withMessage("Old password is required"),
  body("new_password")
    .isString()
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters")
    .matches(/[A-Za-z]/)
    .withMessage("New password must include a letter")
    .matches(/[0-9]/)
    .withMessage("New password must include a number"),
  handleValidationErrors,
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateTransaction,
  validateOffer,
  validateWalletTransaction,
  validateApp,
  validateProfileUpdate,
  handleValidationErrors,
  validateChangePassword,
};
