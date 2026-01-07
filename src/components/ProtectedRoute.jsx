// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  // No auth data → login
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  try {
    const userData = JSON.parse(user);

    // OPTIONAL: enable later if needed
    // if (userData.role !== "admin") {
    //   return <Navigate to="/" replace />;
    // }

    return children;
  } catch {
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute;
