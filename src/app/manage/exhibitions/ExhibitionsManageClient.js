"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/util/supabase/supabaseClient";
import {
  Plus,
  Trash2,
  Upload,
  X,
  Edit2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { OptimizedImage } from "@/components/OptimizedImage";
import Toast from "../Toast";
import { coerceFrenchText } from "@/lib/db-i18n";

export default function ExhibitionsManageClient({
  initialExhibitions,
  section,
}) {
  const router = useRouter();
  const [exhibitions, setExhibitions] = useState(initialExhibitions);
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingExhibition, setEditingExhibition] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [reordering, setReordering] = useState(false);

  // Form state
  const [gallery, setGallery] = useState("");
  const [galleryFr, setGalleryFr] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [about, setAbout] = useState("");
  const [aboutFr, setAboutFr] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);

  const resetForm = () => {
    setGallery("");
    setGalleryFr("");
    setYear(new Date().getFullYear().toString());
    setCity("");
    setCountry("");
    setAbout("");
    setAboutFr("");
    setUploadedImages([]);
    setEditingExhibition(null);
  };

  const handleCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (exhibition) => {
    setEditingExhibition(exhibition);
    setGallery(exhibition.gallery);
    setGalleryFr(exhibition.gallery_fr || "");
    setYear(exhibition.year);
    setCity(exhibition.city);
    setCountry(exhibition.country);
    setAbout(exhibition.about || "");
    setAboutFr(exhibition.about_fr || "");
    // Use public_ids if available, otherwise fall back to images (URLs)
    setUploadedImages(exhibition.images_public_ids || exhibition.images || []);
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      // Upload to Cloudinary in parallel
      const { uploadMultipleToCloudinary } = await import(
        "@/lib/cloudinary-upload"
      );

      const publicIds = await uploadMultipleToCloudinary(
        files,
        "fanaha/exhibitions",
        undefined,
        { alwaysCompress: true }
      );

      // Store public_ids
      setUploadedImages([...uploadedImages, ...publicIds]);
    } catch (err) {
      setToast({ message: "Failed to upload images", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setUploadedImages(
      uploadedImages.filter((_, index) => index !== indexToRemove)
    );
  };

  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Create a custom drag image to prevent flickering
    const img = new Image();
    img.src =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newImages = [...uploadedImages];
    const draggedImage = newImages[draggedIndex];

    // Remove from old position
    newImages.splice(draggedIndex, 1);
    // Insert at new position
    newImages.splice(dropIndex, 0, draggedImage);

    setUploadedImages(newImages);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleSave = async () => {
    if (!gallery.trim()) {
      setToast({ message: "Gallery name is required", type: "error" });
      return;
    }

    if (!city.trim()) {
      setToast({ message: "City is required", type: "error" });
      return;
    }

    if (!country.trim()) {
      setToast({ message: "Country is required", type: "error" });
      return;
    }

    if (uploadedImages.length === 0) {
      setToast({ message: "At least one image is required", type: "error" });
      return;
    }

    setUploading(true);
    try {
      if (editingExhibition) {
        // Generate URLs for backward compatibility
        const { cldUrlEnhanced } = await import("@/lib/cloudinary");
        const imageUrls = uploadedImages.map((img) => {
          // If it's already a URL (Supabase), use it; otherwise generate Cloudinary URL
          if (img.includes("http") || img.includes("supabase.co")) {
            return img;
          }
          return cldUrlEnhanced({
            publicId: img,
            width: 800,
            height: 800,
            quality: "auto:good",
            crop: "fill",
          });
        });

        // Update existing exhibition
        const { data, error } = await supabase
          .from("fanaha_exhibitions")
          .update({
            gallery,
            gallery_fr: coerceFrenchText(galleryFr),
            year,
            city,
            country,
            about,
            about_fr: coerceFrenchText(aboutFr),
            images_public_ids: uploadedImages, // Store Cloudinary public_ids
            images: imageUrls, // Store URLs for backward compatibility
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingExhibition.id)
          .select()
          .single();

        if (error) throw error;

        setExhibitions(
          exhibitions.map((e) => (e.id === editingExhibition.id ? data : e))
        );
        setToast({
          message: "Exhibition updated successfully!",
          type: "success",
        });
      } else {
        // Shift existing exhibitions down so new one appears first
        const shifted = exhibitions.map((exhibition) => ({
          ...exhibition,
          display_order: (exhibition.display_order || 0) + 1,
        }));
        if (shifted.length > 0) {
          setReordering(true);
          await updateDisplayOrder(shifted);
          setExhibitions(shifted);
        }

        // Generate URLs for backward compatibility
        const { cldUrlEnhanced } = await import("@/lib/cloudinary");
        const imageUrls = uploadedImages.map((img) => {
          // If it's already a URL (Supabase), use it; otherwise generate Cloudinary URL
          if (img.includes("http") || img.includes("supabase.co")) {
            return img;
          }
          return cldUrlEnhanced({
            publicId: img,
            width: 800,
            height: 800,
            quality: "auto:good",
            crop: "fill",
          });
        });

        // Create new exhibition
        const { data, error } = await supabase
          .from("fanaha_exhibitions")
          .insert([
            {
              gallery,
              gallery_fr: coerceFrenchText(galleryFr),
              year,
              city,
              country,
              about,
              about_fr: coerceFrenchText(aboutFr),
              images_public_ids: uploadedImages, // Store Cloudinary public_ids
              images: imageUrls, // Store URLs for backward compatibility
              display_order: 1,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        setExhibitions([data, ...shifted]);
        setToast({
          message: "Exhibition created successfully!",
          type: "success",
        });
      }

      setShowModal(false);
      resetForm();
      router.refresh();
    } catch (err) {
      const errorMessage = err.message || "Failed to save exhibition";
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setUploading(false);
      setReordering(false);
    }
  };

  const updateDisplayOrder = async (orderedExhibitions) => {
    const updates = orderedExhibitions.map((exhibition, index) =>
      supabase
        .from("fanaha_exhibitions")
        .update({ display_order: index + 1 })
        .eq("id", exhibition.id)
    );

    const results = await Promise.all(updates);
    const hasError = results.some((result) => result.error);
    if (hasError) {
      throw new Error("Failed to update order");
    }
  };

  const moveExhibition = async (index, direction) => {
    if (reordering) return;
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= exhibitions.length) return;

    const reordered = [...exhibitions];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);

    setExhibitions(reordered);
    setReordering(true);
    try {
      await updateDisplayOrder(reordered);
      setToast({ message: "Order updated successfully!", type: "success" });
      router.refresh();
    } catch (err) {
      setToast({ message: "Failed to update order", type: "error" });
      router.refresh();
    } finally {
      setReordering(false);
    }
  };

  const handleDelete = async (exhibition) => {
    if (
      !confirm(
        `Delete exhibition "${exhibition.gallery} (${exhibition.year})"?`
      )
    )
      return;

    setDeleting(exhibition.id);

    // Optimistic update
    const previousExhibitions = [...exhibitions];
    setExhibitions(exhibitions.filter((e) => e.id !== exhibition.id));

    try {
      const { error } = await supabase
        .from("fanaha_exhibitions")
        .delete()
        .eq("id", exhibition.id);

      if (error) throw error;

      setToast({
        message: "Exhibition deleted successfully!",
        type: "success",
      });
      router.refresh();
    } catch (err) {
      // Revert on error
      setExhibitions(previousExhibitions);
      setToast({ message: "Failed to delete exhibition", type: "error" });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div
      className="max-w-7xl mx-auto"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          {section?.title || "Manage Exhibitions"}
        </h2>
        {section?.description && (
          <p className="text-zinc-600">{section.description}</p>
        )}
      </div>

      {/* Create Button */}
      <div className="mb-6">
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Exhibition
        </button>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-zinc-600">
        {exhibitions.length} exhibition{exhibitions.length !== 1 ? "s" : ""}
      </div>

      {/* Exhibitions List */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-8">
        {exhibitions.length === 0 ? (
          <div className="text-center text-zinc-500 py-12">
            No exhibitions yet. Click &quot;Add Exhibition&quot; to create one.
          </div>
        ) : (
          exhibitions.map((exhibition, index) => (
            <div
              key={exhibition.id}
              className="border border-zinc-200 rounded-lg p-6 space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-0.5">
                    <button
                      onClick={() => moveExhibition(index, -1)}
                      disabled={index === 0 || reordering}
                      className="p-0.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move up"
                      aria-label="Move up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-semibold text-zinc-500 min-w-[1.5rem] text-center">
                      {index + 1}
                    </span>
                    <button
                      onClick={() => moveExhibition(index, 1)}
                      disabled={index === exhibitions.length - 1 || reordering}
                      className="p-0.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move down"
                      aria-label="Move down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-zinc-900">
                      {exhibition.gallery}
                    </h3>
                    <p className="text-sm text-zinc-600 mt-1">
                      {exhibition.year} • {exhibition.city},{" "}
                      {exhibition.country}
                    </p>
                    {exhibition.about && (
                      <p className="text-sm text-zinc-700 mt-2 whitespace-pre-wrap">
                        {exhibition.about}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(exhibition)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    aria-label="Edit"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(exhibition)}
                    disabled={deleting === exhibition.id}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Images Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {(exhibition.images_public_ids || exhibition.images || []).map(
                  (imageId, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden shadow-sm"
                    >
                      <OptimizedImage
                        publicId={imageId}
                        alt={`${exhibition.gallery} image ${index + 1}`}
                        width={300}
                        height={300}
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                        className="object-cover w-full h-full"
                        aspectRatio="1:1"
                        crop="fill"
                      />
                    </div>
                  )
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowModal(false);
            resetForm();
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-zinc-900">
                {editingExhibition ? "Edit Exhibition" : "Add Exhibition"}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Gallery */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Gallery Name (EN) *
                </label>
                <input
                  type="text"
                  value={gallery}
                  onChange={(e) => setGallery(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., The National Gallery"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Gallery Name (FR)
                </label>
                <input
                  type="text"
                  value={galleryFr}
                  onChange={(e) => setGalleryFr(e.target.value)}
                  placeholder="[NEEDS_TRANSLATION]"
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Year *
                </label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., 2023 or 2023-2024"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., Reykjavik"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., Iceland"
                />
              </div>

              {/* About */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  About (EN)
                </label>
                <textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  placeholder="Description of the exhibition..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  About (FR)
                </label>
                <textarea
                  value={aboutFr}
                  onChange={(e) => setAboutFr(e.target.value)}
                  placeholder="[NEEDS_TRANSLATION]"
                  rows={4}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Images * ({uploadedImages.length})
                </label>

                {/* Image Grid */}
                {uploadedImages.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-zinc-500 mb-2">
                      Drag images to reorder
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {uploadedImages.map((imageUrl, index) => (
                        <div
                          key={index}
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, index)}
                          onDragEnd={handleDragEnd}
                          className={`relative aspect-square rounded-lg overflow-hidden group cursor-move transition-all ${
                            draggedIndex === index ? "opacity-50 scale-95" : ""
                          } ${
                            dragOverIndex === index && draggedIndex !== index
                              ? "ring-2 ring-blue-500"
                              : ""
                          }`}
                        >
                          <OptimizedImage
                            publicId={imageUrl}
                            alt={`Upload ${index + 1}`}
                            width={200}
                            height={200}
                            sizes="150px"
                            className="object-cover w-full h-full pointer-events-none"
                            aspectRatio="1:1"
                            crop="fill"
                          />
                          {/* Image number badge */}
                          <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded pointer-events-none">
                            {index + 1}
                          </div>
                          {/* Delete button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(index);
                            }}
                            className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-300 transition-colors font-medium cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  {uploading ? (
                    <>
                      <Upload className="w-5 h-5 animate-pulse" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload Images
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-3 rounded-lg border border-zinc-300 text-zinc-700 font-medium hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={uploading}
                className="flex-1 px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {uploading
                  ? "Saving..."
                  : editingExhibition
                  ? "Update"
                  : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
