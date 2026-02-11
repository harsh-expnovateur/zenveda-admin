import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

import { PermissionProvider } from "./context/PermissionContext";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import OrderManagement from "./pages/OrderManagement";
import CustomerManagement from "./pages/CustomerManagement";
import TeaManagement from "./pages/TeaManagement";
import Login from "./pages/Login";
import ManageIngredients from "./pages/ManageIngredients";
import DiscountManagement from "./pages/DiscountManagement";
import ProtectedRoute from "./components/ProtectedRoute";
import Settings from "./pages/Settings";
import ManageUsers from "./pages/ManageUsers";
import PermissionGuard from "./components/PermissionGuard";
import ChangePassword from "./pages/ChangePassword";
import ManageReviews from "./pages/ManageReviews";

const Layout = () => {
  const location = useLocation();

  // Login page detection
  const isLoginPage = location.pathname === "/";

  // Single source of truth for sidebar
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex w-full min-h-screen overflow-x-hidden">
      {/* Sidebar */}
      {!isLoginPage && (
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      )}

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 max-w-full overflow-x-hidden
        ${!isLoginPage ? (collapsed ? "ml-20" : "ml-64") : ""}`}
      >
        {/* Header */}
        {!isLoginPage && (
          <Header
            collapsed={collapsed}
            onToggleSidebar={() => setCollapsed(!collapsed)}
          />
        )}

        {/* Page Content */}
        <main className={`${!isLoginPage ? "pt-16" : ""} w-full`}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="dashboard">
                    <Dashboard />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="orders">
                    <OrderManagement />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="customers">
                    <CustomerManagement />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tea-management"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="tea-management">
                    <TeaManagement />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-ingredients"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="manage-ingredients">
                    <ManageIngredients />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/discount"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="discount">
                    <DiscountManagement />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reviews"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="reviews">
                    <ManageReviews />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="settings">
                    <Settings />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/manage-users"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="manage-users">
                    <ManageUsers />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/change-password"
              element={
                <ProtectedRoute>
                  <ChangePassword />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <>
      {/* GLOBAL TOASTER */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: "14px",
            background: "#1f513f",
            color: "#ffffff",
            fontWeight: "500",
            padding: "14px 18px",
            boxShadow: "0 10px 25px rgba(31,81,63,0.35)",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
          },
        }}
      />

      <Router>
        <PermissionProvider>
          <Layout />
        </PermissionProvider>
      </Router>
    </>
  );
};

export default App;
