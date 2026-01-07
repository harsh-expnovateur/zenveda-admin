// src/hooks/useLogout.js
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";

export const useLogout = () => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      // Call logout API to clear refresh token from backend
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Clear local storage regardless of API success
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Show success message
      toast.success("Logged out successfully");
      
      // Redirect to login
      navigate("/");
    }
  };

  return logout;
};