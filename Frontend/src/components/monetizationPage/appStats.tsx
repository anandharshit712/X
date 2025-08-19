import React, { useState, useEffect } from 'react';
import { getApps, searchApps, addApp } from '../../services/apps';
import { createCampaign } from '../../services/campaigns';
import { Search, Upload, Plus, X } from 'lucide-react';

// --- DATA AND TYPES ---

// Defines the structure for an application object
interface AppData {
  app_id: string;
  name: string; // This will be populated from app_package for now
  logo: string;
  created_at: string;
}

// Defines the structure for a campaign object
interface Campaign {
  appId: string;
  campaignName: string;
  budget: string;
}

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
  const [apps, setApps] = useState<AppData[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for controlling modals
  const [isAddAppModalOpen, setAddAppModalOpen] = useState(false);
  const [isManualAddModalOpen, setManualAddModalOpen] = useState(false);
  const [isCampaignModalOpen, setCampaignModalOpen] = useState(false);

  // State for the "Add App" search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredApps, setFilteredApps] = useState<AppData[]>([]);

  // State for the "Add Manually" form
  const [manualAppName, setManualAppName] = useState('');
  const [manualAppId, setManualAppId] = useState('');
  const [appIcon, setAppIcon] = useState<string | null>(null);
  const [fileError, setFileError] = useState('');

  // State for the "Create Campaign" form
  const [selectedApp, setSelectedApp] = useState<AppData | null>(null);
  const [campaignName, setCampaignName] = useState('');
  const [campaignBudget, setCampaignBudget] = useState('');

  const fetchApps = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getApps();
      const formattedApps = response.items.map((app: any) => ({
        ...app,
        id: app.app_id,
        name: app.app_package, // Using package name as name for now
        logo: `https://placehold.co/100x100/7F00FF/white?text=${app.app_package.substring(0,2).toUpperCase()}`,
        dateAdded: new Date(app.created_at).toLocaleDateString('en-GB'),
      }));
      setApps(formattedApps);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch apps.");
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch apps
  useEffect(() => {
    fetchApps();
  }, []);

  // Effect to filter search results based on query
  useEffect(() => {
    const search = async () => {
      if (searchQuery) {
        try {
          const response = await searchApps(searchQuery);
          const formattedApps = response.items.map((app: any) => ({
            ...app,
            id: app.app_id,
            name: app.app_package, // Using package name as name for now
            logo: `https://placehold.co/100x100/7F00FF/white?text=${app.app_package.substring(0,2).toUpperCase()}`,
            dateAdded: new Date(app.created_at).toLocaleDateString('en-GB'),
          }));
          setFilteredApps(formattedApps);
        } catch (err) {
          console.error("Failed to search apps", err);
          setFilteredApps([]);
        }
      } else {
        setFilteredApps([]);
      }
    };

    const debounceTimeout = setTimeout(() => {
        search();
    }, 300); // Debounce search to avoid excessive API calls

    return () => clearTimeout(debounceTimeout);
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
  const handleAddApp = async (app: AppData) => {
    try {
      await addApp({ app_id: app.app_id, app_package: app.name });
      setAddAppModalOpen(false);
      setSearchQuery('');
      fetchApps(); // Refetch apps to include the new one
    } catch (err) {
      alert("Failed to add app");
    }
  };

  // Handler for submitting the manual add form
  const handleManualAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAppName || !manualAppId || !appIcon) {
        alert("Please fill all fields and upload an icon.");
        return;
    }
    try {
      await addApp({ app_id: manualAppId, app_package: manualAppName, logo: appIcon });
      setManualAddModalOpen(false);
      // Reset form
      setManualAppName('');
      setManualAppId('');
      setAppIcon(null);
      fetchApps(); // Refetch apps to include the new one
    } catch (err) {
      alert("Failed to add app manually");
    }
  };
  
  // Handler for submitting the create campaign form
  const handleCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(selectedApp) {
        try {
            await createCampaign({
                app_id: selectedApp.app_id,
                name: campaignName,
                budget: campaignBudget,
            });
            setCampaignModalOpen(false);
            // Reset form
            setCampaignName('');
            setCampaignBudget('');
            setSelectedApp(null);
            // Here you might want to refetch campaigns or update the UI in some way
        } catch (err) {
            alert("Failed to create campaign");
        }
    }
  };

  if (loading) {
    return <div className="flex-1 p-8 min-h-screen bg-gray-50">Loading...</div>
  }

  if (error) {
    return <div className="flex-1 p-8 min-h-screen bg-gray-50 text-red-500">Error: {error}</div>
  }

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
            key={app.app_id}
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
              <strong>App ID:</strong> {app.app_id}
            </div>
            <div className="text-sm text-gray-600">
              <strong>Date of Creation:</strong> {new Date(app.created_at).toLocaleDateString('en-GB')}
            </div>
            <div className="text-sm text-gray-600">
              <strong>Campaigns:</strong> {campaigns.filter(c => c.appId === app.app_id).length}
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
                    <div key={app.app_id} onClick={() => handleAddApp(app)} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition">
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
