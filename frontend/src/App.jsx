// frontend/src/App.jsx
// This file controls which page shows based on the URL.
// It also protects the Dashboard — only logged-in users can see it.

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

// ProtectedRoute — a simple guard.
// If there's no token in localStorage, redirect to Login.
// If there IS a token, show the page normally.
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route — Login page */}
        <Route path="/" element={<Login />} />

        {/* Protected route — Dashboard requires login */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}