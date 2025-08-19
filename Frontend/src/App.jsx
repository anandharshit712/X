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
        <Route path="/*" element={<Sidebars />} />
      </Routes>
    </Router>
  );
}

export default App;
