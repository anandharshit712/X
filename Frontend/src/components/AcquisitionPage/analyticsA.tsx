import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, DollarSign, BarChart, MousePointerClick, Users, TrendingUp } from 'lucide-react';
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
import { addDays, format, subDays } from 'date-fns';

// --- Mock Components & Data ---
// This section mocks dependencies to make the component runnable.

const LoggedInNavbar = ({ title }) => (
  <div className="flex justify-between items-center mb-8">
    <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
    <div className="flex items-center space-x-4">
      <div className="w-10 h-10 bg-indigo-200 text-indigo-700 flex items-center justify-center rounded-full font-bold text-lg">
        JA
      </div>
    </div>
  </div>
);

// Simulates a backend API call
const mockApiCall = (startDate, endDate) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData = [];
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        mockData.push({
          date: format(currentDate, 'yyyy-MM-dd'),
          revenue: Math.floor(Math.random() * 1000) + 200,
          conversions: Math.floor(Math.random() * 100) + 10,
          clicks: Math.floor(Math.random() * 3000) + 500,
          cr: (Math.random() * 10).toFixed(2),
          arpu: (Math.random() * 5 + 1).toFixed(2),
          app: ['App A', 'App B', 'App C'][Math.floor(Math.random() * 3)],
          country: ['USA', 'India', 'Canada'][Math.floor(Math.random() * 3)],
        });
        currentDate = addDays(currentDate, 1);
      }
      resolve({ data: mockData });
    }, 500);
  });
};


// --- Main Analytics Component ---

