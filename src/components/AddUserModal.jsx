import React from "react";
import { FiX } from "react-icons/fi";

const AddUserModal = ({
  isOpen,
  onClose,
  form,
  setForm,
  permissions,
  togglePermission,
  allPermissions,
  onSave,
  mode,
  handleAllPermissions
}) => {
  if (!isOpen) return null;

  const isAllSelected = permissions.length === allPermissions.length;
  const isAdmin = form.role.toLowerCase() === "admin";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {mode === "add" ? "Add User" : "Edit User"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX size={22} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Row 1 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">
                Full Name *
              </label>
              <input
                type="text"
                placeholder="Enter full name"
                className="mt-1 w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Email Address *
              </label>
              <input
                type="email"
                placeholder="Enter email"
                className="mt-1 w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                disabled={mode === "edit"}
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-2 gap-4 items-center">
            <div>
              <label className="text-sm font-medium text-gray-600">
                Role *
              </label>
              <select
                className="mt-1 w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 capitalize"
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value })
                }
              >
                <option value="admin">Admin</option>
                <option value="sub-admin">Sub-admin</option>
                <option value="manager">Manager</option>
                <option value="support">Support</option>
              </select>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between border rounded-lg px-4 py-3 mt-6">
              <span className="text-sm font-medium text-gray-700">
                User Active
              </span>

              <button
                onClick={() =>
                  setForm({ ...form, isActive: !form.isActive })
                }
                className={`w-12 h-6 rounded-full transition relative ${
                  form.isActive ? "bg-emerald-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 bg-white rounded-full transition ${
                    form.isActive ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Info Message for Password */}
          {mode === "add" && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> A secure password will be automatically generated 
                and sent to the user's email address.
              </p>
            </div>
          )}

          {/* Permissions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">
                Permissions {isAdmin && <span className="text-purple-600">(Full Access)</span>}
              </p>
              
              {!isAdmin && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleAllPermissions}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">Select All</span>
                </label>
              )}
            </div>

            {isAdmin ? (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <p className="text-sm text-purple-700">
                  Admin role has access to all features automatically
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {allPermissions.map((perm) => (
                  <label
                    key={perm.key}
                    className="flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer 
                    hover:bg-emerald-50 transition"
                  >
                    <input
                      type="checkbox"
                      checked={permissions.includes(perm.key)}
                      onChange={() => togglePermission(perm.key)}
                    />
                    <span className="text-sm text-gray-700">
                      {perm.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg border text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            onClick={onSave}
            className="px-5 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition"
          >
            {mode === "add" ? "Add User" : "Update User"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;