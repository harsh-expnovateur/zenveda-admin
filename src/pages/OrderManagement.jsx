import { useState, useEffect } from "react";
import { FiPlus, FiMoreHorizontal, FiSearch } from "react-icons/fi";
import OrderTable from "../components/OrderTable";
import axios from "axios";

const tabs = ["All order", "Completed", "Pending", "Canceled"];

const OrderManagement = () => {
  const [activeTab, setActiveTab] = useState("All order");
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    canceled: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch orders from backend
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/admin/orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setOrders(response.data.orders);
        calculateStats(response.data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        // Optionally redirect to login
      } else if (error.response?.status === 403) {
        alert("Access denied. Admin privileges required.");
      } else {
        alert(
          `Failed to fetch orders: ${
            error.response?.data?.error || error.message
          }`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (orderList) => {
    const total = orderList.length;
    const completed = orderList.filter((o) => o.status === "Delivered").length;
    const canceled = orderList.filter((o) => o.status === "Cancelled").length;
    const pending = orderList.filter(
      (o) => o.status !== "Delivered" && o.status !== "Cancelled"
    ).length;

    setStats({ total, pending, completed, canceled });
  };

  // Filter orders based on active tab and search
  useEffect(() => {
    let filtered = [...orders];

    // Filter by tab
    switch (activeTab) {
      case "Completed":
        filtered = filtered.filter((o) => o.status === "Delivered");
        break;
      case "Pending":
        filtered = filtered.filter(
          (o) => o.status !== "Delivered" && o.status !== "Cancelled"
        );
        break;
      case "Canceled":
        filtered = filtered.filter((o) => o.status === "Cancelled");
        break;
      default:
        break;
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (o) =>
          o.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  }, [activeTab, searchTerm, orders]);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, []);

  // Handle status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Update local state immediately for better UX
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.order_id === orderId ? { ...order, status: newStatus } : order
          )
        );
        alert(`Order status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert(
        `Failed to update order status: ${
          error.response?.data?.error || error.message
        }`
      );
    }
  };

  // Handle payment status update
  const handlePaymentUpdate = async (orderId, newPaymentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/admin/orders/${orderId}/payment`,
        { payment_status: newPaymentStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Update local state immediately for better UX
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.order_id === orderId
              ? { ...order, payment_status: newPaymentStatus }
              : order
          )
        );
        alert(`Payment status updated to ${newPaymentStatus}`);
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      alert(
        `Failed to update payment status: ${
          error.response?.data?.error || error.message
        }`
      );
    }
  };

  return (
    <div className="pt-6 px-4 md:px-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            Order Management
          </h2>
          <p className="text-sm text-gray-500">
            Track, manage & update customer orders
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="inline-flex items-center justify-center gap-2 rounded-xl
        border border-gray-300 bg-white px-4 py-2 text-sm font-medium
        hover:bg-gray-100 transition"
        >
          Refresh Orders
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { title: "Total Orders", value: stats.total, color: "emerald" },
          { title: "Pending", value: stats.pending, color: "yellow" },
          { title: "Completed", value: stats.completed, color: "green" },
          { title: "Canceled", value: stats.canceled, color: "red" },
        ].map((item, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100"
          >
            <p className="text-sm text-gray-500">{item.title}</p>
            <p className="mt-2 text-2xl font-bold text-gray-800">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border-b">
          <div className="flex flex-wrap gap-5">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-medium pb-2 transition ${
                  activeTab === tab
                    ? "text-emerald-600 border-b-2 border-emerald-600"
                    : "text-gray-500 hover:text-emerald-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-gray-300 pl-9 pr-3 py-2
            text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="p-4">
          {loading ? (
            <div className="py-10 text-center text-gray-500">
              Loading orders...
            </div>
          ) : (
            <OrderTable
              orders={filteredOrders}
              onStatusUpdate={handleStatusUpdate}
              onPaymentUpdate={handlePaymentUpdate}
              onShipmentCreated={fetchOrders}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
