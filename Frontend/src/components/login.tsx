import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  // User credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Session check on mount (for token expiry or inactivity)
  useEffect(() => {
    const tokenExpiry = parseInt(localStorage.getItem("tokenExpiry") || "0");
    const lastLogin = parseInt(localStorage.getItem("lastLogin") || "0");
    const now = Date.now();
    if (tokenExpiry && now > tokenExpiry) {
      clearSession("Session expired. Please log in again.");
    } else if (lastLogin && now - lastLogin > 10 * 24 * 60 * 60 * 1000) {
      clearSession("Logged out due to inactivity.");
    }
  }, []);

  // Clear session and show error
  const clearSession = (msg) => {
    localStorage.clear();
    setError(msg);
    navigate("/login");
  };

  // Handle form submit (to be connected to backend)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill out both fields.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post("/api/auth/login", { email, password });
      const { data } = response.data;
      // Save token and session info
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("lastLogin", Date.now().toString());
      // Set token expiry (e.g., 24h)
      localStorage.setItem(
        "tokenExpiry",
        (Date.now() + 24 * 60 * 60 * 1000).toString()
      );
      setIsLoading(false);
      navigate("/dashboard"); // Change to your dashboard route
    } catch (err) {
      setIsLoading(false);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-200 via-violet-100 to-white">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">
            Welcome to EngageX
          </h1>
          <p className="text-gray-600">Login to access your account</p>
        </div>
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 caret-black text-gray-700"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 caret-black text-gray-700"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-purple-500 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
              isLoading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-purple-600"
            }`}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-gray-300"></div>
          <span className="px-3 text-sm text-gray-500">OR</span>
          <div className="flex-grow h-px bg-gray-300"></div>
        </div>
        <div className="text-center mt-6 text-sm text-gray-600">
          Don’t have an account?{" "}
          <button
            onClick={() => navigate("/signup")}
            className="text-purple-600 hover:underline"
          >
            Sign up
          </button>
        </div>
        <div className="text-center text-xs text-gray-400 mt-6">
          © 2025 EngageX. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Login;

// ----------------------
// Variable Comments:
// email: stores the user's email address input
// password: stores the user's password input
// isLoading: boolean for loading state during login
// error: stores error messages for display
// navigate: function to programmatically change routes
// clearSession: clears localStorage and resets error state
// handleSubmit: handles form submission and login logic
// (handleGoogleLogin): placeholder for Google login logic
