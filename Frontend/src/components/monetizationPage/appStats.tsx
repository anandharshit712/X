import React, { useState, useEffect } from 'react';
import { Search, Upload, Plus, X } from 'lucide-react';

// --- MOCK DATA AND TYPES ---

// Defines the structure for an application object
interface AppData {
  id: string;
  name: string;
  logo: string;
  dateAdded: string;
}

// Defines the structure for a campaign object
interface Campaign {
  appId: string;
  campaignName: string;
  budget: string;
}

// Initial mock data for apps already added by the user
const initialApps: AppData[] = [
  {
    id: '31892242',
    name: 'Instagram',
    logo: 'https://placehold.co/100x100/E1306C/white?text=IG',
    dateAdded: '20.05.2025',
  },
  {
    id: '31892243',
    name: 'WhatsApp',
    logo: 'https://placehold.co/100x100/25D366/white?text=WA',
    dateAdded: '20.05.2025',
  },
];

// Mock data for search results
const appSearchResults: AppData[] = [
    { id: '1', name: 'TikTok', logo: 'https://placehold.co/100x100/000000/white?text=TT', dateAdded: '' },
    { id: '2', name: 'Twitter (X)', logo: 'https://placehold.co/100x100/1DA1F2/white?text=X', dateAdded: '' },
    { id: '3', name: 'Snapchat', logo: 'https://placehold.co/100x100/FFFC00/black?text=SC', dateAdded: '' },
];


// --- HELPER COMPONENTS ---

// Navbar placeholder
const LoggedInNavbar = ({ title }: { title: string }) => (
  <div className="flex justify-between items-center mb-8">
    <h1 className="text-4xl font-bold text-gray-800">{title}</h1>
    <div className="flex items-center space-x-4">
      <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
        JA
      </div>
    </div>
  </div>
);


// --- MAIN COMPONENT ---

