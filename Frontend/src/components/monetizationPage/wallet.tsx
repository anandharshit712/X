import React, { useState, useEffect } from "react";
import {
  getBalance,
  getTransactions,
  getWalletInvoices,
  addFunds,
} from "../../services/wallet";
import {
  DollarSign,
  List,
  FileText,
  PlusCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

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
  const [addFundsMethod, setAddFundsMethod] = useState("BANK_TRANSFER"); // enum value

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
      setWalletInvoices(invoicesRes.data); // <-- FIXED (backend returns array directly)
    } catch (err: any) {
      setError(err.response?.data?.message || "");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFundsAmount || parseFloat(addFundsAmount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    try {
      await addFunds({
        amount: parseFloat(addFundsAmount),
        method: addFundsMethod,
      });
      alert("Funds added successfully!");
      setAddFundsModalOpen(false);
      setAddFundsAmount("");
      setAddFundsMethod("BANK_TRANSFER");
      fetchWalletData(); // Refresh data
    } catch (err) {
      alert("Failed to add funds.");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 min-h-screen bg-gray-50">
        Loading wallet data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8 min-h-screen bg-gray-50 text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 min-h-screen bg-gray-50">
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
          Add Funds
        </button>
      </div>

      {/* Transactions and Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2">Method</th>
                    <th className="px-4 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((txn, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap">
                        {format(new Date(txn.created_at), "MMM dd, yyyy")}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap capitalize">
                        {txn.type.replace("_", " ").toLowerCase()}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap capitalize">
                        {txn.payment_method
                          ? txn.payment_method.replace("_", " ").toLowerCase()
                          : "-"}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-right">
                        ₹{txn.amount.toLocaleString("en-IN")}
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

        {/* Wallet Invoices (Receipts) */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <FileText size={20} /> Top-up Receipts
          </h3>
          {walletInvoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Amount</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {walletInvoices.map((inv, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap">
                        {format(new Date(inv.created_at), "MMM dd, yyyy")}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        ₹{inv.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap capitalize">
                        {inv.status.toLowerCase()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              No top-up receipts found.
            </div>
          )}
        </div>
      </div>

      {/* Add Funds Modal */}
      {isAddFundsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleAddFunds}
            className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md"
          >
            <h2 className="text-2xl font-bold text-black mb-4">
              Add Funds to Wallet
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Amount (₹)
                </label>
                <input
                  type="number"
                  id="amount"
                  value={addFundsAmount}
                  onChange={(e) => setAddFundsAmount(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                  min="1"
                />
              </div>
              <div>
                <label
                  htmlFor="method"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Payment Method
                </label>
                <select
                  id="method"
                  value={addFundsMethod}
                  onChange={(e) => setAddFundsMethod(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                  required
                >
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                </select>
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
                className="py-2 px-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
              >
                <Loader2 className="inline w-4 h-4 mr-2 animate-spin" /> Add
                Funds
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default WalletPage;
