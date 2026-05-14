// src/App.js
import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AdminLogin from "./pages/AdminLogin";
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
import UploadExcel from "./pages/UploadExcel";

/* ============ AUTH ============ */
const isAuth = () => Boolean(localStorage.getItem("token"));
const ProtectedRoute = ({ children }) =>
  isAuth() ? children : <Navigate to="/login" replace />;

/* ============ APP ============ */
export default function App() {
  return (
    <Router>
      <Suspense fallback={<div style={{ textAlign: "center" }}>Loading...</div>}>
        <Routes>
          <Route path="/login" element={<AdminLogin />} />
          <Route
            path="/panel"
            element={<ProtectedRoute><AdminPanel /></ProtectedRoute>}
          />
          <Route
            path="/upload"
            element={<ProtectedRoute><UploadExcel /></ProtectedRoute>}
          />
          <Route path="/" element={<Navigate to="/panel" replace />} />
          <Route
            path="*"
            element={<h2 style={{ textAlign: "center" }}>404 – Page Not Found</h2>}
          />
        </Routes>
      </Suspense>
    </Router>
  );
}