import React, { useState } from "react";
import axios from "axios";

function Signup() {
  // State for email and password fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State for other form fields
  const [formData, setFormData] = useState({
    name: "",
    accountType: "Individual",
    address: "",
    city: "",
    pincode: "",
    country: "",
    whatsapp: "",
    skype: "",
  });

  // State for errors and loading
  const [errors, setErrors] = useState({ passwordMismatch: false });
  const [isLoading, setIsLoading] = useState(false);

  // Handle input changes for formData
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission (to be connected to backend later)
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Frontend validation
    if (password !== confirmPassword) {
      setErrors({ ...errors, passwordMismatch: true });
      return;
    }
    setErrors({ passwordMismatch: false });
    setIsLoading(true);
    try {
      const payload = {
        name: formData.name,
        email,
        password,
        account_type: formData.accountType,
        company_name: formData.accountType === "Company" ? formData.name : "",
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        country: formData.country,
      };
      const response = await axios.post("/api/auth/register", payload);
      setIsLoading(false);
      // Optionally, redirect or show success message
      // For now, just clear the form
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setFormData({
        name: "",
        accountType: "Individual",
        address: "",
        city: "",
        pincode: "",
        country: "",
        whatsapp: "",
        skype: "",
      });
      alert("Registration successful! Please login.");
      window.location.href = "/login";
    } catch (err) {
      setIsLoading(false);
      if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert("Registration failed. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-200 via-violet-100 to-white bg-purple-200 p-4">
      <div className="w-full max-w-md">
        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 mt-3">
              <span className="text-purple-800">Create</span> Your Account
            </h1>
            <p className="text-gray-600">
              Join EngageX and start growing your business
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent caret-black text-gray-700"
                required
              />
            </div>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent caret-black text-gray-700"
                required
              />
            </div>
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent caret-black text-gray-700"
                required
              />
            </div>
            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent caret-black text-gray-700"
                required
              />
              {errors.passwordMismatch && (
                <p className="text-red-500 text-sm mt-1">
                  Passwords do not match
                </p>
              )}
            </div>
            {/* Account Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 text-black">
                  <input
                    type="radio"
                    name="accountType"
                    value="Individual"
                    checked={formData.accountType === "Individual"}
                    onChange={handleChange}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span>Individual</span>
                </label>
                <label className="flex items-center space-x-2 text-black">
                  <input
                    type="radio"
                    name="accountType"
                    value="Company"
                    checked={formData.accountType === "Company"}
                    onChange={handleChange}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span>Company</span>
                </label>
              </div>
            </div>
            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent caret-black text-gray-700"
              />
            </div>
            {/* City + Pincode */}
            <div className="flex space-x-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent caret-black text-gray-700"
                />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent caret-black text-gray-700"
                />
              </div>
            </div>
            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent caret-black text-gray-700"
              />
            </div>
            {/* WhatsApp */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp Number
              </label>
              <input
                type="tel"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent caret-black text-gray-700"
              />
            </div>
            {/* Skype ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skype ID
              </label>
              <input
                type="text"
                name="skype"
                value={formData.skype}
                onChange={handleChange}
                placeholder="your.skype.id"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent caret-black text-gray-700"
              />
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2 px-4 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
            {/* Login Link */}
            <div className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{" "}
              <a href="/login" className="text-purple-600 hover:underline">
                Login
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;

// ----------------------
// Variable Comments:
// email: stores the user's email address
// password: stores the user's password
// confirmPassword: stores the value for confirming password
// formData: stores other form fields (name, accountType, address, city, pincode, country, whatsapp, skype)
// errors: stores error states, e.g., password mismatch
// isLoading: boolean for loading state during form submission
