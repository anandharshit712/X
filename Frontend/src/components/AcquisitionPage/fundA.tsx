import React, { useState, useMemo } from 'react';
import { Plus, X } from 'lucide-react';

// --- Mock Components & Data ---

const LoggedInNavbar = ({ title, onAddFundsClick }) => (
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

const initialFundsTransactions = [
    { id: "TXN001", date: "2024-05-28", description: "Funds Added", amount: 500.00, status: "Completed", type: "Credit" },
    { id: "TXN002", date: "2024-05-27", description: "Invoice Payment", amount: -125.50, status: "Completed", type: "Debit" },
    { id: "TXN003", date: "2024-05-26", description: "Funds Added", amount: 1000.00, status: "Completed", type: "Credit" },
    { id: "TXN004", date: "2024-05-25", description: "Service Fee", amount: -24.75, status: "Completed", type: "Debit" },
];

const initialInvoices = [
    { id: "INV001", date: "2024-05-28", client: "ABC Corp", amount: 850.00, dueDate: "2024-05-30", status: "Paid" },
    { id: "INV002", date: "2024-05-27", client: "XYZ Ltd", amount: 1200.00, dueDate: "2024-06-01", status: "Pending" },
    { id: "INV003", date: "2024-05-26", client: "Tech Solutions", amount: 675.25, dueDate: "2024-05-25", status: "Overdue" },
];

const USD_TO_INR_RATE = 85.171;

// --- Main Funds Page Component ---

const FundsPage = () => {
  const [activeTab, setActiveTab] = useState('funds');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddFundsModalOpen, setAddFundsModalOpen] = useState(false);
  
  // State for data, assuming it would be fetched from an API
  const [walletBalance, setWalletBalance] = useState(157.00);
  const [fundsTransactions, setFundsTransactions] = useState(initialFundsTransactions);
  const [invoices, setInvoices] = useState(initialInvoices);

  const handleAddFunds = (amountToAdd) => {
    const newBalance = walletBalance + amountToAdd;
    setWalletBalance(newBalance);

    const newTransaction = {
      id: `TXN${String(fundsTransactions.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      description: "Funds Added",
      amount: amountToAdd,
      status: "Completed",
      type: "Credit",
    };
    setFundsTransactions([newTransaction, ...fundsTransactions]);
    setAddFundsModalOpen(false);
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
    
  const getStatusClass = (status) => {
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

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <LoggedInNavbar title="Funds and Invoices" onAddFundsClick={() => setAddFundsModalOpen(true)} />

      {/* Wallet Balance Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-sm font-semibold text-gray-500 mb-1">Wallet Balance</h2>
            <p className="text-4xl font-bold text-indigo-600">${walletBalance.toFixed(2)} <span className="text-2xl text-gray-400">USD</span></p>
            <p className="text-sm text-gray-500 mt-1">≈ ₹{(walletBalance * USD_TO_INR_RATE).toFixed(2)} INR</p>
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
            Funds ({filteredFunds.length})
          </button>
          <button onClick={() => setActiveTab('invoices')} className={`pb-2 text-sm font-semibold border-b-2 ${activeTab === 'invoices' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Invoices ({filteredInvoices.length})
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
                  <td className="px-6 py-4 text-gray-600">{t.date}</td>
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
                  <td className="px-6 py-4 text-gray-600">{i.date}</td>
                  <td className="px-6 py-4 text-gray-600">{i.client}</td>
                  <td className="px-6 py-4 font-semibold text-gray-800">${i.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-gray-600">{i.dueDate}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(i.status)}`}>{i.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isAddFundsModalOpen && <AddFundsModal onClose={() => setAddFundsModalOpen(false)} onAddFunds={handleAddFunds} />}
    </div>
  );
};

// --- Add Funds Modal Component ---
const AddFundsModal = ({ onClose, onAddFunds }) => {
    const [amount, setAmount] = useState('');
    const GST_RATE = 0.18;

    const amountUSD = parseFloat(amount) || 0;
    const amountINR = amountUSD * USD_TO_INR_RATE;
    const gstAmount = amountINR * GST_RATE;

    const handleConfirmAdd = () => {
        if (amountUSD >= 50) {
            onAddFunds(amountUSD);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Add Funds to Wallet</h2>
                    <p className="text-sm text-indigo-600 font-semibold">Available Funds: $0.000</p>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Enter Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Minimum funds is $50"
                            className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div className="text-sm space-y-2 text-gray-600">
                        <p>Funds to be added: ${amountUSD.toFixed(2)}</p>
                        <p>Funds in INR: ₹{amountINR.toFixed(2)}</p>
                        <p>GST (18%): ₹{gstAmount.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-100 p-2 rounded-lg text-center text-xs text-gray-700">
                        Applied Conversion Rate: $1 ≈ ₹{USD_TO_INR_RATE}
                    </div>
                     <div className="flex items-center">
                        <input type="checkbox" id="coupon" className="h-4 w-4 text-indigo-600 border-gray-300 rounded"/>
                        <label htmlFor="coupon" className="ml-2 text-sm text-gray-700">I have a coupon code</label>
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                    <button onClick={handleConfirmAdd} disabled={amountUSD < 50} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">Add Funds</button>
                </div>
            </div>
        </div>
    );
};

export default FundsPage;

/*
// ---
// BACKEND INTEGRATION AND CODE SUMMARY
// ---
//
// This document provides a summary of the state variables used in the `FundsPage` component and instructions for connecting it to a live backend API.
//
// ### Code Summary
//
// The `FundsPage` component is the main export. It manages the overall view, including the wallet balance, transaction history, and invoices. It uses a few key state variables:
//
// -   `activeTab` (String) - Controls whether the 'funds' or 'invoices' table is displayed.
// -   `searchQuery` (String) - Holds the value of the search input to filter the tables.
// -   `isAddFundsModalOpen` (Boolean) - Toggles the visibility of the "Add Funds" modal.
// -   `walletBalance` (Number) - Stores the user's current wallet balance in USD.
// -   `fundsTransactions` (Array of Objects) - Holds the list of fund transactions (credits/debits).
// -   `invoices` (Array of Objects) - Holds the list of user invoices.
//
// The `AddFundsModal` component is a self-contained form for adding new funds. It takes an `onClose` function to close itself and an `onAddFunds` function to pass the new amount back to the parent `FundsPage`.
//
// ### Backend Integration
//
// To connect this component to your backend, you will need to replace the initial mock data with data fetched from your API.
//
// 1.  **Fetch Initial Data**
//     * Inside the `FundsPage` component, use a `useEffect` hook to fetch the initial wallet balance, funds transactions, and invoices when the component mounts.
//
//     * **Example `useEffect`**
//         useEffect(() => {
//             // Replace with your API fetching logic (e.g., using axios or fetch)
//             const fetchAllData = async () => {
//                 try {
//                     // const balanceRes = await axios.get('/api/wallet/balance');
//                     // setWalletBalance(balanceRes.data.balance);
//
//                     // const fundsRes = await axios.get('/api/wallet/transactions');
//                     // setFundsTransactions(fundsRes.data);
//
//                     // const invoicesRes = await axios.get('/api/wallet/invoices');
//                     // setInvoices(invoicesRes.data);
//                 } catch (error) {
//                     console.error("Failed to fetch funds data:", error);
//                 }
//             };
//             fetchAllData();
//         }, []); // Empty dependency array means this runs once on mount
//
// 2.  **API Endpoint for Adding Funds**
//     * In the `handleAddFunds` function within `FundsPage`, you should make a `POST` request to your backend to record the new transaction. The backend should handle the database update.
//
//     * **Example `handleAddFunds` update**
//         const handleAddFunds = async (amountToAdd) => {
//             try {
//                 // const response = await axios.post('/api/wallet/add-funds', { amount: amountToAdd });
//                 
//                 // Assuming the backend returns the new transaction and updated balance
//                 // setWalletBalance(response.data.newBalance);
//                 // setFundsTransactions([response.data.newTransaction, ...fundsTransactions]);
//
//                 // For now, we'll keep the local state update for demonstration
//                 setWalletBalance(walletBalance + amountToAdd);
//                 // ... (rest of the existing function)
//
//                 setAddFundsModalOpen(false);
//             } catch (error) {
//                 console.error("Failed to add funds:", error);
//                 // Optionally, show an error message to the user
//             }
//         };
//
// 3.  **Expected API Data Formats**
//     * /api/wallet/balance - Should return JSON like { "balance": 157.00 }.
//     * /api/wallet/transactions - Should return an array of objects, where each object has the structure:
//         {
//           "id": "TXN001",
//           "date": "2024-05-28",
//           "description": "Funds Added",
//           "amount": 500.00,
//           "status": "Completed",
//           "type": "Credit"
//         }
//         Note - `amount` should be positive for credits and negative for debits, or you can use the `type` field to distinguish.
//     * /api/wallet/invoices - Should return an array of objects, where each object has the structure:
//         {
//           "id": "INV001",
//           "date": "2024-05-28",
//           "client": "ABC Corp",
//           "amount": 850.00,
//           "dueDate": "2024-05-30",
//           "status": "Paid"
//         }
*/
