import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/landingpage";
import LoginPage from "./components/login";
import SignupPage from "./components/signup";
import Sidebars from "./components/monetizationPage/sidebar";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/*" element={<Sidebars />}>
          <Route path="monetization/*" element={<Sidebars />} />
          <Route path="acquisition/*" element={<Sidebars />} />
          <Route path="billing" element={<Sidebars />} />
          <Route path="settings" element={<Sidebars />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
