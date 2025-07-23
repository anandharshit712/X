import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

const LoginPage = () => {
  const [email, setEmail] = useState<string>("john@mobtions.com");
  const [password, setPassword] = useState<string>("password");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Logout if token is expired or last login was over 10 days ago
  useEffect(() => {
    const tokenExpiry = parseInt(localStorage.getItem("tokenExpiry") || "0");
    const lastLogin = parseInt(localStorage.getItem("lastLogin") || "0");
    const now = Date.now();

    if (tokenExpiry && now > tokenExpiry) {
      clearSession("Session expired. Please log in again.");
    } else if (lastLogin && now - lastLogin > 10 * 24 * 60 * 60 * 1000) {
      clearSession("Logged out due to inactivity.");
    }
  }, []);

  const clearSession = (msg: string) => {
    localStorage.clear();
    setError(msg);
    navigate("/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill out both fields.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Save user session
      localStorage.setItem("loginMethod", "email");
      localStorage.setItem("lastLogin", Date.now().toString());
      localStorage.setItem("tokenExpiry", (Date.now() + 3600000).toString()); // 1 hour

      localStorage.setItem("userId", data.user.id.toString());
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userRole", data.user.account_type);
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("userName", data.user.name);

      navigate(data.user.account_type === "employee" ? "/home" : "/monetization/dashboard");
    } catch (err) {
      setError((err as Error).message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse: any) => {
    const token = credentialResponse.credential;

    try {
const decoded = jwtDecode(token); // instead of jwt_decode(token)

      const res = await fetch("http://localhost:3001/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Google login failed");
      }

      // Save user session
      localStorage.setItem("loginMethod", "google");
      localStorage.setItem("lastLogin", Date.now().toString());
      if (decoded && typeof (decoded as any).exp === "number") {
        localStorage.setItem("tokenExpiry", ((decoded as any).exp * 1000).toString()); // from Google
      } else {
        throw new Error("Invalid Google token: missing expiry");
      }

      localStorage.setItem("userId", data.user.id.toString());
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userRole", data.user.account_type);
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userImage", data.user.profile_image || "");

      navigate(data.user.account_type === "employee" ? "/home" : "/monetization/dashboard");
    } catch (err) {
      setError((err as Error).message || "Google login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-200 via-violet-100 to-white">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Welcome to EngageX</h1>
          <p className="text-gray-600">Login to access your account</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 caret-black text-gray-700"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 caret-black text-gray-700"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-purple-500 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
              isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-purple-600"
            }`}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-gray-300"></div>
          <span className="px-3 text-sm text-gray-500">OR</span>
          <div className="flex-grow h-px bg-gray-300"></div>
        </div>

        {/* Google Sign-in */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => setError("Google login failed")}
          />
        </div>

        <div className="text-center mt-6 text-sm text-gray-600">
          Don’t have an account?{" "}
          <button
            onClick={() => navigate("/get-started")}
            className="text-purple-600 hover:underline"
          >
            Sign up
          </button> 
        </div>

        <div className="text-center text-xs text-gray-400 mt-6">
          © 2025 EngageX. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;



login page.tsx