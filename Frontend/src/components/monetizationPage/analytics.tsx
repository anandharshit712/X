import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, ChevronDown, CheckSquare, Square } from 'lucide-react';
import { addDays, format } from 'date-fns';

// --- MOCK DATA AND TYPES ---

// Defines the structure for a single row of analytics data
interface AnalyticsData {
  date: string;
  revenue: number;
  conversions: number;
  clicks: number;
  cr: number;
  arpu: number;
  appName?: string;
  country?: string;
}

// Defines the structure for an app option in the dropdown
interface AppOption {
  id: string;
  name:string;
}

// Mock data for the list of apps to filter by
const appOptions: AppOption[] = [
    { id: 'all', name: 'All Applications' },
    { id: '31892242', name: 'Instagram' },
    { id: '31892243', name: 'WhatsApp' },
    { id: '1', name: 'TikTok' },
];

// Mock analytics data
const mockAnalyticsData: AnalyticsData[] = [
  { date: '2025-07-01', revenue: 220, conversions: 20, clicks: 1500, cr: 1.33, arpu: 0.15, appName: 'Instagram', country: 'IN' },
  { date: '2025-07-02', revenue: 250, conversions: 22, clicks: 1600, cr: 1.38, arpu: 0.16, appName: 'WhatsApp', country: 'US' },
  { date: '2025-07-03', revenue: 300, conversions: 25, clicks: 1800, cr: 1.39, arpu: 0.17, appName: 'Instagram', country: 'IN' },
  { date: '2025-07-04', revenue: 280, conversions: 24, clicks: 1750, cr: 1.37, arpu: 0.16, appName: 'TikTok', country: 'UK' },
  { date: '2025-07-05', revenue: 350, conversions: 30, clicks: 2000, cr: 1.50, arpu: 0.18, appName: 'WhatsApp', country: 'US' },
  { date: '2025-07-06', revenue: 400, conversions: 35, clicks: 2200, cr: 1.59, arpu: 0.18, appName: 'Instagram', country: 'IN' },
  { date: '2025-07-07', revenue: 380, conversions: 33, clicks: 2100, cr: 1.57, arpu: 0.18, appName: 'TikTok', country: 'UK' },
];

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

// Metric Card Component
const MetricCard = ({ title, value }: { title: string, value: string | number }) => (
    <div className="bg-white shadow-md p-4 rounded-xl transition-all hover:shadow-lg hover:bg-purple-50">
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
);


// --- MAIN COMPONENT ---

