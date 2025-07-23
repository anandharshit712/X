import "./App.css";
import LandingPage from "./components/landingpage.tsx";
import Signup from "./components/signup.tsx";
import Login from "./components/login.tsx";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;