const ManageAppsPage = () => {
  // State for managing the list of apps and campaigns
  const [apps, setApps] = useState<AppData[]>(initialApps);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // State for controlling modals
  const [isAddAppModalOpen, setAddAppModalOpen] = useState(false);
  const [isManualAddModalOpen, setManualAddModalOpen] = useState(false);
  const [isCampaignModalOpen, setCampaignModalOpen] = useState(false);

  // State for the "Add App" search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredApps, setFilteredApps] = useState<AppData[]>(appSearchResults);

  // State for the "Add Manually" form
  const [manualAppName, setManualAppName] = useState('');
  const [manualAppId, setManualAppId] = useState('');
  const [appIcon, setAppIcon] = useState<string | null>(null);
  const [fileError, setFileError] = useState('');

  // State for the "Create Campaign" form
  const [selectedApp, setSelectedApp] = useState<AppData | null>(null);
  const [campaignName, setCampaignName] = useState('');
  const [campaignBudget, setCampaignBudget] = useState('');

  // Effect to filter search results based on query
  useEffect(() => {
    if (searchQuery) {
      setFilteredApps(
        appSearchResults.filter((app) =>
          app.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredApps(appSearchResults);
    }
  }, [searchQuery]);

  // Handler for image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (file.type !== 'image/png') {
      setFileError('Only PNG files are supported.');
      return;
    }
    if (file.size > 500 * 1024) {
      setFileError('File size cannot exceed 500KB.');
      return;
    }

    // Validate image ratio
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        if (img.width !== img.height) {
          setFileError('Image must have a 1:1 aspect ratio.');
        } else {
          setAppIcon(reader.result as string);
          setFileError('');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handler to add an app from search results
  const handleAddApp = (app: AppData) => {
    setApps((prev) => [...prev, app]);
    setAddAppModalOpen(false);
    setSearchQuery('');
  };

  // Handler for submitting the manual add form
  const handleManualAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAppName || !manualAppId || !appIcon) {
        alert("Please fill all fields and upload an icon.");
        return;
    }
    const newApp: AppData = {
      id: manualAppId,
      name: manualAppName,
      logo: appIcon,
      dateAdded: new Date().toLocaleDateString('en-GB'),
    };
    setApps((prev) => [...prev, newApp]);
    setManualAddModalOpen(false);
    // Reset form
    setManualAppName('');
    setManualAppId('');
    setAppIcon(null);
  };
  
  // Handler for submitting the create campaign form
  const handleCampaignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(selectedApp) {
        const newCampaign: Campaign = {
            appId: selectedApp.id,
            campaignName,
            budget: campaignBudget,
        };
        setCampaigns(prev => [...prev, newCampaign]);
        setCampaignModalOpen(false);
        // Reset form
        setCampaignName('');
        setCampaignBudget('');
        setSelectedApp(null);
    }
  };

  return (
    <div className="flex-1 p-8 min-h-screen bg-gray-50">
      <LoggedInNavbar title="My Apps" />

      <div className="flex justify-end mb-6">
        <button
          onClick={() => setAddAppModalOpen(true)}
          className="flex items-center gap-2 py-3 px-5 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-all shadow-lg"
        >
          <Plus size={20} />
          Add New App
        </button>
      </div>

      {/* App Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {apps.map((app) => (
          <div
            key={app.id}
            className="p-5 bg-white rounded-2xl shadow-md border border-gray-200 flex flex-col items-start gap-3 transition-transform duration-300 transform hover:scale-105"
          >
            <div className="flex items-center gap-3 w-full mb-2">
              <img
                src={app.logo}
                alt={`${app.name} Logo`}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <span className="text-gray-800 text-lg font-semibold">
                {app.name}
              </span>
            </div>
            <button
              onClick={() => {
                setSelectedApp(app);
                setCampaignModalOpen(true);
              }}
              className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg hover:bg-purple-200 text-sm font-semibold shadow-sm transition-all self-start mb-2"
            >
              + Create Campaign
            </button>
            <div className="text-sm text-gray-600">
              <strong>App ID:</strong> {app.id}
            </div>
            <div className="text-sm text-gray-600">
              <strong>Date of Creation:</strong> {app.dateAdded}
            </div>
            <div className="text-sm text-gray-600">
              <strong>Campaigns:</strong> {campaigns.filter(c => c.appId === app.id).length}
            </div>
          </div>
        ))}
      </div>

      {/* Add App Modal */}
      {isAddAppModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold text-black mb-4">Add Your App</h2>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="Search Apps..."
              />
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto">
                {filteredApps.map(app => (
                    <div key={app.id} onClick={() => handleAddApp(app)} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition">
                        <img src={app.logo} alt={app.name} className="w-10 h-10 rounded-md"/>
                        <span className="font-semibold">{app.name}</span>
                    </div>
                ))}
            </div>
            <p className="text-center text-gray-600 my-4">
              Can't find your app?{' '}
              <button
                onClick={() => {
                  setAddAppModalOpen(false);
                  setManualAddModalOpen(true);
                }}
                className="text-purple-600 font-semibold hover:underline"
              >
                Add Manually
              </button>
            </p>
            <button
              onClick={() => setAddAppModalOpen(false)}
              className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add App Manually Modal */}
      {isManualAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleManualAddSubmit} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg">
            <h2 className="text-2xl font-bold text-black mb-6">Add App Manually</h2>
            <div className="space-y-4">
              <input type="text" placeholder="App Name" value={manualAppName} onChange={e => setManualAppName(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" required />
              <input type="text" placeholder="App ID" value={manualAppId} onChange={e => setManualAppId(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" required />
              
              <div className="border border-dashed border-gray-300 p-4 rounded-lg text-center">
                <label htmlFor="app-icon-upload" className="cursor-pointer">
                    {appIcon ? <img src={appIcon} alt="App Icon Preview" className="w-24 h-24 mx-auto rounded-full object-cover"/> : 
                        <div className="w-24 h-24 mx-auto rounded-full bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                            <Upload size={32}/>
                            <span className="text-sm mt-1">Upload Icon</span>
                        </div>
                    }
                </label>
                <input id="app-icon-upload" type="file" accept="image/png" onChange={handleImageChange} className="hidden" />
                <div className="text-xs text-gray-500 mt-2">
                    <p>Max Size: 500KB</p>
                    <p>Format: PNG, Ratio: 1:1</p>
                </div>
                {fileError && <p className="text-red-500 text-sm mt-2">{fileError}</p>}
              </div>

            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button type="button" onClick={() => setManualAddModalOpen(false)} className="py-2 px-6 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold">Cancel</button>
              <button type="submit" className="py-2 px-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold">Save App</button>
            </div>
          </form>
        </div>
      )}

      {/* Create Campaign Modal */}
      {isCampaignModalOpen && selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCampaignSubmit} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold text-black mb-4">Create Campaign for {selectedApp.name}</h2>
            <div className="space-y-4">
                <input type="text" placeholder="Campaign Name" value={campaignName} onChange={e => setCampaignName(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" required />
                <input type="number" placeholder="Budget (₹)" value={campaignBudget} onChange={e => setCampaignBudget(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" required />
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button type="button" onClick={() => setCampaignModalOpen(false)} className="py-2 px-6 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold">Cancel</button>
              <button type="submit" className="py-2 px-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold">Save Campaign</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageAppsPage;

/*
* =================================================================
* == COMPONENT, STATE, AND INTEGRATION DOCUMENTATION
* =================================================================
*
* === COMPONENT: ManageAppsPage ===
* - Purpose: This is the main page for users to view their added applications,
* add new ones (either by searching or manually), and create advertising
* campaigns for them.
*
* === STATE VARIABLES ===
*
* - `apps` (Array<AppData>):
* - Holds the list of application objects that the user has added.
* - Each object contains: `id`, `name`, `logo`, `dateAdded`.
* - For backend integration: This state should be initialized by fetching the user's
* apps from your database. When a new app is added, a POST request should be sent,
* and this state updated with the response.
*
* - `campaigns` (Array<Campaign>):
* - Stores all campaigns created by the user across all their apps.
* - Each object contains: `appId`, `campaignName`, `budget`.
* - For backend integration: When a campaign is created, a POST request with the
* campaign data should be sent to your server.
*
* - `isAddAppModalOpen` (boolean): Controls the visibility of the "Add Your App" search modal.
* - `isManualAddModalOpen` (boolean): Controls the visibility of the "Add App Manually" form modal.
* - `isCampaignModalOpen` (boolean): Controls the visibility of the "Create Campaign" form modal.
*
* - `searchQuery` (string): Stores the text entered into the app search input field.
* - For backend integration: This query can be sent to an API endpoint that searches
* the Google Play Store or your internal app database.
*
* - `manualAppName`, `manualAppId` (string): State for the controlled inputs in the manual add form.
* - `appIcon` (string | null): Stores the base64 representation of the uploaded app icon.
* - For backend integration: This base64 string should be sent to the server to be stored,
* likely in a cloud storage bucket (like S3 or Firebase Storage), with the URL
* then saved in your database.
*
* - `fileError` (string): Holds validation error messages for the file upload.
*
* - `selectedApp` (AppData | null): Stores the app object for which a campaign is being created.
* - `campaignName`, `campaignBudget` (string): State for the controlled inputs in the campaign creation form.
*
* === BACKEND INTEGRATION NOTES ===
*
* 1.  **Fetch Initial Data**: In a `useEffect` hook, fetch the user's `apps` and `campaigns` from your API and populate the state.
* 2.  **Search Apps**: The `searchQuery` should trigger a call to a backend endpoint (`/api/search-apps?q=...`) that returns a list of matching apps.
* 3.  **Add App (Search)**: When a user clicks an app from the search results, send a POST request to `/api/apps` with the app's details to save it to the user's profile.
* 4.  **Add App (Manual)**: When the manual form is submitted, send a POST request to `/api/apps` with the form data, including the base64 `appIcon`. The backend should handle the image upload and save the app data.
* 5.  **Create Campaign**: When the campaign form is submitted, send a POST request to `/api/campaigns` with the `appId`, `campaignName`, and `budget`.
*/
