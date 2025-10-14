"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/util/supabase/supabaseClient";
import { Plus, Trash2, Upload, X, Edit2 } from "lucide-react";
import Image from "next/image";
import Toast from "../Toast";

export default function OraclesProjectsManageClient({ initialItems, section }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);

  // Form state
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [publisher, setPublisher] = useState("");
  const [about, setAbout] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const resetForm = () => {
    setName("");
    setDate("");
    setPublisher("");
    setAbout("");
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
    setDate(item.date);
    setPublisher(item.publisher || "");
    setAbout(item.about || "");
    setUploadedImages(item.images || []);
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const imageUrls = [];

      for (const file of files) {
        const fileName = `oracles-projects/${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("alchemy-images")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("alchemy-images")
          .getPublicUrl(fileName);

        imageUrls.push(urlData.publicUrl);
      }

      setUploadedImages([...uploadedImages, ...imageUrls]);
    } catch (err) {
      console.error("Upload error:", err);
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
      if (editingItem) {
        // Update existing item
        const { data, error } = await supabase
          .from("oracles_projects")
          .update({
            name,
            date,
            publisher,
            about,
            images: uploadedImages,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingItem.id)
          .select()
          .single();

        if (error) throw error;

        setItems(items.map((i) => (i.id === editingItem.id ? data : i)));
        setToast({ message: "Item updated successfully!", type: "success" });
      } else {
        // Create new item
        const { data, error } = await supabase
          .from("oracles_projects")
          .insert([
            {
              name,
              date,
              publisher,
              about,
              images: uploadedImages,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        setItems([data, ...items]);
        setToast({ message: "Item created successfully!", type: "success" });
      }

      setShowModal(false);
      resetForm();
      router.refresh();
    } catch (err) {
      console.error("Save error:", err);
      setToast({ message: "Failed to save item", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.name}"?`)) return;

    setDeleting(item.id);

    const previousItems = [...items];
    setItems(items.filter((i) => i.id !== item.id));

    try {
      const { error } = await supabase
        .from("oracles_projects")
        .delete()
        .eq("id", item.id);

      if (error) throw error;

      setToast({ message: "Item deleted successfully!", type: "success" });
      router.refresh();
    } catch (err) {
      console.error("Delete error:", err);
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
          items.map((item) => (
            <div
              key={item.id}
              className="border border-zinc-200 rounded-lg p-6 space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
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
                  {item.images.map((imageUrl, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden shadow-sm"
                    >
                      <Image
                        src={imageUrl}
                        alt={`${item.name} image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="200px"
                      />
                    </div>
                  ))}
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
                  Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., Oracle of the Moon"
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
                  Publisher
                </label>
                <input
                  type="text"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., Mystical Press"
                />
              </div>

              {/* About */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  About
                </label>
                <textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Description of the oracle or project..."
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
                          <Image
                            src={imageUrl}
                            alt={`Upload ${index + 1}`}
                            fill
                            className="object-cover rounded-lg pointer-events-none"
                            sizes="150px"
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
