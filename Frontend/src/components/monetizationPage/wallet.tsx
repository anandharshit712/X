import React, { useState, useEffect } from "react";
import {
  DollarSign,
  List,
  FileText,
  PlusCircle,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { format } from "date-fns";

// --- MOCKED API FUNCTIONS ---
// In a real application, these functions would make API calls to your backend.
// For this example, we are mocking them to make the component runnable.

const getBalance = async () => {
  console.log("Fetching balance...");
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return { data: { balance: 5491.00 } };
};

const getTransactions = async () => {
  console.log("Fetching transactions...");
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    data: {
      items: [
        { created_at: new Date(), type: "TOP_UP", payment_method: "BANK_TRANSFER", amount: 2000 },
        { created_at: new Date(Date.now() - 86400000 * 2), type: "EXPENSE", payment_method: null, amount: -500 },
        { created_at: new Date(Date.now() - 86400000 * 5), type: "TOP_UP", payment_method: "UPI", amount: 3000 },
      ],
    },
  };
};

const getWalletInvoices = async () => {
    console.log("Fetching invoices...");
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
        data: [
            { created_at: new Date(), amount: 2000, status: 'PAID' },
            { created_at: new Date(Date.now() - 86400000 * 5), amount: 3000, status: 'PAID' },
        ]
    };
};


const addFunds = async ({ amount, method }: { amount: number, method: string }) => {
  console.log(`Adding funds: Amount=${amount}, Method=${method}`);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
  // In a real app, you might return the new transaction details
  return { success: true };
};


// --- HELPER COMPONENTS ---

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

const WalletPage = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [walletInvoices, setWalletInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddFundsModalOpen, setAddFundsModalOpen] = useState(false);
  const [addFundsAmount, setAddFundsAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchWalletData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [balanceRes, transactionsRes, invoicesRes] = await Promise.all([
        getBalance(),
        getTransactions(),
        getWalletInvoices(),
      ]);
      setBalance(balanceRes.data.balance);
      setTransactions(transactionsRes.data.items);
      setWalletInvoices(invoicesRes.data);
    } catch (err: any) {
      setError("Failed to fetch wallet data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(addFundsAmount);
    if (!addFundsAmount || amount < 50) {
      // Using a custom modal/toast for alerts is better than window.alert
      console.error("Please enter an amount of at least ₹50.");
      return;
    }
    setIsSubmitting(true);
    try {
      await addFunds({
        amount: amount,
        method: "BANK_TRANSFER", // Hardcoded as payment method is removed from UI
      });
      console.log("Funds added successfully!");
      setAddFundsModalOpen(false);
      setAddFundsAmount("");
      fetchWalletData(); // Refresh data
    } catch (err) {
      console.error("Failed to add funds.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8 min-h-screen bg-gray-50 flex flex-col items-center justify-center text-red-500">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p className="text-xl">Error: {error}</p>
        <button
          onClick={fetchWalletData}
          className="mt-4 py-2 px-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  const amount = parseFloat(addFundsAmount) || 0;
  const gst = amount * 0.18;
  const totalPayable = amount + gst;

  return (
    <div className="flex-1 p-8 min-h-screen bg-gray-50 font-sans">
      <LoggedInNavbar title="Wallet" />

      {/* Wallet Balance Card */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-700">
            Current Balance
          </h3>
          <p className="text-4xl font-bold text-purple-600 mt-2">
            ₹{balance !== null ? balance.toLocaleString("en-IN") : "N/A"}
          </p>
        </div>
        <button
          onClick={() => setAddFundsModalOpen(true)}
          className="flex items-center gap-2 py-2 px-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all"
        >
          <PlusCircle size={20} />
          Transfer to Ad Account
        </button>
      </div>

      {/* Transactions and Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        {/* Transactions */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <List size={20} /> Recent Transactions
          </h3>
          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((txn, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap">
                        {format(new Date(txn.created_at), "MMM dd, yyyy")}
                      </td>
                      <td className={`px-4 py-2 whitespace-nowrap text-right font-medium ${txn.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {txn.amount > 0 ? '+' : ''}₹{Math.abs(txn.amount).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              No transactions found.
            </div>
          )}
        </div>
      </div>

      {/* Add Funds Modal */}
      {isAddFundsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setAddFundsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-black mb-2">
              Add Funds to Wallet
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Available Funds: ₹
              {balance !== null
                ? balance.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : "N/A"}
            </p>
            <form onSubmit={handleAddFunds}>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="amount"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Enter Amount
                  </label>
                  <input
                    type="number"
                    id="amount"
                    value={addFundsAmount}
                    onChange={(e) => setAddFundsAmount(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Minimum funds is ₹50"
                    required
                    min="50"
                  />
                </div>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 mt-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Funds to be added:</span>
                    <span>
                      ₹
                      {amount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>GST (18%):</span>
                    <span>
                      ₹
                      {gst.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-800 mt-2 pt-2 border-t">
                    <span>Total Payable:</span>
                    <span>
                      ₹
                      {totalPayable.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setAddFundsModalOpen(false)}
                  className="py-2 px-6 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2 px-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold flex items-center justify-center disabled:bg-purple-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting && (
                    <Loader2 className="inline w-4 h-4 mr-2 animate-spin" />
                  )}
                  {isSubmitting ? "Adding..." : "Add Funds"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPage;
