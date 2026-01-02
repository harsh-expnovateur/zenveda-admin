import { useState } from "react";
import {
  FiHome,
  FiShoppingBag,
  FiUsers,
  FiMenu,
  FiCoffee,
  FiLayers,
  FiSliders,
  FiPercent,
  FiLogOut,
} from "react-icons/fi";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "/img/logo-2.png";
import toast from "react-hot-toast";

const Sidebar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include", // IMPORTANT for httpOnly refresh token
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Clear frontend auth state
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      toast.success("Logged out successfully 🌿");

      // Small delay for better UX
      setTimeout(() => {
        navigate("/");
      }, 600);
    } catch (err) {
      toast.error("Logout failed. Please try again.");
    }
  };

  const menuItems = [
    { icon: FiHome, title: "Dashboard", path: "/dashboard" },
    { icon: FiShoppingBag, title: "Order Management", path: "/orders" },
    { icon: FiUsers, title: "Customers", path: "/customers" },
    { icon: FiCoffee, title: "Tea Management", path: "/tea-management" },
    {
      icon: FiLayers,
      title: "Manage Ingredients",
      path: "/manage-ingredients",
    },
    { icon: FiPercent, title: "Discount", path: "/discount" },
    { icon: FiSliders, title: "Settings", path: "/settings" },
  ];

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="h-screen fixed left-0 top-0 z-40 
      bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
      backdrop-blur-xl text-white shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
        {!collapsed && (
          <motion.img
            src={logo}
            alt="Logo"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-9 object-contain"
          />
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-300 hover:text-white transition"
        >
          <FiMenu size={22} />
        </button>
      </div>

      {/* Menu */}
      <nav className="mt-6 px-3 space-y-2">
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={i}
              to={item.path}
              className={({ isActive }) =>
                `group relative flex items-center gap-4 px-4 py-3 rounded-xl
                transition-all duration-300
                ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {/* Active Gradient Bar */}
              <span
                className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1.5 
                rounded-r bg-gradient-to-b from-emerald-400 to-green-500 
                opacity-0 group-[.active]:opacity-100 transition"
              />

              {/* Icon */}
              <motion.div
                whileHover={{ scale: 1.15 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="min-w-[20px]"
              >
                <Icon size={20} />
              </motion.div>

              {/* Label */}
              {!collapsed && (
                <span className="text-sm font-medium tracking-wide whitespace-nowrap">
                  {item.title}
                </span>
              )}

              {/* Tooltip (Collapsed Mode) */}
              {collapsed && (
                <span
                  className="absolute left-full ml-3 px-3 py-1.5 text-xs rounded-md 
                  bg-slate-900/95 backdrop-blur text-white opacity-0 
                  group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 
                  transition-all pointer-events-none shadow-lg"
                >
                  {item.title}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
      {/* Logout */}
      <div className="absolute bottom-6 w-full px-3">
        <button
          onClick={handleLogout}
          className="group relative flex items-center gap-4 w-full px-4 py-3 
    rounded-xl text-gray-300 hover:bg-red-500/10 hover:text-red-400 
    transition-all duration-300"
        >
          <motion.div
            whileHover={{ scale: 1.15 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="min-w-[20px]"
          >
            <FiLogOut size={20} />
          </motion.div>

          {!collapsed && (
            <span className="text-sm font-medium tracking-wide">Logout</span>
          )}

          {/* Tooltip (Collapsed Mode) */}
          {collapsed && (
            <span
              className="absolute left-full ml-3 px-3 py-1.5 text-xs rounded-md 
        bg-slate-900/95 backdrop-blur text-white opacity-0 
        group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 
        transition-all pointer-events-none shadow-lg"
            >
              Logout
            </span>
          )}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
