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
import { useLogout } from "../hooks/useLogout";
import { usePermissions } from "../context/PermissionContext";
import toast from "react-hot-toast";

const Sidebar = ({ collapsed, setCollapsed }) => {
  const logout = useLogout();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  // Define menu items with their required permissions
  const allMenuItems = [
    {
      icon: FiHome,
      title: "Dashboard",
      path: "/dashboard",
      permission: "dashboard",
    },

    {
      icon: FiShoppingBag,
      title: "Order Management",
      path: "/orders",
      permission: "orders",
    },

    {
      icon: FiUsers,
      title: "Customers",
      path: "/customers",
      permission: "customers",
    },

    {
      icon: FiCoffee,
      title: "Tea Management",
      path: "/tea-management",
      permission: "tea-management",
    },

    {
      icon: FiLayers,
      title: "Manage Ingredients",
      path: "/manage-ingredients",
      permission: "manage-ingredients",
    },

    {
      icon: FiPercent,
      title: "Discount",
      path: "/discount",
      permission: "discount",
    },

    {
      icon: FiSliders,
      title: "Settings",
      path: "/settings",
      permission: "settings",
    },
  ];

  // Filter menu items based on permissions
  const menuItems = allMenuItems.filter((item) => {
    // If no permission required, always show
    if (!item.permission) return true;
    // Otherwise check if user has permission
    return hasPermission(item.permission);
  });

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
          onClick={logout}
          className="group relative flex items-center gap-4 w-full px-4 py-3 
    rounded-xl text-gray-300 hover:bg-red-500/10 hover:text-red-400 
    transition-all duration-300 cursor-pointer"
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
