import React, { useState, useMemo } from 'react';
import { Plus, X, Clock } from 'lucide-react';

// --- Add Funds Modal Component ---
const AddFundsModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const [amountUSD, setAmountUSD] = useState('');
    const [hasCoupon, setHasCoupon] = useState(false);

    const CONVERSION_RATE = 85.171;
    const GST_RATE = 0.18;
    const MIN_AMOUNT = 50;

    const parsedAmountUSD = parseFloat(amountUSD) || 0;
    const amountINR = parsedAmountUSD * CONVERSION_RATE;
    const gstAmount = amountINR * GST_RATE;
    const totalPayable = amountINR + gstAmount;

    const handleAmountChange = (e) => {
        const value = e.target.value;
        // Allow only numbers and a single decimal point
        if (/^\d*\.?\d*$/.test(value)) {
            setAmountUSD(value);
        }
    };
    
    const handleAddFunds = () => {
        if (parsedAmountUSD < MIN_AMOUNT) {
            // Using a custom modal/alert would be better in a real app
            alert(`Minimum funds to add is $${MIN_AMOUNT}.`);
            return;
        }
        // In a real app, you would handle the payment gateway integration here.
        console.log({
            amountUSD: parsedAmountUSD,
            amountINR,
            gstAmount,
            totalPayable,
            hasCoupon,
        });
        alert(`Adding $${parsedAmountUSD.toFixed(2)} to your wallet!`);
        onClose(); // Close modal on success
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md relative font-sans">
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">Add Funds to Wallet</h2>
                <p className="text-sm text-indigo-600 font-semibold mb-6">Available Funds: $0.000</p>

                {/* Amount Input */}
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

                {/* Funds Summary */}
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


                {/* Coupon Code */}
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

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={onClose}
                        className="w-full bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAddFunds}
                        className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"
                        disabled={parsedAmountUSD < MIN_AMOUNT}
                    >
                        Add Funds
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Mock Components & Data ---

const LoggedInNavbar = ({ title, onAddFundsClick }) => (
  <div className="flex justify-between items-center mb-8 pb-4 border-b">
    <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
    <div className="flex items-center space-x-4">
      <button 
        onClick={onAddFundsClick}
        className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
        Add Funds
      </button>
      <div className="w-10 h-10 bg-indigo-200 text-indigo-700 flex items-center justify-center rounded-full font-bold text-lg">
        JA
      </div>
    </div>
  </div>
);

const dummyOffers = [
  { id: '1', name: 'Cadbury Silk (289035)', app: 'app 1' },
  { id: '2', name: 'Malik Ka Pata', app: 'app 1' },
  { id: '3', name: 'HDFC Sky (288887)', app: 'app 2' },
  { id: '4', name: 'Pepsi Max (301245)', app: 'app 3' },
  { id: '5', name: 'Amazon Prime (445566)', app: 'app 2' },
];

const initialRequests = [
  { id: 1, app: 'CoinFlow', offerName: 'Cadbury Silk (289035)', offerApp: 'app 1', time: '09:00', timestamp: '2025-06-09, 3:45:23 PM', priority: 'High', status: 'Not Sent' },
  { id: 2, app: 'CoinFlow', offerName: 'Amazon Prime (445566)', offerApp: 'app 2', time: '11:15', timestamp: '2025-06-06, 9:30:10 AM', priority: 'Medium', status: 'Not Sent' },
  { id: 3, app: 'Cashapp', offerName: 'Pepsi Max (301245)', offerApp: 'app 3', time: '18:45', timestamp: '2025-06-07, 2:10:42 PM', priority: 'Low', status: 'Not Sent' },
  { id: 4, app: 'Both', offerName: 'HDFC Sky (288887)', offerApp: 'app 2', time: '12:30', timestamp: '2025-06-08, 11:20:15 AM', priority: 'High', status: 'Sent' },
];

// --- Main Notification Request Page Component ---

const NotificationRequestPage = () => {
  const [requests, setRequests] = useState(initialRequests);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddFundsModalOpen, setAddFundsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    app: '',
    offerApp: '',
    priority: '',
    status: '',
  });

  const filteredRequests = useMemo(() => {
    return requests.filter(req => 
      (filters.app === '' || req.app === filters.app) &&
      (filters.offerApp === '' || req.offerApp === filters.offerApp) &&
      (filters.priority === '' || req.priority === filters.priority) &&
      (filters.status === '' || req.status === filters.status)
    ).sort((a, b) => {
        const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        if (a.status !== b.status) return a.status === 'Sent' ? 1 : -1;
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    });
  }, [requests, filters]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleAddNewRequest = (newRequest) => {
    setRequests(prev => [newRequest, ...prev]);
    setIsModalOpen(false);
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusClass = (status) => {
    return status === 'Sent' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700';
  };

  const FilterSelect = ({ name, value, onChange, options, placeholder }) => (
    <div className="flex-1 min-w-[150px]">
      <label className="text-sm font-medium text-gray-500 mb-1 block">{placeholder}</label>
      <select 
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className="w-full p-2 border bg-white border-gray-300 rounded-lg text-sm"
      >
        <option value="">All</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <LoggedInNavbar 
        title="Notification Request" 
        onAddFundsClick={() => setAddFundsModalOpen(true)}
      />
      
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-wrap gap-4">
          <FilterSelect name="app" value={filters.app} onChange={handleFilterChange} options={['CoinFlow', 'Cashapp', 'Both']} placeholder="Filter by App" />
          <FilterSelect name="offerApp" value={filters.offerApp} onChange={handleFilterChange} options={['app 1', 'app 2', 'app 3']} placeholder="Filter by Offer App" />
          <FilterSelect name="priority" value={filters.priority} onChange={handleFilterChange} options={['High', 'Medium', 'Low']} placeholder="Filter by Priority" />
          <FilterSelect name="status" value={filters.status} onChange={handleFilterChange} options={['Sent', 'Not Sent']} placeholder="Filter by Status" />
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-2 whitespace-nowrap">
          <Plus size={18} /> Raise Request
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left text-xs text-gray-500 uppercase">
              <tr>
                {['App', 'Offer', 'Offer App', 'Time Slot', 'Priority', 'Status', 'Submitted'].map(h => (
                  <th key={h} className="px-6 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredRequests.map(req => (
                <tr key={req.id}>
                  <td className="px-6 py-4"><span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">{req.app}</span></td>
                  <td className="px-6 py-4 font-medium text-gray-800">{req.offerName}</td>
                  <td className="px-6 py-4"><span className="px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">{req.offerApp}</span></td>
                  <td className="px-6 py-4"><span className="inline-flex items-center gap-1.5"><Clock size={14} />{req.time}</span></td>
                  <td className="px-6 py-4"><span className={`px-3 py-1 text-xs font-semibold rounded-full ${getPriorityClass(req.priority)}`}>{req.priority}</span></td>
                  <td className="px-6 py-4"><span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusClass(req.status)}`}>{req.status}</span></td>
                  <td className="px-6 py-4 text-gray-500">{req.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <RaiseRequestModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddRequest={handleAddNewRequest}
      />

      <AddFundsModal 
        isOpen={isAddFundsModalOpen}
        onClose={() => setAddFundsModalOpen(false)}
      />
    </div>
  );
};

// --- Raise Request Modal Component ---

const RaiseRequestModal = ({ isOpen, onClose, onAddRequest }) => {
  const [formData, setFormData] = useState({
    app: '',
    offerApp: '',
    offerId: '',
    time: '',
    priority: ''
  });

  if (!isOpen) return null;

  const filteredOffers = dummyOffers.filter(offer => 
    formData.offerApp ? offer.app === formData.offerApp : true
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const offer = dummyOffers.find(o => o.id === formData.offerId);
    if (!offer) return;

    const newRequest = {
      id: Date.now(),
      app: formData.app,
      offerName: offer.name,
      offerApp: offer.app,
      time: formData.time,
      timestamp: new Date().toLocaleString('en-US', {
          year: 'numeric', month: 'numeric', day: 'numeric',
          hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true
      }),
      priority: formData.priority,
      status: 'Not Sent'
    };
    onAddRequest(newRequest);
  };

  const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isFormValid = formData.app && formData.offerApp && formData.offerId && formData.time && formData.priority;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Raise New Request</h2>
          <button onClick={onClose}><X size={20} className="text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Select App to Send Notification</label>
            <select name="app" value={formData.app} onChange={handleInputChange} className="w-full p-2 border rounded-lg bg-white">
              <option value="">Select an app</option>
              <option value="CoinFlow">CoinFlow</option>
              <option value="Cashapp">Cashapp</option>
              <option value="Both">Both</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Offer App</label>
            <select name="offerApp" value={formData.offerApp} onChange={handleInputChange} className="w-full p-2 border rounded-lg bg-white">
              <option value="">Search and select offer app</option>
              {[...new Set(dummyOffers.map(o => o.app))].map(app => <option key={app} value={app}>{app}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Select Offer</label>
            <select name="offerId" value={formData.offerId} onChange={handleInputChange} className="w-full p-2 border rounded-lg bg-white" disabled={!formData.offerApp}>
              <option value="">Select an offer</option>
              {filteredOffers.map(offer => <option key={offer.id} value={offer.id}>{offer.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Select Time Slot</label>
            <input type="time" name="time" value={formData.time} onChange={handleInputChange} className="w-full p-2 border rounded-lg"/>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Select Priority</label>
            <select name="priority" value={formData.priority} onChange={handleInputChange} className="w-full p-2 border rounded-lg bg-white">
              <option value="">Select priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="pt-2">
            <button type="submit" disabled={!isFormValid} className="w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold disabled:bg-gray-300">
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotificationRequestPage;
