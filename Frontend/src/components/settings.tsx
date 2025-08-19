import React, { useState, useEffect } from "react";
import { User, Users, FileText, X } from "lucide-react";
import {
  getAccountSettings,
  updateAccountSettings,
} from "../services/settings";

// --- Mock Components & Data ---

const LoggedInNavbar = ({ title }: { title: string }) => (
  <div className="flex justify-between items-center mb-6 pb-4 border-b">
    <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
    <div className="flex items-center space-x-4">
      <div className="w-10 h-10 bg-indigo-200 text-indigo-700 flex items-center justify-center rounded-full font-bold text-lg">
        JA
      </div>
    </div>
  </div>
);

// --- Main Settings Page Component ---

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("Account Details");

  const renderContent = () => {
    switch (activeTab) {
      // case 'Team': // Team tab is not supported by backend yet
      //   return <TeamTab />;
      case "Agreement":
        return <AgreementTab />;
      case "Account Details":
      default:
        return <AccountDetailsTab />;
    }
  };

  const tabs = ["Account Details", /*'Team',*/ "Agreement"]; // Team tab is not supported by backend yet

  return (
    <div className="bg-gray-50 min-h-screen p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <LoggedInNavbar title="Settings" />
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

const AccountDetailsTab = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    skypeId: "",
    publisherName: "",
    publisherEmail: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccountDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAccountSettings();
        setFormData({
          firstName: response.data.first_name || "",
          lastName: response.data.last_name || "",
          email: response.data.email || "",
          phone: response.data.phone || "",
          skypeId: response.data.skype_id || "",
          publisherName: response.data.publisher_name || "",
          publisherEmail: response.data.publisher_email || "",
        });
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
      setLoading(false);
    }
  };

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

  return (
    <form
      onSubmit={handleSave}
      className="bg-white p-8 rounded-lg shadow-sm border"
    >
      {/* User Details */}
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
              🇮🇳 +91
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
          className="text-sm text-indigo-600 hover:underline mt-4"
        >
          Change Password
        </button>
      </div>

      {/* Publisher Details */}
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
              readOnly
              className="w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button
          type="submit"
          className="bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-indigo-700"
        >
          Save
        </button>
      </div>
    </form>
  );
};

// --- Team Tab ---

const TeamTab = () => {
  // Team routes are not implemented on BE; UI can stay visible but calls should be disabled/commented until added.
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

// --- Invite Member Modal ---

// Commented out as TeamTab is not implemented on BE
// const InviteMemberModal = ({ isOpen, onClose, onInvite }) => {
//     const [email, setEmail] = useState('');
//     if (!isOpen) return null;

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         if (email) {
//             onInvite(email);
//             setEmail('');
//         }
//     };

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//             <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
//                 <h3 className="text-lg font-semibold mb-4">Invite Member</h3>
//                 <form onSubmit={handleSubmit}>
//                     <input
//                         type="email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         placeholder="Enter email to invite"
//                         className="w-full p-2 border rounded-md mb-4"
//                         required
//                     />
//                     <div className="flex justify-end gap-4">
//                         <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
//                             Cancel
//                         </button>
//                         <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
//                             Invite
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

export default SettingsPage;
