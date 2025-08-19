import React, { useState, useEffect, useMemo } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { getBalance, getTransactions, getWalletInvoices, addFunds } from '../../services/wallet';
import { format } from 'date-fns';

// --- HELPER COMPONENTS ---

const LoggedInNavbar = ({ title, onAddFundsClick }: { title: string; onAddFundsClick: () => void }) => (
  <div className="flex justify-between items-center mb-8 pb-4 border-b">
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
            await addFunds({ amount: parsedAmountUSD, method: "Bank Transfer" }); // Assuming method is always Bank Transfer for now
            onFundsAdded(); // Callback to refresh parent data
            onClose(); // Close modal on success
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

// --- Main Funds Page Component ---

const AcquisitionFundsPage = () => {
  const [activeTab, setActiveTab] = useState('funds');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddFundsModalOpen, setAddFundsModalOpen] = useState(false);
  
  // State for data, assuming it would be fetched from an API
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [fundsTransactions, setFundsTransactions] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWalletData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [balanceRes, transactionsRes, invoicesRes] = await Promise.all([
        getBalance(),
        getTransactions(),
        getWalletInvoices(),
      ]);
      setWalletBalance(balanceRes.data.balance);
      setFundsTransactions(transactionsRes.data.items);
      setInvoices(invoicesRes.data.items);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch wallet data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleAddFunds = () => {
    // This is handled by the AddFundsModal now
    // The modal calls fetchWalletData on success
  };

  const filteredFunds = useMemo(() =>
    fundsTransactions.filter(t =>
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    ), [fundsTransactions, searchQuery]);

  const filteredInvoices = useMemo(() =>
    invoices.filter(i =>
      i.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.client.toLowerCase().includes(searchQuery.toLowerCase())
    ), [invoices, searchQuery]);
    
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
        case 'completed':
        case 'paid':
            return 'bg-green-100 text-green-700';
        case 'pending':
            return 'bg-yellow-100 text-yellow-700';
        case 'overdue':
            return 'bg-red-100 text-red-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return <div className="flex-1 p-8 min-h-screen bg-gray-50">Loading wallet data...</div>;
  }

  if (error) {
    return <div className="flex-1 p-8 min-h-screen bg-gray-50 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <LoggedInNavbar title="Funds and Invoices" onAddFundsClick={() => setAddFundsModalOpen(true)} />

      {/* Wallet Balance Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-sm font-semibold text-gray-500 mb-1">Wallet Balance</h2>
            <p className="text-4xl font-bold text-indigo-600">${walletBalance !== null ? walletBalance.toFixed(2) : 'N/A'} <span className="text-2xl text-gray-400">USD</span></p>
            <p className="text-sm text-gray-500 mt-1">≈ ₹{(walletBalance !== null ? walletBalance * USD_TO_INR_RATE : 0).toFixed(2)} INR</p>
          </div>
          <button onClick={() => setAddFundsModalOpen(true)} className="bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <Plus size={18} /> Add Funds
          </button>
        </div>
      </div>

      {/* Search and Tabs */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by Transaction ID or Description"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 border rounded-lg shadow-sm"
        />
      </div>

      <div className="border-b mb-6">
        <nav className="flex space-x-8">
          <button onClick={() => setActiveTab('funds')} className={`pb-2 text-sm font-semibold border-b-2 ${activeTab === 'funds' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Funds ({fundsTransactions.length})
          </button>
          <button onClick={() => setActiveTab('invoices')} className={`pb-2 text-sm font-semibold border-b-2 ${activeTab === 'invoices' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Invoices ({invoices.length})
          </button>
        </nav>
      </div>

      {/* Tables */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {activeTab === 'funds' ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
              <tr>
                {['Transaction ID', 'Date', 'Description', 'Amount', 'Status'].map(h => <th key={h} className="px-6 py-3 font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredFunds.map(t => (
                <tr key={t.id}>
                  <td className="px-6 py-4 font-semibold text-gray-800">{t.id}</td>
                  <td className="px-6 py-4 text-gray-600">{format(new Date(t.created_at), 'MMM dd, yyyy')}</td>
                  <td className="px-6 py-4 text-gray-600">{t.description}</td>
                  <td className={`px-6 py-4 font-semibold ${t.type === 'Credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'Credit' ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(t.status)}`}>{t.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
              <tr>
                {['Invoice ID', 'Date', 'Client', 'Amount', 'Due Date', 'Status'].map(h => <th key={h} className="px-6 py-3 font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredInvoices.map(i => (
                <tr key={i.id}>
                  <td className="px-6 py-4 font-semibold text-gray-800">{i.id}</td>
                  <td className="px-6 py-4 text-gray-600">{format(new Date(i.created_at), 'MMM dd, yyyy')}</td>
                  <td className="px-6 py-4 text-gray-600">{i.client}</td>
                  <td className="px-6 py-4 font-semibold text-gray-800">${i.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-gray-600">{format(new Date(i.due_date), 'MMM dd, yyyy')}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(i.status)}`}>{i.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isAddFundsModalOpen && <AddFundsModal isOpen={isAddFundsModalOpen} onClose={fetchWalletData} currentBalance={walletBalance} onFundsAdded={fetchWalletData} />}
    </div>
  );
};

export default AcquisitionFundsPage;