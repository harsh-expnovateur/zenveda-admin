import React, { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";
import { FiEye, FiEyeOff } from "react-icons/fi";

const ChangePassword = () => {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};

    // Old password required
    if (!form.oldPassword.trim()) {
      errors.oldPassword = "Old password is required";
    }

    // New password length: 5–12
    if (form.newPassword.length < 5 || form.newPassword.length > 12) {
      errors.newPassword = "Password must be between 5 and 12 characters";
    }

    // Confirm password match
    if (form.newPassword !== form.confirmPassword) {
      errors.confirmPassword = "New password and confirm password do not match";
    }

    // Stop if any validation error
    if (Object.keys(errors).length > 0) {
      Object.values(errors).forEach((msg) => toast.error(msg));
      return; // ❌ NO API CALL
    }

    try {
      setLoading(true);

      await axiosInstance.post("/auth/change-password", {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });

      toast.success("Password changed successfully");

      setForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(
        err.response?.data?.errors?.[0]?.msg ||
          err.response?.data?.error ||
          "Failed to change password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow mt-16">
      <h1 className="text-2xl font-semibold mb-6">Change Password</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Old Password */}
        <input
          type="password"
          name="oldPassword"
          placeholder="Old Password"
          value={form.oldPassword}
          onChange={handleChange}
          className="w-full border rounded-lg p-3"
          required
        />

        {/* New Password */}
        <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            name="newPassword"
            placeholder="New Password"
            value={form.newPassword}
            onChange={handleChange}
            className="w-full border rounded-lg p-3 pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-3 text-gray-500"
          >
            {showNew ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        {/* Confirm Password (NO EYE) */}
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm New Password"
          value={form.confirmPassword}
          onChange={handleChange}
          className="w-full border rounded-lg p-3"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 text-white py-3 rounded-lg hover:bg-emerald-600 transition"
        >
          {loading ? "Updating..." : "Change Password"}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
