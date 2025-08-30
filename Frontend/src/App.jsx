import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/landingpage";
import LoginPage from "./components/login";
import SignupPage from "./components/signup";
// import Sidebars from "./components/monetizationPage/sidebar";
import Sidebars from "./components/monetizationPage/sidebar"; // keep your existing user shell
import AdminShell from "./admin/AdminShell"; // ← NEW

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/*" element={<Sidebars />} />
        {/* Admin area from ADMINX */}
        <Route path="/admin/*" element={<AdminShell />} />
        {/* Everything else → your user (monetization) shell */}
        <Route path="/*" element={<Sidebars />} />
      </Routes>
    </Router>
  );
}

export default App;
