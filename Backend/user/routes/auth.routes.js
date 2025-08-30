const express = require("express");
const bcrypt = require("bcryptjs");
const { pools } = require("../../config/database");
const pool = pools.dashboard; // Use the dashboard pool for auth operations
const { generateToken, authenticateToken } = require("../../middleware/auth");
const {
  validateRegistration,
  validateLogin,
  validateChangePassword,
} = require("../../middleware/validation");

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

router.post(
  "/change-password",
  authenticateToken,
  validateChangePassword,
  async (req, res) => {
    try {
      // const email = req.user?.email; // <- from your JWT payload
      const advertiserId = req.user?.advertiser_id; // from JWT
      const { old_password, new_password } = req.body;

      // if (!email) {
      if (!advertiserId) {
        return res
          .status(401)
          .json({ error: "UNAUTHORIZED", message: "Missing user context" });
      }

      const TABLE_NAME = "public.dashboard_login"; // change to 'public.login' if that's your table
      // const findSql = `SELECT password FROM ${TABLE_NAME} WHERE email = $1 LIMIT 1;`;
      // const result = await pool.query(findSql, [email]);
      const findSql = `SELECT password FROM ${TABLE_NAME} WHERE advertiser_id = $1 LIMIT 1;`;
      const result = await pool.query(findSql, [advertiserId]);

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ error: "USER_NOT_FOUND", message: "User record not found" });
      }

      const currentHash = result.rows[0].password || "";
      const ok = await bcrypt.compare(old_password, currentHash);
      if (!ok) {
        return res.status(400).json({
          error: "INVALID_OLD_PASSWORD",
          message: "Old password is incorrect",
        });
      }

      // prevent re-using the same password
      const same = await bcrypt.compare(new_password, currentHash);
      if (same) {
        return res.status(400).json({
          error: "PASSWORD_REUSE",
          message: "New password must be different",
        });
      }

      // hash & update
      const SALT_ROUNDS = 12;
      const newHash = await bcrypt.hash(new_password, SALT_ROUNDS);
      // const updSql = `UPDATE ${TABLE_NAME} SET password = $1 WHERE email = $2;`;
      // await pool.query(updSql, [newHash, email]);
      const updSql = `UPDATE ${TABLE_NAME} SET password = $1 WHERE advertiser_id = $2;`;
      await pool.query(updSql, [newHash, advertiserId]);
      return res.json({ ok: true, message: "Password updated successfully" });
    } catch (err) {
      console.error("Change password error:", err);
      return res.status(500).json({
        error: "CHANGE_PASSWORD_FAILED",
        message: "Something went wrong",
      });
    }
  }
);

module.exports = router;
