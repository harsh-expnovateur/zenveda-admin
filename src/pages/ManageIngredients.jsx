import React, { useState, useEffect } from "react";

const ManageIngredients = () => {
  const [ingredients, setIngredients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const emptyForm = {
    name: "",
    description: "",
    image: null,
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchAllIngredients();
  }, []);

  const fetchAllIngredients = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/ingredients");
      const data = await response.json();
      if (data.success) {
        setIngredients(data.ingredients || []);
      }
    } catch (error) {
      console.error("Failed to fetch ingredients:", error);
      alert("Failed to fetch ingredients");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setForm((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Ingredient name is required!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description || "");
      
      if (form.image) {
        formData.append("image", form.image);
      }

      const url = editingId
        ? `http://localhost:5000/api/ingredients/${editingId}`
        : "http://localhost:5000/api/ingredients";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        alert(editingId ? "✅ Ingredient updated successfully!" : "✅ Ingredient created successfully!");
        await fetchAllIngredients();
        setForm(emptyForm);
        setImagePreview(null);
        setEditingId(null);
        setShowModal(false);
      } else {
        alert(`❌ Error: ${result.error || "Failed to save ingredient"}`);
        console.error("Server error:", result);
      }
    } catch (error) {
      console.error("❌ Failed to save ingredient:", error);
      alert("❌ Failed to save ingredient. Check console for details.");
    }
  };

  const handleEdit = async (ingredientId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/ingredients/${ingredientId}`);
      const data = await response.json();
      
      if (data.success) {
        const ingredient = data.ingredient;
        
        setForm({
          name: ingredient.name || "",
          description: ingredient.description || "",
          image: null,
        });
        
        if (ingredient.image_url) {
          setImagePreview(`http://localhost:5000/${ingredient.image_url}`);
        }
        
        setEditingId(ingredientId);
        setShowModal(true);
      }
    } catch (error) {
      console.error("Failed to fetch ingredient details:", error);
      alert("Failed to load ingredient details");
    }
  };

  const handleDelete = async (ingredientId) => {
    if (window.confirm("Are you sure you want to delete this ingredient? This action cannot be undone.")) {
      try {
        const response = await fetch(`http://localhost:5000/api/ingredients/${ingredientId}`, {
          method: "DELETE",
        });
        
        const result = await response.json();
        
        if (response.ok) {
          alert("✅ Ingredient deleted successfully!");
          await fetchAllIngredients();
        } else {
          alert(`❌ Error: ${result.error || "Failed to delete ingredient"}`);
        }
      } catch (error) {
        console.error("Failed to delete ingredient:", error);
        alert("❌ Failed to delete ingredient");
      }
    }
  };

  const openCreateModal = () => {
    setForm(emptyForm);
    setImagePreview(null);
    setEditingId(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(emptyForm);
    setImagePreview(null);
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold text-[#1f513f] mb-2">Manage Ingredients</h1>
              <p className="text-gray-600">Add, edit, and organize ingredients used in your premium teas</p>
            </div>
            <button
              onClick={openCreateModal}
              className="bg-gradient-to-r from-[#1f513f] to-[#2d7356] text-white px-8 py-4 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-3 font-semibold shadow-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Ingredient
            </button>
          </div>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Total Ingredients</p>
                <p className="text-4xl font-bold text-[#1f513f]">{ingredients.length}</p>
              </div>
              <div className="bg-green-100 p-4 rounded-full">
                <svg className="w-8 h-8 text-[#1f513f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Ingredients Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#1f513f] mb-4"></div>
            <p className="text-gray-600 text-lg">Loading ingredients...</p>
          </div>
        ) : ingredients.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center border border-gray-100">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No ingredients yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">Start building your ingredient library by adding the first one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
            {ingredients.map((ingredient) => (
              <div
                key={ingredient.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group"
              >
                <div className="relative h-44 bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden">
                  {ingredient.image_url ? (
                    <img
                      src={`http://localhost:5000/${ingredient.image_url}`}
                      alt={ingredient.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <svg className="w-20 h-20 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm font-medium">No image</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#1f513f] mb-3 line-clamp-1">{ingredient.name}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-6 min-h-[60px]">
                    {ingredient.description || "No description available"}
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(ingredient.id)}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl hover:shadow-md hover:scale-105 transition-all font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(ingredient.id)}
                      className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl hover:shadow-md hover:scale-105 transition-all font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#1f513f] to-[#2d7356] text-white p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-bold mb-1">
                      {editingId ? "Edit Ingredient" : "Add New Ingredient"}
                    </h2>
                    <p className="text-green-100 text-sm">Fill in the details to manage your ingredient</p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Name */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                    <label className="block text-lg font-semibold text-[#1f513f] mb-3">
                      Ingredient Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-xl px-5 py-4 text-lg focus:border-[#1f513f] focus:ring-4 focus:ring-green-100 transition-all outline-none"
                      placeholder="e.g., Chamomile Flowers, Assam Black Tea"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                    <label className="block text-lg font-semibold text-[#1f513f] mb-3">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows="5"
                      className="w-full border-2 border-gray-200 rounded-xl px-5 py-4 focus:border-[#1f513f] focus:ring-4 focus:ring-green-100 transition-all outline-none resize-none"
                      placeholder="Describe the flavor, origin, benefits, and usage of this ingredient..."
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                    <label className="block text-lg font-semibold text-[#1f513f] mb-4">
                      Ingredient Image
                    </label>

                    {imagePreview ? (
                      <div className="relative inline-block group">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-80 h-80 object-cover rounded-2xl shadow-lg border-4 border-white"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-4 right-4 bg-red-500 text-white w-10 h-10 rounded-full hover:bg-red-600 shadow-lg flex items-center justify-center transition"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <label className="block cursor-pointer">
                        <div className="border-4 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-[#1f513f] hover:bg-green-50/30 transition-all">
                          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-xl font-semibold text-gray-700 mb-2">Click to upload image</p>
                          <p className="text-gray-500">PNG, JPG, GIF up to 10MB</p>
                          <span className="mt-4 inline-block bg-gradient-to-r from-[#1f513f] to-[#2d7356] text-white px-8 py-3 rounded-xl hover:shadow-lg transition">
                            Choose File
                          </span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </form>
              </div>

              {/* Sticky Footer */}
              <div className="bg-gray-50 border-t border-gray-200 px-8 py-6">
                <div className="flex gap-4 justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-10 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    className="px-12 py-4 bg-gradient-to-r from-[#1f513f] to-[#2d7356] text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {editingId ? "Update Ingredient" : "Create Ingredient"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        ::-webkit-scrollbar {
          width: 8px;
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
  );
};

export default ManageIngredients;