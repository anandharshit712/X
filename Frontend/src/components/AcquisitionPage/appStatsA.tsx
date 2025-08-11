import React, { useState, useEffect } from 'react';
import { Plus, Search, UploadCloud, X } from 'lucide-react';

// --- Mock Components and Data ---
// This section mocks dependencies that would be in your project.

// Mock for a generic LoggedInNavbar component
const LoggedInNavbar = ({ title, onAddFundsClick }) => (
  <div className="flex justify-between items-center mb-8 pb-4 border-b">
    <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
    <div className="flex items-center space-x-4">
      <button
        onClick={onAddFundsClick}
        className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
      >
        Add Funds
      </button>
      <div className="w-10 h-10 bg-indigo-200 text-indigo-700 flex items-center justify-center rounded-full font-bold text-lg">
        JA
      </div>
    </div>
  </div>
);

// Mock for an API call to search for apps
const mockSearchApps = async (query) => {
  console.log(`Searching for: ${query}`);
  if (!query) return [];
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  // Return some mock data
  return [
    { name: 'SocialApp Pro', id: 'com.social.pro', icon: 'https://placehold.co/100x100/7C3AED/FFFFFF?text=SP' },
    { name: 'GamerZ Hub', id: 'com.gamerz.hub', icon: 'https://placehold.co/100x100/DB2777/FFFFFF?text=GH' },
    { name: 'Finance Tracker', id: 'com.finance.tracker', icon: 'https://placehold.co/100x100/10B981/FFFFFF?text=FT' },
  ].filter(app => app.name.toLowerCase().includes(query.toLowerCase()));
};


// --- Main Application Management Component ---

