import React, { useState, useEffect, useRef } from "react";
import {
  Link,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BarChart3,
  CreditCard,
  Settings,
  LogOut,
  AppWindow,
  FileBarChart2,
  Layers,
  Menu,
  Banknote,
  Wallet,
  BellIcon,
  Calendar,
  ChevronDown,
  CheckSquare,
  Square,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { addDays, format } from "date-fns";

// Monetization page imports
import Analytics from "./analytics";
import AppStats from "./appStats";
import Dashboard from "./dashboard";
import Payments from "./payments";
import Invoice from "./invoice";

// Acquisition page imports
import AnalyticsA from "../AcquisitionPage/analyticsA";
import AppStatsA from "../AcquisitionPage/appStatsA";
import CampaignA from "../AcquisitionPage/campainA";
import DashboardA from "../AcquisitionPage/dashbaordA";
import FundA from "../AcquisitionPage/fundA";
import NotificationA from "../AcquisitionPage/notificationRequestA";

// Shared pages
import Billing from "../billing";
import Setting from "../settings";

// --- ANALYTICS PAGE COMPONENT AND HELPERS ---
// Note: This code was previously in a separate 'analytics.tsx' file.
// It has been moved here to resolve the module resolution error.

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
  name: string;
}

// Mock data for the list of apps to filter by
const appOptions: AppOption[] = [
  { id: "all", name: "All Applications" },
  { id: "31892242", name: "Instagram" },
  { id: "31892243", name: "WhatsApp" },
  { id: "1", name: "TikTok" },
];

// Mock analytics data
const mockAnalyticsData: AnalyticsData[] = [
  {
    date: "2025-07-01",
    revenue: 220,
    conversions: 20,
    clicks: 1500,
    cr: 1.33,
    arpu: 0.15,
    appName: "Instagram",
    country: "IN",
  },
  {
    date: "2025-07-02",
    revenue: 250,
    conversions: 22,
    clicks: 1600,
    cr: 1.38,
    arpu: 0.16,
    appName: "WhatsApp",
    country: "US",
  },
  {
    date: "2025-07-03",
    revenue: 300,
    conversions: 25,
    clicks: 1800,
    cr: 1.39,
    arpu: 0.17,
    appName: "Instagram",
    country: "IN",
  },
  {
    date: "2025-07-04",
    revenue: 280,
    conversions: 24,
    clicks: 1750,
    cr: 1.37,
    arpu: 0.16,
    appName: "TikTok",
    country: "UK",
  },
  {
    date: "2025-07-05",
    revenue: 350,
    conversions: 30,
    clicks: 2000,
    cr: 1.5,
    arpu: 0.18,
    appName: "WhatsApp",
    country: "US",
  },
  {
    date: "2025-07-06",
    revenue: 400,
    conversions: 35,
    clicks: 2200,
    cr: 1.59,
    arpu: 0.18,
    appName: "Instagram",
    country: "IN",
  },
  {
    date: "2025-07-07",
    revenue: 380,
    conversions: 33,
    clicks: 2100,
    cr: 1.57,
    arpu: 0.18,
    appName: "TikTok",
    country: "UK",
  },
];

// Navbar placeholder for Analytics Page
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

