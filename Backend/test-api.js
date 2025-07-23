const axios = require("axios");

const BASE_URL = "http://localhost:3000/api";

// Test data
const testUser = {
  name: "Test User",
  email: "test@example.com",
  password: "password123",
  account_type: "Individual",
  company_name: "Test Company",
  address: "123 Test Street",
  city: "Test City",
  pincode: "12345",
  country: "Test Country",
};

let authToken = "";

// Test functions
const testHealthCheck = async () => {
  try {
    console.log("🏥 Testing health check...");
    const response = await axios.get(`${BASE_URL}/health`);
    console.log("✅ Health check passed:", response.data);
    return true;
  } catch (error) {
    console.error("❌ Health check failed:", error.message);
    return false;
  }
};

const testRegistration = async () => {
  try {
    console.log("📝 Testing user registration...");
    const response = await axios.post(`${BASE_URL}/auth/register`, testUser);
    console.log("✅ Registration successful:", response.data.message);
    authToken = response.data.data.token;
    return true;
  } catch (error) {
    console.error(
      "❌ Registration failed:",
      error.response?.data || error.message
    );
    return false;
  }
};

const testLogin = async () => {
  try {
    console.log("🔐 Testing user login...");
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password,
    });
    console.log("✅ Login successful:", response.data.message);
    authToken = response.data.data.token;
    return true;
  } catch (error) {
    console.error("❌ Login failed:", error.response?.data || error.message);
    return false;
  }
};

const testProfile = async () => {
  try {
    console.log("👤 Testing profile retrieval...");
    const response = await axios.get(`${BASE_URL}/user/profile`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log("✅ Profile retrieval successful:", response.data.message);
    return true;
  } catch (error) {
    console.error(
      "❌ Profile retrieval failed:",
      error.response?.data || error.message
    );
    return false;
  }
};

const testDashboardStats = async () => {
  try {
    console.log("📊 Testing dashboard stats...");
    const response = await axios.get(`${BASE_URL}/user/dashboard-stats`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log("✅ Dashboard stats successful:", response.data.message);
    return true;
  } catch (error) {
    console.error(
      "❌ Dashboard stats failed:",
      error.response?.data || error.message
    );
    return false;
  }
};

const testTransaction = async () => {
  try {
    console.log("💳 Testing transaction creation...");
    const response = await axios.post(
      `${BASE_URL}/transactions`,
      {
        amount: 100.0,
        transaction_type: "UPI",
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    console.log("✅ Transaction creation successful:", response.data.message);
    return true;
  } catch (error) {
    console.error(
      "❌ Transaction creation failed:",
      error.response?.data || error.message
    );
    return false;
  }
};

const testOffer = async () => {
  try {
    console.log("🎯 Testing offer creation...");
    const response = await axios.post(
      `${BASE_URL}/offers`,
      {
        campaign_name: "Test Campaign",
        bid_requested: 50.0,
        offer_type: "CPI",
        app_category: "Gaming",
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    console.log("✅ Offer creation successful:", response.data.message);
    return true;
  } catch (error) {
    console.error(
      "❌ Offer creation failed:",
      error.response?.data || error.message
    );
    return false;
  }
};

const testWallet = async () => {
  try {
    console.log("💰 Testing wallet balance...");
    const response = await axios.get(`${BASE_URL}/wallet/balance`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log("✅ Wallet balance successful:", response.data.message);
    return true;
  } catch (error) {
    console.error(
      "❌ Wallet balance failed:",
      error.response?.data || error.message
    );
    return false;
  }
};

const testApp = async () => {
  try {
    console.log("📱 Testing app creation...");
    const response = await axios.post(
      `${BASE_URL}/apps`,
      {
        app_name: "Test App",
        package_id: "com.test.app",
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    console.log("✅ App creation successful:", response.data.message);
    return true;
  } catch (error) {
    console.error(
      "❌ App creation failed:",
      error.response?.data || error.message
    );
    return false;
  }
};

// Main test runner
const runTests = async () => {
  console.log("🚀 Starting API tests...\n");

  const tests = [
    { name: "Health Check", fn: testHealthCheck },
    { name: "Registration", fn: testRegistration },
    { name: "Login", fn: testLogin },
    { name: "Profile", fn: testProfile },
    { name: "Dashboard Stats", fn: testDashboardStats },
    { name: "Transaction", fn: testTransaction },
    { name: "Offer", fn: testOffer },
    { name: "Wallet", fn: testWallet },
    { name: "App", fn: testApp },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    console.log(`\n--- ${test.name} ---`);
    const result = await test.fn();
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log("\n📋 Test Results:");
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${tests.length}`);

  if (failed === 0) {
    console.log("\n🎉 All tests passed! The backend is working correctly.");
  } else {
    console.log("\n⚠️  Some tests failed. Please check the server logs.");
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