const MyAppsPage = () => {
  // Main state for the list of user's applications
  const [apps, setApps] = useState([]);

  // State for controlling modal visibility
  const [isAddAppModalOpen, setAddAppModalOpen] = useState(false);
  const [isManualAddModalOpen, setManualAddModalOpen] = useState(false);
  const [isAddFundsModalOpen, setAddFundsModalOpen] = useState(false);

  // --- Add App Modal State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // --- Manual Add App Modal State ---
  const [manualAppName, setManualAppName] = useState("");
  const [manualAppId, setManualAppId] = useState("");
  const [appIcon, setAppIcon] = useState(null);
  const [appIconError, setAppIconError] = useState("");

  // --- Add Funds Modal State ---
  const [fundAmount, setFundAmount] = useState("");
  const [hasCoupon, setHasCoupon] = useState(false);
  const USD_TO_INR_RATE = 85.171;
  const GST_RATE = 0.18;


  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery) {
        setIsSearching(true);
        mockSearchApps(searchQuery).then(results => {
          setSearchResults(results);
          setIsSearching(false);
        });
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    setAppIcon(null);
    setAppIconError("");

    if (!file) return;

    if (file.type !== 'image/png') {
      setAppIconError('Only PNG files are supported.');
      return;
    }
    if (file.size > 500 * 1024) {
      setAppIconError('Maximum file size is 500KB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        if (img.width !== img.height) {
          setAppIconError('Image must have a 1:1 aspect ratio.');
        } else {
          setAppIcon(event.target.result);
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveManualApp = (e) => {
      e.preventDefault();
      if (!manualAppName || !manualAppId || !appIcon) {
          alert("Please fill all fields and upload an icon.");
          return;
      }
      const newApp = {
          name: manualAppName,
          id: manualAppId,
          icon: appIcon,
      };
      setApps([...apps, newApp]);
      closeAllModals();
  };

  const closeAllModals = () => {
    setAddAppModalOpen(false);
    setManualAddModalOpen(false);
    setAddFundsModalOpen(false);
    // Reset states
    setSearchQuery("");
    setSearchResults([]);
    setManualAppName("");
    setManualAppId("");
    setAppIcon(null);
    setAppIconError("");
    setFundAmount("");
    setHasCoupon(false);
  };

  // --- Render Methods for Modals ---

  const renderAddAppModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Add Your App</h2>
        <input
          type="text"
          placeholder="Search Apps..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
        <div className="my-4 h-48 overflow-y-auto">
          {isSearching && <p className="text-center text-gray-500">Searching...</p>}
          {!isSearching && searchResults.map((app) => (
            <div key={app.id} onClick={() => { setApps([...apps, app]); closeAllModals(); }}
                 className="flex items-center p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <img src={app.icon} alt={app.name} className="w-10 h-10 rounded-md mr-4" />
              <div>
                <p className="font-semibold">{app.name}</p>
                <p className="text-sm text-gray-500">{app.id}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-600 my-4">
          Can't find your app?{' '}
          <button onClick={() => { setAddAppModalOpen(false); setManualAddModalOpen(true); }}
                  className="text-indigo-600 font-semibold hover:underline">
            + Add Manually
          </button>
        </p>
        <button onClick={closeAllModals} className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600">
          Close
        </button>
      </div>
    </div>
  );

  const renderManualAddModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <form onSubmit={handleSaveManualApp} className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Add App Manually</h2>
        <div className="space-y-4">
          <input type="text" placeholder="App Name" value={manualAppName} onChange={e => setManualAppName(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
          <input type="text" placeholder="App ID" value={manualAppId} onChange={e => setManualAppId(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg" />
          <div className="border rounded-lg p-4">
            <h3 className="text-gray-500 mb-2">Upload App Icon (PNG only)</h3>
            <div className="flex items-center gap-4">
              <label className="w-24 h-24 border-2 border-dashed rounded-full flex items-center justify-center cursor-pointer hover:border-indigo-500">
                {appIcon ? <img src={appIcon} alt="preview" className="w-full h-full rounded-full object-cover"/> : <UploadCloud size={32} className="text-gray-400"/>}
                <input type="file" accept="image/png" onChange={handleImageChange} className="hidden"/>
              </label>
              <div>
                <p className="text-sm text-gray-500">Maximum File Size: 500KB</p>
                <p className="text-sm text-gray-500">Supported File Type: PNG</p>
                <p className="text-sm text-gray-500">Image Ratio: 1:1</p>
                {appIconError && <p className="text-sm text-red-500 mt-1">{appIconError}</p>}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button type="button" onClick={closeAllModals} className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
          <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save App</button>
        </div>
      </form>
    </div>
  );

  const renderAddFundsModal = () => {
    const amount = parseFloat(fundAmount) || 0;
    const fundsInINR = amount * USD_TO_INR_RATE;
    const gst = fundsInINR * GST_RATE;
    const total = fundsInINR + gst;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md relative">
                <button onClick={closeAllModals} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24}/></button>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Add Funds to Wallet</h2>
                <p className="text-right text-indigo-600 font-semibold">Available Funds: $0.000</p>
                <div className="mt-4 space-y-3">
                    <label className="font-semibold text-gray-700">Enter Amount</label>
                    <input type="number" placeholder="Minimum funds is $50" value={fundAmount} onChange={e => setFundAmount(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
                    <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-gray-600">
                        <p>Funds to be added: ${amount.toFixed(2)}</p>
                        <p>Funds in INR: ₹{fundsInINR.toFixed(2)}</p>
                        <p>GST (18%): ₹{gst.toFixed(2)}</p>
                        <p className="font-bold text-gray-800">Total Payable: ₹{total.toFixed(2)}</p>
                        <p className="text-xs text-center p-2 bg-indigo-100 text-indigo-700 rounded-md">Applied Conversion Rate: $1 ≈ ₹{USD_TO_INR_RATE}</p>
                    </div>
                    <div className="flex items-center">
                        <input type="checkbox" id="coupon" checked={hasCoupon} onChange={e => setHasCoupon(e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded"/>
                        <label htmlFor="coupon" className="ml-2 text-gray-700">I have a coupon code</label>
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button type="button" onClick={closeAllModals} className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
                    <button type="button" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Add Funds</button>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen p-8 font-sans">
      <LoggedInNavbar title="My Apps" onAddFundsClick={() => setAddFundsModalOpen(true)} />

      {apps.length === 0 ? (
        <div className="flex justify-center items-center mt-10">
          <div className="text-center bg-white p-12 rounded-2xl shadow-xl max-w-md">
            <img src="https://img.freepik.com/premium-vector/mobile-pharmacy-medical-cost-receipt-cell-phone-person-paid-bill-via-smartphone_212005-608.jpg?ga=GA1.1.1745348762.1721839313&semt=ais_hybrid&w=740" alt="Connect App" className="w-48 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Connect Your First App</h2>
            <p className="text-gray-500 mb-6">Get started by integrating your application with our platform.</p>
            <button onClick={() => setAddAppModalOpen(true)}
                    className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center">
              <Plus size={20} className="mr-2" /> Add New App
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
             <div className="p-4 border-b grid grid-cols-2 font-semibold text-gray-600 bg-gray-50">
                <div>App Name</div>
                <div className="text-right">Actions</div>
             </div>
             {apps.map((app, index) => (
                <div key={index} className="grid grid-cols-2 items-center p-4 border-b last:border-b-0">
                    <div className="flex items-center gap-4">
                        <img src={app.icon} alt={app.name} className="w-12 h-12 rounded-lg object-cover" />
                        <div>
                            <p className="font-semibold text-gray-800">{app.name}</p>
                            <p className="text-sm text-gray-500">{app.id}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <button className="bg-indigo-100 text-indigo-700 px-4 py-1 rounded-md text-sm font-semibold hover:bg-indigo-200">
                            + Create Campaign
                        </button>
                    </div>
                </div>
             ))}
          </div>
           <button onClick={() => setAddAppModalOpen(true)}
                    className="mt-6 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center">
              <Plus size={20} className="mr-2" /> Add Another App
            </button>
        </div>
      )}

      {isAddAppModalOpen && renderAddAppModal()}
      {isManualAddModalOpen && renderManualAddModal()}
      {isAddFundsModalOpen && renderAddFundsModal()}
    </div>
  );
};

export default MyAppsPage;
