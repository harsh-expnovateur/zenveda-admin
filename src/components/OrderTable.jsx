import { useState } from "react";

const OrderTable = ({
  orders,
  onStatusUpdate,
  onPaymentUpdate,
  onShipmentCreated,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [creatingShipment, setCreatingShipment] = useState({});
  const [trackingModalData, setTrackingModalData] = useState(null);
  const itemsPerPage = 10;

  const API_BASE = "http://localhost:5000";
  const getAuthToken = () => localStorage.getItem("token");

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "text-green-600 bg-green-100";
      case "Pending":
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "Shipped":
        return "text-blue-600 bg-blue-100";
      case "Cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const handleCreateShipment = async (orderId) => {
    setCreatingShipment((prev) => ({ ...prev, [orderId]: true }));

    try {
      const response = await fetch(
        `${API_BASE}/api/admin/orders/${orderId}/shipment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create shipment");
      }

      alert(`Shipment created successfully!\nAWB: ${data.shipment.awb}`);

      // Callback to refresh orders list
      if (onShipmentCreated) {
        onShipmentCreated();
      }
    } catch (error) {
      console.error("Create shipment error:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setCreatingShipment((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleCancelShipment = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this shipment?"))
      return;

    try {
      const response = await fetch(
        `${API_BASE}/api/admin/orders/${orderId}/shipment/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Cancellation failed");

      alert("Shipment cancelled successfully!");
      onShipmentCreated(); // refresh orders
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleTrackShipment = async (orderId) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/admin/orders/${orderId}/tracking`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Tracking failed");

      setTrackingModalData(data.tracking);
    } catch (err) {
      alert("Tracking failed: " + err.message);
    }
  };

  // Pagination
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = orders.slice(startIndex, endIndex);

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatPrice = (price) => {
    if (!price) return "₹0.00";
    return `₹${parseFloat(price).toFixed(2)}`;
  };

  const normalizeStatus = (status) => {
    if (!status) return "Pending";
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  return (
    <>
      {trackingModalData && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-3">Shipment Tracking</h2>

            {/* Current Status */}
            <p className="text-lg font-medium mb-2">
              Status:{" "}
              <span className="text-blue-700">
                {trackingModalData?.ShipmentData?.[0]?.Status ||
                  "Not Available"}
              </span>
            </p>

            {/* Timeline */}
            <div className="space-y-3 mt-4">
              {trackingModalData?.ShipmentData?.[0]?.Scans?.map((scan, i) => (
                <div key={i} className="border rounded-lg p-3 bg-gray-50">
                  <p className="font-medium">{scan.ScanDetail}</p>
                  <p className="text-xs text-gray-600">{scan.ScanDateTime}</p>
                  <p className="text-xs text-gray-500">{scan.Scan}</p>
                </div>
              )) || <p>No scan history available.</p>}
            </div>

            <button
              onClick={() => setTrackingModalData(null)}
              className="mt-4 w-full py-2 bg-gray-800 text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
      <div className="relative max-w-full overflow-x-auto">
        {/* Table Scroll Container */}
        <div className="relative overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="min-w-[1200px] text-sm text-left">
            <thead className="sticky top-0 bg-gray-50 text-gray-600 z-10">
              <tr>
                {[
                  "No",
                  "Order ID",
                  "Customer",
                  "Date",
                  "Amount",
                  "Payment",
                  "Status",
                  "AWB",
                  "Shipment",
                  "Track",
                  "Action",
                  "Label",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 font-semibold whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y">
              {currentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan="12"
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No orders found
                  </td>
                </tr>
              ) : (
                currentOrders.map((item, index) => (
                  <tr
                    key={item.order_id}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3">{startIndex + index + 1}</td>

                    <td className="px-4 py-3 font-medium text-gray-800">
                      {item.order_number}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-medium">{item.customer_name}</div>
                      <div className="text-xs text-gray-500">
                        {item.customer_email}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(item.order_date)}
                    </td>

                    <td className="px-4 py-3 font-semibold">
                      {formatPrice(item.total_amount)}
                    </td>

                    <td className="px-4 py-3">
                      <select
                        value={item.payment_status || "unpaid"}
                        onChange={(e) =>
                          onPaymentUpdate(item.order_id, e.target.value)
                        }
                        className="rounded-lg border px-2 py-1 text-xs
                  focus:ring-2 focus:ring-emerald-400"
                      >
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                      </select>
                    </td>

                    {/* <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {normalizeStatus(item.status)}
                      </span>
                    </td> */}
                    <td className="px-4 py-3">
                      <select
                        value={item.status}
                        onChange={(e) =>
                          onStatusUpdate(item.order_id, e.target.value)
                        }
                        className="rounded-lg border px-2 py-1 text-xs focus:ring-2 focus:ring-emerald-400"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="px-4 py-3 text-xs font-mono">
                      {item.awb || "—"}
                    </td>

                    <td className="px-4 py-3">
                      {item.shipment_status ? (
                        <span className="rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-xs">
                          {item.shipment_status}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">
                          Not shipped
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {item.awb ? (
                        <button
                          onClick={() => handleTrackShipment(item.order_id)}
                          className="rounded-lg bg-indigo-600 px-3 py-1 text-xs text-white hover:bg-indigo-700"
                        >
                          Track
                        </button>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="px-4 py-3 space-y-1">
                      {item.awb ? (
                        <>
                          <span className="block text-xs text-green-600 font-medium">
                            Shipment Created
                          </span>
                          <button
                            onClick={() => handleCancelShipment(item.order_id)}
                            className="rounded-lg bg-red-600 px-3 py-1 text-xs text-white"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleCreateShipment(item.order_id)}
                          disabled={creatingShipment[item.order_id]}
                          className="rounded-lg bg-emerald-600 px-3 py-1 text-xs text-white disabled:opacity-50"
                        >
                          {creatingShipment[item.order_id]
                            ? "Creating..."
                            : "Create Shipment"}
                        </button>
                      )}
                    </td>

                    {/* ✅ LABEL COLUMN (FIXED) */}
                    <td className="px-4 py-3">
                      {item.label_pdf ? (
                        <a
                          href={item.label_pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-gray-800 px-3 py-1 text-xs text-white"
                        >
                          Download
                        </a>
                      ) : item.awb ? (
                        <button
                          onClick={async () => {
                            await fetch(
                              `${API_BASE}/api/admin/orders/${item.order_id}/shipment/label`,
                              {
                                method: "POST",
                                headers: {
                                  Authorization: `Bearer ${getAuthToken()}`,
                                },
                              }
                            );
                            onShipmentCreated();
                          }}
                          className="rounded-lg bg-indigo-600 px-3 py-1 text-xs text-white"
                        >
                          Generate
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">N/A</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default OrderTable;
