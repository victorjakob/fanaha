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
  Eye,
  EyeOff,
  GripVertical,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { OptimizedImage } from "@/components/OptimizedImage";
import Toast from "../Toast";
import { coerceFrenchText } from "@/lib/db-i18n";

export default function OfferingsManageClient({ initialOfferings, section }) {
  const router = useRouter();
  const [offerings, setOfferings] = useState(initialOfferings);
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingOffering, setEditingOffering] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [reordering, setReordering] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [titleFr, setTitleFr] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionFr, setDescriptionFr] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const resetForm = () => {
    setTitle("");
    setTitleFr("");
    setDescription("");
    setDescriptionFr("");
    setImageUrl("");
    setEditingOffering(null);
  };

  const handleCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (offering) => {
    setEditingOffering(offering);
    setTitle(offering.title);
    setTitleFr(offering.title_fr || "");
    setDescription(offering.description || "");
    setDescriptionFr(offering.description_fr || "");
    // Use public_id if available, otherwise fall back to image_url
    setImageUrl(offering.image_public_id || offering.image_url || "");
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Upload to Cloudinary
      const { uploadToCloudinary } = await import("@/lib/cloudinary-upload");
      const { cldUrlEnhanced } = await import("@/lib/cloudinary");

      const publicId = await uploadToCloudinary(file, "fanaha/offerings", {
        alwaysCompress: true,
      });

      // Generate optimized URL for backward compatibility
      const imageUrl = cldUrlEnhanced({
        publicId,
        width: 800,
        height: 800,
        quality: "auto:good",
        crop: "fill",
      });

      // Store public_id (can be used directly or as URL)
      setImageUrl(publicId);
      setToast({ message: "Image uploaded successfully!", type: "success" });
    } catch (err) {
      setToast({ message: "Failed to upload image", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setToast({ message: "Title is required", type: "error" });
      return;
    }

    setUploading(true);
    try {
      // Generate URL for backward compatibility if we have a public_id
      const { cldUrlEnhanced } = await import("@/lib/cloudinary");
      let finalImageUrl = imageUrl;

      // If imageUrl is a public_id (not a full URL), generate the URL
      if (
        imageUrl &&
        !imageUrl.includes("http") &&
        !imageUrl.includes("supabase.co")
      ) {
        finalImageUrl = cldUrlEnhanced({
          publicId: imageUrl,
          width: 800,
          height: 800,
          quality: "auto:good",
          crop: "fill",
        });
      }

      if (editingOffering) {
        // Update existing offering
        const { data, error } = await supabase
          .from("fanaha_offerings")
          .update({
            title,
            title_fr: coerceFrenchText(titleFr),
            description,
            description_fr: coerceFrenchText(descriptionFr),
            image_public_id:
              imageUrl && !imageUrl.includes("http") ? imageUrl : null, // Store public_id if it's a Cloudinary ID
            image_url: finalImageUrl || null, // Store URL for backward compatibility
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingOffering.id)
          .select()
          .single();

        if (error) throw error;

        setOfferings(
          offerings.map((o) => (o.id === editingOffering.id ? data : o))
        );
        setToast({
          message: "Offering updated successfully!",
          type: "success",
        });
      } else {
        // Get current max display_order and increment
        const currentMax =
          offerings.length > 0
            ? Math.max(...offerings.map((o) => o.display_order || 0))
            : 0;

        // Create new offering
        const { data, error } = await supabase
          .from("fanaha_offerings")
          .insert([
            {
              title,
              title_fr: coerceFrenchText(titleFr),
              description,
              description_fr: coerceFrenchText(descriptionFr),
              image_public_id:
                imageUrl && !imageUrl.includes("http") ? imageUrl : null, // Store public_id if it's a Cloudinary ID
              image_url: finalImageUrl || null, // Store URL for backward compatibility
              display_order: currentMax + 1,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        setOfferings([...offerings, data]);
        setToast({
          message: "Offering created successfully!",
          type: "success",
        });
      }

      setShowModal(false);
      resetForm();
      router.refresh();
    } catch (err) {
      setToast({ message: "Failed to save offering", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (offering) => {
    if (!confirm(`Delete "${offering.title}"?`)) return;

    setDeleting(offering.id);

    const previousOfferings = [...offerings];
    setOfferings(offerings.filter((o) => o.id !== offering.id));

    try {
      const { error } = await supabase
        .from("fanaha_offerings")
        .delete()
        .eq("id", offering.id);

      if (error) throw error;

      setToast({ message: "Offering deleted successfully!", type: "success" });
      router.refresh();
    } catch (err) {
      setOfferings(previousOfferings);
      setToast({ message: "Failed to delete offering", type: "error" });
    } finally {
      setDeleting(null);
    }
  };

  const toggleActive = async (offering) => {
    try {
      const newStatus = !offering.is_active;
      const { error } = await supabase
        .from("fanaha_offerings")
        .update({ is_active: newStatus })
        .eq("id", offering.id);

      if (error) throw error;

      setOfferings(
        offerings.map((o) =>
          o.id === offering.id ? { ...o, is_active: newStatus } : o
        )
      );
      router.refresh();
    } catch (err) {
      setToast({ message: "Failed to update status", type: "error" });
    }
  };

  // Drag and drop handlers for reordering
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
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

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newOfferings = [...offerings];
    const draggedOffering = newOfferings[draggedIndex];

    // Remove from old position
    newOfferings.splice(draggedIndex, 1);
    // Insert at new position
    newOfferings.splice(dropIndex, 0, draggedOffering);

    // Update display_order for all items
    const updatedOfferings = newOfferings.map((offering, index) => ({
      ...offering,
      display_order: index + 1,
    }));

    // Optimistically update UI
    setOfferings(updatedOfferings);
    setDraggedIndex(null);
    setDragOverIndex(null);
    setReordering(true);

    try {
      // Update all display_order values in database
      const updates = updatedOfferings.map((offering) =>
        supabase
          .from("fanaha_offerings")
          .update({ display_order: offering.display_order })
          .eq("id", offering.id)
      );

      const results = await Promise.all(updates);

      // Check for errors
      const hasError = results.some((result) => result.error);
      if (hasError) {
        throw new Error("Failed to update order in database");
      }

      setToast({ message: "Order updated successfully!", type: "success" });
      router.refresh();
    } catch (err) {
      setToast({ message: "Failed to update order", type: "error" });
      // Revert on error
      setOfferings(offerings);
    } finally {
      setReordering(false);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Move item up or down by 1
  const moveItem = async (index, direction) => {
    if (direction === -1 && index === 0) return; // Can't move first item up
    if (direction === 1 && index === offerings.length - 1) return; // Can't move last item down

    const newIndex = index + direction;
    const newOfferings = [...offerings];
    const [movedItem] = newOfferings.splice(index, 1);
    newOfferings.splice(newIndex, 0, movedItem);

    // Update display_order for all items
    const updatedOfferings = newOfferings.map((offering, idx) => ({
      ...offering,
      display_order: idx + 1,
    }));

    // Optimistically update UI
    setOfferings(updatedOfferings);
    setReordering(true);

    try {
      // Update all display_order values in database
      const updates = updatedOfferings.map((offering) =>
        supabase
          .from("fanaha_offerings")
          .update({ display_order: offering.display_order })
          .eq("id", offering.id)
      );

      const results = await Promise.all(updates);

      // Check for errors
      const hasError = results.some((result) => result.error);
      if (hasError) {
        throw new Error("Failed to update order in database");
      }

      setToast({ message: "Order updated successfully!", type: "success" });
      router.refresh();
    } catch (err) {
      setToast({ message: "Failed to update order", type: "error" });
      // Revert on error
      setOfferings(offerings);
    } finally {
      setReordering(false);
    }
  };

  return (
    <div
      className="max-w-5xl mx-auto"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          {section?.title || "Manage What I Offer"}
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
          Add Offering
        </button>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-zinc-600">
        {offerings.length} offering{offerings.length !== 1 ? "s" : ""}
      </div>

      {/* Offerings List */}
      <div className="space-y-4">
        {offerings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center text-zinc-500">
            No offerings yet. Click &quot;Add Offering&quot; to create one.
          </div>
        ) : (
          offerings.map((offering, index) => (
            <div
              key={offering.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden transition-all ${
                draggedIndex === index ? "opacity-50 scale-95" : ""
              } ${
                dragOverIndex === index && draggedIndex !== index
                  ? "ring-2 ring-blue-500 border-blue-500"
                  : ""
              } ${reordering ? "cursor-wait" : "cursor-move"}`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <GripVertical
                        className={`w-5 h-5 text-zinc-400 ${
                          reordering ? "cursor-wait" : "cursor-move"
                        }`}
                      />
                      {/* Order controls */}
                      <div className="flex flex-col items-center gap-0.5">
                        <button
                          onClick={() => moveItem(index, -1)}
                          disabled={index === 0 || reordering}
                          className="p-0.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move up"
                          aria-label="Move up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-semibold text-zinc-500 min-w-[1.5rem] text-center">
                          {offering.display_order || index + 1}
                        </span>
                        <button
                          onClick={() => moveItem(index, 1)}
                          disabled={
                            index === offerings.length - 1 || reordering
                          }
                          className="p-0.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move down"
                          aria-label="Move down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                      <h3 className="text-xl font-bold text-zinc-900">
                        {offering.title}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          offering.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {offering.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    {offering.description && (
                      <p className="text-zinc-700 leading-relaxed line-clamp-3 mb-3">
                        {offering.description}
                      </p>
                    )}
                    {(offering.image_public_id || offering.image_url) && (
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                        <OptimizedImage
                          publicId={
                            offering.image_public_id || offering.image_url
                          }
                          alt={offering.title}
                          width={128}
                          height={128}
                          className="object-cover w-full h-full"
                          sizes="128px"
                          crop="fill"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleActive(offering)}
                      className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                      title={
                        offering.is_active ? "Hide offering" : "Show offering"
                      }
                    >
                      {offering.is_active ? (
                        <Eye className="w-5 h-5" />
                      ) : (
                        <EyeOff className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(offering)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      aria-label="Edit"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(offering)}
                      disabled={deleting === offering.id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
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
                {editingOffering ? "Edit Offering" : "Add Offering"}
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
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Title (EN) *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., Custom Commissions"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Title (FR)
                </label>
                <input
                  type="text"
                  value={titleFr}
                  onChange={(e) => setTitleFr(e.target.value)}
                  placeholder="[NEEDS_TRANSLATION]"
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Description (EN)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Description of the offering..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Description (FR)
                </label>
                <textarea
                  value={descriptionFr}
                  onChange={(e) => setDescriptionFr(e.target.value)}
                  rows={6}
                  placeholder="[NEEDS_TRANSLATION]"
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Image (Optional)
                </label>

                {imageUrl && (
                  <div className="relative w-48 h-48 rounded-lg overflow-hidden mb-4">
                    <OptimizedImage
                      publicId={imageUrl}
                      alt="Preview"
                      width={192}
                      height={192}
                      className="object-cover w-full h-full"
                      sizes="192px"
                      crop="fill"
                    />
                    <button
                      onClick={() => setImageUrl("")}
                      className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow-lg hover:bg-red-700 transition-colors z-10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <label className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-300 transition-colors font-medium cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
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
                      Upload Image
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
                  : editingOffering
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
