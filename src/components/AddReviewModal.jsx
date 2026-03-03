import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axiosInstance from "../utils/axiosInstance";

const AddReviewModal = ({ isOpen, onClose, onSuccess }) => {
  const [teas, setTeas] = useState([]);
  const [formData, setFormData] = useState({
    customer_name: "",
    tea_id: "",
    tea_name: "",
    package_name: "",
    rating: 0,
    review_text: "",
    media: null,
  });

  useEffect(() => {
    if (isOpen) fetchTeas();
  }, [isOpen]);

  const fetchTeas = async () => {
    try {
      const res = await axiosInstance.get("/tea");

      // Correct extraction
      setTeas(res.data.teas || []);
    } catch (err) {
      console.error("Tea fetch failed:", err.response?.data || err);
      setTeas([]);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "media") {
      setFormData({ ...formData, media: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleTeaSelect = (e) => {
    const selectedTea = teas.find((t) => String(t.id) === e.target.value);

    setFormData({
      ...formData,
      tea_id: selectedTea?.id,
      tea_name: selectedTea?.name,
    });
  };

  const handleStarClick = (value) => {
    setFormData({ ...formData, rating: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.tea_id) {
      Swal.fire("Error", "Please select a tea", "error");
      return;
    }

    try {
      const data = new FormData();
      data.append("customer_name", formData.customer_name);
      data.append("tea_id", formData.tea_id);
      data.append("tea_name", formData.tea_name);
      data.append("package_name", formData.package_name);
      data.append("rating", formData.rating);
      data.append("review_text", formData.review_text);

      if (formData.media) {
        data.append("media", formData.media);
      }

      await axiosInstance.post("/admin/reviews", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire("Success", "Review added successfully!", "success");

      onSuccess(); // refresh table
      onClose();
    } catch (err) {
      Swal.fire("Error", "Failed to add review", "error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[500px] rounded-xl p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Add Review</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="customer_name"
            placeholder="Customer Name"
            value={formData.customer_name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg"
            required
          />

          {/* Dynamic Tea Dropdown */}
          <select
            value={formData.tea_id}
            onChange={(e) => {
              const selectedTea = teas.find(
                (t) => String(t.id) === e.target.value,
              );

              setFormData({
                ...formData,
                tea_id: selectedTea?.id,
                tea_name: selectedTea?.name,
              });
            }}
            className="w-full border px-3 py-2 rounded-lg"
            required
          >
            <option value="">Select Tea</option>

            {teas.map((tea) => (
              <option key={tea.id} value={tea.id}>
                {tea.name}
              </option>
            ))}
          </select>

          {/* Package name optional */}
          <input
            type="text"
            name="package_name"
            placeholder="Package Name (optional)"
            value={formData.package_name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg"
          />

          {/* Star Rating */}
          <div>
            <label className="block mb-1">Rating</label>
            <div className="text-2xl text-yellow-500 cursor-pointer">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} onClick={() => handleStarClick(star)}>
                  {star <= formData.rating ? "★" : "☆"}
                </span>
              ))}
            </div>
          </div>

          <textarea
            name="review_text"
            placeholder="Review Text"
            value={formData.review_text}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg"
            rows="3"
            required
          />

          {/* Image or Video */}
          <input
            type="file"
            name="media"
            accept="image/*,video/*"
            onChange={handleChange}
            className="w-full"
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-lg cursor-pointer"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddReviewModal;
