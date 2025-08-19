import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getOverview } from "../../services/dashboard";
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

// Simple metric card
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

type OverviewData = Record<string, any>;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OverviewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Route guard — if no token, send user to login instead of 401-ing
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getOverview(); // GET /api/dashboard/overview via axios instance
        if (!isMounted) return;
        setData(result);
      } catch (e: any) {
        if (!isMounted) return;
        const status = e?.response?.status;
        // If token invalid/expired, bounce to login
        if (status === 401) {
          setError("Your session has expired. Please log in again.");
        } else {
          setError(
            e?.response?.data?.message ||
              e?.message ||
              "Failed to fetch dashboard overview"
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

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
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
          role="alert"
        >
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
        <button
          onClick={() => navigate("/login")}
          className="px-4 py-2 bg-purple-600 text-white rounded-md"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // Safe helpers to avoid `.toLocaleString()` on undefined
  const overview = data?.overview ?? {};
  const revenue = overview?.revenue ?? {};
  const conversions = overview?.conversions ?? {};
  const engagement = overview?.engagement ?? {};
  const trendsDaily = data?.trends?.daily ?? [];
  const topApps = data?.topApps ?? [];
  const payments = data?.payments ?? [];

  return (
    <div className="flex-1 p-8 bg-gray-50 min-h-screen">
      <LoggedInNavbar title="Dashboard" type="monetization" />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card
          title="Total Revenue"
          value={`₹${Number(revenue?.total ?? 0).toLocaleString()}`}
          secondaryValue={`${Number(revenue?.activeOffers ?? 0)} Active Offers`}
        />
        <Card
          title="Conversions"
          value={Number(conversions?.total ?? 0).toLocaleString()}
          secondaryValue={`${Number(engagement?.conversionRate ?? 0)}% Rate`}
        />
        <Card
          title="Total Clicks"
          value={Number(engagement?.totalClicks ?? 0).toLocaleString()}
          secondaryValue={`${Number(
            engagement?.uniqueClickers ?? 0
          )} Unique Users`}
        />
        <Card
          title="Average Metrics"
          value={`₹${Number(conversions?.averagePayout ?? 0).toFixed(2)}`}
          secondaryValue={`₹${Number(revenue?.averagePerOffer ?? 0).toFixed(
            2
          )} per Offer`}
        />
      </div>

      {/* Revenue & Conversion Trends Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
        <h3 className="text-xl font-semibold text-black mb-6">
          Revenue & Conversion Trends
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendsDaily}>
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
      {topApps.length > 0 && (
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
                {topApps.map((app: any) => (
                  <tr key={app.app_id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-800">{app.app_name}</td>
                    <td className="text-right py-3 px-4 font-medium text-gray-900">
                      ₹{Number(app.total_revenue ?? 0).toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 font-medium text-gray-900">
                      {Number(app.conversion_count ?? 0).toLocaleString()}
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
      {payments.length > 0 && (
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
                {payments.map((payment: any) => (
                  <tr
                    key={payment.status}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                          ${
                            String(payment.status).toLowerCase() === "completed"
                              ? "bg-green-100 text-green-800"
                              : String(payment.status).toLowerCase() ===
                                "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="text-right py-3 px-4 font-medium text-gray-900">
                      {Number(payment.count ?? 0)}
                    </td>
                    <td className="text-right py-3 px-4 font-medium text-gray-900">
                      ₹{Number(payment.total_amount ?? 0).toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-500">
                      {payment.latest_payment
                        ? new Date(payment.latest_payment).toLocaleDateString()
                        : "-"}
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
