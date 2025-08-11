import React, { useState, useEffect } from 'react';

// --- Mock Components & Data ---

const LoggedInNavbar = ({ title }) => (
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
    name: '',
    country: 'India',
    payoutCurrency: 'INR',
    // Bank Details
    beneficiaryName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    // Company Details
    gstNo: '',
    panNo: '',
    // Billing Address
    billingCountry: 'India',
    state: '',
    streetAddress: '',
    locality: '',
    pinCode: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    // In a real application, you would send this data to your backend.
    console.log("Saving data to backend:", formData);
    // Here you can add your API call logic.
    alert("Changes saved! (Check console for data)");
  };
  
  // Reusable input component for consistency
  const InputField = ({ label, name, value, onChange, placeholder = '', required = false }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>
  );
  
  // Reusable select component for consistency
  const SelectField = ({ label, name, value, onChange, children, required = false }) => (
     <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
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


  return (
    <div className="bg-gray-50 min-h-screen p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <LoggedInNavbar title="Billing" />
        
        <form onSubmit={handleSaveChanges} className="space-y-8">
          {/* Billing Details Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Billing Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Name" name="name" value={formData.name} onChange={handleInputChange} required />
              <SelectField label="Country" name="country" value={formData.country} onChange={handleInputChange} required>
                <option value="India">India</option>
                <option value="USA">United States</option>
                <option value="Canada">Canada</option>
              </SelectField>
              <SelectField label="Payout" name="payoutCurrency" value={formData.payoutCurrency} onChange={handleInputChange} required>
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
              </SelectField>
            </div>
          </div>

          {/* Bank Details Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Bank Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Beneficiary Name" name="beneficiaryName" value={formData.beneficiaryName} onChange={handleInputChange} required />
              <InputField label="Bank Name" name="bankName" value={formData.bankName} onChange={handleInputChange} required />
              <InputField label="Account Number" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} required />
              <InputField label="IFSC Code" name="ifscCode" value={formData.ifscCode} onChange={handleInputChange} required />
            </div>
          </div>

          {/* Company Details Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Company Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="GST No" name="gstNo" value={formData.gstNo} onChange={handleInputChange} />
              <InputField label="Pan No" name="panNo" value={formData.panNo} onChange={handleInputChange} required />
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Still feel you have entered the wrong GST and PAN Number, Don't worry, <a href="#" className="text-indigo-600 hover:underline">Contact our billing support here</a>
            </p>
          </div>

          {/* Billing Address Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Billing Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectField label="Country" name="billingCountry" value={formData.billingCountry} onChange={handleInputChange} required>
                    <option value="India">India</option>
                    <option value="USA">United States</option>
                    <option value="Canada">Canada</option>
                </SelectField>
                <InputField label="State" name="state" value={formData.state} onChange={handleInputChange} required />
            </div>
            <div className="mt-6">
                <InputField label="Door No./ Building/ Street Area" name="streetAddress" value={formData.streetAddress} onChange={handleInputChange} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <InputField label="Locality/ Town" name="locality" value={formData.locality} onChange={handleInputChange} required />
                <InputField label="Pin Code/Postal Code" name="pinCode" value={formData.pinCode} onChange={handleInputChange} required />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button type="submit" className="bg-indigo-600 text-white font-semibold px-6 py-2.5 rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BillingPage;

/*
---
BACKEND INTEGRATION AND CODE SUMMARY
---

This document provides a summary of the state variables used in the `BillingPage` component and instructions for connecting it to a live backend API.

### Code Summary

The `BillingPage` component is a single form designed to collect and save a user's billing, bank, company, and address information.

-   **`formData` (State Object):**
    -   This is the core state variable that holds all the values from the form fields.
    -   It's a single object where each key corresponds to an input field's `name` attribute (e.g., `name`, `beneficiaryName`, `gstNo`, `streetAddress`).
    -   Using a single state object simplifies managing form data and preparing it for submission.

-   **`handleInputChange` (Function):**
    -   A generic handler for all input and select fields.
    -   It dynamically updates the correct key in the `formData` state object based on the input's `name`.

-   **`handleSaveChanges` (Function):**
    -   This function is triggered when the "Save Changes" button is clicked.
    -   It currently logs the `formData` to the console. This is the designated place to add your API call to send the data to the backend.

### Backend Integration

To make this form functional, you need to send the collected data to your server.

1.  **API Endpoint:**
    -   You will need a backend endpoint, for example, `POST /api/user/billing-details` or `PUT /api/user/billing-details`, that accepts the billing information. A `PUT` request is often suitable for updates.

2.  **Modify `handleSaveChanges`:**
    -   Inside this function, replace the `console.log` with an API call using a library like `axios` or the native `fetch` API.

    -   **Example using `fetch`:**
        ```javascript
        const handleSaveChanges = async (e) => {
            e.preventDefault();
            
            // Optional: Map frontend field names to backend-expected names if they differ.
            const payload = {
                name: formData.name,
                country: formData.country,
                payout_currency: formData.payoutCurrency,
                beneficiary_name: formData.beneficiaryName,
                bank_name: formData.bankName,
                account_number: formData.accountNumber,
                ifsc_code: formData.ifscCode,
                gst_number: formData.gstNo,
                pan_number: formData.panNo,
                address: {
                    country: formData.billingCountry,
                    state: formData.state,
                    street: formData.streetAddress,
                    locality: formData.locality,
                    pincode: formData.pinCode
                }
            };

            try {
                // const response = await fetch('/api/user/billing-details', {
                //     method: 'POST', // or 'PUT'
                //     headers: {
                //         'Content-Type': 'application/json',
                //         // Include authorization headers if needed, e.g., 'Authorization': `Bearer ${token}`
                //     },
                //     body: JSON.stringify(payload),
                // });

                // if (!response.ok) {
                //     throw new Error('Failed to save billing details');
                // }

                // const result = await response.json();
                // console.log('Successfully saved:', result);
                alert("Billing details saved successfully!");

            } catch (error) {
                console.error("Error saving billing details:", error);
                alert("An error occurred while saving. Please try again.");
            }
        };
        ```

3.  **Loading Initial Data:**
    -   If you need to pre-fill the form with existing data, use a `useEffect` hook to fetch the user's current billing details when the component mounts and update the `formData` state.

    -   **Example `useEffect` for loading data:**
        ```javascript
        useEffect(() => {
            const fetchBillingData = async () => {
                try {
                    // const response = await fetch('/api/user/billing-details');
                    // if (!response.ok) throw new Error('Failed to fetch data');
                    // const data = await response.json();
                    
                    // Map backend data to frontend state structure
                    // setFormData({
                    //     name: data.name || '',
                    //     country: data.country || 'India',
                    //     payoutCurrency: data.payout_currency || 'INR',
                    //     beneficiaryName: data.beneficiary_name || '',
                    //     bankName: data.bank_name || '',
                    //     accountNumber: data.account_number || '',
                    //     ifscCode: data.ifsc_code || '',
                    //     gstNo: data.gst_number || '',
                    //     panNo: data.pan_number || '',
                    //     billingCountry: data.address?.country || 'India',
                    //     state: data.address?.state || '',
                    //     streetAddress: data.address?.street || '',
                    //     locality: data.address?.locality || '',
                    //     pinCode: data.address?.pincode || '',
                    // });
                } catch (error) {
                    console.error("Error fetching billing data:", error);
                }
            };

            fetchBillingData();
        }, []); // The empty array ensures this runs only once when the component mounts.
        ```
*/