const AnalyticsPage = () => {
  // --- State Management ---
  const [data, setData] = useState({
    revenue: 0,
    conversion: '0.00',
    clicks: 0,
    conversions: 0,
    arpu: '0.00',
    graphData: [],
    tableData: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  });

  // --- Data Fetching Effect ---
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await mockApiCall(dateRange.startDate, dateRange.endDate);
        const analytics = Array.isArray(res.data) ? res.data : [];

        if (analytics.length === 0) {
          setData({ revenue: 0, conversion: '0.00', clicks: 0, conversions: 0, arpu: '0.00', graphData: [], tableData: [] });
          return;
        }

        // Aggregate metrics
        const totalRevenue = analytics.reduce((sum, row) => sum + (row.revenue || 0), 0);
        const totalClicks = analytics.reduce((sum, row) => sum + (row.clicks || 0), 0);
        const totalConversions = analytics.reduce((sum, row) => sum + (row.conversions || 0), 0);
        const avgConversion = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : '0.00';
        const avgArpu = analytics.length > 0 ? (analytics.reduce((sum, row) => sum + parseFloat(row.arpu || 0), 0) / analytics.length).toFixed(2) : '0.00';

        setData({
          revenue: totalRevenue,
          conversion: avgConversion,
          clicks: totalClicks,
          conversions: totalConversions,
          arpu: avgArpu,
          graphData: analytics.map(row => ({
            date: format(new Date(row.date), 'MMM d'),
            Revenue: row.revenue,
            Conversions: row.conversions,
          })),
          tableData: analytics,
        });

      } catch (err) {
        setError(err.message || 'Failed to fetch analytics');
        setData({ revenue: 0, conversion: '0.00', clicks: 0, conversions: 0, arpu: '0.00', graphData: [], tableData: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateRange]);

  // --- Event Handlers ---
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: new Date(value) }));
  };

  // --- UI Configuration ---
  const metricCards = [
    { title: 'Revenue', value: `$${data.revenue.toLocaleString()}`, Icon: DollarSign },
    { title: 'Conversion', value: `${data.conversion}%`, Icon: BarChart },
    { title: 'Clicks', value: data.clicks.toLocaleString(), Icon: MousePointerClick },
    { title: 'Conversions', value: data.conversions.toLocaleString(), Icon: Users },
    { title: 'ARPU', value: `$${data.arpu}`, Icon: TrendingUp },
  ];

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <LoggedInNavbar title="Analytics" />

        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-4 bg-white rounded-lg shadow-sm border">
          <div className="flex items-center space-x-2 border border-gray-300 px-3 py-2 rounded-lg">
            <Calendar size={18} className="text-gray-500" />
            <input type="date" name="startDate" value={format(dateRange.startDate, 'yyyy-MM-dd')} onChange={handleDateChange} className="bg-transparent outline-none w-full text-sm"/>
            <span className="text-gray-400">-</span>
            <input type="date" name="endDate" value={format(dateRange.endDate, 'yyyy-MM-dd')} onChange={handleDateChange} className="bg-transparent outline-none w-full text-sm"/>
          </div>
          <div className="border border-gray-300 rounded-lg">
            <select className="w-full text-sm bg-white px-3 py-2.5 rounded-lg outline-none cursor-pointer">
              <option>All Applications</option>
              <option>App A</option>
              <option>App B</option>
            </select>
          </div>
          <div className="flex items-center space-x-2 border border-gray-300 px-3 py-2 rounded-lg">
             <input type="checkbox" id="group-by" className="h-4 w-4 text-indigo-600 border-gray-300 rounded"/>
             <label htmlFor="group-by" className="text-sm text-gray-700">Group by App</label>
          </div>
        </div>

        {/* Key Metrics Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {metricCards.map(({ title, value, Icon }) => (
            <div key={title} className="bg-white p-5 rounded-lg shadow-sm border">
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">{loading ? '...' : value}</p>
            </div>
          ))}
        </div>

        {/* Main Chart Section */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-700 mb-6">Revenue & Conversions Trend</h3>
            <div style={{ height: '350px' }}>
              {loading ? (
                  <div className="flex justify-center items-center h-full"><p className="text-gray-500">Loading Chart...</p></div>
              ) : error ? (
                  <div className="flex justify-center items-center h-full"><p className="text-red-500">{error}</p></div>
              ) : data.graphData.length === 0 ? (
                  <div className="flex justify-center items-center h-full"><p className="text-gray-500">No data available for the selected range.</p></div>
              ) : (
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.graphData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
                          <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#6b7280" />
                          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#6b7280" />
                          <Tooltip contentStyle={{ borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                          <Legend />
                          <Line yAxisId="left" type="monotone" dataKey="Revenue" stroke="#8b5cf6" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                          <Line yAxisId="right" type="monotone" dataKey="Conversions" stroke="#a78bfa" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                      </LineChart>
                  </ResponsiveContainer>
              )}
            </div>
        </div>

        {/* Detailed Data Table */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-700">Detailed Analytics Data</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            {['Date', 'Revenue', 'Conversions', 'Clicks', 'CR', 'ARPU', 'App', 'Country'].map(header => (
                                <th key={header} scope="col" className="px-6 py-3 font-medium tracking-wider">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="8" className="text-center p-6">Loading data...</td></tr>
                        ) : data.tableData.length === 0 ? (
                            <tr><td colSpan="8" className="text-center p-6">No data to display.</td></tr>
                        ) : (
                            data.tableData.map((row, index) => (
                                <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{format(new Date(row.date), 'MMM d, yyyy')}</td>
                                    <td className="px-6 py-4">${row.revenue.toLocaleString()}</td>
                                    <td className="px-6 py-4">{row.conversions.toLocaleString()}</td>
                                    <td className="px-6 py-4">{row.clicks.toLocaleString()}</td>
                                    <td className="px-6 py-4">{row.cr}%</td>
                                    <td className="px-6 py-4">${row.arpu}</td>
                                    <td className="px-6 py-4">{row.app}</td>
                                    <td className="px-6 py-4">{row.country}</td>
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

export default AnalyticsPage;

/*
---
BACKEND INTEGRATION AND VARIABLE SUMMARY
---

This document provides a summary of the state variables used in the `AnalyticsPage` component and instructions for connecting it to a live backend.

---
STATE VARIABLES
---

1.  `data` (Object):
    * Holds all the calculated and formatted data for display.
    * `revenue`, `clicks`, `conversions`: (Number) Total values for the selected period.
    * `conversion`, `arpu`: (String) Calculated average values, formatted to two decimal places.
    * `graphData`: (Array of Objects) Formatted for the Recharts Line Chart. Each object needs a `date`, `Revenue`, and `Conversions` key.
    * `tableData`: (Array of Objects) Raw data from the API used to populate the detailed table.

2.  `loading` (Boolean):
    * Controls the visibility of loading indicators across the component.
    * Set to `true` before an API call and `false` after it completes.

3.  `error` (String | null):
    * Stores error messages from failed API calls. Displayed to the user if not null.

4.  `dateRange` (Object):
    * Stores the `startDate` and `endDate` (Date objects) for the analytics query.
    * Changing this state triggers the `useEffect` hook to fetch new data.

---
BACKEND CONNECTION
---

To connect this component to your backend, you need to replace the `mockApiCall` function with a real API request.

1.  **API Endpoint:**
    * The component is designed to fetch data from an endpoint like `/api/analytics`.
    * This endpoint should accept `startDate` and `endDate` as query parameters in `YYYY-MM-DD` format.
    * Example Request: `GET /api/analytics?startDate=2023-10-01&endDate=2023-10-31`

2.  **Required Data Structure from API:**
    * Your API should return a JSON object containing a `data` key, which is an array of daily analytic objects.
    * Each object in the array **must** have the following structure and data types:
        {
          "date": "2023-10-26",     // String (YYYY-MM-DD)
          "revenue": 550.25,        // Number
          "conversions": 45,        // Number
          "clicks": 1500,           // Number
          "cr": "3.00",             // String or Number (Conversion Rate %)
          "arpu": "2.50",           // String or Number (Average Revenue Per User)
          "app": "App Name",        // String
          "country": "USA"          // String
        }

3.  **Implementation:**
    * Import your preferred HTTP client (e.g., `axios`).
    * In the `fetchAnalytics` function inside the `useEffect` hook, replace this line:
        `const res = await mockApiCall(dateRange.startDate, dateRange.endDate);`
    * With your actual API call:
        ```javascript
        const params = {
          startDate: format(dateRange.startDate, "yyyy-MM-dd"),
          endDate: format(dateRange.endDate, "yyyy-MM-dd"),
        };
        // Replace '/api/analytics' with your actual endpoint
        const res = await axios.get("/api/analytics", { params });
        ```
    * The component will automatically handle the processing and display of the data as long as the response format matches the structure defined above.
*/
