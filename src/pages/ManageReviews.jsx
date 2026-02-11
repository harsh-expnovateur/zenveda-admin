import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import Swal from "sweetalert2";

const ManageReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  const fetchReviews = async () => {
    try {
      const res = await axiosInstance.get("/admin/reviews");
      setReviews(res.data.reviews);
      setFiltered(res.data.reviews);
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
        r.tea_name.toLowerCase().includes(search.toLowerCase())
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Tea Reviews</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by customer or tea..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 px-4 py-2 border rounded-lg w-80"
      />

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left">
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Tea</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Review</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((review) => (
              <tr key={review.review_id} className="border-b">
                <td className="px-4 py-3 font-medium">
                  {review.customer_name}
                </td>

                <td className="px-4 py-3">
                  <div>{review.tea_name}</div>
                  <div className="text-xs text-gray-500">
                    {review.package_name}
                  </div>
                </td>

                <td className="px-4 py-3 text-gray-600">
                  {review.order_number}
                </td>

                <td className="px-4 py-3 text-yellow-500">
                  {renderStars(review.rating)}
                </td>

                <td className="px-4 py-3 max-w-xs truncate">
                  {review.review_text}
                </td>

                <td className="px-4 py-3 text-gray-500">
                  {new Date(review.created_at).toLocaleDateString()}
                </td>

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
                <td colSpan="7" className="text-center py-8 text-gray-400">
                  No reviews found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageReviews;
