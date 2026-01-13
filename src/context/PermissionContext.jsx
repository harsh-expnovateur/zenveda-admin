// src/context/PermissionContext.jsx
import { createContext, useContext, useState, useEffect, useRef } from "react";
import axiosInstance from "../utils/axiosInstance";

const PermissionContext = createContext(null);

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermissions must be used within PermissionProvider");
  }
  return context;
};

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // 🔒 Prevent multiple calls (React StrictMode safe)
  const hasFetchedRef = useRef(false);

  const fetchUserPermissions = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get("/auth/me");

      const user = res.data.user;

      setUserRole(user.role || null);
      setPermissions(user.permissions || []);
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error("Failed to fetch permissions:", error);
      }
      setPermissions([]);
      setUserRole(null);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const token = localStorage.getItem("token");

    // ✅ No token → user logged out → skip API call
    if (!token) {
      setPermissions([]);
      setUserRole(null);
      setLoading(false);
      return;
    }

    fetchUserPermissions();
  }, []);

  const hasPermission = (permission) => {
    if (userRole?.toLowerCase() === "admin") return true;
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissionList) => {
    if (userRole?.toLowerCase() === "admin") return true;
    return permissionList.some((p) => permissions.includes(p));
  };

  const refreshPermissions = async () => {
    hasFetchedRef.current = false;
    await fetchUserPermissions();
  };

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        userRole,
        hasPermission,
        hasAnyPermission,
        loading,
        initialized,
        refreshPermissions,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};
