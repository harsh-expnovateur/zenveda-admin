import PermissionGuard from "../components/PermissionGuard";
import React, { useState, useEffect } from "react";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import AddUserModal from "../components/AddUserModal";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ManageUsers = () => {
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("add");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [users, setUsers] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "sub-admin",
    isActive: true,
  });
  const [permissions, setPermissions] = useState([]);

  // Get auth token
  const getToken = () => localStorage.getItem("token");

  // Fetch users
  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setUsers(data.users);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Fetch permissions
  const fetchPermissions = async () => {
    try {
      const { data } = await axios.get(
        `${API_URL}/api/admin/users/permissions`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      setAllPermissions(data.permissions);
    } catch (err) {
      toast.error("Failed to fetch permissions");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPermissions();
  }, []);

  // Toggle permission
  const togglePermission = (permKey) => {
    setPermissions((prev) =>
      prev.includes(permKey)
        ? prev.filter((p) => p !== permKey)
        : [...prev, permKey]
    );
  };

  // Handle "All" checkbox
  const handleAllPermissions = () => {
    if (permissions.length === allPermissions.length) {
      setPermissions([]);
    } else {
      setPermissions(allPermissions.map((p) => p.key));
    }
  };

  // Open Add Modal
  const openAddModal = () => {
    setMode("add");
    setSelectedUserId(null);
    setForm({
      name: "",
      email: "",
      role: "sub-admin",
      isActive: true,
    });
    setPermissions([]);
    setShowModal(true);
  };

  // Open Edit Modal
  const openEditModal = (user) => {
    setMode("edit");
    setSelectedUserId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.is_active,
    });
    setPermissions(user.permissions || []);
    setShowModal(true);
  };

  // Save User (Add/Edit)
  const handleSave = async () => {
    try {
      // Validation
      if (!form.name || !form.email || !form.role) {
        toast.error("Please fill all required fields");
        return;
      }

      // Admin role gets all permissions automatically
      const finalPermissions =
        form.role.toLowerCase() === "admin"
          ? allPermissions.map((p) => p.key)
          : permissions;

      if (mode === "add") {
        await axios.post(
          `${API_URL}/api/admin/users`,
          {
            name: form.name,
            email: form.email,
            role: form.role,
            isActive: form.isActive,
            permissions: finalPermissions,
          },
          { headers: { Authorization: `Bearer ${getToken()}` } }
        );
        toast.success("User created successfully! Password sent to email.");
      } else {
        await axios.put(
          `${API_URL}/api/admin/users/${selectedUserId}`,
          {
            name: form.name,
            email: form.email,
            role: form.role,
            isActive: form.isActive,
            permissions: finalPermissions,
          },
          { headers: { Authorization: `Bearer ${getToken()}` } }
        );
        toast.success("User updated successfully");
      }

      setShowModal(false);
      fetchUsers();
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Operation failed";
      toast.error(errorMsg);
    }
  };

  // Toggle User Active Status
  const toggleUserActive = async (user) => {
    try {
      await axios.patch(
        `${API_URL}/api/admin/users/${user.id}/toggle-active`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      toast.success(
        `User ${user.is_active ? "deactivated" : "activated"} successfully`
      );
      fetchUsers();
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to update status";
      toast.error(errorMsg);
    }
  };

  // Delete User
  const handleDelete = async (user) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete user: ${user.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/api/admin/users/${user.id}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        toast.success("User deleted successfully");
        fetchUsers();
      } catch (err) {
        const errorMsg = err.response?.data?.error || "Failed to delete user";
        toast.error(errorMsg);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Manage Users</h1>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 rounded-lg 
          bg-emerald-500 text-white hover:bg-emerald-600 transition"
        >
          <FiPlus size={18} />
          Add User
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Permissions</th>
              <th className="px-6 py-4 text-center">Active</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className={`border-b last:border-none ${
                  !user.is_active ? "bg-gray-50 opacity-70" : ""
                }`}
              >
                <td className="px-6 py-4 font-medium">{user.name}</td>
                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 text-xs rounded-full bg-emerald-100 text-emerald-600 capitalize">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {user.role.toLowerCase() === "admin" ? (
                      <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-600">
                        Full Access
                      </span>
                    ) : user.permissionLabels &&
                      user.permissionLabels.length > 0 ? (
                      user.permissionLabels.slice(0, 3).map((label, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 text-xs rounded bg-slate-100"
                        >
                          {label}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">
                        No permissions
                      </span>
                    )}
                    {user.permissionLabels &&
                      user.permissionLabels.length > 3 && (
                        <span className="px-2 py-1 text-xs rounded bg-slate-100">
                          +{user.permissionLabels.length - 3} more
                        </span>
                      )}
                  </div>
                </td>

                {/* Active Toggle */}
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => toggleUserActive(user)}
                    className={`w-11 h-6 rounded-full relative transition ${
                      user.is_active ? "bg-emerald-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 bg-white rounded-full transition ${
                        user.is_active ? "left-5" : "left-1"
                      }`}
                    />
                  </button>
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => openEditModal(user)}
                      className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                    >
                      <FiEdit2 size={16} />
                    </button>

                    <button
                      onClick={() => handleDelete(user)}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AddUserModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        form={form}
        setForm={setForm}
        permissions={permissions}
        togglePermission={togglePermission}
        allPermissions={allPermissions}
        onSave={handleSave}
        mode={mode}
        handleAllPermissions={handleAllPermissions}
      />
    </div>
  );
};

export default ManageUsers;
