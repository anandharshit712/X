import React, { useState, useRef, useEffect } from 'react';
import { Calendar, DollarSign, BarChart2, Users, MousePointerClick, X } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { addDays, format } from 'date-fns';

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


// --- Mock Components and Data ---
// This section mocks dependencies that would be in your project

// Mock for LoggedInNavbar
const LoggedInNavbar = ({ title, onAddFundsClick }) => (
  <div className="flex justify-between items-center mb-8">
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

// Mock for axios.get - simulates an API call
const mockApiCall = (startDate, endDate) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData = [];
      let currentDate = new Date(startDate);
      // Ensure we don't create an infinite loop if dates are invalid
      if (startDate > endDate) {
        resolve({ data: [] });
        return;
      }
      while (currentDate <= endDate) {
        mockData.push({
          date: format(currentDate, 'yyyy-MM-dd'),
          spend: Math.floor(Math.random() * 500) + 100,
          CR: (Math.random() * 5).toFixed(2), // Conversion Rate
          clicks: Math.floor(Math.random() * 2000) + 500,
          conversions: Math.floor(Math.random() * 100) + 20,
        });
        currentDate = addDays(currentDate, 1);
      }
      resolve({ data: mockData });
    }, 500); // Simulate network delay
  });
};


// --- Main Analytics Component ---

