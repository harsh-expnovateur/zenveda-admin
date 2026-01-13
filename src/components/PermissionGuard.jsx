// src/components/PermissionGuard.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../context/PermissionContext";
import Swal from "sweetalert2";

const PermissionGuard = ({ permission, children, redirectTo = "/dashboard" }) => {
  const { hasPermission, loading, initialized } = usePermissions();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialized && !loading && !hasPermission(permission)) {
      Swal.fire({
        icon: "error",
        title: "Access Denied",
        text: "You don't have permission to access this resource",
        confirmButtonColor: "#10b981",
        confirmButtonText: "Go Back",
      }).then(() => {
        navigate(redirectTo, { replace: true });
      });
    }
  }, [permission, hasPermission, loading, initialized, navigate, redirectTo]);

  // Show loading state
  if (loading || !initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // If no permission, show access denied page
  if (!hasPermission(permission)) return null;

  return children;
};

export default PermissionGuard;