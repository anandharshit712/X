import React, { useState, useEffect } from 'react';
import { getPayments } from '../../services/payments';
import { getApps } from '../../services/apps';
import { Search, Calendar, ChevronDown, Inbox } from 'lucide-react';

// --- DATA AND TYPES ---

// Defines the structure for a single transaction record
interface TransactionData {
  dateAdded: string;
  billingMonth: string;
  amount: number;
  app: string;
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

const PaymentsPage = () => {
  // State for data and loading status
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [appOptions, setAppOptions] = useState<string[]>(['All Applications']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for filter inputs
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedApp, setSelectedApp] = useState('All Applications');

  // Effect to fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const paymentsResponse = await getPayments();
        setTransactions(paymentsResponse.data);

        const appsResponse = await getApps();
        const appNames = appsResponse.items.map((app: any) => app.app_package);
        setAppOptions(['All Applications', ...appNames]);

      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter logic
  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      searchQuery === '' ||
      txn.billingMonth.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.amount.toString().includes(searchQuery);
    
    const matchesApp =
      selectedApp === 'All Applications' || txn.app === selectedApp;

    const matchesDate =
      selectedDate === '' || txn.dateAdded === selectedDate;

    return matchesSearch && matchesApp && matchesDate;
  });

  return (
    <div className="flex-1 p-8 min-h-screen bg-gray-50">
      <LoggedInNavbar title="Payments" />

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
          placeholder="Search Billing Month or Amount"
        />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm text-gray-500"
        />
        <select
          value={selectedApp}
          onChange={(e) => setSelectedApp(e.target.value)}
          className="p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
        >
          {appOptions.map((app) => (
            <option key={app} value={app}>{app}</option>
          ))}
        </select>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm">
        {loading ? (
          <div className="text-center p-10">Loading...</div>
        ) : error ? (
          <div className="text-center p-10 text-red-500">{error}</div>
        ) : filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th scope="col" className="px-6 py-3 font-medium">Date Added</th>
                  <th scope="col" className="px-6 py-3 font-medium">Billing Month</th>
                  <th scope="col" className="px-6 py-3 font-medium">Amount Released</th>
                  <th scope="col" className="px-6 py-3 font-medium">App</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map((txn, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{txn.dateAdded}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{txn.billingMonth}</td>
                    <td className="px-6 py-4 whitespace-nowrap">₹{txn.amount.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{txn.app}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
            <img 
                src="https://i.imgur.com/t2y2G1q.png" 
                alt="No data found" 
                className="w-48 h-48"
            />
            <p className="text-xl text-gray-500 mt-4">No data found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters to find what you're looking for.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;