import React from "react";
import { FiUsers, FiLock, FiKey } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../context/PermissionContext";

const Settings = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  const canManageUsers = hasPermission("manage-users");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
        {/* Manage Users Card (always rendered) */}
        <div
          onClick={() => {
            if (canManageUsers) navigate("/settings/manage-users");
          }}
          className={`bg-white border rounded-xl p-6 flex items-center transition-all duration-300
            ${
              canManageUsers
                ? "cursor-pointer hover:shadow-lg border-gray-200"
                : "cursor-not-allowed opacity-50 border-gray-200"
            }`}
        >
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-500">
              <FiUsers size={26} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Manage Users
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Add users and control their access
              </p>

              {!canManageUsers && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <FiLock size={12} />
                  Access restricted
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div
          onClick={() => navigate("/settings/change-password")}
          className="bg-white border border-gray-200 rounded-xl p-6 cursor-pointer 
          hover:shadow-lg transition-all duration-300 flex items-center"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-blue-500/10 text-blue-500">
              <FiKey size={26} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Change Password
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Update your account password
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
