import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// --- Dashboard Components Start ---

// Placeholder for the Navbar that appears above the dashboard content
const LoggedInNavbar = ({ title, type }: { title: string; type: string }) => (
  <div className="flex justify-between items-center mb-6">
    <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
    <div className="flex items-center space-x-4">
      <span className="text-sm font-semibold text-gray-500 capitalize">
        {type} View
      </span>
      <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
        JA
      </div>
    </div>
  </div>
);

// Card Component for Dashboard metrics
const Card = ({
  title,
  value,
  growth,
  secondaryValue,
}: {
  title: string;
  value: string;
  growth?: string;
  secondaryValue?: string;
}) => (
  <div className="bg-white p-6 rounded-xl shadow-md transition hover:shadow-lg">
    <h3 className="text-base font-medium text-gray-500 mb-2">{title}</h3>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    {secondaryValue && (
      <p className="text-sm text-gray-500">{secondaryValue}</p>
    )}
    {growth && (
      <p
        className={`text-sm mt-1 ${
          growth.startsWith("-") || growth.toLowerCase() === "n/a"
            ? "text-gray-400"
            : "text-green-500"
        }`}
      >
        {growth}
      </p>
    )}
  </div>
);

// Interface for the dashboard data structure
interface DashboardData {
  overview: {
    revenue: {
      total: number;
      averagePerOffer: number;
      activeOffers: number;
      totalUsers: number;
    };
    conversions: {
      total: number;
      uniqueUsers: number;
      averagePayout: number;
      totalPayout: number;
    };
    engagement: {
      totalClicks: number;
      uniqueClickers: number;
      offersClicked: number;
      conversionRate: number;
    };
  };
  trends: {
    daily: Array<{
      date: string;
      revenue: number;
      conversions: number;
      clicks: number;
      conversion_rate: string;
    }>;
  };
  topApps: Array<{
    app_name: string;
    app_id: string;
    conversion_count: number;
    unique_users: number;
    total_revenue: number;
    avg_revenue_per_conversion: number;
    click_count: number;
    conversion_rate: string;
  }>;
  payments: Array<{
    status: string;
    count: number;
    total_amount: number;
    earliest_payment: string;
    latest_payment: string;
  }>;
  recentActivity: Array<{
    activity_type: string;
    timestamp: string;
    user_id: string;
    dashboard_type: string;
  }>;
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await fetch(
  //         // "http://localhost:3000/api/dashboard/overview"
  //       );
  //       if (!response.ok) {
  //         throw new Error("Failed to fetch dashboard data");
  //       }
  //       const dashboardData = await response.json();
  //       setData(dashboardData);
  //       setError(null);
  //     } catch (err) {
  //       setError(err instanceof Error ? err.message : "An error occurred");
  //       console.error("Dashboard fetch error:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, []); // Empty dependency array means this effect runs once when component mounts

  if (loading) {
    return (
      <div className="flex-1 p-8 bg-gray-50 min-h-screen">
        <LoggedInNavbar title="Dashboard" type="monetization" />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8 bg-gray-50 min-h-screen">
        <LoggedInNavbar title="Dashboard" type="monetization" />
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4"
          role="alert"
        >
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-gray-50 min-h-screen">
      <LoggedInNavbar title="Dashboard" type="monetization" />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card
          title="Total Revenue"
          value={`₹${data?.overview.revenue.total.toLocaleString() || "0"}`}
          secondaryValue={`${
            data?.overview.revenue.activeOffers || 0
          } Active Offers`}
        />
        <Card
          title="Conversions"
          value={data?.overview.conversions.total.toLocaleString() || "0"}
          secondaryValue={`${
            data?.overview.engagement.conversionRate || 0
          }% Rate`}
        />
        <Card
          title="Total Clicks"
          value={data?.overview.engagement.totalClicks.toLocaleString() || "0"}
          secondaryValue={`${
            data?.overview.engagement.uniqueClickers || 0
          } Unique Users`}
        />
        <Card
          title="Average Metrics"
          value={`₹${
            data?.overview.conversions.averagePayout.toFixed(2) || "0"
          }`}
          secondaryValue={`₹${
            data?.overview.revenue.averagePerOffer.toFixed(2) || "0"
          } per Offer`}
        />
      </div>

      {/* Revenue & Conversion Trends Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
        <h3 className="text-xl font-semibold text-black mb-6">
          Revenue & Conversion Trends
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data?.trends.daily || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="#8B5CF6"
              strokeWidth={2}
              name="Revenue (₹)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="conversions"
              stroke="#3B82F6"
              strokeWidth={2}
              name="Conversions"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Apps Table */}
      {data?.topApps && data.topApps.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold text-black mb-6">
            Top Performing Apps
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left text-sm font-medium text-gray-500 py-3 px-4">
                    App
                  </th>
                  <th className="text-right text-sm font-medium text-gray-500 py-3 px-4">
                    Revenue
                  </th>
                  <th className="text-right text-sm font-medium text-gray-500 py-3 px-4">
                    Conversions
                  </th>
                  <th className="text-right text-sm font-medium text-gray-500 py-3 px-4">
                    Conv. Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.topApps.map((app) => (
                  <tr key={app.app_id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-800">{app.app_name}</td>
                    <td className="text-right py-3 px-4 font-medium text-gray-900">
                      ₹{app.total_revenue.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 font-medium text-gray-900">
                      {app.conversion_count.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 font-medium text-gray-900">
                      {app.conversion_rate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Status */}
      {data?.payments && data.payments.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm mt-8">
          <h3 className="text-xl font-semibold text-black mb-6">
            Payment Status Overview
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left text-sm font-medium text-gray-500 py-3 px-4">
                    Status
                  </th>
                  <th className="text-right text-sm font-medium text-gray-500 py-3 px-4">
                    Count
                  </th>
                  <th className="text-right text-sm font-medium text-gray-500 py-3 px-4">
                    Total Amount
                  </th>
                  <th className="text-right text-sm font-medium text-gray-500 py-3 px-4">
                    Latest Update
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.payments.map((payment) => (
                  <tr
                    key={payment.status}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${
                          payment.status.toLowerCase() === "completed"
                            ? "bg-green-100 text-green-800"
                            : payment.status.toLowerCase() === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="text-right py-3 px-4 font-medium text-gray-900">
                      {payment.count}
                    </td>
                    <td className="text-right py-3 px-4 font-medium text-gray-900">
                      ₹{payment.total_amount.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-500">
                      {new Date(payment.latest_payment).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

/*
 * =================================================================
 * == COMPONENT AND VARIABLE DOCUMENTATION
 * =================================================================
 *
 * === COMPONENTS ===
 *
 * 1. Dashboard (Default Export)
 * - Purpose: The main component to display key metrics, charts, and tables for the dashboard page.
 * - State Variables:
 * - `data` (DashboardData | null): Holds the fetched data for the dashboard (metrics, history, top apps). Initialized with mock data.
 * - `loading` (boolean): Is true while the initial mock data is being "fetched" (simulated with a timeout), used to show a loading spinner.
 * - `error` (string | null): Stores an error message if the data fetch were to fail.
 *
 * 2. Card
 * - Purpose: A reusable UI component to display a single metric on the dashboard (e.g., Revenue, Active Users).
 * - Props: `title`, `value`, `growth`, `secondaryValue`.
 *
 * 3. LoggedInNavbar
 * - Purpose: A placeholder component for the header that appears above the main content area of the dashboard.
 *
 * === INTERFACES AND TYPES ===
 *
 * 1. DashboardData
 * - Purpose: Defines the shape of the data object used by the `Dashboard` component. It includes:
 * - `metrics`: An object for key numbers like revenue and users.
 * - `history`: An array of objects for the line chart data.
 * - `topApps`: An array of objects for the top-performing apps table.
 */
