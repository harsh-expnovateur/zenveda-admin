import React from "react";
import { FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>

      {/* Manage Users Card */}
      <div
        onClick={() => navigate("/settings/manage-users")}
        className="w-full max-w-sm bg-white border border-gray-200 rounded-xl 
        p-6 cursor-pointer hover:shadow-lg transition-all duration-300"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
