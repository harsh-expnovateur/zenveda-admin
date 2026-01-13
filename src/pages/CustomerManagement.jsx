import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Trash2 } from "lucide-react";
import PermissionGuard from "../components/PermissionGuard";

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    newCustomers: 0,
    percentageChange: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(customers.length / itemsPerPage);

  // Get access token from localStorage
  const getAccessToken = () => {
    return localStorage.getItem("token");
  };

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchCustomers(), fetchStats(), fetchMonthlyData()]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/customers",
        {
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setCustomers(data.customers);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/customers/stats",
        {
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchMonthlyData = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/customers/monthly-data",
        {
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setChartData(
          data.data.map((item) => ({
            month: item.month,
            value: item.count,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching monthly data:", error);
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this customer? This will also delete all their orders."
      )
    ) {
      return;
    }

    setDeleteLoading(customerId);
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/customers/${customerId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        alert("Customer deleted successfully");
        await fetchAllData(); // Refresh all data
      } else {
        alert(data.error || "Failed to delete customer");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      alert("Failed to delete customer");
    } finally {
      setDeleteLoading(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "text-green-500";
      case "Inactive":
        return "text-red-500";
      case "VIP":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  const formatCurrency = (amount) => {
    return parseFloat(amount).toFixed(2);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomers = customers.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <PermissionGuard permission="customers">
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500">Total Customers</p>
            <h2 className="text-2xl font-semibold mt-2">
              {stats.totalCustomers.toLocaleString()}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500">New Customers</p>
            <h2 className="text-2xl font-semibold mt-2">
              {stats.newCustomers.toLocaleString()}
            </h2>
            <p
              className={`text-sm mt-1 ${
                parseFloat(stats.percentageChange) >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {parseFloat(stats.percentageChange) >= 0 ? "▲" : "▼"}{" "}
              {Math.abs(parseFloat(stats.percentageChange))}% Last 7 days
            </p>
          </div>

          {/* <div className="bg-white rounded-xl shadow p-5">
          <p className="text-gray-500">Visitor</p>
          <h2 className="text-2xl font-semibold mt-2">250k</h2>
          <p className="text-green-500 text-sm mt-1">▲ +20% Last 7 days</p>
        </div> */}
        </div>

        {/* Customer Overview Chart */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Monthly Customer Registrations
            </h3>
          </div>

          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="Customers"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>

        {/* Customer Table */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Customer List</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-3">Customer Id</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Order Count</th>
                  <th className="p-3">Total Spend</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Registered</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentCustomers.length > 0 ? (
                  currentCustomers.map((customer) => (
                    <tr
                      key={customer.customer_id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-3">#{customer.customer_id}</td>
                      <td className="p-3">{customer.name}</td>
                      <td className="p-3">{customer.email}</td>
                      <td className="p-3">{customer.phone_number}</td>
                      <td className="p-3">{customer.order_count}</td>
                      <td className="p-3">
                        ₹{formatCurrency(customer.total_spend)}
                      </td>
                      <td
                        className={`p-3 font-semibold ${getStatusColor(
                          customer.status
                        )}`}
                      >
                        {customer.status}
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {formatDate(customer.created_at)}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() =>
                            handleDeleteCustomer(customer.customer_id)
                          }
                          disabled={deleteLoading === customer.customer_id}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="p-8 text-center text-gray-500">
                      No customers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-5">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <div className="flex gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-3 py-1 border rounded-lg ${
                      currentPage === i + 1
                        ? "bg-green-500 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                {totalPages > 5 && (
                  <span className="px-2 text-gray-500">... {totalPages}</span>
                )}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </PermissionGuard>
  );
};

export default CustomerManagement;
