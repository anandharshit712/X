import React, { useState, useEffect } from 'react';
import { User, Users, FileText, X } from 'lucide-react';

// --- Mock Components & Data ---

const LoggedInNavbar = ({ title }) => (
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
  const [activeTab, setActiveTab] = useState('Account Details');

  const renderContent = () => {
    switch (activeTab) {
      case 'Team':
        return <TeamTab />;
      case 'Agreement':
        return <AgreementTab />;
      case 'Account Details':
      default:
        return <AccountDetailsTab />;
    }
  };

  const tabs = ['Account Details', 'Team', 'Agreement'];

  return (
    <div className="bg-gray-50 min-h-screen p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <LoggedInNavbar title="Settings" />
        <div className="flex items-center space-x-2 border-b mb-8">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-200'
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
        firstName: '',
        lastName: '',
        email: 'user@example.com', // Assuming this is pre-filled and read-only
        phone: '',
        skypeId: '',
        publisherName: '',
        publisherEmail: 'publisher@example.com', // Assuming this is pre-filled and read-only
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        console.log("Saving Account Details:", formData);
        alert("Account details saved! (Check console for data)");
    };

    return (
        <form onSubmit={handleSave} className="bg-white p-8 rounded-lg shadow-sm border">
            {/* User Details */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">User Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
                        <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full p-2 border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full p-2 border rounded-md" />
                    </div>
                </div>
                <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email ID <span className="text-red-500">*</span></label>
                    <input type="email" name="email" value={formData.email} readOnly className="w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed" />
                </div>
                <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone No <span className="text-red-500">*</span></label>
                    <div className="flex">
                        <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50 text-sm text-gray-600">🇮🇳 +91</span>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full p-2 border rounded-r-md" />
                    </div>
                </div>
                <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Skype ID</label>
                    <input type="text" name="skypeId" value={formData.skypeId} onChange={handleInputChange} placeholder="Enter your Skype ID" className="w-full p-2 border rounded-md" />
                </div>
                <button type="button" className="text-sm text-indigo-600 hover:underline mt-4">Change Password</button>
            </div>

            {/* Publisher Details */}
            <div className="border-t pt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Publisher Details</h2>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Publisher Name <span className="text-red-500">*</span></label>
                        <input type="text" name="publisherName" value={formData.publisherName} onChange={handleInputChange} className="w-full p-2 border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Publisher Email</label>
                        <input type="email" name="publisherEmail" value={formData.publisherEmail} readOnly className="w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed" />
                    </div>
                </div>
            </div>

            <div className="flex justify-end mt-8">
                <button type="submit" className="bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-indigo-700">
                    Save
                </button>
            </div>
        </form>
    );
};

// --- Team Tab ---

const TeamTab = () => {
    const [teamMembers, setTeamMembers] = useState([]);
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);

    const handleInvite = (email) => {
        // In a real app, this would send an invite and update the list upon success
        console.log(`Inviting ${email}`);
        setInviteModalOpen(false);
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
                <button onClick={() => setInviteModalOpen(true)} className="bg-indigo-600 text-white font-semibold px-5 py-2 rounded-lg shadow-md hover:bg-indigo-700">
                    Invite Member
                </button>
            </div>
            <div>
                {teamMembers.length === 0 ? (
                    <p className="text-gray-500">No team members found.</p>
                ) : (
                    <div>{/* Map over team members here */}</div>
                )}
            </div>
            <InviteMemberModal isOpen={isInviteModalOpen} onClose={() => setInviteModalOpen(false)} onInvite={handleInvite} />
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

const InviteMemberModal = ({ isOpen, onClose, onInvite }) => {
    const [email, setEmail] = useState('');
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email) {
            onInvite(email);
            setEmail('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                <h3 className="text-lg font-semibold mb-4">Invite Member</h3>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email to invite"
                        className="w-full p-2 border rounded-md mb-4"
                        required
                    />
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                            Invite
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SettingsPage;

/*
---
BACKEND INTEGRATION AND CODE SUMMARY
---

This document provides a summary of the state variables and logic used in the `SettingsPage` component, along with instructions for backend integration.

### Code Summary

The main component `SettingsPage` acts as a container that manages the active tab.

-   **`activeTab` (State String):**
    -   Controls which of the three main sections ('Account Details', 'Team', 'Agreement') is currently visible.

-   **`AccountDetailsTab` Component:**
    -   `formData` (State Object): Holds all the values for the user and publisher details form. This single object makes it easy to manage and submit the form data.
    -   `handleInputChange`: A generic function to update the `formData` state.
    -   `handleSave`: The submission handler where the API call to save data should be placed.

-   **`TeamTab` Component:**
    -   `teamMembers` (State Array): Stores the list of team members fetched from the backend.
    -   `isInviteModalOpen` (State Boolean): Toggles the visibility of the invite modal.

-   **`InviteMemberModal` Component:**
    -   `email` (State String): Manages the value of the email input field within the modal.

### Backend Integration

To make this page functional, you'll need to connect it to your backend API endpoints.

1.  **Loading Initial Settings Data:**
    -   In the `AccountDetailsTab` component, you should use a `useEffect` hook to fetch the user's current settings when the component loads.

    -   **Example `useEffect` for Account Details:**
        ```javascript
        useEffect(() => {
            // const fetchAccountDetails = async () => {
            //     try {
            //         // const response = await fetch('/api/settings/account');
            //         // const data = await response.json();
            //         // setFormData({
            //         //     firstName: data.firstName || '',
            //         //     lastName: data.lastName || '',
            //         //     email: data.email || '',
            //         //     phone: data.phone || '',
            //         //     skypeId: data.skypeId || '',
            //         //     publisherName: data.publisherName || '',
            //         //     publisherEmail: data.publisherEmail || '',
            //         // });
            //     } catch (error) {
            //         console.error("Failed to fetch account details:", error);
            //     }
            // };
            // fetchAccountDetails();
        }, []); // Empty array ensures it runs once on mount.
        ```

2.  **Saving Account Details:**
    -   Modify the `handleSave` function in `AccountDetailsTab` to send a `POST` or `PUT` request with the `formData`.

    -   **Example `handleSave` update:**
        ```javascript
        const handleSave = async (e) => {
            e.preventDefault();
            try {
                // const response = await fetch('/api/settings/account', {
                //     method: 'PUT',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify(formData),
                // });
                // if (!response.ok) throw new Error('Save failed');
                alert("Account details saved successfully!");
            } catch (error) {
                console.error("Error saving account details:", error);
                alert("Failed to save details.");
            }
        };
        ```

3.  **Fetching and Inviting Team Members:**
    -   In the `TeamTab` component, use `useEffect` to fetch the list of team members.
    -   In the `handleInvite` function, make a `POST` request to your backend to send an invitation.

    -   **Example for TeamTab:**
        ```javascript
        // Inside TeamTab component
        // useEffect(() => {
        //     // fetch('/api/settings/team').then(res => res.json()).then(setTeamMembers);
        // }, []);

        const handleInvite = async (email) => {
            try {
                // await fetch('/api/settings/team/invite', {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify({ email }),
                // });
                // // Refetch team members or add the new invite to the list locally
                setInviteModalOpen(false);
            } catch (error) {
                console.error("Failed to send invite:", error);
            }
        };
        ```

4.  **Expected API Data Formats:**
    -   **GET `/api/settings/account`**: Should return a JSON object with keys matching the `formData` state.
    -   **GET `/api/settings/team`**: Should return an array of team member objects.
    -   **POST `/api/settings/team/invite`**: Should accept a JSON payload like `{ "email": "member@example.com" }`.
*/
