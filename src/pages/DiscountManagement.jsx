import { useState, useEffect } from "react";
import {
  FiPlus,
  FiEdit2,
  FiToggleLeft,
  FiToggleRight,
  FiTrash2,
  FiImage,
} from "react-icons/fi";
import CreateDiscountModal from "../components/CreateDiscountModal";

const DiscountManagement = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [openModal, setOpenModal] = useState(false);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = "http://localhost:5000";

  /* ----------------------------------
     FETCH DISCOUNTS
  ----------------------------------- */
  const fetchDiscounts = async (status = null) => {
    try {
      setLoading(true);

      const url = status
        ? `${API_BASE}/api/admin/discounts?status=${status}`
        : `${API_BASE}/api/admin/discounts`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to fetch discounts");
      }

      const data = await response.json();
      if (data.success) {
        setDiscounts(data.discounts);
      }
    } catch (error) {
      console.error("Failed to fetch discounts:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts(activeTab);
  }, [activeTab]);

  /* ----------------------------------
     CREATE DISCOUNT
  ----------------------------------- */
  const handleCreateDiscount = async (discountData) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/discounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(discountData),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to create discount");
      }

      const data = await response.json();

      if (data.success) {
        fetchDiscounts(activeTab);
        alert("Discount created successfully!");
      } else {
        alert(data.message || "Failed to create discount");
      }
    } catch (error) {
      console.error("Create discount error:", error.message);
      alert(error.message);
    }
  };

  /* ----------------------------------
     TOGGLE STATUS
  ----------------------------------- */
  const toggleStatus = async (id) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/admin/discounts/${id}/toggle-status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to toggle status");
      }

      const data = await response.json();
      if (data.success) {
        fetchDiscounts(activeTab);
      }
    } catch (error) {
      console.error("Toggle status error:", error.message);
    }
  };

  /* ----------------------------------
     DELETE DISCOUNT
  ----------------------------------- */
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this discount?")) return;

    try {
      const response = await fetch(`${API_BASE}/api/admin/discounts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to delete discount");
      }

      const data = await response.json();
      if (data.success) {
        fetchDiscounts(activeTab);
        alert("Discount deleted successfully!");
      }
    } catch (error) {
      console.error("Delete discount error:", error.message);
      alert(error.message);
    }
  };

  /* ----------------------------------
     HELPERS
  ----------------------------------- */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getDisplayValue = (discount) => {
    if (discount.discount_percentage) {
      return `${discount.discount_percentage}%`;
    }
    if (discount.flat_discount_amount) {
      return `₹${discount.flat_discount_amount}`;
    }
    if (discount.buy_quantity && discount.get_quantity) {
      return `Buy ${discount.buy_quantity} Get ${discount.get_quantity}`;
    }
    return "-";
  };

  /* ----------------------------------
     RENDER
  ----------------------------------- */
  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-1">
            Discount Management
          </h1>
          <p className="text-slate-600">
            Manage coupons, offers & promotional campaigns
          </p>
        </div>
        <button
          onClick={() => setOpenModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all font-medium"
        >
          <FiPlus size={20} /> Create Discount
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        {["active", "inactive"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
                : "bg-white border border-slate-200 text-slate-600 hover:border-emerald-500"
            }`}
          >
            {tab === "active" ? "Active Discounts" : "Inactive Discounts"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-600 mt-4">Loading discounts...</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-100 border-b-2">
              <tr>
                <th className="p-4 text-left">Image</th>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-center">Type</th>
                <th className="p-4 text-center">Code</th>
                <th className="p-4 text-center">Value</th>
                <th className="p-4 text-center">Applied Teas</th>
                <th className="p-4 text-center">Min Cart</th>
                <th className="p-4 text-center">Validity</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {discounts.length === 0 ? (
                <tr>
                  <td colSpan="10" className="p-12 text-center">
                    <FiImage className="text-5xl mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">No discounts found</p>
                  </td>
                </tr>
              ) : (
                discounts.map((d) => (
                  <tr key={d.id} className="border-b hover:bg-emerald-50/50">
                    <td className="p-4">
                      {d.thumbnail_image || d.banner_image ? (
                        <img
                          src={`${API_BASE}/${
                            d.thumbnail_image || d.banner_image
                          }`}
                          alt={d.name}
                          className="w-16 h-16 rounded-lg object-cover border-2 border-slate-200"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                          <FiImage className="text-2xl text-slate-400" />
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-800">{d.name}</p>
                      {d.free_product && (
                        <p className="text-xs text-slate-500 mt-1">
                          Free: {d.free_product}
                        </p>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                        {d.type}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {d.code ? (
                        <code className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-mono">
                          {d.code}
                        </code>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-4 text-center text-emerald-600 font-bold">
                      {getDisplayValue(d)}
                    </td>
                    <td className="p-4 text-center">
                      {d.linked_teas && d.linked_teas.length > 0 ? (
                        <div className="flex flex-col items-center">
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                            {d.linked_teas.length} Tea(s)
                          </span>
                          <div className="text-xs text-slate-500 mt-1 max-w-[150px]">
                            {d.linked_teas
                              .slice(0, 2)
                              .map((t) => t.name)
                              .join(", ")}
                            {d.linked_teas.length > 2 && "..."}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">All Teas</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {d.min_cart_value ? `₹${d.min_cart_value}` : "-"}
                    </td>
                    <td className="p-4 text-center text-xs">
                      <div>{formatDate(d.start_date)}</div>
                      <div className="text-slate-400">→</div>
                      <div>{formatDate(d.end_date)}</div>
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          d.status === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="p-4 text-center flex justify-center gap-2">
                      <button
                        onClick={() => toggleStatus(d.id)}
                        className="hover:text-emerald-600"
                      >
                        {d.status === "active" ? (
                          <FiToggleRight size={20} />
                        ) : (
                          <FiToggleLeft size={20} />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="hover:text-red-600"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <CreateDiscountModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreate={handleCreateDiscount}
      />
    </div>
  );
};

export default DiscountManagement;