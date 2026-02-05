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

export default function OraclesProjectsManageClient({ initialItems, section }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [reordering, setReordering] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [nameFr, setNameFr] = useState("");
  const [date, setDate] = useState("");
  const [publisher, setPublisher] = useState("");
  const [publisherFr, setPublisherFr] = useState("");
  const [about, setAbout] = useState("");
  const [aboutFr, setAboutFr] = useState("");
  const [orderUrl, setOrderUrl] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const resetForm = () => {
    setName("");
    setNameFr("");
    setDate("");
    setPublisher("");
    setPublisherFr("");
    setAbout("");
    setAboutFr("");
    setOrderUrl("");
    setUploadedImages([]);
    setEditingItem(null);
  };

  const handleCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setName(item.name);
    setNameFr(item.name_fr || "");
    setDate(item.date);
    setPublisher(item.publisher || "");
    setPublisherFr(item.publisher_fr || "");
    setAbout(item.about || "");
    setAboutFr(item.about_fr || "");
    setOrderUrl(item.order_url || "");
    // Use public_ids if available, otherwise fall back to images (URLs)
    setUploadedImages(item.images_public_ids || item.images || []);
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
        "fanaha/oracles-projects",
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

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newImages = [...uploadedImages];
    const draggedImage = newImages[draggedIndex];

    newImages.splice(draggedIndex, 1);
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
    if (!name.trim()) {
      setToast({ message: "Name is required", type: "error" });
      return;
    }

    setUploading(true);
    try {
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

      if (editingItem) {
        // Update existing item
        const { data, error } = await supabase
          .from("fanaha_oracles_projects")
          .update({
            name,
            name_fr: coerceFrenchText(nameFr),
            date,
            publisher,
            publisher_fr: coerceFrenchText(publisherFr),
            about,
            about_fr: coerceFrenchText(aboutFr),
            order_url: orderUrl || null,
            images_public_ids: uploadedImages, // Store Cloudinary public_ids
            images: imageUrls, // Store URLs for backward compatibility
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingItem.id)
          .select()
          .single();

        if (error) throw error;

        setItems(items.map((i) => (i.id === editingItem.id ? data : i)));
        setToast({ message: "Item updated successfully!", type: "success" });
      } else {
        // Shift existing items down so new one appears first
        const shifted = items.map((item) => ({
          ...item,
          display_order: (item.display_order || 0) + 1,
        }));
        if (shifted.length > 0) {
          setReordering(true);
          await updateDisplayOrder(shifted);
          setItems(shifted);
        }

        // Create new item
        const { data, error } = await supabase
          .from("fanaha_oracles_projects")
          .insert([
            {
              name,
              name_fr: coerceFrenchText(nameFr),
              date,
              publisher,
              publisher_fr: coerceFrenchText(publisherFr),
              about,
              about_fr: coerceFrenchText(aboutFr),
              order_url: orderUrl || null,
              images_public_ids: uploadedImages, // Store Cloudinary public_ids
              images: imageUrls, // Store URLs for backward compatibility
              display_order: 1,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        setItems([data, ...shifted]);
        setToast({ message: "Item created successfully!", type: "success" });
      }

      setShowModal(false);
      resetForm();
      router.refresh();
    } catch (err) {
      setToast({ message: "Failed to save item", type: "error" });
    } finally {
      setUploading(false);
      setReordering(false);
    }
  };

  const updateDisplayOrder = async (orderedItems) => {
    const updates = orderedItems.map((item, index) =>
      supabase
        .from("fanaha_oracles_projects")
        .update({ display_order: index + 1 })
        .eq("id", item.id)
    );

    const results = await Promise.all(updates);
    const hasError = results.some((result) => result.error);
    if (hasError) {
      throw new Error("Failed to update order");
    }
  };

  const moveItem = async (index, direction) => {
    if (reordering) return;
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= items.length) return;

    const reordered = [...items];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);

    setItems(reordered);
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

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.name}"?`)) return;

    setDeleting(item.id);

    const previousItems = [...items];
    setItems(items.filter((i) => i.id !== item.id));

    try {
      const { error } = await supabase
        .from("fanaha_oracles_projects")
        .delete()
        .eq("id", item.id);

      if (error) throw error;

      setToast({ message: "Item deleted successfully!", type: "success" });
      router.refresh();
    } catch (err) {
      setItems(previousItems);
      setToast({ message: "Failed to delete item", type: "error" });
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
          {section?.title || "Manage Oracles & Projects"}
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
          Add Item
        </button>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-zinc-600">
        {items.length} item{items.length !== 1 ? "s" : ""}
      </div>

      {/* Items List */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-8">
        {items.length === 0 ? (
          <div className="text-center text-zinc-500 py-12">
            No items yet. Click &quot;Add Item&quot; to create one.
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={item.id}
              className="border border-zinc-200 rounded-lg p-6 space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
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
                      {index + 1}
                    </span>
                    <button
                      onClick={() => moveItem(index, 1)}
                      disabled={index === items.length - 1 || reordering}
                      className="p-0.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move down"
                      aria-label="Move down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-zinc-900">
                      {item.name}
                    </h3>
                    <p className="text-sm text-zinc-600">
                      {item.date}
                      {item.publisher && ` • ${item.publisher}`}
                    </p>
                    {item.about && (
                      <p className="text-sm text-zinc-700 mt-2 line-clamp-2">
                        {item.about}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    aria-label="Edit"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    disabled={deleting === item.id}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Images Grid */}
              {item.images && item.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {item.images.map((imageUrl, index) => {
                    // Use public_id if available, otherwise use image URL
                    const imageSource =
                      item.images_public_ids?.[index] || imageUrl;
                    return (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden shadow-sm"
                      >
                        <OptimizedImage
                          publicId={imageSource}
                          alt={`${item.name} image ${index + 1}`}
                          width={200}
                          height={200}
                          className="object-cover w-full h-full"
                          sizes="200px"
                          crop="fill"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
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
                {editingItem ? "Edit Item" : "Add Item"}
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
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Name (EN) *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., Oracle of the Moon"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Name (FR)
                </label>
                <input
                  type="text"
                  value={nameFr}
                  onChange={(e) => setNameFr(e.target.value)}
                  placeholder="[NEEDS_TRANSLATION]"
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Date
                </label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., 2024 or Spring 2024"
                />
              </div>

              {/* Publisher */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Publisher (EN)
                </label>
                <input
                  type="text"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., Mystical Press"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Publisher (FR)
                </label>
                <input
                  type="text"
                  value={publisherFr}
                  onChange={(e) => setPublisherFr(e.target.value)}
                  placeholder="[NEEDS_TRANSLATION]"
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Description of the oracle or project..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  About (FR)
                </label>
                <textarea
                  value={aboutFr}
                  onChange={(e) => setAboutFr(e.target.value)}
                  rows={4}
                  placeholder="[NEEDS_TRANSLATION]"
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Order URL */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Order URL (optional)
                </label>
                <input
                  type="url"
                  value={orderUrl}
                  onChange={(e) => setOrderUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="https://example.com/order"
                />
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Images ({uploadedImages.length})
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
                          className={`relative aspect-square group cursor-move transition-all ${
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
                            width={150}
                            height={150}
                            className="object-cover rounded-lg pointer-events-none w-full h-full"
                            sizes="150px"
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
                {uploading ? "Saving..." : editingItem ? "Update" : "Create"}
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
