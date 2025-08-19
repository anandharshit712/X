import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronDown, DollarSign, BarChart, MousePointerClick, Users, TrendingUp, CheckSquare, Square } from 'lucide-react';
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
import { getAnalytics } from '../../services/analytics';
import { getApps } from '../../services/apps';

// --- HELPER COMPONENTS ---

const LoggedInNavbar = ({ title }: { title: string }) => (
  <div className="flex justify-between items-center mb-8">
    <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
    <div className="flex items-center space-x-4">
      <div className="w-10 h-10 bg-indigo-200 text-indigo-700 flex items-center justify-center rounded-full font-bold text-lg">
        JA
      </div>
    </div>
  </div>
);

// Defines the structure for a single row of analytics data
interface AnalyticsData {
  date: string;
  revenue: number;
  conversions: number;
  clicks: number;
  cr: number;
  arpu: number;
  app?: string;
  country?: string;
}

// Defines the structure for an app option in the dropdown
interface AppOption {
  id: string;
  name: string;
}

// --- Main Acquisition Analytics Component ---

const AcquisitionAnalyticsPage = () => {
  // --- State Management ---
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [appOptions, setAppOptions] = useState<AppOption[]>([]);
  const [kpis, setKpis] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
    key: "selection",
  });
  const [selectedApp, setSelectedApp] = useState("all");
  const [groupByApp, setGroupByApp] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Fetch app options for filter dropdown
  useEffect(() => {
    const fetchApps = async () => {
      try {
        const response = await getApps();
        const apps = response.data.map((app: any) => ({ id: app.app_id, name: app.app_package }));
        setAppOptions([{ id: "all", name: "All Applications" }, ...apps]);
      } catch (err) {
        console.error("Failed to fetch apps", err);
      }
    };
    fetchApps();
  }, []);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const from = format(dateRange.startDate, "yyyy-MM-dd");
        const to = format(dateRange.endDate, "yyyy-MM-dd");
        const app_id = selectedApp === "all" ? undefined : selectedApp;

        // Fetch all metrics in parallel
        const [revenueRes, conversionsRes, clicksRes] = await Promise.all([
          getAnalytics({ from, to, app_id, metric: "revenue" }),
          getAnalytics({ from, to, app_id, metric: "conversions" }),
          getAnalytics({ from, to, app_id, metric: "clicks" }),
        ]);

        // Combine timeseries data
        const combinedData: Record<string, any> = {};
        revenueRes.data.timeseries.forEach((item: any) => {
          if (!combinedData[item.day]) combinedData[item.day] = { date: item.day };
          combinedData[item.day].revenue = item.value;
        });
        conversionsRes.data.timeseries.forEach((item: any) => {
          if (!combinedData[item.day]) combinedData[item.day] = { date: item.day };
          combinedData[item.day].conversions = item.value;
        });
        clicksRes.data.timeseries.forEach((item: any) => {
          if (!combinedData[item.day]) combinedData[item.day] = { date: item.day };
          combinedData[item.day].clicks = item.value;
        });

        const finalData = Object.values(combinedData).map((d: any) => ({
          ...d,
          cr: d.clicks > 0 ? (d.conversions / d.clicks) * 100 : 0,
          arpu: d.conversions > 0 ? d.revenue / d.conversions : 0,
        }));

        setAnalyticsData(finalData);
        setKpis({
            revenue: revenueRes.data.kpis,
            conversions: conversionsRes.data.kpis,
            clicks: clicksRes.data.kpis,
        });

      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch analytics data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateRange, selectedApp]);

  // --- Event Handlers ---
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: new Date(value) }));
  };

  // --- UI Configuration ---
  const totalRevenue = kpis.revenue?.total || 0;
  const totalClicks = kpis.clicks?.total || 0;
  const totalConversions = kpis.conversions?.total || 0;
  const conversionRate =
    totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
  const averageARPU =
    totalConversions > 0 ? totalRevenue / totalConversions : 0;

  const metricCards = [
    { title: 'Revenue', value: `$${totalRevenue.toLocaleString()}`, Icon: DollarSign },
    { title: 'Conversion', value: `${conversionRate.toFixed(2)}%`, Icon: BarChart },
    { title: 'Clicks', value: totalClicks.toLocaleString(), Icon: MousePointerClick },
    { title: 'Conversions', value: totalConversions.toLocaleString(), Icon: Users },
    { title: 'ARPU', value: `$${averageARPU.toFixed(2)}`, Icon: TrendingUp },
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
            <select 
              className="w-full text-sm bg-white px-3 py-2.5 rounded-lg outline-none cursor-pointer"
              value={selectedApp}
              onChange={(e) => setSelectedApp(e.target.value)}
            >
              {appOptions.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2 border border-gray-300 px-3 py-2 rounded-lg">
             <input 
               type="checkbox" 
               id="group-by" 
               className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
               checked={groupByApp}
               onChange={(e) => setGroupByApp(e.target.checked)}
             />
             <label htmlFor="group-by" className="text-sm text-gray-700">Group by App</label>
          </div>
        </div>

        {/* Key Metrics Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {metricCards.map(({ title, value, Icon }) => (
            <div key={title} className="bg-white p-5 rounded-lg shadow-sm border">
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <Icon className="text-indigo-500" size={20} />
              <p className="text-2xl font-bold text-gray-800 mt-2">{loading ? '...' : value}</p>
            </div>
          ))}
        </div>

        {/* Main Chart Section */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-700 mb-6">Revenue & Conversions Trend</h3>
            <div style={{ height: '350px' }}>
              {loading ? (
                  <div className="flex justify-center items-center h-full"><p className="text-gray-500">Loading data...</p></div>
              ) : error ? (
                  <div className="flex justify-center items-center h-full"><p className="text-red-500">{error}</p></div>
              ) : analyticsData.length === 0 ? (
                  <div className="flex justify-center items-center h-full"><p className="text-gray-500">No data available for the selected range.</p></div>
              ) : (
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analyticsData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
                          <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#6b7280" />
                          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#6b7280" />
                          <Tooltip contentStyle={{ borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                          <Legend />
                          <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                          <Line yAxisId="right" type="monotone" dataKey="conversions" stroke="#a78bfa" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
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
                        ) : analyticsData.length === 0 ? (
                            <tr><td colSpan="8" className="text-center p-6">No data to display.</td></tr>
                        ) : (
                            analyticsData.map((row, index) => (
                                <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{format(new Date(row.date), 'MMM d, yyyy')}</td>
                                    <td className="px-6 py-4">${row.revenue.toLocaleString()}</td>
                                    <td className="px-6 py-4">{row.conversions.toLocaleString()}</td>
                                    <td className="px-6 py-4">{row.clicks.toLocaleString()}</td>
                                    <td className="px-6 py-4">{row.cr}%</td>
                                    <td className="px-6 py-4">${row.arpu}</td>
                                    <td className="px-6 py-4">{row.app || 'N/A'}</td>
                                    <td className="px-6 py-4">{row.country || 'N/A'}</td>
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

export default AcquisitionAnalyticsPage;