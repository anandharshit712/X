import React, { useState, useEffect, useRef } from "react";
import { User, Users, FileText, X, LogOut, Eye, EyeOff } from "lucide-react";
import { changePassword } from "../services/auth";
// --- FIX: Mocking the service functions to resolve the import error ---
// In a real application, you would import these from your services file.
const getAccountSettings = async () => {
  // Simulating a network request
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          ok: true,
          data: {
            advertiser_id: "1",
            name: "Priya Sharma", // Using a full name for better testing
            email: "priya31@gmail.com",
            account_type: "Individual",
            company_name: null,
            address: "jp nagar",
            city: "banglore",
            pincode: "897642",
            country: "India",
            personal_email: null,
            whatsapp_number: "9876543210", // Added phone number
            skype_id: "priya.sharma",
            created_at: null,
            publisher_name: "Priya Publications",
            publisher_email: "contact@priyapub.com",
          },
        },
      });
    }, 500);
  });
};

const updateAccountSettings = async (settings: any) => {
  // Simulating a network request
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Updated settings:", settings);
      resolve({ ok: true });
    }, 500);
  });
};

// --- Change Password Modal Component ---
const ChangePasswordModal = ({
  isOpen,
  onClose,
  userEmail,
}: {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}) => {
  const [view, setView] = useState("change"); // 'change', 'forgot', 'confirmation'
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState(userEmail);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isOpen) return null;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }

    try {
      await changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      alert("Password changed successfully.");
      // optional cleanup:
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onClose();

      // optional: enforce re-login after change
      // localStorage.removeItem("token");
      // window.location.href = "/login";
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to change password.";
      alert(msg);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Password reset link sent to:", forgotEmail);
    setView("confirmation");
  };

  const renderChangeView = () => (
    <form onSubmit={handleChangePassword}>
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Change Password
      </h3>
      <div className="space-y-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Old Password
          </label>
          <input
            type={showOld ? "text" : "password"}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full p-2 border rounded-md pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowOld(!showOld)}
            className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-500"
          >
            {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <input
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 border rounded-md pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-500"
          >
            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 border rounded-md pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-500"
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setView("forgot")}
        className="text-sm text-indigo-600 hover:underline mt-2"
      >
        Forgot Password?
      </button>
      <div className="flex justify-end gap-4 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Update
        </button>
      </div>
    </form>
  );

  const renderForgotView = () => (
    <form onSubmit={handleForgotPassword}>
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Forgot Password
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Enter your email address and we will send you a link to reset your
        password.
      </p>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email ID
        </label>
        <input
          type="email"
          value={forgotEmail}
          onChange={(e) => setForgotEmail(e.target.value)}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>
      <div className="flex justify-end gap-4 mt-6">
        <button
          type="button"
          onClick={() => setView("change")}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Back
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Send Reset Link
        </button>
      </div>
    </form>
  );

  const renderConfirmationView = () => (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Check your email
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        We've sent a password reset link to <strong>{forgotEmail}</strong>.
        Please check your inbox and follow the instructions.
      </p>
      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          OK
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        {view === "change" && renderChangeView()}
        {view === "forgot" && renderForgotView()}
        {view === "confirmation" && renderConfirmationView()}
      </div>
    </div>
  );
};

// --- Profile Dropdown Component ---

const ProfileDropdown = ({
  user,
  onLogout,
}: {
  user: any;
  onLogout: () => void;
}) => {
  if (!user) return null;

  return (
    <div className="absolute top-14 right-0 w-64 bg-white rounded-lg shadow-lg border z-10">
      <div className="p-4 border-b">
        <p className="font-semibold text-gray-800">{user.name}</p>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>
      <div className="p-2">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
};

// --- Navigation Bar Component ---

const LoggedInNavbar = ({ title, user }: { title: string; user: any }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getInitials = (name: string = "") => {
    if (!name) return "...";
    const parts = name.trim().split(" ");
    if (parts.length > 1 && parts[1]) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleLogout = () => {
    console.log("Logout clicked!");
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex justify-between items-center mb-6 pb-4 border-b">
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-10 h-10 bg-indigo-200 text-indigo-700 flex items-center justify-center rounded-full font-bold text-lg cursor-pointer"
        >
          {getInitials(user?.name)}
        </button>
        {isDropdownOpen && (
          <ProfileDropdown user={user} onLogout={handleLogout} />
        )}
      </div>
    </div>
  );
};

// --- Main Settings Page Component ---

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("Account Details");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccountDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response: any = await getAccountSettings();
        setUserData(response.data.data);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Failed to fetch account details."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAccountDetails();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="bg-white p-8 rounded-lg shadow-sm border">
          Loading account details...
        </div>
      );
    }
    if (error) {
      return (
        <div className="bg-white p-8 rounded-lg shadow-sm border text-red-500">
          Error: {error}
        </div>
      );
    }

    switch (activeTab) {
      case "Agreement":
        return <AgreementTab />;
      case "Account Details":
      default:
        return <AccountDetailsTab userData={userData} />;
    }
  };

  const tabs = ["Account Details", "Agreement"];

  return (
    <div className="bg-gray-50 min-h-screen p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <LoggedInNavbar title="Settings" user={userData} />
        <div className="flex items-center space-x-2 border-b mb-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
                activeTab === tab
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

// --- Account Details Tab ---

const AccountDetailsTab = ({ userData }: { userData: any }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    skypeId: "",
    publisherName: "",
    publisherEmail: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (userData) {
      const nameParts = (userData.name || "").trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      setFormData({
        firstName: firstName,
        lastName: lastName,
        email: userData.email || "",
        phone: userData.whatsapp_number || "",
        skypeId: userData.skype_id || "",
        publisherName: userData.publisher_name || "",
        publisherEmail: userData.publisher_email || "",
      });
    }
  }, [userData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      await updateAccountSettings({
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        skype_id: formData.skypeId,
        publisher_name: formData.publisherName,
        publisher_email: formData.publisherEmail,
      });
      alert("Account details saved successfully!");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save details.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSave}
        className="bg-white p-8 rounded-lg shadow-sm border"
      >
        {error && <div className="mb-4 text-red-500">Error: {error}</div>}

        <div className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            User Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email ID <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone No <span className="text-red-500">*</span>
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50 text-sm text-gray-600">
                🇮� +91
              </span>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-r-md"
              />
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skype ID
            </label>
            <input
              type="text"
              name="skypeId"
              value={formData.skypeId}
              onChange={handleInputChange}
              placeholder="Enter your Skype ID"
              className="w-full p-2 border rounded-md"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="text-sm text-indigo-600 hover:underline mt-4"
          >
            Change Password
          </button>
        </div>

        <div className="border-t pt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Publisher Details
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Publisher Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="publisherName"
                value={formData.publisherName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Publisher Email
              </label>
              <input
                type="email"
                name="publisherEmail"
                value={formData.publisherEmail}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
      <ChangePasswordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userEmail={formData.email}
      />
    </>
  );
};

// --- Team Tab ---

const TeamTab = () => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Team Members (Backend Not Implemented)
      </h2>
      <p className="text-gray-500">
        Team management features are not yet available.
      </p>
    </div>
  );
};

// --- Agreement Tab ---

const AgreementTab = () => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Agreement</h2>
      <p className="text-gray-500">Agreement details will be displayed here.</p>
    </div>
  );
};

export default SettingsPage;
