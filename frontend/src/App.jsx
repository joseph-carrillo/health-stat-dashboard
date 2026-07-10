// frontend/src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/public/Landing";
import HealthStatistics from "./pages/public/HealthStatistics";
import EpidemiologySurveillance from "./pages/public/EpidemiologySurveillance";
import Research from "./pages/public/Research";
import Laboratory from "./pages/public/Laboratory";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Overview from "./pages/analytics/Overview";
import Coverage from "./pages/analytics/Coverage";
import Trends from "./pages/analytics/Trends";
import Rankings from "./pages/analytics/Rankings";
import IndicatorReports from "./pages/analytics/IndicatorReports";
import Targets from "./pages/Targets";
import DataAvailability from "./pages/DataAvailability";
import Management from "./pages/Management";
import Upload from "./pages/Upload";
import EsrForm from "./pages/esr/EsrForm";
import { getToken, can } from "./services/auth";

// Protects all pages — if no token, redirect to login
function ProtectedRoute({ children }) {
  if (!getToken()) return <Navigate to="/login" replace />;
  return children;
}

// Permission-gated — needs a token AND a specific permission
function PermissionRoute({ permission, children }) {
  if (!getToken()) return <Navigate to="/login" replace />;
  if (!can(permission)) return <Navigate to="/home" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public PHRIC site */}
        <Route path="/" element={<Landing />} />
        <Route path="/health-statistics" element={<HealthStatistics />} />
        <Route path="/epidemiology-surveillance" element={<EpidemiologySurveillance />} />
        <Route path="/research" element={<Research />} />
        <Route path="/laboratory" element={<Laboratory />} />
        <Route path="/login" element={<Login />} />

        {/* Protected — all logged in users */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/analytics/overview" element={<ProtectedRoute><Overview /></ProtectedRoute>} />
        <Route path="/analytics/coverage" element={<ProtectedRoute><Coverage /></ProtectedRoute>} />
        <Route path="/analytics/trends" element={<ProtectedRoute><Trends /></ProtectedRoute>} />
        <Route path="/analytics/rankings" element={<ProtectedRoute><Rankings /></ProtectedRoute>} />
        <Route path="/analytics/reports" element={<ProtectedRoute><IndicatorReports /></ProtectedRoute>} />
        <Route path="/targets" element={<ProtectedRoute><Targets /></ProtectedRoute>} />
        <Route path="/data-availability" element={<ProtectedRoute><DataAvailability /></ProtectedRoute>} />

        {/* Uploaders only */}
        <Route path="/upload" element={<PermissionRoute permission="can_upload"><Upload /></PermissionRoute>} />

        {/* ESR Verification Form submitters only */}
        <Route path="/esr/new" element={<PermissionRoute permission="can_submit_esr"><EsrForm /></PermissionRoute>} />

        {/* Admin only */}
        <Route path="/management" element={<PermissionRoute permission="can_manage_users"><Management /></PermissionRoute>} />

        {/* Catch all — redirect to the public landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