const AnalyticsPage = () => {
    // State for data and loading status
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for filters
    const [dateRange, setDateRange] = useState({
        startDate: addDays(new Date(), -30),
        endDate: new Date(),
        key: 'selection',
    });
    const [isCalendarOpen, setCalendarOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState('all');
    const [groupByApp, setGroupByApp] = useState(false);
    
    // State to track if the date range picker library is loaded
    const [isDateRangeLoaded, setIsDateRangeLoaded] = useState(!!window.ReactDateRange);

    const calendarRef = useRef<HTMLDivElement>(null);
    
    // Effect to dynamically load the react-date-range script and styles
    useEffect(() => {
        if (isDateRangeLoaded) return;

        const loadAsset = (tag: 'script' | 'link', attributes: Record<string, string>) => {
            if (document.querySelector(`${tag}[data-id="${attributes['data-id']}"]`)) {
                return;
            }
            const element = document.createElement(tag);
            Object.keys(attributes).forEach(key => element.setAttribute(key, attributes[key]));
            document.head.appendChild(element);
            return element;
        };

        loadAsset('link', { 'data-id': 'rd-styles', rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/react-date-range@1.4.0/dist/styles.css' });
        loadAsset('link', { 'data-id': 'rd-theme', rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/react-date-range@1.4.0/dist/theme/default.css' });
        
        const script = loadAsset('script', { 'data-id': 'rd-script', src: 'https://cdn.jsdelivr.net/npm/react-date-range@1.4.0/dist/main.js' });

        if (script) {
            script.onload = () => {
                if (window.ReactDateRange) {
                    setIsDateRangeLoaded(true);
                }
            };
        } else {
             // If script was already on page, the component is ready
             if(window.ReactDateRange) setIsDateRangeLoaded(true);
        }

    }, [isDateRangeLoaded]);

    // Effect to fetch and filter data when dependencies change
    useEffect(() => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            let data = mockAnalyticsData;
            if (selectedApp !== 'all') {
                const appName = appOptions.find(app => app.id === selectedApp)?.name;
                data = data.filter(row => row.appName === appName);
            }
            setAnalyticsData(data);
            setLoading(false);
        }, 500);
    }, [dateRange, selectedApp, groupByApp]);

    // Effect to handle clicks outside the calendar to close it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setCalendarOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [calendarRef]);

    // Calculate aggregate metrics for the cards
    const totalRevenue = analyticsData.reduce((sum, row) => sum + row.revenue, 0);
    const totalClicks = analyticsData.reduce((sum, row) => sum + row.clicks, 0);
    const totalConversions = analyticsData.reduce((sum, row) => sum + row.conversions, 0);
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    const averageARPU = analyticsData.length > 0 ? analyticsData.reduce((sum, row) => sum + row.arpu, 0) / analyticsData.length : 0;

    const metricCards = [
        { title: "Revenue", value: `₹${totalRevenue.toLocaleString('en-IN')}` },
        { title: "Conversion", value: `${conversionRate.toFixed(2)}%` },
        { title: "Clicks", value: totalClicks.toLocaleString('en-IN') },
        { title: "Conversions", value: totalConversions.toLocaleString('en-IN') },
        { title: "ARPU", value: `₹${averageARPU.toFixed(2)}` },
    ];
    
    // Get the DateRange component from the window object once loaded
    const DateRangePicker = isDateRangeLoaded ? window.ReactDateRange.DateRange : null;

    return (
        <div className="flex-1 p-8 bg-gray-50 min-h-screen">
            <LoggedInNavbar title="Analytics" />

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {/* Date Range Picker */}
                <div className="relative" ref={calendarRef}>
                    <button
                        onClick={() => setCalendarOpen(!isCalendarOpen)}
                        className="flex items-center justify-between w-full space-x-2 bg-white border border-gray-300 px-4 py-2.5 rounded-lg shadow-sm hover:bg-gray-50"
                    >
                        <Calendar size={18} className="text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                            {`${format(dateRange.startDate, "MMM dd, yyyy")} - ${format(dateRange.endDate, "MMM dd, yyyy")}`}
                        </span>
                        <ChevronDown size={18} className="text-gray-500" />
                    </button>
                    {isCalendarOpen && (
                        <div className="absolute top-full mt-2 z-50 bg-white rounded-lg border shadow-2xl">
                           {DateRangePicker ? (
                                <>
                                    <DateRangePicker
                                        editableDateInputs={true}
                                        onChange={(item: any) => setDateRange(item.selection)}
                                        moveRangeOnFirstSelection={false}
                                        ranges={[dateRange]}
                                        months={2}
                                        direction="horizontal"
                                        rangeColors={["#8B5CF6"]}
                                    />
                                    <div className="flex justify-end p-2 border-t bg-gray-50">
                                        <button onClick={() => setCalendarOpen(false)} className="px-4 py-1.5 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700">Apply</button>
                                    </div>
                                </>
                           ) : (
                               <div className="p-4">Loading Calendar...</div>
                           )}
                        </div>
                    )}
                </div>

                {/* App Selector */}
                <select
                    value={selectedApp}
                    onChange={e => setSelectedApp(e.target.value)}
                    className="w-full bg-white border border-gray-300 px-4 py-2.5 rounded-lg shadow-sm text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                    {appOptions.map(app => (
                        <option key={app.id} value={app.id}>{app.name}</option>
                    ))}
                </select>

                {/* Group by App Checkbox */}
                <label className="flex items-center w-full space-x-3 bg-white border border-gray-300 px-4 py-2.5 rounded-lg shadow-sm cursor-pointer">
                    <input
                        type="checkbox"
                        className="hidden"
                        checked={groupByApp}
                        onChange={e => setGroupByApp(e.target.checked)}
                    />
                    {groupByApp ? <CheckSquare size={20} className="text-purple-600" /> : <Square size={20} className="text-gray-400" />}
                    <span className="text-sm text-gray-700">Group by App</span>
                </label>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                {metricCards.map(metric => (
                    <MetricCard key={metric.title} title={metric.title} value={metric.value} />
                ))}
            </div>

            {/* Revenue & Conversions Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Revenue & Conversions Trend</h3>
                <ResponsiveContainer width="100%" height={350}>
                    {loading ? <div className="flex items-center justify-center h-full">Loading Chart...</div> :
                        <LineChart data={analyticsData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                            <YAxis yAxisId="left" stroke="#9ca3af" fontSize={12} />
                            <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={12} />
                            <Tooltip />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={2} name="Revenue (₹)" />
                            <Line yAxisId="right" type="monotone" dataKey="conversions" stroke="#60A5FA" strokeWidth={2} name="Conversions" />
                        </LineChart>
                    }
                </ResponsiveContainer>
            </div>

            {/* Detailed Data Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-700">Detailed Analytics Data</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                {["Date", "Revenue", "Conversions", "Clicks", "CR", "ARPU", "App", "Country"].map(header => (
                                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan={8} className="text-center p-4">Loading data...</td></tr>
                            ) : analyticsData.map((row, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">₹{row.revenue.toLocaleString('en-IN')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row.conversions}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row.clicks}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row.cr.toFixed(2)}%</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">₹{row.arpu.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row.appName || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row.country || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;

/*
* =================================================================
* == COMPONENT, STATE, AND INTEGRATION DOCUMENTATION
* =================================================================
*
* === COMPONENT: AnalyticsPage ===
* - Purpose: This component provides a comprehensive view of application analytics.
* It allows users to filter data by a date range and by specific applications,
* visualizing the results in metric cards, a trend chart, and a detailed table.
*
* === STATE VARIABLES ===
*
* - `analyticsData` (Array<AnalyticsData>):
* - Holds the filtered data used to render the chart and the table.
* - For backend integration: This state should be populated by the response from your
* analytics API endpoint. The API should accept `startDate`, `endDate`, and `appId`
* as query parameters.
*
* - `loading` (boolean):
* - Toggled to true during data fetching to show loading indicators.
*
* - `error` (string | null):
* - Stores any error messages from the API call.
*
* - `dateRange` (object):
* - An object from `react-date-range` containing `startDate` and `endDate`.
* - For backend integration: These dates should be formatted (e.g., to 'YYYY-MM-DD')
* and sent as query parameters in your API request.
*
* - `isCalendarOpen` (boolean):
* - Controls the visibility of the date range picker modal.
* * - `isDateRangeLoaded` (boolean):
* - Tracks if the external `react-date-range` library has been loaded dynamically.
*
* - `selectedApp` (string):
* - Stores the ID of the application selected from the dropdown filter.
* - The default value is 'all'.
* - For backend integration: This ID should be sent as an `appId` query parameter.
* If 'all', the parameter can be omitted. The list of apps in the dropdown
* should be fetched from your `/api/apps` endpoint.
*
* - `groupByApp` (boolean):
* - State for the "Group by App" checkbox.
* - For backend integration: This boolean should be sent as a query parameter
* (e.g., `groupBy=app`). The backend should then return data aggregated by app
* instead of by date. The current frontend mock data does not reflect this grouping.
*
* === BACKEND INTEGRATION NOTES ===
*
* 1.  **Main API Endpoint**: Create an endpoint like `/api/analytics`.
*
* 2.  **Query Parameters**: The endpoint should accept the following query parameters:
* - `startDate` (e.g., '2025-07-01')
* - `endDate` (e.g., '2025-07-29')
* - `appId` (optional, e.g., '31892242')
* - `groupBy` (optional, e.g., 'app')
*
* 3.  **Data Fetching**: The `useEffect` hook should be modified to make a real API call
* to this endpoint whenever `dateRange`, `selectedApp`, or `groupByApp` changes.
*
* 4.  **Populate App Filter**: The `appOptions` array should be replaced with data fetched
* from an endpoint that lists the user's applications (e.g., `/api/apps`).
*
* 5.  **Data Structure**: The API response should be an array of objects, where each object
* matches the `AnalyticsData` interface.
*/
