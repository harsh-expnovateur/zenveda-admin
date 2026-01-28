import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";

const TeaManagement = () => {
  const [teas, setTeas] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingTeaId, setEditingTeaId] = useState(null);
  const [packagesTouched, setPackagesTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  const emptyForm = {
    name: "",
    slug: "",
    tag: "",
    tagline: "",
    description: "",
    selectedPackages: [],
    price: {},
    sections: [{ title: "", content: "" }],
    brewingRitual: [{ text: "", icon: null }],
    teaImages: [],
    mainImageIndex: 0,
    active: true,
    selectedIngredients: [],
  };

  const [form, setForm] = useState(emptyForm);
  const [previews, setPreviews] = useState({
    teaImages: [],
    brewing: [],
  });

  useEffect(() => {
    fetchAllTeas();
    fetchAllIngredients();
  }, []);

  const fetchAllTeas = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/tea");
      const data = response.data;
      if (data.success) {
        setTeas(data.teas || []);
      }
    } catch (error) {
      console.error("Failed to fetch teas:", error);
      toast.error("Failed to load teas");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllIngredients = async () => {
    try {
      const response = await axiosInstance.get("/ingredients");
      const data = response.data;
      if (data.success) {
        setIngredients(data.ingredients || []);
      }
    } catch (error) {
      console.error("Failed to fetch ingredients:", error);
      toast.error("Failed to load ingredients");
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      const slug = generateSlug(value);
      setForm((prev) => ({ ...prev, name: value, slug: slug }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const toggleIngredient = (ingredientId) => {
    setForm((prev) => {
      const isSelected = prev.selectedIngredients.includes(ingredientId);
      const updated = isSelected
        ? prev.selectedIngredients.filter((id) => id !== ingredientId)
        : [...prev.selectedIngredients, ingredientId];
      return { ...prev, selectedIngredients: updated };
    });
  };

  const handleTeaImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const updatedImages = [...form.teaImages, ...files];
    setForm((prev) => ({ ...prev, teaImages: updatedImages }));
    setPreviews((prev) => ({
      ...prev,
      teaImages: [
        ...prev.teaImages,
        ...files.map((f) => URL.createObjectURL(f)),
      ],
    }));
  };

  const setMainImage = (index) => {
    setForm((prev) => ({ ...prev, mainImageIndex: index }));
    toast.success("Main image updated");
  };

  const removeTeaImage = (index) => {
    setForm((prev) => {
      const newImages = prev.teaImages.filter((_, i) => i !== index);
      const newMainIndex =
        prev.mainImageIndex === index
          ? 0
          : prev.mainImageIndex > index
            ? prev.mainImageIndex - 1
            : prev.mainImageIndex;
      return { ...prev, teaImages: newImages, mainImageIndex: newMainIndex };
    });
    setPreviews((prev) => ({
      ...prev,
      teaImages: prev.teaImages.filter((_, i) => i !== index),
    }));
  };

  const addSection = () => {
    setForm((prev) => ({
      ...prev,
      sections: [...prev.sections, { title: "", content: "" }],
    }));
  };

  const removeSection = (index) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
  };

  const handleSectionChange = (index, field, value) => {
    const updated = [...form.sections];
    updated[index][field] = value;
    setForm((prev) => ({ ...prev, sections: updated }));
  };

  const addBrewingStep = () => {
    setForm((prev) => ({
      ...prev,
      brewingRitual: [...prev.brewingRitual, { text: "", icon: null }],
    }));
  };

  const removeBrewingStep = (i) => {
    const newSteps = form.brewingRitual.filter((_, idx) => idx !== i);
    const newPreviews = previews.brewing.filter((_, idx) => idx !== i);
    setForm((prev) => ({ ...prev, brewingRitual: newSteps }));
    setPreviews((prev) => ({ ...prev, brewing: newPreviews }));
  };

  const handleBrewingChange = (i, field, value) => {
    const updated = [...form.brewingRitual];
    updated[i][field] = value;
    setForm((prev) => ({ ...prev, brewingRitual: updated }));
  };

  const handleBrewingIconUpload = (i, file) => {
    const updated = [...form.brewingRitual];
    updated[i].icon = file;
    const newPreviews = [...previews.brewing];
    newPreviews[i] = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, brewingRitual: updated }));
    setPreviews((prev) => ({ ...prev, brewing: newPreviews }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loadingToast = toast.loading(
      editingTeaId ? "Updating tea..." : "Saving tea...",
    );

    try {
      const formData = new FormData();

      const ritualsWithText = form.brewingRitual.filter(
        (r) => r.text && r.text.trim() !== "",
      );

      const brewingIconsToUpload = [];
      const ritualsData = ritualsWithText.map((ritual, idx) => {
        if (ritual.icon) {
          brewingIconsToUpload.push(ritual.icon);
          return {
            text: ritual.text,
            hasIcon: true,
            iconIndex: brewingIconsToUpload.length - 1,
            existingIconUrl: null,
          };
        } else {
          return {
            text: ritual.text,
            hasIcon: false,
            iconIndex: -1,
            existingIconUrl: ritual.existingIconUrl || null,
          };
        }
      });

      const payload = {
        name: form.name,
        slug: form.slug,
        tag: form.tag,
        tagline: form.tagline,
        description: form.description,
        is_active: form.active,
        mainImageIndex: form.mainImageIndex || 0,
        ...(packagesTouched && {
          packages: form.selectedPackages.map((p) => {
            const key = p.replace(/\s+/g, "_");
            return {
              package_name: p,
              selling_price:
                form.price[key] !== undefined && form.price[key] !== ""
                  ? form.price[key]
                  : null,
            };
          }),
        }),
        sections: form.sections.filter((s) => s.title || s.content),
        rituals: ritualsData,
        ingredientIds: form.selectedIngredients,
      };

      formData.append("data", JSON.stringify(payload));

      if (form.teaImages && form.teaImages.length > 0) {
        form.teaImages.forEach((file) => {
          formData.append("teaImages", file);
        });
      }

      brewingIconsToUpload.forEach((icon) => {
        formData.append("brewingIcons", icon);
      });

      let response;

      if (editingTeaId) {
        response = await axiosInstance.put(`/tea/${editingTeaId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await axiosInstance.post(`/tea`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      const result = response.data;

      if (result.success) {
        toast.success(
          editingTeaId
            ? "Tea updated successfully!"
            : "Tea saved successfully!",
          {
            id: loadingToast,
          },
        );

        await fetchAllTeas();

        setForm(emptyForm);
        setPreviews({
          teaImages: [],
          brewing: [],
        });
        setEditingIndex(null);
        setEditingTeaId(null);
        setShowModal(false);
      } else {
        toast.error(result.error || "Failed to save tea", {
          id: loadingToast,
        });
        console.error("Server error:", result);
      }
    } catch (error) {
      console.error("Failed to save tea:", error);
      toast.error("Failed to save tea. Please try again.", {
        id: loadingToast,
      });
    }
  };

  const handleEdit = async (teaId) => {
    try {
      const { data } = await axiosInstance.get(`/tea/${teaId}`);

      if (data.success) {
        const tea = data.tea;

        setForm({
          name: tea.name || "",
          slug: tea.slug || "",
          tag: tea.tag || "",
          tagline: tea.tagline || "",
          description: tea.description || "",
          selectedPackages: tea.packages?.map((p) => p.package_name) || [],
          price:
            tea.packages?.reduce((acc, p) => {
              acc[p.package_name.replace(/\s+/g, "_")] = p.selling_price;
              return acc;
            }, {}) || {},
          sections:
            tea.sections?.length > 0
              ? tea.sections
              : [{ title: "", content: "" }],
          brewingRitual:
            tea.rituals?.length > 0
              ? tea.rituals.map((r) => ({
                  text: r.step_text,
                  icon: null,
                  existingIconUrl: r.icon_url || null,
                }))
              : [{ text: "", icon: null }],
          teaImages: [],
          mainImageIndex:
            tea.images?.findIndex((img) => img.is_main_image) || 0,
          active: tea.is_active,
          selectedIngredients: tea.ingredients?.map((ing) => ing.id) || [],
        });

        setPreviews({
          teaImages:
            tea.images?.map(
              (img) => `http://localhost:5000/${img.image_url}`,
            ) || [],
          brewing:
            tea.rituals?.map((r) =>
              r.icon_url ? `http://localhost:5000/${r.icon_url}` : null,
            ) || [],
        });

        setEditingTeaId(teaId);
        setShowModal(true);
      }
    } catch (error) {
      console.error("Failed to fetch tea details:", error);
      toast.error("Failed to load tea details");
    }

    setPackagesTouched(false);
  };

  const handleDelete = async (teaId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this tea? This action cannot be undone.",
      )
    ) {
      const loadingToast = toast.loading("Deleting tea...");

      try {
        const response = await axiosInstance.delete(`/tea/${teaId}`);

        const result = response.data;

        if (result.success) {
          toast.success("Tea deleted successfully!", {
            id: loadingToast,
          });
          await fetchAllTeas();
        } else {
          toast.error(result.error || "Failed to delete tea", {
            id: loadingToast,
          });
        }
      } catch (error) {
        console.error("Failed to delete tea:", error);
        toast.error("Failed to delete tea", {
          id: loadingToast,
        });
      }
    }
  };

  const toggleActive = async (teaId, currentStatus) => {
    try {
      const response = await axiosInstance.patch(`/tea/${teaId}/toggle`, {
        is_active: !currentStatus,
      });

      const result = response.data;

      if (result.success) {
        toast.success(
          `Tea ${!currentStatus ? "activated" : "deactivated"} successfully`,
        );
        await fetchAllTeas();
      } else {
        toast.error(result.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Failed to toggle status:", error);
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-green-50/30 to-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h1 className="text-4xl font-bold text-[#1f513f] mb-2">
                Tea Collection
              </h1>
              <p className="text-gray-600">Manage your premium tea products</p>
            </div>
            <button
              onClick={() => {
                setForm(emptyForm);
                setPreviews({
                  teaImages: [],
                  brewing: [],
                });
                setEditingIndex(null);
                setEditingTeaId(null);
                setShowModal(true);
              }}
              className="bg-linear-to-r from-[#1f513f] to-[#2d7356] text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2 font-semibold"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add New Tea
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Total Teas</p>
                  <p className="text-3xl font-bold text-[#1f513f]">
                    {teas.length}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg
                    className="w-6 h-6 text-[#1f513f]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Active</p>
                  <p className="text-3xl font-bold text-green-600">
                    {teas.filter((t) => t.is_active).length}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Inactive</p>
                  <p className="text-3xl font-bold text-gray-400">
                    {teas.filter((t) => !t.is_active).length}
                  </p>
                </div>
                <div className="bg-gray-100 p-3 rounded-full">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-linear-to-r from-[#1f513f] to-[#2d7356] text-white">
                <tr>
                  <th className="p-4 text-left font-semibold">Tea Name</th>
                  <th className="p-4 text-left font-semibold">Slug</th>
                  <th className="p-4 text-left font-semibold">Tag</th>
                  <th className="p-4 text-center font-semibold">Status</th>
                  <th className="p-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center p-12">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f513f] mb-4"></div>
                        <p className="text-gray-500">Loading teas...</p>
                      </div>
                    </td>
                  </tr>
                ) : teas.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center p-12">
                      <div className="flex flex-col items-center justify-center">
                        <svg
                          className="w-16 h-16 text-gray-300 mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                        <p className="text-gray-500 font-medium">
                          No teas added yet
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          Click "Add New Tea" to get started
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  teas.map((tea) => (
                    <tr
                      key={tea.id}
                      className="hover:bg-green-50/50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-linear-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-[#1f513f]"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                              />
                            </svg>
                          </div>
                          <span className="font-semibold text-gray-800">
                            {tea.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-500 text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {tea.slug || "-"}
                        </span>
                      </td>
                      <td className="p-4">
                        {tea.tag ? (
                          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold">
                            {tea.tag}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => toggleActive(tea.id, tea.is_active)}
                          className={`px-4 py-1.5 rounded-full text-white text-xs font-semibold transition-all hover:scale-105 ${
                            tea.is_active
                              ? "bg-linear-to-r from-green-500 to-green-600 shadow-sm"
                              : "bg-linear-to-r from-gray-400 to-gray-500"
                          }`}
                        >
                          {tea.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(tea.id)}
                            className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(tea.id)}
                            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ---------- MODAL FORM ---------- */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-start z-50 px-4 pt-8 pb-12 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl relative max-h-full flex flex-col animate-fade-in">
              {/* Modal Header - Sticky */}
              <div className="sticky top-0 bg-linear-to-r from-[#1f513f] to-[#2d7356] text-white p-6 rounded-t-3xl z-10 shadow-md">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-bold mb-1">
                      {editingTeaId ? "Edit Tea" : "Add New Tea"}
                    </h2>
                    <p className="text-green-100 text-sm">
                      Fill in the details below to manage your tea collection
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingIndex(null);
                      setEditingTeaId(null);
                    }}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Scrollable Form Content */}
              <div className="flex-1 overflow-y-auto px-8 py-6">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Basic Info Section */}
                  <div className="bg-linear-to-br from-green-50 to-blue-50 rounded-2xl p-6 border border-green-100">
                    <h3 className="text-xl font-bold text-[#1f513f] mb-4 flex items-center gap-2">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Basic Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block font-semibold text-gray-700 mb-2">
                          Tea Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-[#1f513f] focus:ring-2 focus:ring-green-100 transition-all outline-none"
                          placeholder="e.g., Earl Grey, Green Tea"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-gray-700 mb-2">
                          Slug{" "}
                          <span className="text-xs text-gray-500">
                            (auto-generated)
                          </span>
                        </label>
                        <input
                          name="slug"
                          value={form.slug}
                          onChange={handleChange}
                          className="w-full border-2 border-gray-200 rounded-xl p-3 bg-gray-50 focus:border-[#1f513f] focus:ring-2 focus:ring-green-100 transition-all outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                      <div>
                        <label className="block font-semibold text-gray-700 mb-2">
                          Tag{" "}
                          <span className="text-xs text-gray-500">
                            (e.g., BEST SELLER)
                          </span>
                        </label>
                        <input
                          name="tag"
                          value={form.tag}
                          onChange={handleChange}
                          className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-[#1f513f] focus:ring-2 focus:ring-green-100 transition-all outline-none"
                          placeholder="BEST SELLER, NEW, FEATURED"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-gray-700 mb-2">
                          Tagline
                        </label>
                        <input
                          name="tagline"
                          value={form.tagline}
                          onChange={handleChange}
                          className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-[#1f513f] focus:ring-2 focus:ring-green-100 transition-all outline-none"
                          placeholder="Short catchy phrase"
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block font-semibold text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows="4"
                        className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-[#1f513f] focus:ring-2 focus:ring-green-100 transition-all outline-none resize-none"
                        placeholder="Detailed tea description..."
                      />
                    </div>
                  </div>

                  {/* Package Selection */}
                  <div className="bg-linear-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                    <h3 className="text-xl font-bold text-[#1f513f] mb-4 flex items-center gap-2">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                      Available Packages
                    </h3>

                    <div className="flex flex-wrap gap-3 mb-4">
                      {["100gm", "200gm", "250gm", "500gm", "1000gm"].map(
                        (pkg) => (
                          <label
                            key={pkg}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all font-medium ${
                              form.selectedPackages?.includes(pkg)
                                ? "border-[#1f513f] bg-green-50 text-[#1f513f]"
                                : "border-gray-200 bg-white hover:border-gray-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={
                                form.selectedPackages?.includes(pkg) || false
                              }
                              onChange={(e) => {
                                setPackagesTouched(true);

                                const isChecked = e.target.checked;
                                setForm((prev) => {
                                  const updated = isChecked
                                    ? [...(prev.selectedPackages || []), pkg]
                                    : (prev.selectedPackages || []).filter(
                                        (p) => p !== pkg,
                                      );
                                  return { ...prev, selectedPackages: updated };
                                });
                              }}
                              className="w-4 h-4 accent-[#1f513f]"
                            />
                            {pkg}
                          </label>
                        ),
                      )}
                    </div>

                    {form.selectedPackages?.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-semibold text-gray-700 mb-3">
                          Set Prices
                        </h4>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {form.selectedPackages.map((pkg) => {
                            const pkgKey = pkg.replace(/\s+/g, "_");
                            return (
                              <div key={pkg} className="relative">
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  {pkg}
                                </label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    ₹
                                  </span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={form.price?.[pkgKey] || ""}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      setForm((prev) => ({
                                        ...prev,
                                        price: {
                                          ...prev.price,
                                          [pkgKey]: value,
                                        },
                                      }));
                                    }}
                                    className="w-full border-2 border-gray-200 rounded-xl p-3 pl-8 focus:border-[#1f513f] focus:ring-2 focus:ring-green-100 transition-all outline-none"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Ingredients Selection */}
                  <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                    <h3 className="text-xl font-bold text-[#1f513f] mb-4 flex items-center gap-2">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                      Select Ingredients
                    </h3>
                    <div className="border-2 border-gray-200 rounded-xl p-4 bg-white max-h-60 overflow-y-auto">
                      {ingredients.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">
                          No ingredients available. Please add ingredients
                          first.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {ingredients.map((ingredient) => (
                            <label
                              key={ingredient.id}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                                form.selectedIngredients.includes(ingredient.id)
                                  ? "bg-[#1f513f] text-white"
                                  : "hover:bg-gray-100"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={form.selectedIngredients.includes(
                                  ingredient.id,
                                )}
                                onChange={() => toggleIngredient(ingredient.id)}
                                className="w-4 h-4 accent-white"
                              />
                              <span className="text-sm font-medium">
                                {ingredient.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    {form.selectedIngredients.length > 0 && (
                      <p className="text-sm text-gray-600 mt-3 bg-white px-3 py-2 rounded-lg border border-gray-200">
                        <span className="font-semibold">
                          {form.selectedIngredients.length}
                        </span>{" "}
                        ingredient(s) selected
                      </p>
                    )}
                  </div>

                  {/* Content Sections */}
                  <div className="bg-linear-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                    <h3 className="text-xl font-bold text-[#1f513f] mb-2 flex items-center gap-2">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Content Sections
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Add sections like Health Benefits, Tasting Notes, etc.
                    </p>

                    <div className="space-y-4">
                      {form.sections.map((sec, i) => (
                        <div
                          key={i}
                          className="bg-white border-2 border-gray-200 p-5 rounded-xl relative"
                        >
                          <div className="absolute top-3 right-3 bg-[#1f513f] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                            #{i + 1}
                          </div>
                          <input
                            placeholder="Section Title (e.g. Health Benefits, Tasting Notes)"
                            value={sec.title}
                            onChange={(e) =>
                              handleSectionChange(i, "title", e.target.value)
                            }
                            className="w-full border-2 border-gray-200 rounded-lg p-3 mb-3 font-semibold focus:border-[#1f513f] focus:ring-2 focus:ring-green-100 transition-all outline-none"
                          />
                          <textarea
                            placeholder="Section Content"
                            value={sec.content}
                            onChange={(e) =>
                              handleSectionChange(i, "content", e.target.value)
                            }
                            rows="3"
                            className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-[#1f513f] focus:ring-2 focus:ring-green-100 transition-all outline-none resize-none"
                          />
                          <button
                            type="button"
                            onClick={() => removeSection(i)}
                            className="text-red-600 text-sm mt-2 hover:text-red-700 font-medium flex items-center gap-1"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Remove Section
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={addSection}
                      className="mt-4 bg-white border-2 border-dashed border-gray-300 text-[#1f513f] px-6 py-3 rounded-xl hover:border-[#1f513f] hover:bg-green-50 transition-all font-semibold flex items-center gap-2 w-full justify-center"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add Section
                    </button>
                  </div>

                  {/* Brewing Ritual */}
                  <div className="bg-linear-to-br from-yellow-50 to-amber-50 rounded-2xl p-6 border border-yellow-100">
                    <h3 className="text-xl font-bold text-[#1f513f] mb-4 flex items-center gap-2">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Brewing Ritual
                    </h3>

                    <div className="space-y-4">
                      {form.brewingRitual.map((step, i) => (
                        <div
                          key={i}
                          className="bg-white border-2 border-gray-200 p-5 rounded-xl"
                        >
                          <div className="flex items-start gap-4 mb-3">
                            <div className="shrink-0 w-8 h-8 bg-[#1f513f] text-white rounded-full flex items-center justify-center font-bold">
                              {i + 1}
                            </div>
                            <div className="flex-1">
                              <input
                                placeholder="Step description (e.g., Heat water to 80°C)"
                                value={step.text}
                                onChange={(e) =>
                                  handleBrewingChange(i, "text", e.target.value)
                                }
                                className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-[#1f513f] focus:ring-2 focus:ring-green-100 transition-all outline-none"
                              />
                            </div>
                          </div>

                          <div className="pl-12">
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                              Step Icon (Optional)
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleBrewingIconUpload(i, e.target.files[0])
                              }
                              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-3 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#1f513f] file:text-white hover:file:bg-[#164033] cursor-pointer"
                            />
                            {previews.brewing[i] && (
                              <img
                                src={previews.brewing[i]}
                                alt="brew icon"
                                className="w-20 h-20 rounded-lg border-2 border-gray-200 mt-3 object-cover"
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => removeBrewingStep(i)}
                              className="text-red-600 text-sm mt-3 hover:text-red-700 font-medium flex items-center gap-1"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Remove Step
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={addBrewingStep}
                      className="mt-4 bg-white border-2 border-dashed border-gray-300 text-[#1f513f] px-6 py-3 rounded-xl hover:border-[#1f513f] hover:bg-yellow-50 transition-all font-semibold flex items-center gap-2 w-full justify-center"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add Brewing Step
                    </button>
                  </div>

                  {/* Tea Images */}
                  <div className="bg-linear-to-br from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-100">
                    <h3 className="text-xl font-bold text-[#1f513f] mb-4 flex items-center gap-2">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Tea Images
                    </h3>

                    <div className="mb-4">
                      <label className="block w-full cursor-pointer">
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#1f513f] hover:bg-white transition-all bg-white">
                          <svg
                            className="w-12 h-12 mx-auto text-gray-400 mb-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <p className="text-gray-600 font-medium mb-1">
                            Click to upload tea images
                          </p>
                          <p className="text-gray-400 text-sm">
                            or drag and drop files here
                          </p>
                        </div>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleTeaImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {previews.teaImages.length > 0 && (
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                          {previews.teaImages.map((src, i) => (
                            <div key={i} className="relative group">
                              <img
                                src={src}
                                alt="tea"
                                className={`w-full h-32 object-cover rounded-xl border-4 transition-all ${
                                  form.mainImageIndex === i
                                    ? "border-green-500 shadow-lg scale-105"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              />
                              <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex flex-col items-center justify-end gap-2 pb-3">
                                {form.mainImageIndex !== i ? (
                                  <button
                                    type="button"
                                    onClick={() => setMainImage(i)}
                                    className="bg-green-500 text-white text-xs px-3 py-1.5 rounded-full hover:bg-green-600 font-semibold shadow-lg"
                                  >
                                    Set as Main
                                  </button>
                                ) : (
                                  <span className="bg-green-500 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg">
                                    ★ Main Image
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeTeaImage(i)}
                                  className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-full hover:bg-red-600 font-semibold shadow-lg"
                                >
                                  Remove
                                </button>
                              </div>
                              {form.mainImageIndex === i && (
                                <div className="absolute -top-2 -right-2 bg-green-500 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-lg">
                                  <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600 mt-4 bg-white px-4 py-2 rounded-lg border border-gray-200">
                          <span className="font-semibold">Tip:</span> Main image
                          appears first on the website. Hover over images to
                          change or remove them.
                        </p>
                      </>
                    )}
                  </div>

                  {/* Active Status */}
                  <div className="bg-linear-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={form.active}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              active: e.target.checked,
                            }))
                          }
                          className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-colors"></div>
                        <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-7 shadow-md"></div>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 block">
                          Active Status
                        </span>
                        <span className="text-sm text-gray-500">
                          Make this tea visible on the website
                        </span>
                      </div>
                    </label>
                  </div>
                </form>
              </div>

              {/* Sticky Footer Buttons */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-5">
                <div className="flex gap-4 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingIndex(null);
                      setEditingTeaId(null);
                    }}
                    className="px-8 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    className="bg-linear-to-r from-[#1f513f] to-[#2d7356] text-white px-10 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all font-semibold flex items-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {editingTeaId ? "Update Tea" : "Save Tea"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          .animate-fade-in {
            animation: fade-in 0.2s ease-out;
          }
          
          /* Custom scrollbar */
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: #1f513f;
            border-radius: 10px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: #164033;
          }
        `}</style>
      </div>
    </div>
  );
};

export default TeaManagement;
