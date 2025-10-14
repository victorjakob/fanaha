"use client";

import { useState } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import { supabase } from "@/util/supabase/supabaseClient";

export default function CreateEditModal({ piece, onClose, onSuccess }) {
  const isEditing = !!piece;

  const [formData, setFormData] = useState({
    name: piece?.name || "",
    dimensions: piece?.dimensions || "",
    available: piece?.available ?? true,
    price: piece?.price || "",
    palette: piece?.palette?.join(", ") || "",
    images: piece?.images || [],
  });

  const [imageUrls, setImageUrls] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddImages = () => {
    const urls = imageUrls
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url);

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...urls],
    }));
    setImageUrls("");
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Always auto-generate slug from name
      const slug = generateSlug(formData.name);

      // Parse palette
      const palette = formData.palette
        ? formData.palette.split(",").map((color) => color.trim())
        : [];

      const dataToSave = {
        name: formData.name,
        slug,
        dimensions: formData.dimensions,
        available: formData.available,
        price: formData.price ? parseFloat(formData.price) : null,
        palette,
        images: formData.images,
      };

      if (isEditing) {
        // Update existing piece
        const { error: updateError } = await supabase
          .from("alchemy_pieces")
          .update(dataToSave)
          .eq("id", piece.id);

        if (updateError) throw updateError;
      } else {
        // Create new piece
        const { error: insertError } = await supabase
          .from("alchemy_pieces")
          .insert([dataToSave]);

        if (insertError) throw insertError;
      }

      onSuccess();
    } catch (err) {
      console.error("Error saving piece:", err);
      setError(err.message || "Failed to save piece");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200">
          <h2 className="text-2xl font-bold text-zinc-900">
            {isEditing ? "Edit Piece" : "Create New Piece"}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              placeholder="Enter piece name"
            />
            <p className="text-sm text-zinc-500 mt-1">
              Slug will be auto-generated from the name
            </p>
          </div>

          {/* Dimensions and Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Dimensions
              </label>
              <input
                type="text"
                name="dimensions"
                value={formData.dimensions}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="e.g., 24 x 36 inches"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Price (ISK)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="1"
                min="0"
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="0"
              />
            </div>
          </div>

          {/* Palette */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Palette (comma-separated hex colors)
            </label>
            <input
              type="text"
              name="palette"
              value={formData.palette}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              placeholder="#FF5733, #33FF57, #3357FF"
            />
          </div>

          {/* Available Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="available"
              checked={formData.available}
              onChange={handleChange}
              className="w-4 h-4 text-green-600 border-zinc-300 rounded focus:ring-green-500"
            />
            <label className="ml-2 text-sm font-medium text-zinc-700">
              Available for purchase
            </label>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Images
            </label>

            {/* Current Images */}
            {formData.images.length > 0 && (
              <div className="mb-4 space-y-2">
                {formData.images.map((url, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-zinc-50 rounded-lg"
                  >
                    <div className="w-12 h-12 rounded overflow-hidden bg-zinc-200 flex-shrink-0">
                      <img
                        src={url}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 text-sm text-zinc-600 truncate">
                      {url}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Images */}
            <div className="flex gap-2">
              <textarea
                value={imageUrls}
                onChange={(e) => setImageUrls(e.target.value)}
                className="flex-1 px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="Paste image URLs (one per line)"
                rows={3}
              />
              <button
                type="button"
                onClick={handleAddImages}
                className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors"
              >
                <Upload className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-zinc-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? "Update" : "Create"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