// Metric Card Component for Analytics Page
const MetricCard = ({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) => (
  <div className="bg-white shadow-md p-4 rounded-xl transition-all hover:shadow-lg hover:bg-purple-50">
    <p className="text-sm text-gray-500 mb-1">{title}</p>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
  </div>
);

// Main Analytics Page Component
const AnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: addDays(new Date(), -30),
    endDate: new Date(),
    key: "selection",
  });
  const [isCalendarOpen, setCalendarOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState("all");
  const [groupByApp, setGroupByApp] = useState(false);
  const [isDateRangeLoaded, setIsDateRangeLoaded] = useState(
    !!(window as any).ReactDateRange
  );
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDateRangeLoaded) return;
    const loadAsset = (
      tag: "script" | "link",
      attributes: Record<string, string>
    ) => {
      if (document.querySelector(`${tag}[data-id="${attributes["data-id"]}"]`))
        return;
      const element = document.createElement(tag);
      Object.keys(attributes).forEach((key) =>
        element.setAttribute(key, attributes[key])
      );
      document.head.appendChild(element);
      return element;
    };
    loadAsset("link", {
      "data-id": "rd-styles",
      rel: "stylesheet",
      href: "https://cdn.jsdelivr.net/npm/react-date-range@1.4.0/dist/styles.css",
    });
    loadAsset("link", {
      "data-id": "rd-theme",
      rel: "stylesheet",
      href: "https://cdn.jsdelivr.net/npm/react-date-range@1.4.0/dist/theme/default.css",
    });
    const script = loadAsset("script", {
      "data-id": "rd-script",
      src: "https://cdn.jsdelivr.net/npm/react-date-range@1.4.0/dist/main.js",
    });
    if (script) {
      script.onload = () => {
        if ((window as any).ReactDateRange) setIsDateRangeLoaded(true);
      };
    } else {
      if ((window as any).ReactDateRange) setIsDateRangeLoaded(true);
    }
  }, [isDateRangeLoaded]);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      let data = mockAnalyticsData;
      if (selectedApp !== "all") {
        const appName = appOptions.find((app) => app.id === selectedApp)?.name;
        data = data.filter((row) => row.appName === appName);
      }
      setAnalyticsData(data);
      setLoading(false);
    }, 500);
  }, [dateRange, selectedApp, groupByApp]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [calendarRef]);

  const totalRevenue = analyticsData.reduce((sum, row) => sum + row.revenue, 0);
  const totalClicks = analyticsData.reduce((sum, row) => sum + row.clicks, 0);
  const totalConversions = analyticsData.reduce(
    (sum, row) => sum + row.conversions,
    0
  );
  const conversionRate =
    totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
  const averageARPU =
    analyticsData.length > 0
      ? analyticsData.reduce((sum, row) => sum + row.arpu, 0) /
        analyticsData.length
      : 0;

  const metricCards = [
    { title: "Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}` },
    { title: "Conversion", value: `${conversionRate.toFixed(2)}%` },
    { title: "Clicks", value: totalClicks.toLocaleString("en-IN") },
    { title: "Conversions", value: totalConversions.toLocaleString("en-IN") },
    { title: "ARPU", value: `₹${averageARPU.toFixed(2)}` },
  ];

  const DateRangePicker = isDateRangeLoaded
    ? (window as any).ReactDateRange.DateRange
    : null;

  return (
    // The outer div no longer needs padding or background color, as the <main> tag handles it.
    <div>
      <LoggedInNavbar title="Analytics" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="relative" ref={calendarRef}>
          <button
            onClick={() => setCalendarOpen(!isCalendarOpen)}
            className="flex items-center justify-between w-full space-x-2 bg-white border border-gray-300 px-4 py-2.5 rounded-lg shadow-sm hover:bg-gray-50"
          >
            <Calendar size={18} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {`${format(dateRange.startDate, "MMM dd, yyyy")} - ${format(
                dateRange.endDate,
                "MMM dd, yyyy"
              )}`}
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
                    <button
                      onClick={() => setCalendarOpen(false)}
                      className="px-4 py-1.5 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      Apply
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-4">Loading Calendar...</div>
              )}
            </div>
          )}
        </div>
        <select
          value={selectedApp}
          onChange={(e) => setSelectedApp(e.target.value)}
          className="w-full bg-white border border-gray-300 px-4 py-2.5 rounded-lg shadow-sm text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          {appOptions.map((app) => (
            <option key={app.id} value={app.id}>
              {app.name}
            </option>
          ))}
        </select>
        <label className="flex items-center w-full space-x-3 bg-white border border-gray-300 px-4 py-2.5 rounded-lg shadow-sm cursor-pointer">
          <input
            type="checkbox"
            className="hidden"
            checked={groupByApp}
            onChange={(e) => setGroupByApp(e.target.checked)}
          />
          {groupByApp ? (
            <CheckSquare size={20} className="text-purple-600" />
          ) : (
            <Square size={20} className="text-gray-400" />
          )}
          <span className="text-sm text-gray-700">Group by App</span>
        </label>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {metricCards.map((metric) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
          />
        ))}
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Revenue & Conversions Trend
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              Loading Chart...
            </div>
          ) : (
            <LineChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
              <YAxis yAxisId="left" stroke="#9ca3af" fontSize={12} />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#9ca3af"
                fontSize={12}
              />
              <Tooltip />
              <Legend />
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
                stroke="#60A5FA"
                strokeWidth={2}
                name="Conversions"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-700">
            Detailed Analytics Data
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Date",
                  "Revenue",
                  "Conversions",
                  "Clicks",
                  "CR",
                  "ARPU",
                  "App",
                  "Country",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center p-4">
                    Loading data...
                  </td>
                </tr>
              ) : (
                analyticsData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      ₹{row.revenue.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {row.conversions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {row.clicks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {row.cr.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      ₹{row.arpu.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {row.appName || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {row.country || "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- LOGO CONSTANTS ---
const LogoFull = "../public/logo.png"; // Full logo path
const LogoCollapsed = "../public/collapsed.png"; // Collapsed logo path

// --- NAVITEM (REUSABLE COMPONENT) ---
const NavItem = ({
  to,
  label,
  icon,
  collapsed,
}: {
  to: string;
  label: string;
  icon: JSX.Element;
  collapsed: boolean;
}) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-2 rounded-md text-base font-medium transition-all relative
        ${
          isActive(to)
            ? "bg-purple-200 text-purple-900 font-semibold shadow-sm border-l-4 border-purple-600"
            : "text-gray-800 hover:bg-purple-50 hover:text-purple-700"
        }
      `}
      title={collapsed ? label : ""}
    >
      <span className="mr-3">{icon}</span>
      {!collapsed && label}
    </Link>
  );
};

// --- SIDEBAR COMPONENT ---
const Sidebar = ({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"monetisation" | "acquisition">(
    location.pathname.includes("acquisition") ? "acquisition" : "monetisation"
  );

  useEffect(() => {
    if (location.pathname.includes("acquisition")) {
      setActiveTab("acquisition");
    } else {
      setActiveTab("monetisation");
    }
  }, [location.pathname]);

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-white text-gray-800 transition-all duration-300 flex flex-col z-30 ${
        collapsed ? "w-20 p-3" : "w-64 p-4"
      }`}
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div
        className={`${
          collapsed
            ? "flex flex-col items-center mb-4 mt-2"
            : "flex items-center justify-between mb-8 ml-2"
        } pt-0`}
      >
        <img
          src={collapsed ? LogoCollapsed : LogoFull}
          alt="EngageX"
          className={`${collapsed ? "h-8 mb-1" : "h-10"} w-auto object-contain`}
        />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`text-purple-600 hover:bg-purple-100 p-2 rounded-md ${
            collapsed ? "mt-1" : ""
          }`}
          title={collapsed ? "Expand" : "Collapse"}
        >
          <Menu size={22} />
        </button>
      </div>

      {!collapsed && (
        <div className="relative bg-gray-100 rounded-full w-full h-12 flex items-center p-1 mb-6">
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute top-1 left-0 h-10 w-1/2 bg-white rounded-full shadow-md z-0"
            style={{
              left: activeTab === "monetisation" ? "0%" : "50%",
            }}
          />
          <button
            onClick={() => navigate("/monetization/dashboard")}
            className={`z-10 w-1/2 h-full text-sm font-medium transition-colors duration-300 rounded-full ${
              activeTab === "monetisation" ? "text-black" : "text-gray-500"
            }`}
          >
            Monetization
          </button>
          <button
            onClick={() => navigate("/acquisition/dashboard")}
            className={`z-10 w-1/2 h-full text-sm font-medium transition-colors duration-300 rounded-full ${
              activeTab === "acquisition" ? "text-black" : "text-gray-500"
            }`}
          >
            Acquisition
          </button>
        </div>
      )}

      <nav className="flex-grow">
        <div className="space-y-2">
          {activeTab === "monetisation" && (
            <>
              <NavItem
                to="/monetization/dashboard"
                label="Dashboard"
                icon={<LayoutDashboard size={22} />}
                collapsed={collapsed}
              />
              <NavItem
                to="/monetization/manage-apps"
                label="Apps"
                icon={<AppWindow size={22} />}
                collapsed={collapsed}
              />
              <NavItem
                to="/monetization/analytics"
                label="Analytics"
                icon={<FileBarChart2 size={22} />}
                collapsed={collapsed}
              />
              <NavItem
                to="/monetization/invoice"
                label="Invoice"
                icon={<CreditCard size={22} />}
                collapsed={collapsed}
              />
              <NavItem
                to="/monetization/payments"
                label="Payments"
                icon={<Banknote size={22} />}
                collapsed={collapsed}
              />
            </>
          )}

          {activeTab === "acquisition" && (
            <>
              <NavItem
                to="/acquisition/dashboard"
                label="Dashboard"
                icon={<LayoutDashboard size={22} />}
                collapsed={collapsed}
              />
              <NavItem
                to="/acquisition/apps"
                label="Apps"
                icon={<AppWindow size={22} />}
                collapsed={collapsed}
              />
              <NavItem
                to="/acquisition/campaigns"
                label="Campaigns"
                icon={<Layers size={22} />}
                collapsed={collapsed}
              />
              <NavItem
                to="/acquisition/analytics"
                label="Analytics"
                icon={<BarChart3 size={22} />}
                collapsed={collapsed}
              />
              <NavItem
                to="/acquisition/funds-invoices"
                label="Funds & Invoices"
                icon={<CreditCard size={22} />}
                collapsed={collapsed}
              />
              <NavItem
                to="/acquisition/notifications"
                label="Notification Request"
                icon={<BellIcon size={22} />}
                collapsed={collapsed}
              />
            </>
          )}
        </div>
      </nav>

      <div className="mt-auto">
        <div className="pt-4 border-t border-gray-200 space-y-2">
          <NavItem
            to="/billing"
            label="Billing"
            icon={<Wallet size={22} />}
            collapsed={collapsed}
          />
          <NavItem
            to="/settings"
            label="Settings"
            icon={<Settings size={22} />}
            collapsed={collapsed}
          />
          <NavItem
            to="/login"
            label="Sign Out"
            icon={<LogOut size={22} />}
            collapsed={collapsed}
          />
        </div>
      </div>
    </aside>
  );
};

// --- PAGE CONTENT (PLACEHOLDER) ---
const PageContent = ({ title }: { title: string }) => (
  <div>
    <h1 className="text-3xl font-bold">{title}</h1>
    <div className="mt-4 p-8 bg-white rounded-lg shadow">
      <p>Content for {title} goes here.</p>
    </div>
  </div>
);

// --- MAIN APP COMPONENT ---
const Sidebars = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main
        className={`transition-all duration-300 ease-in-out p-8 ${
          collapsed ? "ml-20" : "ml-64"
        }`}
      >
        <Routes>
          {/* Monetization Routes */}
          <Route path="/monetization/dashboard" element={<Dashboard />} />
          <Route path="/monetization/manage-apps" element={<AppStats />} />
          <Route path="/monetization/analytics" element={<Analytics />} />
          <Route path="/monetization/invoice" element={<Invoice />} />
          <Route path="/monetization/payments" element={<Payments />} />

          {/* Acquisition Routes */}
          <Route path="/acquisition/dashboard" element={<DashboardA />} />
          <Route path="/acquisition/apps" element={<AppStatsA />} />
          <Route path="/acquisition/campaigns" element={<CampaignA />} />
          <Route path="/acquisition/analytics" element={<AnalyticsA />} />
          <Route path="/acquisition/funds-invoices" element={<FundA />} />
          <Route
            path="/acquisition/notifications"
            element={<NotificationA />}
          />

          {/* Shared Routes */}
          <Route path="/billing" element={<Billing />} />
          <Route path="/settings" element={<Setting />} />
          <Route path="/login" element={<PageContent title="Sign Out" />} />

          {/* Default Route: redirect to Monetization Dashboard */}
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  );
};

export default Sidebars;