const AnalyticsPage = () => {
  // State for holding all fetched and calculated analytics data
  const [data, setData] = useState({
    spend: 0,
    conversion: '0.00',
    dau: 0, // Daily Active Users (represented by conversions in the original code)
    clicks: 0,
    graphData: [],
    tableData: [],
  });

  // State for managing loading and error UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for the date range picker
  const [dateRange, setDateRange] = useState([
    {
      startDate: addDays(new Date(), -30),
      endDate: new Date(),
      key: 'selection',
    },
  ]);
  
  // State for the "Add Funds" modal
  const [isAddFundsModalOpen, setAddFundsModalOpen] = useState(false);


  // Effect to fetch and process analytics data when the date range changes
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        // In a real app, you would get the advertiserId from localStorage or context
        // const advertiserId = localStorage.getItem("userId");
        // if (!advertiserId) throw new Error("No advertiser ID found");

        const res = await mockApiCall(dateRange[0].startDate, dateRange[0].endDate);
        const analytics = Array.isArray(res.data) ? res.data : [];

        if (analytics.length === 0) {
            setData({ spend: 0, conversion: '0.00', dau: 0, clicks: 0, graphData: [], tableData: [] });
            return;
        }

        // Aggregate metrics from the fetched data
        const totalSpend = analytics.reduce((sum, row) => sum + (row.spend || 0), 0);
        const avgConversion = (analytics.reduce((sum, row) => sum + parseFloat(row.CR || 0), 0) / analytics.length).toFixed(2);
        const totalClicks = analytics.reduce((sum, row) => sum + (row.clicks || 0), 0);
        const avgDau = Math.round(analytics.reduce((sum, row) => sum + (row.conversions || 0), 0) / analytics.length);

        setData({
          spend: totalSpend,
          conversion: avgConversion,
          dau: avgDau,
          clicks: totalClicks,
          graphData: analytics.map(row => ({
            date: format(new Date(row.date), 'MMM d'),
            Spend: row.spend,
            Acquisitions: row.conversions,
          })),
          tableData: analytics.map(row => ({
            date: row.date,
            spend: row.spend,
            conversion: row.CR,
            click: row.clicks,
            dau: row.conversions,
          })),
        });

      } catch (err) {
        setError(err.message || 'Failed to fetch analytics');
        // Reset data on error
        setData({ spend: 0, conversion: '0.00', dau: 0, clicks: 0, graphData: [], tableData: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateRange]);

  // Metric cards configuration
  const metricCards = [
    { title: 'Spend', value: `$${data.spend.toLocaleString()}`, Icon: DollarSign },
    { title: 'Avg. Conversion', value: `${data.conversion}%`, Icon: BarChart2 },
    { title: 'Avg. Daily Users', value: data.dau.toLocaleString(), Icon: Users },
    { title: 'Total Clicks', value: data.clicks.toLocaleString(), Icon: MousePointerClick },
  ];

  const handleStartDateChange = (e) => {
    const newStartDate = new Date(e.target.value);
    // Add a day to the start date to account for timezone issues with date inputs
    const adjustedStartDate = addDays(newStartDate, 1);
    if (adjustedStartDate <= dateRange[0].endDate) {
      setDateRange([{ ...dateRange[0], startDate: adjustedStartDate }]);
    }
  };

  const handleEndDateChange = (e) => {
    const newEndDate = new Date(e.target.value);
    const adjustedEndDate = addDays(newEndDate, 1);
    if (adjustedEndDate >= dateRange[0].startDate) {
      setDateRange([{ ...dateRange[0], endDate: adjustedEndDate }]);
    }
  };


  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <LoggedInNavbar 
            title="Analytics Dashboard" 
            onAddFundsClick={() => setAddFundsModalOpen(true)}
        />
        
        <AddFundsModal 
            isOpen={isAddFundsModalOpen} 
            onClose={() => setAddFundsModalOpen(false)} 
        />

        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Date Range Picker */}
           <div className="bg-white border border-gray-300 px-3 py-2 rounded-lg shadow-sm flex items-center space-x-3">
              <Calendar size={18} className="text-gray-600 flex-shrink-0" />
              <div className="flex items-center justify-between w-full text-sm font-medium text-gray-700">
                  <input
                      type="date"
                      value={format(dateRange[0].startDate, 'yyyy-MM-dd')}
                      onChange={handleStartDateChange}
                      className="bg-transparent outline-none w-full"
                      aria-label="Start Date"
                  />
                  <span className="mx-2">-</span>
                  <input
                      type="date"
                      value={format(dateRange[0].endDate, 'yyyy-MM-dd')}
                      onChange={handleEndDateChange}
                      className="bg-transparent outline-none w-full"
                      aria-label="End Date"
                  />
              </div>
            </div>


          {/* Other Filters */}
          {['All Applications', 'All Campaigns', 'All Countries'].map((filter, i) => (
             <div key={i} className="w-full bg-white border border-gray-300 px-4 py-2 rounded-lg shadow-sm">
                <select className="w-full text-sm font-medium text-gray-700 bg-transparent outline-none cursor-pointer">
                  <option>{filter}</option>
                  <option>Option A</option>
                  <option>Option B</option>
                </select>
            </div>
          ))}
        </div>

        {/* Key Metrics Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metricCards.map(({ title, value, Icon }) => (
            <div key={title} className="bg-white p-5 rounded-xl shadow-md transition-transform transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                 <p className="text-sm font-medium text-gray-500">{title}</p>
                 <Icon className="text-indigo-500" size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-800 mt-2">{loading ? '...' : value}</p>
            </div>
          ))}
        </div>

        {/* Main Chart and Table Section */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-6">Spend and Acquisition Trends</h3>
            {loading ? (
                <div className="flex justify-center items-center h-80"><p className="text-gray-500">Loading data...</p></div>
            ) : error ? (
                <div className="flex justify-center items-center h-80"><p className="text-red-500">{error}</p></div>
            ) : data.graphData.length === 0 ? (
                <div className="flex justify-center items-center h-80"><p className="text-gray-500">No data available for the selected date range.</p></div>
            ) : (
                <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={data.graphData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
                        <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                border: '1px solid #e0e0e0',
                                borderRadius: '0.5rem',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="Spend" stroke="#6366F1" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="Acquisitions" stroke="#a78bfa" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>

        {/* Detailed Data Table */}
        <div className="mt-8 bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700">Detailed Analytics</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            {['Date', 'Spend', 'Conversion', 'Clicks', 'Acquisitions (DAU)'].map(header => (
                                <th key={header} scope="col" className="px-6 py-3 font-medium tracking-wider">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="text-center p-6">Loading...</td></tr>
                        ) : data.tableData.length === 0 ? (
                            <tr><td colSpan="5" className="text-center p-6">No data to display.</td></tr>
                        ) : (
                            data.tableData.map((row, index) => (
                                <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{format(new Date(row.date), 'MMMM d, yyyy')}</td>
                                    <td className="px-6 py-4 text-gray-700">${row.spend.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-gray-700">{row.conversion}%</td>
                                    <td className="px-6 py-4 text-gray-700">{row.click.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-gray-700">{row.dau.toLocaleString()}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  );
};

// Default export for integration into projects like Next.js or Create React App
export default AnalyticsPage;
