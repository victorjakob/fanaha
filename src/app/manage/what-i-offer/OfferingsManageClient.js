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
} from "lucide-react";
import Image from "next/image";
import Toast from "../Toast";

export default function OfferingsManageClient({ initialOfferings, section }) {
  const router = useRouter();
  const [offerings, setOfferings] = useState(initialOfferings);
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingOffering, setEditingOffering] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const resetForm = () => {
    setTitle("");
    setDescription("");
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
    setDescription(offering.description || "");
    setImageUrl(offering.image_url || "");
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileName = `offerings/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("alchemy-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("alchemy-images")
        .getPublicUrl(fileName);

      setImageUrl(urlData.publicUrl);
      setToast({ message: "Image uploaded successfully!", type: "success" });
    } catch (err) {
      console.error("Upload error:", err);
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
      if (editingOffering) {
        // Update existing offering
        const { data, error } = await supabase
          .from("offerings")
          .update({
            title,
            description,
            image_url: imageUrl || null,
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
        // Create new offering
        const { data, error } = await supabase
          .from("offerings")
          .insert([
            {
              title,
              description,
              image_url: imageUrl || null,
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
      console.error("Save error:", err);
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
        .from("offerings")
        .delete()
        .eq("id", offering.id);

      if (error) throw error;

      setToast({ message: "Offering deleted successfully!", type: "success" });
      router.refresh();
    } catch (err) {
      console.error("Delete error:", err);
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
        .from("offerings")
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
      console.error("Error toggling status:", err);
      setToast({ message: "Failed to update status", type: "error" });
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
          offerings.map((offering) => (
            <div
              key={offering.id}
              className="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <GripVertical className="w-5 h-5 text-zinc-400 cursor-move" />
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
                    {offering.image_url && (
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                        <Image
                          src={offering.image_url}
                          alt={offering.title}
                          fill
                          className="object-cover"
                          sizes="128px"
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
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., Custom Commissions"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Description of the offering..."
                />
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Image (Optional)
                </label>

                {imageUrl && (
                  <div className="relative w-48 h-48 rounded-lg overflow-hidden mb-4">
                    <Image
                      src={imageUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                      sizes="192px"
                    />
                    <button
                      onClick={() => setImageUrl("")}
                      className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow-lg"
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
