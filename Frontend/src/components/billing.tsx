import React, { useState, useEffect } from "react";
import { getBillingDetails, upsertBillingDetails } from "../services/billing";

// --- Mock Components & Data ---

const LoggedInNavbar = ({ title }: { title: string }) => (
  <div className="flex justify-between items-center mb-10 pb-4 border-b">
    <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
    <div className="flex items-center space-x-4">
      <div className="w-10 h-10 bg-indigo-200 text-indigo-700 flex items-center justify-center rounded-full font-bold text-lg">
        JA
      </div>
    </div>
  </div>
);

// --- Main Billing Page Component ---

const BillingPage = () => {
  const [formData, setFormData] = useState({
    // Billing Details
    name: "",
    country: "India",
    payoutCurrency: "INR",
    // Bank Details
    beneficiaryName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    // Company Details
    gstNo: "",
    panNo: "",
    // Billing Address
    billingCountry: "India",
    state: "",
    streetAddress: "",
    locality: "",
    pinCode: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBillingData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getBillingDetails();
        const data = response.data;
        setFormData({
          name: data.name || "",
          country: data.country || "India",
          payoutCurrency: data.payout_currency || "INR",
          beneficiaryName: data.beneficiary_name || "",
          bankName: data.bank_name || "",
          accountNumber: data.account_number || "",
          ifscCode: data.ifsc_code || "",
          gstNo: data.gstin || "",
          panNo: data.pan || "",
          billingCountry: data.address?.country || "India",
          state: data.address?.state || "",
          streetAddress: data.address?.street || "",
          locality: data.address?.locality || "",
          pinCode: data.address?.pincode || "",
        });
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Failed to fetch billing data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Map frontend formData to backend payload
      const payload = {
        beneficiary_name: formData.beneficiaryName,
        account_number: formData.accountNumber,
        ifsc_code: formData.ifscCode,
        pan: formData.panNo,
        gstin: formData.gstNo,
        bank_name: formData.bankName,
        // The backend does not support all fields from the frontend form (e.g., name, country, payoutCurrency, full address details)
        // Only sending fields supported by the backend's upsertBillingDetails
      };
      await upsertBillingDetails(payload);
      alert("Billing details saved successfully!");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to save billing details."
      );
    } finally {
      setLoading(false);
    }
  };

  // Reusable input component for consistency
  const InputField = ({
    label,
    name,
    value,
    onChange,
    placeholder = "",
    required = false,
    readOnly = false,
  }) => (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>
  );

  // Reusable select component for consistency
  const SelectField = ({
    label,
    name,
    value,
    onChange,
    children,
    required = false,
  }) => (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
      >
        {children}
      </select>
    </div>
  );

  if (loading) {
    return <div className="flex-1 p-8 min-h-screen bg-gray-50">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex-1 p-8 min-h-screen bg-gray-50 text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <LoggedInNavbar title="Billing" />

        <form onSubmit={handleSaveChanges} className="space-y-8">
          {/* Billing Details Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Billing Details
            </h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Some fields (Name, Country, Payout Currency, and full
              Billing Address) are not currently supported by the backend API
              and will not be saved.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <SelectField
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                required
              >
                <option value="India">India</option>
                <option value="USA">United States</option>
                <option value="Canada">Canada</option>
              </SelectField>
              <SelectField
                label="Payout"
                name="payoutCurrency"
                value={formData.payoutCurrency}
                onChange={handleInputChange}
                required
              >
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
              </SelectField>
            </div>
          </div>

          {/* Bank Details Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Bank Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Beneficiary Name"
                name="beneficiaryName"
                value={formData.beneficiaryName}
                onChange={handleInputChange}
                required
              />
              <InputField
                label="Bank Name"
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                required
              />
              <InputField
                label="Account Number"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                required
              />
              <InputField
                label="IFSC Code"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Company Details Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Company Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="GST No"
                name="gstNo"
                value={formData.gstNo}
                onChange={handleInputChange}
              />
              <InputField
                label="Pan No"
                name="panNo"
                value={formData.panNo}
                onChange={handleInputChange}
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Still feel you have entered the wrong GST and PAN Number, Don't
              worry,{" "}
              <a href="#" className="text-indigo-600 hover:underline">
                Contact our billing support here
              </a>
            </p>
          </div>

          {/* Billing Address Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Billing Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                label="Country"
                name="billingCountry"
                value={formData.billingCountry}
                onChange={handleInputChange}
                required
              >
                <option value="India">India</option>
                <option value="USA">United States</option>
                <option value="Canada">Canada</option>
              </SelectField>
              <InputField
                label="State"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mt-6">
              <InputField
                label="Door No./ Building/ Street Area"
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <InputField
                label="Locality/ Town"
                name="locality"
                value={formData.locality}
                onChange={handleInputChange}
                required
              />
              <InputField
                label="Pin Code/Postal Code"
                name="pinCode"
                value={formData.pinCode}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-indigo-600 text-white font-semibold px-6 py-2.5 rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BillingPage;
