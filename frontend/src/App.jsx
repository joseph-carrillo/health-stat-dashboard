// frontend/src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Overview from "./pages/analytics/Overview";
import Coverage from "./pages/analytics/Coverage";
import Trends from "./pages/analytics/Trends";
import Rankings from "./pages/analytics/Rankings";
import IndicatorReport from "./pages/analytics/IndicatorReport";
import Targets from "./pages/Targets";
import DataAvailability from "./pages/DataAvailability";
import Management from "./pages/Management";

// Protects all pages — if no token, redirect to login
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/" replace />;
  return children;
}

// Admin only — if not admin, redirect to home
function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/" replace />;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.role !== "admin") return <Navigate to="/home" replace />;
  } catch {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />

        {/* Protected — all logged in users */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/analytics/overview" element={<ProtectedRoute><Overview /></ProtectedRoute>} />
        <Route path="/analytics/coverage" element={<ProtectedRoute><Coverage /></ProtectedRoute>} />
        <Route path="/analytics/trends" element={<ProtectedRoute><Trends /></ProtectedRoute>} />
        <Route path="/analytics/rankings" element={<ProtectedRoute><Rankings /></ProtectedRoute>} />
        <Route path="/analytics/indicator-report" element={<ProtectedRoute><IndicatorReport /></ProtectedRoute>} />
        <Route path="/targets" element={<ProtectedRoute><Targets /></ProtectedRoute>} />
        <Route path="/data-availability" element={<ProtectedRoute><DataAvailability /></ProtectedRoute>} />

        {/* Admin only */}
        <Route path="/management" element={<AdminRoute><Management /></AdminRoute>} />

        {/* Catch all — redirect to home */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}