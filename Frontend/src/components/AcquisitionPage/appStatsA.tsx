import React, { useState, useEffect } from 'react';
import { getApps, searchApps, addApp } from '../../services/apps';
import { getBalance, addFunds } from '../../services/wallet';
import { Plus, Search, UploadCloud, X } from 'lucide-react';

// --- HELPER COMPONENTS ---

// LoggedInNavbar component
const LoggedInNavbar = ({ title, onAddFundsClick }: { title: string; onAddFundsClick: () => void }) => (
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

// Add Funds Modal Component
const AddFundsModal = ({ isOpen, onClose, currentBalance, onFundsAdded }: { isOpen: boolean; onClose: () => void; currentBalance: number | null; onFundsAdded: () => void }) => {
    if (!isOpen) return null;

    const [amountUSD, setAmountUSD] = useState('');
    const [hasCoupon, setHasCoupon] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const CONVERSION_RATE = 85.171;
    const GST_RATE = 0.18;
    const MIN_AMOUNT = 50;

    const parsedAmountUSD = parseFloat(amountUSD) || 0;
    const amountINR = parsedAmountUSD * CONVERSION_RATE;
    const gstAmount = amountINR * GST_RATE;
    const totalPayable = amountINR + gstAmount;

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value)) {
            setAmountUSD(value);
        }
    };
    
    const handleAddFunds = async () => {
        setError(null);
        if (parsedAmountUSD < MIN_AMOUNT) {
            setError(`Minimum funds to add is $${MIN_AMOUNT}.`);
            return;
        }
        setLoading(true);
        try {
            await addFunds({ amount: parsedAmountUSD, method: "Bank Transfer" });
            onFundsAdded();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to add funds.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md relative font-sans">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">Add Funds to Wallet</h2>
                <p className="text-sm text-indigo-600 font-semibold mb-6">Available Funds: ${currentBalance !== null ? currentBalance.toFixed(2) : 'N/A'}</p>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <div className="mb-6">
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Enter Amount</label>
                    <input
                        id="amount"
                        type="text"
                        value={amountUSD}
                        onChange={handleAmountChange}
                        placeholder="Minimum funds is $50"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                    />
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3 text-gray-700">
                    <div className="flex justify-between items-center">
                        <span>Funds to be added:</span>
                        <span className="font-semibold">${parsedAmountUSD.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Funds in INR:</span>
                        <span className="font-semibold">₹{amountINR.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>GST (18%):</span>
                        <span className="font-semibold">₹{gstAmount.toFixed(2)}</span>
                    </div>
                    <hr className="border-t border-gray-200" />
                    <div className="flex justify-between items-center text-lg">
                        <span className="font-bold text-gray-800">Total Payable:</span>
                        <span className="font-bold text-gray-800">₹{totalPayable.toFixed(2)}</span>
                    </div>
                </div>
                <div className="text-center text-xs text-indigo-500 bg-indigo-50 rounded-md py-1 mb-6">
                    Applied Conversion Rate: $1 ≈ ₹{CONVERSION_RATE}
                </div>

                <div className="flex items-center mb-6">
                    <input
                        id="coupon"
                        type="checkbox"
                        checked={hasCoupon}
                        onChange={(e) => setHasCoupon(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="coupon" className="ml-2 block text-sm text-gray-900">
                        I have a coupon code
                    </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={onClose}
                        className="w-full bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-300 transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAddFunds}
                        className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"
                        disabled={parsedAmountUSD < MIN_AMOUNT || loading}
                    >
                        {loading ? 'Adding...' : 'Add Funds'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Application Management Component ---

const AcquisitionMyAppsPage = () => {
  // Main state for the list of user's applications
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  // State for controlling modal visibility
  const [isAddAppModalOpen, setAddAppModalOpen] = useState(false);
  const [isManualAddModalOpen, setManualAddModalOpen] = useState(false);
  const [isAddFundsModalOpen, setAddFundsModalOpen] = useState(false);

  // --- Add App Modal State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // --- Manual Add App Modal State ---
  const [manualAppName, setManualAppName] = useState("");
  const [manualAppId, setManualAppId] = useState("");
  const [appIcon, setAppIcon] = useState<string | null>(null);
  const [appIconError, setAppIconError] = useState("");

  const fetchAppsAndBalance = async () => {
    setLoading(true);
    setError(null);
    try {
      const [appsResponse, balanceResponse] = await Promise.all([
        getApps(),
        getBalance()
      ]);
      const formattedApps = appsResponse.items.map((app: any) => ({
        ...app,
        id: app.app_id,
        name: app.app_package, // Using package name as name for now
        logo: `https://placehold.co/100x100/7F00FF/white?text=${app.app_package.substring(0,2).toUpperCase()}`,
        dateAdded: new Date(app.created_at).toLocaleDateString('en-GB'),
      }));
      setApps(formattedApps);
      setWalletBalance(balanceResponse.data.balance);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppsAndBalance();
  }, []);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery) {
        setIsSearching(true);
        searchApps(searchQuery).then(response => {
          const formattedApps = response.items.map((app: any) => ({
            ...app,
            id: app.app_id,
            name: app.app_package, // Using package name as name for now
            logo: `https://placehold.co/100x100/7F00FF/white?text=${app.app_package.substring(0,2).toUpperCase()}`,
            dateAdded: new Date(app.created_at).toLocaleDateString('en-GB'),
          }));
          setSearchResults(formattedApps);
          setIsSearching(false);
        }).catch(err => {
          console.error("Failed to search apps", err);
          setSearchResults([]);
          setIsSearching(false);
        });
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          setAppIcon(event.target.result as string);
        }
      };
      img.src = event.target.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveManualApp = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!manualAppName || !manualAppId || !appIcon) {
          alert("Please fill all fields and upload an icon.");
          return;
      }
      try {
        await addApp({ app_id: manualAppId, app_package: manualAppName, logo: appIcon });
        fetchAppsAndBalance(); // Refresh apps after adding
        closeAllModals();
      } catch (err) {
        alert("Failed to add app manually.");
      }
  };

  const handleAddAppFromSearch = async (app: any) => {
    try {
      await addApp({ app_id: app.id, app_package: app.name, logo: app.icon });
      fetchAppsAndBalance(); // Refresh apps after adding
      closeAllModals();
    } catch (err) {
      alert("Failed to add app from search.");
    }
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
  };

  if (loading) {
    return <div className="flex-1 p-8 min-h-screen bg-gray-50">Loading...</div>;
  }

  if (error) {
    return <div className="flex-1 p-8 min-h-screen bg-gray-50 text-red-500">Error: {error}</div>;
  }

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
                        <img src={app.logo} alt={app.name} className="w-12 h-12 rounded-lg object-cover" />
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
      {isAddFundsModalOpen && <AddFundsModal isOpen={isAddFundsModalOpen} onClose={closeAllModals} currentBalance={walletBalance} onFundsAdded={fetchAppsAndBalance} />}
    </div>
  );
};

export default AcquisitionMyAppsPage;