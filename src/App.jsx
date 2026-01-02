import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import OrderManagement from "./pages/OrderManagement";
import CustomerManagement from "./pages/CustomerManagement";
import TeaManagement from "./pages/TeaManagement";
import Login from "./pages/Login";
import ManageIngredients from "./pages/ManageIngredients";
import DiscountManagement from "./pages/DiscountManagement";

const Layout = () => {
  const location = useLocation();

  // 🔑 Login page detection
  const isLoginPage = location.pathname === "/";

  // 🔑 Single source of truth for sidebar
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
        ${
          !isLoginPage
            ? collapsed
              ? "ml-20"
              : "ml-64"
            : ""
        }`}
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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders" element={<OrderManagement />} />
            <Route path="/customers" element={<CustomerManagement />} />
            <Route path="/tea-management" element={<TeaManagement />} />
            <Route
              path="/manage-ingredients"
              element={<ManageIngredients />}
            />
            <Route path="/discount" element={<DiscountManagement />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <>
      {/* 🌿 GLOBAL TOASTER */}
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
        <Layout />
      </Router>
    </>
  );
};

export default App;
