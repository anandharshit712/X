import React, { useState, useEffect } from 'react';
import { Search, Calendar, ChevronDown, Inbox } from 'lucide-react';

// --- MOCK DATA AND TYPES ---

// Defines the structure for a single transaction record
interface TransactionData {
  dateAdded: string;
  billingMonth: string;
  amount: number;
  app: string;
}

// Mock data for the list of transactions
const mockTransactions: TransactionData[] = [
  { dateAdded: '2025-07-15', billingMonth: 'June 2025', amount: 12500.00, app: 'Instagram' },
  { dateAdded: '2025-06-15', billingMonth: 'May 2025', amount: 13963.54, app: 'WhatsApp' },
  { dateAdded: '2025-05-15', billingMonth: 'April 2025', amount: 11850.75, app: 'Instagram' },
  { dateAdded: '2025-04-15', billingMonth: 'March 2025', amount: 9500.00, app: 'TikTok' },
];

// Mock data for the app filter dropdown
const appOptions = ['All Applications', 'Instagram', 'WhatsApp', 'TikTok'];

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for filter inputs
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedApp, setSelectedApp] = useState('All Applications');

  // Effect to simulate fetching data on component mount
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setTransactions(mockTransactions);
      setLoading(false);
    }, 1000); // Simulate network delay
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

/*
* =================================================================
* == COMPONENT, STATE, AND INTEGRATION DOCUMENTATION
* =================================================================
*
* === COMPONENT: PaymentsPage ===
* - Purpose: This component displays a history of payments. It provides
* users with tools to filter the payment records by a search query (month or amount),
* a specific date, or by application.
*
* === STATE VARIABLES ===
*
* - `transactions` (Array<TransactionData>):
* - Holds the list of all payment transaction objects fetched from the backend.
* - For backend integration: This state should be populated by a GET request to your
* payments API endpoint (e.g., `/api/payments`).
*
* - `loading` (boolean):
* - Used to display a loading indicator while the initial data is being fetched.
*
* - `error` (string | null):
* - Stores any error messages if the API call fails.
*
* - `searchQuery` (string):
* - Stores the value from the text input used to filter by billing month or amount.
* - For backend integration: This could be used for client-side filtering (as implemented)
* or sent as a query parameter (`?q=...`) to the backend for server-side search.
*
* - `selectedDate` (string):
* - Stores the date selected from the date picker (format: 'YYYY-MM-DD').
* - For backend integration: This should be sent as a `date` query parameter to filter results.
*
* - `selectedApp` (string):
* - Stores the application name selected from the dropdown.
* - For backend integration: This should be sent as an `app` query parameter.
*
* === BACKEND INTEGRATION NOTES ===
*
* 1.  **Fetch Payments API**: Create an endpoint like `GET /api/payments`.
* - This endpoint should return an array of payment objects.
* - Each object should match the `TransactionData` interface.
* - The `useEffect` hook should be updated to call this API instead of using mock data.
*
* 2.  **Server-Side Filtering (Optional but Recommended)**: For better performance with large datasets,
* implement filtering on the backend. The API endpoint could accept query parameters:
* - `GET /api/payments?q={searchQuery}&date={selectedDate}&app={selectedApp}`
* - The frontend would then refetch data from the API whenever a filter changes,
* instead of filtering the data on the client side.
*
* 3.  **Populate App Filter**: The `appOptions` array should be dynamically populated by fetching
* a list of the user's applications from an endpoint like `GET /api/apps`.
*/
