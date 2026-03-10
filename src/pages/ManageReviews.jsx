import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import Swal from "sweetalert2";
import AddReviewModal from "../components/AddReviewModal";

const ManageReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await axiosInstance.get("/admin/reviews");

      // 🔥 GROUP REVIEWS (multiple media support)
      const grouped = {};

      res.data.reviews.forEach((r) => {
        if (!grouped[r.review_id]) {
          grouped[r.review_id] = {
            review_id: r.review_id,
            customer_name: r.customer_name,
            tea_name: r.tea_name,
            package_name: r.package_name,
            order_number: r.order_number,
            rating: r.rating,
            review_text: r.review_text,
            created_at: r.created_at,
            is_active: r.is_active,
            media: [],
          };
        }

        if (r.media_url) {
          grouped[r.review_id].media.push({
            url: r.media_url,
            type: r.media_type,
          });
        }
      });

      const finalReviews = Object.values(grouped);

      setReviews(finalReviews);
      setFiltered(finalReviews);
    } catch (err) {
      console.error("Failed to fetch reviews");
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    const f = reviews.filter(
      (r) =>
        r.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        r.tea_name.toLowerCase().includes(search.toLowerCase()),
    );
    setFiltered(f);
  }, [search, reviews]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Review?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
    });

    if (!result.isConfirmed) return;

    await axiosInstance.delete(`/admin/reviews/${id}`);

    Swal.fire("Deleted!", "Review removed successfully.", "success");

    fetchReviews();
  };

  const renderStars = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  const handleToggle = async (id) => {
    try {
      await axiosInstance.patch(`/admin/reviews/${id}/toggle`);
      fetchReviews();
    } catch (err) {
      console.error("Toggle failed");
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Tea Reviews</h1>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl
          border border-gray-300 bg-white px-4 py-2 text-sm font-medium
          hover:bg-gray-100 transition cursor-pointer"
        >
          + Add Review
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by customer or tea..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 px-4 py-2 border rounded-lg w-80"
      />

      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left">
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Tea</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Review</th>
              <th className="px-4 py-3">Media</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((review) => (
              <tr key={review.review_id} className="border-b">
                {/* Customer */}
                <td className="px-4 py-3 font-medium">
                  {review.customer_name}
                </td>

                {/* Tea */}
                <td className="px-4 py-3">
                  <div>{review.tea_name}</div>
                  <div className="text-xs text-gray-500">
                    {review.package_name}
                  </div>
                </td>

                {/* Order */}
                <td className="px-4 py-3 text-gray-600">
                  {review.order_number}
                </td>

                {/* Rating */}
                <td className="px-4 py-3 text-yellow-500">
                  {renderStars(review.rating)}
                </td>

                {/* Review Text */}
                <td className="px-4 py-3 max-w-xs truncate">
                  {review.review_text}
                </td>

                {/* Media Preview */}
                <td className="px-4 py-3">
                  {review.media?.length === 0 ? (
                    <span className="text-gray-400 text-xs">No Media</span>
                  ) : (
                    <div className="flex gap-2 flex-wrap">
                      {review.media
                        .slice(0, 3)
                        .map((m, i) =>
                          m.type === "video" ? (
                            <video
                              key={i}
                              src={`http://localhost:5000${m.url}`}
                              className="w-12 h-12 object-cover rounded"
                              muted
                              loop
                            />
                          ) : (
                            <img
                              key={i}
                              src={`http://localhost:5000${m.url}`}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ),
                        )}

                      {review.media.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{review.media.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </td>

                {/* Date */}
                <td className="px-4 py-3 text-gray-500">
                  {new Date(review.created_at).toLocaleDateString()}
                </td>

                {/* Status */}
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleToggle(review.review_id)}
                    className={`px-3 py-1 rounded-full text-xs ${
                      review.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {review.is_active ? "Active" : "Inactive"}
                  </button>
                </td>

                {/* Delete */}
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleDelete(review.review_id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center py-8 text-gray-400">
                  No reviews found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AddReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchReviews}
      />
    </div>
  );
};

export default ManageReviews;
