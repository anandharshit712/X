const express = require("express");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { pool } = require("../config/database");
const { generateToken } = require("../middleware/auth");
const {
  validateRegistration,
  validateLogin,
} = require("../middleware/validation");

const router = express.Router();

// Register new advertiser
router.post("/register", validateRegistration, async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      account_type,
      company_name,
      address,
      city,
      pincode,
      country,
    } = req.body;

    // Check if email already exists
    const existingUsersResult = await pool.query(
      "SELECT advertiser_id FROM dashboard_login WHERE email = $1",
      [email]
    );
    const existingUsers = existingUsersResult.rows;

    if (existingUsers.length > 0) {
      return res.status(409).json({
        error: "Email already registered",
        message: "An account with this email already exists",
      });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const insertSql = `
      INSERT INTO dashboard_login
        (name, email, password, account_type, company_name, address, city, pincode, country)
      VALUES
        ($1,   $2,    $3,       $4,           $5,          $6,     $7,   $8,      $9)
      RETURNING advertiser_id
    `;
    const insertVals = [
      name,
      email,
      hashedPassword,
      account_type || null,
      company_name || null,
      address || null,
      city || null,
      pincode || null,
      country || null,
    ];
    const { rows } = await pool.query(insertSql, insertVals);
    const advertiser_id = rows[0].advertiser_id;

    // Create initial wallet record
    await pool.query(
      "INSERT INTO dashboard_wallet (advertiser_id, balance, transaction_type) VALUES ($1, 0.00, $2)",
      [advertiser_id, "CREDIT"]
    );

    // Generate JWT token
    const token = generateToken(advertiser_id);

    res.status(201).json({
      message: "Registration successful",
      data: {
        advertiser_id,
        name,
        email,
        account_type,
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      error: "Registration failed",
      message: "An error occurred during registration",
    });
  }
});

// Login advertiser
router.post("/login", validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const usersResult = await pool.query(
      `SELECT advertiser_id, name, email, password, account_type, 
       company_name, address, city, pincode, country 
       FROM dashboard_login WHERE email = $1`,
      [email]
    );
    const users = usersResult.rows;

    if (users.length === 0) {
      return res.status(401).json({
        error: "Invalid credentials",
        message: "Email or password is incorrect",
      });
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid credentials",
        message: "Email or password is incorrect",
      });
    }

    // Generate JWT token
    const token = generateToken(user.advertiser_id);

    // Remove password from response
    delete user.password;

    res.json({
      message: "Login successful",
      data: {
        ...user,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Login failed",
      message: "An error occurred during login",
    });
  }
});

// Get current user profile
router.get("/profile", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "Access token required",
        message: "Please provide a valid authentication token",
      });
    }

    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const profileResult = await pool.query(
      `SELECT advertiser_id, name, email, account_type, 
       company_name, address, city, pincode, country,
       created_at, updated_at
       FROM dashboard_login WHERE advertiser_id = $1`,
      [decoded.advertiser_id]
    );
    const users = profileResult.rows;

    if (users.length === 0) {
      return res.status(404).json({
        error: "User not found",
        message: "User profile not found",
      });
    }

    res.json({
      message: "Profile retrieved successfully",
      data: users[0],
    });
  } catch (error) {
    console.error("Profile retrieval error:", error);
    res.status(500).json({
      error: "Profile retrieval failed",
      message: "An error occurred while retrieving profile",
    });
  }
});

module.exports = router;
