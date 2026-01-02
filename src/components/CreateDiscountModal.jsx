import { useState, useEffect } from "react";
import { FiX, FiUpload, FiTrash2, FiImage } from "react-icons/fi";

const discountTypes = [
  "Coupon Code",
  "Direct Percentage",
  "Flat Price Off",
  "BOGO / Quantity Offer",
  "Cart Value Offer",
  "Free Product",
];

const API_BASE = "http://localhost:5000";

const CreateDiscountModal = ({ open, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "Coupon Code",
    code: "",
    discount_percentage: "",
    flat_discount_amount: "",
    buy_quantity: "",
    get_quantity: "",
    min_cart_value: "",
    free_product: "",
    start_date: "",
    start_time: "00:00",
    end_date: "",
    end_time: "23:59",
    status: "active",
  });

  const [bannerImage, setBannerImage] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [thumbnailImage, setThumbnailImage] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  // Tea selection state
  const [teas, setTeas] = useState([]);
  const [selectedTeaIds, setSelectedTeaIds] = useState([]);
  const [selectAllTeas, setSelectAllTeas] = useState(false);
  const [loadingTeas, setLoadingTeas] = useState(false);

  // Fetch teas when modal opens
  useEffect(() => {
    if (open) {
      fetchTeas();
    }
  }, [open]);

  // Handle select all teas
  useEffect(() => {
    if (selectAllTeas) {
      setSelectedTeaIds(teas.map((tea) => tea.id));
    } else if (selectedTeaIds.length === teas.length && teas.length > 0) {
      setSelectedTeaIds([]);
    }
  }, [selectAllTeas]);

  // Update select all checkbox when individual teas are selected
  useEffect(() => {
    if (teas.length > 0 && selectedTeaIds.length === teas.length) {
      setSelectAllTeas(true);
    } else {
      setSelectAllTeas(false);
    }
  }, [selectedTeaIds, teas]);

  if (!open) return null;

  const fetchTeas = async () => {
    try {
      setLoadingTeas(true);
      const response = await fetch(`${API_BASE}/api/tea`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setTeas(data.teas || []);
      }
    } catch (error) {
      console.error("Failed to fetch teas:", error);
    } finally {
      setLoadingTeas(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleTeaToggle = (teaId) => {
    setSelectedTeaIds((prev) =>
      prev.includes(teaId)
        ? prev.filter((id) => id !== teaId)
        : [...prev, teaId]
    );
  };

  const handleImageChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload only image files");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    const preview = URL.createObjectURL(file);
    if (type === "banner") {
      setBannerImage(file);
      setBannerPreview(preview);
    } else {
      setThumbnailImage(file);
      setThumbnailPreview(preview);
    }
  };

  const removeImage = (type) => {
    if (type === "banner") {
      setBannerImage(null);
      setBannerPreview(null);
    } else {
      setThumbnailImage(null);
      setThumbnailPreview(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.start_date) newErrors.start_date = "Start date is required";
    if (!formData.end_date) newErrors.end_date = "End date is required";

    if (
      (formData.type === "Coupon Code" || formData.type === "Flat Price Off") &&
      !formData.code.trim()
    ) {
      newErrors.code = "Coupon code is required";
    }

    if (
      (formData.type === "Coupon Code" ||
        formData.type === "Direct Percentage" ||
        formData.type === "Cart Value Offer") &&
      !formData.discount_percentage
    ) {
      newErrors.discount_percentage = "Discount percentage is required";
    }

    if (formData.type === "Flat Price Off" && !formData.flat_discount_amount) {
      newErrors.flat_discount_amount = "Flat discount amount is required";
    }

    if (formData.type === "BOGO / Quantity Offer") {
      if (!formData.buy_quantity)
        newErrors.buy_quantity = "Buy quantity is required";
      if (!formData.get_quantity)
        newErrors.get_quantity = "Get quantity is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE}/api/upload/discount`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.relativePath;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      setUploading(true);

      let bannerPath = null;
      let thumbnailPath = null;

      if (bannerImage) {
        bannerPath = await uploadImage(bannerImage);
      }

      if (thumbnailImage) {
        thumbnailPath = await uploadImage(thumbnailImage);
      }

      const finalData = {
        ...formData,
        start_date: `${formData.start_date}T${formData.start_time}:00`,
        end_date: `${formData.end_date}T${formData.end_time}:00`,
        banner_image: bannerPath,
        thumbnail_image: thumbnailPath,
        tea_ids: selectedTeaIds.length > 0 ? selectedTeaIds : null,
      };

      await onCreate(finalData);
      handleClose();
    } catch (error) {
      alert("Failed to create discount: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      type: "Coupon Code",
      code: "",
      discount_percentage: "",
      flat_discount_amount: "",
      buy_quantity: "",
      get_quantity: "",
      min_cart_value: "",
      free_product: "",
      start_date: "",
      start_time: "00:00",
      end_date: "",
      end_time: "23:59",
      status: "active",
    });
    setBannerImage(null);
    setBannerPreview(null);
    setThumbnailImage(null);
    setThumbnailPreview(null);
    setSelectedTeaIds([]);
    setSelectAllTeas(false);
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col">
        {/* HEADER */}
        <div className="px-6 py-4 border-b bg-gradient-to-r from-emerald-50 to-teal-50 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Create New Discount
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              Set up promotional offers and discounts
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-500 hover:text-red-500 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* CONTENT - Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* BASIC INFO */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Discount Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.name ? "border-red-500" : "border-slate-300"
                  }`}
                  placeholder="e.g., Diwali Sale"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Discount Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {discountTypes.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* TEA SELECTION */}
          <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
              Apply to Teas (Optional)
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Leave unselected to apply discount to all teas
            </p>

            {loadingTeas ? (
              <div className="text-center py-4">
                <div className="inline-block w-6 h-6 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-slate-600 mt-2">Loading teas...</p>
              </div>
            ) : (
              <>
                {/* Select All Checkbox */}
                <div className="mb-3 pb-3 border-b border-blue-200">
                  <label className="flex items-center gap-3 cursor-pointer hover:bg-blue-100 p-2 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={selectAllTeas}
                      onChange={(e) => setSelectAllTeas(e.target.checked)}
                      className="w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="font-semibold text-slate-700">
                      Select All Teas ({teas.length})
                    </span>
                  </label>
                </div>

                {/* Individual Tea Checkboxes */}
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {teas.map((tea) => (
                    <label
                      key={tea.id}
                      className="flex items-center gap-3 cursor-pointer hover:bg-blue-100 p-3 rounded-lg transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTeaIds.includes(tea.id)}
                        onChange={() => handleTeaToggle(tea.id)}
                        className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-2 focus:ring-emerald-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700">
                          {tea.name}
                        </p>
                        {tea.tag && (
                          <p className="text-xs text-slate-500">{tea.tag}</p>
                        )}
                      </div>
                      {!tea.is_active && (
                        <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded">
                          Inactive
                        </span>
                      )}
                    </label>
                  ))}
                </div>

                {selectedTeaIds.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-sm text-emerald-700 font-medium">
                      {selectedTeaIds.length} tea(s) selected
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* CONDITIONS */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Discount Conditions
            </h3>

            {(formData.type === "Coupon Code" ||
              formData.type === "Flat Price Off") && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Coupon Code <span className="text-red-500">*</span>
                </label>
                <input
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.code ? "border-red-500" : "border-slate-300"
                  }`}
                  placeholder="e.g., SAVE20"
                />
                {errors.code && (
                  <p className="text-red-500 text-xs mt-1">{errors.code}</p>
                )}
              </div>
            )}

            {(formData.type === "Coupon Code" ||
              formData.type === "Direct Percentage" ||
              formData.type === "Cart Value Offer") && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Discount Percentage (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="discount_percentage"
                  value={formData.discount_percentage}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.discount_percentage
                      ? "border-red-500"
                      : "border-slate-300"
                  }`}
                  placeholder="e.g., 20"
                  min="0"
                  max="100"
                />
                {errors.discount_percentage && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.discount_percentage}
                  </p>
                )}
              </div>
            )}

            {formData.type === "Flat Price Off" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Flat Discount Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="flat_discount_amount"
                  value={formData.flat_discount_amount}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.flat_discount_amount
                      ? "border-red-500"
                      : "border-slate-300"
                  }`}
                  placeholder="e.g., 100"
                  min="0"
                />
                {errors.flat_discount_amount && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.flat_discount_amount}
                  </p>
                )}
              </div>
            )}

            {formData.type === "BOGO / Quantity Offer" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Buy Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="buy_quantity"
                    value={formData.buy_quantity}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      errors.buy_quantity
                        ? "border-red-500"
                        : "border-slate-300"
                    }`}
                    placeholder="e.g., 2"
                    min="1"
                  />
                  {errors.buy_quantity && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.buy_quantity}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Get Quantity Free <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="get_quantity"
                    value={formData.get_quantity}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      errors.get_quantity
                        ? "border-red-500"
                        : "border-slate-300"
                    }`}
                    placeholder="e.g., 1"
                    min="1"
                  />
                  {errors.get_quantity && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.get_quantity}
                    </p>
                  )}
                </div>
              </div>
            )}

            {(formData.type === "Coupon Code" ||
              formData.type === "Cart Value Offer" ||
              formData.type === "Free Product") && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Minimum Cart Value (₹)
                </label>
                <input
                  type="number"
                  name="min_cart_value"
                  value={formData.min_cart_value}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., 999"
                  min="0"
                />
              </div>
            )}

            {formData.type === "Free Product" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Free Product
                </label>
                <select
                  name="free_product"
                  value={formData.free_product}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select Product</option>
                  <option>Masala Tea</option>
                  <option>Green Tea</option>
                  <option>Herbal Tea</option>
                </select>
              </div>
            )}
          </div>

          {/* IMAGES */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Promotional Images
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* BANNER IMAGE */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Banner Image
                </label>
                {!bannerPreview ? (
                  <label className="border-2 border-dashed border-slate-300 rounded-xl h-40 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-colors">
                    <FiUpload className="text-3xl text-slate-400 mb-2" />
                    <span className="text-sm text-slate-600 font-medium">
                      Upload Banner
                    </span>
                    <span className="text-xs text-slate-500 mt-1">Max 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => handleImageChange(e, "banner")}
                    />
                  </label>
                ) : (
                  <div className="relative group">
                    <img
                      src={bannerPreview}
                      alt="Banner"
                      className="w-full h-40 object-cover rounded-xl border-2 border-slate-200"
                    />
                    <button
                      onClick={() => removeImage("banner")}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                )}
              </div>

              {/* THUMBNAIL IMAGE */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Thumbnail Image
                </label>
                {!thumbnailPreview ? (
                  <label className="border-2 border-dashed border-slate-300 rounded-xl h-40 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-colors">
                    <FiImage className="text-3xl text-slate-400 mb-2" />
                    <span className="text-sm text-slate-600 font-medium">
                      Upload Thumbnail
                    </span>
                    <span className="text-xs text-slate-500 mt-1">Max 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => handleImageChange(e, "thumbnail")}
                    />
                  </label>
                ) : (
                  <div className="relative group">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail"
                      className="w-full h-40 object-cover rounded-xl border-2 border-slate-200"
                    />
                    <button
                      onClick={() => removeImage("thumbnail")}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* VALIDITY */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Validity Period
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.start_date ? "border-red-500" : "border-slate-300"
                  }`}
                />
                {errors.start_date && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.start_date}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.end_date ? "border-red-500" : "border-slate-300"
                  }`}
                />
                {errors.end_date && (
                  <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* STATUS */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3 flex-shrink-0">
          <button
            onClick={handleClose}
            disabled={uploading}
            className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={uploading}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 font-medium shadow-lg disabled:opacity-50 transition-all"
          >
            {uploading ? "Creating..." : "Create Discount"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateDiscountModal;