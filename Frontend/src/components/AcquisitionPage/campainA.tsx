import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  BarChart2,
  Activity,
  DollarSign,
  Percent,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Image as ImageIcon,
  ArrowLeft,
  Copy,
  Globe,
  Download,
  UserPlus,
  MousePointerClick,
  X,
  Loader2
} from 'lucide-react';
import { listCampaigns, createCampaign, pauseCampaign, resumeCampaign } from '../../services/campaigns';
import { getApps } from '../../services/apps';
import { getBalance, addFunds } from '../../services/wallet';

// --- HELPER COMPONENTS ---

const LoggedInNavbar = ({ title, onAddFundsClick }: { title: string; onAddFundsClick: () => void }) => (
  <div className="flex justify-between items-center mb-8">
    <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
    <div className="flex items-center space-x-4">
      <button onClick={onAddFundsClick} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
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

// --- Create Campaign Form Component ---

const CreateCampaignForm = ({ onBack, onCreate }: { onBack: () => void; onCreate: (data: any) => void }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        appId: '',
        name: '',
        previewUrl: '',
        campaignType: 'CPI',
        logo: null,
        banner: null,
        description: '',
        category: '',
        trackingLink: '',
        bid: '',
        dailyBudget: '',
        dailyConversionCap: '',
        countries: '',
        countryTargeting: 'Include',
    });
    const [apps, setApps] = useState<any[]>([]);
    const [loadingApps, setLoadingApps] = useState(true);
    const [errorApps, setErrorApps] = useState<string | null>(null);

    useEffect(() => {
        const fetchApps = async () => {
            setLoadingApps(true);
            setErrorApps(null);
            try {
                const response = await getApps();
                setApps(response.items.map((app: any) => ({ id: app.app_id, name: app.app_package })));
            } catch (err: any) {
                setErrorApps(err.response?.data?.message || "Failed to fetch apps.");
            } finally {
                setLoadingApps(false);
            }
        };
        fetchApps();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files && files.length > 0) {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        }
    };

    const handleNext = () => setStep(prev => Math.min(prev + 1, 4));
    const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async () => {
        try {
            await onCreate({
                app_id: formData.appId,
                name: formData.name,
                preview_url: formData.previewUrl,
                campaign_type: formData.campaignType,
                description: formData.description,
                category: formData.category,
                tracking_link: formData.trackingLink,
                bid_price: parseFloat(formData.bid),
                daily_budget: parseFloat(formData.dailyBudget),
                daily_conversion_cap: parseInt(formData.dailyConversionCap),
                countries: formData.countries.split(',').map(c => c.trim()),
                country_targeting_type: formData.countryTargeting,
                // Handle file uploads separately if needed, or convert to base64
            });
            alert("Campaign created successfully!");
        } catch (err) {
            alert("Failed to create campaign.");
        }
    };
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('Copied to clipboard!');
        }, (err) => {
            console.error('Failed to copy: ', err);
        });
    };

    const renderSection = (sectionStep: number, title: string, children: React.ReactNode) => (
        <div className="bg-white rounded-xl border shadow-sm">
            <button type="button" onClick={() => setStep(sectionStep)} className="w-full flex justify-between items-center p-4">
                <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${step >= sectionStep ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                        {step > sectionStep ? <CheckCircle size={16}/> : sectionStep}
                    </div>
                    <h3 className="font-semibold text-gray-800">{title}</h3>
                </div>
                {step === sectionStep ? <ChevronUp className="text-gray-500"/> : <ChevronDown className="text-gray-500"/>}
            </button>
            {step === sectionStep && <div className="p-6 border-t">{children}</div>}
        </div>
    );
    
    const campaignTypeCards = [
        { key: "CPI", Icon: Download, title: "CPI", subtitle: "Cost Per Install Campaigns", points: ["Optimized to get Installs on your app", "Billed per Installation of the application"] },
        { key: "CPR", Icon: UserPlus, title: "CPR", subtitle: "Cost Per Registration Campaigns", points: ["Optimized to get Registrations on your app", "Billed when user completes Registration process"] },
        { key: "CPA", Icon: MousePointerClick, title: "CPA", subtitle: "Cost Per Action Campaigns", points: ["Optimized towards a custom app action", "Billed when a particular action is triggered"] },
    ];

    return (
        <div className="bg-gray-50 min-h-screen p-8">
            <div className="flex items-center gap-4 mb-6">
                 <button onClick={onBack} className="text-gray-600 hover:text-gray-900"><ArrowLeft/></button>
                 <h1 className="text-2xl font-bold text-gray-800">Create Campaign</h1>
            </div>

            {/* Stepper */}
            <div className="flex justify-between items-center max-w-2xl mx-auto mb-8">
                {['Campaign Details', 'Add Meta Data', 'Bidding & Tracking', 'Targeting & Capping'].map((label, index) => (
                    <React.Fragment key={label}>
                        <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= index + 1 ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                                {step > index + 1 ? <CheckCircle size={16}/> : index + 1}
                            </div>
                            <p className={`mt-2 text-xs font-semibold ${step >= index + 1 ? 'text-indigo-600' : 'text-gray-500'}`}>{label}</p>
                        </div>
                        {index < 3 && <div className={`flex-1 h-0.5 -mt-6 mx-2 ${step > index + 1 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>}
                    </React.Fragment>
                ))}
            </div>

            <div className="max-w-4xl mx-auto space-y-4">
                {renderSection(1, 'Campaign Details',
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Select App *</label>
                            {loadingApps ? (
                                <p>Loading apps...</p>
                            ) : errorApps ? (
                                <p className="text-red-500">Error loading apps: {errorApps}</p>
                            ) : (
                                <select name="appId" value={formData.appId} onChange={handleInputChange} className="w-full p-2 border rounded-lg bg-white">
                                    <option value="">Select an app</option>
                                    {apps.map(app => <option key={app.id} value={app.id}>{app.name}</option>)}
                                </select>
                            )}
                            <button type="button" className="text-indigo-600 text-sm mt-1 hover:underline">+ Add new app</button>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Campaign Name *</label>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Summer Sale 2023" className="w-full p-2 border rounded-lg"/>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Preview URL *</label>
                            <input type="text" name="previewUrl" value={formData.previewUrl} onChange={handleInputChange} placeholder="https://example.com/campaign" className="w-full p-2 border rounded-lg"/>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4 pt-4">
                            {campaignTypeCards.map(card => (
                                <div key={card.key} onClick={() => setFormData(prev => ({...prev, campaignType: card.key}))}
                                    className={`p-4 border-2 rounded-xl cursor-pointer ${formData.campaignType === card.key ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-400'}`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-bold">{card.title}</h4>
                                        {formData.campaignType === card.key && <CheckCircle className="text-indigo-600"/>}
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2">{card.subtitle}</p>
                                    <ul className="space-y-1">{card.points.map((p, i) => <li key={i} className="text-xs text-gray-600 list-disc list-inside">{p}</li>)}</ul>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end pt-4"><button type="button" onClick={handleNext} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold">Next</button></div>
                    </div>
                )}
                {renderSection(2, 'Add Meta Data',
                    <div className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="md:col-span-2 grid grid-cols-2 gap-4">
                               <div className="border-2 border-dashed rounded-xl p-4 text-center flex flex-col justify-center items-center">
                                   <ImageIcon className="text-gray-400 mb-2"/>
                                   <p className="text-sm font-semibold">Add logo Image</p>
                                   <p className="text-xs text-gray-500">1:1 Ratio, png/jpg, &lt;2MB</p>
                               </div>
                               <div className="border-2 border-dashed rounded-xl p-4 text-center flex flex-col justify-center items-center">
                                   <ImageIcon className="text-gray-400 mb-2"/>
                                   <p className="text-sm font-semibold">Add banner Image</p>
                                   <p className="text-xs text-gray-500">1080x396px, &lt;2MB</p>
                               </div>
                            </div>
                            <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Add description or KPI Metrics" className="p-2 border rounded-lg h-full min-h-[100px]"></textarea>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Category *</label>
                            <select name="category" value={formData.category} onChange={handleInputChange} className="w-full p-2 border rounded-lg bg-white"><option value="">Select Category</option><option>Gaming</option><option>Social</option><option>Finance</option></select>
                        </div>
                        <div className="flex justify-between pt-4">
                            <button type="button" onClick={handleBack} className="font-semibold text-gray-600">Back</button>
                            <button type="button" onClick={handleNext} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold">Next</button>
                        </div>
                    </div>
                )}
                {renderSection(3, 'Bidding & Tracking', 
                    <div className="space-y-6">
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Tracking Link *</label>
                            <input type="text" name="trackingLink" value={formData.trackingLink} onChange={handleInputChange} placeholder="Enter tracking link" className="w-full p-2 border rounded-lg"/>
                            <div className="flex space-x-2 mt-2">
                                <button type="button" onClick={() => setFormData(p => ({...p, trackingLink: p.trackingLink + '{clickid}'}))} className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs">{`{clickid}`}</button>
                                <button type="button" onClick={() => setFormData(p => ({...p, trackingLink: p.trackingLink + '{pid}'}))} className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs">{`{pid}`}</button>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Postback</label>
                            <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
                                <span className="text-sm text-gray-600 truncate">https://link.adjump.io/p?m=15602&tid={'{clickid}'}</span>
                                <button type="button" onClick={() => copyToClipboard("https://link.adjump.io/p?m=15602&tid={clickid}")} className="text-indigo-600 font-semibold flex items-center gap-1 text-sm"><Copy size={14}/> Copy</button>
                            </div>
                        </div>
                         <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Bid Price *</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                <input type="number" name="bid" value={formData.bid} onChange={handleInputChange} placeholder="Enter bid price" className="w-full p-2 border rounded-lg pl-7"/>
                            </div>
                        </div>
                        <div className="flex justify-between pt-4">
                            <button type="button" onClick={handleBack} className="font-semibold text-gray-600">Back</button>
                            <button type="button" onClick={handleNext} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold">Next</button>
                        </div>
                    </div>
                )}
                {renderSection(4, 'Targeting & Capping', 
                    <div className="space-y-6">
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Countries</label>
                             <div className="flex space-x-1 mb-2">
                                <button type="button" onClick={() => setFormData(p => ({...p, countryTargeting: 'Include'}))} className={`px-4 py-1.5 text-sm rounded-lg ${formData.countryTargeting === 'Include' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Include</button>
                                <button type="button" onClick={() => setFormData(p => ({...p, countryTargeting: 'Exclude'}))} className={`px-4 py-1.5 text-sm rounded-lg ${formData.countryTargeting === 'Exclude' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Exclude</button>
                            </div>
                            <div className="relative">
                                <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                                <input type="text" name="countries" value={formData.countries} onChange={handleInputChange} placeholder="India..." className="w-full p-2 border rounded-lg pl-9"/>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">If no targeting is specified, it will be targeted worldwide</p>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Daily Budget</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                <input type="number" name="dailyBudget" value={formData.dailyBudget} onChange={handleInputChange} placeholder="Enter your daily budget" className="w-full p-2 border rounded-lg pl-7"/>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Daily Conversion</label>
                            <input type="number" name="dailyConversionCap" value={formData.dailyConversionCap} onChange={handleInputChange} placeholder="0" className="w-full p-2 border rounded-lg"/>
                        </div>
                        <div className="flex justify-between pt-4">
                            <button type="button" onClick={handleBack} className="font-semibold text-gray-600">Back</button>
                            <button type="button" onClick={handleSubmit} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold">Create Campaign</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main Campaigns Page Component ---

const AcquisitionCampaignsPage = () => {
    const [view, setView] = useState('list'); // 'list' or 'create'
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAddFundsModalOpen, setAddFundsModalOpen] = useState(false);
    const [walletBalance, setWalletBalance] = useState<number | null>(null);

    const fetchCampaignsAndBalance = async () => {
        setLoading(true);
        setError(null);
        try {
            const [campaignsResponse, balanceResponse] = await Promise.all([
                listCampaigns({}),
                getBalance()
            ]);
            setCampaigns(campaignsResponse.data);
            setWalletBalance(balanceResponse.data.balance);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to fetch data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaignsAndBalance();
    }, []);

    const handleCreateCampaign = async (newCampaignData: any) => {
        try {
            await createCampaign(newCampaignData);
            alert("Campaign created successfully!");
            fetchCampaignsAndBalance(); // Refetch campaigns after creation
            setView('list');
        } catch (err) {
            alert("Failed to create campaign.");
        }
    };

    const toggleCampaignStatus = async (id: string, currentStatus: string) => {
        try {
            if (currentStatus === 'Active') {
                await pauseCampaign(id);
            } else {
                await resumeCampaign(id);
            }
            alert(`Campaign ${id} status updated!`);
            fetchCampaignsAndBalance(); // Refetch campaigns after status change
        } catch (err) {
            alert("Failed to update campaign status.");
        }
    };

    if (loading) {
        return <div className="flex-1 p-8 min-h-screen bg-gray-50">Loading campaigns...</div>;
    }

    if (error) {
        return <div className="flex-1 p-8 min-h-screen bg-gray-50 text-red-500">Error: {error}</div>;
    }

    if (view === 'create') {
        return <CreateCampaignForm onBack={() => setView('list')} onCreate={handleCreateCampaign} />;
    }

    return (
        <>
            <CampaignsList 
                campaigns={campaigns} 
                setCampaigns={setCampaigns} 
                onGoToCreate={() => setView('create')}
                onAddFundsClick={() => setAddFundsModalOpen(true)}
                toggleCampaignStatus={toggleCampaignStatus}
            />
            {isAddFundsModalOpen && <AddFundsModal isOpen={isAddFundsModalOpen} onClose={() => setAddFundsModalOpen(false)} currentBalance={walletBalance} onFundsAdded={fetchCampaignsAndBalance} />}
        </>
    );
};


// --- Campaigns List View Component ---

const CampaignsList = ({ campaigns, setCampaigns, onGoToCreate, onAddFundsClick, toggleCampaignStatus }: { campaigns: any[]; setCampaigns: React.Dispatch<React.SetStateAction<any[]>>; onGoToCreate: () => void; onAddFundsClick: () => void; toggleCampaignStatus: (id: string, currentStatus: string) => Promise<void> }) => {
    const [activeTab, setActiveTab] = useState('all');
    const [filters, setFilters] = useState({ name: '', trackingType: '', campaignType: '', status: '' });

    const filteredCampaigns = useMemo(() => {
        let filtered = campaigns;

        if (activeTab === 'active') {
            filtered = campaigns.filter(c => c.status === 'Active' || c.status === 'Paused' || c.status === 'Under Review');
        } else if (activeTab === 'rejected') {
            filtered = campaigns.filter(c => c.status === 'Rejected');
        }

        return filtered.filter(c =>
            c.name.toLowerCase().includes(filters.name.toLowerCase()) &&
            (filters.trackingType === '' || c.trackingType === filters.trackingType) &&
            (filters.campaignType === '' || c.campaignType === filters.campaignType) &&
            (filters.status === '' || c.status === filters.status)
        );
    }, [campaigns, activeTab, filters]);

    const stats = useMemo(() => ({
        total: campaigns.length,
        active: campaigns.filter(c => c.status === 'Active').length,
        spent: campaigns.reduce((sum, c) => sum + c.spent, 0),
        avgCtr: campaigns.length > 0 ? (campaigns.reduce((sum, c) => sum + c.ctr, 0) / campaigns.length).toFixed(2) : '0.00',
    }), [campaigns]);

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-700';
            case 'Paused': return 'bg-yellow-100 text-yellow-700';
            case 'Under Review': return 'bg-blue-100 text-blue-700';
            case 'Rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({ name: '', trackingType: '', campaignType: '', status: '' });
    };

    return (
        <div className="bg-gray-50 min-h-screen p-8">
            <LoggedInNavbar title="My Campaigns" onAddFundsClick={onAddFundsClick} />
            <div className="flex justify-end mb-6">
                <button onClick={onGoToCreate} className="bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-2">
                    <Plus size={18} /> Create New Campaign
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map(card => (
                    <div key={card.title} className="bg-white p-5 rounded-xl shadow-sm border">
                        <div className="flex justify-between items-start">
                             <div>
                                <p className="text-sm text-gray-500">{card.title}</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
                            </div>
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getIconColor(card.color)}`}>
                                <card.Icon size={20} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border">
                <div className="border-b px-6 flex items-center gap-8">
                    <button onClick={() => setActiveTab('all')} className={`py-4 text-sm font-semibold border-b-2 ${activeTab === 'all' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        All Campaigns ({campaigns.length})
                    </button>
                    <button onClick={() => setActiveTab('active')} className={`py-4 text-sm font-semibold border-b-2 ${activeTab === 'active' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        Active Campaigns ({campaigns.filter(c => c.status !== 'Rejected').length})
                    </button>
                     <button onClick={() => setActiveTab('rejected')} className={`py-4 text-sm font-semibold border-b-2 ${activeTab === 'rejected' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        Rejected Campaigns ({campaigns.filter(c => c.status === 'Rejected').length})
                    </button>
                </div>
                <div className="p-4 bg-gray-50/50 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <input type="text" name="name" placeholder="Search by name..." value={filters.name} onChange={handleFilterChange} className="p-2 border rounded-lg text-sm col-span-1 md:col-span-2"/>
                    <select name="trackingType" value={filters.trackingType} onChange={handleFilterChange} className="p-2 border rounded-lg text-sm bg-white"><option value="">All Tracking Types</option><option>Third Party</option><option>Tracking by us</option></select>
                    <select name="status" value={filters.status} onChange={handleFilterChange} className="p-2 border rounded-lg text-sm bg-white"><option value="">All Statuses</option><option>Active</option><option>Paused</option><option>Under Review</option><option>Rejected</option></select>
                    <button onClick={clearFilters} className="bg-gray-200 p-2 rounded-lg text-sm hover:bg-gray-300">Clear Filters</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                            <tr>
                                {['Campaign', 'Start Date', 'Status', 'Tracking Type', 'Campaign Type', 'Bid', 'Capping', 'Actions'].map(h => <th key={h} className="px-6 py-3 font-medium">{h}</th>)}
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredCampaigns.map(c => (
                                <tr key={c.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-semibold text-gray-800">{c.name}</td>
                                    <td className="px-6 py-4 text-gray-600">{c.startDate}</td>
                                    <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(c.status)}`}>{c.status}</span></td>
                                    <td className="px-6 py-4 text-gray-600">{c.trackingType}</td>
                                    <td className="px-6 py-4 text-gray-600">{c.campaignType}</td>
                                    <td className="px-6 py-4 text-gray-600">{c.bid}</td>
                                    <td className="px-6 py-4 text-gray-600">{c.capping}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-xs">
                                            <button className="text-indigo-600 hover:underline">View</button>
                                            <button className="text-gray-600 hover:underline">Edit</button>
                                            {c.status === 'Rejected' ? (
                                                <>
                                                    <button className="text-green-600 hover:underline">Resend</button>
                                                    <button className="text-red-600 hover:underline">Delete</button>
                                                </>
                                            ) : (
                                                <button onClick={() => toggleCampaignStatus(c.id, c.status)} className="text-yellow-600 hover:underline">{c.status === 'Active' ? 'Pause' : 'Resume'}</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {filteredCampaigns.length === 0 && <p className="text-center text-gray-500 py-10">No campaigns found.</p>}
                </div>
            </div>
        </div>
    );
};

export default AcquisitionCampaignsPage;